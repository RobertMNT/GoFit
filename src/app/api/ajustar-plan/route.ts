import { anthropic, CLAUDE_MODEL } from "@/lib/anthropic";
import { checkRateLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

// Schema de entrada
const requestSchema = z.object({
  plan_id: z.string().uuid(),
  semana: z.number().int().min(1),
});

// Schema de la respuesta de ajuste que devuelve la IA
const ajusteResponseSchema = z.object({
  resumen: z.string(),
  ajustes: z.array(
    z.object({
      dia: z.string(),
      tipo: z.enum(["aumentar_intensidad", "reducir_intensidad", "mantener", "recuperacion_extra"]),
      razon: z.string(),
      sugerencia: z.string(),
    }),
  ),
  recomendacion_general: z.string(),
});

export type AjusteResponse = z.infer<typeof ajusteResponseSchema>;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Verificar autenticación
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Verificar acceso PRO en el servidor
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "pro") {
      return NextResponse.json(
        { error: "El ajuste automático es una función exclusiva del plan PRO" },
        { status: 403 },
      );
    }

    // Rate limiting: máximo 10 ajustes por usuario cada 10 minutos
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rl = checkRateLimit(`ajustar:${user.id}:${ip}`, { limit: 10, windowMs: 10 * 60 * 1000 });
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Demasiadas peticiones. Inténtalo en unos minutos." },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
      );
    }

    // Validar body
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
    }

    const { plan_id, semana } = parsed.data;

    // Obtener el plan (RLS garantiza que pertenece al usuario)
    const { data: plan, error: planError } = await supabase
      .from("plans")
      .select("nombre, descripcion, semanas")
      .eq("id", plan_id)
      .eq("user_id", user.id)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: "Plan no encontrado" }, { status: 404 });
    }

    // Obtener el log de seguimiento de la semana solicitada
    const { data: logSemana } = await supabase
      .from("weekly_logs")
      .select("completed_exercises, notes")
      .eq("plan_id", plan_id)
      .eq("user_id", user.id)
      .eq("week_number", semana)
      .maybeSingle();

    if (!logSemana || !logSemana.completed_exercises) {
      return NextResponse.json(
        { error: "No hay datos de seguimiento para esta semana todavía" },
        { status: 422 },
      );
    }

    const completadosPorDia = logSemana.completed_exercises as Record<string, boolean>;

    // Extraer la semana del plan
    const semanasArray = plan.semanas as Array<{ semana: number; dias: Array<{ dia: string; tipo: string; ejercicios: unknown[] }> }>;
    const semanaDelPlan = semanasArray.find((s) => s.semana === semana);

    if (!semanaDelPlan) {
      return NextResponse.json({ error: "Semana no encontrada en el plan" }, { status: 404 });
    }

    // Construir resumen del progreso para el prompt
    const diasEntrenables = semanaDelPlan.dias.filter((d) => d.tipo !== "descanso_activo");
    const resumenProgreso = diasEntrenables
      .map((dia) => {
        const completado = completadosPorDia[dia.dia] ?? false;
        const estado = completado ? "COMPLETADO" : "NO COMPLETADO";
        return `- ${dia.dia} (${dia.tipo}, ${dia.ejercicios.length} ejercicios): ${estado}`;
      })
      .join("\n");

    const diasCompletados = diasEntrenables.filter((d) => completadosPorDia[d.dia]).length;
    const totalDias = diasEntrenables.length;

    // Prompt para el ajuste IA
    const prompt = `Eres un entrenador personal experto analizando el progreso semanal de un usuario.

## Plan de entrenamiento
- Nombre: ${plan.nombre}
- Descripción: ${plan.descripcion}
- Semana analizada: ${semana}

## Progreso de la semana ${semana}
Días de entrenamiento completados: ${diasCompletados}/${totalDias}

${resumenProgreso}

## Tu tarea
Analiza el progreso y genera recomendaciones de ajuste para la siguiente semana. Ten en cuenta:
- Si cumplió todos los días → sugiere progresar (más peso, más repeticiones, menos descanso)
- Si cumplió más del 70% → mantener el plan pero ajustar algún día problemático
- Si cumplió menos del 70% → revisar la carga, posiblemente reducir volumen o añadir más descanso

## Formato de respuesta — SOLO JSON, sin texto adicional

{
  "resumen": "string — análisis breve del rendimiento de la semana (2-3 frases)",
  "ajustes": [
    {
      "dia": "string — nombre del día (lunes, martes, etc.)",
      "tipo": "aumentar_intensidad | reducir_intensidad | mantener | recuperacion_extra",
      "razon": "string — por qué se recomienda este ajuste",
      "sugerencia": "string — qué cambio concreto hacer en ese día"
    }
  ],
  "recomendacion_general": "string — consejo motivador y estratégico para la siguiente semana"
}

Solo incluye en "ajustes" los días de entrenamiento (no los de descanso).
Responde ÚNICAMENTE con el JSON válido, sin markdown ni texto adicional.`;

    // Llamar a Anthropic
    const message = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const textContent = message.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      return NextResponse.json({ error: "Respuesta IA vacía" }, { status: 500 });
    }

    // Limpiar posibles backticks de markdown
    const cleanedJson = textContent.text.replace(/```json\n?|\n?```/g, "").trim();

    let ajusteData: unknown;
    try {
      ajusteData = JSON.parse(cleanedJson);
    } catch {
      return NextResponse.json({ error: "JSON inválido en respuesta IA" }, { status: 500 });
    }

    // Validar estructura
    const ajusteResult = ajusteResponseSchema.safeParse(ajusteData);
    if (!ajusteResult.success) {
      return NextResponse.json({ error: "Estructura de ajuste inválida" }, { status: 500 });
    }

    return NextResponse.json(ajusteResult.data, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

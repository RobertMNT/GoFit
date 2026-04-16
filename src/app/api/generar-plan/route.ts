import { anthropic, CLAUDE_MODEL } from "@/lib/anthropic";
import { buildPlanPrompt } from "@/lib/plan-prompt";
import { checkRateLimit } from "@/lib/rate-limit";
import { questionnaireSchema } from "@/lib/questionnaire-schema";
import { createClient } from "@/lib/supabase/server";
import { fitnessPlanResponseSchema } from "@/types/plan";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

// Schema de entrada del endpoint
const requestSchema = z.object({
  questionnaire_id: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Verificar que el usuario está autenticado
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Rate limiting: máximo 5 generaciones por usuario cada 10 minutos
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rl = checkRateLimit(`generar:${user.id}:${ip}`, { limit: 5, windowMs: 10 * 60 * 1000 });
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Demasiadas peticiones. Inténtalo en unos minutos." },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
      );
    }

    // Validar body de la petición
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
    }

    // Recuperar el cuestionario del usuario (RLS asegura que es suyo)
    const { data: questionnaire, error: qError } = await supabase
      .from("questionnaires")
      .select("answers")
      .eq("id", parsed.data.questionnaire_id)
      .eq("user_id", user.id)
      .single();

    if (qError || !questionnaire) {
      return NextResponse.json({ error: "Cuestionario no encontrado" }, { status: 404 });
    }

    // Verificar que el usuario FREE no tiene ya un plan generado
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "free") {
      const { count } = await supabase
        .from("plans")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (count && count >= 1) {
        return NextResponse.json(
          { error: "Plan gratuito ya generado. Actualiza a PRO para crear más planes." },
          { status: 403 },
        );
      }
    }

    // Validar que las respuestas del cuestionario siguen siendo válidas
    const answersResult = questionnaireSchema.safeParse(questionnaire.answers);
    if (!answersResult.success) {
      return NextResponse.json({ error: "Respuestas del cuestionario inválidas" }, { status: 422 });
    }

    // Llamar a la API de Anthropic para generar el plan
    const prompt = buildPlanPrompt(answersResult.data);

    const message = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 16000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Extraer y parsear el JSON de la respuesta
    const textContent = message.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      return NextResponse.json({ error: "Respuesta IA vacía" }, { status: 500 });
    }

    // Extraer el JSON — buscar el primer { y el último } para ignorar texto extra
    const raw = textContent.text;
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
      console.error("[generar-plan] sin JSON en respuesta:", raw.slice(0, 200));
      return NextResponse.json({ error: "Respuesta IA sin JSON" }, { status: 500 });
    }
    const cleanedJson = raw.slice(start, end + 1);

    let planData: unknown;
    try {
      planData = JSON.parse(cleanedJson);
    } catch (parseErr) {
      console.error("[generar-plan] JSON inválido:", parseErr, cleanedJson.slice(0, 300));
      return NextResponse.json({ error: "JSON inválido en respuesta IA" }, { status: 500 });
    }

    // Validar la estructura del plan con Zod
    const planResult = fitnessPlanResponseSchema.safeParse(planData);
    if (!planResult.success) {
      console.error("[generar-plan] validación Zod fallida:", JSON.stringify(planResult.error.issues.slice(0, 5)));
      return NextResponse.json({ error: "Estructura del plan inválida" }, { status: 500 });
    }

    // Guardar el plan en Supabase
    const { data: savedPlan, error: saveError } = await supabase
      .from("plans")
      .insert({
        user_id: user.id,
        questionnaire_id: parsed.data.questionnaire_id,
        nombre: planResult.data.nombre,
        descripcion: planResult.data.descripcion,
        duracion_semanas: planResult.data.duracion_semanas,
        semanas: planResult.data.semanas,
      })
      .select("id")
      .single();

    if (saveError) {
      return NextResponse.json({ error: "Error al guardar el plan" }, { status: 500 });
    }

    return NextResponse.json({ plan_id: savedPlan.id }, { status: 201 });
  } catch (err) {
    console.error("[generar-plan]", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

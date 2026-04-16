import { anthropic, CLAUDE_MODEL } from "@/lib/anthropic";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  nombre: z.string().min(1).max(100),
  notas: z.string().max(300).optional(),
});

const infoSchema = z.object({
  musculos: z.array(z.string()),
  descripcion: z.string(),
  pasos: z.array(z.string()),
  errores_comunes: z.array(z.string()),
  consejo: z.string(),
});

export type EjercicioInfo = z.infer<typeof infoSchema>;

// Devuelve explicación técnica de un ejercicio (sin mencionar IA)
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });

  const { nombre, notas } = parsed.data;

  const prompt = `Eres un entrenador personal experto. Explica el ejercicio "${nombre}"${notas ? ` (nota: ${notas})` : ""} de forma clara y concisa.

Responde ÚNICAMENTE con este JSON válido, sin texto adicional:
{
  "musculos": ["lista", "de", "músculos", "principales"],
  "descripcion": "descripción breve de qué es el ejercicio y para qué sirve (1-2 frases)",
  "pasos": [
    "Paso 1: posición inicial",
    "Paso 2: movimiento",
    "Paso 3: vuelta a posición inicial"
  ],
  "errores_comunes": [
    "error frecuente 1",
    "error frecuente 2"
  ],
  "consejo": "un consejo clave de técnica o progresión"
}

Máximo 3-4 pasos, 2 errores comunes. Respuesta en español.`;

  try {
    const message = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content.find((b) => b.type === "text");
    if (!text || text.type !== "text") throw new Error("Respuesta vacía");

    const cleaned = text.text.replace(/```json\n?|\n?```/g, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    const data = JSON.parse(cleaned.slice(start, end + 1));

    const result = infoSchema.safeParse(data);
    if (!result.success) throw new Error("Estructura inválida");

    return NextResponse.json(result.data);
  } catch {
    return NextResponse.json({ error: "No se pudo cargar la información" }, { status: 500 });
  }
}

import { anthropic, CLAUDE_MODEL } from "@/lib/anthropic";
import { buildPlanPrompt } from "@/lib/plan-prompt";
import { buildPlanCacheKey, getPlanCache, setPlanCache } from "@/lib/cache";
import { checkRateLimit } from "@/lib/rate-limit";
import { questionnaireSchema } from "@/lib/questionnaire-schema";
import { createClient } from "@/lib/supabase/server";
import { fitnessPlanResponseSchema } from "@/types/plan";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  questionnaire_id: z.string().uuid(),
});

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = checkRateLimit(`generar:${user.id}:${ip}`, { limit: 5, windowMs: 10 * 60 * 1000 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Demasiadas peticiones. Inténtalo en unos minutos." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
    );
  }

  const body = await request.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
  }

  const { data: questionnaire, error: qError } = await supabase
    .from("questionnaires")
    .select("answers")
    .eq("id", parsed.data.questionnaire_id)
    .eq("user_id", user.id)
    .single();

  if (qError || !questionnaire) {
    return NextResponse.json({ error: "Cuestionario no encontrado" }, { status: 404 });
  }

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

  const answersResult = questionnaireSchema.safeParse(questionnaire.answers);
  if (!answersResult.success) {
    return NextResponse.json({ error: "Respuestas del cuestionario inválidas" }, { status: 422 });
  }

  const esPro = profile?.role === "pro";
  const cacheKey = buildPlanCacheKey(answersResult.data, esPro);

  // ── Comprobar caché antes de llamar a Claude ─────────────────
  const cachedPlan = cacheKey ? await getPlanCache(cacheKey) : null;

  const enc = new TextEncoder();

  const userId = user.id; // capturar antes de entrar en closures async

  // ── Función auxiliar: guardar plan en DB y emitir "done" ─────
  async function guardarYEmitir(
    planData: Record<string, unknown>,
    controller: ReadableStreamDefaultController,
  ) {
    const send = (data: object) => {
      controller.enqueue(enc.encode(`data: ${JSON.stringify(data)}\n\n`));
    };

    const planResult = fitnessPlanResponseSchema.safeParse(planData);
    if (!planResult.success) {
      send({ type: "error", message: "Estructura del plan inválida" });
      controller.close();
      return;
    }

    send({ type: "saving" });

    const { data: savedPlan, error: saveError } = await supabase
      .from("plans")
      .insert({
        user_id: userId,
        questionnaire_id: parsed.data.questionnaire_id,
        nombre: planResult.data.nombre,
        descripcion: planResult.data.descripcion,
        duracion_semanas: planResult.data.duracion_semanas,
        semanas: planResult.data.semanas,
      })
      .select("id")
      .single();

    if (saveError || !savedPlan) {
      send({ type: "error", message: "Error al guardar el plan" });
      controller.close();
      return;
    }

    send({ type: "done", plan_id: savedPlan.id });
    controller.close();
  }

  // ── Si hay caché: devolver inmediatamente sin llamar a Claude ─
  if (cachedPlan) {
    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: object) => {
          controller.enqueue(enc.encode(`data: ${JSON.stringify(data)}\n\n`));
        };
        // Simular los pasos del stream para que el cliente vea el mismo flujo
        send({ type: "chunk", text: "" });
        send({ type: "generating" });
        await guardarYEmitir(cachedPlan, controller);
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  }

  // ── Sin caché: llamar a Claude con streaming ─────────────────
  const prompt = buildPlanPrompt(answersResult.data, esPro);

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(enc.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      let fullText = "";

      try {
        const anthropicStream = await anthropic.messages.create({
          model: CLAUDE_MODEL,
          max_tokens: 16000,
          stream: true,
          messages: [{ role: "user", content: prompt }],
        });

        for await (const event of anthropicStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            fullText += event.delta.text;
            send({ type: "chunk", text: event.delta.text });
          }
        }

        const start = fullText.indexOf("{");
        const end = fullText.lastIndexOf("}");
        if (start === -1 || end === -1 || end <= start) {
          console.error("[generar-plan] sin JSON en respuesta:", fullText.slice(0, 200));
          send({ type: "error", message: "Respuesta inválida de la IA" });
          controller.close();
          return;
        }

        let planData: unknown;
        try {
          planData = JSON.parse(fullText.slice(start, end + 1));
        } catch (parseErr) {
          console.error("[generar-plan] JSON inválido:", parseErr);
          send({ type: "error", message: "JSON inválido en respuesta IA" });
          controller.close();
          return;
        }

        // Guardar en caché para futuros usuarios con el mismo perfil
        if (cacheKey && planData) {
          setPlanCache(cacheKey, planData as Record<string, unknown>).catch(() => {});
        }

        await guardarYEmitir(planData as Record<string, unknown>, controller);
      } catch (err) {
        console.error("[generar-plan]", err);
        send({ type: "error", message: "Error interno del servidor" });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}

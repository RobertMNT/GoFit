import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

// Schema real de la tabla: una fila por semana, días en jsonb
const requestSchema = z.object({
  plan_id: z.string().uuid(),
  week_number: z.number().int().min(1),
  dia: z.string().min(1),
  completado: z.boolean(),
});

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

    // Verificar que el usuario es PRO
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "pro") {
      return NextResponse.json(
        { error: "El seguimiento semanal es una función exclusiva del plan PRO" },
        { status: 403 },
      );
    }

    // Validar body
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
    }

    const { plan_id, week_number, dia, completado } = parsed.data;

    // Verificar que el plan pertenece al usuario
    const { data: plan } = await supabase
      .from("plans")
      .select("id")
      .eq("id", plan_id)
      .eq("user_id", user.id)
      .single();

    if (!plan) {
      return NextResponse.json({ error: "Plan no encontrado" }, { status: 404 });
    }

    // Obtener el log existente para esta semana (si lo hay)
    const { data: existing } = await supabase
      .from("weekly_logs")
      .select("id, completed_exercises")
      .eq("plan_id", plan_id)
      .eq("user_id", user.id)
      .eq("week_number", week_number)
      .maybeSingle();

    const previo = (existing?.completed_exercises as Record<string, boolean>) ?? {};
    const actualizado = { ...previo, [dia]: completado };

    let error;
    if (existing) {
      // Actualizar el log existente
      ({ error } = await supabase
        .from("weekly_logs")
        .update({ completed_exercises: actualizado })
        .eq("id", existing.id));
    } else {
      // Crear nuevo log para esta semana
      ({ error } = await supabase.from("weekly_logs").insert({
        user_id: user.id,
        plan_id,
        week_number,
        completed_exercises: actualizado,
      }));
    }

    if (error) {
      console.error("[weekly-log]", error);
      return NextResponse.json({ error: "Error al guardar el log" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, completed_exercises: actualizado }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

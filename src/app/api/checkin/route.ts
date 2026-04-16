import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Calcula la racha de días consecutivos a partir de un array de fechas ISO (desc)
function calcularRacha(fechas: string[]): number {
  if (fechas.length === 0) return 0;

  const sorted = [...fechas].sort((a, b) => b.localeCompare(a));
  const hoy = new Date().toISOString().split("T")[0];
  const ayer = new Date(Date.now() - 86_400_000).toISOString().split("T")[0];

  // Si no hay check-in ni hoy ni ayer, la racha se ha roto
  if (sorted[0] !== hoy && sorted[0] !== ayer) return 0;

  let racha = 1;
  for (let i = 1; i < sorted.length; i++) {
    const esperado = new Date(new Date(sorted[i - 1]).getTime() - 86_400_000)
      .toISOString()
      .split("T")[0];
    if (sorted[i] === esperado) racha++;
    else break;
  }
  return racha;
}

// GET — devuelve racha actual + si ya hizo check-in hoy
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const { data } = await supabase
      .from("daily_checkins")
      .select("date")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(60); // suficiente para calcular 60 días de racha

    const fechas = (data ?? []).map((r: { date: string }) => r.date);
    const hoy = new Date().toISOString().split("T")[0];
    const hecho = fechas.includes(hoy);
    const racha = calcularRacha(fechas);
    const ultimos7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(Date.now() - i * 86_400_000).toISOString().split("T")[0];
      return { date: d, completado: fechas.includes(d) };
    }).reverse();

    return NextResponse.json({ racha, hecho, ultimos7 });
  } catch {
    // Tabla no existe aún — devuelve estado vacío sin error
    return NextResponse.json({ racha: 0, hecho: false, ultimos7: [] });
  }
}

// POST — registra check-in de hoy (idempotente)
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const hoy = new Date().toISOString().split("T")[0];

  try {
    await supabase
      .from("daily_checkins")
      .upsert({ user_id: user.id, date: hoy }, { onConflict: "user_id,date" });

    // Recalcular racha tras el check-in
    const { data } = await supabase
      .from("daily_checkins")
      .select("date")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(60);

    const fechas = (data ?? []).map((r: { date: string }) => r.date);
    const racha = calcularRacha(fechas);

    return NextResponse.json({ ok: true, racha });
  } catch {
    return NextResponse.json({ error: "Tabla no configurada" }, { status: 500 });
  }
}

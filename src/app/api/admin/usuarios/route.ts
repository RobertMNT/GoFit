import { isAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Devuelve la lista completa de usuarios con su nº de planes (solo admin)
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  // Obtener perfiles y contar planes por usuario
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .order("created_at", { ascending: false });

  if (!profiles) return NextResponse.json({ usuarios: [] });

  // Contar planes de cada usuario
  const { data: planCounts } = await supabase
    .from("plans")
    .select("user_id");

  const conteo: Record<string, number> = {};
  planCounts?.forEach(({ user_id }) => {
    conteo[user_id] = (conteo[user_id] ?? 0) + 1;
  });

  const usuarios = profiles.map((p) => ({
    ...p,
    planes: conteo[p.id] ?? 0,
  }));

  return NextResponse.json({ usuarios });
}

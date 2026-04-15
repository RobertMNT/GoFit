import { isAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  user_id: z.string().uuid(),
  role: z.enum(["pro", "free"]),
  meses: z.number().int().min(1).optional(), // solo informativo por ahora
});

// Cambia el rol de un usuario (solo admin)
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
  }

  const { user_id, role } = parsed.data;

  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", user_id);

  if (error) {
    return NextResponse.json({ error: "Error al actualizar el rol" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, role });
}

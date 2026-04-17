import { isAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  user_id: z.string().uuid(),
  blocked: z.boolean(),
});

// Bloquea o desbloquea un usuario (solo admin)
// Un usuario bloqueado no puede hacer login ni acceder a rutas protegidas
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
  }

  const { user_id, blocked } = parsed.data;

  // Impedir que el admin se bloquee a sí mismo
  if (user_id === user.id) {
    return NextResponse.json({ error: "No puedes bloquearte a ti mismo" }, { status: 400 });
  }

  const service = createServiceClient();

  const { error } = await service
    .from("profiles")
    .update({ blocked })
    .eq("id", user_id);

  if (error) {
    return NextResponse.json({ error: "Error al actualizar el estado" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, blocked });
}

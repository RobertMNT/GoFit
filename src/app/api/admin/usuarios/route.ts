import { isAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { NextResponse } from "next/server";

// Devuelve todos los usuarios con stats (solo admin)
// Usa service client para bypassear RLS — sin esto solo devuelve el propio perfil
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const service = createServiceClient();

  // Obtener todos los perfiles via service role (bypasea RLS)
  const [profilesResult, planCountsResult, authUsersResult] = await Promise.all([
    service
      .from("profiles")
      .select("id, email, full_name, role, blocked, pro_expires_at, stripe_customer_id, created_at")
      .order("created_at", { ascending: false }),
    service.from("plans").select("user_id"),
    service.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  const profiles = profilesResult.data ?? [];
  const planCounts = planCountsResult.data ?? [];
  const authUsers = authUsersResult.data?.users ?? [];

  // Índice de planes por usuario
  const conteoPlanes: Record<string, number> = {};
  planCounts.forEach(({ user_id }) => {
    conteoPlanes[user_id] = (conteoPlanes[user_id] ?? 0) + 1;
  });

  // Índice de last_sign_in_at desde auth.users
  const lastSignIn: Record<string, string | null> = {};
  authUsers.forEach((u) => {
    lastSignIn[u.id] = u.last_sign_in_at ?? null;
  });

  const usuarios = profiles.map((p) => ({
    ...p,
    planes: conteoPlanes[p.id] ?? 0,
    last_sign_in_at: lastSignIn[p.id] ?? null,
  }));

  return NextResponse.json({ usuarios });
}

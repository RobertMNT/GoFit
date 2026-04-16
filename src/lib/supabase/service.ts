import { createClient } from "@supabase/supabase-js";

// Cliente con service_role — bypasea RLS completamente
// SOLO usar en rutas server-to-server (webhooks, cron jobs)
// NUNCA exponer al cliente ni usar en rutas accesibles por el usuario
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

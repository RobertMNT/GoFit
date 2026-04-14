import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Intercambia el código OAuth de Supabase por una sesión y redirige al usuario
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Redirigir a la ruta solicitada tras autenticación exitosa
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Redirigir a login con error si el intercambio falla
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}

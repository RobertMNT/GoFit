import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 días

// Cliente de Supabase para uso en el servidor (Server Components, API Routes)
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        maxAge: SESSION_MAX_AGE,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, { ...options, maxAge: SESSION_MAX_AGE }),
            );
          } catch {
            // setAll puede fallar en Server Components — se ignora de forma segura
          }
        },
      },
    },
  );
}

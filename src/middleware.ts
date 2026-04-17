import { createServerClient } from "@supabase/ssr";
import { isAdmin } from "@/lib/admin";
import { NextResponse, type NextRequest } from "next/server";

// Rutas que requieren autenticación
const PROTECTED_ROUTES = ["/dashboard", "/plan", "/perfil", "/onboarding", "/admin"];

// Rutas que requieren plan PRO
const PRO_ROUTES = ["/dashboard/historial"];

// Rutas solo para usuarios no autenticados (redirigen al dashboard si ya hay sesión)
const AUTH_ROUTES = ["/login", "/registro"];

// Duración de la sesión: 7 días
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
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
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, {
              ...options,
              maxAge: SESSION_MAX_AGE,
            }),
          );
        },
      },
    },
  );

  // Refrescar sesión — imprescindible para mantener la cookie activa
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Redirigir usuarios autenticados fuera de páginas de auth
  if (user && AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Proteger rutas privadas
  if (!user && PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Verificaciones adicionales solo para usuarios autenticados en rutas protegidas
  if (user && PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, blocked, pro_expires_at")
      .eq("id", user.id)
      .single();

    // Bloqueo de usuario — redirigir a login con error claro
    if (profile?.blocked) {
      await supabase.auth.signOut();
      const url = new URL("/login", request.url);
      url.searchParams.set("error", "cuenta_bloqueada");
      return NextResponse.redirect(url);
    }

    // Expiración de PRO manual — revertir a free automáticamente
    if (
      profile?.role === "pro" &&
      profile.pro_expires_at &&
      new Date(profile.pro_expires_at) < new Date()
    ) {
      await supabase.from("profiles").update({ role: "free", pro_expires_at: null }).eq("id", user.id);
    }

    // Proteger rutas de admin — solo emails en ADMIN_EMAILS
    if (pathname.startsWith("/admin")) {
      if (!isAdmin(user.email)) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    // Verificar acceso PRO en el servidor
    if (PRO_ROUTES.some((route) => pathname.startsWith(route))) {
      const rolActual =
        profile?.role === "pro" && profile.pro_expires_at && new Date(profile.pro_expires_at) < new Date()
          ? "free"
          : profile?.role;

      if (rolActual !== "pro") {
        return NextResponse.redirect(new URL("/precios", request.url));
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

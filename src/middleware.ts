import { createServerClient } from "@supabase/ssr";
import { isAdmin } from "@/lib/admin";
import { NextResponse, type NextRequest } from "next/server";

// Rutas que requieren autenticación
const PROTECTED_ROUTES = ["/dashboard", "/plan", "/perfil", "/onboarding", "/admin"];

// Rutas que requieren plan PRO
const PRO_ROUTES = ["/dashboard/historial"];

// Rutas solo para usuarios no autenticados (redirigen al dashboard si ya hay sesión)
const AUTH_ROUTES = ["/login", "/registro"];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
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

  // Proteger rutas de admin — solo emails en ADMIN_EMAILS
  if (pathname.startsWith("/admin")) {
    if (!user || !isAdmin(user.email)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Verificar acceso PRO en el servidor (nunca en cliente)
  if (user && PRO_ROUTES.some((route) => pathname.startsWith(route))) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "pro") {
      return NextResponse.redirect(new URL("/precios", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Excluir archivos estáticos y rutas internas de Next.js
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

"use client";

import { createClient } from "@/lib/supabase/client";
import { FitLabLogo } from "@/components/ui/gofit-logo";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

interface AuthFormProps {
  mode: "login" | "registro";
}

// Formulario unificado de login y registro con email/contraseña y Google OAuth
export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "registro") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (signUpError) throw signUpError;
        setMessage("Revisa tu email para confirmar la cuenta.");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        router.push(nextUrl);
        router.refresh();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${nextUrl}`,
      },
    });
    if (oauthError) setError(oauthError.message);
  };

  const isLogin = mode === "login";

  const benefits = [
    { icon: "🎯", text: "Plan 100% personalizado a tu cuerpo y objetivo" },
    { icon: "🥗", text: "Dieta y macros calculados para ti" },
    { icon: "📈", text: "Progresión automática semana a semana" },
    { icon: "🔒", text: "Tus datos seguros, almacenados en Europa" },
  ];

  return (
    <div className="flex min-h-screen">
      {/* ── Panel izquierdo — branding ─────────────────────────── */}
      <div className="relative hidden flex-col justify-between bg-[#020817] p-10 lg:flex lg:w-1/2">
        {/* Glow de fondo */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-violet-600/15 blur-3xl" />
        </div>

        {/* Logo */}
        <Link href="/" className="relative z-10 flex items-center gap-2 text-white">
          <FitLabLogo height={28} />
        </Link>

        {/* Beneficios */}
        <div className="relative z-10 space-y-5">
          <h2 className="text-3xl font-black tracking-tight text-white">
            Tu cuerpo.<br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Tu plan.
            </span>
          </h2>
          <div className="space-y-3">
            {benefits.map((b) => (
              <div key={b.text} className="flex items-center gap-3">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/8 text-base">
                  {b.icon}
                </span>
                <span className="text-sm text-gray-300">{b.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tagline pie */}
        <p className="relative z-10 text-xs text-gray-600">
          © {new Date().getFullYear()} FitLab · Todos los derechos reservados
        </p>
      </div>

      {/* ── Panel derecho — formulario ─────────────────────────── */}
      <div className="flex flex-1 flex-col justify-center bg-gray-50 px-6 py-12 sm:px-12">
        {/* Botón volver (visible solo en móvil / siempre arriba) */}
        <Link
          href="/"
          className="mb-8 flex w-fit items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 lg:absolute lg:left-[52%] lg:top-6"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Inicio
        </Link>

        <div className="mx-auto w-full max-w-sm">
          {/* Cabecera */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              {isLogin ? "Bienvenido de nuevo" : "Crea tu cuenta gratis"}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {isLogin ? "Accede a tu plan personalizado" : "Sin tarjeta. Sin compromiso."}
            </p>
          </div>

          {/* Botón Google */}
          <button
            onClick={handleGoogleLogin}
            className="mb-5 flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 hover:shadow"
          >
            <GoogleIcon />
            Continuar con Google
          </button>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gray-50 px-2 text-gray-400">o con email</span>
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Nombre completo
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Ana García"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="ana@ejemplo.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="Mínimo 8 caracteres"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>
            )}
            {message && (
              <div className="rounded-xl bg-green-50 p-3 text-sm text-green-700">{message}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Cargando..." : isLogin ? "Iniciar sesión" : "Crear cuenta gratis"}
            </button>
          </form>

          {/* Enlace alternativo */}
          <p className="mt-6 text-center text-sm text-gray-500">
            {isLogin ? (
              <>
                ¿No tienes cuenta?{" "}
                <Link href="/registro" className="font-semibold text-blue-600 hover:underline">
                  Regístrate gratis
                </Link>
              </>
            ) : (
              <>
                ¿Ya tienes cuenta?{" "}
                <Link href="/login" className="font-semibold text-blue-600 hover:underline">
                  Inicia sesión
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}

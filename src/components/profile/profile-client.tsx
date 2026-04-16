"use client";

import { createClient } from "@/lib/supabase/client";
import type { Subscription, UserProfile } from "@/types/database";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ProfileClientProps {
  profile: UserProfile;
  subscription: Subscription | null;
  planesCreados: number;
}

// Componente cliente de la página de perfil
export function ProfileClient({ profile, subscription, planesCreados }: ProfileClientProps) {
  const router = useRouter();
  const [cerrandoSesion, setCerrandoSesion] = useState(false);

  // Edición de nombre
  const [editandoNombre, setEditandoNombre] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState(profile.full_name ?? "");
  const [guardandoNombre, setGuardandoNombre] = useState(false);
  const [nombreActual, setNombreActual] = useState(profile.full_name);
  const [errorNombre, setErrorNombre] = useState<string | null>(null);

  // Portal Stripe
  const [abriendoPortal, setAbriendoPortal] = useState(false);

  const cerrarSesion = async () => {
    setCerrandoSesion(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const guardarNombre = async () => {
    if (!nuevoNombre.trim()) return;
    setGuardandoNombre(true);
    setErrorNombre(null);
    try {
      const res = await fetch("/api/perfil/update-name", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: nuevoNombre.trim() }),
      });
      if (!res.ok) throw new Error("No se pudo guardar");
      setNombreActual(nuevoNombre.trim());
      setEditandoNombre(false);
    } catch {
      setErrorNombre("No se pudo actualizar el nombre");
    } finally {
      setGuardandoNombre(false);
    }
  };

  const abrirPortalStripe = async () => {
    setAbriendoPortal(true);
    try {
      const res = await fetch("/api/crear-portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      // fallback silencioso
    } finally {
      setAbriendoPortal(false);
    }
  };

  const esPro = profile.role === "pro";
  const fechaRenovacion = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const miembroDesde = new Date(profile.created_at).toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-2xl px-4">
        <h1 className="mb-8 text-2xl font-bold text-gray-900">Mi perfil</h1>

        {/* Información personal */}
        <section className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-gray-900">Información personal</h2>
          <div className="space-y-4 text-sm">
            {/* Nombre con edición inline */}
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-500 shrink-0">Nombre</span>
              {editandoNombre ? (
                <div className="flex items-center gap-2 flex-1 justify-end">
                  <input
                    type="text"
                    value={nuevoNombre}
                    onChange={(e) => setNuevoNombre(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") guardarNombre(); if (e.key === "Escape") setEditandoNombre(false); }}
                    autoFocus
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 w-40"
                  />
                  <button
                    onClick={guardarNombre}
                    disabled={guardandoNombre}
                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {guardandoNombre ? "..." : "Guardar"}
                  </button>
                  <button
                    onClick={() => { setEditandoNombre(false); setNuevoNombre(nombreActual ?? ""); }}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{nombreActual ?? "—"}</span>
                  <button
                    onClick={() => setEditandoNombre(true)}
                    className="rounded-md p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition"
                    title="Editar nombre"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            {errorNombre && <p className="text-xs text-red-600">{errorNombre}</p>}

            {/* Email */}
            <div className="flex justify-between">
              <span className="text-gray-500">Email</span>
              <span className="font-medium text-gray-900">{profile.email}</span>
            </div>

            {/* Plan */}
            <div className="flex justify-between">
              <span className="text-gray-500">Plan</span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  esPro ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                }`}
              >
                {esPro ? "PRO" : "Free"}
              </span>
            </div>
          </div>
        </section>

        {/* Estadísticas de cuenta */}
        <section className="mb-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white p-4 shadow-sm text-center">
            <div className="text-2xl font-black text-blue-600">{planesCreados}</div>
            <div className="mt-0.5 text-xs text-gray-500">Planes generados</div>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm text-center">
            <div className="text-sm font-bold text-gray-700 capitalize">{miembroDesde}</div>
            <div className="mt-0.5 text-xs text-gray-500">Miembro desde</div>
          </div>
        </section>

        {/* Suscripción */}
        <section className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-gray-900">Suscripción</h2>
          {esPro && subscription ? (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Estado</span>
                <span className="font-medium text-green-600">Activa</span>
              </div>
              {fechaRenovacion && (
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    {subscription.cancel_at_period_end ? "Expira el" : "Renovación el"}
                  </span>
                  <span className="font-medium text-gray-900">{fechaRenovacion}</span>
                </div>
              )}
              {subscription.cancel_at_period_end && (
                <p className="rounded-lg bg-yellow-50 p-3 text-xs text-yellow-700">
                  Tu suscripción está programada para cancelarse. Seguirás teniendo acceso PRO hasta
                  la fecha de expiración.
                </p>
              )}
              <div className="pt-1">
                <button
                  onClick={abrirPortalStripe}
                  disabled={abriendoPortal}
                  className="w-full rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  {abriendoPortal ? "Abriendo..." : "Gestionar suscripción →"}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="mb-4 text-sm text-gray-500">
                Estás en el plan gratuito. Actualiza a PRO para desbloquear planes ilimitados,
                seguimiento semanal y comidas personalizadas cada día.
              </p>
              <Link
                href="/precios"
                className="inline-block rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Ver planes PRO
              </Link>
            </div>
          )}
        </section>

        {/* Cuenta */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-gray-900">Cuenta</h2>
          <button
            onClick={cerrarSesion}
            disabled={cerrandoSesion}
            className="w-full rounded-xl border border-red-200 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            {cerrandoSesion ? "Cerrando sesión..." : "Cerrar sesión"}
          </button>
        </section>
      </div>
    </main>
  );
}

"use client";

import { createClient } from "@/lib/supabase/client";
import type { Subscription, UserProfile } from "@/types/database";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ProfileClientProps {
  profile: UserProfile;
  subscription: Subscription | null;
}

// Componente cliente de la página de perfil con logout y gestión de suscripción
export function ProfileClient({ profile, subscription }: ProfileClientProps) {
  const router = useRouter();
  const [cerrandoSesion, setCerrandoSesion] = useState(false);

  const cerrarSesion = async () => {
    setCerrandoSesion(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const esPro = profile.role === "pro";
  const fechaRenovacion = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-2xl px-4">
        <h1 className="mb-8 text-2xl font-bold text-gray-900">Mi perfil</h1>

        {/* Datos del usuario */}
        <section className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-gray-900">Información personal</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Nombre</span>
              <span className="font-medium text-gray-900">{profile.full_name ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Email</span>
              <span className="font-medium text-gray-900">{profile.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Plan</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  esPro ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                }`}
              >
                {esPro ? "PRO" : "Free"}
              </span>
            </div>
          </div>
        </section>

        {/* Estado de la suscripción */}
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
            </div>
          ) : (
            <div>
              <p className="mb-4 text-sm text-gray-500">
                Estás en el plan gratuito. Actualiza a PRO para desbloquear planes ilimitados y
                seguimiento semanal.
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

        {/* Acciones */}
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

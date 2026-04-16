"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Banner celebratorio que aparece tras completar el pago PRO
export function UpgradeBanner() {
  const router = useRouter();
  const [visible, setVisible] = useState(true);

  // Limpiar el ?upgrade=success de la URL sin recargar la página
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete("upgrade");
    window.history.replaceState({}, "", url.toString());
  }, []);

  if (!visible) return null;

  return (
    <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="text-3xl">🎉</span>
          <div>
            <p className="font-bold text-lg">¡Bienvenido a ZapFit PRO!</p>
            <p className="mt-0.5 text-sm text-blue-100">
              Ya tienes acceso a planes ilimitados, comidas personalizadas cada día, seguimiento semanal y ajuste automático del plan.
            </p>
            <button
              onClick={() => router.push("/onboarding")}
              className="mt-3 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
            >
              Crear mi primer plan PRO →
            </button>
          </div>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="mt-0.5 rounded-lg p-1 text-blue-200 hover:bg-white/10 hover:text-white transition"
          aria-label="Cerrar"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

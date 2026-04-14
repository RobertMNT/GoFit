"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Banner de cookies RGPD — solo cookies estrictamente necesarias
export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Guard necesario: Next.js 15 inyecta un polyfill roto de localStorage en workers de Node.js
    if (typeof window === "undefined") return;
    try {
      const aceptado = localStorage.getItem("fitlab_cookies_accepted");
      if (!aceptado) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const aceptar = () => {
    try {
      localStorage.setItem("fitlab_cookies_accepted", "true");
    } catch {
      // Ignorar si localStorage no está disponible
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white p-4 shadow-lg">
      <div className="mx-auto flex max-w-5xl flex-col items-start gap-4 sm:flex-row sm:items-center">
        <p className="flex-1 text-sm text-gray-600">
          Usamos cookies estrictamente necesarias para el funcionamiento de la sesión. No usamos
          cookies de seguimiento ni publicidad.{" "}
          <Link href="/cookies" className="text-blue-600 hover:underline">
            Más información
          </Link>
        </p>
        <button
          onClick={aceptar}
          className="shrink-0 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Aceptar
        </button>
      </div>
    </div>
  );
}

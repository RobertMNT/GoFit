"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const FEATURES_FREE = [
  "1 plan de entrenamiento personalizado",
  "Cuestionario de perfil personalizado",
  "Vista completa del plan semanal",
  "Sin tarjeta de crédito",
];

const FEATURES_PRO = [
  "Planes ilimitados",
  "Seguimiento semanal de progreso",
  "Ajuste automático del plan",
  "Historial completo de planes",
  "Soporte prioritario",
];

// Componente de tarjetas de precios con lógica de checkout Stripe
export function PricingCards() {
  const router = useRouter();
  const [loading, setLoading] = useState<"monthly" | "yearly" | null>(null);

  const iniciarCheckout = async (tipo: "monthly" | "yearly") => {
    setLoading(tipo);
    try {
      const priceId =
        tipo === "monthly"
          ? process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY
          : process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_YEARLY;

      const res = await fetch("/api/crear-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price_id: priceId }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login?next=/precios");
          return;
        }
        throw new Error(data.error);
      }

      // Redirigir a Stripe Checkout
      window.location.href = data.url;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al iniciar el pago";
      alert(msg);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {/* Plan FREE */}
      <div className="rounded-2xl border border-gray-200 bg-white p-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Free</h2>
          <div className="mt-2 flex items-end gap-1">
            <span className="text-4xl font-bold text-gray-900">0€</span>
            <span className="mb-1 text-gray-400">/mes</span>
          </div>
          <p className="mt-2 text-sm text-gray-500">Para empezar a explorar</p>
        </div>

        <ul className="mb-8 space-y-3">
          {FEATURES_FREE.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-green-500">✓</span>
              {f}
            </li>
          ))}
        </ul>

        <button
          onClick={() => router.push("/registro")}
          className="w-full rounded-xl border border-gray-300 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          Empezar gratis
        </button>
      </div>

      {/* Plan PRO Mensual */}
      <div className="relative rounded-2xl border-2 border-blue-500 bg-white p-8">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-500 px-4 py-1 text-xs font-semibold text-white">
          MÁS POPULAR
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">PRO Mensual</h2>
          <div className="mt-2 flex items-end gap-1">
            <span className="text-4xl font-bold text-gray-900">9,99€</span>
            <span className="mb-1 text-gray-400">/mes</span>
          </div>
          <p className="mt-2 text-sm text-gray-500">Sin compromiso, cancela cuando quieras</p>
        </div>

        <ul className="mb-8 space-y-3">
          {FEATURES_PRO.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-blue-500">✓</span>
              {f}
            </li>
          ))}
        </ul>

        <button
          onClick={() => iniciarCheckout("monthly")}
          disabled={loading !== null}
          className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {loading === "monthly" ? "Redirigiendo..." : "Suscribirme por 9,99€/mes"}
        </button>
      </div>

      {/* Plan PRO Anual */}
      <div className="rounded-2xl border border-gray-200 bg-white p-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">PRO Anual</h2>
          <div className="mt-2 flex items-end gap-1">
            <span className="text-4xl font-bold text-gray-900">79,99€</span>
            <span className="mb-1 text-gray-400">/año</span>
          </div>
          <p className="mt-2 text-sm font-medium text-green-600">Ahorras 40€ al año</p>
        </div>

        <ul className="mb-8 space-y-3">
          {FEATURES_PRO.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-green-500">✓</span>
              {f}
            </li>
          ))}
        </ul>

        <button
          onClick={() => iniciarCheckout("yearly")}
          disabled={loading !== null}
          className="w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
        >
          {loading === "yearly" ? "Redirigiendo..." : "Suscribirme por 79,99€/año"}
        </button>
      </div>
    </div>
  );
}

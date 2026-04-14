import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de privacidad",
  robots: { index: false },
};

export default function PrivacidadPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Política de privacidad</h1>
      <div className="prose prose-gray max-w-none text-sm text-gray-600">
        {/* Integrar widget Iubenda aquí cuando esté configurado */}
        <p>
          La política de privacidad completa está gestionada por Iubenda en cumplimiento del
          Reglamento General de Protección de Datos (RGPD).
        </p>
        <p className="mt-4">
          Los datos recogidos (email, datos físicos del cuestionario) se utilizan exclusivamente
          para la prestación del servicio y no se comparten con terceros salvo los proveedores
          necesarios para el funcionamiento (Supabase, Stripe, Anthropic).
        </p>
      </div>
    </main>
  );
}

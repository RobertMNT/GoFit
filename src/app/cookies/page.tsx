import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de cookies",
  robots: { index: false },
};

export default function CookiesPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Política de cookies</h1>
      <div className="prose prose-gray max-w-none text-sm text-gray-600">
        {/* Integrar widget Iubenda aquí cuando esté configurado */}
        <p>
          La política de cookies completa está gestionada por Iubenda. ZapFit utiliza cookies
          estrictamente necesarias para la autenticación de sesión y no utiliza cookies de
          seguimiento o publicidad.
        </p>
      </div>
    </main>
  );
}

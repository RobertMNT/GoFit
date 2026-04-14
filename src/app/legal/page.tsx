import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aviso legal",
  robots: { index: false },
};

export default function LegalPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Aviso legal</h1>
      <div className="prose prose-gray max-w-none text-sm text-gray-600">
        {/* Integrar widget Iubenda aquí cuando esté configurado */}
        <p>
          El contenido legal completo está gestionado por Iubenda. Integra el widget desde tu
          panel de Iubenda una vez configurado el sitio.
        </p>
        <p className="mt-4">
          En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la
          Sociedad de la Información y Comercio Electrónico, se informa que el presente sitio web es
          titularidad de FitLab.
        </p>
      </div>
    </main>
  );
}

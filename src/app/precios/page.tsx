import type { Metadata } from "next";
import { PricingCards } from "@/components/pricing/pricing-cards";

export const metadata: Metadata = {
  title: "Precios",
  description: "Elige el plan que mejor se adapta a tus objetivos de fitness",
};

export default function PreciosPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-16">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900">
            Invierte en tu salud
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            Empieza gratis. Desbloquea todo con PRO.
          </p>
        </div>
        <PricingCards />
      </div>
    </main>
  );
}

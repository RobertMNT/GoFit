"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";

// Página de carga mientras se genera el plan
function GenerarPlanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const questionnaireId = searchParams.get("q");

  const [estado, setEstado] = useState<"generando" | "error">("generando");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!questionnaireId) {
      router.push("/onboarding");
      return;
    }

    const generar = async () => {
      try {
        const res = await fetch("/api/generar-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionnaire_id: questionnaireId }),
        });

        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.error ?? "Error al generar el plan");
        }

        // Redirigir al plan recién creado
        router.push(`/plan/${json.plan_id}`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error desconocido";
        setErrorMsg(msg);
        setEstado("error");
      }
    };

    generar();
  }, [questionnaireId, router]);

  if (estado === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="text-5xl">❌</div>
        <h1 className="text-xl font-semibold text-gray-900">No se pudo generar el plan</h1>
        <p className="max-w-sm text-sm text-gray-500">{errorMsg}</p>
        <button
          onClick={() => router.push("/onboarding")}
          className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Volver al cuestionario
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <Spinner size={56} />
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Creando tu plan personalizado</h1>
        <p className="mt-2 text-sm text-gray-500">
          Estamos analizando tu perfil y diseñando tu plan de entrenamiento.
          <br />
          Esto puede tardar hasta 30 segundos.
        </p>
      </div>
    </div>
  );
}


export default function GenerarPlanPage() {
  return (
    <Suspense>
      <GenerarPlanContent />
    </Suspense>
  );
}

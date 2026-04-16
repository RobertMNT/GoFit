"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, Suspense } from "react";

const PASOS = [
  { id: 1, label: "Analizando tu perfil",        umbral: 0 },
  { id: 2, label: "Diseñando ejercicios",         umbral: 800 },
  { id: 3, label: "Calculando plan nutricional",  umbral: 3000 },
  { id: 4, label: "Guardando tu plan",            umbral: Infinity },
];

function GenerarPlanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const questionnaireId = searchParams.get("q");

  const [chars, setChars] = useState(0);
  const [pasoActual, setPasoActual] = useState(1);
  const [planNombre, setPlanNombre] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const acumulado = useRef("");
  const iniciado = useRef(false);

  useEffect(() => {
    if (!questionnaireId || iniciado.current) return;
    iniciado.current = true;

    const generar = async () => {
      try {
        const res = await fetch("/api/generar-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionnaire_id: questionnaireId }),
        });

        if (!res.ok || !res.body) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json.error ?? "Error al generar el plan");
        }

        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += dec.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6).trim();
            if (!raw) continue;

            let event: { type: string; text?: string; message?: string; plan_id?: string };
            try {
              event = JSON.parse(raw);
            } catch {
              continue;
            }

            if (event.type === "chunk" && event.text) {
              acumulado.current += event.text;
              const total = acumulado.current.length;
              setChars(total);

              // Detectar paso actual por caracteres recibidos
              for (let i = PASOS.length - 1; i >= 0; i--) {
                if (total >= PASOS[i].umbral) {
                  setPasoActual(PASOS[i].id);
                  break;
                }
              }

              // Extraer nombre del plan cuando aparece en el JSON
              const match = acumulado.current.match(/"nombre"\s*:\s*"([^"]{3,})"/);
              if (match && !planNombre) {
                setPlanNombre(match[1]);
              }
            }

            if (event.type === "saving") {
              setPasoActual(4);
            }

            if (event.type === "done" && event.plan_id) {
              router.push(`/plan/${event.plan_id}`);
            }

            if (event.type === "error") {
              throw new Error(event.message ?? "Error desconocido");
            }
          }
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      }
    };

    generar();
  }, [questionnaireId, router, planNombre]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="text-5xl">❌</div>
        <h1 className="text-xl font-semibold text-gray-900">No se pudo generar el plan</h1>
        <p className="max-w-sm text-sm text-gray-500">{error}</p>
        <button
          onClick={() => router.push("/onboarding")}
          className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Volver al cuestionario
        </button>
      </div>
    );
  }

  // Porcentaje estimado de progreso (los primeros 3 pasos ≈ 6000 chars)
  const progreso = Math.min(95, Math.round((chars / 6000) * 90));

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-gray-50 p-8 text-center">
      {/* Icono animado */}
      <div className="relative flex h-20 w-20 items-center justify-center">
        <div className="absolute inset-0 animate-ping rounded-full bg-blue-100 opacity-60" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-3xl shadow-lg">
          ⚡
        </div>
      </div>

      {/* Título */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Creando tu plan personalizado</h1>
        {planNombre ? (
          <p className="mt-2 text-base font-medium text-blue-600">"{planNombre}"</p>
        ) : (
          <p className="mt-2 text-sm text-gray-500">Diseñando cada detalle para ti…</p>
        )}
      </div>

      {/* Barra de progreso */}
      <div className="w-full max-w-sm">
        <div className="mb-2 flex justify-between text-xs text-gray-400">
          <span>Progreso</span>
          <span>{pasoActual === 4 ? "Guardando…" : `${progreso}%`}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-500"
            style={{ width: `${pasoActual === 4 ? 98 : progreso}%` }}
          />
        </div>
      </div>

      {/* Pasos */}
      <div className="w-full max-w-sm space-y-3 text-left">
        {PASOS.map((paso) => {
          const completado = pasoActual > paso.id;
          const activo = pasoActual === paso.id;
          return (
            <div key={paso.id} className="flex items-center gap-3">
              <div
                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                  completado
                    ? "bg-green-500 text-white"
                    : activo
                      ? "bg-blue-600 text-white shadow-[0_0_12px_rgba(59,130,246,0.5)]"
                      : "bg-gray-200 text-gray-400"
                }`}
              >
                {completado ? "✓" : paso.id}
              </div>
              <span
                className={`text-sm font-medium transition-colors duration-300 ${
                  completado ? "text-green-600" : activo ? "text-gray-900" : "text-gray-400"
                }`}
              >
                {paso.label}
                {activo && <span className="ml-1 animate-pulse">…</span>}
              </span>
            </div>
          );
        })}
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

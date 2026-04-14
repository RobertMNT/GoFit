"use client";

import type { AjusteResponse } from "@/app/api/ajustar-plan/route";
import { useState, useTransition } from "react";
import { Spinner } from "@/components/ui/spinner";

interface AjusteIAProps {
  planId: string;
  semana: number;
}

const TIPO_CONFIG = {
  aumentar_intensidad: { label: "Aumentar intensidad", color: "bg-green-100 text-green-700", icono: "⬆️" },
  reducir_intensidad: { label: "Reducir intensidad", color: "bg-orange-100 text-orange-700", icono: "⬇️" },
  mantener: { label: "Mantener", color: "bg-blue-100 text-blue-700", icono: "➡️" },
  recuperacion_extra: { label: "Recuperación extra", color: "bg-purple-100 text-purple-700", icono: "😴" },
} as const;

// Componente cliente para solicitar ajuste de plan con IA (solo PRO)
export function AjusteIA({ planId, semana }: AjusteIAProps) {
  const [ajuste, setAjuste] = useState<AjusteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function solicitarAjuste() {
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/ajustar-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_id: planId, semana }),
      });

      const data: AjusteResponse | { error: string } = await res.json();

      if (!res.ok) {
        setError((data as { error: string }).error ?? "Error al obtener el ajuste");
        return;
      }

      setAjuste(data as AjusteResponse);
    });
  }

  return (
    <div className="rounded-2xl border border-purple-100 bg-purple-50 p-5">
      {/* Cabecera */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-gray-900">Ajuste automático de plan</h3>
          <p className="mt-0.5 text-sm text-gray-500">
            Analiza tu progreso y sugiere cambios para la próxima semana
          </p>
        </div>
        <button
          onClick={solicitarAjuste}
          disabled={isPending}
          className="flex-shrink-0 rounded-xl bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-700 disabled:opacity-60"
        >
          {isPending ? <Spinner size={18} className="mx-2" /> : "Analizar semana"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {/* Resultado del ajuste */}
      {ajuste && (
        <div className="space-y-4">
          {/* Resumen */}
          <div className="rounded-xl bg-white p-4">
            <p className="text-sm text-gray-700">{ajuste.resumen}</p>
          </div>

          {/* Ajustes por día */}
          {ajuste.ajustes.length > 0 && (
            <div className="space-y-2">
              {ajuste.ajustes.map((item, i) => {
                const config = TIPO_CONFIG[item.tipo];
                return (
                  <div key={i} className="rounded-xl bg-white p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{config.icono}</span>
                      <span className="font-medium capitalize text-gray-900">{item.dia}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${config.color}`}
                      >
                        {config.label}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">{item.razon}</p>
                    <p className="mt-1 text-sm font-medium text-gray-700">{item.sugerencia}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Recomendación general */}
          <div className="rounded-xl border border-purple-200 bg-purple-100 p-4">
            <p className="text-sm font-medium text-purple-800">{ajuste.recomendacion_general}</p>
          </div>
        </div>
      )}
    </div>
  );
}

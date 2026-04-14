"use client";

import type { WeeklyLog } from "@/types/database";
import type { DayPlan } from "@/types/plan";
import { useState, useTransition } from "react";

interface WeeklyTrackerProps {
  planId: string;
  semana: number;
  dias: DayPlan[];
  logsIniciales: WeeklyLog[];
}

// Componente de seguimiento semanal — permite marcar días como completados (solo PRO)
export function WeeklyTracker({ planId, semana, dias, logsIniciales }: WeeklyTrackerProps) {
  // Extraer el mapa de completados desde el log de esta semana (una fila por semana en DB)
  const [completados, setCompletados] = useState<Record<string, boolean>>(() => {
    const log = logsIniciales.find((l) => l.week_number === semana);
    return (log?.completed_exercises as Record<string, boolean>) ?? {};
  });

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const diasEntrenables = dias.filter((d) => d.tipo !== "descanso_activo");
  const totalCompletados = diasEntrenables.filter((d) => completados[d.dia]).length;
  const porcentaje = diasEntrenables.length > 0
    ? Math.round((totalCompletados / diasEntrenables.length) * 100)
    : 0;

  function toggleDia(dia: string) {
    const nuevoValor = !completados[dia];

    // Actualización optimista
    setCompletados((prev) => ({ ...prev, [dia]: nuevoValor }));
    setError(null);

    startTransition(async () => {
      const res = await fetch("/api/weekly-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_id: planId,
          week_number: semana,
          dia,
          completado: nuevoValor,
        }),
      });

      if (!res.ok) {
        // Revertir si falla
        setCompletados((prev) => ({ ...prev, [dia]: !nuevoValor }));
        setError("Error al guardar. Inténtalo de nuevo.");
      }
    });
  }

  return (
    <div className="rounded-2xl border border-violet-100 bg-violet-50 p-5">
      {/* Cabecera */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">Seguimiento semana {semana}</h3>
          <p className="text-sm text-gray-500">
            {totalCompletados} de {diasEntrenables.length} días completados
          </p>
        </div>
        {/* Indicador circular de progreso */}
        <div className="relative flex h-14 w-14 items-center justify-center">
          <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="15.9" fill="none"
              stroke="#7c3aed"
              strokeWidth="3"
              strokeDasharray={`${porcentaje} ${100 - porcentaje}`}
              strokeLinecap="round"
            />
          </svg>
          <span className="relative text-xs font-bold text-violet-700">{porcentaje}%</span>
        </div>
      </div>

      {/* Lista de días */}
      <div className="space-y-2">
        {dias.map((dia) => {
          const esDescanso = dia.tipo === "descanso_activo";
          const estaCompletado = completados[dia.dia] ?? false;

          return (
            <div
              key={dia.dia}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition ${
                esDescanso
                  ? "bg-gray-100 opacity-60"
                  : estaCompletado
                    ? "bg-green-100"
                    : "bg-white hover:bg-gray-50"
              }`}
            >
              <button
                onClick={() => !esDescanso && !isPending && toggleDia(dia.dia)}
                disabled={esDescanso || isPending}
                aria-label={`Marcar ${dia.dia} como ${estaCompletado ? "no completado" : "completado"}`}
                className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition ${
                  esDescanso
                    ? "cursor-not-allowed border-gray-300"
                    : estaCompletado
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-gray-300 hover:border-violet-400"
                }`}
              >
                {estaCompletado && !esDescanso && (
                  <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>

              <div className="flex-1">
                <span className="font-medium capitalize text-gray-900">{dia.dia}</span>
                {!esDescanso && (
                  <span className="ml-2 text-xs text-gray-400">{dia.ejercicios.length} ejercicios</span>
                )}
                {esDescanso && (
                  <span className="ml-2 text-xs text-gray-400">descanso activo</span>
                )}
              </div>

              {!esDescanso && (
                <span className={`text-xs font-medium ${estaCompletado ? "text-green-600" : "text-gray-400"}`}>
                  {estaCompletado ? "Completado" : "Pendiente"}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {error && <p className="mt-3 text-center text-xs text-red-500">{error}</p>}
    </div>
  );
}

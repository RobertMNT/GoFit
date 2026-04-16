"use client";

import { useEffect, useState, useTransition } from "react";

interface DiaActividad {
  date: string;
  completado: boolean;
}

interface StreakData {
  racha: number;
  hecho: boolean;
  ultimos7: DiaActividad[];
}

const DIAS_CORTOS = ["L", "M", "X", "J", "V", "S", "D"];

// Widget de racha diaria — el hook de retención más poderoso
export function StreakWidget() {
  const [data, setData] = useState<StreakData | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/checkin")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => setError(true));
  }, []);

  const hacerCheckin = () => {
    startTransition(async () => {
      const res = await fetch("/api/checkin", { method: "POST" });
      if (!res.ok) { setError(true); return; }
      const updated = await res.json();
      setData((prev) => prev ? { ...prev, hecho: true, racha: updated.racha } : prev);
    });
  };

  // Ocultar si la tabla no está configurada aún
  if (error || !data) return null;

  const { racha, hecho, ultimos7 } = data;

  return (
    <div className={`mb-6 rounded-2xl p-5 transition-all ${
      racha >= 7
        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
        : racha >= 3
          ? "bg-gradient-to-r from-orange-400 to-amber-400 text-white"
          : "bg-white border border-gray-100 shadow-sm"
    }`}>
      <div className="flex items-center justify-between gap-4">
        {/* Racha */}
        <div className="flex items-center gap-3">
          <div className={`text-4xl ${racha === 0 ? "grayscale opacity-40" : ""}`}>🔥</div>
          <div>
            <div className={`text-2xl font-black ${racha > 0 ? "" : "text-gray-400"}`}>
              {racha} {racha === 1 ? "día" : "días"}
            </div>
            <div className={`text-xs font-medium ${racha > 0 ? (racha >= 3 ? "text-white/80" : "text-gray-500") : "text-gray-400"}`}>
              {racha === 0 ? "Empieza tu racha hoy" : racha >= 7 ? "¡Racha increíble!" : racha >= 3 ? "¡Vas muy bien!" : "Racha activa"}
            </div>
          </div>
        </div>

        {/* Botón check-in */}
        {!hecho ? (
          <button
            onClick={hacerCheckin}
            disabled={isPending}
            className={`rounded-xl px-4 py-2.5 text-sm font-bold transition disabled:opacity-60 ${
              racha >= 3
                ? "bg-white text-orange-600 hover:bg-orange-50"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isPending ? "..." : "✓ Check-in"}
          </button>
        ) : (
          <div className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold ${
            racha >= 3 ? "bg-white/20 text-white" : "bg-green-100 text-green-700"
          }`}>
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Completado
          </div>
        )}
      </div>

      {/* Últimos 7 días */}
      {ultimos7.length > 0 && (
        <div className="mt-4 flex gap-1.5">
          {ultimos7.map((dia, i) => {
            const esHoy = i === 6;
            return (
              <div key={dia.date} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className={`h-7 w-full rounded-lg transition-all ${
                    dia.completado
                      ? racha >= 3
                        ? "bg-white/40"
                        : "bg-orange-400"
                      : racha >= 3
                        ? "bg-white/15"
                        : "bg-gray-100"
                  } ${esHoy ? "ring-2 ring-offset-1 " + (racha >= 3 ? "ring-white/60" : "ring-blue-400") : ""}`}
                >
                  {dia.completado && (
                    <div className="flex h-full items-center justify-center">
                      <svg className={`h-3.5 w-3.5 ${racha >= 3 ? "text-white" : "text-orange-600"}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <span className={`text-xs ${racha >= 3 ? "text-white/70" : "text-gray-400"}`}>
                  {DIAS_CORTOS[new Date(dia.date + "T12:00:00").getDay() === 0 ? 6 : new Date(dia.date + "T12:00:00").getDay() - 1]}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

"use client";

import { AjusteIA } from "@/components/plan/ajuste-ia";
import { WeeklyTracker } from "@/components/plan/weekly-tracker";
import type { FitnessPlan, NutritionPlan, WeeklyLog } from "@/types/database";
import type { DayPlan, WeeklyPlan } from "@/types/plan";
import { useState } from "react";

interface PlanViewProps {
  plan: FitnessPlan;
  esPro: boolean;
  weeklyLogs: WeeklyLog[];
}

const TIPO_COLOR: Record<string, string> = {
  fuerza: "bg-blue-100 text-blue-800",
  cardio: "bg-orange-100 text-orange-800",
  flexibilidad: "bg-green-100 text-green-800",
  descanso_activo: "bg-gray-100 text-gray-600",
};

const TIPO_EMOJI: Record<string, string> = {
  fuerza: "💪",
  cardio: "🏃",
  flexibilidad: "🧘",
  descanso_activo: "😴",
};

// Componente principal que renderiza el plan de entrenamiento en tabla semanal
export function PlanView({ plan, esPro, weeklyLogs }: PlanViewProps) {
  const [semanaActiva, setSemanaActiva] = useState(1);

  const semana = (plan.semanas as unknown as WeeklyPlan[]).find(
    (s) => s.semana === semanaActiva,
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Cabecera del plan */}
      <div className="mb-8 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-6 text-white">
        <h1 className="text-2xl font-bold">{plan.nombre}</h1>
        <p className="mt-2 text-sm text-blue-100">{plan.descripcion}</p>
        <div className="mt-4 flex gap-4 text-sm">
          <span className="rounded-full bg-white/20 px-3 py-1">
            📅 {plan.duracion_semanas} semanas
          </span>
          {esPro && (
            <span className="rounded-full bg-yellow-400/30 px-3 py-1 text-yellow-100">
              ⭐ PRO — seguimiento activo
            </span>
          )}
        </div>
      </div>

      {/* Selector de semana */}
      <div className="mb-6 flex flex-wrap gap-2">
        {(plan.semanas as unknown as WeeklyPlan[]).map((s) => (
          <button
            key={s.semana}
            onClick={() => setSemanaActiva(s.semana)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              semanaActiva === s.semana
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Semana {s.semana}
          </button>
        ))}
      </div>

      {/* Días de la semana activa */}
      {semana && (
        <div className="space-y-4">
          {semana.dias.map((dia) => (
            <DiaCard key={dia.dia} dia={dia} />
          ))}

          {/* Plan nutricional de la semana */}
          {semana.nutricion && (
            <NutricionCard nutricion={semana.nutricion} />
          )}

          {/* Seguimiento semanal y ajuste IA — solo PRO */}
          {esPro && (
            <div className="mt-8 space-y-4">
              <WeeklyTracker
                planId={plan.id}
                semana={semanaActiva}
                dias={semana.dias}
                logsIniciales={weeklyLogs}
              />
              <AjusteIA planId={plan.id} semana={semanaActiva} />
            </div>
          )}

          {/* Banner upgrade para usuarios FREE */}
          {!esPro && (
            <div className="mt-8 rounded-2xl border border-yellow-200 bg-yellow-50 p-5 text-center">
              <p className="font-medium text-gray-800">
                ⭐ Actualiza a PRO para desbloquear el seguimiento semanal y los ajustes automáticos
              </p>
              <a
                href="/precios"
                className="mt-3 inline-block rounded-xl bg-blue-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Ver planes PRO
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Tarjeta con el plan nutricional de la semana
function NutricionCard({ nutricion }: { nutricion: NutritionPlan }) {
  const [expandido, setExpandido] = useState(false);

  const macros = [
    { label: "Proteínas",      valor: nutricion.proteinas_g,     unit: "g", color: "bg-blue-500",   pct: Math.round((nutricion.proteinas_g * 4 / nutricion.calorias_diarias) * 100) },
    { label: "Carbohidratos",  valor: nutricion.carbohidratos_g, unit: "g", color: "bg-yellow-400", pct: Math.round((nutricion.carbohidratos_g * 4 / nutricion.calorias_diarias) * 100) },
    { label: "Grasas",         valor: nutricion.grasas_g,        unit: "g", color: "bg-orange-400", pct: Math.round((nutricion.grasas_g * 9 / nutricion.calorias_diarias) * 100) },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">
      {/* Cabecera */}
      <button
        onClick={() => setExpandido((e) => !e)}
        className="flex w-full items-center justify-between p-4"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🥗</span>
          <div className="text-left">
            <div className="font-semibold text-gray-900">Plan nutricional</div>
            <div className="text-sm text-emerald-600 font-medium">{nutricion.calorias_diarias} kcal / día</div>
          </div>
        </div>
        <span className={`text-gray-400 transition-transform ${expandido ? "rotate-180" : ""}`}>▼</span>
      </button>

      {expandido && (
        <div className="border-t border-gray-100 p-4 space-y-4">
          {/* Macros */}
          <div className="grid grid-cols-3 gap-3">
            {macros.map((m) => (
              <div key={m.label} className="rounded-xl bg-gray-50 p-3 text-center">
                <div className="text-xs text-gray-500 mb-1">{m.label}</div>
                <div className="text-lg font-bold text-gray-900">{m.valor}<span className="text-xs font-normal text-gray-400 ml-0.5">{m.unit}</span></div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-200">
                  <div className={`h-full rounded-full ${m.color}`} style={{ width: `${m.pct}%` }} />
                </div>
                <div className="mt-1 text-[10px] text-gray-400">{m.pct}%</div>
              </div>
            ))}
          </div>

          {/* Comidas del día */}
          {nutricion.comidas.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Comidas ejemplo</p>
              {nutricion.comidas.map((comida, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl bg-gray-50 px-3 py-2.5">
                  <span className="mt-0.5 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 whitespace-nowrap">
                    {comida.nombre}
                  </span>
                  <span className="flex-1 text-sm text-gray-700">{comida.ejemplo}</span>
                  <span className="text-xs text-gray-400 whitespace-nowrap">{comida.calorias} kcal</span>
                </div>
              ))}
            </div>
          )}

          {/* Notas nutricionales */}
          {nutricion.notas && (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
              <p className="text-sm text-emerald-800">{nutricion.notas}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Tarjeta de un día de entrenamiento
function DiaCard({ dia }: { dia: DayPlan }) {
  const [expandido, setExpandido] = useState(dia.tipo !== "descanso_activo");
  const esDescanso = dia.tipo === "descanso_activo";

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Cabecera del día */}
      <button
        onClick={() => !esDescanso && setExpandido((e) => !e)}
        className="flex w-full items-center justify-between p-4"
        disabled={esDescanso}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{TIPO_EMOJI[dia.tipo]}</span>
          <div className="text-left">
            <div className="font-semibold capitalize text-gray-900">{dia.dia}</div>
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${TIPO_COLOR[dia.tipo]}`}
            >
              {dia.tipo.replace("_", " ")}
            </span>
          </div>
        </div>
        {!esDescanso && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>{dia.ejercicios.length} ejercicios</span>
            <span className={`transition-transform ${expandido ? "rotate-180" : ""}`}>▼</span>
          </div>
        )}
      </button>

      {/* Lista de ejercicios */}
      {expandido && dia.ejercicios.length > 0 && (
        <div className="border-t border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-400">
              <tr>
                <th className="px-4 py-2 text-left">Ejercicio</th>
                <th className="px-4 py-2 text-center">Series</th>
                <th className="px-4 py-2 text-center">Reps</th>
                <th className="px-4 py-2 text-center">Descanso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {dia.ejercicios.map((ej, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{ej.nombre}</div>
                    {ej.notas && <div className="text-xs text-gray-400">{ej.notas}</div>}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">{ej.series}</td>
                  <td className="px-4 py-3 text-center text-gray-700">{ej.repeticiones}</td>
                  <td className="px-4 py-3 text-center text-gray-400">
                    {ej.descanso_segundos}s
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

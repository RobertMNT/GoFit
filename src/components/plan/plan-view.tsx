"use client";

import { AjusteIA } from "@/components/plan/ajuste-ia";
import { EjercicioModal } from "@/components/plan/ejercicio-modal";
import { WeeklyTracker } from "@/components/plan/weekly-tracker";
import type { FitnessPlan, NutritionPlan, WeeklyLog } from "@/types/database";
import type { DayPlan, Exercise, Meal, WeeklyPlan } from "@/types/plan";
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

const COMIDA_EMOJI: Record<string, string> = {
  Desayuno: "🌅",
  Almuerzo: "☀️",
  Merienda: "🍎",
  Cena: "🌙",
};

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

      {semana && (
        <div className="space-y-4">
          {/* Macros semanales */}
          {semana.nutricion && (
            <MacrosCard nutricion={semana.nutricion} />
          )}

          {/* Días de la semana */}
          {semana.dias.map((dia) => (
            <DiaCard
              key={dia.dia}
              dia={dia}
              esPro={esPro}
              planId={plan.id}
              semana={semanaActiva}
              logsData={(weeklyLogs.find((l) => l.week_number === semanaActiva)?.completed_exercises ?? {}) as Record<string, boolean>}
            />
          ))}

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
            <div className="mt-6 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⭐</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Desbloquea el plan PRO</p>
                  <ul className="mt-2 space-y-1.5 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500">✓</span>
                      <span><strong>Rutina nutricional diaria</strong> — menú completo para cada día (desayuno, almuerzo, merienda y cena)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500">✓</span>
                      <span>Seguimiento semanal de ejercicios</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500">✓</span>
                      <span>Ajuste automático del plan</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500">✓</span>
                      <span>Planes ilimitados</span>
                    </li>
                  </ul>
                  <a
                    href="/precios"
                    className="mt-4 inline-block rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Ver planes PRO →
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Tarjeta de macros semanales (siempre visible)
function MacrosCard({ nutricion }: { nutricion: NutritionPlan }) {
  const macros = [
    { label: "Proteínas",     valor: nutricion.proteinas_g,     unit: "g", color: "bg-blue-500",   pct: Math.round((nutricion.proteinas_g * 4 / nutricion.calorias_diarias) * 100) },
    { label: "Carbohidratos", valor: nutricion.carbohidratos_g, unit: "g", color: "bg-yellow-400", pct: Math.round((nutricion.carbohidratos_g * 4 / nutricion.calorias_diarias) * 100) },
    { label: "Grasas",        valor: nutricion.grasas_g,        unit: "g", color: "bg-orange-400", pct: Math.round((nutricion.grasas_g * 9 / nutricion.calorias_diarias) * 100) },
  ];

  return (
    <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xl">🥗</span>
        <div>
          <div className="font-semibold text-gray-900">Objetivos nutricionales</div>
          <div className="text-sm font-medium text-emerald-600">{nutricion.calorias_diarias} kcal / día</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {macros.map((m) => (
          <div key={m.label} className="rounded-xl bg-gray-50 p-3 text-center">
            <div className="text-xs text-gray-500 mb-1">{m.label}</div>
            <div className="text-lg font-bold text-gray-900">
              {m.valor}<span className="text-xs font-normal text-gray-400 ml-0.5">{m.unit}</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-200">
              <div className={`h-full rounded-full ${m.color}`} style={{ width: `${m.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
      {nutricion.notas && (
        <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2">
          <p className="text-xs text-emerald-700">{nutricion.notas}</p>
        </div>
      )}
    </div>
  );
}

interface DiaCardProps {
  dia: DayPlan;
  esPro: boolean;
  planId: string;
  semana: number;
  logsData: Record<string, boolean>;
}

// Tarjeta de un día — muestra ejercicios y (si PRO) las comidas del día
function DiaCard({ dia, esPro, planId, semana, logsData }: DiaCardProps) {
  const [tab, setTab] = useState<"ejercicios" | "comidas">("ejercicios");
  const [ejercicioSeleccionado, setEjercicioSeleccionado] = useState<Exercise | null>(null);
  const esDescanso = dia.tipo === "descanso_activo";
  const tieneComidas = (dia.comidas?.length ?? 0) > 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Cabecera del día */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{TIPO_EMOJI[dia.tipo]}</span>
          <div>
            <div className="font-semibold capitalize text-gray-900">{dia.dia}</div>
            <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${TIPO_COLOR[dia.tipo]}`}>
              {dia.tipo.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Tabs ejercicios / comidas */}
        {!esDescanso && (
          <div className="flex rounded-xl border border-gray-200 p-0.5 text-xs font-medium">
            <button
              onClick={() => setTab("ejercicios")}
              className={`rounded-lg px-3 py-1.5 transition ${tab === "ejercicios" ? "bg-blue-600 text-white" : "text-gray-500 hover:text-gray-700"}`}
            >
              💪 Ejercicios
            </button>
            {esPro && tieneComidas && (
              <button
                onClick={() => setTab("comidas")}
                className={`rounded-lg px-3 py-1.5 transition ${tab === "comidas" ? "bg-emerald-600 text-white" : "text-gray-500 hover:text-gray-700"}`}
              >
                🍽️ Comidas
              </button>
            )}
          </div>
        )}

        {/* Día de descanso con comidas PRO */}
        {esDescanso && esPro && tieneComidas && (
          <button
            onClick={() => setTab(tab === "comidas" ? "ejercicios" : "comidas")}
            className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition ${tab === "comidas" ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
          >
            🍽️ Ver comidas
          </button>
        )}
      </div>

      {/* Modal de ejercicio */}
      {ejercicioSeleccionado && (
        <EjercicioModal
          ejercicio={ejercicioSeleccionado}
          onClose={() => setEjercicioSeleccionado(null)}
        />
      )}

      {/* Panel de ejercicios */}
      {tab === "ejercicios" && !esDescanso && dia.ejercicios.length > 0 && (
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
                <tr
                  key={i}
                  onClick={() => setEjercicioSeleccionado(ej)}
                  className="cursor-pointer hover:bg-blue-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-gray-900">{ej.nombre}</div>
                      <span className="text-xs text-blue-400 opacity-0 group-hover:opacity-100">ℹ</span>
                    </div>
                    {ej.notas && <div className="text-xs text-gray-400">{ej.notas}</div>}
                    <div className="text-xs text-blue-500 mt-0.5">Toca para ver explicación →</div>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">{ej.series}</td>
                  <td className="px-4 py-3 text-center text-gray-700">{ej.repeticiones}</td>
                  <td className="px-4 py-3 text-center text-gray-400">{ej.descanso_segundos}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Panel de comidas del día (solo PRO) */}
      {tab === "comidas" && esPro && tieneComidas && (
        <ComidasDia
          comidas={dia.comidas!}
          planId={planId}
          semana={semana}
          diaNombre={dia.dia}
          logsData={logsData}
        />
      )}

      {/* Banner PRO para ver comidas en usuarios FREE */}
      {!esPro && !esDescanso && (
        <div className="border-t border-dashed border-blue-100 bg-blue-50/40 px-4 py-3">
          <p className="text-xs text-blue-600">
            🍽️ <a href="/precios" className="font-medium underline-offset-2 hover:underline">Actualiza a PRO</a> para desbloquear la rutina nutricional diaria — desayuno, almuerzo, merienda y cena personalizados para este día
          </p>
        </div>
      )}
    </div>
  );
}

interface ComidasDiaProps {
  comidas: Meal[];
  planId: string;
  semana: number;
  diaNombre: string;
  logsData: Record<string, boolean>;
}

// Comidas del día con check de completado
function ComidasDia({ comidas, planId, semana, diaNombre, logsData }: ComidasDiaProps) {
  const [completadas, setCompletadas] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    comidas.forEach((c) => {
      const key = `meal_${diaNombre}_${c.nombre}`;
      init[c.nombre] = logsData[key] ?? false;
    });
    return init;
  });
  const [guardando, setGuardando] = useState<string | null>(null);

  const toggleComida = async (nombre: string) => {
    const nuevo = !completadas[nombre];
    setCompletadas((prev) => ({ ...prev, [nombre]: nuevo }));
    setGuardando(nombre);
    try {
      await fetch("/api/weekly-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_id: planId,
          week_number: semana,
          dia: diaNombre,
          completado: nuevo,
          comida: nombre,
        }),
      });
    } finally {
      setGuardando(null);
    }
  };

  const totalHechas = Object.values(completadas).filter(Boolean).length;

  return (
    <div className="border-t border-gray-100 divide-y divide-gray-50">
      {/* Progreso rápido */}
      <div className="flex items-center justify-between px-4 py-2 bg-emerald-50/50">
        <span className="text-xs text-emerald-700 font-medium">
          {totalHechas} / {comidas.length} comidas completadas
        </span>
        <div className="flex gap-1">
          {comidas.map((c) => (
            <div
              key={c.nombre}
              className={`h-1.5 w-6 rounded-full transition-all ${completadas[c.nombre] ? "bg-emerald-500" : "bg-gray-200"}`}
            />
          ))}
        </div>
      </div>

      {comidas.map((comida) => {
        const hecha = completadas[comida.nombre];
        const cargando = guardando === comida.nombre;
        return (
          <button
            key={comida.nombre}
            onClick={() => toggleComida(comida.nombre)}
            disabled={cargando}
            className={`flex w-full items-start gap-3 px-4 py-3 text-left transition ${hecha ? "bg-emerald-50/60" : "hover:bg-gray-50"}`}
          >
            {/* Checkbox */}
            <div className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition ${
              hecha ? "border-emerald-500 bg-emerald-500 text-white" : "border-gray-300"
            }`}>
              {hecha && (
                <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <span className="mt-0.5 text-lg">
              {COMIDA_EMOJI[comida.nombre] ?? "🍴"}
            </span>
            <div className="flex-1 min-w-0">
              <div className={`text-xs font-semibold uppercase tracking-wide mb-0.5 ${hecha ? "text-emerald-600" : "text-gray-500"}`}>
                {comida.nombre}
              </div>
              <div className={`text-sm ${hecha ? "text-gray-500 line-through" : "text-gray-800"}`}>
                {comida.ejemplo}
              </div>
            </div>
            <div className={`text-xs font-medium whitespace-nowrap ${hecha ? "text-emerald-500" : "text-emerald-600"}`}>
              {comida.calorias} kcal
            </div>
          </button>
        );
      })}
    </div>
  );
}

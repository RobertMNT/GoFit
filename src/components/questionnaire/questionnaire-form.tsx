"use client";

import { createClient } from "@/lib/supabase/client";
import { defaultValues, questionnaireSchema } from "@/lib/questionnaire-schema";
import type { QuestionnaireData } from "@/lib/questionnaire-schema";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { QuestionnaireStep } from "./questionnaire-step";

const TOTAL_PASOS = 9;

const TITULOS_PASO = [
  "Objetivo",
  "Experiencia",
  "Disponibilidad",
  "Lugar",
  "Equipamiento",
  "Datos físicos",
  "Actividad diaria",
  "Restricciones",
  "Dieta",
];

// Formulario multi-step del cuestionario de onboarding
export function QuestionnaireForm() {
  const router = useRouter();
  const [paso, setPaso] = useState(0);
  const [data, setData] = useState<QuestionnaireData>(defaultValues);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const actualizar = (updates: Partial<QuestionnaireData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const siguiente = () => {
    if (paso < TOTAL_PASOS - 1) setPaso((p) => p + 1);
  };

  const anterior = () => {
    if (paso > 0) setPaso((p) => p - 1);
  };

  const enviar = async () => {
    setError(null);

    // Validar con Zod antes de enviar
    const resultado = questionnaireSchema.safeParse(data);
    if (!resultado.success) {
      setError(resultado.error.issues[0].message);
      return;
    }

    setGuardando(true);
    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) throw new Error("No autenticado");

      // Asegurar que existe la fila en public.users.
      // Cubre usuarios registrados antes de ejecutar la migración SQL.
      await supabase.from("profiles").upsert(
        {
          id: userData.user.id,
          email: userData.user.email ?? "",
          full_name: userData.user.user_metadata?.full_name ?? null,
        },
        { onConflict: "id", ignoreDuplicates: true },
      );

      // Guardar cuestionario en Supabase
      const { data: questionnaire, error: insertError } = await supabase
        .from("questionnaires")
        .insert({ user_id: userData.user.id, answers: resultado.data })
        .select("id")
        .single();

      if (insertError) throw insertError;

      // Redirigir a generación del plan con el ID del cuestionario
      router.push(`/generar-plan?q=${questionnaire.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al guardar";
      setError(msg);
    } finally {
      setGuardando(false);
    }
  };

  const progreso = Math.round(((paso + 1) / TOTAL_PASOS) * 100);
  const esUltimoPaso = paso === TOTAL_PASOS - 1;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Cabecera con progreso */}
      <header className="border-b border-gray-200 bg-white px-4 py-4">
        <div className="mx-auto max-w-lg">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Paso {paso + 1} de {TOTAL_PASOS} — {TITULOS_PASO[paso]}
            </span>
            <span className="text-sm text-gray-400">{progreso}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-violet-600 transition-all duration-300"
              style={{ width: `${progreso}%` }}
            />
          </div>
        </div>
      </header>

      {/* Contenido del paso */}
      <main className="flex flex-1 items-start justify-center px-4 py-8">
        <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-sm">
          <QuestionnaireStep step={paso} data={data} onChange={actualizar} />

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}
        </div>
      </main>

      {/* Botones de navegación */}
      <footer className="border-t border-gray-200 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-lg justify-between gap-3">
          <button
            onClick={anterior}
            disabled={paso === 0}
            className="rounded-xl border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-30"
          >
            Anterior
          </button>

          {esUltimoPaso ? (
            <button
              onClick={enviar}
              disabled={guardando}
              className="flex-1 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50"
            >
              {guardando ? "Guardando..." : "Generar mi plan ✨"}
            </button>
          ) : (
            <button
              onClick={siguiente}
              className="flex-1 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
            >
              Siguiente
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}

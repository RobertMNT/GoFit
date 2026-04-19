import { createHash } from "crypto";
import { createServiceClient } from "@/lib/supabase/service";
import type { QuestionnaireData } from "@/lib/questionnaire-schema";

// ── Ejercicios ──────────────────────────────────────────────────────────────

// Normaliza el nombre del ejercicio para usar como clave de caché
function normalizarNombreEjercicio(nombre: string): string {
  return nombre
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // eliminar tildes
    .replace(/\s+/g, " ");
}

export async function getEjercicioCache(nombre: string): Promise<Record<string, unknown> | null> {
  const clave = normalizarNombreEjercicio(nombre);
  const service = createServiceClient();

  const { data } = await service
    .from("exercise_cache")
    .select("id, data")
    .eq("nombre", clave)
    .maybeSingle();

  if (!data) return null;

  // Incrementar hit_count en background (no bloquea la respuesta)
  service
    .from("exercise_cache")
    .update({ hit_count: ((data as unknown as { hit_count: number }).hit_count ?? 0) + 1 })
    .eq("id", data.id)
    .then(() => {});

  return data.data as Record<string, unknown>;
}

export async function setEjercicioCache(
  nombre: string,
  data: Record<string, unknown>,
): Promise<void> {
  const clave = normalizarNombreEjercicio(nombre);
  const service = createServiceClient();

  await service
    .from("exercise_cache")
    .upsert({ nombre: clave, data }, { onConflict: "nombre" });
}

// ── Planes ──────────────────────────────────────────────────────────────────

// Buckea valores continuos para aumentar los hits de caché
function bucketEdad(edad: number): string {
  if (edad < 26) return "16-25";
  if (edad < 36) return "26-35";
  if (edad < 46) return "36-45";
  if (edad < 56) return "46-55";
  return "56+";
}
function bucketPeso(kg: number): string {
  if (kg < 60) return "<60";
  if (kg <= 80) return "60-80";
  if (kg <= 100) return "81-100";
  return ">100";
}
function bucketAltura(cm: number): string {
  if (cm < 165) return "<165";
  if (cm <= 180) return "165-180";
  return ">180";
}

// Genera la clave de caché para un plan
// Solo se cachea cuando NO hay restricciones libres (texto único por usuario)
export function buildPlanCacheKey(
  answers: QuestionnaireData,
  esPro: boolean,
): string | null {
  // Si hay texto libre de restricciones, no se puede reutilizar entre usuarios
  if (answers.restricciones.trim() || answers.restricciones_alimentarias.trim()) {
    return null;
  }

  const canonical = JSON.stringify({
    objetivo: answers.objetivo,
    nivel: answers.nivel,
    dias_por_semana: answers.dias_por_semana,
    duracion_sesion: answers.duracion_sesion,
    lugar_entreno: [...answers.lugar_entreno].sort(),
    equipamiento: [...answers.equipamiento].sort(),
    nivel_actividad_diaria: answers.nivel_actividad_diaria,
    preferencia_dieta: answers.preferencia_dieta,
    sexo: answers.sexo,
    edad: bucketEdad(answers.edad),
    peso: bucketPeso(answers.peso_kg),
    altura: bucketAltura(answers.altura_cm),
    es_pro: esPro,
  });

  return createHash("sha256").update(canonical).digest("hex");
}

export async function getPlanCache(hash: string): Promise<Record<string, unknown> | null> {
  const service = createServiceClient();

  const { data } = await service
    .from("plan_cache")
    .select("plan_data, hit_count")
    .eq("answers_hash", hash)
    .maybeSingle();

  if (!data) return null;

  // Incrementar hit_count en background
  service
    .from("plan_cache")
    .update({ hit_count: (data.hit_count ?? 0) + 1 })
    .eq("answers_hash", hash)
    .then(() => {});

  return data.plan_data as Record<string, unknown>;
}

export async function setPlanCache(
  hash: string,
  planData: Record<string, unknown>,
): Promise<void> {
  const service = createServiceClient();

  await service
    .from("plan_cache")
    .upsert({ answers_hash: hash, plan_data: planData }, { onConflict: "answers_hash" });
}

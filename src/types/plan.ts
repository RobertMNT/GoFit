import { z } from "zod";

// Schema Zod para validar la respuesta JSON de la IA

// Schema de una comida
export const mealSchema = z.object({
  nombre: z.string().min(1),          // ej: "Desayuno"
  calorias: z.number().int().min(0),
  ejemplo: z.string().min(1),         // descripción del plato ejemplo
});

export const exerciseSchema = z.object({
  nombre: z.string().min(1),
  series: z.number().int().min(1),
  repeticiones: z.string().min(1),
  descanso_segundos: z.number().int().min(0),
  notas: z.string().nullable(),
});

export const dayPlanSchema = z.object({
  dia: z.string().min(1),
  tipo: z.enum(["fuerza", "cardio", "flexibilidad", "descanso_activo"]),
  comidas: z.array(mealSchema).optional(), // comidas del día — solo en planes nuevos
  ejercicios: z.array(exerciseSchema),
});

// Schema del plan nutricional semanal (macros + notas — las comidas van por día)
export const nutritionPlanSchema = z.object({
  calorias_diarias: z.number().int().min(0),
  proteinas_g: z.number().min(0),
  carbohidratos_g: z.number().min(0),
  grasas_g: z.number().min(0),
  notas: z.string(),
  comidas: z.array(mealSchema).optional(), // mantenido por compatibilidad con planes anteriores
});

export const weeklyPlanSchema = z.object({
  semana: z.number().int().min(1),
  dias: z.array(dayPlanSchema).min(1),
  nutricion: nutritionPlanSchema,
});

export const fitnessPlanResponseSchema = z.object({
  nombre: z.string().min(1),
  descripcion: z.string().min(1),
  duracion_semanas: z.number().int().min(1),
  semanas: z.array(weeklyPlanSchema).min(1),
});

export type FitnessPlanResponse = z.infer<typeof fitnessPlanResponseSchema>;
export type Exercise = z.infer<typeof exerciseSchema>;
export type DayPlan = z.infer<typeof dayPlanSchema>;
export type Meal = z.infer<typeof mealSchema>;
export type NutritionPlan = z.infer<typeof nutritionPlanSchema>;
export type WeeklyPlan = z.infer<typeof weeklyPlanSchema>;

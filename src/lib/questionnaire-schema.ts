import { z } from "zod";

// Esquema Zod del cuestionario — validado antes de enviarse a Supabase
export const questionnaireSchema = z.object({
  objetivo: z.enum(["perder_peso", "ganar_musculo", "mejorar_resistencia", "bienestar_general"]),
  nivel: z.enum(["principiante", "intermedio", "avanzado"]),
  dias_por_semana: z.number().int().min(2).max(5),
  duracion_sesion: z.number().int().min(20).max(120),
  lugar_entreno: z.enum(["casa", "gimnasio", "exterior"]),
  equipamiento: z.array(z.string()).min(1, "Selecciona al menos una opción"),
  restricciones: z.string().max(500),
  edad: z.number().int().min(16).max(80),
  sexo: z.enum(["hombre", "mujer", "prefiero_no_decirlo"]),
  peso_kg: z.number().min(30).max(250),
  altura_cm: z.number().int().min(130).max(230),
  nivel_actividad_diaria: z.enum(["sedentario", "ligero", "moderado", "activo"]),
  preferencia_dieta: z.enum(["sin_restriccion", "vegetariano", "vegano", "sin_gluten", "sin_lactosa", "sin_cerdo"]),
  restricciones_alimentarias: z.string().max(300),
});

export type QuestionnaireData = z.infer<typeof questionnaireSchema>;

// Valores por defecto del formulario
export const defaultValues: QuestionnaireData = {
  objetivo: "bienestar_general",
  nivel: "principiante",
  dias_por_semana: 3,
  duracion_sesion: 45,
  lugar_entreno: "casa",
  equipamiento: ["sin_equipamiento"],
  restricciones: "",
  edad: 30,
  sexo: "prefiero_no_decirlo",
  peso_kg: 70,
  altura_cm: 170,
  nivel_actividad_diaria: "sedentario",
  preferencia_dieta: "sin_restriccion",
  restricciones_alimentarias: "",
};

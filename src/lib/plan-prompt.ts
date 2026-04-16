import type { QuestionnaireData } from "./questionnaire-schema";

// Descripción legible de las opciones del cuestionario
const OBJETIVOS: Record<string, string> = {
  perder_peso: "perder peso y reducir grasa corporal",
  ganar_musculo: "ganar masa muscular e hipertrofia",
  mejorar_resistencia: "mejorar la resistencia cardiovascular y la capacidad aeróbica",
  bienestar_general: "mejorar el bienestar general, la salud y la condición física",
};

const NIVELES: Record<string, string> = {
  principiante: "principiante (menos de 6 meses de experiencia)",
  intermedio: "intermedio (6 meses a 2 años)",
  avanzado: "avanzado (más de 2 años entrenando)",
};

const ACTIVIDAD: Record<string, string> = {
  sedentario: "sedentario (trabajo de oficina, poco movimiento)",
  ligero: "ligero (camina un poco al día)",
  moderado: "moderado (activo durante el día)",
  activo: "muy activo (trabajo físico o mucho deporte fuera del plan)",
};

const DIETA: Record<string, string> = {
  sin_restriccion: "sin restricciones alimentarias",
  vegetariano: "vegetariano (sin carne ni pescado)",
  vegano: "vegano (solo alimentos de origen vegetal)",
  sin_gluten: "sin gluten (intolerante al gluten / celiaco)",
  sin_lactosa: "sin lactosa (intolerante a la lactosa)",
  sin_cerdo: "sin cerdo ni derivados",
};

// Construye el prompt del sistema para la generación de planes
export function buildPlanPrompt(answers: QuestionnaireData): string {
  const equipamientoLista = answers.equipamiento.join(", ");
  const restriccionesTexto =
    answers.restricciones.trim() || "ninguna lesión o restricción indicada";
  const restriccionesAlimentarias =
    answers.restricciones_alimentarias?.trim() || "ninguna";

  return `Eres un entrenador personal y nutricionista certificado, experto en programación de entrenamientos y planes nutricionales.
Tu tarea es crear un plan completo de entrenamiento + dieta personalizado en formato JSON estructurado.

## Perfil del usuario
- Objetivo: ${OBJETIVOS[answers.objetivo]}
- Nivel: ${NIVELES[answers.nivel]}
- Días disponibles por semana: ${answers.dias_por_semana}
- Duración por sesión: ${answers.duracion_sesion} minutos
- Lugar de entrenamiento: ${Array.isArray(answers.lugar_entreno) ? answers.lugar_entreno.join(", ") : answers.lugar_entreno}
- Equipamiento disponible: ${equipamientoLista}
- Sexo: ${answers.sexo}
- Edad: ${answers.edad} años
- Peso: ${answers.peso_kg} kg
- Altura: ${answers.altura_cm} cm
- Nivel de actividad diaria: ${ACTIVIDAD[answers.nivel_actividad_diaria]}
- Restricciones/lesiones: ${restriccionesTexto}
- Preferencia de dieta: ${DIETA[answers.preferencia_dieta ?? "sin_restriccion"]}
- Alergias u otros alimentos a evitar: ${restriccionesAlimentarias}

## Instrucciones para el entrenamiento
1. Crea un plan de 4 semanas de duración
2. Distribuye los ${answers.dias_por_semana} días de entrenamiento semanales de forma óptima
3. Cada sesión debe caber en ${answers.duracion_sesion} minutos
4. Adapta todos los ejercicios al equipamiento disponible y al lugar de entrenamiento
5. Evita ejercicios que puedan agravar las restricciones indicadas
6. Progresión gradual de semana en semana (volumen e intensidad)
7. Máximo 5 ejercicios por sesión — sé conciso pero completo

## Instrucciones para la nutrición
1. Calcula las calorías diarias usando la fórmula de Mifflin-St Jeor ajustada al objetivo
2. Distribuye macronutrientes según el objetivo (más proteína para ganar músculo, déficit moderado para perder peso, etc.)
3. Una sola nota de nutrición breve (máx 2 frases) a nivel semana
4. Para CADA día de la semana (incluyendo días de descanso), incluye exactamente 4 comidas diferentes: Desayuno, Almuerzo, Merienda y Cena
5. Las comidas deben variar de un día a otro — no repitas el mismo plato en la misma semana
6. Las comidas de días de entrenamiento deben tener más carbohidratos pre-entreno; las de descanso más proteína y menos carbos
7. Respeta la preferencia de dieta y evita los alimentos indicados
8. Las calorías de las 4 comidas deben sumar aproximadamente el total diario

## Formato de respuesta — SOLO JSON, sin texto adicional

Responde ÚNICAMENTE con un objeto JSON que siga esta estructura exacta:

{
  "nombre": "string — nombre motivador del plan (ej: 'Plan Fuerza Base 6 semanas')",
  "descripcion": "string — descripción de 2-3 líneas del plan, qué conseguirá el usuario",
  "duracion_semanas": number,
  "semanas": [
    {
      "semana": 1,
      "nutricion": {
        "calorias_diarias": number,
        "proteinas_g": number,
        "carbohidratos_g": number,
        "grasas_g": number,
        "notas": "string — 1-2 consejos clave de nutrición para esta semana"
      },
      "dias": [
        {
          "dia": "lunes",
          "tipo": "fuerza | cardio | flexibilidad | descanso_activo",
          "comidas": [
            {
              "nombre": "Desayuno | Almuerzo | Merienda | Cena",
              "calorias": number,
              "ejemplo": "string — descripción concisa del plato, ej: 'Avena con leche, plátano y nueces'"
            }
          ],
          "ejercicios": [
            {
              "nombre": "string",
              "series": number,
              "repeticiones": "string (ej: '8-12' o '45 segundos')",
              "descanso_segundos": number,
              "notas": "string | null — técnica o progresión importante"
            }
          ]
        }
      ]
    }
  ]
}

IMPORTANTE:
- Los días de descanso: tipo "descanso_activo" y array ejercicios vacío
- Las repeticiones siempre como string
- La nutrición puede variar ligeramente entre semanas si hay progresión
- El JSON debe ser válido y parseable directamente
- No incluyas markdown, explicaciones ni texto fuera del JSON`;
}

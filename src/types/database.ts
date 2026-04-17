// Tipos que reflejan el esquema real de Supabase

export type UserRole = "free" | "pro";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  stripe_customer_id: string | null;
  blocked: boolean;
  pro_expires_at: string | null;
  created_at: string;
}

export interface Questionnaire {
  id: string;
  user_id: string;
  answers: QuestionnaireAnswers;
  created_at: string;
}

export interface QuestionnaireAnswers {
  objetivo: string;
  nivel: string;
  dias_por_semana: number;
  duracion_sesion: number;
  lugar_entreno: string;
  equipamiento: string[];
  restricciones: string;
  edad: number;
  sexo: string;
  peso_kg: number;
  altura_cm: number;
  nivel_actividad_diaria: string;
}

export interface FitnessPlan {
  id: string;
  user_id: string;
  questionnaire_id: string | null;
  nombre: string;
  descripcion: string;
  duracion_semanas: number;
  semanas: WeeklyPlan[];
  created_at: string;
}

export interface Meal {
  nombre: string;
  calorias: number;
  ejemplo: string;
}

export interface NutritionPlan {
  calorias_diarias: number;
  proteinas_g: number;
  carbohidratos_g: number;
  grasas_g: number;
  notas: string;
  comidas?: Meal[]; // opcional — planes nuevos tienen comidas por día
}

export interface WeeklyPlan {
  semana: number;
  nutricion: NutritionPlan;
  dias: DayPlan[];
}

export interface DayPlan {
  dia: string;
  tipo: string;
  comidas?: Meal[]; // comidas del día — solo en planes generados con formato nuevo
  ejercicios: Exercise[];
}

export interface Exercise {
  nombre: string;
  series: number;
  repeticiones: string;
  descanso_segundos: number;
  notas: string | null;
}

// Refleja la tabla real: una fila por semana, completados en jsonb
export interface WeeklyLog {
  id: string;
  user_id: string;
  plan_id: string;
  week_number: number;
  completed_exercises: Record<string, boolean> | null;
  notes: string | null;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  status: SubscriptionStatus;
  price_id: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
}

export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "past_due"
  | "trialing"
  | "unpaid";

import { PlanView } from "@/components/plan/plan-view";
import { createClient } from "@/lib/supabase/server";
import type { FitnessPlan, WeeklyLog } from "@/types/database";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("plans").select("nombre").eq("id", id).single();

  return {
    title: data?.nombre ?? "Tu plan de entrenamiento",
  };
}

// Página de detalle del plan — renderizada en servidor
export default async function PlanPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  // Obtener usuario y su rol
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // RLS garantiza que solo el propietario puede ver su plan
  const { data: plan, error } = await supabase
    .from("plans")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !plan) notFound();

  // Para usuarios PRO, obtener todos los logs de seguimiento del plan
  let weeklyLogs: WeeklyLog[] = [];
  if (profile?.role === "pro") {
    const { data: logs } = await supabase
      .from("weekly_logs")
      .select("*")
      .eq("plan_id", id)
      .eq("user_id", user.id);

    weeklyLogs = (logs ?? []) as WeeklyLog[];
  }

  return (
    <PlanView
      plan={plan as unknown as FitnessPlan}
      esPro={profile?.role === "pro"}
      weeklyLogs={weeklyLogs}
    />
  );
}

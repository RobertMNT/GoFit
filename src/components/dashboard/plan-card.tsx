import type { FitnessPlan } from "@/types/database";
import Link from "next/link";

interface PlanCardProps {
  plan: Pick<FitnessPlan, "id" | "nombre" | "descripcion" | "duracion_semanas" | "created_at">;
}

// Tarjeta de resumen de un plan en el historial del dashboard
export function PlanCard({ plan }: PlanCardProps) {
  const fecha = new Date(plan.created_at).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Link
      href={`/plan/${plan.id}`}
      className="block rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-md"
    >
      <h3 className="font-semibold text-gray-900">{plan.nombre}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-gray-500">{plan.descripcion}</p>
      <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
        <span>📅 {plan.duracion_semanas} semanas</span>
        <span>{fecha}</span>
      </div>
    </Link>
  );
}

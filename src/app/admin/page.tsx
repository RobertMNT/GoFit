import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { Metadata } from "next";
import Stripe from "stripe";

export const metadata: Metadata = { title: "Admin · Dashboard" };

function eur(cents: number) {
  return (cents / 100).toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}

function fechaCorta(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

export default async function AdminPage() {
  const supabase = await createClient();
  const service = createServiceClient();

  const ahora = new Date();
  const hace7dias = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const hace30dias = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // ── Estadísticas globales ──────────────────────────────────
  const [
    { count: totalUsuarios },
    { count: usuariosPro },
    { count: planesGenerados },
    { count: nuevosUsuarios },
    { count: nuevosPlanes7d },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "pro"),
    supabase.from("plans").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", hace7dias),
    supabase.from("plans").select("id", { count: "exact", head: true }).gte("created_at", hace7dias),
  ]);

  // ── Usuarios nuevos por día (últimos 7 días) ───────────────
  const { data: registrosDia } = await service
    .from("profiles")
    .select("created_at")
    .gte("created_at", hace7dias)
    .order("created_at", { ascending: true });

  // Agrupar por día
  const registrosPorDia: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(ahora);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    registrosPorDia[key] = 0;
  }
  registrosDia?.forEach(({ created_at }) => {
    const key = created_at.slice(0, 10);
    if (key in registrosPorDia) registrosPorDia[key]++;
  });

  // ── Usuarios que han hecho check-in esta semana ────────────
  const { data: checkinsSemana } = await service
    .from("weekly_logs")
    .select("user_id, created_at")
    .gte("created_at", hace7dias);

  const usuariosConCheckin = new Set(checkinsSemana?.map((l) => l.user_id) ?? []);

  // Obtener perfiles de esos usuarios
  let perfilesConCheckin: { id: string; email: string; full_name: string | null; role: string }[] = [];
  if (usuariosConCheckin.size > 0) {
    const { data } = await service
      .from("profiles")
      .select("id, email, full_name, role")
      .in("id", [...usuariosConCheckin]);
    perfilesConCheckin = data ?? [];
  }

  // ── Planes por día (últimos 7 días) ───────────────────────
  const { data: planesDiaData } = await service
    .from("plans")
    .select("created_at")
    .gte("created_at", hace7dias);

  const planesPorDia: Record<string, number> = { ...Object.fromEntries(Object.keys(registrosPorDia).map((k) => [k, 0])) };
  planesDiaData?.forEach(({ created_at }) => {
    const key = created_at.slice(0, 10);
    if (key in planesPorDia) planesPorDia[key]++;
  });

  // ── Ingresos Stripe ────────────────────────────────────────
  let mrr = 0;
  let ingresosMes = 0;
  let suscripcionesActivas = 0;

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-03-25.dahlia" });
    const [subscriptions, charges] = await Promise.all([
      stripe.subscriptions.list({ status: "active", limit: 100 }),
      stripe.charges.list({ limit: 100, created: { gte: Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60 } }),
    ]);

    suscripcionesActivas = subscriptions.data.length;
    mrr = subscriptions.data.reduce((sum, s) => {
      const item = s.items.data[0];
      if (!item?.price.unit_amount) return sum;
      return sum + (item.price.recurring?.interval === "year"
        ? Math.round(item.price.unit_amount / 12)
        : item.price.unit_amount);
    }, 0);
    ingresosMes = charges.data
      .filter((c) => c.status === "succeeded")
      .reduce((sum, c) => sum + c.amount, 0);
  } catch { /* Stripe no configurado */ }

  const conversion = totalUsuarios ? Math.round(((usuariosPro ?? 0) / totalUsuarios) * 100) : 0;

  const stats = [
    { label: "Usuarios totales",      value: totalUsuarios ?? 0,     icon: "👥", color: "bg-blue-50   text-blue-700" },
    { label: "Usuarios PRO",          value: usuariosPro ?? 0,        icon: "⭐", color: "bg-yellow-50 text-yellow-700" },
    { label: "Conversión FREE→PRO",   value: `${conversion}%`,        icon: "📈", color: "bg-green-50  text-green-700" },
    { label: "Planes generados",      value: planesGenerados ?? 0,    icon: "📋", color: "bg-violet-50 text-violet-700" },
    { label: "Nuevos usuarios (7d)",  value: nuevosUsuarios ?? 0,     icon: "🆕", color: "bg-emerald-50 text-emerald-700" },
    { label: "Planes nuevos (7d)",    value: nuevosPlanes7d ?? 0,     icon: "⚡", color: "bg-orange-50 text-orange-700" },
    { label: "Suscripciones activas", value: suscripcionesActivas,    icon: "💳", color: "bg-indigo-50 text-indigo-700" },
    { label: "Check-ins esta semana", value: usuariosConCheckin.size, icon: "✅", color: "bg-teal-50   text-teal-700" },
  ];

  const dias = Object.entries(registrosPorDia);
  const maxReg = Math.max(...Object.values(registrosPorDia), 1);
  const maxPlan = Math.max(...Object.values(planesPorDia), 1);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mb-8 text-sm text-gray-500">Resumen general de ZapFit</p>

      {/* Stats grid */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">{s.label}</p>
              <span className={`rounded-lg px-1.5 py-0.5 text-xs font-semibold ${s.color}`}>{s.icon}</span>
            </div>
            <p className="mt-2 text-2xl font-black text-gray-900">{typeof s.value === "number" ? s.value.toLocaleString("es-ES") : s.value}</p>
          </div>
        ))}
      </div>

      {/* Ingresos Stripe */}
      <h2 className="mb-4 text-base font-semibold text-gray-800">Ingresos</h2>
      <div className="mb-8 grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">MRR estimado</p>
          <p className="mt-2 text-3xl font-black text-gray-900">{mrr ? eur(mrr) : "—"}</p>
          <p className="mt-1 text-xs text-gray-400">Ingresos recurrentes mensuales</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Cobros últimos 30 días</p>
          <p className="mt-2 text-3xl font-black text-gray-900">{ingresosMes ? eur(ingresosMes) : "—"}</p>
          <p className="mt-1 text-xs text-gray-400">Total cobros exitosos</p>
        </div>
      </div>

      {/* Gráficas de barras últimos 7 días */}
      <div className="mb-8 grid grid-cols-2 gap-4">
        {/* Usuarios nuevos */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="mb-4 text-sm font-semibold text-gray-800">Registros últimos 7 días</p>
          <div className="flex items-end gap-2 h-24">
            {dias.map(([fecha, count]) => (
              <div key={fecha} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-xs font-bold text-blue-700">{count > 0 ? count : ""}</span>
                <div
                  className="w-full rounded-t-md bg-blue-500 transition-all"
                  style={{ height: `${Math.max(4, (count / maxReg) * 72)}px` }}
                />
                <span className="text-[10px] text-gray-400">
                  {new Date(fecha).toLocaleDateString("es-ES", { weekday: "short" })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Planes generados */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="mb-4 text-sm font-semibold text-gray-800">Planes generados últimos 7 días</p>
          <div className="flex items-end gap-2 h-24">
            {Object.entries(planesPorDia).map(([fecha, count]) => (
              <div key={fecha} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-xs font-bold text-violet-700">{count > 0 ? count : ""}</span>
                <div
                  className="w-full rounded-t-md bg-violet-500 transition-all"
                  style={{ height: `${Math.max(4, (count / maxPlan) * 72)}px` }}
                />
                <span className="text-[10px] text-gray-400">
                  {new Date(fecha).toLocaleDateString("es-ES", { weekday: "short" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabla de check-ins esta semana */}
      <h2 className="mb-4 text-base font-semibold text-gray-800">
        Seguimientos esta semana ({usuariosConCheckin.size})
      </h2>
      {perfilesConCheckin.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-400">
              <tr>
                <th className="px-5 py-3 text-left">Usuario</th>
                <th className="px-5 py-3 text-center">Plan</th>
                <th className="px-5 py-3 text-center">Último check-in</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {perfilesConCheckin.map((p) => {
                const ultimoCheckin = checkinsSemana
                  ?.filter((l) => l.user_id === p.id)
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
                return (
                  <tr key={p.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-gray-900">{p.full_name ?? "—"}</div>
                      <div className="text-xs text-gray-400">{p.email}</div>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                        p.role === "pro" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-500"
                      }`}>
                        {p.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center text-xs text-gray-500">
                      {fechaCorta(ultimoCheckin?.created_at ?? null)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center">
          <p className="text-sm text-gray-400">Ningún usuario ha hecho check-in esta semana</p>
        </div>
      )}
    </div>
  );
}

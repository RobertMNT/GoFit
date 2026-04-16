import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import Stripe from "stripe";

export const metadata: Metadata = { title: "Admin · Dashboard" };

// Formatea euros
function eur(cents: number) {
  return (cents / 100).toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}

export default async function AdminPage() {
  const supabase = await createClient();

  // ── Estadísticas de usuarios ───────────────────────────────
  const [{ count: totalUsuarios }, { count: usuariosPro }, { count: planesGenerados }] =
    await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "pro"),
      supabase.from("plans").select("id", { count: "exact", head: true }),
    ]);

  const usuariosLibres = (totalUsuarios ?? 0) - (usuariosPro ?? 0);

  // ── Registros últimos 7 días ───────────────────────────────
  const hace7dias = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { count: nuevosUsuarios } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .gte("created_at", hace7dias);

  // ── Ingresos Stripe ────────────────────────────────────────
  let mrr = 0;
  let ingresosMes = 0;
  let suscripcionesActivas = 0;

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-03-25.dahlia" });

    const [subscriptions, charges] = await Promise.all([
      stripe.subscriptions.list({ status: "active", limit: 100 }),
      stripe.charges.list({
        limit: 100,
        created: { gte: Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60 },
      }),
    ]);

    suscripcionesActivas = subscriptions.data.length;
    mrr = subscriptions.data.reduce((sum, s) => {
      const item = s.items.data[0];
      if (!item?.price.unit_amount) return sum;
      const amount = item.price.unit_amount;
      return sum + (item.price.recurring?.interval === "year" ? Math.round(amount / 12) : amount);
    }, 0);

    ingresosMes = charges.data
      .filter((c) => c.status === "succeeded")
      .reduce((sum, c) => sum + c.amount, 0);
  } catch {
    // Stripe no configurado o error de red — se muestra "—"
  }

  const stats = [
    { label: "Usuarios totales",    value: totalUsuarios ?? 0,    icon: "👥", color: "bg-blue-50   text-blue-700" },
    { label: "Usuarios PRO",        value: usuariosPro ?? 0,       icon: "⭐", color: "bg-yellow-50 text-yellow-700" },
    { label: "Usuarios FREE",       value: usuariosLibres,         icon: "🆓", color: "bg-gray-50   text-gray-700" },
    { label: "Planes generados",    value: planesGenerados ?? 0,   icon: "📋", color: "bg-violet-50 text-violet-700" },
    { label: "Nuevos (7 días)",     value: nuevosUsuarios ?? 0,    icon: "🆕", color: "bg-emerald-50 text-emerald-700" },
    { label: "Suscripciones activas", value: suscripcionesActivas, icon: "💳", color: "bg-indigo-50 text-indigo-700" },
  ];

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mb-8 text-sm text-gray-500">Resumen general de ZapFit</p>

      {/* Stats grid */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{s.label}</p>
              <span className={`rounded-lg px-2 py-0.5 text-xs font-semibold ${s.color}`}>{s.icon}</span>
            </div>
            <p className="mt-2 text-3xl font-black text-gray-900">{s.value.toLocaleString("es-ES")}</p>
          </div>
        ))}
      </div>

      {/* Ingresos Stripe */}
      <h2 className="mb-4 text-lg font-semibold text-gray-800">Ingresos</h2>
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

      {/* Enlace a analytics */}
      <div className="rounded-2xl border border-dashed border-gray-200 p-5 text-center">
        <p className="text-sm text-gray-500">
          Para estadísticas de visitas, consulta{" "}
          <a
            href="https://vercel.com/analytics"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-blue-600 hover:underline"
          >
            Vercel Analytics
          </a>
          {" "}en el dashboard de tu proyecto.
        </p>
      </div>
    </div>
  );
}

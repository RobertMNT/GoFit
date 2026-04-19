import { PlanCard } from "@/components/dashboard/plan-card";
import { StreakWidget } from "@/components/dashboard/streak-widget";
import { UpgradeBanner } from "@/components/dashboard/upgrade-banner";
import { WelcomeScreen } from "@/components/dashboard/welcome-screen";
import { isAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import type { FitnessPlan, UserProfile } from "@/types/database";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ upgrade?: string }>;
}) {
  const { upgrade } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Obtener perfil y planes en paralelo
  const [{ data: profile }, { data: plans }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("plans")
      .select("id, nombre, descripcion, duracion_semanas, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const userProfile = profile as UserProfile | null;
  const userPlans = (plans ?? []) as Pick<
    FitnessPlan,
    "id" | "nombre" | "descripcion" | "duracion_semanas" | "created_at"
  >[];

  const esPro = userProfile?.role === "pro";
  const nombreUsuario = userProfile?.full_name ?? user.email ?? "Usuario";
  const esAdmin = isAdmin(user.email);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-10">
        {/* Banner de upgrade exitoso */}
        {upgrade === "success" && <UpgradeBanner />}

        {/* Pantalla de bienvenida — solo para usuarios sin planes */}
        {userPlans.length === 0 && <WelcomeScreen />}

        {/* Racha de días — visible siempre que haya algún plan */}
        {userPlans.length > 0 && <StreakWidget />}

        {/* Saludo */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Hola, {nombreUsuario.split(" ")[0]} 👋
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {esPro ? "Plan PRO activo" : "Plan Free"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50"
            >
              ← Inicio
            </Link>
            {!esPro && (
              <Link
                href="/precios"
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Actualizar a PRO
              </Link>
            )}
            {esAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50"
                title="Panel de administración"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Admin
              </Link>
            )}
            <Link
              href="/perfil"
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50"
              title="Mi cuenta"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              Mi cuenta
            </Link>
          </div>
        </div>

        {/* Acceso rápido al plan más reciente */}
        {userPlans.length > 0 && (
          <Link
            href={`/plan/${userPlans[0].id}`}
            className="mb-8 flex items-center justify-between rounded-2xl bg-white border border-gray-200 px-5 py-4 shadow-sm transition hover:border-blue-300 hover:shadow-md"
          >
            <div className="min-w-0">
              <p className="text-xs font-medium text-blue-600 mb-0.5">Plan activo</p>
              <p className="font-semibold text-gray-900 truncate">{userPlans[0].nombre}</p>
              <p className="mt-0.5 text-xs text-gray-400 line-clamp-1">{userPlans[0].descripcion}</p>
            </div>
            <svg className="ml-4 h-5 w-5 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}

        {/* CTA nuevo plan */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Mis planes ({userPlans.length})
          </h2>
          {(esPro || userPlans.length === 0) && (
            <Link
              href="/onboarding"
              className="rounded-xl border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
            >
              + Nuevo plan
            </Link>
          )}
        </div>

        {/* Lista de planes */}
        {userPlans.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 p-16 text-center">
            <div className="text-5xl">🏋️</div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              Aún no tienes ningún plan
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Responde unas preguntas y crearemos tu plan personalizado
            </p>
            <Link
              href="/onboarding"
              className="mt-6 inline-block rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Crear mi primer plan ✨
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {userPlans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}

            {/* Bloqueo FREE cuando ya tiene un plan */}
            {!esPro && userPlans.length >= 1 && (
              <Link
                href="/precios"
                className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50 p-8 text-center transition hover:border-blue-400"
              >
                <span className="text-3xl">🔒</span>
                <p className="mt-3 text-sm font-medium text-blue-700">
                  Planes ilimitados con PRO
                </p>
                <p className="mt-1 text-xs text-blue-500">Desde 9,99€/mes</p>
              </Link>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

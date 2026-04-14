import Link from "next/link";
import type { Metadata } from "next";
import { HeroWrapper } from "@/components/landing/hero-wrapper";
import { ScrollSections } from "@/components/landing/scroll-sections";
import { GoFitLogo } from "@/components/ui/gofit-logo";

export const metadata: Metadata = {
  title: "GoFit — Planes de entrenamiento 100% personalizados",
  description: "Crea tu plan de entrenamiento personalizado adaptado a tu cuerpo y objetivos. Gratis para empezar.",
};

const PASOS = [
  { n: "01", icon: "📋", titulo: "Cuéntanos sobre ti",      desc: "Objetivo, nivel, equipamiento y horario. 8 preguntas en 2 minutos." },
  { n: "02", icon: "💡", titulo: "Recibe tu plan",          desc: "Analizamos tu perfil y diseñamos un programa de semanas adaptado exactamente a ti." },
  { n: "03", icon: "📈", titulo: "Entrena y evoluciona",    desc: "Marca tus sesiones. El plan ajusta la carga de la siguiente semana según tu progreso real." },
];

const FEATURES = [
  { icon: "🎯", titulo: "100% personalizado",      desc: "No es una plantilla. Cada ejercicio y serie está pensado para tu cuerpo y objetivo." },
  { icon: "💪", titulo: "Progresión automática",   desc: "Intensidad creciente semana a semana para que nunca dejes de progresar." },
  { icon: "✅", titulo: "Seguimiento semanal",     desc: "Marca los días completados y lleva un registro real de tu constancia." },
  { icon: "🔄", titulo: "Ajuste automático",       desc: "Según tu progreso, el plan recalibra la carga y el volumen de la siguiente semana." },
  { icon: "🏠", titulo: "Cualquier lugar",         desc: "Casa, gimnasio o exterior. Con o sin equipamiento. El plan se adapta." },
  { icon: "🔒", titulo: "RGPD compliant",          desc: "Tus datos son tuyos. Almacenados en Europa, nunca compartidos." },
];

export default function HomePage() {
  return (
    <div className="bg-[#020817] text-white">

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-[#020817]/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5 lg:px-16">
          <GoFitLogo height={28} />
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-400 transition hover:text-white">
              Iniciar sesión
            </Link>
            <Link
              href="/registro"
              className="rounded-xl border border-blue-500/40 bg-blue-600/20 px-5 py-2 text-sm font-semibold text-blue-300 backdrop-blur-sm transition hover:bg-blue-600 hover:text-white hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]"
            >
              Empezar gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero 3D ─────────────────────────────────────────────────────────── */}
      <HeroWrapper />

      {/* ── Secciones interactivas scroll ──────────────────────────────────── */}
      <ScrollSections />

      {/* ── Cómo funciona ───────────────────────────────────────────────────── */}
      <section className="relative px-6 py-32 lg:px-16">
        {/* Grid de fondo */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-blue-500">Proceso</p>
            <h2 className="text-4xl font-black tracking-tight sm:text-5xl">
              Tu plan en{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                3 pasos
              </span>
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {PASOS.map((paso, i) => (
              <div
                key={paso.n}
                className="group relative overflow-hidden rounded-3xl border border-white/6 bg-white/[0.02] p-8 transition hover:border-blue-500/30 hover:bg-blue-950/20"
              >
                {/* Número decorativo */}
                <span className="absolute -right-2 -top-4 select-none text-[7rem] font-black leading-none text-white/[0.03] transition group-hover:text-blue-500/8">
                  {paso.n}
                </span>
                {/* Línea conectora */}
                {i < PASOS.length - 1 && (
                  <div className="absolute right-0 top-1/2 hidden h-px w-6 -translate-y-1/2 translate-x-full bg-gradient-to-r from-white/10 to-transparent md:block" />
                )}
                <div className="relative">
                  <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-white/8 bg-white/4 text-3xl">
                    {paso.icon}
                  </div>
                  <h3 className="mb-3 text-xl font-bold">{paso.titulo}</h3>
                  <p className="text-sm leading-relaxed text-gray-500">{paso.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────────── */}
      <section className="px-6 pb-32 lg:px-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-blue-500">Características</p>
            <h2 className="text-4xl font-black tracking-tight sm:text-5xl">
              Todo lo que necesitas
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.titulo}
                className="group rounded-3xl border border-white/6 bg-white/[0.02] p-6 transition hover:border-blue-500/25 hover:bg-blue-950/15"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/8 bg-white/4 text-xl transition group-hover:border-blue-500/30 group-hover:bg-blue-500/10">
                  {f.icon}
                </div>
                <h3 className="mb-2 font-bold">{f.titulo}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing highlight ───────────────────────────────────────────────── */}
      <section className="px-6 pb-32 lg:px-16">
        <div className="mx-auto max-w-3xl">
          {/* Borde con gradiente */}
          <div className="rounded-[28px] p-px"
            style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.4), rgba(139,92,246,0.2), rgba(6,182,212,0.3))" }}
          >
            <div className="rounded-[27px] bg-[#020817] px-10 py-14 text-center">
              <span className="mb-5 inline-block rounded-full border border-blue-500/20 bg-blue-500/10 px-5 py-1.5 text-sm font-semibold text-blue-400">
                Plan PRO · desde 9,99€/mes
              </span>
              <h2 className="mb-5 text-4xl font-black tracking-tight sm:text-5xl">
                Desbloquea todo<br />
                <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  el potencial
                </span>
              </h2>
              <p className="mx-auto mb-10 max-w-md text-gray-400">
                Planes ilimitados, seguimiento semanal y ajuste automático basado en tu progreso real.
              </p>
              <div className="mb-10 grid grid-cols-2 gap-3 text-left text-sm sm:grid-cols-2">
                {[
                  "Planes ilimitados",
                  "Seguimiento semanal",
                  "Ajuste automático",
                  "Historial completo",
                  "Soporte prioritario",
                  "Sin anuncios",
                ].map((feat) => (
                  <div key={feat} className="flex items-center gap-2 text-gray-400">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-xs text-emerald-400">✓</span>
                    {feat}
                  </div>
                ))}
              </div>
              <Link
                href="/precios"
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-10 py-4 font-bold text-white shadow-[0_0_40px_rgba(59,130,246,0.4)] transition hover:bg-blue-500 hover:shadow-[0_0_60px_rgba(59,130,246,0.65)]"
              >
                Ver todos los planes →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA final ───────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 pb-40 pt-20 text-center lg:px-16">
        {/* Glow de fondo */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-96 -translate-x-1/2 rounded-full bg-blue-600/20 blur-[100px]" />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="mb-5 text-5xl font-black tracking-tight sm:text-6xl">
            Empieza hoy.{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Es gratis.
            </span>
          </h2>
          <p className="mb-10 text-lg text-gray-500">
            Sin compromisos. Sin tarjeta. Tu primer plan en menos de 3 minutos.
          </p>
          <Link
            href="/registro"
            className="inline-flex items-center gap-2.5 rounded-2xl bg-blue-600 px-12 py-5 text-lg font-bold text-white shadow-[0_0_50px_rgba(59,130,246,0.5)] transition hover:bg-blue-500 hover:shadow-[0_0_80px_rgba(59,130,246,0.7)]"
          >
            Crear mi plan gratis
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 px-6 py-8 lg:px-16">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <GoFitLogo height={24} />
          <div className="flex gap-6 text-sm text-gray-600">
            {["/legal", "/privacidad", "/cookies", "/precios"].map((href) => (
              <Link key={href} href={href} className="capitalize transition hover:text-gray-400">
                {href.slice(1)}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

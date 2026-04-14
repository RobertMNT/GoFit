"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Hero3D } from "./hero-3d";

// Stat badge flotante
function StatBadge({ value, label, delay, className }: {
  value: string; label: string; delay: number; className: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={`absolute rounded-2xl border border-white/10 bg-white/8 px-4 py-3 backdrop-blur-md ${className}`}
    >
      <div className="text-xl font-black text-white">{value}</div>
      <div className="text-xs text-gray-400">{label}</div>
    </motion.div>
  );
}

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#020817]">
      {/* Gradiente de fondo */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-0 h-[600px] w-[600px] rounded-full bg-blue-900/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-violet-900/15 blur-[100px]" />
      </div>

      {/* Grid sutil */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "50px 50px" }}
      />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col items-center px-6 pt-24 lg:flex-row lg:gap-0 lg:px-16">

        {/* ── Columna izquierda: texto ─────────────────────────────────────── */}
        <div className="z-10 flex-1 py-16 lg:py-0">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-950/60 px-4 py-1.5 backdrop-blur-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-400" />
            </span>
            <span className="text-sm font-medium text-blue-300">Tu entrenador personal · 24/7</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease: "easeOut" }}
            className="mb-6 text-[clamp(2.6rem,6vw,4.8rem)] font-black leading-[1.05] tracking-tight text-white"
          >
            Entrena con
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
              propósito.
            </span>
            <br />
            Progresa de verdad.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.22, ease: "easeOut" }}
            className="mb-10 max-w-md text-lg leading-relaxed text-gray-400"
          >
            Tu plan de entrenamiento y nutrición, diseñado para ti y ajustado
            cada semana según tu progreso real.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.34, ease: "easeOut" }}
            className="mb-10 flex flex-wrap gap-4"
          >
            <Link
              href="/registro"
              className="group inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 font-bold text-white shadow-[0_0_35px_rgba(59,130,246,0.5)] transition hover:scale-[1.03] hover:bg-blue-500 hover:shadow-[0_0_55px_rgba(59,130,246,0.8)]"
            >
              Empezar gratis
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/precios"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/5 px-8 py-4 font-semibold text-gray-300 backdrop-blur-sm transition hover:border-white/20 hover:bg-white/10 hover:text-white"
            >
              Ver PRO →
            </Link>
          </motion.div>

          {/* Stats en línea */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap gap-8 border-t border-white/6 pt-8"
          >
            {[
              { n: "8",    label: "preguntas" },
              { n: "<30s", label: "para tu plan" },
              { n: "100%", label: "personalizado" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-black text-white">{s.n}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── Columna derecha: 3D ──────────────────────────────────────────── */}
        <div className="relative h-[420px] w-full flex-1 lg:h-[680px]">
          {/* Badges de stats flotando sobre el canvas */}
          <StatBadge value="2.340 kcal" label="Plan calórico diario"    delay={0.8}  className="left-2 top-8 lg:left-0 lg:top-16" />
          <StatBadge value="3×10 reps"  label="Sentadilla — semana 3"   delay={0.95} className="right-2 top-20 lg:right-0 lg:top-28" />
          <StatBadge value="+4 kg"      label="Progresión este mes"      delay={1.1}  className="left-4 bottom-16 lg:left-6 lg:bottom-24" />

          {/* Canvas 3D */}
          <div className="absolute inset-0">
            <Hero3D />
          </div>

          {/* Gradiente lateral izquierdo para fusionar con el texto */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#020817] to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#020817] to-transparent" />
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="flex h-9 w-6 items-start justify-center rounded-full border border-white/15 p-1.5"
        >
          <motion.div className="h-1.5 w-1 rounded-full bg-blue-400" />
        </motion.div>
      </motion.div>
    </section>
  );
}

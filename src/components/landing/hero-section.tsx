"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Hero3D } from "./hero-3d";

// Tarjeta de estadística
function StatCard({ value, label, delay }: { value: string; label: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-md"
    >
      <span className="text-2xl font-black text-white">{value}</span>
      <span className="mt-0.5 text-xs text-gray-400">{label}</span>
    </motion.div>
  );
}

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#020817]">
      {/* Gradiente de fondo */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-blue-900/20 blur-[130px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-violet-900/15 blur-[100px]" />
      </div>

      {/* Grid sutil */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center px-6 pt-28 lg:px-8">

        {/* ── Chip superior ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-950/60 px-4 py-1.5 backdrop-blur-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-400" />
          </span>
          <span className="text-sm font-medium text-blue-300">Tu entrenador personal · 24/7</span>
        </motion.div>

        {/* ── Headline centrado ───────────────────────────────────────────── */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-5 text-center text-[clamp(2.8rem,7vw,5.2rem)] font-black leading-[1.05] tracking-tight text-white"
        >
          Entrena con propósito.
          <br />
          <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
            Progresa de verdad.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8 max-w-lg text-center text-lg leading-relaxed text-gray-400"
        >
          Plan de entrenamiento y nutrición diseñado para ti,
          ajustado cada semana según tu progreso real.
        </motion.p>

        {/* ── CTAs ───────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-12 flex flex-wrap justify-center gap-4"
        >
          <Link
            href="/registro"
            className="group inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 font-bold text-white shadow-[0_0_35px_rgba(59,130,246,0.45)] transition hover:scale-[1.03] hover:bg-blue-500 hover:shadow-[0_0_55px_rgba(59,130,246,0.7)]"
          >
            Empezar gratis
            <svg
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
            >
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

        {/* ── Canvas 3D (mancuerna) ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="relative h-[280px] w-full max-w-2xl sm:h-[340px] lg:h-[400px]"
        >
          <Hero3D />
          {/* Fade inferior para fundir con los stats */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#020817] to-transparent" />
        </motion.div>

        {/* ── Tarjetas de stats ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-4 flex w-full max-w-2xl flex-wrap justify-center gap-3 pb-20"
        >
          <StatCard value="8"      label="preguntas"       delay={0.75} />
          <StatCard value="&lt;30s"  label="para tu plan"    delay={0.85} />
          <StatCard value="100%"   label="personalizado"   delay={0.95} />
          <StatCard value="4 sem"  label="de progresión"   delay={1.05} />
        </motion.div>
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

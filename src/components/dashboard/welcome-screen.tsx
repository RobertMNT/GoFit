"use client";

import Link from "next/link";
import { useState } from "react";

const PASOS = [
  {
    num: "01",
    icon: "📋",
    titulo: "Cuestionario rápido",
    desc: "8 preguntas sobre ti — objetivo, nivel, horario y lugar de entrenamiento. Menos de 2 minutos.",
  },
  {
    num: "02",
    icon: "⚡",
    titulo: "Tu plan personalizado",
    desc: "Recibe un programa de 4 semanas adaptado exactamente a tu cuerpo, con ejercicios y nutrición.",
  },
  {
    num: "03",
    icon: "📈",
    titulo: "Entrena y sigue tu progreso",
    desc: "Marca tus sesiones completadas. El plan se ajusta según tu progreso real semana a semana.",
  },
];

// Pantalla de bienvenida para usuarios sin planes — explica qué van a recibir
export function WelcomeScreen() {
  const [cerrado, setCerrado] = useState(false);

  if (cerrado) return null;

  return (
    <div className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f172a] to-[#1e3a5f] text-white shadow-xl">
      {/* Cabecera */}
      <div className="relative border-b border-white/10 p-6">
        <div className="absolute right-4 top-4">
          <button
            onClick={() => setCerrado(true)}
            className="rounded-lg p-1.5 text-white/40 transition hover:bg-white/10 hover:text-white"
            aria-label="Cerrar"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-2xl">
            👋
          </div>
          <div>
            <h2 className="text-lg font-bold">Bienvenido a ZapFit</h2>
            <p className="text-sm text-blue-200">Tu plan personalizado en 3 pasos</p>
          </div>
        </div>
      </div>

      {/* Pasos */}
      <div className="grid gap-0 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
        {PASOS.map((paso) => (
          <div key={paso.num} className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-2xl">{paso.icon}</span>
              <span className="text-xs font-bold tracking-widest text-blue-400 uppercase">{paso.num}</span>
            </div>
            <h3 className="mb-1 font-semibold text-white">{paso.titulo}</h3>
            <p className="text-sm text-blue-200/80 leading-relaxed">{paso.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="flex items-center justify-between gap-4 border-t border-white/10 px-6 py-4">
        <p className="text-xs text-white/40">Sin tarjeta de crédito. Sin compromiso.</p>
        <Link
          href="/onboarding"
          className="rounded-xl bg-blue-500 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-blue-400"
        >
          Crear mi plan ahora →
        </Link>
      </div>
    </div>
  );
}

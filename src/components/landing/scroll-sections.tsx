"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

// ─── Tarjeta de macro que aparece flotando ──────────────────────────────────
function MacroCard({ label, value, unit, color, delay }: {
  label: string; value: number; unit: string; color: string; delay: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className="rounded-2xl border border-white/8 bg-white/4 p-5 backdrop-blur-sm"
    >
      <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-500">{label}</div>
      <div className={`text-3xl font-black ${color}`}>
        {inView ? (
          <CountUp target={value} duration={1.2 + delay} />
        ) : 0}
        <span className="ml-1 text-lg font-semibold text-gray-400">{unit}</span>
      </div>
    </motion.div>
  );
}

// Contador animado
function CountUp({ target, duration }: { target: number; duration: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const startTime = useRef<number | null>(null);

  const animate = (timestamp: number) => {
    if (!startTime.current) startTime.current = timestamp;
    const progress = Math.min((timestamp - startTime.current) / (duration * 1000), 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    if (ref.current) ref.current.textContent = Math.round(eased * target).toString();
    if (progress < 1) requestAnimationFrame(animate);
  };

  const startRef = useRef(false);
  if (!startRef.current && typeof window !== "undefined") {
    startRef.current = true;
    requestAnimationFrame(animate);
  }

  return <span ref={ref}>0</span>;
}

// ─── Barra de músculo con animación ────────────────────────────────────────
function MuscleBar({ muscle, pct, color, delay }: {
  muscle: string; pct: number; color: string; delay: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <div ref={ref} className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-300">{muscle}</span>
        <span className="text-gray-500">{pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/8">
        <motion.div
          initial={{ width: 0 }}
          animate={inView ? { width: `${pct}%` } : {}}
          transition={{ duration: 1.0, delay, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

// ─── Sección de planificación nutricional ───────────────────────────────────
function NutritionSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="grid gap-8 lg:grid-cols-2 lg:items-center">
      {/* Texto */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-emerald-400">Nutrición</p>
        <h3 className="mb-5 text-3xl font-black tracking-tight sm:text-4xl">
          Plan nutricional<br />
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            adaptado a tu objetivo
          </span>
        </h3>
        <p className="mb-8 leading-relaxed text-gray-400">
          Calculamos tus macros diarios según tu composición corporal, nivel de actividad
          y objetivo — ya sea perder grasa, ganar músculo o mejorar el rendimiento.
        </p>
        <div className="space-y-2 text-sm text-gray-500">
          {["Calorías diarias personalizadas", "Distribución de macronutrientes", "Timing de comidas pre/post entreno"].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-xs text-emerald-400">✓</span>
              {item}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Cards de macros */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <MacroCard label="Calorías"    value={2340} unit="kcal" color="text-orange-400" delay={0.1} />
          <MacroCard label="Proteínas"   value={175}  unit="g"    color="text-blue-400"   delay={0.2} />
          <MacroCard label="Carbohidratos" value={260} unit="g"   color="text-yellow-400" delay={0.3} />
          <MacroCard label="Grasas"      value={78}   unit="g"    color="text-pink-400"   delay={0.4} />
        </div>

        {/* Barra de progreso calórico */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
          className="rounded-2xl border border-white/8 bg-white/4 p-5"
        >
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="text-gray-400">Balance calórico hoy</span>
            <span className="font-semibold text-emerald-400">En déficit ↓</span>
          </div>
          <div className="mb-2 h-3 overflow-hidden rounded-full bg-white/8">
            <motion.div
              initial={{ width: 0 }}
              animate={inView ? { width: "68%" } : {}}
              transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
            />
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>0</span>
            <span>1,590 / 2,340 kcal</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Sección de entrenamiento con barras musculares ─────────────────────────
function TrainingSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const muscles = [
    { muscle: "Pecho",       pct: 85, color: "bg-blue-500",   delay: 0.1 },
    { muscle: "Espalda",     pct: 78, color: "bg-violet-500", delay: 0.2 },
    { muscle: "Pierna",      pct: 92, color: "bg-cyan-500",   delay: 0.3 },
    { muscle: "Hombros",     pct: 60, color: "bg-pink-500",   delay: 0.4 },
    { muscle: "Bíceps/Tríceps", pct: 70, color: "bg-emerald-500", delay: 0.5 },
  ];

  const weekdays = ["L", "M", "X", "J", "V", "S", "D"];
  const completed = [true, true, true, false, true, false, false];

  return (
    <div ref={ref} className="grid gap-8 lg:grid-cols-2 lg:items-center">
      {/* Visualización */}
      <div className="space-y-6 lg:order-1">
        {/* Calendario semanal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="rounded-2xl border border-white/8 bg-white/4 p-5"
        >
          <p className="mb-4 text-sm font-semibold text-gray-400">Semana actual — 4/5 sesiones</p>
          <div className="flex gap-2">
            {weekdays.map((day, i) => (
              <motion.div
                key={day}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.05 * i, ease: "easeOut" }}
                className={`flex flex-1 flex-col items-center gap-1.5 rounded-xl py-3 text-xs font-bold transition ${
                  completed[i]
                    ? "bg-blue-600 text-white shadow-[0_0_12px_rgba(59,130,246,0.5)]"
                    : i === 3
                    ? "border border-dashed border-white/20 text-gray-600"
                    : "bg-white/6 text-gray-600"
                }`}
              >
                {day}
                <span className="text-[10px]">{completed[i] ? "✓" : i === 3 ? "—" : "·"}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Barras musculares */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          className="rounded-2xl border border-white/8 bg-white/4 p-5"
        >
          <p className="mb-5 text-sm font-semibold text-gray-400">Volumen por grupo muscular</p>
          <div className="space-y-4">
            {muscles.map((m) => (
              <MuscleBar key={m.muscle} {...m} />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Texto */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="lg:order-2"
      >
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-blue-400">Entrenamiento</p>
        <h3 className="mb-5 text-3xl font-black tracking-tight sm:text-4xl">
          Máximo estímulo,<br />
          <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
            mínimo tiempo
          </span>
        </h3>
        <p className="mb-8 leading-relaxed text-gray-400">
          El plan distribuye el volumen de entrenamiento de forma óptima entre grupos musculares,
          garantizando la recuperación adecuada y la progresión constante.
        </p>
        <div className="space-y-2 text-sm text-gray-500">
          {["Distribución óptima de grupos musculares", "Gestión automática del volumen semanal", "Deload inteligente cada 4-6 semanas"].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/15 text-xs text-blue-400">✓</span>
              {item}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Sección de adaptación continua ────────────────────────────────────────
function AISection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const ajustes = [
    { dia: "Lunes",    tipo: "Aumentar",        color: "text-emerald-400", bg: "bg-emerald-500/10", icon: "⬆" },
    { dia: "Martes",   tipo: "Mantener",         color: "text-blue-400",   bg: "bg-blue-500/10",    icon: "→" },
    { dia: "Jueves",   tipo: "Reducir carga",    color: "text-orange-400", bg: "bg-orange-500/10",  icon: "⬇" },
    { dia: "Viernes",  tipo: "Nuevo ejercicio",  color: "text-violet-400", bg: "bg-violet-500/10",  icon: "✦" },
  ];

  return (
    <div ref={ref} className="grid gap-8 lg:grid-cols-2 lg:items-center">
      {/* Texto */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-violet-400">Adaptación continua</p>
        <h3 className="mb-5 text-3xl font-black tracking-tight sm:text-4xl">
          El plan evoluciona<br />
          <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
            contigo cada semana
          </span>
        </h3>
        <p className="mb-8 leading-relaxed text-gray-400">
          Al final de cada semana, analizamos qué días completaste, cómo te fue
          y ajustamos automáticamente el plan siguiente para maximizar tu progreso.
        </p>
        <div className="inline-flex items-center gap-2 rounded-2xl border border-violet-500/20 bg-violet-500/8 px-5 py-3 text-sm text-violet-300">
          <span className="text-lg">✦</span>
          Tecnología ZapFit · Planes inteligentes
        </div>
      </motion.div>

      {/* Cards de ajustes IA */}
      <div className="space-y-3">
        {ajustes.map((a, i) => (
          <motion.div
            key={a.dia}
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 * i, ease: "easeOut" }}
            className="flex items-center gap-4 rounded-2xl border border-white/6 bg-white/3 p-4"
          >
            <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${a.bg} text-lg`}>
              {a.icon}
            </div>
            <div className="flex-1">
              <span className="font-semibold">{a.dia}</span>
              <span className="ml-2 text-sm text-gray-500">Sugerencia ZapFit</span>
            </div>
            <span className={`text-sm font-bold ${a.color}`}>{a.tipo}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Componente padre exportado ─────────────────────────────────────────────
export function ScrollSections() {
  return (
    <div className="relative space-y-32 px-6 py-32 lg:px-16">
      {/* Grid decorativo de fondo */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <div className="relative mx-auto max-w-5xl space-y-32">
        <NutritionSection />
        <div className="h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
        <TrainingSection />
        <div className="h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
        <AISection />
      </div>
    </div>
  );
}

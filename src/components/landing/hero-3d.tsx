"use client";

// Mancuerna animada en CSS/SVG puro — funciona en todos los navegadores sin WebGL

export function Hero3D() {
  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden">
      {/* Glow azul de fondo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="h-48 w-96 rounded-full bg-blue-600/15 blur-3xl" />
      </div>

      {/* Contenedor de perspectiva 3D */}
      <div style={{ perspective: "1000px" }} className="flex items-center justify-center">
        {/* Flotación vertical */}
        <div style={{ animation: "db-float 3.2s ease-in-out infinite" }}>
          {/* Rotación en Y */}
          <div style={{ animation: "db-spin 5s linear infinite", transformStyle: "preserve-3d" }}>
            <DumbbellSVG />
          </div>
        </div>
      </div>

      {/* Partículas decorativas */}
      <Sparkles />

      <style>{`
        @keyframes db-float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-14px); }
        }
        @keyframes db-spin {
          from { transform: rotateY(0deg); }
          to   { transform: rotateY(360deg); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0.4); }
          50%       { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

function DumbbellSVG() {
  return (
    <svg
      viewBox="0 0 480 130"
      width="420"
      height="115"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: "drop-shadow(0 0 18px rgba(59,130,246,0.35))" }}
    >
      <defs>
        {/* Barra metálica */}
        <linearGradient id="barG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#475569" />
          <stop offset="35%"  stopColor="#94a3b8" />
          <stop offset="65%"  stopColor="#64748b" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>

        {/* Discos negros */}
        <linearGradient id="plateG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#334155" />
          <stop offset="45%"  stopColor="#475569" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>

        {/* Collar azul */}
        <linearGradient id="collarG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#60a5fa" />
          <stop offset="50%"  stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>

        {/* Agarre oscuro */}
        <linearGradient id="gripG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#1e293b" />
          <stop offset="50%"  stopColor="#334155" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
      </defs>

      {/* ── LADO IZQUIERDO ── */}
      {/* Tapa exterior izq */}
      <rect x="18" y="32" width="14" height="66" rx="4" fill="url(#barG)" />
      {/* Disco grande izq */}
      <rect x="32" y="14" width="24" height="102" rx="3" fill="url(#plateG)" />
      {/* Disco mediano izq */}
      <rect x="56" y="24" width="20" height="82" rx="3" fill="url(#plateG)" />
      {/* Disco pequeño izq */}
      <rect x="76" y="34" width="16" height="62" rx="2" fill="url(#plateG)" />
      {/* Collar azul izq */}
      <rect x="92" y="47" width="16" height="36" rx="4" fill="url(#collarG)" />
      {/* Brillo collar izq */}
      <rect x="95" y="50" width="4" height="12" rx="2" fill="white" opacity="0.25" />

      {/* ── BARRA CENTRAL (agarre) ── */}
      <rect x="108" y="56" width="264" height="18" rx="4" fill="url(#barG)" />
      {/* Zona de agarre (knurling) */}
      <rect x="150" y="57" width="180" height="16" rx="3" fill="url(#gripG)" />
      {/* Líneas de knurling */}
      {Array.from({ length: 18 }).map((_, i) => (
        <rect
          key={i}
          x={155 + i * 10}
          y="58"
          width="3"
          height="14"
          rx="1"
          fill="#475569"
          opacity="0.5"
        />
      ))}

      {/* ── LADO DERECHO ── */}
      {/* Collar azul der */}
      <rect x="372" y="47" width="16" height="36" rx="4" fill="url(#collarG)" />
      {/* Brillo collar der */}
      <rect x="375" y="50" width="4" height="12" rx="2" fill="white" opacity="0.25" />
      {/* Disco pequeño der */}
      <rect x="388" y="34" width="16" height="62" rx="2" fill="url(#plateG)" />
      {/* Disco mediano der */}
      <rect x="404" y="24" width="20" height="82" rx="3" fill="url(#plateG)" />
      {/* Disco grande der */}
      <rect x="424" y="14" width="24" height="102" rx="3" fill="url(#plateG)" />
      {/* Tapa exterior der */}
      <rect x="448" y="32" width="14" height="66" rx="4" fill="url(#barG)" />

      {/* Reflejo superior en la barra */}
      <rect x="108" y="57" width="264" height="4" rx="2" fill="white" opacity="0.08" />
    </svg>
  );
}

// Partículas decorativas estáticas con animación CSS
const SPARKLE_POSITIONS = [
  { x: "15%",  y: "20%", delay: "0s",    size: 5 },
  { x: "82%",  y: "15%", delay: "0.7s",  size: 4 },
  { x: "10%",  y: "75%", delay: "1.3s",  size: 6 },
  { x: "88%",  y: "70%", delay: "0.4s",  size: 4 },
  { x: "50%",  y: "10%", delay: "1.8s",  size: 3 },
  { x: "25%",  y: "85%", delay: "2.1s",  size: 5 },
  { x: "72%",  y: "80%", delay: "0.9s",  size: 3 },
  { x: "60%",  y: "90%", delay: "1.5s",  size: 4 },
];

function Sparkles() {
  return (
    <>
      {SPARKLE_POSITIONS.map((s, i) => (
        <div
          key={i}
          aria-hidden
          className="pointer-events-none absolute rounded-full bg-blue-400"
          style={{
            left: s.x,
            top: s.y,
            width: s.size,
            height: s.size,
            animation: `sparkle 2.5s ease-in-out infinite`,
            animationDelay: s.delay,
          }}
        />
      ))}
    </>
  );
}

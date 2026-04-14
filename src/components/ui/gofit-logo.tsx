// Componente de logo FitLab — icono hexágono + rayo + texto, fondo transparente
interface FitLabLogoProps {
  /** Altura en píxeles (mantiene proporción) */
  height?: number;
  className?: string;
}

export function FitLabLogo({ height = 32, className }: FitLabLogoProps) {
  // viewBox: icono (76×88) + gap + texto "GOFIT" a 80px ≈ ancho total ~290, alto ~88
  return (
    <svg
      viewBox="0 0 290 88"
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="FitLab"
      className={className}
    >
      <defs>
        <linearGradient id="gfl-accent" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>
      </defs>

      {/* Hexágono */}
      <polygon
        points="38,0 76,22 76,66 38,88 0,66 0,22"
        fill="none"
        stroke="#1d4ed8"
        strokeWidth="1.5"
        opacity="0.5"
      />
      {/* Rayo */}
      <polygon
        points="42,12 22,48 38,48 34,76 58,40 42,40"
        fill="url(#gfl-accent)"
      />

      {/* Texto GOFIT */}
      <text
        x="90"
        y="68"
        fontFamily="'Arial Black', Impact, sans-serif"
        fontSize="72"
        fontWeight="900"
        letterSpacing="-2"
        fill="#f0f4ff"
      >
        GO
        <tspan fill="url(#gfl-accent)">FIT</tspan>
      </text>
    </svg>
  );
}

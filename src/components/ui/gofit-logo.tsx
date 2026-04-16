// Componente de logo ZapFit — icono rayo + texto, fondo transparente
interface ZapFitLogoProps {
  /** Altura en píxeles (mantiene proporción) */
  height?: number;
  className?: string;
}

export function ZapFitLogo({ height = 32, className }: ZapFitLogoProps) {
  return (
    <svg
      viewBox="0 0 380 88"
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="ZapFit"
      className={className}
    >
      <defs>
        <linearGradient id="zf-accent" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <linearGradient id="zf-white" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
      </defs>

      {/* Rayo */}
      <polygon
        points="36,0 18,48 34,48 22,88 58,40 42,40 54,0"
        fill="url(#zf-accent)"
      />

      {/* ZAP en azul, FIT en blanco */}
      <text
        x="76"
        y="68"
        fontFamily="'Arial Black', Impact, sans-serif"
        fontSize="72"
        fontWeight="900"
        letterSpacing="-3"
        fill="url(#zf-accent)"
      >
        ZAP
        <tspan fill="url(#zf-white)">FIT</tspan>
      </text>
    </svg>
  );
}

import type { NextConfig } from "next";

const securityHeaders = [
  // Fuerza HTTPS durante 2 años (solo en producción)
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Impide que la app se cargue en iframes de terceros (clickjacking)
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Evita que el navegador adivine el tipo MIME
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Limita la información del Referer enviada a terceros
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Desactiva APIs de hardware que no se usan
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  // Prefetch DNS activado para mejorar rendimiento
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

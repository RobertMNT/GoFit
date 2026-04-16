import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CookieBanner } from "@/components/cookie-banner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ZapFit — Planes de entrenamiento 100% personalizados",
    template: "%s | ZapFit",
  },
  description:
    "Crea tu plan de entrenamiento y bienestar personalizado, adaptado a tu cuerpo y objetivos. Gratis para empezar, PRO para maximizar resultados.",
  keywords: ["entrenamiento", "fitness", "planes personalizados", "bienestar", "ejercicio", "nutrición"],
  authors: [{ name: "ZapFit" }],
  creator: "ZapFit",
  metadataBase: new URL("https://go-fit-five.vercel.app"),
  icons: {
    icon: "/zapfit-logo.svg",
    shortcut: "/zapfit-logo.svg",
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://go-fit-five.vercel.app",
    title: "ZapFit — Planes de entrenamiento 100% personalizados",
    description:
      "Crea tu plan de entrenamiento y bienestar personalizado, adaptado a tu cuerpo y objetivos.",
    siteName: "ZapFit",
    images: [{ url: "/zapfit-logo.svg", width: 680, height: 330, alt: "ZapFit" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ZapFit — Planes de entrenamiento 100% personalizados",
    description:
      "Crea tu plan de entrenamiento y bienestar personalizado, adaptado a tu cuerpo y objetivos.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}

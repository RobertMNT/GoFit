"use client";

import dynamic from "next/dynamic";
import { Component, type ReactNode } from "react";
import { GoFitLogo } from "@/components/ui/gofit-logo";
import { Spinner } from "@/components/ui/spinner";

// Fallback visual cuando WebGL no está disponible o falla
function HeroFallback() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="opacity-30">
        <GoFitLogo height={48} />
      </div>
    </div>
  );
}

// Error boundary para capturar fallos de WebGL/Three.js
class WebGLBoundary extends Component<{ children: ReactNode }, { crashed: boolean }> {
  state = { crashed: false };
  componentDidCatch() {
    this.setState({ crashed: true });
  }
  render() {
    if (this.state.crashed) return <HeroFallback />;
    return this.props.children;
  }
}

// Wrapper cliente necesario: ssr:false no está permitido en Server Components
const HeroSection = dynamic(
  () => import("./hero-section").then((m) => m.HeroSection),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-[#030712]">
        <Spinner size={48} />
      </div>
    ),
  },
);

export function HeroWrapper() {
  return (
    <WebGLBoundary>
      <HeroSection />
    </WebGLBoundary>
  );
}

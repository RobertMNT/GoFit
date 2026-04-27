"use client";

import dynamic from "next/dynamic";
import { Spinner } from "@/components/ui/spinner";

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
  return <HeroSection />;
}

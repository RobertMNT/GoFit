import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Crea tu cuenta gratuita en FitLab y empieza tu plan de entrenamiento personalizado",
};

export default function RegistroPage() {
  return (
    <Suspense>
      <AuthForm mode="registro" />
    </Suspense>
  );
}

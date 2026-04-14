import type { Metadata } from "next";
import { QuestionnaireForm } from "@/components/questionnaire/questionnaire-form";

export const metadata: Metadata = {
  title: "Configura tu plan",
  description: "Responde unas preguntas y crearemos tu plan de entrenamiento personalizado",
};

// Ruta protegida por middleware — solo usuarios autenticados
export default function OnboardingPage() {
  return <QuestionnaireForm />;
}

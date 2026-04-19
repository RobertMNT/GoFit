import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

// Crea una sesión del Customer Portal de Stripe para gestionar la suscripción
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (!profile?.stripe_customer_id) {
    return NextResponse.json(
      { error: "No tienes ninguna suscripción de Stripe asociada" },
      { status: 400 },
    );
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("[crear-portal] STRIPE_SECRET_KEY no configurada");
    return NextResponse.json({ error: "Pagos no configurados" }, { status: 500 });
  }

  // Determinar la URL base desde la petición (funciona en local y en producción)
  const origin = new URL(req.url).origin;
  const returnUrl =
    process.env.NEXT_PUBLIC_APP_URL?.startsWith("http")
      ? `${process.env.NEXT_PUBLIC_APP_URL}/perfil`
      : `${origin}/perfil`;

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-03-25.dahlia",
    });

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: returnUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[crear-portal] Stripe error:", err);
    const raw = err instanceof Error ? err.message : "";

    // Customer de test usado con clave live (o viceversa) — limpiar y pedir al usuario que renueve
    if (raw.includes("a similar object exists in test mode") || raw.includes("a similar object exists in live mode")) {
      // Limpiar el customer_id obsoleto para que se genere uno nuevo en el modo correcto
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").update({ stripe_customer_id: null }).eq("id", user.id);
      }
      return NextResponse.json(
        { error: "Hubo un problema con tu método de pago. Por favor, suscríbete de nuevo desde la página de precios." },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: "No se pudo abrir el portal de pago. Inténtalo de nuevo." }, { status: 500 });
  }
}

import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

// Eventos de Stripe que manejamos
const EVENTOS_RELEVANTES = new Set([
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Firma ausente" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    // Verificar la firma del webhook para prevenir peticiones falsas
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  if (!EVENTOS_RELEVANTES.has(event.type)) {
    return NextResponse.json({ received: true });
  }

  const supabase = await createClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await activarSuscripcion(supabase, subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await cancelarSuscripcion(supabase, subscription);
        break;
      }
    }
  } catch (err) {
    console.error("[stripe-webhook]", err);
    return NextResponse.json({ error: "Error procesando webhook" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// Activa el rol PRO en profiles cuando la suscripción está activa
async function activarSuscripcion(
  supabase: Awaited<ReturnType<typeof createClient>>,
  subscription: Stripe.Subscription,
) {
  const userId = subscription.metadata?.supabase_user_id;
  if (!userId) return;

  const esActiva = subscription.status === "active" || subscription.status === "trialing";

  await supabase
    .from("profiles")
    .update({ role: esActiva ? "pro" : "free" })
    .eq("id", userId);
}

// Revoca el acceso PRO al cancelarse la suscripción
async function cancelarSuscripcion(
  supabase: Awaited<ReturnType<typeof createClient>>,
  subscription: Stripe.Subscription,
) {
  const userId = subscription.metadata?.supabase_user_id;
  if (!userId) return;

  await supabase.from("profiles").update({ role: "free" }).eq("id", userId);
}

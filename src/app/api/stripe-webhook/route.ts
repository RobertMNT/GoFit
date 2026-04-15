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

        // Obtener el user_id desde el metadata de la sesión
        const userId = session.metadata?.supabase_user_id;
        if (!userId) {
          console.error("[stripe-webhook] checkout.session.completed sin supabase_user_id en metadata");
          break;
        }

        const { error } = await supabase
          .from("profiles")
          .update({ role: "pro" })
          .eq("id", userId);

        if (error) {
          console.error("[stripe-webhook] error actualizando rol a pro:", error);
        } else {
          console.log("[stripe-webhook] usuario", userId, "actualizado a PRO");
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await actualizarRolPorSuscripcion(supabase, subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await actualizarRolPorSuscripcion(supabase, subscription);
        break;
      }
    }
  } catch (err) {
    console.error("[stripe-webhook]", err);
    return NextResponse.json({ error: "Error procesando webhook" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// Sincroniza el rol según el estado real de la suscripción en Stripe
async function actualizarRolPorSuscripcion(
  supabase: Awaited<ReturnType<typeof createClient>>,
  subscription: Stripe.Subscription,
) {
  const userId = subscription.metadata?.supabase_user_id;
  if (!userId) {
    console.error("[stripe-webhook] suscripción sin supabase_user_id en metadata:", subscription.id);
    return;
  }

  const esActiva = subscription.status === "active" || subscription.status === "trialing";
  const nuevoRol = esActiva ? "pro" : "free";

  const { error } = await supabase
    .from("profiles")
    .update({ role: nuevoRol })
    .eq("id", userId);

  if (error) {
    console.error("[stripe-webhook] error actualizando rol:", error);
  } else {
    console.log("[stripe-webhook] usuario", userId, "→", nuevoRol, "(sub status:", subscription.status, ")");
  }
}

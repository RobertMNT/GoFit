import { stripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/service";
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
  console.log("[stripe-webhook] recibida petición POST");

  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    console.error("[stripe-webhook] falta stripe-signature header");
    return NextResponse.json({ error: "Firma ausente" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
    console.log("[stripe-webhook] evento verificado:", event.type, "id:", event.id);
  } catch (err) {
    console.error("[stripe-webhook] firma inválida:", err);
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  if (!EVENTOS_RELEVANTES.has(event.type)) {
    console.log("[stripe-webhook] evento ignorado:", event.type);
    return NextResponse.json({ received: true });
  }

  // Usar service client — bypasea RLS, necesario en webhooks server-to-server
  const supabase = createServiceClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("[stripe-webhook] checkout.session.completed — mode:", session.mode, "metadata:", JSON.stringify(session.metadata));

        if (session.mode !== "subscription") {
          console.log("[stripe-webhook] modo no es subscription, ignorando");
          break;
        }

        const userId = session.metadata?.supabase_user_id;
        if (!userId) {
          console.error("[stripe-webhook] supabase_user_id ausente en metadata:", JSON.stringify(session.metadata));
          break;
        }

        console.log("[stripe-webhook] actualizando usuario", userId, "a PRO...");
        const { data: updated, error } = await supabase
          .from("profiles")
          .update({ role: "pro" })
          .eq("id", userId)
          .select("id");

        if (error) {
          console.error("[stripe-webhook] error en UPDATE profiles:", JSON.stringify(error));
        } else {
          console.log("[stripe-webhook] UPDATE OK — filas afectadas:", updated?.length, "— usuario", userId, "es ahora PRO");
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("[stripe-webhook]", event.type, "sub:", subscription.id, "status:", subscription.status, "metadata:", JSON.stringify(subscription.metadata));
        await actualizarRolPorSuscripcion(supabase, subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("[stripe-webhook] subscription.deleted sub:", subscription.id, "metadata:", JSON.stringify(subscription.metadata));
        await actualizarRolPorSuscripcion(supabase, subscription);
        break;
      }
    }
  } catch (err) {
    console.error("[stripe-webhook] excepción:", err);
    return NextResponse.json({ error: "Error procesando webhook" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function actualizarRolPorSuscripcion(
  supabase: ReturnType<typeof createServiceClient>,
  subscription: Stripe.Subscription,
) {
  const userId = subscription.metadata?.supabase_user_id;
  if (!userId) {
    console.error("[stripe-webhook] sin supabase_user_id — sub:", subscription.id);
    return;
  }

  const esActiva = subscription.status === "active" || subscription.status === "trialing";
  const nuevoRol = esActiva ? "pro" : "free";

  console.log("[stripe-webhook] actualizarRol userId:", userId, "->", nuevoRol);

  const { data: updated, error } = await supabase
    .from("profiles")
    .update({ role: nuevoRol })
    .eq("id", userId)
    .select("id");

  if (error) {
    console.error("[stripe-webhook] UPDATE error:", JSON.stringify(error));
  } else {
    console.log("[stripe-webhook] UPDATE OK filas:", updated?.length, "usuario", userId, "->", nuevoRol);
  }
}

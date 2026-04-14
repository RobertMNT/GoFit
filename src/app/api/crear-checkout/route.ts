import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  price_id: z.string().min(1),
});

// Lista blanca de price_ids permitidos (cargada desde env para evitar hardcoding)
function getAllowedPriceIds(): Set<string> {
  return new Set(
    [process.env.STRIPE_PRICE_ID_MONTHLY, process.env.STRIPE_PRICE_ID_YEARLY].filter(
      (id): id is string => typeof id === "string" && id.length > 0,
    ),
  );
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Verificar autenticación
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Validar body
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "price_id requerido" }, { status: 400 });
    }

    // Verificar que el price_id pertenece a GoFit (previene compra de precios arbitrarios)
    const allowedIds = getAllowedPriceIds();
    if (allowedIds.size > 0 && !allowedIds.has(parsed.data.price_id)) {
      return NextResponse.json({ error: "Plan no válido" }, { status: 400 });
    }

    // Obtener o crear el customer de Stripe vinculado al usuario
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id, email, full_name")
      .eq("id", user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile?.email ?? user.email ?? "",
        name: profile?.full_name ?? undefined,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;

      // Guardar el customer ID en el perfil del usuario
      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    // Crear la sesión de checkout de Stripe
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: parsed.data.price_id, quantity: 1 }],
      success_url: `${appUrl}/dashboard?upgrade=success`,
      cancel_url: `${appUrl}/precios?upgrade=cancelled`,
      metadata: { supabase_user_id: user.id },
      subscription_data: {
        metadata: { supabase_user_id: user.id },
      },
      // Configuración para mercado europeo
      tax_id_collection: { enabled: true },
      automatic_tax: { enabled: true },
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err) {
    // Log en servidor para depuración, sin exponer detalles al cliente
    console.error("[crear-checkout]", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

import Stripe from "stripe";

// Cliente Stripe para uso exclusivo en servidor — nunca exponer al cliente
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
  typescript: true,
});

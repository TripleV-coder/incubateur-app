import Stripe from "stripe";

const API_VERSION = "2025-01-27.acacia" as Stripe.LatestApiVersion;

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY?.trim();
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY est requis pour les paiements Stripe.");
    }
    stripeClient = new Stripe(key, {
      apiVersion: API_VERSION,
      typescript: true,
    });
  }
  return stripeClient;
}

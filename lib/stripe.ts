import Stripe from "stripe";

/**
 * Lazily constructed so a missing key is a runtime error on the one route
 * that needs it, not a build failure for the whole site.
 */
let client: Stripe | null = null;

export function stripe(): Stripe {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    client = new Stripe(key);
  }
  return client;
}

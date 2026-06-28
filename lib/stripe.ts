/**
 * Stripe integration — TEST MODE ONLY
 *
 * ⚠️  DO NOT replace STRIPE_SECRET_KEY with a live key (sk_live_...)
 *     without Chris's explicit confirmation. All keys must start with
 *     sk_test_ until you receive the go-live signal.
 */
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn(
    "⚠️  STRIPE_SECRET_KEY is not set. Stripe features will not work.\n" +
    "    Add your TEST key (sk_test_...) to .env.local"
  );
}

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-10-28.acacia" })
  : null;

// ─── Pricing constants ────────────────────────────────────────────────────────
// Retainer is fixed at $75. Closing fee is editable in admin settings.
export const RETAINER_AMOUNT_CENTS = 7500; // $75.00

// Subscription price — $500/month
export const SUBSCRIPTION_AMOUNT_CENTS = 50000; // $500.00

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Creates a Stripe Checkout session for the $75 per-deal retainer.
 * Returns the checkout URL. Call only on the server.
 */
export async function createRetainerCheckout({
  clientEmail,
  dealId,
  successUrl,
  cancelUrl,
}: {
  clientEmail: string;
  dealId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<string | null> {
  if (!stripe) return null;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: clientEmail,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "myTCteam Transaction Retainer",
            description: "Non-refundable retainer to open your transaction file",
          },
          unit_amount: RETAINER_AMOUNT_CENTS,
        },
        quantity: 1,
      },
    ],
    metadata: { deal_id: dealId, type: "retainer" },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return session.url;
}

/**
 * Creates a Stripe Checkout session for the $500/month subscription.
 */
export async function createSubscriptionCheckout({
  clientId,
  clientEmail,
  successUrl,
  cancelUrl,
}: {
  clientId: string;
  clientEmail: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<string | null> {
  if (!stripe) return null;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: clientEmail,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "myTCteam Monthly Subscription",
            description: "Up to 10 deals per month",
          },
          unit_amount: SUBSCRIPTION_AMOUNT_CENTS,
          recurring: { interval: "month" },
        },
        quantity: 1,
      },
    ],
    metadata: { type: "subscription", client_id: clientId },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return session.url;
}

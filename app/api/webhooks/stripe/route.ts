/**
 * Stripe webhook handler — LIVE MODE
 * Register this endpoint in Stripe Dashboard → Developers → Webhooks:
 *   URL: https://yourdomain.com/api/webhooks/stripe
 *   Events: checkout.session.completed, customer.subscription.updated,
 *           customer.subscription.deleted, invoice.paid
 * Copy the signing secret into STRIPE_WEBHOOK_SECRET in .env.local
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe";

// Use bare supabase-js with service role — webhooks have no user cookies
function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  let event: any;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook signature failed: ${err.message}` }, { status: 400 });
  }

  const db = adminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const { type, deal_id, client_id } = session.metadata || {};

      if (type === "retainer" && deal_id) {
        // Look up client from deal
        const { data: deal } = await db.from("deals").select("client_id").eq("id", deal_id).single();
        if (deal) {
          await db.from("deals").update({ retainer_paid: true }).eq("id", deal_id);
          await db.from("payments").insert({
            deal_id,
            client_id: deal.client_id,
            type: "retainer",
            amount: 75,
            status: "paid",
            stripe_payment_intent_id: session.payment_intent,
            description: "Transaction retainer",
            paid_at: new Date().toISOString(),
          });
        }
      }

      if (type === "subscription" && client_id) {
        await db.from("profiles").update({
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          subscription_status: "active",
          plan: "subscription",
          deals_cap: 10,
        }).eq("id", client_id);

        await db.from("payments").insert({
          client_id,
          type: "subscription",
          amount: 500,
          status: "paid",
          stripe_invoice_id: session.invoice,
          description: "Monthly subscription — first payment",
          paid_at: new Date().toISOString(),
        });
      }
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object;
      await db.from("profiles")
        .update({ subscription_status: sub.status })
        .eq("stripe_subscription_id", sub.id);
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object;
      await db.from("profiles")
        .update({ subscription_status: "canceled", stripe_subscription_id: null })
        .eq("stripe_subscription_id", sub.id);
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object;
      // Only record renewals — first payment is handled by checkout.session.completed
      if (invoice.billing_reason !== "subscription_cycle") break;

      const { data: profile } = await db
        .from("profiles")
        .select("id")
        .eq("stripe_customer_id", invoice.customer)
        .single();

      if (profile) {
        await db.from("payments").insert({
          client_id: profile.id,
          type: "subscription",
          amount: invoice.amount_paid / 100,
          status: "paid",
          stripe_invoice_id: invoice.id,
          description: `Subscription renewal — ${new Date(invoice.period_end * 1000).toLocaleDateString("en-US", { month: "long", year: "numeric" })}`,
          paid_at: new Date().toISOString(),
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}

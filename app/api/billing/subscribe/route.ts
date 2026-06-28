/**
 * GET /api/billing/subscribe
 * Creates a Stripe Checkout session for the $500/month subscription.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createSubscriptionCheckout } from "@/lib/stripe";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const url = await createSubscriptionCheckout({
    clientId: user.id,
    clientEmail: user.email!,
    successUrl: `${baseUrl}/dashboard/billing?success=1`,
    cancelUrl:  `${baseUrl}/dashboard/billing?canceled=1`,
  });

  if (!url) {
    // Stripe not configured — redirect with message
    return NextResponse.redirect(new URL("/dashboard/billing?stripe_missing=1", req.url));
  }

  return NextResponse.redirect(url);
}

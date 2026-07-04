/**
 * GET /api/billing/portal
 * Creates a Stripe Customer Portal session and redirects the user to it.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  if (!stripe) {
    return NextResponse.redirect(new URL("/dashboard/billing?stripe_missing=1", req.url));
  }

  // Get Stripe customer ID from profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (!profile?.stripe_customer_id) {
    return NextResponse.redirect(new URL("/dashboard/billing?no_customer=1", req.url));
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${baseUrl}/dashboard/billing`,
  });

  return NextResponse.redirect(session.url);
}

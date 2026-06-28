/**
 * GET /api/billing/retainer?deal_id=xxx
 * Creates a Stripe Checkout session for the $75 per-deal retainer and redirects.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createRetainerCheckout } from "@/lib/stripe";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.redirect(new URL("/sign-in", req.url));

  const deal_id = req.nextUrl.searchParams.get("deal_id");
  if (!deal_id) return NextResponse.redirect(new URL("/dashboard", req.url));

  // Verify the deal belongs to this user
  const { data: deal } = await supabase
    .from("deals")
    .select("id, retainer_paid")
    .eq("id", deal_id)
    .eq("client_id", user.id)
    .single();

  if (!deal) return NextResponse.redirect(new URL("/dashboard", req.url));

  // Already paid — skip straight to deal
  if (deal.retainer_paid) {
    return NextResponse.redirect(new URL(`/dashboard/deals/${deal_id}`, req.url));
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const url = await createRetainerCheckout({
    clientEmail: user.email!,
    dealId: deal_id,
    successUrl: `${baseUrl}/dashboard/deals/${deal_id}?retainer_paid=1`,
    cancelUrl:  `${baseUrl}/dashboard/deals/${deal_id}?retainer_canceled=1`,
  });

  if (!url) {
    // Stripe not configured — go to deal, admin handles manually
    return NextResponse.redirect(new URL(`/dashboard/deals/${deal_id}?stripe_missing=1`, req.url));
  }

  return NextResponse.redirect(url);
}

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle, CreditCard, AlertCircle, ArrowRight, XCircle } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Profile, Payment } from "@/types";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ setup?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single() as { data: Profile | null };

  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20) as { data: Payment[] | null };

  const params = await searchParams;
  const needsSubscriptionSetup = params.setup === "subscription";
  const paymentSuccess = params.success === "1";
  const paymentCanceled = params.canceled === "1";
  const isSubscription = profile?.plan === "subscription";
  const dealsUsed = profile?.deals_used_this_month || 0;
  const dealsCap = profile?.deals_cap || 10;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Billing & Payments</h1>

      {/* Payment success banner */}
      {paymentSuccess && (
        <div className="mb-6 card p-4 border-green-200 bg-green-50 flex items-start gap-3">
          <CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-900">Subscription activated!</p>
            <p className="text-green-700 text-sm mt-0.5">Your $500/month plan is now active. You can open up to 10 deals per month.</p>
          </div>
        </div>
      )}

      {/* Payment canceled banner */}
      {paymentCanceled && (
        <div className="mb-6 card p-4 border-amber-200 bg-amber-50 flex items-start gap-3">
          <XCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900">Checkout canceled</p>
            <p className="text-amber-700 text-sm mt-0.5">Your subscription was not set up. Click below to try again.</p>
          </div>
        </div>
      )}

      {/* Subscription setup prompt */}
      {needsSubscriptionSetup && !profile?.stripe_subscription_id && (
        <div className="mb-6 card p-5 border-brand-200 bg-brand-50">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-brand-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-brand-900">Complete your subscription setup</p>
              <p className="text-brand-700 text-sm mt-1">
                You selected the monthly plan. Click below to set up your $500/month subscription via Stripe.
              </p>
              <a
                href="/api/billing/subscribe"
                className="btn-primary text-sm mt-3 inline-flex"
              >
                Set up subscription <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Plan card */}
      <div className="card p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-900">Current plan</h2>
          {isSubscription && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              profile?.subscription_status === "active"
                ? "bg-green-50 text-green-700"
                : "bg-amber-50 text-amber-700"
            }`}>
              {profile?.subscription_status || "pending"}
            </span>
          )}
        </div>
        <div className="flex items-end gap-2 mb-3">
          <span className="text-2xl font-bold text-slate-900">
            {isSubscription ? "$500" : "$75"}
          </span>
          <span className="text-slate-500 text-sm pb-0.5">
            {isSubscription ? "/month" : "per deal retainer + $250 closing"}
          </span>
        </div>

        {isSubscription && (
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-slate-500">Deals used this month</span>
              <span className="font-medium text-slate-900">{dealsUsed} / {dealsCap}</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full">
              <div
                className={`h-full rounded-full transition-all ${dealsUsed >= dealsCap ? "bg-red-500" : dealsUsed >= 8 ? "bg-amber-400" : "bg-brand-500"}`}
                style={{ width: `${Math.min((dealsUsed / dealsCap) * 100, 100)}%` }}
              />
            </div>
            {dealsUsed >= dealsCap && (
              <p className="text-xs text-red-600 mt-1">
                Monthly cap reached. <Link href="/contact?reason=high_volume" className="underline">Contact us</Link> for a high-volume plan.
              </p>
            )}
          </div>
        )}

        {!isSubscription && (
          <div className="mt-3 text-sm text-slate-500">
            Closing 3+ deals/month?{" "}
            <Link href="/pricing" className="text-brand-600 hover:underline">Compare plans →</Link>
          </div>
        )}
      </div>

      {/* Payment history */}
      <div className="card">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Payment history</h2>
        </div>
        {(!payments || payments.length === 0) ? (
          <div className="px-5 py-8 text-center text-slate-400 text-sm">
            No payments yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {payments.map(p => (
              <div key={p.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-900 capitalize">{p.type.replace("_", " ")}</div>
                  <div className="text-xs text-slate-500">{p.description || formatDate(p.created_at)}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-slate-900">{formatCurrency(p.amount)}</div>
                  <div className={`text-xs flex items-center justify-end gap-1 ${
                    p.status === "paid" ? "text-green-600" : "text-amber-600"
                  }`}>
                    {p.status === "paid" && <CheckCircle size={10} />}
                    <CreditCard size={10} />
                    {p.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

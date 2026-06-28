import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, PlusCircle, CreditCard, AlertCircle, CheckCircle } from "lucide-react";
import { StageBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { Deal, Profile } from "@/types";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single() as { data: Profile | null };

  const { data: deals } = await supabase
    .from("deals")
    .select("*")
    .eq("client_id", user.id)
    .not("stage", "in", '("closed","fallen_through")')
    .order("closing_date", { ascending: true }) as { data: Deal[] | null };

  const { data: recentDeals } = await supabase
    .from("deals")
    .select("*")
    .eq("client_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(5) as { data: Deal[] | null };

  const params = await searchParams;
  const isWelcome = params.welcome === "1";
  const activeDeals = deals || [];
  const isSubscription = profile?.plan === "subscription";
  const dealsUsed = profile?.deals_used_this_month || 0;
  const dealsCap = profile?.deals_cap || 10;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Welcome banner */}
      {isWelcome && (
        <div className="mb-6 rounded-xl bg-brand-50 border border-brand-200 px-5 py-4 flex items-start gap-3">
          <CheckCircle size={20} className="text-brand-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-brand-900">Account created successfully!</p>
            <p className="text-brand-700 text-sm mt-0.5">
              Ready to open your first file?{" "}
              <Link href="/dashboard/new-deal" className="underline font-medium">Submit a deal →</Link>
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Hi, {profile?.full_name?.split(" ")[0] || "there"} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Here's what's happening with your deals.</p>
        </div>
        <Link href="/dashboard/new-deal" className="btn-primary text-sm">
          <PlusCircle size={15} /> New deal
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-4">
          <div className="text-2xl font-bold text-slate-900">{activeDeals.length}</div>
          <div className="text-xs text-slate-500 mt-0.5">Active deals</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-slate-900">{recentDeals?.filter(d => d.stage === "closed").length || 0}</div>
          <div className="text-xs text-slate-500 mt-0.5">Closed</div>
        </div>
        <div className="card p-4">
          <div className={`text-2xl font-bold ${isSubscription ? "text-slate-900" : "text-slate-400"}`}>
            {isSubscription ? `${dealsUsed}/${dealsCap}` : "—"}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">Deals used this month</div>
        </div>
        <div className="card p-4">
          <div className="text-sm font-semibold text-slate-900 capitalize">
            {profile?.plan?.replace("_", " ") || "—"}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">Current plan</div>
        </div>
      </div>

      {/* Subscription cap warning */}
      {isSubscription && dealsUsed >= dealsCap - 2 && (
        <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex items-start gap-3">
          <AlertCircle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            You've used <strong>{dealsUsed} of {dealsCap}</strong> deals this month.{" "}
            {dealsUsed >= dealsCap
              ? "You've reached your cap. Contact us to discuss a high-volume plan."
              : `Only ${dealsCap - dealsUsed} left before your monthly cap.`}
          </p>
        </div>
      )}

      {/* Active deals */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900">Active deals</h2>
          <Link href="/dashboard/deals" className="text-sm text-brand-600 hover:underline">View all</Link>
        </div>
        {activeDeals.length === 0 ? (
          <div className="card p-8 text-center">
            <FileText size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No active deals yet.</p>
            <Link href="/dashboard/new-deal" className="btn-primary text-sm mt-4 inline-flex">
              <PlusCircle size={14} /> Open your first file
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {activeDeals.map(deal => (
              <Link key={deal.id} href={`/dashboard/deals/${deal.id}`} className="card p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="font-medium text-slate-900 text-sm">{deal.property_address}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Close: {formatDate(deal.closing_date)}
                  </div>
                </div>
                <StageBadge stage={deal.stage} />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link href="/dashboard/billing" className="card p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
            <CreditCard size={18} className="text-green-600" />
          </div>
          <div>
            <div className="font-medium text-slate-900 text-sm">Billing & payments</div>
            <div className="text-xs text-slate-500">Invoices and subscription status</div>
          </div>
        </Link>
        <Link href="/dashboard/deals" className="card p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
            <FileText size={18} className="text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-slate-900 text-sm">All deals</div>
            <div className="text-xs text-slate-500">Including closed and fallen-through files</div>
          </div>
        </Link>
      </div>
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, Building2, Calendar, CreditCard } from "lucide-react";
import { StageBadge } from "@/components/ui/badge";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { Deal, Profile } from "@/types";

export default async function AdminClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: client } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single() as { data: Profile | null };

  if (!client) notFound();

  const { data: deals } = await supabase
    .from("deals")
    .select("*")
    .eq("client_id", id)
    .order("created_at", { ascending: false }) as { data: Deal[] | null };

  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("client_id", id)
    .order("created_at", { ascending: false });

  const activeDeals  = (deals || []).filter(d => !["closed", "fallen_through"].includes(d.stage));
  const closedDeals  = (deals || []).filter(d => d.stage === "closed");
  const fallenDeals  = (deals || []).filter(d => d.stage === "fallen_through");

  const planColors: Record<string, string> = {
    per_deal:     "bg-blue-50 text-blue-700",
    subscription: "bg-brand-50 text-brand-700",
    high_volume:  "bg-purple-50 text-purple-700",
  };

  function DealRow({ deal }: { deal: Deal }) {
    return (
      <Link
        href={`/admin/deals/${deal.id}`}
        className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors"
      >
        <div className="min-w-0 pr-4">
          <div className="font-medium text-slate-900 text-sm truncate">{deal.property_address}</div>
          <div className="text-xs text-slate-500 mt-0.5">
            {deal.buyer_name && `Buyer: ${deal.buyer_name} · `}Close: {formatDate(deal.closing_date)}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className={`text-xs font-medium ${deal.retainer_paid ? "text-green-600" : "text-amber-600"}`}>
            {deal.retainer_paid ? "Retainer ✓" : "Retainer pending"}
          </span>
          <StageBadge stage={deal.stage} />
        </div>
      </Link>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Back */}
      <Link href="/admin/clients" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-5">
        <ArrowLeft size={15} /> All clients
      </Link>

      {/* Header */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
              <span className="text-brand-700 font-bold text-lg">
                {(client.full_name || client.email || "?")[0].toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{client.full_name || "—"}</h1>
              <div className="flex items-center gap-1.5 text-slate-500 text-sm mt-0.5">
                <Mail size={13} />
                {client.email}
              </div>
              {client.phone && (
                <div className="flex items-center gap-1.5 text-slate-500 text-sm mt-0.5">
                  <Phone size={13} />
                  {client.phone}
                </div>
              )}
              {client.company_name && (
                <div className="flex items-center gap-1.5 text-slate-500 text-sm mt-0.5">
                  <Building2 size={13} />
                  {client.company_name}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${planColors[client.plan] || "bg-slate-100 text-slate-600"}`}>
              {client.plan.replace("_", " ")}
            </span>
            {client.plan === "subscription" && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                client.subscription_status === "active" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
              }`}>
                {client.subscription_status || "pending"}
              </span>
            )}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Calendar size={12} />
              Joined {formatDate(client.created_at)}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-slate-100">
          <div>
            <div className="text-2xl font-bold text-slate-900">{(deals || []).length}</div>
            <div className="text-xs text-slate-500 mt-0.5">Total deals</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{activeDeals.length}</div>
            <div className="text-xs text-slate-500 mt-0.5">Active</div>
          </div>
          <div>
            <div className={`text-2xl font-bold ${client.plan === "subscription" ? "text-slate-900" : "text-slate-400"}`}>
              {client.plan === "subscription" ? `${client.deals_used_this_month}/${client.deals_cap}` : "—"}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">This month</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Deals */}
        <div className="lg:col-span-2 space-y-5">
          {activeDeals.length > 0 && (
            <div className="card">
              <div className="px-5 py-3.5 border-b border-slate-100">
                <h2 className="font-semibold text-slate-900 text-sm">Active deals ({activeDeals.length})</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {activeDeals.map(d => <DealRow key={d.id} deal={d} />)}
              </div>
            </div>
          )}

          {closedDeals.length > 0 && (
            <div className="card">
              <div className="px-5 py-3.5 border-b border-slate-100">
                <h2 className="font-semibold text-slate-900 text-sm">Closed ({closedDeals.length})</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {closedDeals.map(d => <DealRow key={d.id} deal={d} />)}
              </div>
            </div>
          )}

          {fallenDeals.length > 0 && (
            <div className="card">
              <div className="px-5 py-3.5 border-b border-slate-100">
                <h2 className="font-semibold text-slate-900 text-sm">Fallen through ({fallenDeals.length})</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {fallenDeals.map(d => <DealRow key={d.id} deal={d} />)}
              </div>
            </div>
          )}

          {(deals || []).length === 0 && (
            <div className="card p-8 text-center text-slate-400 text-sm">
              No deals yet.
            </div>
          )}
        </div>

        {/* Payment history */}
        <div className="card">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
            <CreditCard size={15} className="text-slate-400" />
            <h2 className="font-semibold text-slate-900 text-sm">Payment history</h2>
          </div>
          {(!payments || payments.length === 0) ? (
            <div className="px-5 py-6 text-sm text-slate-400 text-center">No payments yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {payments.map((p: any) => (
                <div key={p.id} className="px-5 py-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-medium text-slate-900 capitalize">
                        {p.type.replace("_", " ")}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{p.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-slate-900">{formatCurrency(p.amount)}</div>
                      <div className={`text-xs mt-0.5 capitalize ${p.status === "paid" ? "text-green-600" : "text-amber-600"}`}>
                        {p.status}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">{formatDate(p.paid_at || p.created_at)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

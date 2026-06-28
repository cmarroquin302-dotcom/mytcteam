import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { StageBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { Deal } from "@/types";

export default async function DealsListPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: deals } = await supabase
    .from("deals")
    .select("*")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false }) as { data: Deal[] | null };

  const active = (deals || []).filter(d => !["closed", "fallen_through"].includes(d.stage));
  const closed = (deals || []).filter(d => d.stage === "closed");
  const fallen = (deals || []).filter(d => d.stage === "fallen_through");

  function DealRow({ deal }: { deal: Deal }) {
    return (
      <Link
        href={`/dashboard/deals/${deal.id}`}
        className="flex items-center justify-between py-3 px-4 hover:bg-slate-50 rounded-lg transition-colors group"
      >
        <div className="flex-1 min-w-0 pr-4">
          <div className="font-medium text-slate-900 text-sm truncate">{deal.property_address}</div>
          <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-3">
            {deal.buyer_name && <span>Buyer: {deal.buyer_name}</span>}
            <span>Close: {formatDate(deal.closing_date)}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <StageBadge stage={deal.stage} />
          <span className="text-slate-400 text-xs hidden sm:block">{formatDate(deal.created_at)}</span>
        </div>
      </Link>
    );
  }

  function Section({ title, deals }: { title: string; deals: Deal[] }) {
    if (deals.length === 0) return null;
    return (
      <div className="mb-6">
        <h2 className="font-semibold text-slate-700 text-sm mb-2 px-4">{title}</h2>
        <div className="card divide-y divide-slate-100">
          {deals.map(d => <DealRow key={d.id} deal={d} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">My Deals</h1>
        <Link href="/dashboard/new-deal" className="btn-primary text-sm">
          <PlusCircle size={15} /> New deal
        </Link>
      </div>

      {(deals || []).length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-slate-500 text-sm mb-4">You haven't opened any files yet.</p>
          <Link href="/dashboard/new-deal" className="btn-primary text-sm inline-flex">
            <PlusCircle size={14} /> Open your first file
          </Link>
        </div>
      ) : (
        <>
          <Section title={`Active (${active.length})`} deals={active} />
          <Section title={`Closed (${closed.length})`} deals={closed} />
          <Section title={`Fallen Through (${fallen.length})`} deals={fallen} />
        </>
      )}
    </div>
  );
}

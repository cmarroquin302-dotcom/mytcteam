import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { StageBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { PlusCircle } from "lucide-react";

export default async function AdminDealsPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string; q?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  const stageFilter = params.stage;
  const q = params.q;

  const showArchived = params.stage === "archived";

  let query = supabase
    .from("deals")
    .select("*, profiles(full_name, email, company_name)")
    .order("closing_date", { ascending: true, nullsFirst: false });

  if (showArchived) {
    query = query.eq("is_archived", true);
  } else {
    query = query.eq("is_archived", false);
    if (stageFilter && stageFilter !== "all") {
      query = query.eq("stage", stageFilter);
    }
  }
  if (q) {
    query = query.ilike("property_address", `%${q}%`);
  }

  const { data: deals } = await query;

  const stages = [
    { value: "", label: "Active" },
    { value: "intake", label: "Intake" },
    { value: "active_tracking", label: "Tracking" },
    { value: "pre_closing", label: "Pre-Closing" },
    { value: "closing", label: "Closing" },
    { value: "closed", label: "Closed ✓" },
    { value: "fallen_through", label: "Fallen Through" },
    { value: "archived", label: "Archived" },
  ];

  function buildUrl(key: string, val: string) {
    const p = new URLSearchParams();
    if (key !== "stage" && stageFilter) p.set("stage", stageFilter);
    if (key !== "q" && q) p.set("q", q);
    if (val) p.set(key, val);
    const s = p.toString();
    return `/admin/deals${s ? "?" + s : ""}`;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">All Deals</h1>
        <Link href="/admin/deals/new" className="btn-primary text-sm">
          <PlusCircle size={15} /> New deal
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <form method="GET" className="flex-1">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by address…"
            className="input max-w-xs"
          />
          {stageFilter && <input type="hidden" name="stage" value={stageFilter} />}
        </form>
        <div className="flex flex-wrap gap-1.5">
          {stages.map(s => (
            <a
              key={s.value}
              href={buildUrl("stage", s.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                (stageFilter || "") === s.value
                  ? "bg-brand-600 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left">
                <th className="px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Property</th>
                <th className="px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide hidden sm:table-cell">Client</th>
                <th className="px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Stage</th>
                <th className="px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide hidden md:table-cell">Close date</th>
                <th className="px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide hidden lg:table-cell">Retainer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(deals || []).map((deal: any) => (
                <tr key={deal.id} className="hover:bg-slate-50 transition-colors cursor-pointer">
                  <td className="px-4 py-3">
                    <Link href={`/admin/deals/${deal.id}`} className="block">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900">{deal.property_address}</span>
                        {deal.is_archived && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-medium">Archived</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">{deal.buyer_name && `Buyer: ${deal.buyer_name}`}</div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div className="text-slate-700">{deal.profiles?.full_name || "—"}</div>
                    <div className="text-xs text-slate-400">{deal.profiles?.company_name}</div>
                  </td>
                  <td className="px-4 py-3">
                    <StageBadge stage={deal.stage} />
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-slate-600">
                    {formatDate(deal.closing_date)}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className={`text-xs font-medium ${deal.retainer_paid ? "text-green-600" : "text-amber-600"}`}>
                      {deal.retainer_paid ? "Paid" : "Pending"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {(deals || []).length === 0 && (
          <div className="px-4 py-10 text-center text-slate-400 text-sm">No deals match the current filter.</div>
        )}
        {(deals || []).length > 0 && (
          <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-400">
            {(deals || []).length} deal{(deals || []).length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </div>
  );
}

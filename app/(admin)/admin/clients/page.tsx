import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import type { Profile } from "@/types";

export default async function AdminClientsPage() {
  const supabase = await createClient();

  const { data: clients } = await supabase
    .from("profiles")
    .select("*")
    .eq("is_admin", false)
    .order("created_at", { ascending: false }) as { data: Profile[] | null };

  // Get deal counts per client
  const clientIds = (clients || []).map(c => c.id);
  const { data: dealCounts } = await supabase
    .from("deals")
    .select("client_id")
    .in("client_id", clientIds);

  const dealsPerClient: Record<string, number> = {};
  (dealCounts || []).forEach(d => {
    dealsPerClient[d.client_id] = (dealsPerClient[d.client_id] || 0) + 1;
  });

  const planColors: Record<string, string> = {
    per_deal:     "bg-blue-50 text-blue-700",
    subscription: "bg-brand-50 text-brand-700",
    high_volume:  "bg-purple-50 text-purple-700",
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
        <span className="text-sm text-slate-500">{(clients || []).length} total</span>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left">
                <th className="px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Client</th>
                <th className="px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Plan</th>
                <th className="px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide hidden sm:table-cell">Deals</th>
                <th className="px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide hidden md:table-cell">This month</th>
                <th className="px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide hidden lg:table-cell">Joined</th>
                <th className="px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(clients || []).map(client => (
                <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/admin/clients/${client.id}`} className="block">
                      <div className="font-medium text-slate-900">{client.full_name || "—"}</div>
                      <div className="text-xs text-slate-500">{client.email}</div>
                      {client.company_name && (
                        <div className="text-xs text-slate-400">{client.company_name}</div>
                      )}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${planColors[client.plan]}`}>
                      {client.plan.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-slate-700">
                    {dealsPerClient[client.id] || 0}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {client.plan === "subscription" ? (
                      <span className={`text-sm font-medium ${client.deals_used_this_month >= client.deals_cap ? "text-red-600" : "text-slate-700"}`}>
                        {client.deals_used_this_month} / {client.deals_cap}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-slate-500 text-xs">
                    {formatDate(client.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    {client.plan === "subscription" ? (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        client.subscription_status === "active"
                          ? "bg-green-50 text-green-700"
                          : "bg-amber-50 text-amber-700"
                      }`}>
                        {client.subscription_status || "pending"}
                      </span>
                    ) : (
                      <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">active</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/clients/${client.id}`} className="text-xs text-brand-600 hover:underline">
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {(clients || []).length === 0 && (
          <div className="px-4 py-10 text-center text-slate-400 text-sm">No clients yet.</div>
        )}
      </div>
    </div>
  );
}

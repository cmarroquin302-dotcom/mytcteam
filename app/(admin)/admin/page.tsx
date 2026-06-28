import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Users, FileText, AlertCircle, CalendarDays, TrendingUp } from "lucide-react";
import { StageBadge } from "@/components/ui/badge";
import { formatDate, daysUntil, urgencyColor, urgencyLabel } from "@/lib/utils";
import type { Deal } from "@/types";
import { SeedDemoButton } from "@/components/admin/seed-demo-button";

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const [{ count: totalClients }, { count: activeDeals }, { count: totalDeals }, { data: urgentDeals }, { data: recentDeals }] =
    await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_admin", false),
      supabase.from("deals").select("*", { count: "exact", head: true }).not("stage", "in", '("closed","fallen_through")'),
      supabase.from("deals").select("*", { count: "exact", head: true }),
      supabase.from("checklist_items")
        .select("*, deals(property_address, closing_date, stage, client_id, profiles(full_name))")
        .eq("completed", false)
        .not("due_date", "is", null)
        .lte("due_date", new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0])
        .order("due_date")
        .limit(5),
      supabase.from("deals")
        .select("*, profiles(full_name, email)")
        .not("stage", "in", '("closed","fallen_through")')
        .order("updated_at", { ascending: false })
        .limit(8) as unknown as Promise<{ data: (Deal & { profiles: { full_name: string; email: string } })[] | null }>,
    ]);

  const stats = [
    { label: "Total clients",  value: totalClients || 0, icon: Users,       href: "/admin/clients",  color: "bg-blue-50 text-blue-600" },
    { label: "Active deals",   value: activeDeals || 0,  icon: FileText,     href: "/admin/deals",    color: "bg-amber-50 text-amber-600" },
    { label: "All-time deals", value: totalDeals || 0,   icon: TrendingUp,   href: "/admin/deals",    color: "bg-purple-50 text-purple-600" },
    { label: "Urgent items",   value: (urgentDeals || []).length, icon: AlertCircle, href: "/admin/calendar", color: "bg-red-50 text-red-600" },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-7 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Overview</h1>
          <p className="text-slate-500 text-sm mt-1">Everything happening across all clients and deals.</p>
        </div>
        <SeedDemoButton />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, href, color }) => (
          <Link key={label} href={href} className="card p-5 hover:shadow-md transition-shadow">
            <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center mb-3`}>
              <Icon size={18} />
            </div>
            <div className="text-2xl font-bold text-slate-900">{value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Urgent deadlines */}
        <div className="card">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <AlertCircle size={16} className="text-red-500" /> Upcoming deadlines
            </h2>
            <Link href="/admin/calendar" className="text-sm text-brand-600 hover:underline">Full calendar →</Link>
          </div>
          {(!urgentDeals || urgentDeals.length === 0) ? (
            <div className="px-5 py-6 text-center text-slate-400 text-sm">No urgent deadlines in the next 5 days.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {urgentDeals.map((item: any) => {
                const days = daysUntil(item.due_date);
                return (
                  <div key={item.id} className="px-5 py-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-900 truncate">{item.label}</div>
                      <div className="text-xs text-slate-500 truncate">{item.deals?.property_address}</div>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${urgencyColor(days)}`}>
                      {urgencyLabel(days)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent activity */}
        <div className="card">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <CalendarDays size={16} className="text-brand-500" /> Active deals
            </h2>
            <Link href="/admin/deals" className="text-sm text-brand-600 hover:underline">All deals →</Link>
          </div>
          {(!recentDeals || recentDeals.length === 0) ? (
            <div className="px-5 py-6 text-center text-slate-400 text-sm">No active deals.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentDeals.map(deal => (
                <Link key={deal.id} href={`/admin/deals/${deal.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className="min-w-0 pr-4">
                    <div className="text-sm font-medium text-slate-900 truncate">{deal.property_address}</div>
                    <div className="text-xs text-slate-500">{(deal as any).profiles?.full_name} · Close {formatDate(deal.closing_date)}</div>
                  </div>
                  <StageBadge stage={deal.stage} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

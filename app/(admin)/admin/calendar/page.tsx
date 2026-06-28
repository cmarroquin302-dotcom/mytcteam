import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { CalendarDays, AlertCircle, CheckCircle } from "lucide-react";
import { formatDate, daysUntil, urgencyColor, urgencyLabel } from "@/lib/utils";
import { StageBadge } from "@/components/ui/badge";

export default async function AdminCalendarPage() {
  const supabase = await createClient();

  // All upcoming incomplete checklist items with due dates, across all active deals
  const { data: items } = await supabase
    .from("checklist_items")
    .select(`
      *,
      deals (
        id,
        property_address,
        closing_date,
        stage,
        client_id,
        profiles ( full_name, email )
      )
    `)
    .eq("completed", false)
    .not("due_date", "is", null)
    .not("deals.stage", "in", '("closed","fallen_through")')
    .order("due_date", { ascending: true })
    .limit(100);

  // Also get closing dates for active deals
  const { data: closingDeals } = await supabase
    .from("deals")
    .select("id, property_address, closing_date, stage, profiles(full_name, email)")
    .not("stage", "in", '("closed","fallen_through")')
    .not("closing_date", "is", null)
    .order("closing_date", { ascending: true });

  const validItems = (items || []).filter((i: any) => i.deals && i.deals.stage);

  // Group by urgency
  const overdue = validItems.filter((i: any) => daysUntil(i.due_date) < 0);
  const today   = validItems.filter((i: any) => daysUntil(i.due_date) === 0);
  const soon    = validItems.filter((i: any) => daysUntil(i.due_date) > 0 && daysUntil(i.due_date) <= 3);
  const upcoming = validItems.filter((i: any) => daysUntil(i.due_date) > 3);

  function DeadlineRow({ item }: { item: any }) {
    const days = daysUntil(item.due_date);
    return (
      <Link
        href={`/admin/deals/${item.deals?.id}`}
        className="flex items-center justify-between py-2.5 px-4 hover:bg-slate-50 rounded-lg transition-colors"
      >
        <div className="flex items-start gap-3 min-w-0">
          <Circle16 />
          <div className="min-w-0">
            <div className="text-sm font-medium text-slate-900 truncate">{item.label}</div>
            <div className="text-xs text-slate-500 truncate">{item.deals?.property_address}</div>
            <div className="text-xs text-slate-400">{item.deals?.profiles?.full_name}</div>
          </div>
        </div>
        <div className="flex-shrink-0 flex items-center gap-3 ml-3">
          <span className="text-xs text-slate-400 hidden sm:block">{formatDate(item.due_date)}</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${urgencyColor(days)}`}>
            {urgencyLabel(days)}
          </span>
        </div>
      </Link>
    );
  }

  function Circle16() {
    return <div className="w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0 mt-2" />;
  }

  function Section({ title, icon: Icon, items, color }: any) {
    if (items.length === 0) return null;
    return (
      <div className="card mb-5">
        <div className={`px-4 py-3 border-b flex items-center gap-2 ${color}`}>
          <Icon size={16} />
          <span className="font-semibold text-sm">{title} ({items.length})</span>
        </div>
        <div className="py-1">
          {items.map((item: any) => <DeadlineRow key={item.id} item={item} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <CalendarDays size={24} className="text-brand-600" />
          Deadline Calendar
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          All upcoming checklist deadlines across active deals, sorted by urgency.
        </p>
      </div>

      {validItems.length === 0 && (
        <div className="card p-10 text-center">
          <CheckCircle size={32} className="text-green-400 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No upcoming deadlines with due dates set.</p>
          <p className="text-slate-400 text-xs mt-1">Set due dates on checklist items in each deal to see them here.</p>
        </div>
      )}

      <Section title="Overdue" icon={AlertCircle} items={overdue} color="border-red-100 bg-red-50 text-red-700" />
      <Section title="Due today" icon={AlertCircle} items={today} color="border-red-100 bg-orange-50 text-orange-700" />
      <Section title="Next 3 days" icon={CalendarDays} items={soon} color="border-amber-100 bg-amber-50 text-amber-700" />
      <Section title="Upcoming" icon={CalendarDays} items={upcoming} color="border-slate-100 bg-slate-50 text-slate-700" />

      {/* Closing dates */}
      {(closingDeals || []).length > 0 && (
        <div className="card mt-6">
          <div className="px-4 py-3 border-b border-slate-100 bg-green-50 flex items-center gap-2">
            <CheckCircle size={16} className="text-green-600" />
            <span className="font-semibold text-sm text-green-700">Closing dates ({(closingDeals || []).length})</span>
          </div>
          <div className="divide-y divide-slate-100">
            {(closingDeals || []).map((deal: any) => {
              const days = daysUntil(deal.closing_date);
              return (
                <Link key={deal.id} href={`/admin/deals/${deal.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="text-sm font-medium text-slate-900">{deal.property_address}</div>
                    <div className="text-xs text-slate-500">{deal.profiles?.full_name}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StageBadge stage={deal.stage} />
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${urgencyColor(days)}`}>
                      {urgencyLabel(days)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

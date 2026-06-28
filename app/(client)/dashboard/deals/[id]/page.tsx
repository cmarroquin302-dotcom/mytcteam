import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { StageBadge } from "@/components/ui/badge";
import { formatDate, formatCurrency } from "@/lib/utils";
import { CheckCircle, Circle, CalendarDays, DollarSign, Home } from "lucide-react";
import { DEAL_STAGE_ORDER, DEAL_STAGE_LABELS } from "@/types";
import type { Deal, ChecklistItem } from "@/types";
import { TabNav } from "@/components/deal/tab-nav";
import { DocumentsTab } from "@/components/deal/documents-tab";
import { ContactsTab } from "@/components/deal/contacts-tab";
import { DatesTab } from "@/components/deal/dates-tab";
import { MessagesTab } from "@/components/deal/messages-tab";
import type { DealDocument } from "@/components/deal/documents-tab";
import type { DealContact } from "@/components/deal/contacts-tab";
import type { DealDate } from "@/components/deal/dates-tab";
import type { DealMessage } from "@/components/deal/messages-tab";
import { Suspense } from "react";

const CLIENT_TABS = [
  { key: "overview",  label: "Overview" },
  { key: "checklist", label: "Checklist" },
  { key: "documents", label: "Documents" },
  { key: "contacts",  label: "Contacts" },
  { key: "dates",     label: "Key Dates" },
  { key: "messages",  label: "Messages" },
];

export default async function ClientDealDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; new?: string; retainer_paid?: string; retainer_canceled?: string }>;
}) {
  const { id } = await params;
  const { tab = "overview", retainer_paid, retainer_canceled } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: deal } = await supabase
    .from("deals")
    .select("*")
    .eq("id", id)
    .eq("client_id", user.id)
    .single() as { data: Deal | null };

  if (!deal) notFound();

  const [
    { data: items },
    { data: documents },
    { data: contacts },
    { data: dates },
    { data: messages },
  ] = await Promise.all([
    supabase.from("checklist_items").select("*").eq("deal_id", id).eq("admin_only", false).order("sort_order") as unknown as Promise<{ data: ChecklistItem[] | null }>,
    supabase.from("documents").select("*, profiles(full_name, email)").eq("deal_id", id).eq("admin_only", false).order("created_at") as unknown as Promise<{ data: DealDocument[] | null }>,
    supabase.from("deal_contacts").select("*").eq("deal_id", id).order("sort_order") as unknown as Promise<{ data: DealContact[] | null }>,
    supabase.from("deal_dates").select("*").eq("deal_id", id).order("date_value") as unknown as Promise<{ data: DealDate[] | null }>,
    supabase.from("deal_messages").select("*, profiles(full_name, email, is_admin)").eq("deal_id", id).order("created_at") as unknown as Promise<{ data: DealMessage[] | null }>,
  ]);

  const checklist = items || [];
  const completedCount = checklist.filter(i => i.completed).length;
  const stages = DEAL_STAGE_ORDER.filter(s => s !== "closed");
  const currentStageIndex = stages.indexOf(deal.stage as any);
  const baseUrl = `/dashboard/deals/${id}`;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Retainer payment banners */}
      {retainer_paid === "1" && (
        <div className="mb-5 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800 flex items-center gap-2">
          <CheckCircle size={16} className="flex-shrink-0" />
          <span><strong>Retainer paid!</strong> Your file is officially open. We'll be in touch shortly.</span>
        </div>
      )}
      {retainer_canceled === "1" && (
        <div className="mb-5 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 flex items-center gap-2">
          <span className="flex-shrink-0">⚠️</span>
          <span>
            Payment was canceled. Your file is saved — <a href={`/api/billing/retainer?deal_id=${id}`} className="underline font-medium">pay the $75 retainer</a> to activate TC services.
          </span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
              <Home size={14} />
              <span className="font-medium text-slate-900">{deal.property_address}</span>
            </div>
            <StageBadge stage={deal.stage} />
          </div>
          {deal.closing_date && (
            <div className="text-right text-sm">
              <div className="text-slate-500">Target close</div>
              <div className="font-semibold text-slate-900">{formatDate(deal.closing_date)}</div>
            </div>
          )}
        </div>
      </div>

      {/* Tab nav */}
      <Suspense>
        <TabNav tabs={CLIENT_TABS} baseUrl={baseUrl} />
      </Suspense>

      {/* Overview tab */}
      {tab === "overview" && (
        <div className="space-y-6">
          {/* Stage progress */}
          {deal.stage !== "fallen_through" && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                {stages.map((stage, i) => (
                  <div key={stage} className="flex flex-col items-center flex-1">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold mb-1.5 ${
                      i < currentStageIndex
                        ? "bg-brand-600 text-white"
                        : i === currentStageIndex
                        ? "bg-brand-600 text-white ring-4 ring-brand-100"
                        : "bg-slate-100 text-slate-400"
                    }`}>
                      {i < currentStageIndex ? <CheckCircle size={14} /> : i + 1}
                    </div>
                    <span className={`text-[10px] font-medium text-center leading-tight ${
                      i <= currentStageIndex ? "text-brand-600" : "text-slate-400"
                    }`}>
                      {DEAL_STAGE_LABELS[stage]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {/* Deal details */}
            <div className="card p-4">
              <h3 className="font-semibold text-slate-900 text-sm mb-3">Deal details</h3>
              <dl className="space-y-2 text-sm">
                {deal.buyer_name && (
                  <div className="flex justify-between"><dt className="text-slate-500">Buyer</dt><dd className="font-medium text-slate-900 text-right">{deal.buyer_name}</dd></div>
                )}
                {deal.seller_name && (
                  <div className="flex justify-between"><dt className="text-slate-500">Seller</dt><dd className="font-medium text-slate-900 text-right">{deal.seller_name}</dd></div>
                )}
                {deal.contract_price && (
                  <div className="flex justify-between"><dt className="text-slate-500">Price</dt><dd className="font-medium text-slate-900">{formatCurrency(deal.contract_price)}</dd></div>
                )}
                {deal.contract_date && (
                  <div className="flex justify-between"><dt className="text-slate-500">Contract date</dt><dd className="font-medium text-slate-900">{formatDate(deal.contract_date)}</dd></div>
                )}
                {deal.closing_date && (
                  <div className="flex justify-between"><dt className="text-slate-500">Target close</dt><dd className="font-medium text-slate-900">{formatDate(deal.closing_date)}</dd></div>
                )}
              </dl>
            </div>

            {/* Payments */}
            <div className="card p-4">
              <h3 className="font-semibold text-slate-900 text-sm mb-3 flex items-center gap-1.5">
                <DollarSign size={14} /> Payments
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Retainer</span>
                  <span className={`font-medium ${deal.retainer_paid ? "text-green-600" : "text-amber-600"}`}>
                    {deal.retainer_paid ? `Paid ${formatCurrency(deal.retainer_amount)}` : `Due ${formatCurrency(deal.retainer_amount)}`}
                  </span>
                </div>
                {deal.stage !== "fallen_through" && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Closing fee</span>
                    <span className={`font-medium ${deal.closing_fee_paid ? "text-green-600" : "text-slate-400"}`}>
                      {deal.closing_fee_paid
                        ? `Paid ${formatCurrency(deal.closing_fee_amount)}`
                        : `${formatCurrency(deal.closing_fee_amount)} at close`
                      }
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Upcoming dates preview */}
          {(dates || []).filter(d => !d.cleared).slice(0, 3).length > 0 && (
            <div className="card p-4">
              <h3 className="font-semibold text-slate-900 text-sm mb-3 flex items-center gap-1.5">
                <CalendarDays size={14} /> Upcoming deadlines
              </h3>
              <div className="space-y-2">
                {(dates || []).filter(d => !d.cleared).slice(0, 3).map(d => {
                  const today = new Date(); today.setHours(0, 0, 0, 0);
                  const dd = new Date(d.date_value + "T00:00:00");
                  const days = Math.round((dd.getTime() - today.getTime()) / 86400000);
                  return (
                    <div key={d.id} className="flex items-center justify-between text-sm">
                      <span className="text-slate-700">{d.label}</span>
                      <span className={`font-medium ${days <= 3 ? "text-amber-600" : "text-slate-500"}`}>
                        {formatDate(d.date_value)} {days >= 0 ? `(${days}d)` : "(past)"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Checklist tab */}
      {tab === "checklist" && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Deal checklist</h2>
            {checklist.length > 0 && (
              <span className="text-sm text-slate-500">{completedCount}/{checklist.length} complete</span>
            )}
          </div>
          {checklist.length > 0 && (
            <div className="h-1.5 bg-slate-100 rounded-full mb-5">
              <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${(completedCount / checklist.length) * 100}%` }} />
            </div>
          )}
          {checklist.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4">Checklist will appear here once your file is set up.</p>
          ) : (
            <div className="space-y-1">
              {checklist.map(item => (
                <div key={item.id} className={`flex items-start gap-3 py-2 px-3 rounded-lg ${item.completed ? "opacity-60" : ""}`}>
                  {item.completed
                    ? <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                    : <Circle size={16} className="text-slate-300 flex-shrink-0 mt-0.5" />
                  }
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm ${item.completed ? "line-through text-slate-400" : "text-slate-700"}`}>{item.label}</span>
                    {item.due_date && !item.completed && (
                      <div className="flex items-center gap-1 mt-0.5 text-xs text-amber-600">
                        <CalendarDays size={11} /> Due {formatDate(item.due_date)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "documents" && (
        <DocumentsTab dealId={deal.id} documents={documents || []} isAdmin={false} />
      )}
      {tab === "contacts" && (
        <ContactsTab dealId={deal.id} contacts={contacts || []} isAdmin={false} />
      )}
      {tab === "dates" && (
        <DatesTab dealId={deal.id} dates={dates || []} isAdmin={false} />
      )}
      {tab === "messages" && (
        <MessagesTab
          dealId={deal.id}
          initialMessages={messages || []}
          currentUserId={user.id}
          currentUserIsAdmin={false}
        />
      )}
    </div>
  );
}

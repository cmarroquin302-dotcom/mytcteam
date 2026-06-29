import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { StageBadge } from "@/components/ui/badge";
import { formatDate, formatCurrency } from "@/lib/utils";
import { AdminDealActions } from "@/components/admin/deal-actions";
import { AdminChecklist } from "@/components/admin/checklist";
import { NotesEditor } from "@/components/admin/notes-editor";
import { ChecklistLink } from "@/components/admin/checklist-link";
import { TabNav } from "@/components/deal/tab-nav";
import { DocumentsTab } from "@/components/deal/documents-tab";
import { ContactsTab } from "@/components/deal/contacts-tab";
import { DatesTab } from "@/components/deal/dates-tab";
import { MessagesTab } from "@/components/deal/messages-tab";
import type { Deal, ChecklistItem, Profile } from "@/types";
import type { DealDocument } from "@/components/deal/documents-tab";
import type { DealContact } from "@/components/deal/contacts-tab";
import type { DealDate } from "@/components/deal/dates-tab";
import type { DealMessage } from "@/components/deal/messages-tab";
import { Suspense } from "react";

const ADMIN_TABS = [
  { key: "checklist",  label: "Checklist" },
  { key: "documents",  label: "Documents" },
  { key: "contacts",   label: "Contacts" },
  { key: "dates",      label: "Key Dates" },
  { key: "messages",   label: "Messages" },
  { key: "notes",      label: "Notes" },
];

export default async function AdminDealDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab = "checklist" } = await searchParams;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: deal } = await supabase
    .from("deals")
    .select("*, profiles(*)")
    .eq("id", id)
    .single() as { data: (Deal & { profiles: Profile }) | null };

  if (!deal) notFound();

  // Parallel data fetches for all tabs
  const [
    { data: items },
    { data: payments },
    { data: documents },
    { data: contacts },
    { data: dates },
    { data: messages },
  ] = await Promise.all([
    supabase.from("checklist_items").select("*").eq("deal_id", id).order("sort_order") as unknown as Promise<{ data: ChecklistItem[] | null }>,
    supabase.from("payments").select("*").eq("deal_id", id).order("created_at"),
    supabase.from("documents").select("*, profiles(full_name, email)").eq("deal_id", id).order("created_at") as unknown as Promise<{ data: DealDocument[] | null }>,
    supabase.from("deal_contacts").select("*").eq("deal_id", id).order("sort_order") as unknown as Promise<{ data: DealContact[] | null }>,
    supabase.from("deal_dates").select("*").eq("deal_id", id).order("date_value") as unknown as Promise<{ data: DealDate[] | null }>,
    supabase.from("deal_messages").select("*, profiles(full_name, email, is_admin)").eq("deal_id", id).order("created_at") as unknown as Promise<{ data: DealMessage[] | null }>,
  ]);

  const baseUrl = `/admin/deals/${id}`;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <div className="text-slate-500 text-sm mb-1">
            Client: <span className="font-medium text-slate-900">{deal.profiles?.full_name || deal.profiles?.email}</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">{deal.property_address}</h1>
          <div className="mt-1.5 flex items-center gap-2 flex-wrap">
            <StageBadge stage={deal.stage} />
            {deal.closing_date && (
              <span className="text-sm text-slate-500">Close: {formatDate(deal.closing_date)}</span>
            )}
            {deal.is_archived && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 font-medium">Archived</span>
            )}
          </div>
        </div>
        <AdminDealActions deal={deal} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content (tabs) */}
        <div className="lg:col-span-2">
          <Suspense>
            <TabNav tabs={ADMIN_TABS} baseUrl={baseUrl} />
          </Suspense>

          {tab === "checklist" && (
            <AdminChecklist dealId={deal.id} items={items || []} currentStage={deal.stage} />
          )}
          {tab === "documents" && (
            <DocumentsTab dealId={deal.id} documents={documents || []} isAdmin={true} />
          )}
          {tab === "contacts" && (
            <ContactsTab dealId={deal.id} contacts={contacts || []} isAdmin={true} />
          )}
          {tab === "dates" && (
            <DatesTab dealId={deal.id} dates={dates || []} isAdmin={true} />
          )}
          {tab === "messages" && user && (
            <MessagesTab
              dealId={deal.id}
              initialMessages={messages || []}
              currentUserId={user.id}
              currentUserIsAdmin={true}
            />
          )}
          {tab === "notes" && (
            <div className="card p-5">
              <NotesEditor dealId={deal.id} initialNotes={deal.internal_notes} />
              {deal.stage === "fallen_through" && deal.fallen_through_reason && (
                <div className="mt-4 pt-4 border-t border-slate-100 rounded-xl bg-red-50 border border-red-200 p-4">
                  <h3 className="font-semibold text-red-800 text-sm mb-1">Fallen through reason</h3>
                  <p className="text-red-700 text-sm">{deal.fallen_through_reason}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Deal details */}
          <div className="card p-4">
            <h3 className="font-semibold text-slate-900 text-sm mb-3">Deal details</h3>
            <dl className="space-y-2 text-sm">
              {[
                ["Buyer", deal.buyer_name],
                ["Seller", deal.seller_name],
                ["Escrow", deal.escrow_officer],
                ["Lender", deal.lender_name],
                ["Price", deal.contract_price ? formatCurrency(deal.contract_price) : null],
                ["Contract", formatDate(deal.contract_date)],
                ["Target close", formatDate(deal.closing_date)],
              ].filter(([, v]) => v && v !== "—").map(([label, value]) => (
                <div key={label as string} className="flex justify-between">
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="font-medium text-slate-900 text-right max-w-[55%]">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Payments */}
          <div className="card p-4">
            <h3 className="font-semibold text-slate-900 text-sm mb-3">Payments</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Retainer ({formatCurrency(deal.retainer_amount)})</span>
                <span className={`font-medium ${deal.retainer_paid ? "text-green-600" : "text-amber-600"}`}>
                  {deal.retainer_paid ? "Paid" : "Pending"}
                </span>
              </div>
              {deal.stage !== "fallen_through" && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Closing fee ({formatCurrency(deal.closing_fee_amount)})</span>
                  <span className={`font-medium ${deal.closing_fee_paid ? "text-green-600" : "text-slate-400"}`}>
                    {deal.closing_fee_paid ? "Paid" : "At close"}
                  </span>
                </div>
              )}
            </div>
            {payments && payments.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
                {payments.map((p: any) => (
                  <div key={p.id} className="flex justify-between text-xs text-slate-500">
                    <span className="capitalize">{p.type.replace("_", " ")}</span>
                    <span>{formatDate(p.paid_at || p.created_at)} · {p.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Checklist link */}
                    <ChecklistLink
                                  dealId={deal.id}
                                  initialUrl={deal.checklist_url ?? null}
                                  initialNotes={deal.checklist_notes ?? null}
                                />

          {/* Quick stats */}
          <div className="card p-4 grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-lg font-bold text-slate-900">{(items || []).filter(i => i.completed).length}</div>
              <div className="text-xs text-slate-400">Items done</div>
            </div>
            <div>
              <div className="text-lg font-bold text-slate-900">{(documents || []).length}</div>
              <div className="text-xs text-slate-400">Docs</div>
            </div>
            <div>
              <div className="text-lg font-bold text-slate-900">{(messages || []).length}</div>
              <div className="text-xs text-slate-400">Messages</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

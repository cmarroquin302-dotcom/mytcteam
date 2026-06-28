"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DEAL_STAGE_LABELS, DEAL_STAGE_ORDER } from "@/types";
import type { Deal, DealStage } from "@/types";
import { ChevronDown, AlertTriangle, CheckCircle, Archive, Trash2, CheckSquare } from "lucide-react";

export function AdminDealActions({ deal }: { deal: Deal }) {
  const [loading, setLoading] = useState(false);
  const [showFallenModal, setShowFallenModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reason, setReason] = useState("");
  const router = useRouter();

  async function updateStage(stage: DealStage) {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("deals").update({ stage, updated_at: new Date().toISOString() }).eq("id", deal.id);
    router.refresh();
    setLoading(false);
  }

  async function markFallenThrough() {
    if (!reason.trim()) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.from("deals").update({
      stage: "fallen_through",
      fallen_through_reason: reason,
      updated_at: new Date().toISOString(),
    }).eq("id", deal.id);
    setShowFallenModal(false);
    router.refresh();
    setLoading(false);
  }

  async function toggleRetainer() {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("deals").update({ retainer_paid: !deal.retainer_paid }).eq("id", deal.id);
    router.refresh();
    setLoading(false);
  }

  async function toggleClosingFee() {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("deals").update({ closing_fee_paid: !deal.closing_fee_paid }).eq("id", deal.id);
    router.refresh();
    setLoading(false);
  }

  async function toggleArchive() {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("deals").update({ is_archived: !deal.is_archived }).eq("id", deal.id);
    router.refresh();
    setLoading(false);
  }

  async function deleteDeal() {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("deals").delete().eq("id", deal.id);
    router.push("/admin/deals");
  }

  const isFinal = deal.stage === "closed" || deal.stage === "fallen_through";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Stage select */}
      <div className="relative">
        <select
          value={deal.stage}
          onChange={e => updateStage(e.target.value as DealStage)}
          disabled={loading}
          className="pl-3 pr-8 py-2 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
        >
          {[...DEAL_STAGE_ORDER, "fallen_through" as DealStage].map(s => (
            <option key={s} value={s}>{DEAL_STAGE_LABELS[s]}</option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>

      {/* Close deal — prominent button when deal is active */}
      {!isFinal && (
        <button
          onClick={() => updateStage("closed")}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg font-medium border border-green-300 bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
        >
          <CheckSquare size={13} />
          Mark closed
        </button>
      )}

      {/* Retainer toggle */}
      <button
        onClick={toggleRetainer}
        disabled={loading}
        className={`text-xs px-3 py-2 rounded-lg font-medium border transition-colors ${
          deal.retainer_paid
            ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
            : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
        }`}
      >
        <CheckCircle size={13} className="inline mr-1" />
        Retainer {deal.retainer_paid ? "paid" : "unpaid"}
      </button>

      {!isFinal && (
        <button
          onClick={toggleClosingFee}
          disabled={loading}
          className={`text-xs px-3 py-2 rounded-lg font-medium border transition-colors ${
            deal.closing_fee_paid
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
          }`}
        >
          Closing fee {deal.closing_fee_paid ? "paid" : "unpaid"}
        </button>
      )}

      {/* Fallen through */}
      {!isFinal && (
        <button
          onClick={() => setShowFallenModal(true)}
          disabled={loading}
          className="text-xs px-3 py-2 rounded-lg font-medium border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
        >
          <AlertTriangle size={13} className="inline mr-1" />
          Fallen through
        </button>
      )}

      {/* Archive */}
      <button
        onClick={toggleArchive}
        disabled={loading}
        className={`text-xs px-3 py-2 rounded-lg font-medium border transition-colors ${
          deal.is_archived
            ? "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
            : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
        }`}
      >
        <Archive size={13} className="inline mr-1" />
        {deal.is_archived ? "Unarchive" : "Archive"}
      </button>

      {/* Delete */}
      <button
        onClick={() => setShowDeleteModal(true)}
        disabled={loading}
        className="text-xs px-3 py-2 rounded-lg font-medium border border-red-200 text-red-500 bg-white hover:bg-red-50 transition-colors"
      >
        <Trash2 size={13} className="inline mr-1" />
        Delete
      </button>

      {/* Fallen through modal */}
      {showFallenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="font-semibold text-slate-900 mb-1">Mark as Fallen Through</h3>
            <p className="text-sm text-slate-500 mb-4">
              This will mark the deal as fallen through. Retainer is kept. No closing fee will be charged.
            </p>
            <label className="label">Reason</label>
            <textarea
              className="input mb-4 resize-none"
              rows={3}
              placeholder="e.g. Buyer financing fell through, inspection issues..."
              value={reason}
              onChange={e => setReason(e.target.value)}
            />
            <div className="flex gap-3">
              <button
                onClick={markFallenThrough}
                disabled={!reason.trim() || loading}
                className="btn-primary text-sm bg-red-600 hover:bg-red-700 focus:ring-red-500"
              >
                Confirm
              </button>
              <button onClick={() => setShowFallenModal(false)} className="btn-secondary text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="font-semibold text-slate-900 mb-1">Delete Deal?</h3>
            <p className="text-sm text-slate-500 mb-4">
              This permanently deletes <strong>{deal.property_address}</strong> and all its checklist items and payments. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={deleteDeal}
                disabled={loading}
                className="btn-primary text-sm bg-red-600 hover:bg-red-700 focus:ring-red-500"
              >
                <Trash2 size={13} /> Yes, delete permanently
              </button>
              <button onClick={() => setShowDeleteModal(false)} className="btn-secondary text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

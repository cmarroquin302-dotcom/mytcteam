"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CalendarDays, AlertCircle, CheckCircle2, Pencil, Trash2, Plus, Check, X } from "lucide-react";
import { formatDate } from "@/lib/utils";

export interface DealDate {
  id: string;
  deal_id: string;
  label: string;
  date_value: string; // ISO date
  category: string;
  is_contingency: boolean;
  cleared: boolean;
  notes: string | null;
}

const PRESET_DATES: { label: string; category: string; is_contingency: boolean }[] = [
  { label: "Earnest Money Deposit (EMD) Due",           category: "earnest_money",     is_contingency: false },
  { label: "Inspection Contingency Deadline",            category: "inspection",        is_contingency: true  },
  { label: "Appraisal Contingency Deadline",             category: "appraisal",         is_contingency: true  },
  { label: "Loan / Financing Contingency Deadline",      category: "loan",              is_contingency: true  },
  { label: "HOA Document Review Deadline",               category: "hoa",               is_contingency: false },
  { label: "Seller Disclosures Deadline",                category: "disclosures",       is_contingency: false },
  { label: "Buyer Investigation Period Ends",            category: "investigation",     is_contingency: false },
  { label: "Title Review Deadline",                      category: "title",             is_contingency: false },
  { label: "Final Walkthrough",                          category: "walkthrough",       is_contingency: false },
  { label: "Signing Appointment",                        category: "signing",           is_contingency: false },
  { label: "Close of Escrow (COE)",                      category: "closing",           is_contingency: false },
  { label: "Possession Date",                            category: "possession",        is_contingency: false },
];

const CATEGORY_COLOR: Record<string, string> = {
  earnest_money:  "bg-amber-50 text-amber-700",
  inspection:     "bg-blue-50 text-blue-700",
  appraisal:      "bg-cyan-50 text-cyan-700",
  loan:           "bg-indigo-50 text-indigo-700",
  hoa:            "bg-slate-100 text-slate-600",
  disclosures:    "bg-orange-50 text-orange-700",
  investigation:  "bg-purple-50 text-purple-700",
  title:          "bg-teal-50 text-teal-700",
  walkthrough:    "bg-green-50 text-green-700",
  signing:        "bg-rose-50 text-rose-700",
  closing:        "bg-brand-50 text-brand-700",
  possession:     "bg-emerald-50 text-emerald-700",
  custom:         "bg-slate-100 text-slate-600",
};

function daysUntil(dateStr: string) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr + "T00:00:00");
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}

const BLANK = { label: "", date_value: "", category: "custom", is_contingency: false, notes: "" };

export function DatesTab({ dealId, dates, isAdmin }: {
  dealId: string;
  dates: DealDate[];
  isAdmin: boolean;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [usePreset, setUsePreset] = useState(true);
  const [presetIdx, setPresetIdx] = useState(0);
  const [editId, setEditId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const sorted = [...dates].sort((a, b) => a.date_value.localeCompare(b.date_value));
  const upcoming = sorted.filter(d => !d.cleared && daysUntil(d.date_value) >= 0);
  const past = sorted.filter(d => d.cleared || daysUntil(d.date_value) < 0);

  async function handleAdd() {
    if (!form.date_value) return;
    setSaving(true);
    const supabase = createClient();
    const payload = usePreset
      ? { deal_id: dealId, ...PRESET_DATES[presetIdx], date_value: form.date_value, notes: form.notes }
      : { deal_id: dealId, ...form };
    await supabase.from("deal_dates").insert(payload);
    setSaving(false);
    setShowAdd(false);
    setForm(BLANK);
    router.refresh();
  }

  async function toggleCleared(d: DealDate) {
    const supabase = createClient();
    await supabase.from("deal_dates").update({ cleared: !d.cleared }).eq("id", d.id);
    router.refresh();
  }

  async function saveEdit(d: DealDate) {
    setSaving(true);
    const supabase = createClient();
    await supabase.from("deal_dates").update({ date_value: editDate, notes: editNotes }).eq("id", d.id);
    setSaving(false);
    setEditId(null);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this date?")) return;
    const supabase = createClient();
    await supabase.from("deal_dates").delete().eq("id", id);
    router.refresh();
  }

  function DateRow({ d }: { d: DealDate }) {
    const days = daysUntil(d.date_value);
    const isOverdue = !d.cleared && days < 0;
    const isUrgent = !d.cleared && days >= 0 && days <= 3;
    const editing = editId === d.id;

    return (
      <div className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
        d.cleared ? "bg-slate-50 border-slate-100 opacity-70" :
        isOverdue ? "bg-red-50 border-red-200" :
        isUrgent ? "bg-amber-50 border-amber-200" :
        "bg-white border-slate-200"
      }`}>
        {/* Toggle cleared */}
        {isAdmin ? (
          <button onClick={() => toggleCleared(d)} className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
            d.cleared ? "bg-green-500 border-green-500 text-white" : "border-slate-300 hover:border-brand-500"
          }`}>
            {d.cleared && <CheckCircle2 size={12} />}
          </button>
        ) : (
          <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
            d.cleared ? "bg-green-500 border-green-500 text-white" : "border-slate-300"
          }`}>
            {d.cleared && <CheckCircle2 size={12} />}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2 mb-1">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLOR[d.category] || CATEGORY_COLOR.custom}`}>
              {d.label}
            </span>
            {d.is_contingency && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-purple-50 text-purple-600 font-medium">Contingency</span>
            )}
            {d.cleared && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-green-50 text-green-600 font-medium">Cleared</span>
            )}
          </div>

          {editing ? (
            <div className="flex items-center gap-2 mt-2">
              <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} className="input text-sm" />
              <input value={editNotes} onChange={e => setEditNotes(e.target.value)} placeholder="Notes" className="input text-sm flex-1" />
              <button onClick={() => saveEdit(d)} disabled={saving} className="btn-primary text-xs py-1.5"><Check size={12} /></button>
              <button onClick={() => setEditId(null)} className="btn-secondary text-xs py-1.5"><X size={12} /></button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className={`text-sm font-semibold ${d.cleared ? "text-slate-400 line-through" : isOverdue ? "text-red-700" : "text-slate-900"}`}>
                {formatDate(d.date_value)}
              </div>
              {!d.cleared && (
                <div className={`flex items-center gap-1 text-xs font-medium ${
                  isOverdue ? "text-red-600" : isUrgent ? "text-amber-600" : "text-slate-500"
                }`}>
                  {isOverdue && <AlertCircle size={11} />}
                  {isOverdue ? `${Math.abs(days)}d overdue` : days === 0 ? "Today!" : `in ${days}d`}
                </div>
              )}
              {d.notes && <span className="text-xs text-slate-400 italic truncate max-w-[180px]">{d.notes}</span>}
            </div>
          )}
        </div>

        {isAdmin && !editing && (
          <div className="flex gap-1 flex-shrink-0">
            <button onClick={() => { setEditId(d.id); setEditDate(d.date_value); setEditNotes(d.notes || ""); }} className="p-1 text-slate-400 hover:text-brand-600"><Pencil size={13} /></button>
            <button onClick={() => handleDelete(d.id)} className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={13} /></button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {dates.length === 0 && !showAdd && (
        <div className="card p-8 text-center">
          <CalendarDays size={28} className="mx-auto mb-2 text-slate-300" />
          <p className="text-slate-400 text-sm">No key dates added yet.{isAdmin ? " Add all contingency and closing deadlines." : ""}</p>
        </div>
      )}

      {upcoming.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Upcoming</h4>
          <div className="space-y-2">{upcoming.map(d => <DateRow key={d.id} d={d} />)}</div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Past / Cleared</h4>
          <div className="space-y-2">{past.map(d => <DateRow key={d.id} d={d} />)}</div>
        </div>
      )}

      {/* Add form */}
      {isAdmin && (
        showAdd ? (
          <div className="card p-5">
            <h4 className="font-semibold text-slate-900 mb-4 text-sm">Add key date</h4>
            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" checked={usePreset} onChange={() => setUsePreset(true)} /> Use standard date
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" checked={!usePreset} onChange={() => setUsePreset(false)} /> Custom date
              </label>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {usePreset ? (
                <div className="sm:col-span-2">
                  <label className="label">Date type</label>
                  <select value={presetIdx} onChange={e => setPresetIdx(+e.target.value)} className="input">
                    {PRESET_DATES.map((p, i) => <option key={i} value={i}>{p.label}</option>)}
                  </select>
                </div>
              ) : (
                <div className="sm:col-span-2">
                  <label className="label">Label</label>
                  <input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} className="input" placeholder="e.g. Mello-Roos Review" />
                </div>
              )}
              <div>
                <label className="label">Date *</label>
                <input type="date" value={form.date_value} onChange={e => setForm(f => ({ ...f, date_value: e.target.value }))} className="input" />
              </div>
              <div>
                <label className="label">Notes (optional)</label>
                <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="input" placeholder="Brief note" />
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={handleAdd} disabled={!form.date_value || saving || (!usePreset && !form.label)} className="btn-primary text-sm">
                <Check size={14} /> Add date
              </button>
              <button onClick={() => { setShowAdd(false); setForm(BLANK); }} className="btn-secondary text-sm">Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 font-medium">
            <Plus size={16} /> Add key date
          </button>
        )
      )}
    </div>
  );
}

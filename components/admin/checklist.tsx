"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, Circle, CalendarDays, Plus, Trash2 } from "lucide-react";
import { DEAL_STAGE_LABELS } from "@/types";
import { formatDate } from "@/lib/utils";
import type { ChecklistItem, DealStage } from "@/types";

export function AdminChecklist({
  dealId,
  items,
  currentStage,
}: {
  dealId: string;
  items: ChecklistItem[];
  currentStage: DealStage;
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newDue, setNewDue] = useState("");
  const [newAdminOnly, setNewAdminOnly] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const grouped = items.reduce<Record<string, ChecklistItem[]>>((acc, item) => {
    acc[item.stage] = acc[item.stage] || [];
    acc[item.stage].push(item);
    return acc;
  }, {});

  const stages = Object.keys(grouped) as DealStage[];

  async function toggleItem(item: ChecklistItem) {
    setLoading(item.id);
    const supabase = createClient();
    await supabase.from("checklist_items").update({
      completed: !item.completed,
      completed_at: !item.completed ? new Date().toISOString() : null,
    }).eq("id", item.id);
    router.refresh();
    setLoading(null);
  }

  async function deleteItem(id: string) {
    setLoading(id);
    const supabase = createClient();
    await supabase.from("checklist_items").delete().eq("id", id);
    router.refresh();
    setLoading(null);
  }

  async function updateDueDate(id: string, due_date: string) {
    const supabase = createClient();
    await supabase.from("checklist_items").update({ due_date: due_date || null }).eq("id", id);
    router.refresh();
  }

  async function addItem() {
    if (!newLabel.trim()) return;
    setLoading("new");
    const supabase = createClient();
    await supabase.from("checklist_items").insert({
      deal_id: dealId,
      stage: currentStage,
      label: newLabel,
      due_date: newDue || null,
      admin_only: newAdminOnly,
      sort_order: items.filter(i => i.stage === currentStage).length + 1,
    });
    setNewLabel("");
    setNewDue("");
    setNewAdminOnly(false);
    setAdding(false);
    router.refresh();
    setLoading(null);
  }

  return (
    <div className="card">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2 className="font-semibold text-slate-900">Checklist</h2>
        <button
          onClick={() => setAdding(!adding)}
          className="btn-ghost text-sm text-brand-600"
        >
          <Plus size={15} /> Add item
        </button>
      </div>

      {adding && (
        <div className="px-5 py-4 bg-brand-50 border-b border-brand-100 space-y-3">
          <input
            className="input text-sm"
            placeholder="Item label…"
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
          />
          <div className="flex gap-3">
            <input
              type="date"
              className="input text-sm flex-1"
              value={newDue}
              onChange={e => setNewDue(e.target.value)}
            />
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={newAdminOnly} onChange={e => setNewAdminOnly(e.target.checked)} />
              Admin only
            </label>
          </div>
          <div className="flex gap-2">
            <button onClick={addItem} disabled={loading === "new" || !newLabel.trim()} className="btn-primary text-xs">
              Add
            </button>
            <button onClick={() => setAdding(false)} className="btn-secondary text-xs">Cancel</button>
          </div>
        </div>
      )}

      <div className="divide-y divide-slate-100">
        {stages.length === 0 ? (
          <div className="px-5 py-6 text-center text-slate-400 text-sm">
            No checklist items yet. Add one above.
          </div>
        ) : (
          stages.map(stage => (
            <div key={stage}>
              <div className="px-5 py-2 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {DEAL_STAGE_LABELS[stage]}
              </div>
              {grouped[stage].map(item => (
                <div
                  key={item.id}
                  className={`px-5 py-3 flex items-start gap-3 group ${item.completed ? "opacity-60" : ""}`}
                >
                  <button
                    onClick={() => toggleItem(item)}
                    disabled={loading === item.id}
                    className="flex-shrink-0 mt-0.5"
                  >
                    {item.completed
                      ? <CheckCircle size={17} className="text-green-500" />
                      : <Circle size={17} className="text-slate-300 hover:text-brand-400 transition-colors" />
                    }
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm ${item.completed ? "line-through text-slate-400" : "text-slate-800"}`}>
                      {item.label}
                      {item.admin_only && (
                        <span className="ml-2 text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">admin</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      {!item.completed && (
                        <label className="flex items-center gap-1 text-xs text-slate-400 cursor-pointer">
                          <CalendarDays size={11} />
                          <input
                            type="date"
                            defaultValue={item.due_date || ""}
                            className="text-xs text-slate-500 bg-transparent border-none outline-none cursor-pointer"
                            onChange={e => updateDueDate(item.id, e.target.value)}
                          />
                        </label>
                      )}
                      {item.completed_at && item.completed && (
                        <span className="text-xs text-slate-400">Done {formatDate(item.completed_at)}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteItem(item.id)}
                    disabled={loading === item.id}
                    className="opacity-0 group-hover:opacity-100 flex-shrink-0 text-slate-300 hover:text-red-400 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

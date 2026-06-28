"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Pencil, Save, X } from "lucide-react";

export function NotesEditor({ dealId, initialNotes }: { dealId: string; initialNotes: string | null }) {
  const [editing, setEditing] = useState(false);
  const [notes, setNotes] = useState(initialNotes || "");
  const [saved, setSaved] = useState(initialNotes || "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    await supabase.from("deals").update({ internal_notes: notes }).eq("id", dealId);
    setSaved(notes);
    setSaving(false);
    setEditing(false);
  }

  function handleCancel() {
    setNotes(saved);
    setEditing(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-slate-900 text-sm">Internal notes</h3>
        {!editing && (
          <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-xs text-slate-400 hover:text-brand-600 transition-colors">
            <Pencil size={12} /> Edit
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-2">
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={8}
            className="input resize-none text-sm w-full font-mono"
            placeholder="Internal notes, workflow reminders, issues to track — admin eyes only."
            autoFocus
          />
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving} className="btn-primary text-xs py-1.5">
              <Save size={13} /> {saving ? "Saving…" : "Save"}
            </button>
            <button onClick={handleCancel} className="btn-secondary text-xs py-1.5">
              <X size={13} /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <p
          onClick={() => setEditing(true)}
          className="text-slate-500 text-sm whitespace-pre-wrap cursor-text min-h-[60px] rounded-lg hover:bg-slate-50 p-2 -mx-2 transition-colors"
        >
          {saved || <span className="text-slate-300 italic">Click to add internal notes…</span>}
        </p>
      )}
    </div>
  );
}

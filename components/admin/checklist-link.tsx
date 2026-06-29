"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";

interface Props {
    dealId: string;
  initialUrl: string | null;
  initialNotes: string | null;
}

export function ChecklistLink({ dealId, initialUrl, initialNotes }: Props) {
  const [editing, setEditing] = useState(false);
  const [url, setUrl] = useState(initialUrl || "");
  const [notes, setNotes] = useState(initialNotes || "");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSave() {
    startTransition(async () => {
      const supabase = createClient();
      await supabase
        .from("deals")
        .update({ checklist_url: url || null, checklist_notes: notes || null })
        .eq("id", dealId);
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 2500);
});
}

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-900 text-sm">Checklist / Files</h3>
{!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
{url ? "Edit" : "+ Add link"}
          </button>
        )}
{saved && (
          <span className="text-xs text-green-600 font-medium">Saved ✓</span>
        )}
      </div>

{editing ? (
        <div className="space-y-2">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Google Sheet / Drive URL</label>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/..."
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Tab 2 = earnest money tracker"
              rows={2}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={isPending}
              className="btn-primary text-xs px-3 py-1.5"
            >
{isPending ? "Saving…" : "Save"}
            </button>
            <button
              onClick={() => { setEditing(false); setUrl(initialUrl || ""); setNotes(initialNotes || ""); }}
              className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1.5"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : url ? (
        <div className="space-y-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium truncate"
          >
            <svg className="w-4 h-4 flex-shrink-0 text-green-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H7v-2h5v2zm5-4H7v-2h10v2zm0-4H7V7h10v2z"/>
            </svg>
            Open Checklist Sheet
          </a>
{notes && (
            <p className="text-xs text-slate-500">{notes}</p>
          )}
        </div>
      ) : (
        <p className="text-xs text-slate-400 italic">No checklist linked yet. Click "+ Add link" to attach a Google Sheet.</p>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { TableProperties, ExternalLink, CheckCircle, Info } from "lucide-react";

interface Props {
  dealId: string;
  initialUrl: string | null;
}

function toEmbedUrl(raw: string): string {
  if (!raw) return "";
  try {
    const url = new URL(raw);
    if (url.pathname.includes("/pubhtml")) return raw;
    const match = url.pathname.match(/\/spreadsheets\/d\/([^/]+)/);
    if (!match) return raw;
    const id = match[1];
    return `https://docs.google.com/spreadsheets/d/${id}/pubhtml?widget=true&headers=false`;
  } catch {
    return raw;
  }
}

export function DealSpreadsheetTab({ dealId, initialUrl }: Props) {
  const [url, setUrl] = useState(initialUrl || "");
  const [embedUrl, setEmbedUrl] = useState(initialUrl ? toEmbedUrl(initialUrl) : "");
  const [editing, setEditing] = useState(!initialUrl);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    await supabase.from("deals").update({ checklist_url: url || null }).eq("id", dealId);
    setEmbedUrl(toEmbedUrl(url));
    setEditing(false);
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="flex flex-col" style={{ minHeight: "600px" }}>
      <div className="card p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TableProperties size={16} className="text-slate-500" />
            <h3 className="font-semibold text-slate-900 text-sm">TC Checklist Sheet</h3>
          </div>
          <div className="flex items-center gap-2">
            {saved && (
              <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                <CheckCircle size={12} /> Saved
              </span>
            )}
            {!editing && url && (
              <>
                <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700">
                  <ExternalLink size={13} /> Open
                </a>
                <button onClick={() => setEditing(true)} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                  Change
                </button>
              </>
            )}
          </div>
        </div>
        {editing ? (
          <div className="space-y-2">
            <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://docs.google.com/spreadsheets/d/…/edit" className="input w-full font-mono text-sm" autoFocus />
            <div className="flex items-start gap-2 text-xs text-slate-400">
              <Info size={12} className="mt-0.5 flex-shrink-0" />
              <span>Go to File → Share → Publish to web in Google Sheets so it embeds without sign-in.</span>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={saving || !url} className="btn-primary text-xs px-3 py-1.5">
                {saving ? "Saving…" : "Save & embed"}
              </button>
              {url && (
                <button onClick={() => setEditing(false)} className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1.5">
                  Cancel
                </button>
              )}
            </div>
          </div>
        ) : url ? (
          <p className="text-xs text-slate-500 font-mono truncate">{url}</p>
        ) : null}
      </div>
      <div className="flex-1 bg-slate-100 rounded-xl overflow-hidden" style={{ minHeight: "500px" }}>
        {embedUrl ? (
          <iframe src={embedUrl} className="w-full h-full border-0" style={{ minHeight: "500px" }} allowFullScreen title="TC Checklist Sheet" />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-24">
            <TableProperties size={40} className="text-slate-300" />
            <p className="text-slate-500 font-medium text-sm">No sheet linked yet</p>
            <p className="text-slate-400 text-xs max-w-xs text-center">Paste your Google Sheets URL above and click <strong>Save &amp; embed</strong>.</p>
          </div>
        )}
      </div>
    </div>
  );
}

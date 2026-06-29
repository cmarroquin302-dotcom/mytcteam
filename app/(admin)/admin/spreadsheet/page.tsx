"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { TableProperties, CheckCircle, ExternalLink, Info } from "lucide-react";

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

export default function AdminSpreadsheetPage() {
  const [sheetsUrl, setSheetsUrl] = useState("");
  const [embedUrl, setEmbedUrl] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "google_sheets_url")
        .single();
      if (data?.value) {
        setSheetsUrl(data.value);
        setEmbedUrl(toEmbedUrl(data.value));
      }
      setLoadingData(false);
    }
    load();
  }, []);

  async function save() {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("app_settings").upsert(
      { key: "google_sheets_url", value: sheetsUrl, updated_at: new Date().toISOString() },
      { onConflict: "key" }
    );
    setEmbedUrl(toEmbedUrl(sheetsUrl));
    setSaved(true);
    setLoading(false);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="p-6 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-2 mb-4">
          <TableProperties size={22} className="text-slate-600" />
          <h1 className="text-2xl font-bold text-slate-900">Spreadsheet</h1>
        </div>

        {saved && (
          <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-2.5 text-sm text-green-700 flex items-center gap-2">
            <CheckCircle size={15} /> Spreadsheet link saved.
          </div>
        )}

        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="label mb-1.5">Google Sheets URL</label>
            <input
              type="url"
              value={sheetsUrl}
              onChange={e => setSheetsUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/…/edit"
              className="input w-full font-mono text-sm"
            />
          </div>
          <button onClick={save} disabled={loading || !sheetsUrl} className="btn-primary whitespace-nowrap">
            {loading ? "Saving…" : "Save & embed"}
          </button>
          {sheetsUrl && (
            <a
              href={sheetsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
            >
              <ExternalLink size={14} /> Open in Sheets
            </a>
          )}
        </div>

        <div className="mt-3 flex items-start gap-2 text-xs text-slate-500">
          <Info size={13} className="mt-0.5 flex-shrink-0" />
          <span>
            For the embed to work, open your Google Sheet → <strong>File → Share → Publish to web</strong> → publish, then paste the regular edit URL here.
          </span>
        </div>
      </div>

      <div className="flex-1 bg-slate-100 p-4">
        {loadingData ? (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm">Loading…</div>
        ) : embedUrl ? (
          <iframe
            src={embedUrl}
            className="w-full h-full rounded-xl border border-slate-200 bg-white shadow-sm"
            frameBorder="0"
            allowFullScreen
            title="Google Sheet"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3">
            <TableProperties size={40} className="text-slate-300" />
            <p className="text-slate-500 font-medium">No spreadsheet linked yet</p>
            <p className="text-slate-400 text-sm max-w-sm">
              Paste a Google Sheets URL above and click <strong>Save &amp; embed</strong> to display it here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

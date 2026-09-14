"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Sparkles, ChevronDown, ChevronUp, Loader2, CheckCircle2, X } from "lucide-react";

interface ExtractedFields {
  property_address?: string | null;
  buyer_name?: string | null;
  seller_name?: string | null;
  contract_price?: number | null;
  contract_date?: string | null;
  closing_date?: string | null;
  escrow_officer?: string | null;
  lender_name?: string | null;
}

const FIELD_LABELS: Record<keyof ExtractedFields, string> = {
  property_address: "Address",
  buyer_name: "Buyer",
  seller_name: "Seller",
  contract_price: "Price",
  contract_date: "Contract date",
  closing_date: "Closing date",
  escrow_officer: "Escrow officer",
  lender_name: "Lender",
};

export function DealSmartFill({ dealId }: { dealId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fields, setFields] = useState<ExtractedFields | null>(null);
  const [error, setError] = useState("");

  async function handleExtract() {
    if (!pasteText.trim()) return;
    setExtracting(true);
    setFields(null);
    setError("");
    try {
      const res = await fetch("/api/deals/parse-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: pasteText }),
      });
      const { fields: extracted } = await res.json();
      // Filter to only keys with actual values
      const filtered: ExtractedFields = {};
      for (const key of Object.keys(FIELD_LABELS) as (keyof ExtractedFields)[]) {
        if (extracted[key] != null && extracted[key] !== "") {
          (filtered as any)[key] = extracted[key];
        }
      }
      setFields(filtered);
      if (Object.keys(filtered).length === 0) {
        setError("No fields found — try pasting more text from the contract or email.");
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setExtracting(false);
    }
  }

  function removeField(key: keyof ExtractedFields) {
    if (!fields) return;
    const updated = { ...fields };
    delete updated[key];
    setFields(updated);
  }

  async function handleApply() {
    if (!fields || Object.keys(fields).length === 0) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("deals").update(fields as any).eq("id", dealId);
    setSaving(false);
    setOpen(false);
    setPasteText("");
    setFields(null);
    router.refresh();
  }

  const extractedCount = fields ? Object.keys(fields).length : 0;

  return (
    <div className="rounded-xl border border-brand-200 bg-brand-50 overflow-hidden mb-6">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-brand-600" />
          <span className="font-semibold text-brand-900 text-sm">
            Smart Fill
            <span className="font-normal text-brand-600 ml-1">— paste a contract or email to update fields</span>
          </span>
          {fields && extractedCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
              <CheckCircle2 size={11} /> {extractedCount} field{extractedCount !== 1 ? "s" : ""} found
            </span>
          )}
        </div>
        {open ? <ChevronUp size={15} className="text-brand-500" /> : <ChevronDown size={15} className="text-brand-500" />}
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-brand-100 space-y-3">
          {!fields ? (
            <>
              <p className="text-xs text-brand-600 mt-3 mb-2">
                Paste any text from an email, contract, or MLS sheet to fill in missing deal details.
              </p>
              <textarea
                value={pasteText}
                onChange={e => setPasteText(e.target.value)}
                rows={5}
                className="input resize-none text-sm"
                placeholder="Paste email or contract text here…"
                autoFocus
              />
              <div className="flex gap-2 items-center">
                <button
                  type="button"
                  onClick={handleExtract}
                  disabled={extracting || !pasteText.trim()}
                  className="btn-primary text-sm flex items-center gap-2"
                >
                  {extracting
                    ? <><Loader2 size={13} className="animate-spin" /> Extracting…</>
                    : <><Sparkles size={13} /> Extract fields</>}
                </button>
                {error && <p className="text-xs text-amber-600">{error}</p>}
              </div>
            </>
          ) : (
            <>
              <p className="text-xs text-brand-700 font-medium mt-3">
                Review extracted fields — remove any you don't want to overwrite, then apply.
              </p>
              <div className="space-y-1.5">
                {(Object.keys(fields) as (keyof ExtractedFields)[]).map(key => (
                  <div key={key} className="flex items-center justify-between rounded-lg bg-white border border-brand-100 px-3 py-2">
                    <div className="text-xs">
                      <span className="text-slate-500 w-28 inline-block">{FIELD_LABELS[key]}</span>
                      <span className="font-medium text-slate-900">
                        {key === "contract_price"
                          ? `$${Number(fields[key]).toLocaleString()}`
                          : String(fields[key])}
                      </span>
                    </div>
                    <button
                      onClick={() => removeField(key)}
                      className="text-slate-300 hover:text-red-400 transition-colors"
                      title="Remove this field"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
              {extractedCount === 0 && (
                <p className="text-xs text-slate-400">All fields removed.</p>
              )}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleApply}
                  disabled={saving || extractedCount === 0}
                  className="btn-primary text-sm flex items-center gap-2"
                >
                  {saving ? <><Loader2 size={13} className="animate-spin" /> Saving…</> : <><CheckCircle2 size={13} /> Apply to deal</>}
                </button>
                <button
                  onClick={() => { setFields(null); setPasteText(""); setError(""); }}
                  className="btn-secondary text-sm"
                >
                  Try again
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

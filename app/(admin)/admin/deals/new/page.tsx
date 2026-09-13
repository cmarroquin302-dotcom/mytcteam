"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Sparkles, ChevronDown, ChevronUp, Loader2, CheckCircle2 } from "lucide-react";
import type { Profile } from "@/types";

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

export default function AdminNewDealPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Profile[]>([]);
  const [admins, setAdmins] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Smart Fill — starts collapsed; user opens it when they want to use it
  const [smartOpen, setSmartOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractedCount, setExtractedCount] = useState<number | null>(null);

  // Form fields
  const [clientId, setClientId] = useState("");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [contractPrice, setContractPrice] = useState("");
  const [contractDate, setContractDate] = useState("");
  const [closingDate, setClosingDate] = useState("");
  const [escrowOfficer, setEscrowOfficer] = useState("");
  const [lenderName, setLenderName] = useState("");
  const [assignedTc, setAssignedTc] = useState("");
  const [stage, setStage] = useState("intake");
  const [retainerPaid, setRetainerPaid] = useState(false);
  const [internalNotes, setInternalNotes] = useState("");

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();

      // Load clients (non-admin users)
      const { data: clientData } = await supabase
        .from("profiles")
        .select("*")
        .eq("is_admin", false)
        .order("full_name");
      setClients(clientData || []);

      // Load admin users for TC dropdown
      const { data: adminData } = await supabase
        .from("profiles")
        .select("*")
        .eq("is_admin", true)
        .order("full_name");
      setAdmins(adminData || []);

      // Auto-assign to the currently logged-in admin
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const me = adminData?.find(a => a.id === user.id);
        if (me?.full_name) setAssignedTc(me.full_name);
      }
    }
    loadData();
  }, []);

  async function handleSmartFill() {
    if (!pasteText.trim()) return;
    setExtracting(true);
    setExtractedCount(null);
    try {
      const res = await fetch("/api/deals/parse-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: pasteText }),
      });
      const { fields, extracted } = (await res.json()) as { fields: ExtractedFields; extracted: number };
      if (fields.property_address) setPropertyAddress(fields.property_address);
      if (fields.buyer_name) setBuyerName(fields.buyer_name);
      if (fields.seller_name) setSellerName(fields.seller_name);
      if (fields.contract_price) setContractPrice(String(fields.contract_price));
      if (fields.contract_date) setContractDate(fields.contract_date);
      if (fields.closing_date) setClosingDate(fields.closing_date);
      if (fields.escrow_officer) setEscrowOfficer(fields.escrow_officer);
      if (fields.lender_name) setLenderName(fields.lender_name);
      setExtractedCount(extracted || 0);
      if (extracted > 0) setSmartOpen(false);
    } catch {
      setExtractedCount(0);
    } finally {
      setExtracting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data: deal, error: err } = await supabase
      .from("deals")
      .insert({
        client_id: clientId,
        property_address: propertyAddress,
        buyer_name: buyerName || null,
        seller_name: sellerName || null,
        escrow_officer: escrowOfficer || null,
        lender_name: lenderName || null,
        contract_price: contractPrice ? Number(contractPrice) : null,
        contract_date: contractDate || null,
        closing_date: closingDate || null,
        stage,
        assigned_tc: assignedTc || null,
        retainer_paid: retainerPaid,
        internal_notes: internalNotes || null,
      })
      .select()
      .single();

    if (err || !deal) {
      setError(err?.message || "Failed to create deal.");
      setLoading(false);
      return;
    }

    await fetch("/api/deals/checklist/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deal_id: deal.id }),
    });

    router.push(`/admin/deals/${deal.id}`);
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Open New Deal File</h1>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Smart Fill (collapsed by default) */}
      <div className="mb-5 rounded-xl border border-brand-200 bg-brand-50 overflow-hidden">
        <button
          type="button"
          onClick={() => setSmartOpen(!smartOpen)}
          className="w-full flex items-center justify-between px-4 py-3 text-left"
        >
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-brand-600" />
            <span className="font-semibold text-brand-900 text-sm">
              Smart Fill
              <span className="font-normal text-brand-600 ml-1">— paste an email or contract to auto-fill fields</span>
            </span>
            {extractedCount !== null && extractedCount > 0 && (
              <span className="flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                <CheckCircle2 size={11} /> {extractedCount} fields filled
              </span>
            )}
          </div>
          {smartOpen ? <ChevronUp size={16} className="text-brand-500" /> : <ChevronDown size={16} className="text-brand-500" />}
        </button>

        {smartOpen && (
          <div className="px-4 pb-4 border-t border-brand-100">
            <p className="text-xs text-brand-600 mt-3 mb-2">
              Paste any text from an email, contract, or MLS sheet and AI will fill in the deal details below.
            </p>
            <textarea
              value={pasteText}
              onChange={e => setPasteText(e.target.value)}
              rows={5}
              className="input resize-none text-sm"
              placeholder="Paste email or contract text here…"
              autoFocus
            />
            <button
              type="button"
              onClick={handleSmartFill}
              disabled={extracting || !pasteText.trim()}
              className="mt-2 btn-primary text-sm flex items-center gap-2"
            >
              {extracting
                ? <><Loader2 size={14} className="animate-spin" /> Extracting…</>
                : <><Sparkles size={14} /> Fill fields</>}
            </button>
            {extractedCount === 0 && (
              <p className="text-xs text-amber-600 mt-2">No fields found — try pasting more text from the contract or email.</p>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        <div className="card p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Client</h2>
          <label className="label">Assign to client <span className="text-red-500">*</span></label>
          <select
            required
            value={clientId}
            onChange={e => setClientId(e.target.value)}
            className="input"
          >
            <option value="">Select a client…</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>
                {c.full_name || c.email}{c.company_name ? ` (${c.company_name})` : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Property</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Address <span className="text-red-500">*</span></label>
              <input
                required
                value={propertyAddress}
                onChange={e => setPropertyAddress(e.target.value)}
                className="input"
                placeholder="123 Main St, City, State 00000"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Contract price</label>
                <input
                  type="number"
                  step="0.01"
                  value={contractPrice}
                  onChange={e => setContractPrice(e.target.value)}
                  className="input"
                  placeholder="425000"
                />
              </div>
              <div>
                <label className="label">Contract date</label>
                <input
                  type="date"
                  value={contractDate}
                  onChange={e => setContractDate(e.target.value)}
                  className="input"
                />
              </div>
            </div>
            <div>
              <label className="label">Target closing date</label>
              <input
                type="date"
                value={closingDate}
                onChange={e => setClosingDate(e.target.value)}
                className="input"
              />
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Parties</h2>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Buyer</label>
                <input value={buyerName} onChange={e => setBuyerName(e.target.value)} className="input" />
              </div>
              <div>
                <label className="label">Seller</label>
                <input value={sellerName} onChange={e => setSellerName(e.target.value)} className="input" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Escrow officer</label>
                <input value={escrowOfficer} onChange={e => setEscrowOfficer(e.target.value)} className="input" />
              </div>
              <div>
                <label className="label">Lender</label>
                <input value={lenderName} onChange={e => setLenderName(e.target.value)} className="input" />
              </div>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Admin</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Transaction Manager <span className="text-red-500">*</span></label>
              <select
                required
                value={assignedTc}
                onChange={e => setAssignedTc(e.target.value)}
                className="input"
              >
                <option value="">Select a TC…</option>
                {admins.map(a => (
                  <option key={a.id} value={a.full_name || a.email}>
                    {a.full_name || a.email}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-400 mt-1">Shown to the client in their portal.</p>
            </div>
            <div>
              <label className="label">Initial stage</label>
              <select value={stage} onChange={e => setStage(e.target.value)} className="input">
                <option value="intake">Intake</option>
                <option value="active_tracking">Active Tracking</option>
                <option value="pre_closing">Pre-Closing</option>
                <option value="closing">Closing</option>
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={retainerPaid}
                  onChange={e => setRetainerPaid(e.target.checked)}
                />
                Retainer already paid
              </label>
            </div>
            <div>
              <label className="label">Internal notes</label>
              <textarea
                rows={3}
                value={internalNotes}
                onChange={e => setInternalNotes(e.target.value)}
                className="input resize-none"
                placeholder="Notes visible only in admin…"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Opening file…" : "Open deal file"}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

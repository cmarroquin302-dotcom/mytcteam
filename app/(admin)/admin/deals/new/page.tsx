"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";

export default function AdminNewDealPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadClients() {
      const supabase = createClient();
      const { data } = await supabase.from("profiles").select("*").eq("is_admin", false).order("full_name");
      setClients(data || []);
    }
    loadClients();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const supabase = createClient();

    const { data: deal, error: err } = await supabase.from("deals").insert({
      client_id:       fd.get("client_id"),
      property_address: fd.get("property_address"),
      buyer_name:      fd.get("buyer_name") || null,
      seller_name:     fd.get("seller_name") || null,
      escrow_officer:  fd.get("escrow_officer") || null,
      lender_name:     fd.get("lender_name") || null,
      contract_price:  fd.get("contract_price") ? Number(fd.get("contract_price")) : null,
      contract_date:   fd.get("contract_date") || null,
      closing_date:    fd.get("closing_date") || null,
      stage:           fd.get("stage") || "intake",
      retainer_paid:   fd.get("retainer_paid") === "true",
      internal_notes:  fd.get("internal_notes") || null,
    }).select().single();

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

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Client</h2>
          <div>
            <label className="label">Assign to client <span className="text-red-500">*</span></label>
            <select name="client_id" required className="input">
              <option value="">Select a client…</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.full_name || c.email}{c.company_name ? ` (${c.company_name})` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Property</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Address <span className="text-red-500">*</span></label>
              <input name="property_address" required className="input" placeholder="123 Main St, City, State 00000" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Contract price</label>
                <input name="contract_price" type="number" step="0.01" className="input" />
              </div>
              <div>
                <label className="label">Contract date</label>
                <input name="contract_date" type="date" className="input" />
              </div>
            </div>
            <div>
              <label className="label">Target closing date</label>
              <input name="closing_date" type="date" className="input" />
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Parties</h2>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Buyer</label>
                <input name="buyer_name" className="input" />
              </div>
              <div>
                <label className="label">Seller</label>
                <input name="seller_name" className="input" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Escrow officer</label>
                <input name="escrow_officer" className="input" />
              </div>
              <div>
                <label className="label">Lender</label>
                <input name="lender_name" className="input" />
              </div>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Admin</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Initial stage</label>
              <select name="stage" className="input">
                <option value="intake">Intake</option>
                <option value="active_tracking">Active Tracking</option>
                <option value="pre_closing">Pre-Closing</option>
                <option value="closing">Closing</option>
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                <input type="checkbox" name="retainer_paid" value="true" />
                Retainer already paid
              </label>
            </div>
            <div>
              <label className="label">Internal notes</label>
              <textarea name="internal_notes" rows={3} className="input resize-none" placeholder="Notes visible only in admin…" />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Opening file…" : "Open file"}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}

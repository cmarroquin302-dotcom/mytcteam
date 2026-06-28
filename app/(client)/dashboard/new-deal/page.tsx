"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NewDealPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/sign-in"); return; }

    // Check plan — subscription clients skip retainer checkout
    const { data: profile } = await supabase.from("profiles").select("plan").eq("id", user.id).single();

    const { data: deal, error: dealErr } = await supabase.from("deals").insert({
      client_id:        user.id,
      property_address: fd.get("property_address"),
      buyer_name:       fd.get("buyer_name") || null,
      seller_name:      fd.get("seller_name") || null,
      escrow_officer:   fd.get("escrow_officer") || null,
      lender_name:      fd.get("lender_name") || null,
      contract_price:   fd.get("contract_price") ? Number(fd.get("contract_price")) : null,
      contract_date:    fd.get("contract_date") || null,
      closing_date:     fd.get("closing_date") || null,
      stage:            "intake",
    }).select().single();

    if (dealErr || !deal) {
      setError(dealErr?.message || "Failed to create deal. Please try again.");
      setLoading(false);
      return;
    }

    // Populate default checklist
    await fetch("/api/deals/checklist/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deal_id: deal.id }),
    });

    // Subscription clients go straight to the deal — retainer is covered by monthly plan
    if (profile?.plan === "subscription") {
      router.push(`/dashboard/deals/${deal.id}?new=1`);
    } else {
      // Per-deal clients: redirect to Stripe retainer checkout ($75)
      router.push(`/api/billing/retainer?deal_id=${deal.id}`);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Open a new file</h1>
        <p className="text-slate-500 text-sm mt-1">
          Fill in what you have — you can always update details later.
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Property</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Property address <span className="text-red-500">*</span></label>
              <input name="property_address" required className="input" placeholder="123 Main St, City, State 00000" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Contract price</label>
                <input name="contract_price" type="number" step="0.01" className="input" placeholder="450000" />
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

        <div className="card p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Parties</h2>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Buyer name</label>
                <input name="buyer_name" className="input" placeholder="John Doe" />
              </div>
              <div>
                <label className="label">Seller name</label>
                <input name="seller_name" className="input" placeholder="Jane Smith" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Escrow officer</label>
                <input name="escrow_officer" className="input" placeholder="Name / company" />
              </div>
              <div>
                <label className="label">Lender</label>
                <input name="lender_name" className="input" placeholder="Lender name" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          <strong>Note:</strong> The $75 retainer will be charged to your account when this file is opened.
          Our team will reach out to confirm receipt and send welcome communications to all parties.
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Opening file…" : "Open file →"}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

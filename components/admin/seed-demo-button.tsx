"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FlaskConical } from "lucide-react";

export function SeedDemoButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSeed() {
    if (!confirm("Create a demo deal with realistic test data?")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/seed-demo", { method: "POST" });
      const data = await res.json();
      if (data.deal_id) {
        router.push(`/admin/deals/${data.deal_id}`);
      } else {
        alert("Error: " + (data.error || "Unknown error"));
        setLoading(false);
      }
    } catch {
      alert("Failed to create demo deal.");
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleSeed}
      disabled={loading}
      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-slate-300 text-slate-500 text-sm hover:border-brand-400 hover:text-brand-600 transition-colors disabled:opacity-50"
    >
      <FlaskConical size={15} />
      {loading ? "Creating…" : "Create demo deal"}
    </button>
  );
}

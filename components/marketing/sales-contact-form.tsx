"use client";

import { useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";

export function SalesContactForm() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", volume: "", message: "" });

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setSent(true);
    } catch {
      setError("Something went wrong. Please email us at hello@mytcteam.com.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="text-center py-10">
        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={24} className="text-green-500" />
        </div>
        <h3 className="font-semibold text-slate-900 mb-2 text-lg">Got it &mdash; we&apos;ll be in touch.</h3>
        <p className="text-slate-500 text-sm max-w-xs mx-auto">
          Our team will reach out to you promptly, typically within one business day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Full name</label>
          <input required className="input" placeholder="Jane Smith" value={form.name} onChange={e => update("name", e.target.value)} />
        </div>
        <div>
          <label className="label">Email</label>
          <input required type="email" className="input" placeholder="jane@brokerage.com" value={form.email} onChange={e => update("email", e.target.value)} />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Phone number</label>
          <input required type="tel" className="input" placeholder="(555) 000-0000" value={form.phone} onChange={e => update("phone", e.target.value)} />
        </div>
        <div>
          <label className="label">Deals per year (approx.)</label>
          <select required className="input" value={form.volume} onChange={e => update("volume", e.target.value)}>
            <option value="">Select volume</option>
            <option value="1-12">1-12 deals/year</option>
            <option value="13-24">13-24 deals/year</option>
            <option value="25-50">25-50 deals/year</option>
            <option value="51-100">51-100 deals/year</option>
            <option value="100+">100+ deals/year</option>
          </select>
        </div>
      </div>
      <div>
        <label className="label">Message</label>
        <textarea required rows={4} className="input resize-none" placeholder="Tell us about your business or what you are looking for" value={form.message} onChange={e => update("message", e.target.value)} />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
        {loading ? <><Loader2 size={15} className="animate-spin" /> Sending</> : "Send message"}
      </button>
      <p className="text-center text-xs text-slate-400">
        We will reach out to you promptly, typically within one business day.
      </p>
    </form>
  );
}

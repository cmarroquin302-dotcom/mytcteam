"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, Settings } from "lucide-react";

export default function AdminSettingsPage() {
  const [closingFee, setClosingFee] = useState("250");
  const [reminderDays, setReminderDays] = useState("3");
  const [capWarning, setCapWarning] = useState("8");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from("app_settings").select("*");
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((r: any) => { map[r.key] = r.value; });
        if (map["closing_fee"]) setClosingFee(map["closing_fee"]);
        if (map["deadline_reminder_days"]) setReminderDays(map["deadline_reminder_days"]);
        if (map["subscription_cap_warning_threshold"]) setCapWarning(map["subscription_cap_warning_threshold"]);
      }
    }
    load();
  }, []);

  async function save() {
    setLoading(true);
    const supabase = createClient();
    await Promise.all([
      supabase.from("app_settings").upsert({ key: "closing_fee", value: closingFee, updated_at: new Date().toISOString() }, { onConflict: "key" }),
      supabase.from("app_settings").upsert({ key: "deadline_reminder_days", value: reminderDays, updated_at: new Date().toISOString() }, { onConflict: "key" }),
      supabase.from("app_settings").upsert({ key: "subscription_cap_warning_threshold", value: capWarning, updated_at: new Date().toISOString() }, { onConflict: "key" }),
    ]);
    setSaved(true);
    setLoading(false);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Settings size={22} className="text-slate-600" />
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
      </div>

      {saved && (
        <div className="mb-5 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 flex items-center gap-2">
          <CheckCircle size={16} /> Settings saved.
        </div>
      )}

      <div className="space-y-5">
        <div className="card p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Pricing</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Closing fee ($)</label>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-sm">$</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={closingFee}
                  onChange={e => setClosingFee(e.target.value)}
                  className="input max-w-xs"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                This is the balance due from per-deal clients at escrow close. Currently ${closingFee}.
              </p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Notifications</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Deadline reminder lead time (days)</label>
              <input
                type="number"
                min="1"
                max="14"
                value={reminderDays}
                onChange={e => setReminderDays(e.target.value)}
                className="input max-w-xs"
              />
              <p className="text-xs text-slate-400 mt-1">
                Send reminders this many days before a deadline is due.
              </p>
            </div>
            <div>
              <label className="label">Subscription cap warning threshold (deals)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={capWarning}
                onChange={e => setCapWarning(e.target.value)}
                className="input max-w-xs"
              />
              <p className="text-xs text-slate-400 mt-1">
                Alert subscription clients when they reach this many deals used in a month (of 10).
              </p>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          <strong>⚠️ Stripe:</strong> Payment processing is in <strong>test/sandbox mode</strong>.
          Do not connect live Stripe keys until you have explicitly confirmed with yourself that you're ready to accept real payments.
          Test keys start with <code className="font-mono bg-amber-100 px-1 rounded">sk_test_</code> and <code className="font-mono bg-amber-100 px-1 rounded">pk_test_</code>.
        </div>

        <button onClick={save} disabled={loading} className="btn-primary">
          {loading ? "Saving…" : "Save settings"}
        </button>
      </div>
    </div>
  );
}

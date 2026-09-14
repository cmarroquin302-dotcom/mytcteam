"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Pencil, Check, X, Loader2 } from "lucide-react";

interface Profile {
  id: string;
  full_name: string | null;
  email: string;
}

interface TcEditorProps {
  dealId: string;
  currentTc: string | null;
}

export function TcEditor({ dealId, currentTc }: TcEditorProps) {
  const [editing, setEditing] = useState(false);
  const [admins, setAdmins] = useState<Profile[]>([]);
  const [selected, setSelected] = useState(currentTc || "");
  const [saved, setSaved] = useState(currentTc || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadAdmins() {
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("is_admin", true)
        .order("full_name");
      setAdmins(data || []);
    }
    if (editing) loadAdmins();
  }, [editing]);

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from("deals")
      .update({ assigned_tc: selected || null })
      .eq("id", dealId);
    setSaved(selected);
    setSaving(false);
    setEditing(false);
  }

  function handleCancel() {
    setSelected(saved);
    setEditing(false);
  }

  if (!editing) {
    return (
      <div className="flex items-center justify-between">
        <div>
          {saved ? (
            <p className="text-sm font-medium text-brand-700">{saved}</p>
          ) : (
            <p className="text-sm text-amber-600 font-medium">⚠ No TC assigned</p>
          )}
        </div>
        <button
          onClick={() => setEditing(true)}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          title="Edit TC"
        >
          <Pencil size={13} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <select
        value={selected}
        onChange={e => setSelected(e.target.value)}
        className="input text-sm w-full"
        autoFocus
      >
        <option value="">Unassigned</option>
        {admins.map(a => (
          <option key={a.id} value={a.full_name || a.email}>
            {a.full_name || a.email}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-medium hover:bg-brand-700 disabled:opacity-50"
        >
          {saving ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
          Save
        </button>
        <button
          onClick={handleCancel}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50"
        >
          <X size={11} /> Cancel
        </button>
      </div>
    </div>
  );
}

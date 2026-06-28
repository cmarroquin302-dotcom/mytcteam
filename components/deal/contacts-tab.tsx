"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Plus, Phone, Mail, Building2, Pencil, Trash2, Check, X } from "lucide-react";

export interface DealContact {
  id: string;
  deal_id: string;
  role: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  notes: string | null;
  sort_order: number;
}

const ROLES: { value: string; label: string }[] = [
  { value: "buyers_agent",    label: "Buyer's Agent" },
  { value: "listing_agent",  label: "Listing Agent" },
  { value: "buyer",          label: "Buyer" },
  { value: "seller",         label: "Seller" },
  { value: "escrow_officer", label: "Escrow Officer" },
  { value: "title_officer",  label: "Title Officer" },
  { value: "lender",         label: "Loan Officer / Lender" },
  { value: "inspector",      label: "Home Inspector" },
  { value: "appraiser",      label: "Appraiser" },
  { value: "hoa",            label: "HOA Management" },
  { value: "notary",         label: "Notary / Signing Agent" },
  { value: "other",          label: "Other" },
];

const ROLE_COLORS: Record<string, string> = {
  buyers_agent:   "bg-blue-50 text-blue-700",
  listing_agent:  "bg-purple-50 text-purple-700",
  buyer:          "bg-sky-50 text-sky-700",
  seller:         "bg-indigo-50 text-indigo-700",
  escrow_officer: "bg-amber-50 text-amber-700",
  title_officer:  "bg-orange-50 text-orange-700",
  lender:         "bg-green-50 text-green-700",
  inspector:      "bg-teal-50 text-teal-700",
  appraiser:      "bg-cyan-50 text-cyan-700",
  hoa:            "bg-slate-100 text-slate-600",
  notary:         "bg-rose-50 text-rose-700",
  other:          "bg-slate-100 text-slate-600",
};

const roleLabel = (role: string) => ROLES.find(r => r.value === role)?.label || role;

const BLANK = { role: "buyers_agent", name: "", email: "", phone: "", company: "", notes: "" };

export function ContactsTab({ dealId, contacts, isAdmin }: {
  dealId: string;
  contacts: DealContact[];
  isAdmin: boolean;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<DealContact>>({});
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleAdd() {
    if (!form.name.trim()) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("deal_contacts").insert({ deal_id: dealId, ...form, sort_order: contacts.length });
    setSaving(false);
    setShowAdd(false);
    setForm(BLANK);
    router.refresh();
  }

  async function handleEdit(contact: DealContact) {
    setEditId(contact.id);
    setEditForm({ role: contact.role, name: contact.name, email: contact.email || "", phone: contact.phone || "", company: contact.company || "", notes: contact.notes || "" });
  }

  async function handleSaveEdit() {
    if (!editId) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("deal_contacts").update(editForm).eq("id", editId);
    setSaving(false);
    setEditId(null);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this contact?")) return;
    const supabase = createClient();
    await supabase.from("deal_contacts").delete().eq("id", id);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {/* Contact cards */}
      {contacts.length === 0 && !showAdd && (
        <div className="card p-8 text-center text-slate-400 text-sm">
          No contacts added yet.{isAdmin ? " Add everyone involved in the transaction." : ""}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        {contacts.map(contact => (
          <div key={contact.id} className="card p-4">
            {editId === contact.id ? (
              <div className="space-y-2">
                <select value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))} className="input text-sm">
                  {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
                <input value={editForm.name || ""} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} placeholder="Name *" className="input text-sm" />
                <input value={editForm.email || ""} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} placeholder="Email" className="input text-sm" type="email" />
                <input value={editForm.phone || ""} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone" className="input text-sm" />
                <input value={editForm.company || ""} onChange={e => setEditForm(f => ({ ...f, company: e.target.value }))} placeholder="Company" className="input text-sm" />
                <input value={editForm.notes || ""} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} placeholder="Notes" className="input text-sm" />
                <div className="flex gap-2">
                  <button onClick={handleSaveEdit} disabled={saving} className="btn-primary text-xs py-1.5"><Check size={13} /> Save</button>
                  <button onClick={() => setEditId(null)} className="btn-secondary text-xs py-1.5"><X size={13} /> Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ROLE_COLORS[contact.role] || "bg-slate-100 text-slate-600"}`}>
                    {roleLabel(contact.role)}
                  </span>
                  {isAdmin && (
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(contact)} className="p-1 text-slate-400 hover:text-brand-600 transition-colors"><Pencil size={13} /></button>
                      <button onClick={() => handleDelete(contact.id)} className="p-1 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
                    </div>
                  )}
                </div>
                <div className="font-semibold text-slate-900 text-sm">{contact.name}</div>
                {contact.company && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                    <Building2 size={11} /> {contact.company}
                  </div>
                )}
                {contact.email && (
                  <a href={`mailto:${contact.email}`} className="flex items-center gap-1.5 text-xs text-brand-600 hover:underline mt-1">
                    <Mail size={11} /> {contact.email}
                  </a>
                )}
                {contact.phone && (
                  <a href={`tel:${contact.phone}`} className="flex items-center gap-1.5 text-xs text-slate-600 hover:underline mt-0.5">
                    <Phone size={11} /> {contact.phone}
                  </a>
                )}
                {contact.notes && (
                  <p className="text-xs text-slate-400 mt-2 italic">{contact.notes}</p>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Add form */}
      {isAdmin && (
        showAdd ? (
          <div className="card p-5">
            <h4 className="font-semibold text-slate-900 mb-4 text-sm">Add contact</h4>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="label">Role</label>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="input">
                  {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input" placeholder="Full name" />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input" />
              </div>
              <div>
                <label className="label">Phone</label>
                <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input" />
              </div>
              <div>
                <label className="label">Company / Brokerage</label>
                <input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} className="input" />
              </div>
              <div>
                <label className="label">Notes</label>
                <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="input" placeholder="Optional" />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={handleAdd} disabled={!form.name.trim() || saving} className="btn-primary text-sm">
                <Check size={14} /> Add contact
              </button>
              <button onClick={() => { setShowAdd(false); setForm(BLANK); }} className="btn-secondary text-sm">Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 font-medium">
            <Plus size={16} /> Add contact
          </button>
        )
      )}
    </div>
  );
}

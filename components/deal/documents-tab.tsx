"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Upload, FileText, Download, Trash2, Lock } from "lucide-react";
import { formatDate } from "@/lib/utils";

export interface DealDocument {
  id: string;
  deal_id: string;
  uploaded_by: string;
  file_name: string;
  file_size: number | null;
  file_type: string | null;
  storage_path: string;
  category: string;
  admin_only: boolean;
  created_at: string;
  profiles?: { full_name: string | null; email: string };
}

const CATEGORIES = [
  { value: "contract",    label: "Purchase Agreement / Contract" },
  { value: "amendment",  label: "Amendment / Addendum" },
  { value: "inspection", label: "Inspection Report" },
  { value: "repair",     label: "Repair Request / Response" },
  { value: "appraisal",  label: "Appraisal" },
  { value: "title",      label: "Title / Preliminary Report" },
  { value: "hoa",        label: "HOA Documents" },
  { value: "loan",       label: "Loan / Lender Documents" },
  { value: "disclosure", label: "Disclosures" },
  { value: "closing",    label: "Closing / Settlement" },
  { value: "other",      label: "Other" },
];

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentsTab({
  dealId,
  documents,
  isAdmin,
}: {
  dealId: string;
  documents: DealDocument[];
  isAdmin: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState("other");
  const [adminOnly, setAdminOnly] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Group docs by category
  const grouped: Record<string, DealDocument[]> = {};
  documents.forEach(doc => {
    (grouped[doc.category] = grouped[doc.category] || []).push(doc);
  });

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) { setError("File must be under 50 MB."); return; }

    setUploading(true);
    setError("");
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${dealId}/${Date.now()}-${safeName}`;

    const { error: storageErr } = await supabase.storage
      .from("deal-documents")
      .upload(path, file, { contentType: file.type, upsert: false });

    if (storageErr) {
      setError("Upload failed: " + storageErr.message);
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("documents").insert({
      deal_id: dealId,
      uploaded_by: user!.id,
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
      storage_path: path,
      category,
      admin_only: isAdmin ? adminOnly : false,
    });

    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
    router.refresh();
  }

  async function handleDownload(doc: DealDocument) {
    const supabase = createClient();
    const { data } = await supabase.storage
      .from("deal-documents")
      .createSignedUrl(doc.storage_path, 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  }

  async function handleDelete(doc: DealDocument) {
    if (!confirm(`Delete "${doc.file_name}"? This cannot be undone.`)) return;
    const supabase = createClient();
    await supabase.storage.from("deal-documents").remove([doc.storage_path]);
    await supabase.from("documents").delete().eq("id", doc.id);
    router.refresh();
  }

  const categoryLabel = (cat: string) =>
    CATEGORIES.find(c => c.value === cat)?.label || cat;

  return (
    <div className="space-y-6">
      {/* Upload */}
      <div className="card p-5">
        <h3 className="font-semibold text-slate-900 mb-4">Upload document</h3>
        {error && (
          <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>
        )}
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="label">Document type</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="input">
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          {isAdmin && (
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer pb-2">
              <input type="checkbox" checked={adminOnly} onChange={e => setAdminOnly(e.target.checked)} />
              <Lock size={13} /> Admin only (hidden from client)
            </label>
          )}
          <label className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
            uploading ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-brand-600 text-white hover:bg-brand-700"
          }`}>
            <Upload size={15} />
            {uploading ? "Uploading…" : "Choose file"}
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              disabled={uploading}
              onChange={handleUpload}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.heic,.txt,.csv"
            />
          </label>
        </div>
        <p className="text-xs text-slate-400 mt-2">PDF, Word, Excel, images — max 50 MB</p>
      </div>

      {/* Document list */}
      {documents.length === 0 ? (
        <div className="card p-10 text-center text-slate-400 text-sm">
          <FileText size={28} className="mx-auto mb-2 opacity-40" />
          No documents uploaded yet.
        </div>
      ) : (
        Object.entries(grouped).map(([cat, docs]) => (
          <div key={cat} className="card overflow-hidden">
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
              <h4 className="text-sm font-semibold text-slate-700">{categoryLabel(cat)}</h4>
            </div>
            <div className="divide-y divide-slate-100">
              {docs.map(doc => (
                <div key={doc.id} className="flex items-center justify-between px-5 py-3 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText size={16} className="text-slate-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-900 truncate">{doc.file_name}</span>
                        {doc.admin_only && (
                          <span className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                            <Lock size={10} /> Admin only
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {doc.file_size ? formatBytes(doc.file_size) : ""} · {formatDate(doc.created_at)}
                        {doc.profiles && ` · ${doc.profiles.full_name || doc.profiles.email}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleDownload(doc)}
                      className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <Download size={13} /> Download
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(doc)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

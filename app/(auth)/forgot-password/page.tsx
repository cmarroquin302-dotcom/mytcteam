"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <div className="w-full max-w-sm">
      <div className="card p-8">
        <div className="text-center mb-7">
          <h1 className="text-2xl font-bold text-slate-900">Reset password</h1>
          <p className="text-slate-500 text-sm mt-1">
            Enter your email and we&apos;ll send a reset link.
          </p>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-50 rounded-full mb-4">
              <CheckCircle size={24} className="text-green-600" />
            </div>
            <p className="font-semibold text-slate-900 mb-2">Check your email</p>
            <p className="text-sm text-slate-500 mb-6">
              We sent a password reset link to <strong>{email}</strong>.
            </p>
            <Link href="/sign-in" className="text-brand-600 text-sm font-medium hover:underline">
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Email address</label>
                <input
                  type="email"
                  required
                  className="input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2">
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>
            <p className="text-center text-sm text-slate-500 mt-5">
              <Link href="/sign-in" className="text-brand-600 font-medium hover:underline">
                Back to sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase exchanges the URL fragment tokens on load; wait for session
    const supabase = createClient();
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
    } else {
      setDone(true);
      setTimeout(() => router.push("/sign-in"), 3000);
    }
    setLoading(false);
  }

  return (
    <div className="w-full max-w-sm">
      <div className="card p-8">
        <div className="text-center mb-7">
          <h1 className="text-2xl font-bold text-slate-900">Set new password</h1>
          <p className="text-slate-500 text-sm mt-1">Choose a strong password for your account.</p>
        </div>

        {done ? (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-50 rounded-full mb-4">
              <CheckCircle size={24} className="text-green-600" />
            </div>
            <p className="font-semibold text-slate-900 mb-2">Password updated!</p>
            <p className="text-sm text-slate-500">Redirecting you to sign in…</p>
          </div>
        ) : !ready ? (
          <div className="text-center py-4 text-slate-400 text-sm">Verifying reset link…</div>
        ) : (
          <>
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">New password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  className="input"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Confirm password</label>
                <input
                  type="password"
                  required
                  className="input"
                  placeholder="Repeat your new password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2">
                {loading ? "Saving…" : "Set password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

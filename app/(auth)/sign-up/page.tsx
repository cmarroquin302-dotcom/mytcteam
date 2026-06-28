"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle } from "lucide-react";

type Plan = "per_deal" | "subscription";

function SignUpForm() {
  const params = useSearchParams();
  const initialPlan = (params.get("plan") as Plan) || "per_deal";

  const [plan, setPlan] = useState<Plan>(initialPlan);
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, company_name: company, plan },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Update profile with plan and company — the trigger creates the profile row
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({
        company_name: company,
        plan,
        deals_cap: plan === "subscription" ? 10 : 0,
      }).eq("id", user.id);

      // For subscription: route to Stripe checkout
      if (plan === "subscription") {
        router.push("/dashboard/billing?setup=subscription");
      } else {
        // Per-deal: go straight to dashboard, prompt to open a file
        router.push("/dashboard?welcome=1");
      }
    } else {
      // Email confirmation required — Supabase sent a confirmation email
      setLoading(false);
      setError(""); // clear any errors
      // Redirect to sign-in with a confirmation message
      router.push("/sign-in?confirm=1");
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="card p-8">
        <div className="text-center mb-7">
          <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="text-slate-500 text-sm mt-1">
            Join myTCteam and start coordinating deals
          </p>
        </div>

        {/* Plan toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl mb-6">
          {(["per_deal", "subscription"] as Plan[]).map(p => (
            <button
              key={p}
              type="button"
              onClick={() => setPlan(p)}
              className={`py-2 rounded-lg text-sm font-medium transition-all ${
                plan === p
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {p === "per_deal" ? "Per Deal" : "Monthly ($500/mo)"}
            </button>
          ))}
        </div>

        <div className="bg-slate-50 rounded-lg px-4 py-3 mb-5 text-sm text-slate-600">
          {plan === "per_deal" ? (
            <div className="flex items-start gap-2">
              <CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
              <span><strong>$75 retainer</strong> per file, + <strong>$250 at closing</strong>. Retainer charged when you open a deal.</span>
            </div>
          ) : (
            <div className="flex items-start gap-2">
              <CheckCircle size={14} className="text-brand-500 mt-0.5 flex-shrink-0" />
              <span><strong>$500/month</strong> covers up to 10 deals. You'll be taken to checkout after creating your account.</span>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full name</label>
            <input required className="input" placeholder="Jane Smith" value={fullName} onChange={e => setFullName(e.target.value)} />
          </div>
          <div>
            <label className="label">Brokerage / company <span className="text-slate-400 font-normal">(optional)</span></label>
            <input className="input" placeholder="ABC Realty" value={company} onChange={e => setCompany(e.target.value)} />
          </div>
          <div>
            <label className="label">Email</label>
            <input required type="email" className="input" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label">Password</label>
            <input required type="password" className="input" placeholder="At least 8 characters" minLength={8} value={password} onChange={e => setPassword(e.target.value)} />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2">
            {loading
              ? "Creating account…"
              : plan === "subscription"
              ? "Create account & go to checkout →"
              : "Create account →"
            }
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-5">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-brand-600 font-medium hover:underline">Sign in</Link>
        </p>
        <p className="text-center text-xs text-slate-400 mt-3">
          Need 10+ deals/month?{" "}
          <Link href="/contact?reason=high_volume" className="text-brand-500 hover:underline">Talk to us</Link>
        </p>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md"><div className="card p-8 text-center text-slate-400">Loading…</div></div>}>
      <SignUpForm />
    </Suspense>
  );
}

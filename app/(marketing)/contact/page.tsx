"use client";

import { useState } from "react";
import { CheckCircle, Mail, Phone } from "lucide-react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    // Simulate submission — wire to your email/Supabase in production
    await new Promise(r => setTimeout(r, 1000));
    setSent(true);
    setLoading(false);
  }

  return (
    <div>
      <section className="bg-slate-50 py-16 px-4 border-b border-slate-100">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Get in touch</h1>
          <p className="text-lg text-slate-500">
            Questions, high-volume pricing, or anything else — we'd love to hear from you.
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12">
          {/* Info */}
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">When to reach out</h2>
            <ul className="space-y-4 text-slate-600 text-sm">
              <li className="flex items-start gap-3">
                <CheckCircle size={17} className="text-green-500 flex-shrink-0 mt-0.5" />
                <span>You're running <strong>more than 10 deals per month</strong> and want custom team pricing</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle size={17} className="text-green-500 flex-shrink-0 mt-0.5" />
                <span>You have a <strong>brokerage or team</strong> interested in setting up multiple agents</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle size={17} className="text-green-500 flex-shrink-0 mt-0.5" />
                <span>You have questions before signing up or opening your first file</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle size={17} className="text-green-500 flex-shrink-0 mt-0.5" />
                <span>You need to discuss a specific deal or account issue</span>
              </li>
            </ul>

            <div className="mt-8 space-y-3 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <Mail size={15} className="text-slate-400" />
                <a href="mailto:hello@mytcteam.com" className="text-brand-600 hover:underline">hello@mytcteam.com</a>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={15} className="text-slate-400" />
                <span>We'll call you back — leave your number in the form</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="card p-6">
            {sent ? (
              <div className="text-center py-8">
                <CheckCircle size={40} className="text-green-500 mx-auto mb-4" />
                <h3 className="font-semibold text-slate-900 mb-2">Message received!</h3>
                <p className="text-slate-500 text-sm">We'll get back to you within one business day.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Full name</label>
                  <input required className="input" placeholder="Jane Smith" />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input required type="email" className="input" placeholder="jane@yourbrokerage.com" />
                </div>
                <div>
                  <label className="label">Phone (optional)</label>
                  <input type="tel" className="input" placeholder="(555) 000-0000" />
                </div>
                <div>
                  <label className="label">What can we help with?</label>
                  <select className="input">
                    <option value="">Select a topic…</option>
                    <option value="high_volume">High-volume / team pricing</option>
                    <option value="general">General question</option>
                    <option value="existing">Existing client support</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="label">Message</label>
                  <textarea required rows={4} className="input resize-none" placeholder="Tell us a bit about your situation…" />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
                  {loading ? "Sending…" : "Send message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

import Link from "next/link";
import { CheckCircle, Clock, FileCheck, Users, ArrowRight, Shield, Calendar, Star } from "lucide-react";
import { PublicNav } from "@/components/layout/public-nav";
import { Footer } from "@/components/layout/footer";

const features = [
  {
    icon: FileCheck,
    title: "Contract to Close, Handled",
    desc: "We manage every document, deadline, and communication your deal requires — from the moment contracts are signed to the day it closes.",
  },
  {
    icon: Clock,
    title: "Nothing Falls Through the Cracks",
    desc: "Inspection periods, appraisal deadlines, title contingencies — we track every date and remind everyone who needs to know.",
  },
  {
    icon: Users,
    title: "Communication Hub",
    desc: "We coordinate between agents, lenders, escrow, and title so you're not playing phone tag across six parties.",
  },
  {
    icon: Shield,
    title: "Your Deals, Documented",
    desc: "Every interaction, upload, and status change is logged. You always have a clear paper trail.",
  },
];

const steps = [
  { n: "01", title: "Open a file", desc: "Submit the contract details and key dates. We handle onboarding all parties." },
  { n: "02", title: "We track everything", desc: "Deadlines, contingencies, repairs, financing — all monitored and communicated." },
  { n: "03", title: "You close the deal", desc: "We prep all parties for closing day and confirm every detail is in place." },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicNav />

      {/* Hero */}
      <section className="bg-gradient-to-b from-brand-950 to-brand-900 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-brand-200 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Star size={13} fill="currentColor" /> Trusted by agents & brokerage teams
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
            Transaction coordination<br className="hidden sm:block" /> that actually works
          </h1>
          <p className="text-lg sm:text-xl text-brand-200 max-w-2xl mx-auto mb-10">
            We handle the paperwork, deadlines, and coordination from contract to close —
            so you can focus on what you do best: selling real estate.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/sign-up" className="btn-primary px-8 py-3 text-base shadow-lg shadow-brand-900/50">
              Get started <ArrowRight size={16} />
            </Link>
            <Link href="/how-it-works" className="btn-ghost text-white hover:bg-white/10 px-8 py-3 text-base">
              See how it works
            </Link>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-b border-slate-100 py-6 px-4 bg-white">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-8 text-sm text-slate-500">
          <span className="flex items-center gap-2"><CheckCircle size={15} className="text-green-500" /> Licensed TC professionals</span>
          <span className="flex items-center gap-2"><CheckCircle size={15} className="text-green-500" /> Per-deal or monthly subscription</span>
          <span className="flex items-center gap-2"><CheckCircle size={15} className="text-green-500" /> Real-time status updates</span>
          <span className="flex items-center gap-2"><CheckCircle size={15} className="text-green-500" /> Client portal included</span>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">
              Your deals deserve more than a spreadsheet
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Every transaction has dozens of moving pieces. We make sure none of them slip.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-6">
                <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center mb-4">
                  <Icon size={20} className="text-brand-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Simple from day one</h2>
            <p className="text-slate-500">Opening a file takes minutes. Closing it is our job.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {steps.map(({ n, title, desc }) => (
              <div key={n} className="text-center">
                <div className="w-12 h-12 rounded-full bg-brand-600 text-white font-bold text-lg flex items-center justify-center mx-auto mb-4">
                  {n}
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Two ways to work with us</h2>
            <p className="text-slate-500">Pay per deal, or subscribe for a flat monthly rate.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="card p-6 flex flex-col">
              <div className="text-sm font-semibold text-brand-600 mb-1">Per Deal</div>
              <div className="text-3xl font-bold text-slate-900 mb-1">$75 <span className="text-base font-normal text-slate-500">retainer</span></div>
              <p className="text-slate-500 text-sm mb-4">+ closing balance at close. Ideal for agents doing a few deals a month.</p>
              <Link href="/pricing" className="btn-secondary mt-auto text-sm justify-center">See full pricing</Link>
            </div>
            <div className="card p-6 flex flex-col border-brand-200 bg-brand-50/30">
              <div className="text-sm font-semibold text-brand-600 mb-1">Monthly Subscription</div>
              <div className="text-3xl font-bold text-slate-900 mb-1">$500<span className="text-base font-normal text-slate-500">/mo</span></div>
              <p className="text-slate-500 text-sm mb-4">Up to 10 deals/month. Great for active agents and small teams.</p>
              <Link href="/pricing" className="btn-primary mt-auto text-sm justify-center">Get started</Link>
            </div>
          </div>
          <p className="text-center text-slate-400 text-sm mt-6">
            Running more than 10 deals/month? <Link href="/contact" className="text-brand-600 hover:underline">Talk to us →</Link>
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4 bg-brand-600">
        <div className="max-w-2xl mx-auto text-center text-white">
          <Calendar size={32} className="mx-auto mb-4 opacity-80" />
          <h2 className="text-3xl font-bold mb-3">Ready to close more deals with less stress?</h2>
          <p className="text-brand-200 mb-8">Create your account and open your first file today.</p>
          <Link href="/sign-up" className="inline-flex items-center gap-2 bg-white text-brand-700 font-semibold px-8 py-3 rounded-lg hover:bg-brand-50 transition-colors shadow-lg">
            Get started free <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

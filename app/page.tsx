import Link from "next/link";
import { CheckCircle, Clock, FileCheck, Users, ArrowRight, Shield, Calendar, Star, Bell, LayoutDashboard, MessageSquare } from "lucide-react";
import { PublicNav } from "@/components/layout/public-nav";
import { Footer } from "@/components/layout/footer";

const features = [
  {
    icon: FileCheck,
    title: "Contract to Close, Handled",
    desc: "Every document, deadline, and task from executed contract to closing day is managed by your dedicated TC. You hand it off and stay focused on your clients.",
  },
  {
    icon: Clock,
    title: "No More Chasing",
    desc: "We track every contingency, deadline, and outstanding item and follow up with all parties on your behalf. No more phone tag, no more wondering where things stand.",
  },
  {
    icon: Users,
    title: "One Point of Contact",
    desc: "Your TC coordinates between agents, lenders, escrow, and title so everything flows through one organized channel. You get updates, not chaos.",
  },
  {
    icon: Shield,
    title: "Fully Documented",
    desc: "Every interaction, upload, and status change is logged and stored. Your file is clean, organized, and audit-ready from day one.",
  },
];

const portalFeatures = [
  { icon: LayoutDashboard, label: "Live deal status", desc: "See exactly where your deal stands at every stage." },
  { icon: CheckCircle, label: "Checklist progress", desc: "Every completed and outstanding item, always up to date." },
  { icon: Bell, label: "Instant notifications", desc: "Get alerted the moment something changes on your file." },
  { icon: MessageSquare, label: "Direct messaging", desc: "Message your TC directly through the portal, no email chains." },
];

const steps = [
  { n: "01", title: "Open a file", desc: "Submit your contract details. We handle onboarding all parties and getting the file organized." },
  { n: "02", title: "We run it", desc: "Deadlines, contingencies, repairs, financing &mdash; all monitored, communicated, and followed up on." },
  { n: "03", title: "You close", desc: "We prep all parties for closing day. You show up, sign, and collect your commission." },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicNav />

      {/* Hero */}
      <section className="bg-gradient-to-b from-brand-950 to-brand-900 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-brand-200 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Star size={13} fill="currentColor" /> Trusted by agents &amp; brokerage teams
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
            The TC team built<br className="hidden sm:block" /> for how you actually work
          </h1>
          <p className="text-lg sm:text-xl text-brand-200 max-w-2xl mx-auto mb-10">
            Efficient. Organized. Zero chasing. We plug into your workflow and handle every detail from contract to close so you can keep your pipeline moving.
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
              More volume. Less work. No chaos.
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              We handle the backend of every transaction so you can stay in front of clients and keep producing.
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

      {/* Client Portal */}
      <section className="py-20 px-4 bg-brand-950 text-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-xs font-semibold text-brand-400 uppercase tracking-wide mb-3">Your client portal</div>
              <h2 className="text-3xl font-bold mb-4">Always know where your deal stands</h2>
              <p className="text-brand-200 leading-relaxed mb-6">
                Every deal you run with us comes with a dedicated portal where you can track your file in real time &mdash; no need to call or email asking for updates. Everything is organized, visible, and current.
              </p>
              <p className="text-brand-200 leading-relaxed">
                Get notified the moment something changes. Message your TC directly. See every completed item and what&apos;s still outstanding. Your file is always one click away.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {portalFeatures.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <Icon size={20} className="text-brand-400 mb-3" />
                  <div className="font-semibold text-white text-sm mb-1">{label}</div>
                  <div className="text-brand-300 text-xs leading-relaxed">{desc}</div>
                </div>
              ))}
            </div>
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
                <p className="text-slate-500 text-sm" dangerouslySetInnerHTML={{ __html: desc }} />
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
            Running more than 10 deals/month? <Link href="/contact" className="text-brand-600 hover:underline">Talk to us &rarr;</Link>
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4 bg-brand-600">
        <div className="max-w-2xl mx-auto text-center text-white">
          <Calendar size={32} className="mx-auto mb-4 opacity-80" />
          <h2 className="text-3xl font-bold mb-3">Ready to close more with less on your plate?</h2>
          <p className="text-brand-200 mb-8">Create your account and open your first file today.</p>
          <Link href="/sign-up" className="inline-flex items-center gap-2 bg-white text-brand-700 font-semibold px-8 py-3 rounded-lg hover:bg-brand-50 transition-colors shadow-lg">
            Get started <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

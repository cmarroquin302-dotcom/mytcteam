import { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, ArrowRight, Phone, Building2, MessageCircle } from "lucide-react";
import { SalesContactForm } from "@/components/marketing/sales-contact-form";

export const metadata: Metadata = { title: "Pricing" };

const perDealItems = [
  "$75 non-refundable retainer due at file opening",
  "Closing balance due at escrow close ($250)",
  "Full contract-to-close coordination",
  "Client portal with deal status and checklist",
  "Status update emails at each stage",
  "Deadline tracking and reminders",
  "No monthly commitment -- pay per file",
];

const subscriptionItems = [
  "Up to 10 deals per month",
  "$0 per-deal retainer or closing fee",
  "Everything in per-deal, for every deal",
  "Monthly deal usage tracker in your portal",
  "Priority support",
  "Subscription renews monthly -- cancel anytime",
  "Ideal for agents closing 3+ deals/month",
];

export default function PricingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-slate-50 py-16 px-4 border-b border-slate-100">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Simple, transparent pricing</h1>
          <p className="text-lg text-slate-500">
            Pay per deal when it makes sense, or subscribe for a flat monthly rate.
            No hidden fees, no surprises.
          </p>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6 items-start">

          {/* Per Deal */}
          <div className="card p-7 flex flex-col">
            <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Per Deal</div>
            <div className="mb-1">
              <span className="text-4xl font-bold text-slate-900">$75</span>
              <span className="text-slate-400 text-sm ml-1">retainer</span>
            </div>
            <div className="text-slate-500 text-sm mb-1">+ $250 at closing</div>
            <p className="text-slate-400 text-xs mb-6">Retainer is non-refundable. No closing fee if deal falls through.</p>

            <ul className="space-y-3 mb-8 flex-1">
              {perDealItems.map(item => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <CheckCircle size={15} className="text-green-500 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>

            <Link href="/sign-up?plan=per_deal" className="btn-secondary justify-center">
              Get started <ArrowRight size={15} />
            </Link>
          </div>

          {/* Subscription -- featured */}
          <div className="card p-7 flex flex-col border-brand-300 ring-2 ring-brand-600 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-brand-600 text-white text-xs font-semibold px-3 py-1 rounded-full">Most popular</span>
            </div>
            <div className="text-sm font-semibold text-brand-600 uppercase tracking-wide mb-2">Monthly Subscription</div>
            <div className="mb-1">
              <span className="text-4xl font-bold text-slate-900">$500</span>
              <span className="text-slate-400 text-sm ml-1">/month</span>
            </div>
            <div className="text-slate-500 text-sm mb-1">Up to 10 deals/month</div>
            <p className="text-slate-400 text-xs mb-6">Counter resets on the 1st of each month. No per-deal charges.</p>

            <ul className="space-y-3 mb-8 flex-1">
              {subscriptionItems.map(item => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <CheckCircle size={15} className="text-brand-500 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>

            <Link href="/sign-up?plan=subscription" className="btn-primary justify-center">
              Subscribe now <ArrowRight size={15} />
            </Link>
          </div>

          {/* High volume */}
          <div className="card p-7 flex flex-col bg-slate-900 text-white border-slate-800">
            <div className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-2">High Volume</div>
            <div className="mb-1">
              <span className="text-4xl font-bold text-white">10+</span>
              <span className="text-slate-400 text-sm ml-1">deals/month</span>
            </div>
            <div className="text-slate-400 text-sm mb-1">Custom pricing</div>
            <p className="text-slate-500 text-xs mb-6">
              For teams and brokerages running more than 10 transactions per month. Let&apos;s talk.
            </p>

            <ul className="space-y-3 mb-8 flex-1">
              {[
                "Everything in Monthly",
                "No deal cap",
                "Dedicated TC contact",
                "Volume discount pricing",
                "Brokerage-level reporting",
                "Custom onboarding",
              ].map(item => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-slate-300">
                  <CheckCircle size={15} className="text-slate-500 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>

            <a href="#contact-sales" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-white text-slate-900 font-medium text-sm hover:bg-slate-100 transition-colors">
              <Phone size={15} /> Talk to us
            </a>
          </div>
        </div>
      </section>

      {/* Comparison note */}
      <section className="py-8 px-4 border-t border-slate-100 bg-slate-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 text-center">Which plan is right for me?</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm text-slate-600">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="font-medium text-slate-800 mb-2">Choose Per Deal if...</div>
              <ul className="space-y-1.5">
                <li>You close 1-2 deals per month</li>
                <li>You want no ongoing commitment</li>
                <li>You are trying us out for the first time</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="font-medium text-slate-800 mb-2">Choose Monthly if...</div>
              <ul className="space-y-1.5">
                <li>You close 3+ deals per month</li>
                <li>You want predictable, flat-rate costs</li>
                <li>You value a streamlined workflow</li>
              </ul>
            </div>
          </div>
          <p className="text-center text-slate-400 text-xs mt-4">
            At 3 deals/month, the subscription pays for itself vs. per-deal pricing.
          </p>
        </div>
      </section>

      {/* Commercial Transactions */}
      <section className="py-16 px-4 bg-brand-950 text-white">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="w-11 h-11 rounded-xl bg-brand-700 flex items-center justify-center mb-5">
              <Building2 size={20} className="text-brand-200" />
            </div>
            <div className="text-xs font-semibold text-brand-400 uppercase tracking-wide mb-3">Commercial Transactions</div>
            <h2 className="text-2xl font-bold mb-4">Working on a commercial deal?</h2>
            <p className="text-brand-200 leading-relaxed mb-4">
              Commercial transactions involve a higher level of complexity -- longer timelines, more parties, custom due diligence periods, and unique documentation requirements. We handle them, but every commercial file is scoped individually.
            </p>
            <p className="text-brand-200 leading-relaxed">
              Reach out through the contact form and tell us about your deal. We will put together the right plan and walk you through exactly how we would coordinate it.
            </p>
          </div>
          <div className="space-y-4">
            {[
              "Custom coordination scope per deal",
              "Office, retail, industrial, and mixed-use",
              "Extended due diligence and contingency tracking",
              "Multi-party coordination across brokers, attorneys, and title",
              "Pricing quoted on a per-deal basis",
            ].map(item => (
              <div key={item} className="flex items-start gap-3 text-brand-200 text-sm">
                <CheckCircle size={15} className="text-brand-400 flex-shrink-0 mt-0.5" />
                {item}
              </div>
            ))}
            <a
              href="#contact-sales"
              className="inline-flex items-center gap-2 mt-2 bg-white text-brand-900 font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-brand-50 transition-colors"
            >
              <Phone size={14} /> Talk to our team
            </a>
          </div>
        </div>
      </section>

      {/* Contact Sales */}
      <section id="contact-sales" className="py-20 px-4 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          <div>
            <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center mb-5">
              <MessageCircle size={20} className="text-slate-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Talk to our team</h2>
            <p className="text-slate-500 leading-relaxed mb-6">
              Whether you are evaluating us for your brokerage, want to discuss a commercial deal, or just have questions before signing up -- we are a real team and we are happy to connect.
            </p>
            <div className="space-y-3 text-sm text-slate-500">
              <div className="flex items-start gap-3">
                <CheckCircle size={15} className="text-green-500 flex-shrink-0 mt-0.5" />
                <span>High-volume agents and teams looking for custom pricing</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle size={15} className="text-green-500 flex-shrink-0 mt-0.5" />
                <span>Agents with commercial or complex transactions</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle size={15} className="text-green-500 flex-shrink-0 mt-0.5" />
                <span>Brokerages interested in setting up multiple agents</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle size={15} className="text-green-500 flex-shrink-0 mt-0.5" />
                <span>Anyone who wants to talk through a deal before opening a file</span>
              </div>
            </div>
          </div>

          <div className="card p-7">
            <SalesContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}

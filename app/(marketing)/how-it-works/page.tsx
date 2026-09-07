import { Metadata } from "next";
import { CheckCircle, ClipboardList, MessageSquare, FileSearch, Key, UserCheck } from "lucide-react";

export const metadata: Metadata = { title: "How It Works" };

const phases = [
  {
    icon: ClipboardList,
    phase: "Phase 1",
    title: "Intake",
    color: "bg-blue-50 text-blue-600",
    items: [
      "You submit the executed contract and key property/party details through your client portal.",
      "We open the file and charge the retainer (per-deal clients) or count the deal against your monthly cap (subscribers).",
      "We send a personalized welcome communication to all parties â buyers, sellers, escrow, lender, and co-op agent â introducing ourselves and setting expectations.",
      "We log all key dates: earnest money deadline, inspection period, appraisal, financing contingency, and the target closing date.",
    ],
  },
  {
    icon: FileSearch,
    phase: "Phase 2",
    title: "Active Tracking",
    color: "bg-amber-50 text-amber-600",
    items: [
      "We confirm earnest money deposit receipt with escrow.",
      "We coordinate inspection scheduling and follow up on results.",
      "We document repair negotiation outcomes and communicate them to the relevant parties.",
      "We track appraisal orders and follow up with the lender on status.",
      "We monitor the financing contingency timeline, nudging the lender as deadlines approach.",
      "We order and review title commitment, flagging any issues for the agent.",
      "We request and track HOA documents if the property is in an HOA.",
    ],
  },
  {
    icon: CheckCircle,
    phase: "Phase 3",
    title: "Pre-Closing",
    color: "bg-purple-50 text-purple-600",
    items: [
      "Once all contingencies are cleared, we confirm in writing with all parties.",
      "We review the closing disclosure for accuracy and flag discrepancies.",
      "We coordinate final walkthrough scheduling between agents.",
      "We confirm closing date, time, and location with all parties â lender, escrow, both agents â so closing day has no surprises.",
    ],
  },
  {
    icon: Key,
    phase: "Phase 4",
    title: "Closing",
    color: "bg-green-50 text-green-600",
    items: [
      "We confirm closing is completed and update your portal to Closed.",
      "We invoice the closing balance (per-deal clients) and collect payment.",
      "Your file is archived with full documentation for your records.",
    ],
  },
];

const faqs = [
  {
    q: "Who is my transaction manager?",
    a: "When you open your first deal, you're assigned a dedicated myTCteam Transaction Manager. You'll see their name in your client portal and they'll introduce themselves when your file is opened. They're your single point of contact for every deal you run with us.",
  },
  {
    q: "Do I need to be present for any of this?",
    a: "No. We handle all coordination on your behalf. You'll receive status updates through your portal and by email, but you don't need to manage or attend any of the coordination steps.",
  },
  {
    q: "What if the deal falls through?",
    a: "We flag the file as 'Fallen Through,' log the reason, and archive it. The $75 retainer is non-refundable as we've already opened and worked the file. No closing balance is owed.",
  },
  {
    q: "Can I see what's happening on my deal at any time?",
    a: "Yes. Your client portal shows the current stage, the checklist of completed and outstanding items, key dates, and your payment history.",
  },
  {
    q: "Do you provide legal advice or fill in contract terms?",
    a: "No. We coordinate the administrative process â deadlines, documents, and communication. We don't draft contracts, advise on negotiations, or provide legal counsel.",
  },
  {
    q: "What markets do you work in?",
    a: "Contact us to confirm coverage for your market. We work with agents across multiple regions and can discuss your specific area.",
  },
];

export default function HowItWorksPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-slate-50 py-16 px-4 border-b border-slate-100">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">How myTCteam works</h1>
          <p className="text-lg text-slate-500">
            From the moment your contract is executed to the day it closes, here's what we do â
            written for agents, not compliance officers.
          </p>
        </div>
      </section>

      {/* Dedicated TC */}
      <section className="py-14 px-4 bg-brand-950 text-white">
        <div className="max-w-3xl mx-auto flex gap-6 items-start">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-xl bg-brand-700 flex items-center justify-center">
              <UserCheck size={22} className="text-brand-200" />
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-brand-400 uppercase tracking-wide mb-2">Your team, your deal</div>
            <h2 className="text-2xl font-bold mb-3">You get a dedicated transaction manager</h2>
            <p className="text-brand-200 leading-relaxed mb-4">
              When you create your account and open your first deal, you're assigned a dedicated myTCteam
              Transaction Manager. This is your person â they own your file from contract to close,
              know your deal inside and out, and are accountable for every deadline and communication.
            </p>
            <p className="text-brand-200 leading-relaxed">
              You're not passed around between staff. Your TC builds familiarity with how you work,
              your preferred communication style, and your clients. Over time, they become an extension
              of your business â not just a service you hired.
            </p>
          </div>
        </div>
      </section>

      {/* Phases */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto space-y-12">
          {phases.map(({ icon: Icon, phase, title, color, items }) => (
            <div key={phase} className="flex gap-6">
              <div className="flex-shrink-0 pt-1">
                <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
                  <Icon size={20} />
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{phase}</div>
                <h2 className="text-xl font-bold text-slate-900 mb-4">{title}</h2>
                <ul className="space-y-3">
                  {items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-600 text-sm leading-relaxed">
                      <CheckCircle size={15} className="text-green-500 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Exception: Fallen Through */}
      <section className="py-12 px-4 bg-red-50 border-y border-red-100">
        <div className="max-w-3xl mx-auto flex gap-5">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
              <MessageSquare size={18} />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 mb-2">If the deal falls through</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Real estate is unpredictable. If a transaction falls apart â at any stage â we flag the file
              as "Fallen Through," log the reason, and archive it with complete documentation. The $75 retainer
              is kept (we've done real work), and no closing balance is owed. You can come back and open a new
              file when you're ready to try again.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Common questions</h2>
          <div className="space-y-6">
            {faqs.map(({ q, a }) => (
              <div key={q} className="border-b border-slate-100 pb-6">
                <h3 className="font-semibold text-slate-900 mb-2">{q}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 px-4 bg-slate-50 border-t border-slate-100">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Ready to open your first file?</h2>
          <p className="text-slate-500 mb-6">Create an account in minutes. No commitment until you submit a deal.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/sign-up" className="btn-primary">Get started</a>
            <a href="/pricing" className="btn-secondary">See pricing</a>
          </div>
        </div>
      </section>
    </div>
  );
}

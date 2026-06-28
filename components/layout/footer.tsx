import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-brand-600 flex items-center justify-center">
            <span className="text-white font-bold text-xs">TC</span>
          </div>
          <span className="font-semibold text-slate-700 text-sm">myTCteam</span>
        </div>
        <nav className="flex items-center gap-6 text-sm text-slate-500">
          <Link href="/how-it-works" className="hover:text-slate-700 transition-colors">How It Works</Link>
          <Link href="/pricing"      className="hover:text-slate-700 transition-colors">Pricing</Link>
          <Link href="/contact"      className="hover:text-slate-700 transition-colors">Contact</Link>
        </nav>
        <p className="text-sm text-slate-400">© {new Date().getFullYear()} myTCteam. All rights reserved.</p>
      </div>
    </footer>
  );
}

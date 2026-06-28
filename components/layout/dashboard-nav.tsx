"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileText, CreditCard, PlusCircle, LogOut, Menu, X
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const navLinks = [
  { href: "/dashboard",          label: "Overview",    icon: LayoutDashboard },
  { href: "/dashboard/deals",    label: "My Deals",    icon: FileText },
  { href: "/dashboard/billing",  label: "Billing",     icon: CreditCard },
  { href: "/dashboard/new-deal", label: "New Deal",    icon: PlusCircle },
];

export function DashboardNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <>
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-60 min-h-screen border-r border-slate-100 bg-white py-6 px-3">
        <Link href="/" className="flex items-center gap-2 px-3 mb-8">
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xs">TC</span>
          </div>
          <span className="font-semibold text-slate-900">myTCteam</span>
        </Link>

        <nav className="flex-1 space-y-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon size={17} />
              {label}
            </Link>
          ))}
        </nav>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
        >
          <LogOut size={17} />
          Sign out
        </button>
      </aside>

      {/* Top bar — mobile */}
      <div className="md:hidden sticky top-0 z-40 bg-white border-b border-slate-100 px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
            <span className="text-white font-bold text-xs">TC</span>
          </div>
          <span className="font-semibold text-slate-900">myTCteam</span>
        </Link>
        <button onClick={() => setOpen(!open)} className="p-1 text-slate-600">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/30" onClick={() => setOpen(false)} />
      )}
      {open && (
        <div className="md:hidden fixed top-14 left-0 z-40 w-64 bg-white border-r border-slate-100 h-[calc(100vh-56px)] flex flex-col py-4 px-3">
          <nav className="flex-1 space-y-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
                  pathname === href ? "bg-brand-50 text-brand-700" : "text-slate-600"
                )}
              >
                <Icon size={17} />{label}
              </Link>
            ))}
          </nav>
          <button onClick={handleSignOut} className="flex items-center gap-3 px-3 py-2 text-sm text-slate-500">
            <LogOut size={17} />Sign out
          </button>
        </div>
      )}
    </>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, FileText, CalendarDays, Settings, LogOut, ShieldCheck, TableProperties
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const navLinks = [
  { href: "/admin",               label: "Overview",    icon: LayoutDashboard },
  { href: "/admin/clients",       label: "Clients",     icon: Users },
  { href: "/admin/deals",         label: "All Deals",   icon: FileText },
  { href: "/admin/calendar",      label: "Deadlines",   icon: CalendarDays },
  { href: "/admin/spreadsheet",   label: "Spreadsheet", icon: TableProperties },
  { href: "/admin/settings",      label: "Settings",    icon: Settings },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <aside className="flex flex-col w-60 min-h-screen border-r border-slate-100 bg-slate-950 py-6 px-3">
      <Link href="/admin" className="flex items-center gap-2 px-3 mb-2">
        <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-xs">TC</span>
        </div>
        <span className="font-semibold text-white">myTCteam</span>
      </Link>
      <div className="px-3 mb-6">
        <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-400 bg-brand-950 px-2 py-0.5 rounded">
          <ShieldCheck size={11} /> Admin
        </span>
      </div>

      <nav className="flex-1 space-y-1">
        {navLinks.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              pathname === href || (href !== "/admin" && pathname.startsWith(href))
                ? "bg-white/10 text-white"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
            )}
          >
            <Icon size={17} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-white/10 pt-4 mt-4">
        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200">
          ← Client view
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-colors"
        >
          <LogOut size={17} />
          Sign out
        </button>
      </div>
    </aside>
  );
}

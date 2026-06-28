"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export interface Tab { key: string; label: string }

export function TabNav({ tabs, baseUrl }: { tabs: Tab[]; baseUrl: string }) {
  const searchParams = useSearchParams();
  const active = searchParams.get("tab") || tabs[0].key;
  return (
    <div className="flex gap-1 border-b border-slate-200 mb-6 overflow-x-auto">
      {tabs.map(t => (
        <Link
          key={t.key}
          href={`${baseUrl}?tab=${t.key}`}
          className={cn(
            "px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors",
            active === t.key
              ? "border-brand-600 text-brand-700"
              : "border-transparent text-slate-500 hover:text-slate-700"
          )}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}

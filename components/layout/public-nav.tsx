"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/how-it-works", label: "How It Works" },
  { href: "/pricing",      label: "Pricing" },
  { href: "/contact",      label: "Contact" },
];

export function PublicNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <svg viewBox="0 0 480 80" xmlns="http://www.w3.org/2000/svg" className="h-9 w-auto">
            <circle cx="28" cy="40" r="28" fill="#6366f1"/>
            <circle cx="62" cy="40" r="28" fill="#3730a3"/>
            <text x="28" y="40" textAnchor="middle" dominantBaseline="central"
              fontFamily="Arial Black, Arial, sans-serif" fontSize="24" fontWeight="900" fill="#ffffff">T</text>
            <text x="62" y="40" textAnchor="middle" dominantBaseline="central"
              fontFamily="Arial Black, Arial, sans-serif" fontSize="24" fontWeight="900" fill="#ffffff">C</text>
            <text x="104" y="34" textAnchor="start" dominantBaseline="central"
              fontFamily="Arial Black, Arial, sans-serif" fontSize="30" fontWeight="900" fill="#1e1b4b" letterSpacing="-1">my<tspan fill="#3730a3">TC</tspan>team</text>
            <text x="106" y="60" textAnchor="start" dominantBaseline="central"
              fontFamily="Arial, sans-serif" fontSize="10" fill="#94a3b8" letterSpacing="3">TRANSACTION COORDINATION</text>
          </svg>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors",
                pathname === link.href
                  ? "text-brand-600"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/sign-in" className="btn-ghost text-sm">Sign in</Link>
          <Link href="/sign-up" className="btn-primary text-sm">Get started</Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-1">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link href="/sign-in" onClick={() => setMenuOpen(false)} className="btn-secondary w-full justify-center">
              Sign in
            </Link>
            <Link href="/sign-up" onClick={() => setMenuOpen(false)} className="btn-primary w-full justify-center">
              Get started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

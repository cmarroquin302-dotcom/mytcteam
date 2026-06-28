import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { differenceInCalendarDays, format, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  try {
    return format(parseISO(dateStr), "MMM d, yyyy");
  } catch {
    return dateStr;
  }
}

export function daysUntil(dateStr: string): number {
  try {
    return differenceInCalendarDays(parseISO(dateStr), new Date());
  } catch {
    return 999;
  }
}

export function urgencyColor(days: number): string {
  if (days < 0) return "text-red-600 bg-red-50";
  if (days <= 2) return "text-red-600 bg-red-50";
  if (days <= 5) return "text-amber-600 bg-amber-50";
  return "text-green-700 bg-green-50";
}

export function urgencyLabel(days: number): string {
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `${days}d`;
}

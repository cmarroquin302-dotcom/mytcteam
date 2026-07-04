/**
 * GET /api/cron/deadline-reminders
 * Runs daily at 8am via Vercel cron.
 * Finds checklist items and closing dates due within 3 days and emails the admin.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendDeadlineReminderEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    return NextResponse.json({ error: "ADMIN_EMAIL not configured" }, { status: 500 });
  }

  const supabase = await createClient();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in3Days = new Date(today);
  in3Days.setDate(today.getDate() + 3);

  const todayIso = today.toISOString().split("T")[0];
  const in3DaysIso = in3Days.toISOString().split("T")[0];

  // ── 1. Checklist items due within 3 days (not completed) ──────────────────
  const { data: checklistItems } = await supabase
    .from("checklist_items")
    .select("id, label, due_date, deal_id, deals(id, property_address, stage)")
    .eq("completed", false)
    .not("due_date", "is", null)
    .gte("due_date", todayIso)
    .lte("due_date", in3DaysIso)
    .not("deals.stage", "in", '("closed","fallen_through","archived")');

  // ── 2. Closing dates due within 3 days ────────────────────────────────────
  const { data: closingDeals } = await supabase
    .from("deals")
    .select("id, property_address, closing_date")
    .not("stage", "in", '("closed","fallen_through","archived")')
    .not("closing_date", "is", null)
    .gte("closing_date", todayIso)
    .lte("closing_date", in3DaysIso);

  // ── Build deadline list ───────────────────────────────────────────────────
  type DeadlineRow = {
    propertyAddress: string;
    dateLabel: string;
    dateValue: string;
    daysUntil: number;
    dealId: string;
  };

  const deadlines: DeadlineRow[] = [];

  function daysUntil(dateStr: string): number {
    const d = new Date(dateStr + "T00:00:00");
    return Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  for (const item of checklistItems ?? []) {
    const deal = Array.isArray(item.deals) ? item.deals[0] : item.deals;
    if (!deal || !item.due_date) continue;
    deadlines.push({
      propertyAddress: deal.property_address,
      dateLabel: item.label,
      dateValue: item.due_date,
      daysUntil: daysUntil(item.due_date),
      dealId: deal.id,
    });
  }

  for (const deal of closingDeals ?? []) {
    if (!deal.closing_date) continue;
    deadlines.push({
      propertyAddress: deal.property_address,
      dateLabel: "Closing Date",
      dateValue: deal.closing_date,
      daysUntil: daysUntil(deal.closing_date),
      dealId: deal.id,
    });
  }

  if (deadlines.length === 0) {
    return NextResponse.json({ sent: false, reason: "No upcoming deadlines" });
  }

  // Sort by soonest first
  deadlines.sort((a, b) => a.daysUntil - b.daysUntil);

  await sendDeadlineReminderEmail({ to: adminEmail, deadlines });

  return NextResponse.json({ sent: true, count: deadlines.length });
}

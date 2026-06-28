/**
 * POST /api/admin/seed-demo
 * Creates a realistic demo deal with checklist items for testing.
 * Admin only.
 */
import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim());
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin && !adminEmails.includes(user.email || "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = await createAdminClient();

  // Close date ~30 days out
  const closingDate = new Date();
  closingDate.setDate(closingDate.getDate() + 30);
  const contractDate = new Date();
  contractDate.setDate(contractDate.getDate() - 14);

  const { data: deal, error } = await admin.from("deals").insert({
    client_id: user.id,
    property_address: "456 Oak Avenue, Austin, TX 78701",
    buyer_name: "Marcus & Sarah Johnson",
    seller_name: "Robert Chen",
    escrow_officer: "Lisa Park – First American Title",
    lender_name: "Wells Fargo Home Mortgage",
    contract_price: 485000,
    contract_date: contractDate.toISOString().split("T")[0],
    closing_date: closingDate.toISOString().split("T")[0],
    stage: "active_tracking",
    retainer_paid: true,
    retainer_amount: 75,
    closing_fee_amount: 250,
  }).select().single();

  if (error || !deal) {
    return NextResponse.json({ error: error?.message || "Failed to create deal" }, { status: 500 });
  }

  // Seed a realistic checklist
  const today = new Date().toISOString().split("T")[0];
  const in3 = new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0];
  const in7 = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];
  const in14 = new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0];
  const in21 = new Date(Date.now() + 21 * 86400000).toISOString().split("T")[0];

  const checklistItems = [
    // Intake — completed
    { label: "Receive signed purchase agreement", stage: "intake", sort_order: 1, completed: true, admin_only: false },
    { label: "Send welcome email to all parties", stage: "intake", sort_order: 2, completed: true, admin_only: true },
    { label: "Open escrow with title company", stage: "intake", sort_order: 3, completed: true, admin_only: true },
    { label: "Collect earnest money deposit confirmation", stage: "intake", sort_order: 4, completed: true, admin_only: false },
    // Active tracking — in progress
    { label: "Schedule home inspection", stage: "active_tracking", sort_order: 1, completed: true, admin_only: false, due_date: today },
    { label: "Review inspection report with buyer", stage: "active_tracking", sort_order: 2, completed: false, admin_only: false, due_date: in3 },
    { label: "Submit repair request / credit request", stage: "active_tracking", sort_order: 3, completed: false, admin_only: false, due_date: in7 },
    { label: "Confirm loan application submitted", stage: "active_tracking", sort_order: 4, completed: true, admin_only: true },
    { label: "Order appraisal", stage: "active_tracking", sort_order: 5, completed: false, admin_only: true, due_date: in3 },
    { label: "Verify homeowner's insurance bound", stage: "active_tracking", sort_order: 6, completed: false, admin_only: false, due_date: in14 },
    // Pre-closing
    { label: "Receive appraisal report", stage: "pre_closing", sort_order: 1, completed: false, admin_only: true, due_date: in14 },
    { label: "Clear title commitment", stage: "pre_closing", sort_order: 2, completed: false, admin_only: true, due_date: in14 },
    { label: "Confirm final loan approval (clear to close)", stage: "pre_closing", sort_order: 3, completed: false, admin_only: false, due_date: in21 },
    { label: "Schedule final walkthrough", stage: "pre_closing", sort_order: 4, completed: false, admin_only: false, due_date: in21 },
    // Closing
    { label: "Confirm closing date, time, and location", stage: "closing", sort_order: 1, completed: false, admin_only: false },
    { label: "Send closing disclosure to buyer", stage: "closing", sort_order: 2, completed: false, admin_only: true },
    { label: "Confirm wire transfer instructions", stage: "closing", sort_order: 3, completed: false, admin_only: true },
    { label: "Attend / coordinate closing signing", stage: "closing", sort_order: 4, completed: false, admin_only: false },
  ].map(item => ({ ...item, deal_id: deal.id }));

  await admin.from("checklist_items").insert(checklistItems);

  // Record the retainer payment
  await admin.from("payments").insert({
    deal_id: deal.id,
    client_id: user.id,
    type: "retainer",
    amount: 75,
    status: "paid",
    description: "Transaction retainer (demo)",
    paid_at: new Date().toISOString(),
  });

  return NextResponse.json({ deal_id: deal.id });
}

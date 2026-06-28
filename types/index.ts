// ─── Plans ───────────────────────────────────────────────────────────────────
export type Plan = "per_deal" | "subscription" | "high_volume";

// ─── Deal stages ─────────────────────────────────────────────────────────────
export type DealStage =
  | "intake"
  | "active_tracking"
  | "pre_closing"
  | "closing"
  | "closed"
  | "fallen_through";

export const DEAL_STAGE_LABELS: Record<DealStage, string> = {
  intake: "Intake",
  active_tracking: "Active Tracking",
  pre_closing: "Pre-Closing",
  closing: "Closing",
  closed: "Closed",
  fallen_through: "Fallen Through",
};

export const DEAL_STAGE_ORDER: DealStage[] = [
  "intake",
  "active_tracking",
  "pre_closing",
  "closing",
  "closed",
];

// ─── Profile ─────────────────────────────────────────────────────────────────
export interface Profile {
  id: string;                       // matches auth.users.id
  email: string;
  full_name: string | null;
  company_name: string | null;
  phone: string | null;
  plan: Plan;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string | null; // 'active' | 'past_due' | 'canceled' | null
  deals_used_this_month: number;
  deals_cap: number;                // 10 for subscription, 0 = unlimited for high_volume (manual)
  is_admin: boolean;
  created_at: string;
}

// ─── Deal ─────────────────────────────────────────────────────────────────────
export interface Deal {
  id: string;
  client_id: string;
  property_address: string;
  buyer_name: string | null;
  seller_name: string | null;
  escrow_officer: string | null;
  lender_name: string | null;
  contract_price: number | null;
  contract_date: string | null;       // ISO date
  closing_date: string | null;        // ISO date (target)
  stage: DealStage;
  retainer_paid: boolean;
  retainer_amount: number;
  closing_fee_amount: number;
  closing_fee_paid: boolean;
  fallen_through_reason: string | null;
  internal_notes: string | null;      // admin only
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  // joined
  client?: Profile;
  checklist_items?: ChecklistItem[];
}

// ─── Checklist item ──────────────────────────────────────────────────────────
export interface ChecklistItem {
  id: string;
  deal_id: string;
  stage: DealStage;
  label: string;
  completed: boolean;
  due_date: string | null;           // ISO date — feeds deadline calendar
  completed_at: string | null;
  admin_only: boolean;               // hidden from client view
  sort_order: number;
  created_at: string;
}

// ─── Payment ──────────────────────────────────────────────────────────────────
export interface Payment {
  id: string;
  client_id: string;
  deal_id: string | null;
  type: "retainer" | "closing_fee" | "subscription";
  amount: number;                    // in dollars
  status: "pending" | "paid" | "refunded" | "waived";
  stripe_payment_intent_id: string | null;
  stripe_invoice_id: string | null;
  description: string | null;
  paid_at: string | null;
  created_at: string;
}

// ─── Settings ─────────────────────────────────────────────────────────────────
export interface AppSettings {
  id: string;
  key: string;
  value: string;
  updated_at: string;
}

// ─── Notification ─────────────────────────────────────────────────────────────
export interface Notification {
  id: string;
  client_id: string;
  deal_id: string | null;
  type: "stage_change" | "deadline_reminder" | "cap_warning" | "payment";
  subject: string;
  body: string;
  sent: boolean;
  sent_at: string | null;
  created_at: string;
}

// ─── View helpers ──────────────────────────────────────────────────────────────
export interface DeadlineItem {
  deal_id: string;
  deal_address: string;
  client_name: string;
  checklist_item_id: string;
  label: string;
  due_date: string;
  stage: DealStage;
  completed: boolean;
  days_until: number;
}

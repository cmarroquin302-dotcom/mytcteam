import { DealStage } from "@/types";

// Default checklist items per stage — pre-populated when a deal is created
export const DEFAULT_CHECKLIST: Record<DealStage, { label: string; admin_only: boolean }[]> = {
  intake: [
    { label: "Contract uploaded and details entered", admin_only: false },
    { label: "File opened and retainer charged / deal counted", admin_only: true },
    { label: "Welcome email sent to all parties", admin_only: false },
    { label: "Earnest money deposit deadline noted", admin_only: false },
  ],
  active_tracking: [
    { label: "Earnest money deposit confirmed", admin_only: false },
    { label: "Inspection scheduled", admin_only: false },
    { label: "Inspection completed", admin_only: false },
    { label: "Repair negotiations documented (status)", admin_only: false },
    { label: "Appraisal ordered", admin_only: false },
    { label: "Appraisal received", admin_only: false },
    { label: "Financing contingency confirmed with lender", admin_only: false },
    { label: "Title commitment ordered", admin_only: false },
    { label: "Title commitment reviewed", admin_only: false },
    { label: "HOA docs requested (if applicable)", admin_only: false },
    { label: "HOA docs received (if applicable)", admin_only: false },
  ],
  pre_closing: [
    { label: "All contingencies cleared", admin_only: false },
    { label: "Closing disclosure reviewed", admin_only: false },
    { label: "Final walkthrough scheduled", admin_only: false },
    { label: "Closing date/time confirmed with all parties", admin_only: false },
  ],
  closing: [
    { label: "Closing completed", admin_only: false },
    { label: "Closing balance invoiced", admin_only: true },
    { label: "Closing balance collected", admin_only: true },
  ],
  closed: [],
  fallen_through: [
    { label: "File archived with reason logged", admin_only: true },
    { label: "Retainer confirmed kept (no closing balance)", admin_only: true },
  ],
};

export const SUBSCRIPTION_DEAL_CAP = 10;
export const DEFAULT_CLOSING_FEE = 250;
export const RETAINER_FEE = 75;
export const SUBSCRIPTION_FEE = 500;

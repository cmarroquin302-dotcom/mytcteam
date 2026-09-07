import { DealStage } from "@/types";

// Default checklist items per stage — pre-populated when a deal is created
// Mirrors the myTCteam TC Transaction Checklist spreadsheet (41 items)
export const DEFAULT_CHECKLIST: Record<DealStage, { label: string; admin_only: boolean }[]> = {
  // PRE-CONTRACT
  intake: [
    { label: "Contract received from agent", admin_only: false },
    { label: "Review contract for accuracy (price, dates, parties)", admin_only: true },
    { label: "Send intro email to all parties", admin_only: false },
    { label: "Set up transaction file / folder", admin_only: true },
    { label: "Calendar all deadlines", admin_only: true },
    { label: "Confirm earnest money instructions sent to buyer", admin_only: false },
    { label: "Confirm option fee delivered to seller", admin_only: false },
    { label: "File opened and retainer charged", admin_only: true },
  ],
  // UNDER CONTRACT – OPTION PERIOD + POST-OPTION
  active_tracking: [
    { label: "Earnest money delivered & receipt confirmed", admin_only: false },
    { label: "Option fee delivered & receipt confirmed", admin_only: false },
    { label: "Inspection scheduled", admin_only: false },
    { label: "Inspection completed – report received", admin_only: false },
    { label: "Amendment/repairs negotiated (if needed)", admin_only: false },
    { label: "Option period released or contract terminated", admin_only: false },
    { label: "Survey ordered", admin_only: false },
    { label: "HOA documents requested (if applicable)", admin_only: false },
    { label: "Title commitment ordered", admin_only: false },
    { label: "Title commitment received & reviewed", admin_only: true },
    { label: "Title issues flagged (if any)", admin_only: true },
    { label: "Survey received & approved", admin_only: false },
    { label: "HOA documents received & forwarded to buyer", admin_only: false },
    { label: "Lender appraisal ordered (confirm with LO)", admin_only: false },
    { label: "Appraisal received – value confirmed", admin_only: false },
    { label: "3rd party financing deadline tracked", admin_only: true },
    { label: "Loan approval received", admin_only: false },
    { label: "Clear to close received from lender", admin_only: false },
  ],
  // CLOSING PREP
  pre_closing: [
    { label: "Closing disclosure (CD) received & reviewed", admin_only: false },
    { label: "CD forwarded to buyer", admin_only: false },
    { label: "Final walk-through scheduled", admin_only: false },
    { label: "Final walk-through completed – no issues", admin_only: false },
    { label: "Utilities transfer scheduled (buyer)", admin_only: false },
    { label: "Closing statement reviewed (HUD / settlement)", admin_only: true },
    { label: "Wire instructions confirmed with title (verbally)", admin_only: true },
    { label: "Confirm closing time & location with all parties", admin_only: false },
    { label: "CDA (Commission Disbursement Authorization) submitted", admin_only: true },
  ],
  // CLOSING & POST-CLOSING
  closing: [
    { label: "Closing completed – keys delivered", admin_only: false },
    { label: "Funding confirmed", admin_only: true },
    { label: "Commission received by brokerage", admin_only: true },
    { label: "TC invoice sent & paid", admin_only: true },
    { label: "Documents filed / archived", admin_only: true },
    { label: "Google review requested from client", admin_only: true },
    { label: "Referral follow-up sent", admin_only: true },
  ],
  closed: [],
  fallen_through: [
    { label: "File archived with reason logged", admin_only: true },
    { label: "Retainer confirmed kept (no closing balance)", admin_only: true },
    { label: "Parties notified of termination", admin_only: false },
  ],
};

export const SUBSCRIPTION_DEAL_CAP = 10;
export const DEFAULT_CLOSING_FEE = 250;
export const RETAINER_FEE = 75;
export const SUBSCRIPTION_FEE = 500;

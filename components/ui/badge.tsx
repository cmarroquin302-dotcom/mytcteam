"use client";

import { DealStage, DEAL_STAGE_LABELS } from "@/types";
import { cn } from "@/lib/utils";

const stageColors: Record<DealStage, string> = {
  intake:          "bg-blue-50 text-blue-700",
  active_tracking: "bg-amber-50 text-amber-700",
  pre_closing:     "bg-purple-50 text-purple-700",
  closing:         "bg-orange-50 text-orange-700",
  closed:          "bg-green-50 text-green-700",
  fallen_through:  "bg-red-50 text-red-600",
};

export function StageBadge({ stage }: { stage: DealStage }) {
  return (
    <span className={cn("badge-stage", stageColors[stage])}>
      {DEAL_STAGE_LABELS[stage]}
    </span>
  );
}

export function StatusDot({ active }: { active: boolean }) {
  return (
    <span className={cn(
      "inline-block w-2 h-2 rounded-full",
      active ? "bg-green-500" : "bg-slate-300"
    )} />
  );
}

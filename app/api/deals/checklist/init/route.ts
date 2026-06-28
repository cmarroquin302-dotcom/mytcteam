import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { DEFAULT_CHECKLIST } from "@/lib/constants";
import type { DealStage } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { deal_id } = await req.json();
    if (!deal_id) return NextResponse.json({ error: "deal_id required" }, { status: 400 });

    // Auth check with user session
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Verify access to this deal (uses user session — enforces RLS for access check)
    const { data: deal } = await supabase.from("deals").select("id, stage").eq("id", deal_id).single();
    if (!deal) return NextResponse.json({ error: "Deal not found" }, { status: 404 });

    // Build checklist items for all stages
    const allStages: DealStage[] = ["intake", "active_tracking", "pre_closing", "closing"];
    const items = allStages.flatMap((stage, stageIndex) =>
      (DEFAULT_CHECKLIST[stage] || []).map((item, i) => ({
        deal_id,
        stage,
        label: item.label,
        admin_only: item.admin_only,
        sort_order: stageIndex * 100 + i,
        completed: false,
      }))
    );

    // Use bare supabase-js client with service role key to bypass RLS for insert
    // (createServerClient from @supabase/ssr still uses cookie auth, overriding the service role)
    const adminSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    const { error } = await adminSupabase.from("checklist_items").insert(items);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, count: items.length });
  } catch (err) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

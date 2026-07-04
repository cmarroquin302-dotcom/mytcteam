/**
 * POST /api/notify/stage
 * Called client-side after a deal stage is updated.
 * Sends an email to the client with the new status.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendDealStageChangedEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { dealId, newStage, note } = await req.json() as {
      dealId: string;
      newStage: string;
      note?: string;
    };

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ ok: false }, { status: 401 });

    const { data: deal } = await supabase
      .from("deals")
      .select("id, property_address, client_id, profiles!deals_client_id_fkey(full_name, email)")
      .eq("id", dealId)
      .single();

    if (!deal) return NextResponse.json({ ok: false }, { status: 404 });

    const client = Array.isArray(deal.profiles) ? deal.profiles[0] : deal.profiles;
    if (client?.email) {
      await sendDealStageChangedEmail({
        to: client.email,
        toName: client.full_name || "there",
        propertyAddress: deal.property_address,
        newStage,
        dealId,
        note,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[notify/stage]", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

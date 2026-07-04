/**
 * POST /api/notify/document
 * Called client-side after a document is uploaded.
 * Sends an email to the client notifying them.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendDocumentUploadedEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { dealId, documentName } = await req.json() as {
      dealId: string;
      documentName: string;
    };

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ ok: false }, { status: 401 });

    const { data: uploaderProfile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .single();

    const { data: deal } = await supabase
      .from("deals")
      .select("id, property_address, client_id, profiles!deals_client_id_fkey(full_name, email)")
      .eq("id", dealId)
      .single();

    if (!deal) return NextResponse.json({ ok: false }, { status: 404 });

    const client = Array.isArray(deal.profiles) ? deal.profiles[0] : deal.profiles;
    if (client?.email) {
      await sendDocumentUploadedEmail({
        to: client.email,
        toName: client.full_name || "there",
        propertyAddress: deal.property_address,
        documentName,
        uploadedBy: uploaderProfile?.full_name || uploaderProfile?.email || "Your TC",
        dealId,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[notify/document]", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

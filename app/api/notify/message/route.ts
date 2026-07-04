/**
 * POST /api/notify/message
 * Called client-side after a deal message is inserted.
 * Sends an email notification to the other party.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendNewMessageEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { dealId, messagePreview } = await req.json() as {
      dealId: string;
      messagePreview: string;
    };

    const supabase = await createClient();

    // Get current user (sender)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ ok: false }, { status: 401 });

    const { data: senderProfile } = await supabase
      .from("profiles")
      .select("full_name, email, is_admin")
      .eq("id", user.id)
      .single();

    // Get deal + client info
    const { data: deal } = await supabase
      .from("deals")
      .select("id, property_address, client_id, profiles(full_name, email)")
      .eq("id", dealId)
      .single();

    if (!deal) return NextResponse.json({ ok: false }, { status: 404 });

    const senderIsAdmin = senderProfile?.is_admin ?? false;
    const senderName = senderProfile?.full_name || senderProfile?.email || "Your TC";

    const adminEmail = process.env.ADMIN_EMAIL;

    if (senderIsAdmin && adminEmail) {
      // Admin sent → notify client
      const client = Array.isArray(deal.profiles) ? deal.profiles[0] : deal.profiles;
      if (client?.email) {
        await sendNewMessageEmail({
          to: client.email,
          toName: client.full_name || "there",
          fromName: senderName,
          propertyAddress: deal.property_address,
          messagePreview,
          dealId,
          isAdmin: false,
        });
      }
    } else if (!senderIsAdmin && adminEmail) {
      // Client sent → notify admin
      await sendNewMessageEmail({
        to: adminEmail,
        toName: "TC Team",
        fromName: senderName,
        propertyAddress: deal.property_address,
        messagePreview,
        dealId,
        isAdmin: true,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[notify/message]", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { sendSalesInquiryEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, volume, message } = await req.json() as {
      name: string;
      email: string;
      phone: string;
      volume: string;
      message: string;
    };

    if (!name || !email || !message) {
      return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
    }

    await sendSalesInquiryEmail({ name, email, phone, volume, message });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact]", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

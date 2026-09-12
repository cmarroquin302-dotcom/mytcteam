import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  if (!text || text.trim().length < 10) {
    return NextResponse.json({ error: "No text provided" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI not configured" }, { status: 500 });
  }

  const prompt = `You are a real estate transaction coordinator assistant. Extract deal information from the text below.

Return ONLY a valid JSON object with exactly these keys (use null for any value you cannot find or are unsure about):

{
  "property_address": "full street address including city, state, zip if present",
  "buyer_name": "buyer's full name(s)",
  "seller_name": "seller's full name(s)",
  "contract_price": 450000,
  "contract_date": "YYYY-MM-DD",
  "closing_date": "YYYY-MM-DD",
  "escrow_officer": "escrow officer or title company name",
  "lender_name": "lender or mortgage company name"
}

Be liberal — if you see something that looks like a price, address, or name, extract it. For dates, convert any format to YYYY-MM-DD.

Text:
${text.slice(0, 4000)}

Return ONLY the JSON object, no explanation:`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    return NextResponse.json({ error: "AI request failed" }, { status: 500 });
  }

  const data = await response.json();
  const raw = data.content?.[0]?.text || "{}";

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const fields = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    const extracted = Object.entries(fields).filter(([, v]) => v !== null).length;
    return NextResponse.json({ fields, extracted });
  } catch {
    return NextResponse.json({ fields: {}, extracted: 0 });
  }
}

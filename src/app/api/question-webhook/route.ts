import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const webhookUrl = process.env.QUESTION_WEBHOOK_URL || process.env.GHL_WEBHOOK_URL;

  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ ok: false, error: "Invalid webhook payload" }, { status: 400 });
  }

  if (!webhookUrl) {
    console.info("AIGS question webhook event", payload);
    return NextResponse.json({ ok: true, forwarded: false });
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    return NextResponse.json({ ok: response.ok, forwarded: true, status: response.status });
  } catch {
    return NextResponse.json({ ok: false, forwarded: false, error: "Webhook request failed" }, { status: 502 });
  }
}

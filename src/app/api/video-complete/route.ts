import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    phone?: string;
    first_name?: string;
    last_name?: string;
    video_name?: string;
  };

  const webhookUrl =
    process.env.WEBHOOK_URL ||
    process.env.QUESTION_WEBHOOK_URL ||
    process.env.GHL_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn("[video-complete] No webhook URL configured");
    return NextResponse.json({ ok: true, forwarded: false });
  }

  // Send as contact field values so GHL can map them to custom fields
  // and trigger "Contact Field Changed" workflows — more reliable than event_name filtering
  const payload = {
    email: body.email,
    phone: body.phone,
    first_name: body.first_name,
    last_name: body.last_name,
    video_completed: "Yes",
    video_completed_at: new Date().toISOString(),
    contact: {
      email: body.email,
      phone: body.phone,
      first_name: body.first_name,
      last_name: body.last_name,
      video_completed: "Yes",
      video_completed_at: new Date().toISOString(),
    },
  };

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    console.info("[video-complete] GHL webhook status:", res.status);
    return NextResponse.json({ ok: true, forwarded: true });
  } catch (err) {
    console.error("[video-complete] Webhook error:", err);
    return NextResponse.json({ ok: false, error: "webhook failed" }, { status: 500 });
  }
}

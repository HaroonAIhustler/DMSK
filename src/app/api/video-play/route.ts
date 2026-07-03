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
    console.warn("[video-play] No webhook URL configured");
    return NextResponse.json({ ok: true, forwarded: false });
  }

  const payload = {
    event_name: "video_played",
    video_name: body.video_name ?? "dmsk_career_bonus",
    tags: ["Video Played - DMSK Career"],
    email: body.email,
    phone: body.phone,
    first_name: body.first_name,
    last_name: body.last_name,
    contact: {
      email: body.email,
      phone: body.phone,
      first_name: body.first_name,
      last_name: body.last_name,
      tags: ["Video Played - DMSK Career"],
    },
  };

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    console.info("[video-play] GHL webhook status:", res.status);
    return NextResponse.json({ ok: true, forwarded: true });
  } catch (err) {
    console.error("[video-play] Webhook error:", err);
    return NextResponse.json({ ok: false, error: "webhook failed" }, { status: 500 });
  }
}

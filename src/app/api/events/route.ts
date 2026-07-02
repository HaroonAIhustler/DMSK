import { NextResponse } from "next/server";
import type { FunnelEventPayload } from "@/lib/types";

function shouldForwardEvent(eventName: string) {
  return eventName.endsWith("_page_view");
}

function compactSession(payload: FunnelEventPayload) {
  const { session } = payload;
  const name = [session.answers.first_name, session.answers.last_name].filter(Boolean).join(" ");

  return {
    event_name: payload.event_name,
    funnel_stage: payload.funnel_stage,
    current_page: payload.current_page,
    event_timestamp: new Date().toISOString(),
    session_id: session.session_id,
    lead_id: session.lead_id,
    browser_id: session.browser_id,
    ...session.answers,
    first_name: session.answers.first_name,
    firstName: session.answers.first_name,
    last_name: session.answers.last_name,
    lastName: session.answers.last_name,
    name,
    email: session.answers.email,
    phone: session.answers.phone,
    city: session.answers.city,
    state: session.answers.state,
    utm_campaign: session.answers.utm_campaign ?? session.utm.utm_campaign,
    medium: session.answers.utm_medium ?? session.utm.utm_medium,
    utm_source: session.answers.utm_source ?? session.utm.utm_source,
    answers: session.answers,
    utm: session.utm,
    identity: {
      first_name: session.answers.first_name,
      last_name: session.answers.last_name,
      name,
      email: session.answers.email,
      phone: session.answers.phone,
      city: session.answers.city,
      state: session.answers.state,
      utm_campaign: session.answers.utm_campaign ?? session.utm.utm_campaign,
      medium: session.answers.utm_medium ?? session.utm.utm_medium,
      utm_source: session.answers.utm_source ?? session.utm.utm_source
    },
    quiz: {
      selected_answers: session.answers
    },
    scoring: session.result,
    payment: {
      status: session.payment_status,
      ...session.payment
    },
    extra: payload.extra
  };
}

export async function POST(request: Request) {
  const payload = (await request.json()) as FunnelEventPayload;
  const webhookPayload = compactSession(payload);
  const webhookUrl = process.env.GHL_WEBHOOK_URL || process.env.QUESTION_WEBHOOK_URL;

  if (!shouldForwardEvent(payload.event_name)) {
    return NextResponse.json({ ok: true, forwarded: false, skipped: true });
  }

  if (webhookUrl) {
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(webhookPayload)
      });

      return NextResponse.json({ ok: response.ok, forwarded: true, status: response.status });
    } catch {
      return NextResponse.json({ ok: false, forwarded: false, error: "Webhook request failed" }, { status: 502 });
    }
  }

  console.info("AIGS funnel event", webhookPayload);
  return NextResponse.json({ ok: true, forwarded: false });
}

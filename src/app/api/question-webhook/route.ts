import { NextResponse } from "next/server";

function normalizeWebhookPayload(payload: Record<string, unknown>) {
  const contact = (payload.contact && typeof payload.contact === "object" ? payload.contact : {}) as Record<string, unknown>;
  const answers = (payload.answers && typeof payload.answers === "object" ? payload.answers : {}) as Record<string, unknown>;
  const result = (payload.result && typeof payload.result === "object" ? payload.result : {}) as Record<string, unknown>;
  const utm = (payload.utm && typeof payload.utm === "object" ? payload.utm : {}) as Record<string, unknown>;
  const firstName = String(contact.first_name ?? answers.first_name ?? payload.first_name ?? "");
  const lastName = String(contact.last_name ?? answers.last_name ?? payload.last_name ?? "");
  const fullName = contact.name ?? payload.name ?? [firstName, lastName].filter(Boolean).join(" ");

  return {
    ...payload,
    ...answers,
    ...contact,
    event_timestamp: payload.event_timestamp ?? new Date().toISOString(),
    first_name: firstName || undefined,
    firstName: firstName || undefined,
    last_name: lastName || undefined,
    lastName: lastName || undefined,
    name: String(fullName || ""),
    email: String(contact.email ?? answers.email ?? payload.email ?? ""),
    phone: String(contact.phone ?? answers.phone ?? payload.phone ?? ""),
    city: String(contact.city ?? answers.city ?? payload.city ?? ""),
    state: String(contact.state ?? answers.state ?? payload.state ?? ""),
    utm_campaign: contact.utm_campaign ?? answers.utm_campaign ?? utm.utm_campaign ?? payload.utm_campaign,
    medium: contact.medium ?? answers.utm_medium ?? utm.utm_medium ?? payload.medium,
    utm_source: contact.utm_source ?? answers.utm_source ?? utm.utm_source ?? payload.utm_source,
    result,
    utm,
    contact,
    answers
  };
}

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
    const normalizedPayload = normalizeWebhookPayload(payload as Record<string, unknown>);
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(normalizedPayload)
    });

    return NextResponse.json({ ok: response.ok, forwarded: true, status: response.status });
  } catch {
    return NextResponse.json({ ok: false, forwarded: false, error: "Webhook request failed" }, { status: 502 });
  }
}

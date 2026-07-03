import { NextResponse } from "next/server";

function normalizeWebhookPayload(payload: Record<string, unknown>) {
  const contact = (payload.contact && typeof payload.contact === "object" ? payload.contact : {}) as Record<string, unknown>;
  const answers = (payload.answers && typeof payload.answers === "object" ? payload.answers : {}) as Record<string, unknown>;
  const result = (payload.result && typeof payload.result === "object" ? payload.result : {}) as Record<string, unknown>;
  const utm = (payload.utm && typeof payload.utm === "object" ? payload.utm : {}) as Record<string, unknown>;
  const firstName = String(contact.first_name ?? answers.first_name ?? payload.first_name ?? "");
  const lastName = String(contact.last_name ?? answers.last_name ?? payload.last_name ?? "");
  const fullName = contact.name ?? payload.name ?? [firstName, lastName].filter(Boolean).join(" ");
  const mergedContact = {
    ...answers,
    ...contact,
    preferred_job_location: contact.preferred_job_location ?? answers.preferred_job_location ?? payload.preferred_job_location ?? payload.city,
    current_career_situation: contact.current_career_situation ?? answers.current_career_situation ?? payload.current_career_situation,
    educational_qualification: contact.educational_qualification ?? answers.educational_qualification ?? payload.educational_qualification,
    when_did_you_graduates: contact.when_did_you_graduates ?? answers.when_did_you_graduates ?? payload.when_did_you_graduates ?? payload.graduation_year,
    field_of_study: contact.field_of_study ?? answers.field_of_study ?? payload.field_of_study,
    field_of_study__detail: contact.field_of_study__detail ?? answers.field_of_study__detail ?? payload.field_of_study__detail,
    flexibility_looking_for: contact.flexibility_looking_for ?? answers.flexibility_looking_for ?? payload.flexibility_looking_for,
    field_working_in: contact.field_working_in ?? answers.field_working_in ?? payload.field_working_in,
    professional_certification:
      contact.professional_certification ?? answers.professional_certification ?? payload.professional_certification,
    social_platforms: contact.social_platforms ?? answers.social_platforms ?? payload.social_platforms,
    when_you_see_ads: contact.when_you_see_ads ?? answers.when_you_see_ads ?? payload.when_you_see_ads,
    are_you_curious: contact.are_you_curious ?? answers.are_you_curious ?? payload.are_you_curious,
    do_you_wondered: contact.do_you_wondered ?? answers.do_you_wondered ?? payload.do_you_wondered,
    are_you_comfortable_learning:
      contact.are_you_comfortable_learning ?? answers.are_you_comfortable_learning ?? payload.are_you_comfortable_learning,
    ai_proficiency_level: contact.ai_proficiency_level ?? answers.ai_proficiency_level ?? payload.ai_proficiency_level,
    utm_campaign: contact.utm_campaign ?? answers.utm_campaign ?? utm.utm_campaign ?? payload.utm_campaign,
    medium: contact.medium ?? answers.medium ?? answers.utm_medium ?? utm.utm_medium ?? payload.medium,
    utm_source: contact.utm_source ?? answers.utm_source ?? utm.utm_source ?? payload.utm_source,
    first_name: firstName || undefined,
    last_name: lastName || undefined,
    name: String(fullName || ""),
    email: String(contact.email ?? answers.email ?? payload.email ?? ""),
    phone: String(contact.phone ?? answers.phone ?? payload.phone ?? ""),
    city: String(contact.city ?? answers.city ?? payload.city ?? ""),
    state: String(contact.state ?? answers.state ?? payload.state ?? ""),
    encr: result.fit_score ?? contact.encr ?? payload.encr
  };

  return {
    ...payload,
    ...answers,
    ...mergedContact,
    event_timestamp: payload.event_timestamp ?? new Date().toISOString(),
    first_name: firstName || undefined,
    firstName: firstName || undefined,
    last_name: lastName || undefined,
    lastName: lastName || undefined,
    name: String(fullName || ""),
    email: mergedContact.email,
    phone: mergedContact.phone,
    city: mergedContact.city,
    state: mergedContact.state,
    utm_campaign: mergedContact.utm_campaign,
    medium: mergedContact.medium,
    utm_source: mergedContact.utm_source,
    encr: mergedContact.encr,
    result,
    utm,
    contact: mergedContact,
    answers
  };
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const webhookUrl = process.env.WEBHOOK_URL || process.env.QUESTION_WEBHOOK_URL || process.env.GHL_WEBHOOK_URL;

  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ ok: false, error: "Invalid webhook payload" }, { status: 400 });
  }

  if (!webhookUrl) {
    console.info("AIGS question webhook event", payload);
    return NextResponse.json({ ok: true, forwarded: false });
  }

  try {
    const normalizedPayload = normalizeWebhookPayload(payload as Record<string, unknown>);
    console.info("[webhook] encr:", normalizedPayload.encr, "contact.encr:", (normalizedPayload.contact as Record<string, unknown>)?.encr);
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

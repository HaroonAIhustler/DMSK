import { NextResponse } from "next/server";
import type { FunnelEventPayload } from "@/lib/types";

function shouldForwardEvent(eventName: string) {
  return (
    eventName.endsWith("_page_view") ||
    eventName === "survey_completed" ||
    eventName === "lead_details_submitted" ||
    eventName === "fit_score_calculated" ||
    eventName === "results_cta_clicked"
  );
}

function compactSession(payload: FunnelEventPayload) {
  const { session } = payload;
  const a = session.answers;
  const name = [a.first_name, a.last_name].filter(Boolean).join(" ");
  const utmCampaign = a.utm_campaign ?? session.utm.utm_campaign;
  const utmMedium = a.utm_medium ?? session.utm.utm_medium;
  const utmSource = a.utm_source ?? session.utm.utm_source;

  const contact = {
    preferred_job_location: a.city,
    city: a.city,
    state: a.state,
    current_career_situation: a.current_career_situation,
    educational_qualification: a.educational_qualification,
    when_did_you_graduates: a.graduation_year,
    field_of_study: a.field_of_study,
    field_of_study__detail: a.field_of_study,
    flexibility_looking_for: a.career_flexibility_motivation,
    field_working_in: a.current_work_field,
    professional_certification: a.certification,
    social_platforms: a.social_activity,
    when_you_see_ads: a.ads_posts_observation,
    are_you_curious: a.online_ads_curiosity,
    do_you_wondered: a.retargeting_curiosity,
    are_you_comfortable_learning: a.tool_comfort,
    ai_proficiency_level: a.ai_proficiency,
    first_name: a.first_name,
    firstName: a.first_name,
    last_name: a.last_name,
    lastName: a.last_name,
    name,
    email: a.email,
    phone: a.phone,
    utm_campaign: utmCampaign,
    medium: utmMedium,
    utm_source: utmSource,
    encr: session.result?.fit_score
  };

  return {
    event_name: payload.event_name,
    funnel_stage: payload.funnel_stage,
    current_page: payload.current_page,
    event_timestamp: new Date().toISOString(),
    session_id: session.session_id,
    lead_id: session.lead_id,
    browser_id: session.browser_id,
    ...a,
    ...contact,
    contact,
    answers: a,
    utm: session.utm,
    identity: {
      first_name: a.first_name,
      last_name: a.last_name,
      name,
      email: a.email,
      phone: a.phone,
      city: a.city,
      state: a.state,
      utm_campaign: utmCampaign,
      medium: utmMedium,
      utm_source: utmSource
    },
    quiz: { selected_answers: a },
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
  const webhookUrl = process.env.WEBHOOK_URL || process.env.GHL_WEBHOOK_URL || process.env.QUESTION_WEBHOOK_URL;

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

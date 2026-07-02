import type { FunnelEventPayload, FunnelSession } from "@/lib/types";

export async function sendFunnelEvent(
  event_name: string,
  funnel_stage: string,
  current_page: string,
  session: FunnelSession,
  extra?: Record<string, unknown>
) {
  const payload: FunnelEventPayload = { event_name, funnel_stage, current_page, session, extra };

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("aigs:funnel-event", { detail: payload }));
  }

  try {
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch {
    // Webhook delivery should not block the user journey.
  }
}

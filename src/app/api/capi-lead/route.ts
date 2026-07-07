import { NextResponse } from "next/server";
import { createHash } from "crypto";

const META_PIXEL_ID = "810846268691865";
const META_API_VERSION = "v21.0";

function sha256(value: string) {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

function hashedPhone(phone?: string) {
  const digits = phone?.replace(/\D/g, "");
  if (!digits) return undefined;
  const withCountryCode = digits.length === 10 ? `91${digits}` : digits;
  return sha256(withCountryCode);
}

export async function POST(request: Request) {
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (!accessToken) {
    console.warn("[capi-lead] META_CAPI_ACCESS_TOKEN not configured");
    return NextResponse.json({ ok: false, forwarded: false, error: "not configured" });
  }

  const body = (await request.json().catch(() => null)) as {
    event_id?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    value?: number;
    currency?: string;
    utm_source?: string;
    utm_campaign?: string;
    utm_medium?: string;
    page_url?: string;
    user_agent?: string;
    fbp?: string;
    fbc?: string;
  } | null;

  if (!body) {
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
  }

  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    undefined;

  const userData: Record<string, unknown> = {
    client_user_agent: body.user_agent || undefined,
    client_ip_address: clientIp,
    fbp: body.fbp || undefined,
    fbc: body.fbc || undefined,
    em: body.email ? [sha256(body.email)] : undefined,
    ph: hashedPhone(body.phone) ? [hashedPhone(body.phone)] : undefined,
    fn: body.first_name ? [sha256(body.first_name)] : undefined,
    ln: body.last_name ? [sha256(body.last_name)] : undefined,
  };

  const event = {
    event_name: "Lead",
    event_time: Math.floor(Date.now() / 1000),
    event_id: body.event_id,
    event_source_url: body.page_url,
    action_source: "website",
    user_data: userData,
    custom_data: {
      value: body.value,
      currency: body.currency || "INR",
      utm_source: body.utm_source,
      utm_campaign: body.utm_campaign,
      utm_medium: body.utm_medium,
    },
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/${META_API_VERSION}/${META_PIXEL_ID}/events?access_token=${accessToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: [event] }),
      }
    );
    const result = await res.json().catch(() => null);

    if (!res.ok) {
      console.error("[capi-lead] Meta API error:", result);
      return NextResponse.json({ ok: false, forwarded: true, status: res.status, error: result });
    }

    return NextResponse.json({ ok: true, forwarded: true, result });
  } catch (err) {
    console.error("[capi-lead] Request failed:", err);
    return NextResponse.json({ ok: false, forwarded: false, error: "Request failed" }, { status: 502 });
  }
}

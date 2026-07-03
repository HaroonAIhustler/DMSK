"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const GHL_TRACKING_ID = "tk_20528733b6e7433cbc38044d10dda053";
const GHL_LOCATION_ID = "S3oYl74Av60NEQIC13cQ";

function getGHLSessionId(): string | undefined {
  try {
    const cookieName = `lc_session_${GHL_LOCATION_ID}`;
    type Tracker = { state?: { sessionId?: string } };
    type LcT = { tracker?: Tracker };
    const sid = (window as typeof window & { _lcTracking?: LcT })._lcTracking?.tracker?.state?.sessionId;
    if (sid) return sid;
    const parts = `; ${document.cookie}`.split(`; ${cookieName}=`);
    if (parts.length === 2) return parts[1].split(";")[0] || undefined;
    return sessionStorage.getItem(cookieName) ?? undefined;
  } catch { return undefined; }
}

export function GHLPageTracker() {
  const pathname = usePathname();
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    try {
      if (typeof window !== "undefined" && window.dataLayer) {
        window.dataLayer.push({ event: "pageview", page: pathname });
      }
      // Send page view directly to GHL tracking API for SPA route changes
      const sessionId = getGHLSessionId();
      const deviceType = /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop";
      fetch("https://backend.leadconnectorhq.com/external-tracking/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          type: "external_script_page_view",
          timestamp: Date.now(),
          trackingId: GHL_TRACKING_ID,
          locationId: GHL_LOCATION_ID,
          sessionId,
          url: window.location.href,
          title: document.title,
          path: window.location.pathname,
          referrer: document.referrer,
          userAgent: navigator.userAgent,
          properties: {
            sessionId,
            locationId: GHL_LOCATION_ID,
            deviceType,
          },
        }),
      }).catch(() => {});
    } catch { /* non-critical */ }
  }, [pathname]);

  return null;
}

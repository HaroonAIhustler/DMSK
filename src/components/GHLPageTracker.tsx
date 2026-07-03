"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

type LcTracking = {
  tracker?: { sendEvent?: (e: Record<string, unknown>) => void };
};

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
      // Send page view via GHL tracker directly so SPA route changes get tracked
      const lc = (window as typeof window & { _lcTracking?: LcTracking })._lcTracking;
      const sendEvent = lc?.tracker?.sendEvent?.bind(lc.tracker);
      if (sendEvent) {
        sendEvent({
          type: "external_script_page_view",
          timestamp: Date.now(),
          url: window.location.href,
          title: document.title,
          referrer: document.referrer,
        });
      }
    } catch { /* non-critical */ }
  }, [pathname]);

  return null;
}

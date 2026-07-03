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
      // Send page view via tracker directly for SPA route changes
      // Include page metadata at top level — required by GHL API
      const lc = (window as typeof window & { _lcTracking?: LcTracking })._lcTracking;
      const sendEvent = lc?.tracker?.sendEvent?.bind(lc.tracker);
      if (sendEvent) {
        sendEvent({
          type: "external_script_page_view",
          timestamp: Date.now(),
          url: window.location.href,
          title: document.title,
          path: window.location.pathname,
          referrer: document.referrer,
          userAgent: navigator.userAgent,
        });
      }
    } catch { /* non-critical */ }
  }, [pathname]);

  return null;
}

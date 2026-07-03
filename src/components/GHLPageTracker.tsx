"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function GHLPageTracker() {
  const pathname = usePathname();
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    // Re-fire page view for SPA route changes so GHL tracks every page
    try {
      // Push to GTM dataLayer
      if (typeof window !== "undefined" && window.dataLayer) {
        window.dataLayer.push({ event: "pageview", page: pathname });
      }
      // If GHL tracking exposes a page view method, call it
      const w = window as typeof window & {
        GHLExternalTracking?: { trackPageView?: () => void };
        __lc?: { push?: (args: unknown) => void };
      };
      w.GHLExternalTracking?.trackPageView?.();
      w.__lc?.push?.({ type: "pageview", url: window.location.href, title: document.title });
    } catch {
      // non-critical
    }
  }, [pathname]);

  return null;
}

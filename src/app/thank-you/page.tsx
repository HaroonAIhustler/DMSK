"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Mail, MessageCircle } from "lucide-react";
import { LogoHeader } from "@/components/LogoHeader";
import { MissingSession } from "@/components/MissingSession";
import { sendFunnelEvent } from "@/lib/events";
import { loadSession } from "@/lib/storage";
import type { FunnelSession } from "@/lib/types";

export default function ThankYouPage() {
  const [session, setSession] = useState<FunnelSession | null>(null);

  useEffect(() => {
    const loaded = loadSession();
    queueMicrotask(() => setSession(loaded));
    if (loaded?.payment_status === "completed") {
      sendFunnelEvent("thank_you_page_view", "thank_you", "/thank-you", loaded);
      sendFunnelEvent("starter_kit_access_ready", "thank_you", "/thank-you", loaded);
    }
  }, []);

  if (!session) return <MissingSession />;

  if (session.payment_status !== "completed") {
    return (
      <main className="page-shell">
        <LogoHeader />
        <section className="result-card">
          <p className="eyebrow">Payment verification</p>
          <h1>Payment is not completed yet.</h1>
          <p>If your payment failed or is pending, please return to checkout and try again.</p>
          <Link className="primary-button primary-button--link" href={`/starter-kit?session_id=${session.session_id}`}>
            Return to checkout
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="thank-you-page">
      <section className="page-shell">
        <LogoHeader />
        <section className="thank-you-card">
          <CheckCircle2 size={52} />
          <p className="eyebrow">Payment successful</p>
          <h1>Your AI Digital Marketing Starter Kit is ready.</h1>
          <p>Check your email and WhatsApp for access details. Start with Day 1, then complete the 5-day path step by step.</p>
          <a className="primary-button primary-button--link" href="#" onClick={() => session && sendFunnelEvent("starter_kit_access_clicked", "thank_you", "/thank-you", session)}>
            Access My Starter Kit <ArrowRight size={18} />
          </a>
        </section>

        <section className="insight-grid">
          <article className="panel">
            <div className="panel-title">
              <Mail size={20} />
              <h2>What happens next</h2>
            </div>
            <ul className="check-list">
              <li>Open the Starter Kit access message.</li>
              <li>Begin Day 1 with role clarity and basic terms.</li>
              <li>Complete one portfolio project before considering advanced courses.</li>
            </ul>
          </article>
          <article className="panel">
            <div className="panel-title">
              <MessageCircle size={20} />
              <h2>Support</h2>
            </div>
            <p>For access issues, reply on WhatsApp or email AI Growth Studio support with your payment ID.</p>
          </article>
        </section>
      </section>
    </main>
  );
}

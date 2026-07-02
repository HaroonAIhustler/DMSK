"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, IndianRupee, ShieldCheck, Sparkles, XCircle } from "lucide-react";
import { LogoHeader } from "@/components/LogoHeader";
import { MissingSession } from "@/components/MissingSession";
import { sendFunnelEvent } from "@/lib/events";
import { loadSession, saveSession } from "@/lib/storage";
import type { FunnelSession } from "@/lib/types";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void; on: (event: string, cb: (response: Record<string, unknown>) => void) => void };
  }
}

const offerItems = [
  "5-day beginner roadmap",
  "AI digital marketing role finder",
  "Social media planning template",
  "SEO starter template",
  "Ads and AI tools guide",
  "Portfolio project brief",
  "Resume and LinkedIn checklist"
];

function aiMarketingText(text: string) {
  return text.replace(/Digital Marketing/g, "AI Digital Marketing").replace(/digital marketing/g, "AI digital marketing");
}

export default function StarterKitPage() {
  const [session, setSession] = useState<FunnelSession | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loaded = loadSession();
    queueMicrotask(() => setSession(loaded));
    if (loaded?.result) sendFunnelEvent("offer_page_view", "offer", "/starter-kit", loaded);
  }, []);

  if (!session?.result) return <MissingSession />;

  const activeSession = session;
  const result = activeSession.result;
  if (!result) return <MissingSession />;
  const fitScore = result.fit_score;
  const resultCity = result.selected_city;
  const recommendedRole = result.recommended_role;
  const firstName = activeSession.answers.first_name || "there";
  const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

  async function startCheckout() {
    const checkoutSession: FunnelSession = { ...activeSession, payment_status: "initiated" as const };
    saveSession(checkoutSession);
    setSession(checkoutSession);
    await sendFunnelEvent("offer_cta_clicked", "offer", "/starter-kit", checkoutSession, { CTA_clicked: "Get Instant Access for Rs. 199" });
    await sendFunnelEvent("checkout_initiated", "checkout", "/starter-kit", checkoutSession, {
      amount: 199,
      currency: "INR",
      product_name: "AI Digital Marketing Starter Kit"
    });

    if (!razorpayKey || !window.Razorpay) {
      setMessage("Razorpay key is not configured yet. Local checkout event has been sent.");
      return;
    }

    const checkout = new window.Razorpay({
      key: razorpayKey,
      amount: 19900,
      currency: "INR",
      name: "AI Growth Studio",
      description: "AI Digital Marketing Starter Kit",
      prefill: {
        name: [activeSession.answers.first_name, activeSession.answers.last_name].filter(Boolean).join(" "),
        email: activeSession.answers.email,
        contact: activeSession.answers.phone
      },
      notes: {
        session_id: activeSession.session_id,
        lead_id: activeSession.lead_id,
        fit_score: fitScore,
        city: resultCity,
        recommended_role: recommendedRole
      },
      handler: async (response: Record<string, unknown>) => {
        const paid: FunnelSession = {
          ...checkoutSession,
          payment_status: "completed" as const,
          payment: {
            razorpay_payment_id: String(response.razorpay_payment_id ?? ""),
            razorpay_order_id: String(response.razorpay_order_id ?? ""),
            razorpay_signature: String(response.razorpay_signature ?? ""),
            amount_paid: 199,
            currency: "INR",
            payment_completed_at: new Date().toISOString()
          }
        };
        saveSession(paid);
        await sendFunnelEvent("payment_completed", "payment", "/starter-kit", paid);
        window.location.href = `/thank-you?session_id=${paid.session_id}`;
      }
    });

    checkout.on("payment.failed", async (response: Record<string, unknown>) => {
      const failed: FunnelSession = {
        ...checkoutSession,
        payment_status: "failed" as const,
        payment: {
          payment_failure_reason: JSON.stringify(response),
          amount_paid: 0,
          currency: "INR"
        }
      };
      saveSession(failed);
      setSession(failed);
      setMessage("Payment could not be completed. Please try again or contact support.");
      await sendFunnelEvent("payment_failed", "payment", "/starter-kit", failed);
    });

    checkout.open();
  }

  async function simulateSuccess() {
    const paid: FunnelSession = {
      ...activeSession,
      payment_status: "completed" as const,
      payment: {
        razorpay_payment_id: "local_test_payment",
        amount_paid: 199,
        currency: "INR",
        payment_completed_at: new Date().toISOString()
      }
    };
    saveSession(paid);
    await sendFunnelEvent("payment_completed", "payment", "/starter-kit", paid);
    window.location.href = `/thank-you?session_id=${paid.session_id}`;
  }

  return (
    <main className="offer-page">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <section className="page-shell">
        <LogoHeader />

        <section className="offer-hero">
          <div>
            <p className="eyebrow">AI Digital Marketing Starter Kit</p>
            <h1>{firstName}, your fit score shows potential. Now take the first step.</h1>
            <p>
              Learn beginner AI digital marketing skills in 5 days so you can explore this career with confidence. This is a low-risk first step before expensive courses.
            </p>
            <button className="primary-button" type="button" onClick={startCheckout}>
              Get Instant Access for Rs. 199 <ArrowRight size={18} />
            </button>
            {message ? <p className="form-error">{message}</p> : null}
          </div>
          <div className="offer-price-card">
            <Sparkles size={24} />
            <span>Your fit score</span>
            <strong>{fitScore}/95</strong>
            <small>{aiMarketingText(recommendedRole)}</small>
            <div className="price-row">
              <IndianRupee size={22} />
              199
            </div>
          </div>
        </section>

        <section className="insight-grid">
          <article className="panel">
            <h2>What is inside</h2>
            <ul className="check-list">
              {offerItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article className="panel">
            <h2>Who this is for</h2>
            <div className="icon-copy">
              <CheckCircle2 size={20} />
              <p>Freshers, students, career switchers, BPO, sales, admin, commerce, arts, science, engineering, and working professionals exploring a safer first step.</p>
            </div>
            <div className="icon-copy">
              <XCircle size={20} />
              <p>Not for people expecting guaranteed jobs, instant income, only a certificate, or results without practice.</p>
            </div>
          </article>
        </section>

        <section className="salary-band">
          <div>
            <p className="eyebrow">Why Rs. 199</p>
            <h2>Clarity before commitment</h2>
            <p>Use the kit to understand role options, beginner terms, tools, and one portfolio project before deciding whether a larger course is right for you.</p>
          </div>
          <button className="primary-button" type="button" onClick={startCheckout}>
            Buy Now for Rs. 199 <ArrowRight size={18} />
          </button>
        </section>

        {!razorpayKey ? (
          <div className="local-test-box">
            <ShieldCheck size={20} />
            <span>Local testing mode: set `NEXT_PUBLIC_RAZORPAY_KEY_ID` for real Razorpay checkout.</span>
            <button type="button" onClick={simulateSuccess}>Simulate Payment Success</button>
          </div>
        ) : null}

        <p className="disclaimer">This Starter Kit helps you learn beginner skills and create your first career direction. It does not guarantee a job, salary, freelance income, or expert-level skill in 5 days.</p>
      </section>
    </main>
  );
}

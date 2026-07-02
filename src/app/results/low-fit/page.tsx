"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, BookOpenCheck, CheckCircle2, ShieldAlert } from "lucide-react";
import { LogoHeader } from "@/components/LogoHeader";
import { MissingSession } from "@/components/MissingSession";
import { calculateFitResult } from "@/lib/calculator";
import { sendFunnelEvent } from "@/lib/events";
import { loadSession, saveSession } from "@/lib/storage";
import type { FunnelSession } from "@/lib/types";

function directionFor(field: string) {
  if (/MBBS|BDS|BAMS|BHMS|BUMS|Nursing|Pharm|Physiotherapy|Medical|Radiology|Optometry|Nutrition/i.test(field)) {
    return "Your domain knowledge may be useful later in healthcare content, clinic marketing, patient education or pharma communication after you build direct marketing proof.";
  }
  if (/Agriculture|Horticulture|Forestry|Fisheries|Veterinary/i.test(field)) {
    return "Your domain knowledge may be useful later in agriculture, food or rural-market content after you build direct marketing proof.";
  }
  return "Your existing expertise may support niche, domain-led content or communication after you build direct marketing proof.";
}

export default function LowFitResultsPage() {
  const [session, setSession] = useState<FunnelSession | null>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = loadSession();
    const loaded = stored?.result ? { ...stored, result: calculateFitResult(stored.answers) } : stored;
    if (loaded?.result) saveSession(loaded);
    if (loaded?.result && loaded.result.fit_score >= 40) {
      router.replace(`/results?session_id=${loaded.session_id}`);
      return;
    }
    queueMicrotask(() => setSession(loaded));
    if (loaded?.result) {
      sendFunnelEvent("low_fit_results_page_view", "results", "/results/low-fit", loaded);
      sendFunnelEvent("fit_score_viewed", "results", "/results/low-fit", loaded);
    }
  }, [router]);

  if (!session?.result) return <MissingSession />;

  const result = session.result;
  const firstName = session.answers.first_name || "there";
  const field = session.answers.field_of_study || "your current field";

  return (
    <main className="low-fit-page">
      <nav className="fit-result-nav">
        <LogoHeader />
      </nav>

      <section className="low-fit-shell">
        <header className="low-fit-hero">
          <div className="low-fit-hero__copy">
            <span className="low-fit-badge"><ShieldAlert size={16} /> Low Direct Fit</span>
            <h1>{firstName}, your current profile is not a direct match for a general AI Digital Marketing career.</h1>
            <p>
              Your education in {field} is highly specialized and has limited direct transfer to generic entry-level AI digital marketing roles.
              This result is intended to prevent an unrealistic career recommendation.
            </p>
          </div>

          <div className="low-fit-score-card">
            <div className="low-fit-score-ring" style={{ "--low-score": `${result.fit_score}%` } as React.CSSProperties}>
              <div><strong>{result.fit_score}</strong><span>/100</span></div>
            </div>
            <div>
              <small>Your Career Fit Score</small>
              <strong>{result.fit_category}</strong>
              <p>Education relevance: {result.field_score}/95</p>
            </div>
          </div>
        </header>

        <section className="low-fit-grid">
          <article className="low-fit-panel">
            <div className="low-fit-panel__icon"><AlertTriangle size={24} /></div>
            <h2>Why your score is below 40</h2>
            <ul>
              <li><CheckCircle2 size={17} /> Your current education is not directly related to AI marketing, media, business, technology or communication.</li>
              <li><CheckCircle2 size={17} /> A generic switch would require new tools, portfolio work and direct marketing proof.</li>
              <li><CheckCircle2 size={17} /> Your existing professional path may offer a stronger immediate return than starting again in an entry-level role.</li>
            </ul>
          </article>

          <article className="low-fit-panel low-fit-panel--direction">
            <div className="low-fit-panel__icon"><BookOpenCheck size={24} /></div>
            <h2>A more realistic direction</h2>
            <p>{directionFor(field)}</p>
            <div className="low-fit-note">
              AI digital marketing can still be learned as a complementary skill, but it should not currently be presented as an easy direct career switch.
            </div>
          </article>
        </section>

        <section className="low-fit-next-step">
          <div>
            <span>Recommended next step</span>
            <h2>Build domain-specific proof before considering a full career switch.</h2>
            <p>Start with fundamentals, test your interest through one small project, and reassess only after you have practical evidence.</p>
          </div>
        </section>

        <p className="low-fit-disclaimer">
          This assessment measures direct fit for generic entry-level AI digital marketing roles. It does not measure your overall professional ability or potential within your existing field.
        </p>
      </section>
    </main>
  );
}

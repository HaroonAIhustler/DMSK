"use client";

import type { CSSProperties, MouseEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  CircleX,
  IndianRupee,
  Laptop,
  LockKeyhole,
  Rocket,
  Sparkles,
  Star,
  Target,
  Users,
} from "lucide-react";
import { DmskCareerYouTubePlayer } from "@/components/DmskCareerYouTubePlayer";
import { LogoHeader } from "@/components/LogoHeader";
import { MissingSession } from "@/components/MissingSession";
import { calculateFitResult } from "@/lib/calculator";
import { sendFunnelEvent } from "@/lib/events";
import { loadSession, saveSession } from "@/lib/storage";
import type { FunnelSession } from "@/lib/types";

const BONUS_SESSION_URL = "https://lp.aigrowthstudio.ai/book-personalised-session-page";

function formatInr(amount: number) {
  return `Rs. ${amount.toLocaleString("en-IN")}`;
}

function formatLpa(amount: number) {
  return `Rs. ${amount.toFixed(1)} LPA`;
}

function aiMarketingText(text: string) {
  return text.replace(/Digital Marketing/g, "AI Digital Marketing").replace(/digital marketing/g, "AI digital marketing");
}

export default function ResultsPage() {
  const [session, setSession] = useState<FunnelSession | null>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = loadSession();
    const loaded = stored?.result ? { ...stored, result: calculateFitResult(stored.answers) } : stored;
    if (loaded?.result) saveSession(loaded);
    if (loaded?.result && loaded.result.fit_score < 40) {
      router.replace(`/results/low-fit?session_id=${loaded.session_id}`);
      return;
    }
    queueMicrotask(() => setSession(loaded));
    if (loaded?.result) {
      sendFunnelEvent("results_page_view", "results", "/results", loaded);
      sendFunnelEvent("fit_score_viewed", "results", "/results", loaded);
      sendFunnelEvent("salary_section_viewed", "results", "/results", loaded);
      sendFunnelEvent("freelancer_section_viewed", "results", "/results", loaded);
    }
  }, [router]);

  if (!session?.result) return <MissingSession />;

  const result = session.result;
  const firstName = session.answers.first_name || "there";
  const scorePercent = Math.min(100, Math.round(result.fit_score));
  const entrySalaryLowLpa = 3.4;
  const entrySalaryHighLpa = 4.5;
  const takeHomeLow = Math.round(((entrySalaryLowLpa * 100000) / 12) / 1000) * 1000;
  const takeHomeHigh = Math.round(((entrySalaryHighLpa * 100000 * 0.9) / 12) / 1000) * 1000;
  const salaryBars = [
    { label: "Entry Level", sublabel: "0-1 yr", value: 3.2, displayValue: "Rs. 3.2 LPA", height: 32 },
    { label: "Mid Level", sublabel: "1-3 yrs", value: 5.6, displayValue: "Rs. 5.6 LPA", height: 56 },
    { label: "Experienced", sublabel: "3+ yrs", value: 9, displayValue: "Rs. 9.0+ LPA", height: 90 }
  ];
  const freelanceBars = [
    { label: "Beginner", sublabel: "0-3 months", value: 5000, height: 30 },
    { label: "Intermediate", sublabel: "3-6 months", value: 10000, height: 60 },
    { label: "Advanced", sublabel: "6+ months", value: 15000, displayValue: "Rs. 15,000+", height: 90 }
  ];
  const timeline = [
    { day: "Step 1", title: "Learn the Essentials", text: "Understand the core skills every beginner needs.", icon: BookOpen },
    { day: "Step 2", title: "Deep dive concepts", text: "Deep dive into content, SEO, and campaigns.", icon: Target },
    { day: "Step 3", title: "AI in Marketing", text: "Use AI tools for ideas and increased productivity.", icon: Laptop },
    { day: "Step 4", title: "Hands on Projects", text: "Build a practical project you can show as proof.", icon: BarChart3 },
    { day: "Step 5", title: "Placement support", text: "Get 100% Placement support", icon: Rocket }
  ];
  const withoutPlan = [
    "Keep hopping between random courses",
    "Feel overwhelmed with too much information",
    "No practical skills or portfolio",
    "Struggle to find opportunities",
    "Waste months with little progress"
  ];
  const withStarterKit = [
    "Follow a proven step-by-step roadmap",
    "Learn from experts with 15+ years experience",
    "Build real skills and portfolio proof",
    "Secure AI Digital Marketing job faster",
    "Get 100% Placement support"
  ];
  const faqs = [
    { question: "Is Digital Marketing a Good career option", answer: "Yes. Digital marketing is a good career option with strong job demand, work-from-home opportunities, and freelance earning options alongside full-time roles." },
    { question: "Are the bonus tools free?", answer: "Yes. The offer includes bonus free AI and AI digital marketing tools/resources to help you research, create content, plan campaigns, and build your first proof of work." },
    { question: "Do I need prior experience?", answer: "No, you dont need prior experience to get started." },
    { question: "Do I get 100% placement support", answer: "Yes, you get 100% placement support along with Interview assistance from AI Growth Studio." },
    { question: "Do I get expert consultation?", answer: "Yes. The bonus includes a 1-1 expert consultation with experts to discuss your career path." },
    { question: "How do I get started", answer: "Talk to one of our experts by unlocking the bonus to discuss your career options." }
  ];

  async function ctaClicked(location = "results_primary") {
    if (!session) return;
    await sendFunnelEvent("results_cta_clicked", "results", "/results", session, {
      CTA_clicked: "Get My Starter Kit",
      CTA_location: location
    });
  }

  function scrollToStarterKit(event: MouseEvent<HTMLAnchorElement>, location: string) {
    event.preventDefault();
    void ctaClicked(location);

    const target = document.getElementById("starter-kit-offer");
    if (!target) return;

    window.history.replaceState(null, "", "#starter-kit-offer");
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY,
      behavior: "smooth"
    });
  }

  return (
    <main className="fit-result-page">
      <nav className="fit-result-nav">
        <LogoHeader />
      </nav>

      <section className="fit-result-shell">
        <section className="fit-result-hero">
          <div className="fit-result-hero__copy">
            <div className="fit-result-badge">
              <BadgeCheck size={15} />
              Your Results Are In!
            </div>
            <h1>
              Great news, {firstName}!
              <span>Your AI Digital Marketing Career Fit Score is ready</span>
            </h1>
            <p>
              Your {Math.round(result.fit_score)}/100 score shows that your current strengths, learning readiness, and career goals align well with entry-level AI digital marketing roles.
            </p>
          </div>
          <HeroIllustration />
        </section>

        <section className="fit-result-summary-grid">
          <MetricCard
            icon={<Star size={26} />}
            label="Fit Score"
            value={`${Math.round(result.fit_score)}/100`}
            copy={`${result.fit_category} for AI digital marketing.`}
            progress={scorePercent}
          />
          <SalaryMetricCard city={result.selected_city} lowLpa={entrySalaryLowLpa} highLpa={entrySalaryHighLpa} takeHomeLow={takeHomeLow} takeHomeHigh={takeHomeHigh} />
        </section>

        <div className="fit-result-main-cta">
          <Link className="fit-result-button fit-result-button--wide fit-result-button--yellow" href="#starter-kit-offer" onClick={(event) => scrollToStarterKit(event, "results_hero")}>
            Want to Get started? Click Here →
          </Link>
          <span><LockKeyhole size={14} /> Low-risk first step. Instant access.</span>
        </div>

        <SectionTitle title="Your Salary as an AI Digital Marketer" subtitle="Real earning potential in your city and beyond." tone="blue" />
        <section className="fit-earning-grid">
          <article className="fit-chart-card">
            <div className="fit-chart-card__watermark"><BarChart3 size={76} /></div>
            <h3>Full-Time Salary in {result.selected_city}</h3>
            <p>For {aiMarketingText(result.recommended_role)} and nearby roles</p>
            <strong>Rs. 3.2 LPA - Rs. 9.0+ LPA</strong>
            <ResultBarChart bars={salaryBars} type="salary" />
            <small>Source: Linkedin, Naukri and Job Portals in India</small>
          </article>
          <article className="fit-chart-card fit-chart-card--green">
            <div className="fit-chart-card__watermark"><Laptop size={76} /></div>
            <h3>Freelance / Side Income Potential</h3>
            <p>Work from anywhere. Earn on your terms.</p>
            <strong>Rs. 5,000 - Rs. 15,000+ / Month</strong>
            <ResultBarChart bars={freelanceBars} type="freelance" />
            <small>Depends on portfolio, outreach, client quality and delivery.</small>
          </article>
        </section>

        <header className="fit-kit-hero-heading" id="starter-kit-offer">
          <span>Get started now</span>
          <h2>
            <span className="fit-kit-heading-line fit-kit-heading-line--primary">With right AI + Digital Marketing skills You can</span>
            <span className="fit-kit-heading-line fit-kit-heading-line--green">secure a high paying Job in 30 days</span>
          </h2>
        </header>

        <section className="fit-kit-section fit-video-offer-section">
          <div className="fit-video-mobile-heading">
            <h2>
              <span className="fit-kit-ai-label"><Sparkles size={22} /> AI Powered</span>
              <span><strong>Start earning 35,000+ per month</strong> as AI skilled Digital Marketer in less than 30 days</span>
            </h2>
          </div>

          <div className="fit-video-preview" aria-label="AI digital marketing career video preview">
            <DmskCareerYouTubePlayer videoId="0aQpflVj8OY" />
          </div>

          <div className="fit-video-offer-content">
            <span className="fit-kit-offer-badge">Get Expert Consultation</span>
            <h2>
              <span className="fit-kit-ai-label"><Sparkles size={22} /> AI Powered</span>
              <span><strong>Start earning 35,000+ per month</strong> as AI skilled Digital Marketer in less than 30 days</span>
            </h2>
            <p><strong>Watch this 2 mins video</strong> to see how</p>
            <div className="fit-video-bonus-label">Free Bonus includes</div>

            <div className="fit-video-benefits">
              <span className="fit-video-benefit--highlight"><Users size={26} /> 1-1 Expert consultation</span>
              <span><BriefcaseBusiness size={26} /> AI Resume builder</span>
              <span><Sparkles size={26} /> AI Linkedin profile optimizer</span>
              <span><Target size={26} /> Interview Preperation Kit</span>
            </div>
          </div>
          <Link className="fit-result-button fit-result-button--wide fit-result-button--green fit-video-cta" href={BONUS_SESSION_URL} onClick={() => ctaClicked("results_offer_video")}>
            Claim Your Bonus Now! <ArrowRight size={16} />
          </Link>
        </section>

        <SectionTitle
          title={(
            <>
              Proven path to <span className="fit-section-title__green">secure a Job in 30 days</span>
            </>
          )}
          subtitle="5 simple steps to become a Certified AI Marketer"
        />
        <section className="fit-timeline">
          {timeline.map(({ day, title, text, icon: Icon }) => (
            <article key={day}>
              <div><Icon size={25} /></div>
              <span>{day}</span>
              <strong>{title}</strong>
              <p>{text}</p>
            </article>
          ))}
        </section>

        <SectionTitle title="Get Expert support at every step" tone="blue" />
        <section className="fit-comparison">
          <ComparisonPanel title="Without support" items={withoutPlan} tone="bad" />
          <div className="fit-vs-badge">VS</div>
          <ComparisonPanel title="With expert guidance" items={withStarterKit} tone="good" />
        </section>

        <div className="fit-comparison-cta">
          <Link className="fit-result-button fit-result-button--wide fit-result-button--green" href="#starter-kit-offer" onClick={(event) => scrollToStarterKit(event, "results_comparison_to_offer")}>
            Get Your Bonus Now! <ArrowRight size={16} />
          </Link>
        </div>

        <SectionTitle title="Frequently Asked Questions" />
        <section className="fit-faq-grid">
          {faqs.map((faq) => (
            <details key={faq.question}>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </section>

        <p className="fit-result-disclaimer">
          Salary and freelance estimates are indicative and may vary based on company, role, city, skills, portfolio, communication, and interview
          performance. This quiz does not guarantee job placement, salary, or freelance income.
        </p>
      </section>
    </main>
  );
}

function MetricCard({ icon, label, value, copy, progress }: { icon: ReactNode; label: string; value: string; copy: string; progress?: number }) {
  if (typeof progress === "number") {
    return (
      <article className="fit-metric-card fit-metric-card--score">
        <div className="fit-score-circle" style={{ "--score-progress": `${progress}%` } as CSSProperties}>
          <div>
            <span>{icon}</span>
            <strong>{value}</strong>
            <small>{label}</small>
          </div>
        </div>
        <div className="fit-score-context">
          <p>{copy}</p>
          <span><CheckCircle2 size={16} /> Strong foundation for an AI digital marketing career.</span>
          <span><CheckCircle2 size={16} /> Your learning readiness supports practical, job-ready skills.</span>
        </div>
      </article>
    );
  }

  return (
    <article className="fit-metric-card">
      <div className="fit-metric-card__top">
        <span>{icon}</span>
        <div>
          <small>{label}</small>
          <strong>{value}</strong>
        </div>
      </div>
      <p>{copy}</p>
    </article>
  );
}

function SalaryMetricCard({
  city,
  lowLpa,
  highLpa,
  takeHomeLow,
  takeHomeHigh
}: {
  city: string;
  lowLpa: number;
  highLpa: number;
  takeHomeLow: number;
  takeHomeHigh: number;
}) {
  return (
    <article className="fit-metric-card fit-salary-card">
      <div className="fit-metric-card__top">
        <span><IndianRupee size={26} /></span>
        <div>
          <small>Potential Salary in {city}</small>
          <strong>₹{lowLpa.toFixed(1)} – ₹{highLpa.toFixed(1)} LPA</strong>
        </div>
      </div>
      <div className="fit-salary-card__take-home">
        <small>Monthly Take-Home</small>
        <strong>₹{takeHomeLow.toLocaleString("en-IN")} – ₹{takeHomeHigh.toLocaleString("en-IN")}</strong>
      </div>
      <p>Based on entry-level roles for freshers with in-demand AI digital marketing skills.</p>
    </article>
  );
}

function SectionTitle({ title, subtitle, tone }: { title: ReactNode; subtitle?: string; tone?: "blue" }) {
  return (
    <header className={`fit-section-title${tone ? ` fit-section-title--${tone}` : ""}`}>
      <div><span /> <h2>{title}</h2> <span /></div>
      {subtitle ? <p>{subtitle}</p> : null}
    </header>
  );
}

function ResultBarChart({
  bars,
  type
}: {
  bars: Array<{ label: string; sublabel: string; value: number; height: number; displayValue?: string }>;
  type: "salary" | "freelance";
}) {
  return (
    <div className={`fit-bar-chart fit-bar-chart--${type}`}>
      {bars.map((bar) => (
        <div className="fit-bar" key={bar.label}>
          <span>{bar.displayValue ?? (type === "salary" ? formatLpa(bar.value) : formatInr(bar.value))}</span>
          <div style={{ height: `${bar.height}%` }} />
          <strong>{bar.label}</strong>
          <small>{bar.sublabel}</small>
        </div>
      ))}
    </div>
  );
}

function ComparisonPanel({ title, items, tone }: { title: string; items: string[]; tone: "good" | "bad" }) {
  const Icon = tone === "good" ? CheckCircle2 : CircleX;
  return (
    <article className={`fit-comparison-panel fit-comparison-panel--${tone}`}>
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}><Icon size={17} /> {item}</li>
        ))}
      </ul>
      <strong>{tone === "good" ? "Focused. Confident. Future-ready." : "Unclear. Stuck. Frustrated."}</strong>
    </article>
  );
}

function HeroIllustration() {
  return (
    <div className="fit-hero-illustration" aria-hidden="true">
      <Image
        className="fit-hero-illustration__image"
        src="/assets/results-learning-path-hero.jpg"
        alt=""
        width={1672}
        height={941}
        priority
        sizes="(max-width: 880px) 100vw, 520px"
      />
    </div>
  );
}

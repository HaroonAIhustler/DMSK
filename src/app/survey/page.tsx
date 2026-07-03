"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { fieldStudyGroups } from "@/data/fieldStudyGroups";
import { FieldStudySelect } from "@/components/FieldStudySelect";
import { LogoHeader } from "@/components/LogoHeader";
import { OptionGrid } from "@/components/OptionGrid";
import { ProgressBar } from "@/components/ProgressBar";
import { SearchableCitySelect } from "@/components/SearchableCitySelect";
import { SearchableOptionSelect } from "@/components/SearchableOptionSelect";
import { calculateFitResult, questionOptions } from "@/lib/calculator";
import { sendFunnelEvent } from "@/lib/events";
import { captureUtm } from "@/lib/utm";
import { createOrLoadSession, ensureLeadId, loadSession, saveAnswers, saveResult, saveSession } from "@/lib/storage";
import type { FunnelSession, SurveyAnswers } from "@/lib/types";

type Question = {
  key: keyof SurveyAnswers;
  question: string;
  type: "city" | "select";
  options?: string[];
};

const questions: Question[] = [
  {
    key: "city",
    question: "What is your preferred job location?",
    type: "city"
  },
  {
    key: "current_career_situation",
    question: "What is your current career situation?",
    type: "select",
    options: questionOptions.current_career_situation
  },
  {
    key: "educational_qualification",
    question: "What is your educational qualification?",
    type: "select",
    options: questionOptions.educational_qualification
  },
  {
    key: "graduation_year",
    question: "When did you graduate?",
    type: "select",
    options: questionOptions.graduation_year
  },
  {
    key: "field_of_study",
    question: "What is your field of study?",
    type: "select"
  },
  {
    key: "career_flexibility_motivation",
    question: "What flexibility are you looking for in a career?",
    type: "select",
    options: questionOptions.career_flexibility_motivation
  },
  {
    key: "current_work_field",
    question: "What field are you working in?",
    type: "select",
    options: questionOptions.current_work_field
  },
  {
    key: "certification",
    question: "Have you completed a professional certification?",
    type: "select",
    options: questionOptions.certification
  },
  {
    key: "social_activity",
    question: "Are you active on social platforms (Insta, facebook, Youtube etc.)",
    type: "select",
    options: questionOptions.social_activity
  },
  {
    key: "ads_posts_observation",
    question: "When you see ads or posts online, what do you usually think?",
    type: "select",
    options: questionOptions.ads_posts_observation
  },
  {
    key: "online_ads_curiosity",
    question: "Are you curious about how businesses make money with online Ads",
    type: "select",
    options: questionOptions.online_ads_curiosity
  },
  {
    key: "retargeting_curiosity",
    question: "Do you wondered how ads follow you online after you search for something?",
    type: "select",
    options: questionOptions.retargeting_curiosity
  },
  {
    key: "tool_comfort",
    question: "Are you comfortable learning tools like Canva, ChatGPT, Instagram or ad platforms?",
    type: "select",
    options: questionOptions.tool_comfort
  },
  {
    key: "ai_proficiency",
    question: "What is your AI proficiency level?",
    type: "select",
    options: questionOptions.ai_proficiency
  }
];

const professionalImages = [
  "/assets/community-professional-01.webp",
  "/assets/community-professional-02.webp",
  "/assets/community-professional-03.webp",
  "/assets/community-professional-04.webp",
  "/assets/community-professional-05.webp",
  "/assets/community-professional-06.webp",
  "/assets/community-professional-07.webp",
  "/assets/community-professional-08.webp",
  "/assets/community-professional-09.webp",
  "/assets/community-professional-10.webp"
];

const resultLoadingMessages = [
  "Analysing answers in detail",
  "Matching education and job preferences",
  "Looking up opportunities in your city",
  "Checking relevance for AI Digital Marketing roles",
  "Almost done - compiling final results"
];

function isCollegeStudent(answers: SurveyAnswers) {
  return answers.current_career_situation === "I am currently in college - Studying";
}

function isWorkingNeedsBetterCareer(answers: SurveyAnswers) {
  return answers.current_career_situation === "I am already working but want a better career path";
}

function getVisibleQuestions(answers: SurveyAnswers) {
  return questions.filter((question) => {
    if (isCollegeStudent(answers) && ["educational_qualification", "graduation_year"].includes(String(question.key))) {
      return false;
    }

    if (question.key === "current_work_field") {
      return isWorkingNeedsBetterCareer(answers);
    }

    return true;
  });
}

const GHL_TRACKING_ID = "tk_20528733b6e7433cbc38044d10dda053";
const GHL_LOCATION_ID = "S3oYl74Av60NEQIC13cQ";

function getGHLSessionId(): string | undefined {
  try {
    const cookieName = `lc_session_${GHL_LOCATION_ID}`;
    // Try tracker state first (most reliable — same session as page views)
    type Tracker = { state?: { sessionId?: string } };
    type LcT = { tracker?: Tracker };
    const sid = (window as typeof window & { _lcTracking?: LcT })._lcTracking?.tracker?.state?.sessionId;
    if (sid) return sid;
    // Fallback: read from cookie
    const parts = `; ${document.cookie}`.split(`; ${cookieName}=`);
    if (parts.length === 2) return parts[1].split(";")[0] || undefined;
    // Last resort: sessionStorage
    return sessionStorage.getItem(cookieName) ?? undefined;
  } catch { return undefined; }
}

function identifyContactForGHL(answers: SurveyAnswers) {
  if (typeof window === "undefined") return;

  // Write identity to localStorage._ud so future page views carry the email
  try {
    const existing = (() => {
      try { return JSON.parse(localStorage.getItem("_ud") ?? "{}"); } catch { return {}; }
    })();
    localStorage.setItem("_ud", JSON.stringify({
      ...existing,
      email: answers.email ?? existing.email,
      phone: answers.phone ?? existing.phone,
      first_name: answers.first_name ?? existing.first_name,
      last_name: answers.last_name ?? existing.last_name,
    }));
  } catch { /* non-critical */ }

  // POST form submission event directly to GHL tracking API
  // Using keepalive so it survives page navigation; reads the real session ID
  // so GHL links this email to the same session that already has page views
  const sessionId = getGHLSessionId();
  const deviceType = /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop";
  const pageUrl = window.location.href;
  const pageTitle = document.title;
  const pagePath = window.location.pathname;
  const referrer = document.referrer;

  fetch("https://backend.leadconnectorhq.com/external-tracking/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: JSON.stringify({
      type: "external_form_submission",
      timestamp: Date.now(),
      trackingId: GHL_TRACKING_ID,
      locationId: GHL_LOCATION_ID,
      sessionId,
      formId: "survey-form",
      url: pageUrl,
      title: pageTitle,
      path: pagePath,
      referrer,
      userAgent: navigator.userAgent,
      formData: {
        email: answers.email ?? "",
        phone: answers.phone ?? "",
        first_name: answers.first_name ?? "",
        last_name: answers.last_name ?? "",
        full_name: [answers.first_name, answers.last_name].filter(Boolean).join(" "),
      },
      properties: {
        sessionId,
        locationId: GHL_LOCATION_ID,
        deviceType,
      },
    }),
  }).catch(() => { /* non-critical */ });
}

function normalizeIndianPhone(value?: string) {
  const phoneDigits = value?.replace(/\D/g, "") ?? "";
  return phoneDigits.length === 12 && phoneDigits.startsWith("91") ? phoneDigits.slice(2) : phoneDigits.slice(0, 10);
}

function validateContact(answers: SurveyAnswers) {
  const normalizedPhone = normalizeIndianPhone(answers.phone);

  if (!answers.first_name?.trim()) return "Please enter your first name.";
  if (!answers.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answers.email)) return "Please enter a valid email address.";
  if (!/^[6-9]\d{9}$/.test(normalizedPhone)) return "Please enter a valid 10-digit WhatsApp number.";
  return "";
}

function fieldStudyMain(value?: string) {
  if (!value) return undefined;
  return fieldStudyGroups.find((group) => group.options.includes(value))?.group;
}

function mergeDefinedUtm(current: FunnelSession["utm"], incoming: FunnelSession["utm"]): FunnelSession["utm"] {
  return {
    ...current,
    ...(incoming.utm_source ? { utm_source: incoming.utm_source } : {}),
    ...(incoming.utm_medium ? { utm_medium: incoming.utm_medium } : {}),
    ...(incoming.utm_campaign ? { utm_campaign: incoming.utm_campaign } : {}),
    ...(incoming.utm_content ? { utm_content: incoming.utm_content } : {}),
    ...(incoming.utm_term ? { utm_term: incoming.utm_term } : {}),
    ...(incoming.fbclid ? { fbclid: incoming.fbclid } : {}),
    ...(incoming.gclid ? { gclid: incoming.gclid } : {}),
    ...(incoming.landing_page_url ? { landing_page_url: incoming.landing_page_url } : {}),
    ...(incoming.referrer_url ? { referrer_url: incoming.referrer_url } : {})
  };
}

function answersWithUtm(answers: SurveyAnswers, utm: FunnelSession["utm"]): SurveyAnswers {
  return {
    ...answers,
    ...(utm.utm_campaign ? { utm_campaign: utm.utm_campaign } : {}),
    ...(utm.utm_medium ? { utm_medium: utm.utm_medium } : {}),
    ...(utm.utm_source ? { utm_source: utm.utm_source } : {})
  };
}

function buildWebhookContact(answers: SurveyAnswers) {
  const mainFieldOfStudy = fieldStudyMain(answers.field_of_study);

  return {
    preferred_job_location: answers.city,
    preferred_job_state: answers.state,
    city: answers.city,
    state: answers.state,
    current_career_situation: answers.current_career_situation,
    educational_qualification: answers.educational_qualification,
    when_did_you_graduates: answers.graduation_year,
    graduation_year: answers.graduation_year,
    field_of_study: mainFieldOfStudy || answers.field_of_study,
    field_of_study_main: mainFieldOfStudy,
    field_of_study__detail: answers.field_of_study,
    flexibility_looking_for: answers.career_flexibility_motivation,
    field_working_in: answers.current_work_field,
    professional_certification: answers.certification,
    social_platforms: answers.social_activity,
    when_you_see_ads: answers.ads_posts_observation,
    are_you_curious: answers.online_ads_curiosity,
    do_you_wondered: answers.retargeting_curiosity,
    are_you_comfortable_learning: answers.tool_comfort,
    ai_proficiency_level: answers.ai_proficiency,
    first_name: answers.first_name,
    last_name: answers.last_name,
    email: answers.email,
    utm_campaign: answers.utm_campaign,
    medium: answers.utm_medium,
    utm_source: answers.utm_source,
    phone: answers.phone ? normalizeIndianPhone(answers.phone) : undefined
  };
}

async function sendSurveyWebhook(eventName: string, answers: SurveyAnswers, session?: FunnelSession | null) {
  const contact = { ...buildWebhookContact(answers), encr: session?.result?.fit_score };
  const payload = {
    event_name: eventName,
    event_timestamp: new Date().toISOString(),
    session_id: session?.session_id,
    lead_id: session?.lead_id,
    browser_id: session?.browser_id,
    contact,
    ...contact,
    answers: {
      ...answers,
      preferred_job_location: answers.city,
      current_career_situation: answers.current_career_situation,
      educational_qualification: answers.educational_qualification,
      when_did_you_graduates: answers.graduation_year,
      field_of_study: contact.field_of_study,
      field_of_study__detail: answers.field_of_study,
      flexibility_looking_for: answers.career_flexibility_motivation,
      field_working_in: answers.current_work_field,
      professional_certification: answers.certification,
      social_platforms: answers.social_activity,
      when_you_see_ads: answers.ads_posts_observation,
      are_you_curious: answers.online_ads_curiosity,
      do_you_wondered: answers.retargeting_curiosity,
      are_you_comfortable_learning: answers.tool_comfort,
      ai_proficiency_level: answers.ai_proficiency,
      medium: answers.utm_medium
    },
    utm: session?.utm,
    result: session?.result
  };

  try {
    await fetch("/api/question-webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true
    });
  } catch {
    // Webhook delivery should not block the user journey.
  }
}

export default function SurveyPage() {
  const router = useRouter();
  const [session, setSession] = useState<FunnelSession | null>(null);
  const [answers, setAnswers] = useState<SurveyAnswers>({});
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreparingResult, setIsPreparingResult] = useState(false);
  const [loaderProgress, setLoaderProgress] = useState(0);
  const [loaderMessageIndex, setLoaderMessageIndex] = useState(0);
  const visibleQuestions = getVisibleQuestions(answers);
  const isContactStep = stepIndex === visibleQuestions.length;
  const currentQuestion = visibleQuestions[stepIndex];
  const progress = ((stepIndex + 1) / (visibleQuestions.length + 1)) * 100;

  useEffect(() => {
    const capturedUtm = captureUtm();
    const loaded = createOrLoadSession(capturedUtm);
    const mergedUtm = mergeDefinedUtm(loaded.utm, capturedUtm);
    const mergedAnswers = answersWithUtm(loaded.answers, mergedUtm);
    const loadedWithUtm = { ...loaded, utm: mergedUtm, answers: mergedAnswers };
    saveSession(loadedWithUtm);

    queueMicrotask(() => {
      setSession(loadedWithUtm);
      setAnswers(mergedAnswers);
    });
    sendFunnelEvent("survey_page_view", "survey", "/survey", loadedWithUtm);
  }, []);

  function updateAnswer(key: keyof SurveyAnswers, value: string) {
    const nextAnswers = { ...answers, [key]: value };
    if (key === "current_career_situation" && value === "I am currently in college - Studying") {
      delete nextAnswers.educational_qualification;
      delete nextAnswers.graduation_year;
    }
    if (key === "current_career_situation" && value !== "I am already working but want a better career path") {
      delete nextAnswers.current_work_field;
    }
    setAnswers(nextAnswers);
    saveAnswers(nextAnswers);
    const nextSession = loadSession();
    if (nextSession) setSession(nextSession);
    return nextAnswers;
  }

  function answerCurrent(value: string) {
    if (!currentQuestion || !session) return;
    if (!hasStarted) {
      setHasStarted(true);
      sendFunnelEvent("survey_started", "survey", "/survey", session);
    }
    const nextAnswers = updateAnswer(currentQuestion.key, value);
    window.setTimeout(() => {
      setError("");
      setStepIndex((current) => {
        const nextVisibleQuestions = getVisibleQuestions(nextAnswers);
        return Math.min(current + 1, nextVisibleQuestions.length);
      });
    }, 180);
  }

  function next() {
    if (currentQuestion && !answers[currentQuestion.key]) {
      setError("Please choose an answer to continue.");
      return;
    }
    setError("");
    setStepIndex((current) => Math.min(current + 1, visibleQuestions.length));
  }

  function back() {
    setError("");
    setStepIndex((current) => Math.max(current - 1, 0));
  }

  function playResultsLoader() {
    setIsPreparingResult(true);
    setLoaderProgress(0);
    setLoaderMessageIndex(0);

    const duration = 3000 + Math.random() * 2000;
    const startedAt = performance.now();
    let shownProgress = 0;

    return new Promise<void>((resolve) => {
      function tick() {
        const elapsed = performance.now() - startedAt;
        const ratio = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - ratio, 2.2);
        const targetProgress = Math.min(99, Math.floor(eased * 100));
        const shouldPause = Math.random() < 0.22 && ratio < 0.92;

        if (!shouldPause && targetProgress > shownProgress) {
          shownProgress = Math.min(targetProgress, shownProgress + Math.ceil(Math.random() * 4));
          setLoaderProgress(shownProgress);
        }

        setLoaderMessageIndex(Math.min(resultLoadingMessages.length - 1, Math.floor(ratio * resultLoadingMessages.length)));

        if (ratio >= 1) {
          setLoaderMessageIndex(resultLoadingMessages.length - 1);
          setLoaderProgress(100);
          window.setTimeout(resolve, 300);
          return;
        }

        window.setTimeout(tick, 90 + Math.random() * 170);
      }

      tick();
    });
  }

  async function submit() {
    if (isSubmitting || isPreparingResult) return;
    const validation = validateContact(answers);
    if (validation) {
      setError(validation);
      return;
    }

    setIsSubmitting(true);
    const normalizedAnswers = { ...answers, phone: normalizeIndianPhone(answers.phone) };
    setAnswers(normalizedAnswers);
    saveAnswers(normalizedAnswers);
    const leadId = ensureLeadId();
    const latest = loadSession();
    if (!latest) {
      setIsSubmitting(false);
      return;
    }
    const result = calculateFitResult(normalizedAnswers);
    saveResult(result);
    const completed = loadSession();
    if (!completed) {
      setIsSubmitting(false);
      return;
    }
    saveSession({ ...completed, lead_id: leadId, result });
    const finalSession = loadSession();
    if (!finalSession) {
      setIsSubmitting(false);
      return;
    }

    await sendFunnelEvent("lead_details_submitted", "survey", "/survey", finalSession);
    await sendFunnelEvent("survey_completed", "survey", "/survey", finalSession);
    await sendFunnelEvent("fit_score_calculated", "survey", "/survey", finalSession);
    await sendFunnelEvent("survey_to_results_redirect", "survey", "/survey", finalSession);
    await sendSurveyWebhook("survey_completed", normalizedAnswers, finalSession);
    identifyContactForGHL(normalizedAnswers);
    await playResultsLoader();
    const resultsPath = result.fit_score < 40 ? "/results/low-fit" : "/results";
    router.push(`${resultsPath}?session_id=${finalSession.session_id}`);
  }

  function handleCitySelect(city: string, state: string) {
    const nextAnswers = {
      ...answers,
      city,
      state
    };
    setAnswers(nextAnswers);
    saveAnswers(nextAnswers);
    const latest = loadSession() ?? session;
    if (latest && nextAnswers.city) {
      if (!hasStarted) {
        setHasStarted(true);
        sendFunnelEvent("survey_started", "survey", "/survey", latest);
      }
    }
    window.setTimeout(() => {
      setError("");
      setStepIndex((current) => Math.min(current + 1, visibleQuestions.length));
    }, 180);
  }

  function handleFieldStudySelect(value: string) {
    if (!session) return;
    updateAnswer("field_of_study", value);
    window.setTimeout(() => {
      setError("");
      setStepIndex((current) => Math.min(current + 1, visibleQuestions.length));
    }, 180);
  }

  function handleSearchableOptionSelect(value: string) {
    answerCurrent(value);
  }

  return (
    <main className="survey-page">
      <section className="survey-shell">
        <LogoHeader />
        <header className="survey-hero">
          <h1>
            A Fresher, <span>Digital Marketer with AI Skills</span> earns more than{" "}
            <span className="survey-hero__green">₹35,000+ per month - even with Zero Experience</span>
          </h1>
          <p className="survey-hero__support">See if you are a right fit in less than a minute</p>
        </header>

        <div className="survey-single-column">
          <section className="survey-card">
            <ProgressBar value={progress} />

            {isPreparingResult ? (
              <ResultLoading progress={loaderProgress} message={resultLoadingMessages[loaderMessageIndex]} />
            ) : isContactStep ? (
              <ContactForm answers={answers} error={error} onChange={updateAnswer} onSubmit={submit} isSubmitting={isSubmitting} />
            ) : (
              <div className="question-slide">
                <h1>{currentQuestion.question}</h1>

                {currentQuestion.type === "city" ? (
                  <SearchableCitySelect selectedCity={answers.city} state={answers.state} onSelect={handleCitySelect} />
                ) : currentQuestion.key === "field_of_study" ? (
                  <FieldStudySelect value={answers.field_of_study} onSelect={handleFieldStudySelect} />
                ) : currentQuestion.key === "current_work_field" ? (
                  <SearchableOptionSelect
                    value={answers.current_work_field}
                    options={currentQuestion.options ?? []}
                    placeholder="Search and select work field"
                    searchPlaceholder="Search field, e.g. Sales"
                    onSelect={handleSearchableOptionSelect}
                  />
                ) : (
                  <OptionGrid
                    value={answers[currentQuestion.key]}
                    options={currentQuestion.options ?? []}
                    onSelect={answerCurrent}
                    showIcons={
                      ![
                        "educational_qualification",
                        "graduation_year",
                        "current_work_field",
                        "social_activity",
                        "ads_posts_observation",
                        "online_ads_curiosity",
                        "retargeting_curiosity"
                      ].includes(String(currentQuestion.key))
                    }
                  />
                )}

                {error ? <p className="form-error">{error}</p> : null}
                <div className="survey-actions">
                  {stepIndex > 0 ? (
                    <button className="secondary-button secondary-button--icon-only" type="button" onClick={back} aria-label="Back">
                      <ArrowLeft size={18} />
                    </button>
                  ) : (
                    <span />
                  )}
                  <button className="primary-button" type="button" onClick={next}>
                    Next <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </section>

          <section className="trust-strip" aria-label="AI Growth Studio professional community">
            <p>Join 2,000+ AI powered Digital Marketers</p>
            <div className="people-marquee">
              <div className="people-track">
                {[...professionalImages, ...professionalImages].map((src, index) => (
                  <Image src={src} alt="" key={`${src}-${index}`} width={112} height={112} />
                ))}
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function ResultLoading({ progress, message }: { progress: number; message: string }) {
  return (
    <div className="result-loading-panel" aria-live="polite" aria-busy="true">
      <div className="result-loader-orbit" aria-hidden="true">
        <span />
      </div>
      <div className="result-loader-copy">
        <p>{message}</p>
        <strong>{progress}%</strong>
      </div>
      <div className="result-loader-track" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

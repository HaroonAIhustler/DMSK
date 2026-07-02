"use client";

import { ArrowRight } from "lucide-react";
import type { SurveyAnswers } from "@/lib/types";

type ContactFormProps = {
  answers: SurveyAnswers;
  error: string;
  onChange: (key: keyof SurveyAnswers, value: string) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
};

function cleanPhoneInput(value: string) {
  const digits = value.replace(/\D/g, "");
  const withoutCountryCode = digits.length > 10 && digits.startsWith("91") ? digits.slice(2) : digits;
  return withoutCountryCode.slice(0, 10);
}

export function ContactForm({ answers, error, onChange, onSubmit, isSubmitting = false }: ContactFormProps) {
  const phoneValue = cleanPhoneInput(answers.phone ?? "");

  return (
    <div className="question-slide">
      <div className="eyebrow">Final step</div>
      <h1>Where should we send your fit score?</h1>
      <p className="question-copy">Your result is private. We will use these details to send your result and Starter Kit guidance.</p>

      <div className="form-grid">
        <label>
          First name
          <input value={answers.first_name ?? ""} onChange={(event) => onChange("first_name", event.target.value)} placeholder="First name" />
        </label>
        <label>
          Last name
          <input value={answers.last_name ?? ""} onChange={(event) => onChange("last_name", event.target.value)} placeholder="Last name" />
        </label>
        <label>
          Email
          <input value={answers.email ?? ""} onChange={(event) => onChange("email", event.target.value)} placeholder="you@example.com" type="email" />
        </label>
        <label>
          WhatsApp number
          <div className="phone-input-wrap">
            <span aria-hidden="true">+91</span>
            <input
              value={phoneValue}
              onChange={(event) => onChange("phone", cleanPhoneInput(event.target.value))}
              placeholder="98765 43210"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              maxLength={10}
              pattern="[0-9]{10}"
              aria-label="WhatsApp number without country code"
              aria-invalid={error.toLowerCase().includes("whatsapp")}
            />
          </div>
        </label>
      </div>

      <input type="hidden" name="utm_campaign" value={answers.utm_campaign ?? ""} readOnly />
      <input type="hidden" name="utm_medium" value={answers.utm_medium ?? ""} readOnly />
      <input type="hidden" name="utm_source" value={answers.utm_source ?? ""} readOnly />

      {error ? <p className="form-error">{error}</p> : null}
      <button className="primary-button" type="button" onClick={onSubmit} disabled={isSubmitting}>
        {isSubmitting ? "Preparing Result" : "See My Result"} <ArrowRight size={18} />
      </button>
    </div>
  );
}

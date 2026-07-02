export type SurveyAnswers = {
  city?: string;
  state?: string;
  current_career_situation?: string;
  educational_qualification?: string;
  graduation_year?: string;
  field_of_study?: string;
  career_flexibility_motivation?: string;
  current_work_field?: string;
  certification?: string;
  social_activity?: string;
  ads_posts_observation?: string;
  online_ads_curiosity?: string;
  retargeting_curiosity?: string;
  tool_comfort?: string;
  ai_proficiency?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  utm_campaign?: string;
  utm_medium?: string;
  utm_source?: string;
  [key: string]: string | undefined;
};

export type UtmData = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  fbclid?: string;
  gclid?: string;
  landing_page_url?: string;
  referrer_url?: string;
};

export type FitResult = {
  fit_score: number;
  fit_category: string;
  category_color: string;
  recommended_role: string;
  recommended_roles: string[];
  top_3_fit_reasons: string[];
  field_score: number;
  field_band: string;
  city_tier: string;
  selected_city: string;
  selected_state: string;
  base_salary_lpa: number;
  adjusted_salary_lpa: number;
  monthly_salary: number;
  low_salary_range_lpa: number;
  high_salary_range_lpa: number;
  freelancer_income_low: number;
  freelancer_income_high: number;
  salary_boost_factors: string[];
  salary_factor_total: number;
  gaps: string[];
  tags: string[];
};

export type FunnelSession = {
  session_id: string;
  lead_id?: string;
  browser_id: string;
  created_at: string;
  updated_at: string;
  answers: SurveyAnswers;
  result?: FitResult;
  utm: UtmData;
  payment_status?: "not_started" | "initiated" | "completed" | "failed" | "cancelled";
  payment?: Record<string, string | number | undefined>;
};

export type FunnelEventPayload = {
  event_name: string;
  funnel_stage: string;
  current_page: string;
  session: FunnelSession;
  extra?: Record<string, unknown>;
};

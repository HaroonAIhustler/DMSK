import workbookData from "@/data/workbookData.json";
import type { FitResult, SurveyAnswers } from "@/lib/types";

type WorkbookRow = Record<string, string | number>;
export type CityOption = {
  state: string;
  city: string;
  tier: string;
  aliases?: string[];
  priority?: number;
};

const answerRules = workbookData.answerScoreRules as WorkbookRow[];
const salaryFactors = workbookData.salaryFactors as WorkbookRow[];
const fieldFitScores = workbookData.fieldFitScores as WorkbookRow[];
const salaryLookup = workbookData.salaryLookup as WorkbookRow[];

const answerScore = new Map(answerRules.map((row) => [String(row["Lookup Key"]), Number(row["Fit Score"])]));
const salaryFactor = new Map(salaryFactors.map((row) => [String(row["Lookup Key"]), Number(row["Salary Adjustment"])]));
const fieldScore = new Map(fieldFitScores.map((row) => [String(row["Field of Study"]), row]));

const optionTextAliases: Record<string, string> = {
  "Work-life balance and more time for family/friends": "Work-life balance - more time for family/friends",
  "Work-life balance - more time for family/friends": "Work-life balance and more time for family/friends"
};

const aliasesByCity: Record<string, string[]> = {
  Bengaluru: ["Bangalore", "Bengluru"],
  Kalaburagi: ["Gulbarga", "Kalburgi", "Kalburagi"],
  Gurugram: ["Gurgaon"],
  Mumbai: ["Bombay"],
  Kolkata: ["Calcutta"],
  Thiruvananthapuram: ["Trivandrum"],
  Prayagraj: ["Allahabad"],
  Vadodara: ["Baroda"],
  Kozhikode: ["Calicut"],
  Chennai: ["Madras"],
  Mysuru: ["Mysore"],
  Mangaluru: ["Mangalore"],
  Kochi: ["Cochin"],
  Puducherry: ["Pondicherry"],
  Panaji: ["Panjim"],
  Visakhapatnam: ["Vizag"],
  Tiruchirappalli: ["Trichy"],
  Mohali: ["SAS Nagar"]
};

function cityPriority(city: string) {
  if (["Mumbai", "Delhi", "Bengaluru"].includes(city)) return 100;
  if (["Hyderabad", "Chennai", "Pune", "Kolkata"].includes(city)) return 95;
  if (["Ahmedabad", "Gurugram", "Noida"].includes(city)) return 90;
  if (["Jaipur", "Lucknow"].includes(city)) return 85;
  return 35;
}

export const cityOptions: CityOption[] = salaryLookup.map((row) => ({
  state: String(row.State),
  city: String(row.City),
  tier: String(row.Tier),
  aliases: aliasesByCity[String(row.City)] ?? [],
  priority: cityPriority(String(row.City))
}));

function normalizeSearch(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function cityMatchScore(option: CityOption, query: string) {
  const normalizedQuery = normalizeSearch(query);
  const candidates = [option.city, option.state, ...(option.aliases ?? [])].map(normalizeSearch);
  const priority = option.priority ?? 0;

  if (!normalizedQuery) return priority;
  if (candidates.some((candidate) => candidate === normalizedQuery)) return 1000 + priority;
  if (candidates.some((candidate) => candidate.startsWith(normalizedQuery))) return 700 + priority;
  if (candidates.some((candidate) => candidate.includes(normalizedQuery))) return 500 + priority;

  const fuzzyHit = candidates.some((candidate) => {
    let index = 0;
    for (const char of normalizedQuery) {
      index = candidate.indexOf(char, index);
      if (index === -1) return false;
      index += 1;
    }
    return true;
  });

  return fuzzyHit ? 250 + priority : -1;
}

export function searchCities(query: string, limit = 40) {
  return cityOptions
    .map((option) => ({ option, rank: cityMatchScore(option, query) }))
    .filter(({ rank }) => rank >= 0)
    .sort((a, b) => b.rank - a.rank || a.option.city.localeCompare(b.option.city))
    .map(({ option }) => option)
    .slice(0, limit);
}

export const fieldOfStudyOptions = Array.from(new Set(fieldFitScores.map((row) => String(row["Field of Study"]))));

export const questionOptions = {
  current_career_situation: careerSituationOptions(),
  educational_qualification: optionsFor("Educational Qualification"),
  graduation_year: optionsFor("Graduation Year"),
  career_flexibility_motivation: optionsFor("Career Flexibility Motivation"),
  current_work_field: optionsFor("Current Work Field"),
  certification: optionsFor("Certification"),
  social_activity: optionsFor("Social Activity"),
  ads_posts_observation: optionsFor("Ads/Posts Observation"),
  online_ads_curiosity: optionsFor("Online Ads Curiosity"),
  retargeting_curiosity: optionsFor("Retargeting Curiosity"),
  tool_comfort: optionsFor("Tool Comfort"),
  ai_proficiency: optionsFor("AI Proficiency")
};

function careerSituationOptions() {
  const options = optionsFor("Current Career Situation");
  const preferredFirst = "I am actively looking for a job";

  return options.sort((left, right) => {
    if (left === preferredFirst) return -1;
    if (right === preferredFirst) return 1;
    return 0;
  });
}

function optionsFor(questionKey: string) {
  return answerRules
    .filter((row) => row["Question Key"] === questionKey)
    .map((row) => optionTextAliases[String(row.Option)] ?? String(row.Option));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function round(value: number, digits = 0) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function scoreFor(questionKey: string, value?: string, fallback = 60) {
  if (!value) return fallback;
  return answerScore.get(`${questionKey}|${value}`) ?? answerScore.get(`${questionKey}|${optionTextAliases[value]}`) ?? fallback;
}

function factorFor(factorKey: string, value?: string) {
  if (!value) return 0;
  return salaryFactor.get(`${factorKey}|${value}`) ?? 0;
}

function category(score: number) {
  if (score >= 90) return { label: "Excellent Fit", color: "#16A34A" };
  if (score >= 80) return { label: "Strong Fit", color: "#0EA5E9" };
  if (score >= 70) return { label: "Good Fit", color: "#2563EB" };
  if (score >= 60) return { label: "Possible Fit", color: "#F59E0B" };
  if (score >= 45) return { label: "Explore Carefully", color: "#F59E0B" };
  return { label: "Low Direct Fit", color: "#DC2626" };
}

function findSalaryCity(city?: string, state?: string) {
  const normalizedCity = city?.trim().toLowerCase();
  const normalizedState = state?.trim().toLowerCase();
  const exact = salaryLookup.find(
    (row) => String(row.City).toLowerCase() === normalizedCity && String(row.State).toLowerCase() === normalizedState
  );
  if (exact) return exact;
  const cityOnly = salaryLookup.find((row) => String(row.City).toLowerCase() === normalizedCity);
  if (cityOnly) return cityOnly;
  const stateRows = salaryLookup.filter((row) => String(row.State).toLowerCase() === normalizedState);
  if (stateRows.length) {
    const average = stateRows.reduce((sum, row) => sum + Number(row["Tier Breakdown"]), 0) / stateRows.length;
    return { ...stateRows[0], City: city || stateRows[0].City, "Tier Breakdown": round(average, 2), Tier: "State average" };
  }
  return { State: state || "India", City: city || "India", Tier: "National default", Multiplier: 1, Base: 3.21, "Tier Breakdown": 3.21 };
}

function fieldSalaryFactor(score: number) {
  if (score >= 90) return 0.05;
  if (score >= 80) return 0.03;
  if (score >= 70) return 0.01;
  if (score >= 60) return 0;
  if (score >= 45) return -0.03;
  return -0.08;
}

function roleFromInterest(interest?: string, fallback?: string) {
  if (interest?.includes("Social")) return "Social Media Executive";
  if (interest?.includes("Writing")) return "Content Marketing Executive";
  if (interest?.includes("SEO")) return "SEO Executive";
  if (interest?.includes("Ads")) return "Performance Marketing Assistant";
  if (interest?.includes("Client")) return "Client Servicing / Creator Partnerships";
  return fallback?.split(",")[0]?.trim() || "AI Digital Marketing Executive";
}

function topReasons(answers: SurveyAnswers, fieldRow: WorkbookRow | undefined, scores: Record<string, number>) {
  const reasons: string[] = [];
  if (fieldRow?.Reason) reasons.push(String(fieldRow.Reason));
  if (scores.curiosity >= 80) reasons.push("Your answers show strong curiosity about online ads, social platforms, and how brands get attention.");
  if (scores.tools >= 80) reasons.push("Your tool and AI readiness can help you learn faster and build proof through projects.");
  if (scores.motivation >= 80) reasons.push("Your motivation aligns well with AI digital marketing as a practical skill-growth career.");
  if (scores.curiosity < 65) reasons.push("You may need a simple roadmap first, because the digital curiosity signals are still developing.");
  if (scores.tools < 65) reasons.push("Start with beginner-friendly tools before considering expensive courses.");
  return reasons.slice(0, 3);
}

function gaps(answers: SurveyAnswers, score: number) {
  const items = ["Digital marketing basics", "One portfolio project", "Resume and LinkedIn positioning"];
  if ((answers.tool_comfort ?? "").includes("step-by-step") || (answers.tool_comfort ?? "").includes("try")) items.push("Tool practice with Canva, ChatGPT, and campaign dashboards");
  if (score < 75) items.push("Role clarity before buying advanced courses");
  if ((answers.certification ?? "") === "No") items.push("A beginner credential or project proof");
  return items;
}

function tags(answers: SurveyAnswers, resultCategory: string, role: string) {
  const output = ["Survey Completed", "Career Fit Calculated", resultCategory];
  if (answers.current_career_situation?.includes("college")) output.push("Student");
  if (answers.current_career_situation?.includes("graduated")) output.push("Fresher");
  if (answers.current_career_situation?.includes("working")) output.push("Career Switcher");
  if (answers.current_work_field) output.push(answers.current_work_field);
  if (role.includes("Social")) output.push("Social Media Fit");
  if (role.includes("Content")) output.push("Content Fit");
  if (role.includes("SEO")) output.push("SEO Fit");
  if (role.includes("Performance")) output.push("Performance Marketing Fit");
  return output;
}

export function calculateFitResult(answers: SurveyAnswers): FitResult {
  const selectedField = fieldScore.get(answers.field_of_study ?? "");
  const selectedFieldScore = Number(selectedField?.["Base Fit Score"] ?? 60);
  const fieldRelevance = String(selectedField?.["DM Relevance Category"] ?? "Niche/conditional");
  const qualificationScore = scoreFor("Educational Qualification", answers.educational_qualification);
  const graduationScore = scoreFor("Graduation Year", answers.graduation_year);
  const motivationScore = scoreFor("Career Flexibility Motivation", answers.career_flexibility_motivation);
  const workFieldScore = scoreFor("Current Work Field", answers.current_work_field);
  const certificationScore = scoreFor("Certification", answers.certification);
  const socialScore = scoreFor("Social Activity", answers.social_activity);
  const adsScore = scoreFor("Ads/Posts Observation", answers.ads_posts_observation);
  const onlineAdsScore = scoreFor("Online Ads Curiosity", answers.online_ads_curiosity);
  const retargetingScore = scoreFor("Retargeting Curiosity", answers.retargeting_curiosity);
  const toolScore = scoreFor("Tool Comfort", answers.tool_comfort);
  const aiScore = scoreFor("AI Proficiency", answers.ai_proficiency);

  const curiosity = (socialScore + adsScore + onlineAdsScore + retargetingScore) / 4;
  const tools = (certificationScore + toolScore + aiScore) / 3;
  const education = (qualificationScore + graduationScore) / 2;

  const weightedFitScore = round(
    clamp(
      selectedFieldScore * 0.25 +
        curiosity * 0.25 +
        tools * 0.2 +
        motivationScore * 0.15 +
        education * 0.1 +
        workFieldScore * 0.05,
      30,
      95
    )
  );

  const hasDirectDmProof =
    answers.current_work_field === "Digital Marketing" ||
    answers.certification === "I have a professional certification in Digital Marketing already";

  let fitScore = weightedFitScore;
  if (fieldRelevance === "Non-DM" || selectedFieldScore < 40) {
    fitScore = Math.min(fitScore, hasDirectDmProof ? 79 : 39);
  } else if (fieldRelevance === "Niche/conditional") {
    fitScore = Math.min(fitScore, 79);
  }

  const resultCategory = category(fitScore);
  const cityRow = findSalaryCity(answers.city, answers.state);
  const baseSalary = Number(cityRow["Tier Breakdown"]);
  const factors = [
    factorFor("Qualification", answers.educational_qualification),
    factorFor("AI Proficiency", answers.ai_proficiency),
    factorFor("Certification", answers.certification),
    factorFor("Tool Comfort", answers.tool_comfort),
    factorFor("Work Field", answers.current_work_field),
    fieldSalaryFactor(selectedFieldScore)
  ];
  const totalFactor = clamp(factors.reduce((sum, value) => sum + value, 0), -0.15, 0.3);
  const adjustedSalary = round(baseSalary * (1 + totalFactor), 2);
  const recommendedRole = roleFromInterest(answers.ads_posts_observation, String(selectedField?.["Recommended Role Direction"] ?? ""));
  const recommendedRoles = Array.from(
    new Set([recommendedRole, ...String(selectedField?.["Recommended Role Direction"] ?? "Social Media, SEO, Performance Marketing").split(",").map((role) => role.trim())])
  ).slice(0, 4);

  const scoreBreakdown = { curiosity, tools, motivation: motivationScore };

  return {
    fit_score: fitScore,
    fit_category: resultCategory.label,
    category_color: resultCategory.color,
    recommended_role: recommendedRole,
    recommended_roles: recommendedRoles,
    top_3_fit_reasons: topReasons(answers, selectedField, scoreBreakdown),
    field_score: selectedFieldScore,
    field_band: String(selectedField?.["Fit Band"] ?? "Needs roadmap"),
    selected_city: String(cityRow.City),
    selected_state: String(cityRow.State),
    city_tier: String(cityRow.Tier),
    base_salary_lpa: round(baseSalary, 2),
    adjusted_salary_lpa: adjustedSalary,
    monthly_salary: round((adjustedSalary * 100000) / 12),
    low_salary_range_lpa: round(adjustedSalary * 0.85, 2),
    high_salary_range_lpa: round(adjustedSalary * 1.15, 2),
    freelancer_income_low: fitScore >= 80 ? 7000 : fitScore >= 60 ? 3000 : 1500,
    freelancer_income_high: fitScore >= 80 ? 25000 : fitScore >= 60 ? 12000 : 6000,
    salary_boost_factors: [
      answers.educational_qualification ?? "Education",
      answers.ai_proficiency ?? "AI readiness",
      answers.certification ?? "Certification status",
      answers.tool_comfort ?? "Tool comfort",
      answers.current_work_field ?? "Work background"
    ],
    salary_factor_total: round(totalFactor, 2),
    gaps: gaps(answers, fitScore),
    tags: tags(answers, resultCategory.label, recommendedRole)
  };
}

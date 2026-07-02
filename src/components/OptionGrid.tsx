import {
  BadgeCheck,
  BookOpen,
  Bot,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock,
  GraduationCap,
  HeartHandshake,
  Home,
  Lightbulb,
  Megaphone,
  MonitorSmartphone,
  Palette,
  Plane,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet
} from "lucide-react";

type OptionGridProps = {
  options: string[];
  value?: string;
  onSelect: (value: string) => void;
  fullText?: boolean;
  showIcons?: boolean;
};

const compactLabels: Record<string, string> = {
  "I am currently in college - Studying": "In College",
  "I recently graduated and Exploring my options": "Recent Graduate",
  "I am actively looking for a job": "Job Seeker",
  "I am considering a job in Digital Marketing": "Considering DM",
  "I am already working but want a better career path": "Working, Need Better",
  "Bachelors Degree": "Bachelor's",
  "Masters Degree": "Master's",
  "Non-Graduate": "Non-Graduate",
  "2020 and before": "2020 or Before",
  "I did not complete graduation / diploma / other qualification": "Did Not Complete",
  "Better salary and income growth": "Salary Growth",
  "Work-life balance and more time for family/friends": "Work-Life Balance",
  "Work-from-home or flexible work options": "WFH / Flexible",
  "Stable job with long-term growth": "Stable Growth",
  "Freelance or side-income opportunities": "Side Income",
  "Travel across India and abroad": "Travel",
  "Accounting, Finance & Tax": "Finance / Tax",
  "Digital Marketing": "AI Digital Marketing",
  "Business Development": "Business Development",
  "IT, Software & Technology": "IT / Technology",
  "Administration & Office Roles": "Admin / Office",
  "Human Resources & Recruitment": "HR / Recruitment",
  "Customer Support & BPO": "Customer Support",
  "Engineering & Manufacturing": "Engineering",
  "Construction, Real Estate & Architecture": "Real Estate",
  "Healthcare & Medical": "Healthcare",
  "Education & Training": "Education",
  "Content, Media & Creative": "Content / Creative",
  "Legal & Compliance": "Legal",
  "Retail, Store & E-commerce": "Retail / Ecommerce",
  "Logistics, Supply Chain & Transport": "Logistics",
  "Hospitality, Travel & Aviation": "Hospitality",
  "Agriculture, Food & Environment": "Agriculture",
  "Design, Fashion & Lifestyle": "Design / Fashion",
  "Civil service or public service": "Public Service",
  "Government office": "Government",
  "Yes - In college": "College Course",
  "Yes - Professional certification": "Professional Cert",
  "Yes - Learned online / Youtube": "Online / YouTube",
  "I have a professional certification in Digital Marketing already": "DM Certified",
  "Very active, I use them daily and notice trends": "Very Active",
  "Moderately active, I use them for entertainment or learning": "Moderate",
  "I rarely use social media": "Rarely",
  "I don’t use social media": "Not Active",
  "I notice the design, message, offer, and why people may click": "Notice Strategy",
  "I sometimes wonder how brands create these ads": "Wonder How",
  "I only notice if the product interests me": "Notice Products",
  "I find ads irritating": "Ads Irritate Me",
  "Yes, I find it very interesting": "Very Curious",
  "Somewhat, I would like to learn more": "Somewhat Curious",
  "I have never thought about it but I’m open to learning": "Open to Learn",
  "Not really": "Not Really",
  "Yes, I have noticed and I’m curious": "Noticed & Curious",
  "I noticed it but don’t know how it works": "Noticed, Unsure",
  "I have heard about it": "Heard About It",
  "Yes, I’m excited to learn tools": "Excited to Learn",
  "Yes, if taught step-by-step": "Need Step-by-Step",
  "I can try": "Can Try",
  "No, I don’t like using online tools": "Not Comfortable",
  "Just starting beginner": "Beginner",
  "I use Chatgpt Need to explore more": "Use ChatGPT",
  "I actively use multiple AI tools": "Use Multiple AI Tools",
  "I am an expert in AI - can do live projects": "AI Project Ready"
};

function labelFor(option: string) {
  return compactLabels[option] ?? option;
}

function displayTextFor(option: string) {
  return option.replace(/Digital Marketing/g, "AI Digital Marketing").replace(/digital marketing/g, "AI digital marketing");
}

function IconForOption({ option }: { option: string }) {
  if (/salary|income|growth/i.test(option)) return <TrendingUp size={22} />;
  if (/work-from-home|flexible|wfh/i.test(option)) return <Home size={22} />;
  if (/balance|family/i.test(option)) return <HeartHandshake size={22} />;
  if (/stable|long-term/i.test(option)) return <ShieldCheck size={22} />;
  if (/freelance|side/i.test(option)) return <Wallet size={22} />;
  if (/travel|aviation/i.test(option)) return <Plane size={22} />;
  if (/college|graduate|bachelor|master|diploma|phd/i.test(option)) return <GraduationCap size={22} />;
  if (/job|working|career|business|sales|retail|support|admin|office|hr/i.test(option)) return <BriefcaseBusiness size={22} />;
  if (/certification|certified/i.test(option)) return <BadgeCheck size={22} />;
  if (/social|media|instagram|facebook|youtube/i.test(option)) return <Megaphone size={22} />;
  if (/ads|ad |businesses make money|retarget|follow/i.test(option)) return <Search size={22} />;
  if (/design|creative|content|fashion/i.test(option)) return <Palette size={22} />;
  if (/tool|canva|platform|online/i.test(option)) return <MonitorSmartphone size={22} />;
  if (/chatgpt|ai/i.test(option)) return <Bot size={22} />;
  if (/learn|curious|thought|heard/i.test(option)) return <Lightbulb size={22} />;
  if (/202|year|before/i.test(option)) return <CalendarDays size={22} />;
  if (/try|step/i.test(option)) return <Clock size={22} />;
  if (/education|training|science|law|medical|engineering/i.test(option)) return <BookOpen size={22} />;
  return <Sparkles size={22} />;
}

export function OptionGrid({ options, value, onSelect, fullText = true, showIcons = true }: OptionGridProps) {
  return (
    <div className={`option-grid${!showIcons ? " option-grid--text-only" : ""}${fullText ? " option-grid--full-text" : ""}`}>
      {options.map((option) => (
        <button className={`option-card${value === option ? " option-card--active" : ""}${!showIcons ? " option-card--text-only" : ""}`} key={option} type="button" onClick={() => onSelect(option)}>
          {showIcons ? (
            <span className="option-card__icon">
              <IconForOption option={option} />
            </span>
          ) : null}
          <span className="option-card__label">{fullText ? displayTextFor(option) : labelFor(option)}</span>
          <span className="option-card__check">{value === option ? <CheckCircle2 size={20} /> : null}</span>
        </button>
      ))}
    </div>
  );
}

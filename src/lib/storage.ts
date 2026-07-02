import type { FitResult, FunnelSession, SurveyAnswers, UtmData } from "@/lib/types";

const SESSION_KEY = "aigs_dmsk_session";
const BACKUP_KEY = "aigs_dmsk_session_backup";

function id(prefix: string) {
  const random = crypto.getRandomValues(new Uint32Array(4)).join("");
  return `${prefix}_${Date.now().toString(36)}_${random}`;
}

function now() {
  return new Date().toISOString();
}

export function createOrLoadSession(utm: UtmData): FunnelSession {
  const existing = loadSession();
  if (existing) {
    const next = { ...existing, utm: { ...utm, ...existing.utm }, updated_at: now() };
    saveSession(next);
    return next;
  }

  const session: FunnelSession = {
    session_id: id("sess"),
    browser_id: id("browser"),
    created_at: now(),
    updated_at: now(),
    answers: {},
    utm,
    payment_status: "not_started"
  };
  saveSession(session);
  return session;
}

export function loadSession(): FunnelSession | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(SESSION_KEY) ?? localStorage.getItem(BACKUP_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as FunnelSession;
  } catch {
    return null;
  }
}

export function saveSession(session: FunnelSession) {
  if (typeof window === "undefined") return;
  const next = { ...session, updated_at: now() };
  const raw = JSON.stringify(next);
  sessionStorage.setItem(SESSION_KEY, raw);
  localStorage.setItem(BACKUP_KEY, raw);
}

export function saveAnswers(answers: SurveyAnswers) {
  const session = loadSession();
  if (!session) return;
  saveSession({ ...session, answers: { ...session.answers, ...answers } });
}

export function saveResult(result: FitResult) {
  const session = loadSession();
  if (!session) return;
  saveSession({ ...session, result });
}

export function ensureLeadId() {
  const session = loadSession();
  if (!session) return "";
  const lead_id = session.lead_id ?? id("lead");
  saveSession({ ...session, lead_id });
  return lead_id;
}

/**
 * Aramina backend client for the mobile app — a fetch-based mirror of the web
 * app's `src/lib/api.js`. Same endpoints, same response shapes. The bearer
 * token is read from `storage` on every request; a 401 clears the session.
 */
import { getItem, multiRemove, setItem, StorageKeys } from './storage';

/**
 * The Go API listens on :8086. From the iOS simulator `localhost` reaches the
 * host; the Android emulator must use 10.0.2.2. Override via API_BASE if you run
 * on a device (point it at your machine's LAN IP).
 */
export const API_BASE = 'http://37.152.186.82:8086';

let onUnauthorized: (() => void) | null = null;
/** Let AuthContext hook in so a 401 anywhere can drop the user back to login. */
export function setUnauthorizedHandler(fn: (() => void) | null) {
  onUnauthorized = fn;
}

type Query = Record<string, string | number | undefined>;

function buildUrl(path: string, query?: Query): string {
  const clean = path.startsWith('/') ? path.slice(1) : path;
  let url = `${API_BASE}/${clean}`;
  if (query) {
    const q = Object.entries(query)
      .filter(([, v]) => v !== undefined && v !== null)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join('&');
    if (q) url += `?${q}`;
  }
  return url;
}

async function request<T>(
  method: string,
  path: string,
  opts: { body?: unknown; query?: Query } = {},
): Promise<T> {
  const token = await getItem(StorageKeys.accessToken);
  const res = await fetch(buildUrl(path, opts.query), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });

  if (res.status === 401) {
    await multiRemove([StorageKeys.accessToken, StorageKeys.refreshToken]);
    onUnauthorized?.();
  }

  const text = await res.text();
  const data = text ? safeJson(text) : null;

  if (!res.ok) {
    const message =
      (data && (data.message || data.error)) || `خطای سرور (${res.status})`;
    throw new Error(message);
  }
  return data as T;
}

function safeJson(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// ---------- Auth ----------
export type Tokens = { access_token: string; refresh_token: string };
export type ApiUser = { id: string; nickname: string; phone?: string; role?: string };
export type LoginResponse = { tokens?: Tokens; user?: ApiUser };

export function loginUser(phone: string, password: string) {
  return request<LoginResponse>('POST', 'users/login', {
    body: { phone_number: phone, password_hash: password },
  });
}

export function registerUser(data: {
  nickname: string;
  password: string;
  phone: string;
  role?: string;
}) {
  return request<any>('POST', 'users/register', {
    body: {
      nickname: data.nickname,
      password_hash: data.password,
      phone: data.phone,
      role: data.role || 'user',
    },
  });
}

export function getUserProfile() {
  return request<{ user: ApiUser }>('GET', 'users/profile').catch(() => null);
}

// ---------- Mood ----------
export type TodayMood = { mood: number | null } | null;

export async function getTodayMood(): Promise<TodayMood> {
  try {
    return await request<TodayMood>('GET', 'journal/today-mood');
  } catch {
    return null;
  }
}

export function saveTodayMood(mood: number) {
  return request<any>('POST', 'journal/upsert-mood-add', { body: { mood } });
}

export type MoodTrend = { moods: number[]; days: number; streak: number };
export async function getMoodTrend(days = 14): Promise<MoodTrend> {
  try {
    return await request<MoodTrend>('GET', 'journal/mood-trend', { query: { days } });
  } catch {
    return { moods: [], days, streak: 0 };
  }
}

// ---------- Dashboard ----------
export type DashboardStats = {
  total_exercises: number;
  completed_exercises: number;
  progress_percent: number;
  journal_entries: number;
  streak: number;
  last_assessment_date: string | null;
  trauma_type: string | null;
};

export async function getDashboardStats(traumaType: string): Promise<DashboardStats> {
  try {
    return await request<DashboardStats>('GET', `dashboard/stats/${traumaType}`);
  } catch {
    return {
      total_exercises: 0,
      completed_exercises: 0,
      progress_percent: 0,
      journal_entries: 0,
      streak: 0,
      last_assessment_date: null,
      trauma_type: null,
    };
  }
}

// ---------- Assessment ----------
export type LatestAssessment = {
  trauma_type?: string;
  total_score?: number;
  assessment_id?: string;
  completed_at?: string;
  created_at?: string;
} | null;
export async function getLatestAssessment(): Promise<LatestAssessment> {
  try {
    return await request<LatestAssessment>('GET', 'assessment/latest');
  } catch {
    return null;
  }
}

export type AssessmentQuestion = { id: string | number; text: string };
export type AssessmentResult = {
  trauma_type: string;
  assessment_id: string;
  total_score: number;
};

export function startAssessment() {
  return request<{ assessment_info: { id: string } }>('POST', 'assessment/start');
}

export function getAssessmentQuestions() {
  return request<{ questions: AssessmentQuestion[] }>('GET', 'assessment/questions');
}

export async function submitAssessment(
  assessmentId: string,
  answers: Record<string, number>,
): Promise<AssessmentResult> {
  const res = await request<AssessmentResult>('POST', 'assessment/submit', {
    body: { assessment_id: assessmentId, answers },
  });
  if (res?.trauma_type) await setItem(StorageKeys.traumaType, res.trauma_type);
  return res;
}

export function getAssessmentResult(assessmentId: string) {
  return request<AssessmentResult>('GET', `assessment/result/${assessmentId}`);
}

// ---------- Exercises ----------
export type ExerciseInfo = {
  id: string;
  title: string;
  description?: string;
  duration?: number;
  trauma_type?: string;
  is_completed?: boolean;
  is_locked?: boolean;
  content?: string;
};
export type ExerciseItem = { exercise_info?: ExerciseInfo } & Partial<ExerciseInfo>;

export function getExercisesByTraumaType(traumaType: string) {
  return request<ExerciseItem[]>('GET', `exercises/by-trauma/${traumaType}`);
}

export async function getSuggestedExercises(limit = 2): Promise<ExerciseItem[]> {
  try {
    const traumaType = (await getItem(StorageKeys.traumaType)) || 'mild';
    const list = await getExercisesByTraumaType(traumaType);
    return (list || []).slice(0, limit);
  } catch {
    return [];
  }
}

export function getExerciseById(id: string) {
  return request<ExerciseItem>('GET', `exercises/by-id/${id}`);
}

export function completeExercise(id: string, traumaType: string) {
  return request<any>('POST', `exercises/${id}/complete`, {
    body: { trauma_type: traumaType },
  });
}

export type UserProgress = { completed_exercises: number; total_exercises: number };
export async function getUserProgress(traumaType: string): Promise<UserProgress> {
  try {
    return await request<UserProgress>('GET', 'exercises/user_progress', {
      query: { trauma_type: traumaType },
    });
  } catch {
    return { completed_exercises: 0, total_exercises: 0 };
  }
}

// ---------- Journal ----------
export type JournalEntry = {
  id: string;
  content: string;
  mood?: number;
  created_at?: string;
};

export async function getJournalEntries(page = 1, limit = 20) {
  const offset = (page - 1) * limit;
  return request<any>('GET', 'journal/user', { query: { limit, offset } });
}

export function createJournalEntry(content: string, mood: number) {
  return request<any>('POST', 'journal/create', { body: { content, mood } });
}

// ---------- Supervision (messages from the therapist / system) ----------
export type SupervisionMessage = {
  id: string;
  body: string;
  sender_name: string;
  is_auto: boolean;
  from_user: boolean; // true → the user themselves sent this (two-way chat)
  created_at: string;
};

/** Inbox: messages sent to the current user by their therapist or the system. */
export async function getSupervisionMessages(): Promise<SupervisionMessage[]> {
  try {
    const res = await request<{ messages: SupervisionMessage[] }>('GET', 'supervision/messages');
    return res?.messages || [];
  } catch {
    return [];
  }
}

/** Send a message from the current user to their therapist/companion (two-way chat). */
export async function sendSupervisionMessage(body: string): Promise<void> {
  await request<{ success: boolean }>('POST', 'supervision/messages', { body: { body } });
}

// ---------- Devices (push notifications) ----------
/** Register this device's FCM token so the backend can send push notifications. */
export function registerDevice(token: string, platform = 'android') {
  return request<{ success: boolean }>('POST', 'devices', {
    body: { token, platform },
  });
}

// ---------- Session helpers (used by AuthContext) ----------
export async function persistSession(res: LoginResponse) {
  if (res.tokens) {
    await setItem(StorageKeys.accessToken, res.tokens.access_token);
    await setItem(StorageKeys.refreshToken, res.tokens.refresh_token);
  }
  if (res.user) {
    await setItem(StorageKeys.userId, String(res.user.id));
    await setItem(StorageKeys.userName, res.user.nickname || '');
    await setItem(StorageKeys.userRole, res.user.role || '');
  }
}

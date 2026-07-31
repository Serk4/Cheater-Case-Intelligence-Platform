import { http } from './http';
import type {
  CaseData,
  CaseSummary,
  DashboardStats,
  LoginResponse,
  Game,
  Platform,
  AiAnalysis,
} from './types/case';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

// ─────────────────────────────────────────
// Auth
// ─────────────────────────────────────────
const auth = {
  login: (email: string, password: string): Promise<LoginResponse> =>
    http(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  signup: (
    email: string,
    password: string,
    displayName: string,
  ): Promise<LoginResponse> =>
    http(`${API_BASE}/auth/signup`, {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName }),
    }),

  me: (): Promise<{ id: string; email: string; displayName: string | null; role: string }> =>
    http(`${API_BASE}/users/me`),
};

// ─────────────────────────────────────────
// Cases
// ─────────────────────────────────────────
const cases = {
  list: (): Promise<CaseSummary[]> => http(`${API_BASE}/cases`),

  search: (params: Record<string, string>): Promise<CaseSummary[]> => {
    const qs = new URLSearchParams(params).toString();
    return http(`${API_BASE}/cases/search?${qs}`);
  },

  get: (caseId: string): Promise<CaseData> =>
    http(`${API_BASE}/cases/${caseId}`),

  create: (data: {
    title?: string;
    description?: string;
    gameId: string;
    subjectId: string;
    priority?: string;
    openedById?: string;
  }): Promise<CaseData> =>
    http(`${API_BASE}/cases`, { method: 'POST', body: JSON.stringify(data) }),

  update: (caseId: string, data: Partial<CaseData>): Promise<CaseData> =>
    http(`${API_BASE}/cases/${caseId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  transition: (caseId: string, newStatus: string, reason?: string) =>
    http(`${API_BASE}/cases/${caseId}/transition`, {
      method: 'POST',
      body: JSON.stringify({ newStatus, reason }),
    }),

  assign: (caseId: string, assignToId: string, reason?: string) =>
    http(`${API_BASE}/cases/${caseId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ assignToId, reason }),
    }),

  getValidStatuses: (caseId: string): Promise<string[]> =>
    http(`${API_BASE}/cases/${caseId}/valid-statuses`),

  addNote: (caseId: string, body: string, visibility = 'INTERNAL') =>
    http(`${API_BASE}/cases/${caseId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ body, visibility }),
    }),

  uploadEvidence: (caseId: string, formData: FormData) =>
    http(`${API_BASE}/cases/${caseId}/evidence`, {
      method: 'POST',
      body: formData,
    }),

  /** Aggregate stats for dashboard */
  stats: async (): Promise<DashboardStats> => {
    const all = await http<CaseSummary[]>(`${API_BASE}/cases`);
    const today = new Date().toDateString();
    return {
      total: all.length,
      open: all.filter((c) => c.status === 'OPEN').length,
      underReview: all.filter((c) => c.status === 'UNDER_REVIEW').length,
      escalated: all.filter((c) => c.status === 'ESCALATED').length,
      closedToday: all.filter(
        (c) =>
          c.status === 'CLOSED' &&
          new Date(c.createdAt).toDateString() === today,
      ).length,
    };
  },
};

// ─────────────────────────────────────────
// Reports (ingestion)
// ─────────────────────────────────────────
const reports = {
  ingest: (data: {
    caseId: string;
    reportedById: string;
    summary: string;
    detail?: string;
    incidentAt?: string;
    integrationSourceId?: string;
  }) =>
    http(`${API_BASE}/reports/ingest`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  list: () => http(`${API_BASE}/reports`),
};

// ─────────────────────────────────────────
// AI
// ─────────────────────────────────────────
const ai = {
  getConfig: (): Promise<{ aiEnabled: boolean }> =>
    http(`${API_BASE}/config`),

  analyzeCase: (caseId: string): Promise<AiAnalysis> =>
    http(`${API_BASE}/ai/analyze/case/${caseId}`, { method: 'POST' }),

  submitFeedback: (
    caseId: string,
    analysisId: string,
    decision: 'ACCEPTED' | 'MODIFIED' | 'REJECTED',
    note?: string,
  ) =>
    http(`${API_BASE}/ai/feedback/${analysisId}`, {
      method: 'POST',
      body: JSON.stringify({ caseId, decision, note }),
    }),
};

// ─────────────────────────────────────────
// Reference Data
// ─────────────────────────────────────────
const games = {
  list: (): Promise<Game[]> => http(`${API_BASE}/games`),
};

const platforms = {
  list: (): Promise<Platform[]> => http(`${API_BASE}/platforms`),
};

const users = {
  list: () => http<{ id: string; displayName: string | null; role: string; email: string }[]>(`${API_BASE}/users`),
};

export const apiClient = {
  auth,
  cases,
  reports,
  ai,
  games,
  platforms,
  users,
};


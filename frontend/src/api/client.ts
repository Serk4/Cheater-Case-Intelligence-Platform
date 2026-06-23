import { http } from './http';
import type { CaseData } from './types/case';

const API_BASE = (import.meta as any).env.VITE_API_BASE || 'http://localhost:3000';

export const apiClient = {
  uploadEvidence: (caseId: string, formData: FormData) =>
    http(`${API_BASE}/cases/${caseId}/evidence`, {
      method: 'POST',
      body: formData,
    }),

  getCase: (caseId: string): Promise<CaseData> =>
    http(`${API_BASE}/cases/${caseId}`),
};

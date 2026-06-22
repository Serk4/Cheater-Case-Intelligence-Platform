const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiClient = {
  uploadEvidence: async (caseId: string, formData: FormData) => {
    const response = await fetch(`${API_BASE}/cases/${caseId}/evidence`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Upload failed');
    return response.json();
  },

  getCase: async (caseId: string) => {
    const res = await fetch(`${API_BASE}/cases/${caseId}`);
    return res.json();
  }
};
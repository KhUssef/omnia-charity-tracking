import type { DashboardStats, Family, Visit, TraceabilityNode, VulnerabilityScore, VisitPlan, User, Aid, AidDistribution } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getToken(): string | null {
  return localStorage.getItem('omnia_token');
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    ...options,
  });
  if (!response.ok) {
    const isAuthCall = url.startsWith('/auth/');
    if (response.status === 401 && !isAuthCall) {
      localStorage.removeItem('omnia_token');
      localStorage.removeItem('omnia_user');
      window.location.href = '/login';
    }
    let message = `HTTP ${response.status}`;
    try {
      const body = await response.text();
      try {
        const parsed = JSON.parse(body) as { message?: string | string[] };
        if (Array.isArray(parsed.message)) message = parsed.message.join(', ');
        else if (parsed.message) message = parsed.message;
        else if (body) message = body;
      } catch {
        if (body) message = body;
      }
    } catch {
      /* keep default */
    }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

export const api = {
  // Dashboard
  getDashboardStats: () => fetchJson<DashboardStats>('/dashboard/stats'),

  // Families
  getFamilies: (search?: string, page?: number, limit?: number) =>
    fetchJson<{ data: Family[]; total: number; page: number; limit: number; totalPages: number }>(
      `/family?search=${encodeURIComponent(search || '')}&page=${page || 1}&limit=${limit || 50}`
    ),
  getFamily: (id: string) => fetchJson<Family>(`/family/${id}`),
  createFamily: (data: Partial<Family>) =>
    fetchJson<Family>('/family', {
      method: 'POST',
      body: JSON.stringify({
        lastName: data.lastName,
        address: data.address,
        phone: data.phone,
        numberOfMembers: data.numberOfMembers,
        containsDisabledMember: data.containsDisabledMember,
        containsElderlyMember: data.containsElderlyMember,
        containspupilMember: data.containspupilMember,
        notes: data.notes,
      }),
    }),
  updateFamily: (id: string, data: Partial<Family>) => fetchJson<Family>(`/family/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteFamily: (id: string) => fetchJson<void>(`/family/${id}`, { method: 'DELETE' }),

  // Aids
  getAids: () => fetchJson<Aid[]>('/aid'),
  createAid: (data: Partial<Aid> & { depositId?: string; quantity?: number }) =>
    fetchJson<Aid>('/aid', {
      method: 'POST',
      body: JSON.stringify({
        name: data.name,
        type: data.type || 'FOOD',
        description: data.description,
        quantity: data.quantity || 1,
        depositId: data.depositId,
      }),
    }),
  updateAid: (id: string, data: Partial<Aid> & { depositId?: string; quantity?: number }) =>
    fetchJson<Aid>(`/aid/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteAid: (id: string) => fetchJson<void>(`/aid/${id}`, { method: 'DELETE' }),

  getDeposits: () => fetchJson<{ id: string; name: string; city?: string }[]>('/deposits'),

  getAidDistributions: () => fetchJson<AidDistribution[]>('/aid-distribution'),
  createAidDistribution: (data: { aidId: string; familyId?: string; quantity?: number; notes?: string }) =>
    fetchJson<AidDistribution>('/aid-distribution', { method: 'POST', body: JSON.stringify(data) }),
  updateAidDistribution: (id: string, data: Partial<AidDistribution>) => fetchJson<AidDistribution>(`/aid-distribution/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteAidDistribution: (id: string) => fetchJson<void>(`/aid-distribution/${id}`, { method: 'DELETE' }),

  // Visits
  getVisits: () => fetchJson<Visit[]>('/visit'),
  createVisit: (data: Partial<Visit>) => fetchJson<Visit>('/visit', { method: 'POST', body: JSON.stringify(data) }),
  updateVisit: (id: string, data: Partial<Visit>) => fetchJson<Visit>(`/visit/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteVisit: (id: string) => fetchJson<void>(`/visit/${id}`, { method: 'DELETE' }),

  // Users
  getUsers: () => fetchJson<User[]>('/user'),
  updateUser: (id: string, data: Partial<User>) => fetchJson<User>(`/user/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteUser: (id: string) => fetchJson<void>(`/user/${id}`, { method: 'DELETE' }),

  // Admin
  getAdminSummary: () => fetchJson<{
    totalFamilies: number;
    pendingVisits: number;
    activeVisits: number;
    totalUsers: number;
    recentDistributions: AidDistribution[];
  }>('/admin/summary'),

  // Traceability
  getTraceability: (aidId?: string) =>
    fetchJson<TraceabilityNode[]>(`/traceability${aidId ? `?aidId=${aidId}` : ''}`),

  // Vulnerability
  getVulnerabilityScores: () => fetchJson<VulnerabilityScore[]>('/vulnerability'),

  // Visit Planning
  getVisitPlan: (workerLat?: number, workerLng?: number) =>
    fetchJson<VisitPlan[]>(`/visit-plan${workerLat !== undefined ? `?lat=${workerLat}&lng=${workerLng}` : ''}`),

  // Chatbot
  sendChatMessage: (message: string, history?: { role: string; content: string }[]) =>
    fetchJson<{ reply: string }>('/chatbot', {
      method: 'POST',
      body: JSON.stringify({ message, history }),
    }),

  // Auth
  login: async (email: string, password: string) => {
    const res = await fetchJson<{ access_token?: string; accessToken?: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return {
      ...res,
      access_token: res.access_token || res.accessToken || '',
      user: res.user,
    };
  },

  register: (name: string, email: string, password: string) =>
    fetchJson<{ access_token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  // Contact
  sendContactMessage: (data: { name: string; email: string; message: string }) =>
    fetchJson<{ success: boolean; id: string }>('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Profile
  changePassword: (oldPassword: string, newPassword: string) =>
    fetchJson<{ success: boolean }>('/user/me/password', {
      method: 'PATCH',
      body: JSON.stringify({ oldPassword, newPassword }),
    }),
};

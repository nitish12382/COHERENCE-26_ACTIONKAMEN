// ── Base ──────────────────────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "API error");
  }
  return res.json() as Promise<T>;
}

// ── Types ─────────────────────────────────────────────────────────────────────
export type LeadStatus = "New" | "Contacted" | "Replied" | "Follow-Up Sent" | "Converted";

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  industry: string;
  location: string;
  phone: string;
  linkedin: string;
  website: string;
  notes: string;
  batch: string;
  description: string;
  status: LeadStatus;
  score: number | null;
  created_at: string;
  updated_at: string;
}

export interface BatchInfo {
  batch: string;       // e.g. "batch_1"
  description: string; // user's custom label
  count: number;       // number of leads in this batch
}

export interface LeadsResponse {
  leads: Lead[];
  total: number;
}

export interface Campaign {
  id: string;
  name: string;
  workflow_id: string | null;
  lead_ids: string[];
  status: "active" | "paused" | "completed";
  leads: number;
  sent: number;
  replied: number;
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface WorkflowStep {
  type: "email" | "wait" | "followup" | "condition";
  label: string;
  detail: string;
  delay_days: number;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  target_audience: string;
  steps: WorkflowStep[];
  status: string;
  created_at: string;
  updated_at: string;
}

export interface MessageRequest {
  prompt: string;
  tone: "friendly" | "professional" | "persuasive";
  goal: "book-meeting" | "product-intro" | "demo";
  lead_name?: string;
  company?: string;
  industry?: string;
}

export interface MessageOut {
  message: string;
  tone: string;
  goal: string;
  generated_at: string;
}

export interface DashboardStats {
  stats: {
    total_leads: number;
    active_campaigns: number;
    replies_received: number;
    conversion_rate: number;
  };
  campaign_performance: { name: string; sent: number; replied: number; rate: number }[];
}

export interface ReplyTrendPoint {
  week: string;
  replies: number;
}

export interface FunnelPoint {
  stage: string;
  count: number;
}

// ── Leads API ─────────────────────────────────────────────────────────────────
export const leadsApi = {
  list: (params?: { search?: string; status?: string; batch?: string; skip?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set("search", params.search);
    if (params?.status && params.status !== "all") q.set("status", params.status);
    if (params?.batch) q.set("batch", params.batch);
    if (params?.skip !== undefined) q.set("skip", String(params.skip));
    if (params?.limit !== undefined) q.set("limit", String(params.limit));
    return request<LeadsResponse>(`/leads?${q}`);
  },
  create: (data: Omit<Lead, "id" | "status" | "score" | "created_at" | "updated_at">) =>
    request<Lead>("/leads", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Lead>) =>
    request<Lead>(`/leads/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/leads/${id}`, { method: "DELETE" }),
  getBatches: () => request<BatchInfo[]>("/leads/batches"),
  getNextBatch: () => request<{ batch: string }>("/leads/next-batch"),
  uploadCSV: (file: File, description: string) => {
    const form = new FormData();
    form.append("file", file);
    form.append("description", description);
    return fetch(`${BASE_URL}/leads/upload`, { method: "POST", body: form }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail ?? "Upload failed");
      }
      return res.json() as Promise<{ inserted: number; batch: string; message: string }>;
    });
  },
};

// ── Campaigns API ─────────────────────────────────────────────────────────────
export const campaignsApi = {
  list: () => request<Campaign[]>("/campaigns"),
  create: (data: { name: string; workflow_id?: string; lead_ids?: string[] }) =>
    request<Campaign>("/campaigns", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Campaign>) =>
    request<Campaign>(`/campaigns/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  pause: (id: string) => request<Campaign>(`/campaigns/${id}/pause`, { method: "PATCH" }),
  resume: (id: string) => request<Campaign>(`/campaigns/${id}/resume`, { method: "PATCH" }),
  stop: (id: string) => request<Campaign>(`/campaigns/${id}/stop`, { method: "PATCH" }),
  delete: (id: string) => request<void>(`/campaigns/${id}`, { method: "DELETE" }),
};

// ── Workflows API ─────────────────────────────────────────────────────────────
export const workflowsApi = {
  list: () => request<Workflow[]>("/workflows"),
  create: (data: Omit<Workflow, "id" | "status" | "created_at" | "updated_at">) =>
    request<Workflow>("/workflows", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Workflow>) =>
    request<Workflow>(`/workflows/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/workflows/${id}`, { method: "DELETE" }),
  getSchedule: (id: string) =>
    request<{ workflow_id: string; schedule: unknown[] }>(`/workflows/${id}/schedule`),
};

// ── Messages API ──────────────────────────────────────────────────────────────
export const messagesApi = {
  generate: (data: MessageRequest) =>
    request<MessageOut>("/messages/generate", { method: "POST", body: JSON.stringify(data) }),
  recent: (limit = 10) => request<unknown[]>(`/messages/recent?limit=${limit}`),
};

// ── Analytics API ─────────────────────────────────────────────────────────────
export const analyticsApi = {
  dashboard: () => request<DashboardStats>("/analytics/dashboard"),
  replyTrend: () => request<ReplyTrendPoint[]>("/analytics/reply-trend"),
  funnel: () => request<FunnelPoint[]>("/analytics/funnel"),
};

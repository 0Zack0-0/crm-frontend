const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";


// ─── Helpers ──────────────────────────────────────────────────
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function request<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.error || res.statusText, body.details);
  }

  return res.json();
}

export class ApiError extends Error {
  status: number;
  details?: string;
  constructor(status: number, message: string, details?: string) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

// ─── Auth ─────────────────────────────────────────────────────
export const auth = {
  register: (email: string, password: string, full_name: string) =>
    request<{ data: { user: AuthUser; session: Session; message: string } }>(
      "/auth/register",
      { method: "POST", body: JSON.stringify({ email, password, full_name }) }
    ),

  login: (email: string, password: string) =>
    request<{ data: { user: AuthUser; session: Session } }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  me: () => request<{ data: UserProfile }>("/auth/me"),

  logout: () => request("/auth/logout", { method: "POST" }),

  refresh: (refresh_token: string) =>
    request<{ data: Session }>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token }),
    }),
};

// ─── Plans ────────────────────────────────────────────────────
export const plans = {
  list: () => request<{ data: Plan[] }>("/plans"),
};

// ─── Tenants ──────────────────────────────────────────────────
export const tenants = {
  list: () => request<{ data: Tenant[] }>("/tenants"),

  create: (name: string, plan_id: string) =>
    request<{ data: { tenant: Tenant; plan: { id: string; name: string }; message: string } }>(
      "/tenants",
      { method: "POST", body: JSON.stringify({ name, plan_id }) }
    ),

  subscription: (tenantId: string) =>
    request<{ data: Subscription }>(`/tenants/${tenantId}/subscription`),
};

// ─── Invitations ──────────────────────────────────────────────
export const invitations = {
  list: () => request<{ data: Invitation[] }>("/invitations"),
  accept: (id: string) => request(`/invitations/${id}/accept`, { method: "POST" }),
  reject: (id: string) => request(`/invitations/${id}/reject`, { method: "POST" }),
};

// ─── Companies ────────────────────────────────────────────────
export const companies = {
  list: (tenantId: string) =>
    request<{ data: Company[] }>(`/tenants/${tenantId}/companies`),

  get: (tenantId: string, id: string) =>
    request<{ data: Company }>(`/tenants/${tenantId}/companies/${id}`),

  create: (tenantId: string, body: Partial<Company>) =>
    request<{ data: Company }>(`/tenants/${tenantId}/companies`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  update: (tenantId: string, id: string, body: Partial<Company>) =>
    request<{ data: Company }>(`/tenants/${tenantId}/companies/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  delete: (tenantId: string, id: string) =>
    request(`/tenants/${tenantId}/companies/${id}`, { method: "DELETE" }),
};

// ─── Contacts ─────────────────────────────────────────────────
export const contacts = {
  list: (tenantId: string) =>
    request<{ data: Contact[] }>(`/tenants/${tenantId}/contacts`),

  get: (tenantId: string, id: string) =>
    request<{ data: Contact }>(`/tenants/${tenantId}/contacts/${id}`),

  create: (tenantId: string, body: Partial<Contact>) =>
    request<{ data: Contact }>(`/tenants/${tenantId}/contacts`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  update: (tenantId: string, id: string, body: Partial<Contact>) =>
    request<{ data: Contact }>(`/tenants/${tenantId}/contacts/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  delete: (tenantId: string, id: string) =>
    request(`/tenants/${tenantId}/contacts/${id}`, { method: "DELETE" }),
};

// ─── Deals ────────────────────────────────────────────────────
export const deals = {
  list: (tenantId: string) =>
    request<{ data: Deal[] }>(`/tenants/${tenantId}/deals`),

  get: (tenantId: string, id: string) =>
    request<{ data: Deal }>(`/tenants/${tenantId}/deals/${id}`),

  create: (tenantId: string, body: Partial<Deal>) =>
    request<{ data: Deal }>(`/tenants/${tenantId}/deals`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  update: (tenantId: string, id: string, body: Partial<Deal>) =>
    request<{ data: Deal }>(`/tenants/${tenantId}/deals/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  delete: (tenantId: string, id: string) =>
    request(`/tenants/${tenantId}/deals/${id}`, { method: "DELETE" }),
};

// ─── Pipeline ─────────────────────────────────────────────────
export const pipeline = {
  list: (tenantId: string) =>
    request<{ data: PipelineStage[] }>(`/tenants/${tenantId}/pipeline-stages`),
};

// ─── Activities ───────────────────────────────────────────────
export const activities = {
  list: (tenantId: string) =>
    request<{ data: Activity[] }>(`/tenants/${tenantId}/activities`),

  getDetail: (tenantId: string, id: string) =>
    request<{ data: ActivityDetail }>(`/tenants/${tenantId}/activities/${id}`),

  create: (tenantId: string, body: Partial<Activity>) =>
    request<{ data: Activity }>(`/tenants/${tenantId}/activities`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  update: (tenantId: string, id: string, body: Partial<Activity>) =>
    request<{ data: Activity }>(`/tenants/${tenantId}/activities/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  delete: (tenantId: string, id: string) =>
    request(`/tenants/${tenantId}/activities/${id}`, { method: "DELETE" }),
};

export const activityComments = {
  list: (tenantId: string, activityId: string) =>
    request<{ data: ActivityComment[] }>(
      `/tenants/${tenantId}/activities/${activityId}/comments`
    ),

  create: (tenantId: string, activityId: string, text: string) =>
    request<{ data: ActivityComment }>(
      `/tenants/${tenantId}/activities/${activityId}/comments`,
      {
        method: "POST",
        body: JSON.stringify({ text }),
      }
    ),

  update: (
    tenantId: string,
    activityId: string,
    commentId: string,
    text: string
  ) =>
    request<{ data: ActivityComment }>(
      `/tenants/${tenantId}/activities/${activityId}/comments/${commentId}`,
      {
        method: "PUT",
        body: JSON.stringify({ text }),
      }
    ),

  delete: (tenantId: string, activityId: string, commentId: string) =>
    request(
      `/tenants/${tenantId}/activities/${activityId}/comments/${commentId}`,
      {
        method: "DELETE",
      }
    ),
};

export const activityTags = {
  list: (tenantId: string) =>
    request<{ data: ActivityTag[] }>(`/tenants/${tenantId}/activity-tags`),

  create: (tenantId: string, name: string, color?: string) =>
    request<{ data: ActivityTag }>(`/tenants/${tenantId}/activity-tags`, {
      method: "POST",
      body: JSON.stringify({ name, color }),
    }),

  addToActivity: (tenantId: string, activityId: string, tagId: string) =>
    request<{ data: { activity_id: string; tag_id: string } }>(
      `/tenants/${tenantId}/activities/${activityId}/tags`,
      {
        method: "POST",
        body: JSON.stringify({ tag_id: tagId }),
      }
    ),

  removeFromActivity: (tenantId: string, activityId: string, tagId: string) =>
    request(
      `/tenants/${tenantId}/activities/${activityId}/tags/${tagId}`,
      { method: "DELETE" }
    ),
};

// ─── Dashboard ────────────────────────────────────────────────
export const dashboard = {
  metrics: (tenantId: string) =>
    request<{ data: DashboardMetrics }>(`/tenants/${tenantId}/dashboard/metrics`),
};

// ─── Team ─────────────────────────────────────────────────────
export const team = {
  list: (tenantId: string) =>
    request<{ data: TeamMember[] }>(`/tenants/${tenantId}/team`),

  invite: (tenantId: string, email: string, role: string) =>
    request<{ data: TeamMember }>(`/tenants/${tenantId}/team/invite`, {
      method: "POST",
      body: JSON.stringify({ email, role }),
    }),

  remove: (tenantId: string, memberId: string) =>
    request(`/tenants/${tenantId}/team/${memberId}`, { method: "DELETE" }),

  updateRole: (tenantId: string, memberId: string, role: string) =>
    request<{ data: TeamMember }>(`/tenants/${tenantId}/team/${memberId}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),
};

// ─── Settings ─────────────────────────────────────────────────
export const settings = {
  get: (tenantId: string) =>
    request<{ data: TenantSettings }>(`/tenants/${tenantId}/settings`),

  updateName: (tenantId: string, name: string) =>
    request<{ data: { id: string; name: string; slug: string } }>(
      `/tenants/${tenantId}/settings/name`,
      { method: "PUT", body: JSON.stringify({ name }) }
    ),

  changePlan: (tenantId: string, planId: string) =>
    request<{ data: unknown }>(`/tenants/${tenantId}/settings/plan`, {
      method: "POST",
      body: JSON.stringify({ planId }),
    }),
};

// ─── Types ────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  tenants: Tenant[];
  pending_invitations: number;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  max_users: number;
  max_contacts: number;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  role: string;
  joined_at?: string;
  created_at?: string;
}

export interface Subscription {
  id: string;
  status: string;
  start_date: string;
  end_date?: string;
  plan?: Plan;
}

export interface Invitation {
  id: string;
  tenant_id: string;
  role: string;
  invited_email: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  tenant: { id: string; name: string };
}

export interface Company {
  id: string;
  tenant_id: string;
  name: string;
  nif?: string;
  industry?: string;
  domain?: string;
  contact_name?: string;
  contact_role?: string;
  email?: string;
  phone?: string;
  demo_preference?: string;
  privacy_accepted?: boolean;
  marketing_accepted?: boolean;
  notes?: string;
  website?: string;
  country?: string;
  created_at: string;
}

export interface Contact {
  id: string;
  tenant_id: string;
  company_id?: string;
  first_name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  job_title?: string;
  notes?: string;
  created_at: string;
}

export interface Deal {
  id: string;
  tenant_id: string;
  name: string;
  company_id?: string;
  contact_id?: string;
  stage_id?: string;
  value: number;
  priority?: "low" | "medium" | "high";
  status: "open" | "won" | "lost";
  lost_reason?: string;
  expected_close_date?: string;
  created_at: string;
}

export interface PipelineStage {
  id: string;
  tenant_id: string;
  name: string;
  position: number;
}

export interface Activity {
  id: string;
  tenant_id: string;
  type: "note" | "call" | "meeting" | "task";
  title?: string;
  description?: string;
  due_date?: string;
  completed: boolean;
  deal_id?: string;
  contact_id?: string;
  company_id?: string;
  created_at: string;
  updated_at?: string;
  created_by?: string | { id: string; full_name: string; email: string };
  tags?: ActivityTag[];
}

export interface ActivityComment {
  id: string;
  activity_id: string;
  author_id: string;
  text: string;
  created_at: string;
  updated_at?: string;
  author?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export interface ActivityTag {
  id: string;
  tenant_id?: string;
  name: string;
  color?: string;
  created_at?: string;
}

export interface ActivityDetail extends Omit<Activity, "created_by"> {
  created_by?: { id: string; full_name: string; email: string };
  contact?: Contact;
  company?: Company;
  deal?: Deal;
  comments?: ActivityComment[];
  tags?: ActivityTag[];
}

export interface DashboardMetrics {
  total_companies: number;
  total_contacts: number;
  total_deals: number;
  pipeline_value: number;
  deals_won: number;
  deals_lost: number;
  deals_open: number;
  recent_activities: Activity[];
}

export interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  status: string;
  invited_email?: string;
  created_at: string;
  profile?: { full_name: string; email: string };
}

export interface TenantSettings {
  tenant: { id: string; name: string; slug: string; created_at: string };
  subscription: Subscription | null;
  plans: Plan[];
  memberCount: number;
}

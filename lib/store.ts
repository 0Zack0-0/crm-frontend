import { create } from "zustand";
import {
  auth as authApi,
  tenants as tenantsApi,
  type UserProfile,
  type Tenant,
  type Subscription,
} from "./api";

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: UserProfile | null;
  currentTenant: Tenant | null;
  subscription: Subscription | null;
  loading: boolean;

  // Actions
  setSession: (accessToken: string, refreshToken: string) => void;
  setUser: (user: UserProfile) => void;
  setCurrentTenant: (tenant: Tenant) => void;
  setSubscription: (subscription: Subscription | null) => void;
  fetchUser: () => Promise<UserProfile | null>;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  refreshToken: null,
  user: null,
  currentTenant: null,
  subscription: null,
  loading: true,

  setSession: (accessToken, refreshToken) => {
    localStorage.setItem("token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);
    set({ token: accessToken, refreshToken });
  },

  setUser: (user) => set({ user }),

  setCurrentTenant: (tenant) => {
    localStorage.setItem("current_tenant_id", tenant.id);
    set({ currentTenant: tenant });

    tenantsApi
      .subscription(tenant.id)
      .then(({ data }) => {
        set({ subscription: data });
      })
      .catch(() => {
        set({ subscription: null });
      });
  },

  setSubscription: (subscription) => set({ subscription }),

  fetchUser: async () => {
    try {
      const { data } = await authApi.me();
      set({ user: data, loading: false });

      // Auto-select tenant
      const savedTenantId = localStorage.getItem("current_tenant_id");
      const current = get().currentTenant;

      if (!current && data.tenants.length > 0) {
        const match = data.tenants.find((t) => t.id === savedTenantId);
        const tenantToUse = match || data.tenants[0];

        set({ currentTenant: tenantToUse });

        tenantsApi
          .subscription(tenantToUse.id)
          .then(({ data }) => {
            set({ subscription: data });
          })
          .catch(() => {
            set({ subscription: null });
          });
      } else if (current) {
        tenantsApi
          .subscription(current.id)
          .then(({ data }) => {
            set({ subscription: data });
          })
          .catch(() => {
            set({ subscription: null });
          });
      }

      return data;
    } catch {
      set({ loading: false, subscription: null });
      return null;
    }
  },

  logout: () => {
    authApi.logout().catch(() => {});
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("current_tenant_id");
    set({
      token: null,
      refreshToken: null,
      user: null,
      currentTenant: null,
      subscription: null,
    });
  },

  hydrate: () => {
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refresh_token");

    if (token) {
      set({ token, refreshToken });
      get().fetchUser();
    } else {
      set({ loading: false, subscription: null });
    }
  },
}));
import { create } from "zustand";
import { api } from "../lib/api";

export type UserRole = "admin" | "faculty" | "student";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roll_no?: string;
  semester?: number;
  course_name?: string;
  course_id?: string;
  department?: string;
  profile_id?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<User>;
  fetchMe: () => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

// ─── Helpers ──────────────────────────────────────────
function loadStoredUser(): User | null {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function loadStoredToken(): string | null {
  const token = localStorage.getItem("token");
  // Reject old mock tokens from previous version
  if (token && token.startsWith("demo-token-")) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    return null;
  }
  return token;
}

// ─── Store ────────────────────────────────────────────
export const useAuthStore = create<AuthState>((set, get) => ({
  user: loadStoredUser(),
  token: loadStoredToken(),
  isLoading: false,
  isInitialized: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.post<{ token: string; user: User }>("/auth/login", {
        email,
        password,
      });

      if (response.success) {
        const { token, user } = response.data;

        // Persist token in API client + localStorage
        api.setToken(token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("role", user.role);

        set({ user, token, isLoading: false, isInitialized: true, error: null });
        return user;
      } else {
        throw new Error((response as any).error || "Login failed");
      }
    } catch (err: any) {
      const errorMsg = err.message || "An unexpected error occurred during login.";
      set({ isLoading: false, error: errorMsg });
      throw err;
    }
  },

  fetchMe: async () => {
    const token = loadStoredToken();

    // No token → initialise as guest immediately
    if (!token) {
      set({ isInitialized: true, user: null, token: null });
      return;
    }

    // Hydrate the API client
    api.setToken(token);

    try {
      const response = await api.get<User>("/auth/me");

      if (response.success && response.data) {
        const user = response.data;
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("role", user.role);
        set({ user, token, isInitialized: true });
      } else {
        // Token was invalid — clear everything quietly
        get().logout();
      }
    } catch {
      // Network error or invalid token — fall back to stored user if available
      const storedUser = loadStoredUser();
      if (storedUser) {
        // Keep the user logged in with cached data (offline-friendly)
        set({ user: storedUser, token, isInitialized: true });
      } else {
        get().logout();
      }
    }
  },

  logout: () => {
    api.setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    set({ user: null, token: null, error: null, isInitialized: true });
  },

  clearError: () => set({ error: null }),
}));

// ─── Role helpers ─────────────────────────────────────
export const isAdmin = (user: User | null) => user?.role === "admin";
export const isFaculty = (user: User | null) => user?.role === "faculty";
export const isStudent = (user: User | null) => user?.role === "student";

export const getRoleDashboardPath = (role: string): string => {
  switch (role) {
    case "admin": return "/admin";
    case "faculty": return "/faculty";
    case "student": return "/student";
    default: return "/login";
  }
};

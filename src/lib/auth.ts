// ─── Auth Module (Full-Stack) ─────────────────────────────────
// Now backed by the real MongoDB API.
// Falls back to legacy localStorage for DX when API is unavailable.

import { User, UserRole } from './mockData';
import { authAPI, setToken, removeToken, getToken } from './apiClient';

const AUTH_KEY = 'kaamon_auth';

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

// ─── Read auth state from localStorage ───────────────────────
export const getAuthState = (): AuthState => {
  if (typeof window === 'undefined') {
    return { isAuthenticated: false, user: null };
  }
  const auth = localStorage.getItem(AUTH_KEY);
  if (!auth) return { isAuthenticated: false, user: null };
  try {
    return JSON.parse(auth);
  } catch {
    return { isAuthenticated: false, user: null };
  }
};

// ─── Save auth state to localStorage ─────────────────────────
export const saveAuthState = (user: User | null) => {
  if (!user) {
    localStorage.removeItem(AUTH_KEY);
    removeToken();
    return;
  }
  const state: AuthState = { isAuthenticated: true, user };
  localStorage.setItem(AUTH_KEY, JSON.stringify(state));
};

export const updateAuthStateUser = (userUpdates: Partial<User>) => {
  const current = getAuthState();
  if (current.isAuthenticated && current.user) {
    const updated = { ...current.user, ...userUpdates };
    saveAuthState(updated);
    return updated;
  }
  return null;
};

// ─── Login (calls real API) ───────────────────────────────────
export const login = async (
  email: string,
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    const res = await authAPI.login(email, password);
    if (res.success && res.user) {
      setToken(res.token);
      const user: User = {
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        role: res.user.role as UserRole,
        phone: res.user.phone,
        address: res.user.address,
        avatar: res.user.avatar,
      };
      saveAuthState(user);
      return { success: true, user };
    }
    return { success: false, error: 'Login failed' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Login failed';
    return { success: false, error: message };
  }
};

// ─── Register (calls real API) ────────────────────────────────
export const signup = async (
  name: string,
  email: string,
  password: string,
  role: UserRole,
  phone: string,
  extraData?: {
    address?: string;
    service?: string;
    hourlyRate?: number;
    experience?: string;
    skills?: string;
    description?: string;
    avatar?: string;
  }
): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    const res = await authAPI.register({ name, email, password, role, phone, ...extraData });
    if (res.success && res.user) {
      setToken(res.token);
      const user: User = {
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        role: res.user.role as UserRole,
        phone: res.user.phone,
        address: res.user.address,
        avatar: res.user.avatar,
      };
      saveAuthState(user);
      return { success: true, user };
    }
    return { success: false, error: 'Signup failed' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Signup failed';
    return { success: false, error: message };
  }
};

// ─── Logout ───────────────────────────────────────────────────
export const logout = () => {
  localStorage.removeItem(AUTH_KEY);
  removeToken();
};

// ─── Verify token with backend ────────────────────────────────
export const refreshAuthFromServer = async (): Promise<boolean> => {
  const token = getToken();
  if (!token) return false;
  try {
    const res = await authAPI.me();
    if (res.success && res.user) {
      const user: User = {
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        role: res.user.role as UserRole,
        phone: res.user.phone,
        address: res.user.address,
        avatar: res.user.avatar,
      };
      saveAuthState(user);
      return true;
    }
    return false;
  } catch {
    return false;
  }
};
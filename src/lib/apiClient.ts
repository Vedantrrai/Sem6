// ─── KaamOn Frontend API Client ─────────────────────────────
// Centralised fetch wrapper that:
//   1. Automatically attaches the JWT from localStorage
//   2. Handles JSON parsing + error extraction
//   3. Provides typed helpers for every API endpoint

const API_BASE = '/api';

// ─── Token helpers ────────────────────────────────────────────
const TOKEN_KEY = 'kaamon_token';

export const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = () => {
    localStorage.removeItem(TOKEN_KEY);
};

// ─── Base fetch ───────────────────────────────────────────────
async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
    };

    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || `Request failed with status ${res.status}`);
    }

    return data as T;
}

// ─── Auth API ─────────────────────────────────────────────────
export interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'worker' | 'admin';
    phone: string;
    address?: string;
    avatar?: string;
}

export interface AuthResponse {
    success: boolean;
    token: string;
    user: UserProfile;
    message?: string;
}

export const authAPI = {
    register: (data: {
        name: string;
        email: string;
        password: string;
        role: string;
        phone: string;
        address?: string;
        service?: string;
        hourlyRate?: number;
        experience?: string;
        skills?: string;
        description?: string;
        avatar?: string;
    }) =>
        apiFetch<AuthResponse>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    login: (email: string, password: string) =>
        apiFetch<AuthResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),

    me: () => apiFetch<{ success: boolean; user: UserProfile }>('/auth/me'),
};

// ─── Workers API ──────────────────────────────────────────────
export interface WorkerData {
    id: string;
    _id?: string;
    name: string;
    service: string;
    rating: number;
    reviews: number;
    hourlyRate: number;
    experience: string;
    avatar: string;
    skills: string[];
    availability: 'Available' | 'Busy';
    completedJobs: number;
    description?: string;
}

export const workersAPI = {
    getAll: (params?: {
        service?: string;
        availability?: string;
        search?: string;
        sort?: string;
        limit?: number;
        userId?: string;
    }) => {
        const qs = params
            ? '?' + new URLSearchParams(
                Object.entries(params)
                    .filter(([, v]) => v !== undefined && v !== '')
                    .map(([k, v]) => [k, String(v)])
            ).toString()
            : '';
        return apiFetch<{ success: boolean; count: number; workers: WorkerData[] }>(
            `/workers${qs}`
        );
    },

    getById: (id: string) =>
        apiFetch<{ success: boolean; worker: WorkerData }>(`/workers/${id}`),

    create: (data: Partial<WorkerData>) =>
        apiFetch<{ success: boolean; worker: WorkerData }>('/workers', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    update: (id: string, data: Partial<WorkerData>) =>
        apiFetch<{ success: boolean; worker: WorkerData }>(`/workers/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
};

// ─── Bookings API ─────────────────────────────────────────────
export interface BookingData {
    id: string;
    _id?: string;
    userId: string | { _id: string; name: string; email: string; phone: string };
    workerId: string | { _id: string; name: string; service: string; hourlyRate: number; avatar: string; rating: number };
    serviceType: string;
    date: string;
    time: string;
    address: string;
    notes?: string;
    paymentMethod: 'cod';
    status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
    amount: number;
    createdAt?: string;
}

export const bookingsAPI = {
    getAll: (params?: { status?: string }) => {
        const qs = params?.status ? `?status=${params.status}` : '';
        return apiFetch<{ success: boolean; count: number; bookings: BookingData[] }>(
            `/bookings${qs}`
        );
    },

    getById: (id: string) =>
        apiFetch<{ success: boolean; booking: BookingData }>(`/bookings/${id}`),

    create: (data: {
        workerId: string;
        date: string;
        time: string;
        address: string;
        notes?: string;
        amount?: number;
    }) =>
        apiFetch<{ success: boolean; booking: BookingData; message: string }>('/bookings', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    updateStatus: (id: string, status: BookingData['status']) =>
        apiFetch<{ success: boolean; booking: BookingData; message: string }>(
            `/bookings/${id}`,
            {
                method: 'PATCH',
                body: JSON.stringify({ status }),
            }
        ),
};

// ─── Admin API ────────────────────────────────────────────────
export const adminAPI = {
    getStats: () =>
        apiFetch<{
            success: boolean;
            stats: {
                totalUsers: number;
                totalWorkers: number;
                totalBookings: number;
                totalRevenue: number;
                availableWorkers: number;
                statusBreakdown: Record<string, number>;
                recentBookings: BookingData[];
            };
        }>('/admin/stats'),
};

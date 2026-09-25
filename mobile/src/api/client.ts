import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { API_BASE, REQUEST_TIMEOUT_MS } from './config';
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from './tokenStore';

/** Shape every endpoint returns (server/utils/ApiResponsive.js). */
export interface ApiEnvelope<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

/** Called when refresh fails and the user must sign in again. */
type LogoutHandler = () => void;
let onSessionExpired: LogoutHandler = () => {};
export function setSessionExpiredHandler(fn: LogoutHandler) {
  onSessionExpired = fn;
}

export const http: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: REQUEST_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
});

http.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

/**
 * Single-flight refresh: if several requests 401 at once we refresh once and
 * let them all wait on the same promise, instead of firing N refresh calls.
 */
let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  try {
    // Bare axios: using `http` here would recurse through this interceptor.
    const res = await axios.post<ApiEnvelope<{ accessToken: string; refreshToken?: string }>>(
      `${API_BASE}/users/refresh-token`,
      { refreshToken },
      { timeout: REQUEST_TIMEOUT_MS, headers: { 'Content-Type': 'application/json' } },
    );
    const next = res.data?.data?.accessToken;
    if (!next) return null;
    await setTokens(next, res.data.data.refreshToken);
    return next;
  } catch {
    return null;
  }
}

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string; errors?: unknown }>) => {
    const original = error.config as (AxiosRequestConfig & { _retried?: boolean }) | undefined;
    const status = error.response?.status;

    // Network / timeout — no response at all.
    if (!error.response) {
      throw new ApiError(
        'Could not reach the server. Check your connection and try again.',
        0,
      );
    }

    const isAuthEndpoint =
      original?.url?.includes('/users/login') ||
      original?.url?.includes('/users/refresh-token') ||
      original?.url?.includes('/users/register');

    if (status === 401 && original && !original._retried && !isAuthEndpoint) {
      original._retried = true;

      refreshInFlight = refreshInFlight ?? refreshAccessToken();
      const newToken = await refreshInFlight;
      refreshInFlight = null;

      if (newToken) {
        original.headers = { ...original.headers, Authorization: `Bearer ${newToken}` };
        return http.request(original);
      }

      await clearTokens();
      onSessionExpired();
    }

    throw new ApiError(
      error.response.data?.message || 'Something went wrong. Please try again.',
      status ?? 0,
      error.response.data?.errors,
    );
  },
);

/** Unwraps the envelope so callers deal in plain data. */
export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const res = await http.request<ApiEnvelope<T>>(config);
  return res.data.data;
}

export const api = {
  get: <T>(url: string, params?: Record<string, unknown>) =>
    request<T>({ method: 'GET', url, params }),
  post: <T>(url: string, data?: unknown) => request<T>({ method: 'POST', url, data }),
  patch: <T>(url: string, data?: unknown) => request<T>({ method: 'PATCH', url, data }),
  delete: <T>(url: string) => request<T>({ method: 'DELETE', url }),
};

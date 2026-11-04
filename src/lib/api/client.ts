const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const AUTH_EVENT = 'amonet:auth-changed';

export class ApiError extends Error {
  constructor(
    public status: number,
    public error: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function handleUnauthorized() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('amonet_user');
  window.dispatchEvent(new Event(AUTH_EVENT));
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  const opts: RequestInit = {
    ...options,
    credentials: 'include',
    signal: options?.signal || controller.signal,
  };

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers,
      ...opts,
    });

    if (!res.ok) {
      if (res.status === 401) {
        handleUnauthorized();
      }

      const body = await res.json().catch(() => ({}));
      throw new ApiError(
        res.status,
        body.error || 'UNKNOWN_ERROR',
        body.message || `HTTP ${res.status}`,
      );
    }

    if (res.status === 204) return undefined as T;
    return res.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

export function get<T>(path: string): Promise<T> {
  return request<T>(path);
}

export function post<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'POST', body: JSON.stringify(body) });
}

export function put<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'PUT', body: JSON.stringify(body) });
}

export function patch<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'PATCH', body: JSON.stringify(body) });
}

export function del<T = void>(path: string): Promise<T> {
  return request<T>(path, { method: 'DELETE' });
}

export async function requestFormData<T>(path: string, formData: FormData, method = 'POST'): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    credentials: 'include',
    body: formData,
  });

  if (!res.ok) {
    if (res.status === 401) {
      handleUnauthorized();
    }

    const body = await res.json().catch(() => ({}));
    throw new ApiError(
      res.status,
      body.error || 'UNKNOWN_ERROR',
      body.message || `HTTP ${res.status}`,
    );
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

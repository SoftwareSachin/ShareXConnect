import { useAuthStore } from './auth';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown,
  options: { skipAuth?: boolean } = {}
): Promise<Response> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (!options.skipAuth) {
    const token = useAuthStore.getState().token;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new ApiError(response.status, errorData.message || 'Request failed');
  }

  return response;
}

export async function apiGet<T>(url: string): Promise<T> {
  const response = await apiRequest('GET', url);
  return response.json();
}

export async function apiPost<T>(url: string, data?: unknown): Promise<T> {
  const response = await apiRequest('POST', url, data);
  return response.json();
}

export async function apiPatch<T>(url: string, data?: unknown): Promise<T> {
  const response = await apiRequest('PATCH', url, data);
  return response.json();
}

export async function apiDelete(url: string): Promise<void> {
  await apiRequest('DELETE', url);
}

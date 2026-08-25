import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000';
const TOKEN_KEY = 'relationship_tracker_access_token';

export async function setToken(token: string) { await SecureStore.setItemAsync(TOKEN_KEY, token); }
export async function getToken() { return SecureStore.getItemAsync(TOKEN_KEY); }
export async function clearToken() { await SecureStore.deleteItemAsync(TOKEN_KEY); }

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error ?? `request_failed_${response.status}`);
  return body as T;
}

export const auth = {
  register: (input: { email: string; password: string; displayName: string }) => api<{ user: User; accessToken: string }>('/v1/auth/register', { method: 'POST', body: JSON.stringify(input) }),
  login: (input: { email: string; password: string }) => api<{ user: User; accessToken: string }>('/v1/auth/login', { method: 'POST', body: JSON.stringify(input) }),
  me: () => api<{ user: User }>('/v1/me'),
};

export interface User { id: string; email: string; displayName: string; }

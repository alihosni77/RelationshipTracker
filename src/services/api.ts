import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://127.0.0.1:4000';
const TOKEN_KEY = 'relationship_tracker_access_token';
const isWeb = typeof document !== 'undefined';

async function setStoredToken(token: string) {
  if (isWeb) {
    window.localStorage.setItem(TOKEN_KEY, token);
    return;
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

async function getStoredToken() {
  if (isWeb) return window.localStorage.getItem(TOKEN_KEY);
  return SecureStore.getItemAsync(TOKEN_KEY);
}

async function removeStoredToken() {
  if (isWeb) {
    window.localStorage.removeItem(TOKEN_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function setToken(token: string) { await setStoredToken(token); }
export async function getToken() { return getStoredToken(); }
export async function clearToken() { await removeStoredToken(); }

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');
  if (options.body) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw new Error('network_unavailable');
  }

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof body?.error === 'string' ? body.error : `request_failed_${response.status}`;
    throw new Error(message);
  }
  return body as T;
}

export const auth = {
  register: (input: { email: string; password: string; displayName: string }) =>
    api<{ user: User; accessToken: string }>('/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  login: (input: { email: string; password: string }) =>
    api<{ user: User; accessToken: string }>('/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  me: () => api<{ user: User }>('/v1/me'),
};

export interface User { id: string; email: string; displayName: string; }

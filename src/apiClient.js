// Centralized API helper
const API_BASE = import.meta.env.VITE_API_URL || "https://api.cofarmer.africa/api";

export function apiUrl(path) {
  if (path.startsWith('http')) return path;
  const base = API_BASE || '/api';
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
}

export async function apiFetch(path, { method = 'GET', token, body, headers: extraHeaders } = {}) {
  const headers = { 'Content-Type': 'application/json', ...(extraHeaders || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(apiUrl(path), { method, headers, body: body ? JSON.stringify(body) : undefined });
  let data = null; try { data = await res.json(); } catch { }
  if (!res.ok) {
    const error = new Error(data?.message || 'Request failed');
    error.status = res.status; error.data = data; throw error;
  }
  return data;
}

export function createApi(tokenGetter) {
  return {
    get: (p) => apiFetch(p, { token: tokenGetter() }),
    post: (p, b) => apiFetch(p, { method: 'POST', body: b, token: tokenGetter() }),
    put: (p, b) => apiFetch(p, { method: 'PUT', body: b, token: tokenGetter() }),
    del: (p) => apiFetch(p, { method: 'DELETE', token: tokenGetter() })
  };
}


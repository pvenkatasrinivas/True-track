// One small function per auth endpoint (see API_REFERENCE.md).
import { request } from './api.js';

// POST /api/auth/register -> { token, user }
export function register(name, email, password) {
  return request('/api/auth/register', {
    method: 'POST',
    body: { name, email, password },
    auth: false,
  });
}

// POST /api/auth/login -> { token, user }
export function login(email, password) {
  return request('/api/auth/login', {
    method: 'POST',
    body: { email, password },
    auth: false,
  });
}

// GET /api/auth/me -> the logged-in user
export function getCurrentUser() {
  return request('/api/auth/me');
}

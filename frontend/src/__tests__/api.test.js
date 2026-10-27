// Tests for the request() helper. fetch is replaced with a fake, so no network is used.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { request, API_BASE_URL, TOKEN_KEY, USER_KEY, LOGIN_MESSAGE_KEY } from '../services/api.js';

// Builds a fake fetch Response.
function fakeResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(body === undefined ? '' : JSON.stringify(body)),
  };
}

describe('request()', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('returns parsed JSON and sends the Bearer token', async () => {
    localStorage.setItem(TOKEN_KEY, 'abc123');
    const fetchMock = vi.fn().mockResolvedValue(fakeResponse(200, [{ id: 1, title: 'Task' }]));
    vi.stubGlobal('fetch', fetchMock);

    const data = await request('/api/tasks');

    expect(data).toEqual([{ id: 1, title: 'Task' }]);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(`${API_BASE_URL}/api/tasks`);
    expect(options.headers.Authorization).toBe('Bearer abc123');
  });

  it('returns null for 204 No Content', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(fakeResponse(204)));
    await expect(request('/api/tasks/1', { method: 'DELETE' })).resolves.toBeNull();
  });

  it('throws an error with message, status and fieldErrors from the backend', async () => {
    const backendError = {
      timestamp: '2026-10-27T05:30:00Z',
      status: 400,
      error: 'Bad Request',
      message: 'Validation failed',
      path: '/api/tasks',
      fieldErrors: { title: 'Title must be between 3 and 100 characters' },
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(fakeResponse(400, backendError)));

    let thrown;
    try {
      await request('/api/tasks', { method: 'POST', body: { title: 'a' } });
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(Error);
    expect(thrown.status).toBe(400);
    expect(thrown.message).toBe('Validation failed');
    expect(thrown.fieldErrors).toEqual({ title: 'Title must be between 3 and 100 characters' });
  });

  it('uses an empty fieldErrors object when the backend sends none', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(fakeResponse(404, { status: 404, message: 'Task not found with id 99' }))
    );

    await expect(request('/api/tasks/99')).rejects.toMatchObject({
      status: 404,
      message: 'Task not found with id 99',
      fieldErrors: {},
    });
  });

  it('shows a friendly message when the server cannot be reached', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    await expect(request('/api/tasks')).rejects.toMatchObject({
      status: 0,
      message: `Cannot connect to the server. Is the backend running on ${API_BASE_URL}?`,
    });
  });

  it('on 401 clears the login and keeps the backend message for the login page', async () => {
    localStorage.setItem(TOKEN_KEY, 'expired-token');
    localStorage.setItem(USER_KEY, JSON.stringify({ id: 1, name: 'Ravi' }));
    const message = 'Your session has expired. Please log in again.';
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(fakeResponse(401, { status: 401, message })));
    // jsdom cannot really navigate, so replace window.location with a simple fake.
    const assign = vi.fn();
    vi.stubGlobal('location', { pathname: '/tasks', assign });

    await expect(request('/api/tasks')).rejects.toMatchObject({ status: 401, message });

    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(USER_KEY)).toBeNull();
    expect(sessionStorage.getItem(LOGIN_MESSAGE_KEY)).toBe(message);
    expect(assign).toHaveBeenCalledWith('/login');
  });

  it('does not redirect on 401 for public calls like login', async () => {
    const message = 'Invalid email or password';
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(fakeResponse(401, { message })));
    const assign = vi.fn();
    vi.stubGlobal('location', { pathname: '/login', assign });

    await expect(
      request('/api/auth/login', { method: 'POST', body: {}, auth: false })
    ).rejects.toMatchObject({ status: 401, message });

    expect(assign).not.toHaveBeenCalled();
    expect(sessionStorage.getItem(LOGIN_MESSAGE_KEY)).toBeNull();
  });
});

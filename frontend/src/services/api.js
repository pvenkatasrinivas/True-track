// Small wrapper around fetch() that every service file uses.
// It adds the base URL, the JSON headers and the login token,
// and turns backend error responses into normal JavaScript errors.

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Keys we use in the browser's storage.
export const TOKEN_KEY = 'trueTrackToken';
export const USER_KEY = 'trueTrackUser';
export const LOGIN_MESSAGE_KEY = 'trueTrackLoginMessage'; // message shown once on the login page

/**
 * Send a request to the backend.
 *
 * @param {string} path    e.g. "/api/tasks"
 * @param {object} options { method, body, auth }
 *   - method: "GET" (default), "POST", "PUT", "PATCH", "DELETE"
 *   - body:   a plain object, sent as JSON
 *   - auth:   true (default) sends the Bearer token; use false for login/register
 * @returns the parsed JSON response, or null when there is no body (e.g. 204)
 * @throws  Error with .status, .message and .fieldErrors
 */
export async function request(path, options = {}) {
  const { method = 'GET', body, auth = true } = options;

  const headers = { Accept: 'application/json' };
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const token = localStorage.getItem(TOKEN_KEY);
  if (auth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(API_BASE_URL + path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    // fetch() only throws when the server could not be reached at all.
    const error = new Error(
      `Cannot connect to the server. Is the backend running on ${API_BASE_URL}?`
    );
    error.status = 0;
    error.fieldErrors = {};
    throw error;
  }

  const data = await readJson(response);

  if (!response.ok) {
    const error = new Error((data && data.message) || defaultMessage(response.status));
    error.status = response.status;
    error.fieldErrors = (data && data.fieldErrors) || {};

    // Token missing, wrong or expired: log the user out and go to the login page.
    if (response.status === 401 && auth) {
      handleUnauthorized(error.message);
    }
    throw error;
  }

  return data;
}

// Read the response body as JSON. Returns null for empty bodies (like 204 No Content).
async function readJson(response) {
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    return null; // body was not JSON (e.g. an HTML error page)
  }
}

// Used when the backend sends an error without a "message" field.
function defaultMessage(status) {
  if (status === 401) return 'Please log in to continue.';
  if (status === 403) return 'You are not allowed to do this.';
  if (status === 404) return 'The requested item was not found.';
  if (status >= 500) return 'Something went wrong on the server. Please try again later.';
  return `Request failed with status ${status}.`;
}

// Clear the saved login and send the user to /login.
// The message is kept in sessionStorage so the login page can show it.
function handleUnauthorized(message) {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.setItem(LOGIN_MESSAGE_KEY, message);

  if (window.location.pathname !== '/login') {
    window.location.assign('/login');
  }
}

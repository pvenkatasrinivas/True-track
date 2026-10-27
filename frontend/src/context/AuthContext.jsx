// Keeps the logged-in user and token, and shares them with the whole app.
import { createContext, useContext, useState } from 'react';
import * as authService from '../services/authService.js';
import { TOKEN_KEY, USER_KEY } from '../services/api.js';

const AuthContext = createContext(null);

// Read the saved user from localStorage (it is stored as a JSON string).
function loadSavedUser() {
  try {
    const saved = localStorage.getItem(USER_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(loadSavedUser);

  // Save the login so it survives a page refresh.
  function saveLogin(authResponse) {
    localStorage.setItem(TOKEN_KEY, authResponse.token);
    localStorage.setItem(USER_KEY, JSON.stringify(authResponse.user));
    setToken(authResponse.token);
    setUser(authResponse.user);
    return authResponse.user;
  }

  async function login(email, password) {
    const response = await authService.login(email, password);
    return saveLogin(response);
  }

  // The backend logs the new user in straight away (it returns a token).
  async function register(name, email, password) {
    const response = await authService.register(name, email, password);
    return saveLogin(response);
  }

  // Logging out only means forgetting the token on this browser.
  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }

  const value = {
    user,
    token,
    isLoggedIn: Boolean(token),
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Use this in any component: const { user, logout } = useAuth();
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return context;
}

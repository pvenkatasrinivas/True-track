import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import { LOGIN_MESSAGE_KEY } from '../services/api.js';

// LoginPage needs the router and the auth context around it.
function renderLoginPage() {
  return render(
    <MemoryRouter
      initialEntries={['/login']}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('shows validation errors when submitted empty', () => {
    renderLoginPage();

    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));

    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });

  it('shows an error for an invalid email', () => {
    renderLoginPage();

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'not-an-email' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));

    expect(screen.getByText('Please enter a valid email')).toBeInTheDocument();
  });

  it('shows the "session expired" message saved by the API helper', () => {
    sessionStorage.setItem(LOGIN_MESSAGE_KEY, 'Your session has expired. Please log in again.');
    renderLoginPage();

    expect(screen.getByText('Your session has expired. Please log in again.')).toBeInTheDocument();
  });

  it('has a link to the register page', () => {
    renderLoginPage();
    expect(screen.getByRole('link', { name: 'Create an account' })).toHaveAttribute('href', '/register');
  });
});

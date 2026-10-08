import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HeroBugSnippet } from '../components/HeroBugSnippet';
import { HomeRoute } from '../routes/HomeRoute';
import { LoginRoute } from '../routes/LoginRoute';
import { SignupRoute } from '../routes/SignupRoute';
import { App } from '../App';
import { AuthClient } from '../services/authClient';

describe('Bug Hunt Arena: Visual Identity & Landing/Auth Flows', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('HeroBugSnippet (Click-the-Bug Interaction)', () => {
    it('reveals wavy squiggle and explanation when clicking the buggy line', () => {
      render(<HeroBugSnippet />);

      const bugLine = screen.getByLabelText(/Line 4: discount = cart_total \* percent_off/i);
      expect(bugLine).toBeInTheDocument();

      fireEvent.click(bugLine);

      // Squiggle class should be applied
      const squiggledText = bugLine.querySelector('.diagnostic-squiggle');
      expect(squiggledText).toBeInTheDocument();

      // Explanation status panel should appear
      expect(
        screen.getByText(/Bug found: multiplies by percent directly instead of dividing by 100/i)
      ).toBeInTheDocument();
    });

    it('explains normal behavior without squiggle when clicking a non-buggy line', () => {
      render(<HeroBugSnippet />);

      const normalLine = screen.getByLabelText(/Line 2: if percent_off <= 0:/i);
      fireEvent.click(normalLine);

      // Squiggle should NOT be present
      const squiggledText = normalLine.querySelector('.diagnostic-squiggle');
      expect(squiggledText).toBeNull();

      // Informational status panel should describe what it does
      expect(
        screen.getByText(/Guard clause checking for zero or negative discount inputs/i)
      ).toBeInTheDocument();
    });

    it('supports keyboard navigation via Enter key to activate guess', () => {
      render(<HeroBugSnippet />);

      const bugLine = screen.getByLabelText(/Line 4: discount = cart_total \* percent_off/i);
      fireEvent.keyDown(bugLine, { key: 'Enter', code: 'Enter' });

      expect(
        screen.getByText(/Bug found: multiplies by percent directly instead of dividing by 100/i)
      ).toBeInTheDocument();
    });
  });

  describe('HomeRoute', () => {
    it('renders hero title, primary and secondary buttons, and How it works sequence', () => {
      const onPlayGuest = vi.fn();
      const onNavigateSignup = vi.fn();
      const onNavigateLogin = vi.fn();

      render(
        <HomeRoute
          onPlayGuest={onPlayGuest}
          onNavigateSignup={onNavigateSignup}
          onNavigateLogin={onNavigateLogin}
        />
      );

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'Find the bug in 8 lines of code.'
      );

      const playGuestBtn = screen.getByRole('button', { name: /Play as guest/i });
      fireEvent.click(playGuestBtn);
      expect(onPlayGuest).toHaveBeenCalledTimes(1);

      const createAccBtn = screen.getByRole('button', { name: /Create account/i });
      fireEvent.click(createAccBtn);
      expect(onNavigateSignup).toHaveBeenCalledTimes(1);

      // Verify How it works sequence (1, 2, 3)
      expect(screen.getByText(/Pick a language and level/i)).toBeInTheDocument();
      expect(screen.getByText(/Hunt the bug/i)).toBeInTheDocument();
      expect(screen.getByText(/Learn why it happened/i)).toBeInTheDocument();
      expect(screen.getByText(/Fairness guarantee/i)).toBeInTheDocument();
    });
  });

  describe('LoginRoute', () => {
    it('validates on blur and on submit, linking errors via aria-describedby', async () => {
      const onSuccess = vi.fn();
      const onNavigateSignup = vi.fn();
      const onContinueGuest = vi.fn();

      render(
        <LoginRoute
          onSuccess={onSuccess}
          onNavigateSignup={onNavigateSignup}
          onContinueGuest={onContinueGuest}
        />
      );

      const emailInput = screen.getByLabelText(/Email address/i);
      const passwordInput = screen.getByLabelText(/^Password/i);
      const submitBtn = screen.getByRole('button', { name: /^Log in$/i });

      // Blur with empty email
      fireEvent.focus(emailInput);
      fireEvent.blur(emailInput);
      expect(screen.getByText(/Please enter your email address/i)).toBeInTheDocument();
      expect(emailInput).toHaveAttribute('aria-invalid', 'true');
      expect(emailInput.getAttribute('aria-describedby')).toContain('login-email-error');

      // Submit with empty fields
      fireEvent.click(submitBtn);
      expect(screen.getByText(/Please enter your password/i)).toBeInTheDocument();
      expect(passwordInput).toHaveAttribute('aria-invalid', 'true');
    });

    it('supports show/hide password toggle', () => {
      render(
        <LoginRoute onSuccess={vi.fn()} onNavigateSignup={vi.fn()} onContinueGuest={vi.fn()} />
      );

      const passwordInput = screen.getByLabelText(/^Password/i) as HTMLInputElement;
      const toggleBtn = screen.getByRole('button', { name: /Show password/i });

      expect(passwordInput.type).toBe('password');
      fireEvent.click(toggleBtn);
      expect(passwordInput.type).toBe('text');
      expect(screen.getByRole('button', { name: /Hide password/i })).toBeInTheDocument();
    });

    it('shows generic credential error without revealing email existence when login fails', async () => {
      vi.spyOn(AuthClient, 'login').mockRejectedValue(new Error('Invalid email or password credentials.'));

      render(
        <LoginRoute onSuccess={vi.fn()} onNavigateSignup={vi.fn()} onContinueGuest={vi.fn()} />
      );

      fireEvent.change(screen.getByLabelText(/Email address/i), {
        target: { value: 'unknown@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/^Password/i), {
        target: { value: 'secret123' },
      });

      fireEvent.click(screen.getByRole('button', { name: /^Log in$/i }));

      await waitFor(() => {
        expect(
          screen.getByText(/Invalid email or password credentials. Please check your entries and try again/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('SignupRoute', () => {
    it('shows live checklist updating for password requirements', () => {
      render(
        <SignupRoute onSuccess={vi.fn()} onNavigateLogin={vi.fn()} onContinueGuest={vi.fn()} />
      );

      const passwordInput = screen.getByLabelText(/^Password$/i);
      const minLengthRule = screen.getByText(/At least 6 characters/i);
      const numberRule = screen.getByText(/At least one number/i);

      // Initially neither is satisfied
      expect(minLengthRule.previousSibling?.textContent).toBe('○');
      expect(numberRule.previousSibling?.textContent).toBe('○');

      // Type 6 letters with no number
      fireEvent.change(passwordInput, { target: { value: 'abcdef' } });
      expect(minLengthRule.previousSibling?.textContent).toBe('✓');
      expect(numberRule.previousSibling?.textContent).toBe('○');

      // Add a number
      fireEvent.change(passwordInput, { target: { value: 'abcdef1' } });
      expect(minLengthRule.previousSibling?.textContent).toBe('✓');
      expect(numberRule.previousSibling?.textContent).toBe('✓');
    });

    it('detects guest progress in localStorage and offers migration checkbox', () => {
      localStorage.setItem('bughunt_user_xp_v1', '350');

      render(
        <SignupRoute onSuccess={vi.fn()} onNavigateLogin={vi.fn()} onContinueGuest={vi.fn()} />
      );

      expect(screen.getByText(/Keep my guest progress/i)).toBeInTheDocument();
    });
  });

  describe('App View Routing', () => {
    it('renders home on /, login on /login, and signup on /signup', () => {
      const { rerender } = render(<App initialPath="/" />);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'Find the bug in 8 lines of code.'
      );

      rerender(<App initialPath="/login" />);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Log in');

      rerender(<App initialPath="/signup" />);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Create account');
    });
  });
});

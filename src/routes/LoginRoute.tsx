import React, { useState } from 'react';
import { TextField } from '../components/ui/TextField';
import { PasswordField } from '../components/ui/PasswordField';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { AuthClient, AuthUser } from '../services/authClient';

export interface LoginRouteProps {
  onSuccess: (user: AuthUser) => void;
  onNavigateSignup: () => void;
  onContinueGuest: () => void;
}

export const LoginRoute: React.FC<LoginRouteProps> = ({
  onSuccess,
  onNavigateSignup,
  onContinueGuest,
}) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [generalError, setGeneralError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const validateEmail = (val: string): string => {
    const trimmed = val.trim();
    if (!trimmed) {
      return 'Please enter your email address.';
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmed)) {
      return 'Enter a valid email format, such as name@example.com.';
    }
    return '';
  };

  const validatePassword = (val: string): string => {
    if (!val) {
      return 'Please enter your password.';
    }
    return '';
  };

  const handleBlurEmail = () => {
    setEmailError(validateEmail(email));
  };

  const handleBlurPassword = () => {
    setPasswordError(validatePassword(password));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);

    setEmailError(emailErr);
    setPasswordError(passwordErr);

    if (emailErr || passwordErr) {
      return;
    }

    setIsLoading(true);
    try {
      const user = await AuthClient.login(email, password);
      onSuccess(user);
    } catch {
      // Never reveal whether the email exists
      setGeneralError('Invalid email or password credentials. Please check your entries and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main
      id="main-content"
      style={{
        padding: 'var(--space-8) var(--space-4)',
        maxWidth: '440px',
        margin: '0 auto',
        width: '100%',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--surface-panel)',
          border: '1px solid var(--border-neutral)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-6)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-h2)',
            fontWeight: 700,
            color: 'var(--ink)',
            margin: '0 0 var(--space-2) 0',
            letterSpacing: '-0.02em',
          }}
        >
          Log in
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--ink-muted)',
            margin: '0 0 var(--space-6) 0',
          }}
        >
          Access your solved puzzles, streaks, and custom topic skill ratings.
        </p>

        {generalError && (
          <Alert type="error" title="Could not log in">
            {generalError}
          </Alert>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <TextField
            id="login-email"
            label="Email address"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError('');
            }}
            onBlur={handleBlurEmail}
            error={emailError}
            placeholder="learner@example.com"
            disabled={isLoading}
          />

          <PasswordField
            id="login-password"
            label="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (passwordError) setPasswordError('');
            }}
            onBlur={handleBlurPassword}
            error={passwordError}
            disabled={isLoading}
          />

          <Button type="submit" variant="primary" fullWidth isLoading={isLoading} style={{ marginTop: 'var(--space-2)' }}>
            Log in
          </Button>
        </form>

        <div
          style={{
            marginTop: 'var(--space-6)',
            paddingTop: 'var(--space-4)',
            borderTop: '1px solid var(--border-neutral)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
            alignItems: 'center',
            fontSize: 'var(--text-sm)',
          }}
        >
          <div>
            <span style={{ color: 'var(--ink-muted)' }}>Need an account? </span>
            <button
              type="button"
              onClick={onNavigateSignup}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--ink)',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Create account
            </button>
          </div>

          <button
            type="button"
            onClick={onContinueGuest}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--ink-muted)',
              cursor: 'pointer',
            }}
          >
            Continue as guest
          </button>
        </div>
      </div>
    </main>
  );
};

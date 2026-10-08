import React, { useState } from 'react';
import { TextField } from '../components/ui/TextField';
import { PasswordField } from '../components/ui/PasswordField';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { AuthClient, AuthUser, inspectGuestProgress } from '../services/authClient';

export interface SignupRouteProps {
  onSuccess: (user: AuthUser) => void;
  onNavigateLogin: () => void;
  onContinueGuest: () => void;
}

export const SignupRoute: React.FC<SignupRouteProps> = ({
  onSuccess,
  onNavigateLogin,
  onContinueGuest,
}) => {
  const [displayName, setDisplayName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const guestSummary = inspectGuestProgress();
  const [keepGuestProgress, setKeepGuestProgress] = useState<boolean>(guestSummary.hasProgress);

  const [nameError, setNameError] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [generalError, setGeneralError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Live password validation checks
  const hasMinLength = password.length >= 6;
  const hasNumber = /\d/.test(password);

  const validateName = (val: string): string => {
    if (!val.trim()) return 'Please enter your display name.';
    return '';
  };

  const validateEmail = (val: string): string => {
    const trimmed = val.trim();
    if (!trimmed) return 'Please enter your email address.';
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmed)) return 'Enter a valid email format, like name@example.com.';
    return '';
  };

  const validatePassword = (val: string): string => {
    if (val.length < 6) return 'Password must be at least 6 characters.';
    if (!/\d/.test(val)) return 'Password must contain at least one number.';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    const nErr = validateName(displayName);
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);

    setNameError(nErr);
    setEmailError(eErr);
    setPasswordError(pErr);

    if (nErr || eErr || pErr) return;

    setIsLoading(true);
    try {
      const user = await AuthClient.signup(email, password, keepGuestProgress);
      onSuccess(user);
    } catch (err: any) {
      setGeneralError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main
      id="main-content"
      style={{
        padding: 'var(--space-8) var(--space-4)',
        maxWidth: '460px',
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
          Create account
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--ink-muted)',
            margin: '0 0 var(--space-6) 0',
          }}
        >
          Save your solved bugs, maintain daily streaks, and sync skill ratings.
        </p>

        {generalError && (
          <Alert type="error" title="Could not create account">
            {generalError}
          </Alert>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <TextField
            id="signup-name"
            label="Display name"
            type="text"
            autoComplete="name"
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value);
              if (nameError) setNameError('');
            }}
            onBlur={() => setNameError(validateName(displayName))}
            error={nameError}
            placeholder="Alex Dev"
            disabled={isLoading}
          />

          <TextField
            id="signup-email"
            label="Email address"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError('');
            }}
            onBlur={() => setEmailError(validateEmail(email))}
            error={emailError}
            placeholder="learner@example.com"
            disabled={isLoading}
          />

          <PasswordField
            id="signup-password"
            label="Password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (passwordError) setPasswordError('');
            }}
            onBlur={() => setPasswordError(validatePassword(password))}
            error={passwordError}
            disabled={isLoading}
          />

          {/* Live password rule checklist */}
          <div
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border-neutral)',
              borderRadius: 'var(--radius-md)',
              padding: '0.625rem 0.75rem',
              marginBottom: 'var(--space-4)',
              fontSize: 'var(--text-caption)',
              fontFamily: 'var(--font-body)',
            }}
            aria-label="Password requirements"
          >
            <div style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>
              Password rules
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div
                style={{
                  color: hasMinLength ? 'var(--diagnostic-pass)' : 'var(--ink-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>{hasMinLength ? '✓' : '○'}</span>
                <span>At least 6 characters</span>
              </div>
              <div
                style={{
                  color: hasNumber ? 'var(--diagnostic-pass)' : 'var(--ink-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>{hasNumber ? '✓' : '○'}</span>
                <span>At least one number</span>
              </div>
            </div>
          </div>

          {/* Guest progress migration checkbox */}
          {guestSummary.hasProgress && (
            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--space-2)',
                marginBottom: 'var(--space-4)',
                cursor: 'pointer',
                fontSize: 'var(--text-sm)',
                color: 'var(--ink)',
              }}
            >
              <input
                type="checkbox"
                checked={keepGuestProgress}
                onChange={(e) => setKeepGuestProgress(e.target.checked)}
                style={{ marginTop: '3px' }}
              />
              <span>
                Keep my guest progress ({guestSummary.totalXP} XP, streak: {guestSummary.currentStreak})
              </span>
            </label>
          )}

          <Button type="submit" variant="primary" fullWidth isLoading={isLoading} style={{ marginTop: 'var(--space-2)' }}>
            Create account
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
            <span style={{ color: 'var(--ink-muted)' }}>Already have an account? </span>
            <button
              type="button"
              onClick={onNavigateLogin}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--ink)',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Log in
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

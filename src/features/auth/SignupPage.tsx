import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  validateEmail,
  validatePassword,
  validateFullName,
  validatePasswordConfirmation,
} from '@/lib/validation';
import { mapFirebaseAuthError } from '@/services/authService';
import styles from './Auth.module.css';

export const SignupPage: React.FC = () => {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setFormError('');
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      console.error('[SignupPage] Google sign-up error:', err);
      const code = (err as { code?: string })?.code;
      const message = err instanceof Error ? err.message : String(err);
      if (code) {
        setFormError(mapFirebaseAuthError(code));
      } else if (message.includes('auth/')) {
        const codeMatch = message.match(/auth\/[a-zA-Z0-9-]+/);
        setFormError(mapFirebaseAuthError(codeMatch ? codeMatch[0] : ''));
      } else {
        setFormError(message);
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const nameCheck = validateFullName(fullName);
    const emailCheck = validateEmail(email);
    const passCheck = validatePassword(password);
    const confirmCheck = validatePasswordConfirmation(password, confirmPassword);

    setNameError(nameCheck.error || '');
    setEmailError(emailCheck.error || '');
    setPasswordError(passCheck.error || '');
    setConfirmError(confirmCheck.error || '');

    if (
      !nameCheck.isValid ||
      !emailCheck.isValid ||
      !passCheck.isValid ||
      !confirmCheck.isValid
    ) {
      return;
    }

    setIsLoading(true);

    try {
      await register(fullName, email, password);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      console.error('[SignupPage] Registration error:', err);
      const code = (err as { code?: string })?.code;
      const message = err instanceof Error ? err.message : String(err);
      if (code) {
        setFormError(mapFirebaseAuthError(code));
      } else if (message.includes('auth/')) {
        const codeMatch = message.match(/auth\/[a-zA-Z0-9-]+/);
        setFormError(mapFirebaseAuthError(codeMatch ? codeMatch[0] : ''));
      } else {
        setFormError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <Card className={styles.authCard}>
        <div className={styles.header}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <img src="/codexpertai-logo.png" alt="CodeXpertai" style={{ height: '48px', width: 'auto', objectFit: 'contain' }} />
          </div>
          <h1 className={styles.title}>Create your Account</h1>
          <p className={styles.subtitle}>
            Join CodeXpertai to begin structured coding practice and mock technical interviews.
          </p>
        </div>

        {formError && (
          <div className={styles.errorBanner} role="alert">
            <AlertCircle size={16} />
            <span>{formError}</span>
          </div>
        )}

        {/* Continue with Google */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading || isGoogleLoading}
          className={styles.googleBtn}
          aria-label="Continue with Google"
        >
          <svg className={styles.googleIcon} width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.17 0 9.99 0 12s.46 3.83 1.26 5.42l4.02-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>{isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
        </button>

        <div className={styles.divider} aria-hidden="true">
          <span className={styles.dividerLine}></span>
          <span className={styles.dividerText}>or register with email</span>
          <span className={styles.dividerLine}></span>
        </div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <Input
            label="Full Name"
            type="text"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (nameError) setNameError('');
            }}
            placeholder="Ada Lovelace"
            error={nameError}
            autoComplete="name"
            required
            disabled={isLoading}
          />

          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError('');
            }}
            placeholder="student@example.com"
            error={emailError}
            autoComplete="email"
            required
            disabled={isLoading}
          />

          <Input
            label="Password"
            isPassword
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (passwordError) setPasswordError('');
            }}
            placeholder="••••••••"
            error={passwordError}
            helperText="Min. 8 characters with uppercase, lowercase, and numeric digits."
            autoComplete="new-password"
            required
            disabled={isLoading}
          />

          <Input
            label="Confirm Password"
            isPassword
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (confirmError) setConfirmError('');
            }}
            placeholder="••••••••"
            error={confirmError}
            autoComplete="new-password"
            required
            disabled={isLoading}
          />

          <div className={styles.securityNote}>
            <ShieldCheck size={14} />
            <span>Default role: <strong>student</strong>. Privileged roles require backend assignment.</span>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className={styles.submitBtn}
          >
            Create Account
          </Button>

          <div className={styles.termsConsent}>
            By creating an account, you agree to our{' '}
            <Link to="/terms" target="_blank" rel="noopener noreferrer">Terms and Conditions</Link>
            {' '}and{' '}
            <Link to="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</Link>.
          </div>
        </form>

        <div className={styles.footerNote}>
          Already registered?{' '}
          <Link to="/login" className={styles.authLink}>
            Sign in instead
          </Link>
        </div>
      </Card>
    </div>
  );
};

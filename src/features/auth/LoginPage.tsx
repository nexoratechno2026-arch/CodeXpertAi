import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SEOHead } from '@/components/seo/SEOHead';
import { validateEmail, validatePassword } from '@/lib/validation';
import { mapFirebaseAuthError } from '@/services/authService';
import styles from './Auth.module.css';

export const LoginPage: React.FC = () => {
  const { login, loginWithGoogle, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Forgot password state
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setFormError('');
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
      const destination = (location.state as { from?: Location })?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } catch (err: unknown) {
      console.error('[LoginPage] Google sign in error:', err);
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

    const emailCheck = validateEmail(email);
    const passCheck = validatePassword(password);

    setEmailError(emailCheck.error || '');
    setPasswordError(passCheck.error || '');

    if (!emailCheck.isValid || !passCheck.isValid) {
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);
      const destination = (location.state as { from?: Location })?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } catch (err: unknown) {
      console.error('[LoginPage] Sign in error:', err);
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

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    const check = validateEmail(resetEmail);
    if (!check.isValid) {
      setResetError(check.error || 'Please enter a valid email address.');
      return;
    }

    setResetLoading(true);
    try {
      await resetPassword(resetEmail);
      setResetSuccess('Password reset link sent! Please check your inbox.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setResetError(message);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <SEOHead noindex={true} title="Sign In — CodeXpertAI" description="Sign in to your CodeXpertAI account." />
      <Card className={styles.authCard}>
        <div className={styles.header}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <img src="/codexpertai-logo.png" alt="CodeXpertAI" style={{ height: '48px', width: 'auto', objectFit: 'contain' }} />
          </div>
          <h1 className={styles.title}>Sign in to CodeXpert<span style={{ color: '#3B82F6' }}>AI</span></h1>
          <p className={styles.subtitle}>
            Access your unified CodeLab practice &amp; InterviewAI workspace.
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
          <span className={styles.dividerText}>or continue with email</span>
          <span className={styles.dividerLine}></span>
        </div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
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

          <div className={styles.passwordField}>
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
              autoComplete="current-password"
              required
              disabled={isLoading}
            />
            <div className={styles.forgotRow}>
              <button
                type="button"
                className={styles.forgotBtn}
                onClick={() => {
                  setResetEmail(email);
                  setShowResetModal(true);
                }}
              >
                Forgot password?
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className={styles.submitBtn}
          >
            Sign In
          </Button>
        </form>

        <div className={styles.footerNote}>
          Don&apos;t have an account?{' '}
          <Link to="/signup" className={styles.authLink}>
            Create an account
          </Link>
        </div>
      </Card>

      {/* Password Reset Modal */}
      {showResetModal && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="reset-title">
          <Card className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <div className={styles.iconCircle}>
                <KeyRound size={20} />
              </div>
              <h2 id="reset-title" className={styles.modalTitle}>
                Reset Password
              </h2>
              <p className={styles.subtitle}>
                Enter your registered email address to receive password reset instructions.
              </p>
            </div>

            {resetSuccess ? (
              <div className={styles.successBanner}>
                <CheckCircle2 size={16} />
                <span>{resetSuccess}</span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowResetModal(false)}
                  style={{ marginTop: '12px', width: '100%' }}
                >
                  Close
                </Button>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className={styles.form}>
                {resetError && (
                  <div className={styles.errorBanner} role="alert">
                    <AlertCircle size={16} />
                    <span>{resetError}</span>
                  </div>
                )}
                <Input
                  label="Email Address"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  disabled={resetLoading}
                />
                <div className={styles.modalActions}>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowResetModal(false)}
                    disabled={resetLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={resetLoading}
                  >
                    Send Reset Email
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

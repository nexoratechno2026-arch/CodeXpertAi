import { describe, it, expect } from 'vitest';
import { mapFirebaseAuthError } from '@/services/authService';

describe('Auth Service Error Mapping', () => {
  it('maps auth/email-already-in-use to friendly message', () => {
    const msg = mapFirebaseAuthError('auth/email-already-in-use');
    expect(msg).toMatch(/already exists/i);
  });

  it('maps auth/wrong-password and auth/invalid-credential to credential error', () => {
    expect(mapFirebaseAuthError('auth/wrong-password')).toMatch(/verify your credentials/i);
    expect(mapFirebaseAuthError('auth/invalid-credential')).toMatch(/verify your credentials/i);
  });

  it('maps auth/weak-password to password complexity notice', () => {
    const msg = mapFirebaseAuthError('auth/weak-password');
    expect(msg).toMatch(/at least 8 characters/i);
  });

  it('returns generic fallback for unknown error codes', () => {
    const msg = mapFirebaseAuthError('auth/unknown-code');
    expect(msg).toMatch(/authentication failed/i);
  });
});

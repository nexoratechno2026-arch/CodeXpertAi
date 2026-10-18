import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validateFullName,
  validatePasswordConfirmation,
} from '@/lib/validation';

describe('Validation Utilities', () => {
  describe('validateEmail', () => {
    it('accepts valid email addresses', () => {
      expect(validateEmail('student@nexoratechno.in').isValid).toBe(true);
      expect(validateEmail('user.name+tag@example.com').isValid).toBe(true);
    });

    it('rejects empty or whitespace-only email', () => {
      const res = validateEmail('   ');
      expect(res.isValid).toBe(false);
      expect(res.error).toMatch(/required/i);
    });

    it('rejects malformed email strings', () => {
      expect(validateEmail('plainaddress').isValid).toBe(false);
      expect(validateEmail('@missingusername.com').isValid).toBe(false);
      expect(validateEmail('username@.com').isValid).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('accepts compliant passwords (min 8 chars, uppercase, lowercase, numeric)', () => {
      expect(validatePassword('Nexora2026!').isValid).toBe(true);
      expect(validatePassword('Passw0rdSec').isValid).toBe(true);
    });

    it('rejects passwords shorter than 8 characters', () => {
      const res = validatePassword('Pass1');
      expect(res.isValid).toBe(false);
      expect(res.error).toMatch(/at least 8 characters/i);
    });

    it('rejects passwords missing uppercase letters', () => {
      const res = validatePassword('password123');
      expect(res.isValid).toBe(false);
      expect(res.error).toMatch(/uppercase/i);
    });

    it('rejects passwords missing lowercase letters', () => {
      const res = validatePassword('PASSWORD123');
      expect(res.isValid).toBe(false);
      expect(res.error).toMatch(/lowercase/i);
    });

    it('rejects passwords missing numbers', () => {
      const res = validatePassword('PasswordWord');
      expect(res.isValid).toBe(false);
      expect(res.error).toMatch(/number/i);
    });
  });

  describe('validateFullName', () => {
    it('accepts standard names', () => {
      expect(validateFullName('Ada Lovelace').isValid).toBe(true);
      expect(validateFullName('Alan Turing').isValid).toBe(true);
    });

    it('rejects empty names or single-character names', () => {
      expect(validateFullName('').isValid).toBe(false);
      expect(validateFullName('A').isValid).toBe(false);
    });

    it('rejects names exceeding 100 characters', () => {
      const longName = 'A'.repeat(101);
      expect(validateFullName(longName).isValid).toBe(false);
    });
  });

  describe('validatePasswordConfirmation', () => {
    it('returns valid when passwords match', () => {
      expect(validatePasswordConfirmation('Secret123', 'Secret123').isValid).toBe(true);
    });

    it('returns error when passwords do not match', () => {
      const res = validatePasswordConfirmation('Secret123', 'Different123');
      expect(res.isValid).toBe(false);
      expect(res.error).toMatch(/do not match/i);
    });
  });
});

import { describe, it, expect, vi } from 'vitest';
import {
  validateExecutionPayload,
  executeCode,
  MAX_CODE_SIZE_BYTES,
} from '@/services/executionService';
import { validateInterviewConfig } from '@/services/interviewService';

describe('Phase 6 — Production Readiness & Security Hardening', () => {
  describe('1. Code Execution Security & Payload Boundaries', () => {
    it('rejects execution payloads exceeding 64KB boundary limit', () => {
      const oversizedCode = 'a'.repeat(MAX_CODE_SIZE_BYTES + 100);
      const result = validateExecutionPayload({
        problemId: 'prob-two-sum',
        language: 'python',
        code: oversizedCode,
        operation: 'submit',
      });

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('exceeds 64KB limit');
    });

    it('rejects execution payloads with unsupported programming languages', () => {
      const result = validateExecutionPayload({
        problemId: 'prob-two-sum',
        // @ts-expect-error Testing invalid language at runtime
        language: 'ruby',
        code: 'puts "hello"',
        operation: 'run',
      });

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Language 'ruby' is not supported");
    });

    it('rejects empty or whitespace-only source code', () => {
      const result = validateExecutionPayload({
        problemId: 'prob-two-sum',
        language: 'python',
        code: '   \n\t  ',
        operation: 'run',
      });

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('cannot be empty');
    });

    it('strictly returns UNCONFIGURED error status in production when no live sandbox is provisioned', async () => {
      // Temporarily mock import.meta.env.VITE_APP_ENV to 'production'
      vi.stubEnv('VITE_APP_ENV', 'production');

      const result = await executeCode({
        problemId: 'prob-two-sum',
        language: 'python',
        code: 'def two_sum(): return [0, 1]',
        operation: 'submit',
      });

      expect(result.status).toBe('error');
      expect(result.verdict).toBe('internal_error');
      expect(result.message).toContain('UNCONFIGURED in production');
      expect(result.isMockExecution).toBe(false);

      vi.unstubAllEnvs();
    });
  });

  describe('2. InterviewAI Configuration Boundaries & Input Validation', () => {
    it('rejects invalid or unapproved interview categories', () => {
      const result = validateInterviewConfig({
        // @ts-expect-error Testing runtime injection of unapproved category
        category: 'unapproved_category',
        targetRole: 'Software Engineer',
        difficulty: 'intermediate',
        questionCount: 5,
        durationMinutes: 30,
      });

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid interview category');
    });

    it('enforces target role length constraints (minimum 2 characters)', () => {
      const result = validateInterviewConfig({
        category: 'technical',
        targetRole: ' ',
        difficulty: 'intermediate',
        questionCount: 5,
        durationMinutes: 30,
      });

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Target role is required');
    });

    it('clamps question counts strictly between 1 and 10', () => {
      const tooMany = validateInterviewConfig({
        category: 'technical',
        targetRole: 'Backend Engineer',
        difficulty: 'intermediate',
        questionCount: 50,
        durationMinutes: 30,
      });
      expect(tooMany.isValid).toBe(false);
      expect(tooMany.error).toContain('between 1 and 10');

      const tooFew = validateInterviewConfig({
        category: 'technical',
        targetRole: 'Backend Engineer',
        difficulty: 'intermediate',
        questionCount: 0,
        durationMinutes: 30,
      });
      expect(tooFew.isValid).toBe(false);
      expect(tooFew.error).toContain('between 1 and 10');
    });

    it('enforces session duration boundaries between 10 and 120 minutes', () => {
      const tooShort = validateInterviewConfig({
        category: 'technical',
        targetRole: 'Frontend Engineer',
        difficulty: 'beginner',
        questionCount: 3,
        durationMinutes: 5,
      });
      expect(tooShort.isValid).toBe(false);
      expect(tooShort.error).toContain('between 10 and 120 minutes');

      const tooLong = validateInterviewConfig({
        category: 'technical',
        targetRole: 'Frontend Engineer',
        difficulty: 'beginner',
        questionCount: 3,
        durationMinutes: 180,
      });
      expect(tooLong.isValid).toBe(false);
      expect(tooLong.error).toContain('between 10 and 120 minutes');
    });
  });
});

import { describe, it, expect } from 'vitest';
import {
  validateExecutionPayload,
  executeCode,
  MAX_CODE_SIZE_BYTES,
} from '@/services/executionService';

describe('Execution Service - Security & Validation', () => {
  it('rejects execution requests with empty problemId', () => {
    const res = validateExecutionPayload({
      problemId: '',
      language: 'python',
      code: 'print("hello")',
      operation: 'run',
    });
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('Problem ID is required');
  });

  it('rejects execution requests with unsupported programming language', () => {
    const res = validateExecutionPayload({
      problemId: 'prob-two-sum',
      // @ts-expect-error testing invalid language input
      language: 'rust_unsupported',
      code: 'fn main() {}',
      operation: 'run',
    });
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('not supported');
  });

  it('rejects execution requests with empty source code', () => {
    const res = validateExecutionPayload({
      problemId: 'prob-two-sum',
      language: 'python',
      code: '   \n  \t  ',
      operation: 'run',
    });
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('cannot be empty');
  });

  it('rejects execution requests exceeding the 64KB size limit', () => {
    const oversizedCode = 'a'.repeat(MAX_CODE_SIZE_BYTES + 500);
    const res = validateExecutionPayload({
      problemId: 'prob-two-sum',
      language: 'python',
      code: oversizedCode,
      operation: 'submit',
    });
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('exceeds 64KB limit');
  });

  it('accepts valid execution payloads', () => {
    const res = validateExecutionPayload({
      problemId: 'prob-two-sum',
      language: 'python',
      code: 'def two_sum(): pass',
      operation: 'run',
    });
    expect(res.isValid).toBe(true);
    expect(res.error).toBeUndefined();
  });

  it('strictly redacts private test cases in execution results to prevent cheating', async () => {
    const result = await executeCode({
      problemId: 'prob-two-sum',
      language: 'python',
      code: 'def two_sum(target, nums): return [0, 1]',
      operation: 'submit',
    });

    expect(result.isMockExecution).toBe(true);
    expect(result.testCaseResults.length).toBeGreaterThan(0);

    const privateCases = result.testCaseResults.filter((tc) => !tc.isPublic);
    expect(privateCases.length).toBeGreaterThan(0);

    // Assert that input and expected output are undefined for all private test cases
    for (const tc of privateCases) {
      expect(tc.input).toBeUndefined();
      expect(tc.expectedOutput).toBeUndefined();
      expect(tc.actualOutput).toBeUndefined();
    }

    // Assert that public cases preserve diagnostic input/output
    const publicCases = result.testCaseResults.filter((tc) => tc.isPublic);
    for (const tc of publicCases) {
      expect(tc.input).toBeDefined();
      expect(tc.expectedOutput).toBeDefined();
    }
  });

  it('returns valid simulation status on run operation', async () => {
    const result = await executeCode({
      problemId: 'prob-two-sum',
      language: 'python',
      code: 'def two_sum(): return [0, 1]',
      operation: 'run',
    });

    expect(result.operation).toBe('run');
    expect(result.status).toBe('completed');
    expect(result.totalTests).toBe(3); // 3 public examples for two-sum
    expect(result.testCaseResults.every((tc) => tc.isPublic)).toBe(true);
  });
});

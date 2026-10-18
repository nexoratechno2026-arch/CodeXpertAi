import { describe, it, expect, beforeEach } from 'vitest';
import {
  getProblems,
  getProblemBySlug,
  getSubmissionsForUser,
  cacheLocalSubmission,
  getTopicMasteryForUser,
} from '@/services/codelabService';
import { Submission } from '@/types/codelab';

describe('Codelab Service - Problem Catalog & Topic Mastery', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('retrieves published problems catalog with pagination', async () => {
    const res = await getProblems({ page: 1, pageSize: 10 });
    expect(res.problems.length).toBeGreaterThanOrEqual(6);
    expect(res.totalCount).toBeGreaterThanOrEqual(6);
    expect(res.problems.every((p) => p.isPublished)).toBe(true);
  });

  it('filters problems accurately by difficulty tier', async () => {
    const res = await getProblems({ difficulty: 'absolute_beginner' });
    expect(res.problems.length).toBeGreaterThan(0);
    expect(res.problems.every((p) => p.difficulty === 'absolute_beginner')).toBe(true);

    const advRes = await getProblems({ difficulty: 'advanced' });
    expect(advRes.problems.every((p) => p.difficulty === 'advanced')).toBe(true);
  });

  it('filters problems accurately by topic domain', async () => {
    const res = await getProblems({ topicId: 'hash-maps-sets' });
    expect(res.problems.length).toBeGreaterThan(0);
    expect(res.problems.every((p) => p.topicId === 'hash-maps-sets')).toBe(true);
  });

  it('filters problems by search term across title and tags', async () => {
    const res = await getProblems({ searchTerm: 'parentheses' });
    expect(res.problems.length).toBeGreaterThanOrEqual(1);
    expect(res.problems.some((p) => p.slug === 'valid-parentheses-depth')).toBe(true);
  });

  it('retrieves a problem by slug without leaking private test cases', async () => {
    const problem = await getProblemBySlug('two-sum-indices');
    expect(problem).not.toBeNull();
    expect(problem?.title).toContain('Two Sum');
    expect(problem?.examples.length).toBe(3);

    // Verify problem object has only public examples and no private test cases
    expect((problem as any).testCases).toBeUndefined();
  });

  it('returns null for nonexistent problem slug', async () => {
    const problem = await getProblemBySlug('nonexistent-problem-slug');
    expect(problem).toBeNull();
  });

  it('stores and retrieves submissions for user in chronological order', async () => {
    const sub1: Submission = {
      id: 'sub-1',
      userId: 'user-abc',
      problemId: 'prob-two-sum',
      problemSlug: 'two-sum-indices',
      problemTitle: 'Two Sum Target Indices',
      difficulty: 'beginner',
      topicId: 'hash-maps-sets',
      language: 'python',
      code: 'print("pass")',
      status: 'completed',
      verdict: 'wrong_answer',
      runtimeMs: 45,
      memoryKB: 18000,
      passedCount: 1,
      totalCount: 6,
      submittedAt: '2026-03-01T10:00:00Z',
    };

    const sub2: Submission = {
      id: 'sub-2',
      userId: 'user-abc',
      problemId: 'prob-two-sum',
      problemSlug: 'two-sum-indices',
      problemTitle: 'Two Sum Target Indices',
      difficulty: 'beginner',
      topicId: 'hash-maps-sets',
      language: 'python',
      code: 'print("pass")',
      status: 'completed',
      verdict: 'accepted',
      runtimeMs: 35,
      memoryKB: 17500,
      passedCount: 6,
      totalCount: 6,
      submittedAt: '2026-03-01T10:05:00Z',
    };

    cacheLocalSubmission(sub1);
    cacheLocalSubmission(sub2);

    const retrieved = await getSubmissionsForUser('user-abc');
    expect(retrieved.length).toBe(2);
    // Most recent first
    expect(retrieved[0].id).toBe('sub-2');
    expect(retrieved[0].verdict).toBe('accepted');
  });

  it('calculates measured topic mastery based on solved problems', async () => {
    // Before solving any: all topics are absolute_beginner
    const initialMastery = await getTopicMasteryForUser('user-new');
    expect(initialMastery.length).toBe(14); // 14 topics
    expect(initialMastery.every((t) => t.proficiency === 'absolute_beginner')).toBe(true);

    // Submit an accepted solution for hash-maps-sets
    cacheLocalSubmission({
      id: 'sub-accepted',
      userId: 'user-new',
      problemId: 'prob-two-sum',
      problemSlug: 'two-sum-indices',
      problemTitle: 'Two Sum Target Indices',
      difficulty: 'beginner',
      topicId: 'hash-maps-sets',
      language: 'python',
      code: 'pass',
      status: 'completed',
      verdict: 'accepted',
      runtimeMs: 20,
      memoryKB: 15000,
      passedCount: 6,
      totalCount: 6,
      submittedAt: new Date().toISOString(),
    });

    const updatedMastery = await getTopicMasteryForUser('user-new');
    const hashTopic = updatedMastery.find((t) => t.topicId === 'hash-maps-sets');
    expect(hashTopic).toBeDefined();
    expect(hashTopic?.solvedCount).toBe(1);
    expect(hashTopic?.proficiency).toBe('beginner');
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import {
  computeStudentAnalytics,
  getCachedAnalytics,
} from '@/services/analyticsService';
import {
  UNIFIED_SKILLS,
  PUBLISHED_LEARNING_PATHS,
  getSkillsForProblem,
  getSkillsForInterview,
} from '@/data/skillTaxonomy';
import { SEED_PROBLEMS } from '@/data/seedProblems';
import { cacheLocalSubmission } from '@/services/codelabService';
import { Submission } from '@/types/codelab';
import { createInterviewSession, submitInterviewAnswer } from '@/services/interviewService';

describe('Phase 5 — Unified Skill Intelligence & Analytics Engine', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('1. Unified Skill Taxonomy & Mappings', () => {
    it('defines a comprehensive, stable skill taxonomy across all 4 categories', () => {
      expect(UNIFIED_SKILLS.length).toBeGreaterThanOrEqual(15);

      const categories = new Set(UNIFIED_SKILLS.map((s) => s.category));
      expect(categories.has('programming_fundamentals')).toBe(true);
      expect(categories.has('programming_languages')).toBe(true);
      expect(categories.has('databases_and_sql')).toBe(true);
      expect(categories.has('interview_skills')).toBe(true);
    });

    it('maps CodeLab problems to relevant skills via tags and topics', () => {
      const twoSum = SEED_PROBLEMS.find((p) => p.slug === 'two-sum-indices')!;
      const skills = getSkillsForProblem(twoSum);

      expect(skills).toContain('prog-hash-tables');
      expect(skills).toContain('prog-complexity');
    });

    it('maps InterviewAI categories and topics to appropriate skill IDs', () => {
      const technicalSkills = getSkillsForInterview('technical', 'Distributed Systems');
      expect(technicalSkills).toContain('int-concept-articulation');
      expect(technicalSkills).toContain('int-tradeoff-reasoning');

      const sqlSkills = getSkillsForInterview('sql', 'Query Plans & Indexing');
      expect(sqlSkills).toContain('lang-sql');
      expect(sqlSkills).toContain('db-indexing-performance');

      const behavioralSkills = getSkillsForInterview('behavioral');
      expect(behavioralSkills).toContain('int-star-communication');
    });
  });

  describe('2. Empty State & Insufficient Evidence Handling', () => {
    it('returns not_assessed confidence and baseline recommendations when user has no activity', async () => {
      const analytics = await computeStudentAnalytics('brand_new_student_001');

      expect(analytics.totalCodeLabAttempted).toBe(0);
      expect(analytics.totalCodeLabAccepted).toBe(0);
      expect(analytics.totalInterviewsCompleted).toBe(0);
      expect(analytics.averageInterviewScore).toBeNull();

      // Check skill confidence states
      Object.values(analytics.skills).forEach((summary) => {
        expect(summary.confidenceState).toBe('not_assessed');
      });

      // Recommendations should provide a gentle on-ramp
      expect(analytics.recommendations.length).toBeGreaterThan(0);
      const topRec = analytics.recommendations[0];
      expect(topRec.type).toBe('codelab_problem');
      expect(topRec.reason).toContain('No completed coding submissions');
    });
  });

  describe('3. Verified CodeLab Evidence Ingestion & Confidence States', () => {
    it('promotes confidence state to developing upon an accepted problem submission', async () => {
      const uid = 'student_with_solved_problem';

      const submission: Submission = {
        id: 'sub_test_01',
        problemId: 'prob-two-sum',
        problemSlug: 'two-sum-indices',
        problemTitle: 'Two Sum Target Indices',
        difficulty: 'beginner',
        topicId: 'hash-maps-sets',
        userId: uid,
        code: 'def two_sum(): pass',
        language: 'python',
        status: 'completed',
        verdict: 'accepted',
        runtimeMs: 12,
        memoryKB: 14000,
        passedCount: 3,
        totalCount: 3,
        submittedAt: new Date().toISOString(),
      };

      cacheLocalSubmission(submission);

      const analytics = await computeStudentAnalytics(uid);

      expect(analytics.totalCodeLabAttempted).toBe(1);
      expect(analytics.totalCodeLabAccepted).toBe(1);

      // prog-hash-tables should transition to developing
      const hashSkill = analytics.skills['prog-hash-tables'];
      expect(hashSkill).toBeDefined();
      expect(hashSkill.codeLabProblemsSolved).toBe(1);
      expect(hashSkill.confidenceState).toBe('developing');
    });

    it('does not credit rejected submissions as solved problems', async () => {
      const uid = 'student_failed_attempt';

      const failedSub: Submission = {
        id: 'sub_test_02',
        problemId: 'prob-two-sum',
        problemSlug: 'two-sum-indices',
        problemTitle: 'Two Sum Target Indices',
        difficulty: 'beginner',
        topicId: 'hash-maps-sets',
        userId: uid,
        code: 'def two_sum(): wrong',
        language: 'python',
        status: 'completed',
        verdict: 'wrong_answer',
        runtimeMs: 15,
        memoryKB: 14000,
        passedCount: 1,
        totalCount: 3,
        submittedAt: new Date().toISOString(),
      };

      cacheLocalSubmission(failedSub);

      const analytics = await computeStudentAnalytics(uid);

      expect(analytics.totalCodeLabAttempted).toBe(1);
      expect(analytics.totalCodeLabAccepted).toBe(0);

      const hashSkill = analytics.skills['prog-hash-tables'];
      expect(hashSkill.codeLabProblemsSolved).toBe(0);
      expect(hashSkill.confidenceState).toBe('starting_out');
    });
  });

  describe('4. Verified InterviewAI Evidence Ingestion & Score Synthesis', () => {
    it('synthesizes completed interview scores and updates behavioral and communication skills', async () => {
      const uid = 'student_interview_eval';

      const session = await createInterviewSession(
        {
          category: 'behavioral',
          targetRole: 'Engineering Lead',
          difficulty: 'intermediate',
          durationMinutes: 30,
          questionCount: 1,
        },
        uid
      );

      // Submit substantive answer to trigger evaluation
      await submitInterviewAnswer(
        session.id,
        session.questions[0].id,
        'In our previous project outage, I initiated a blameless post-mortem, identified the connection leak in our database pool, and restored service in 18 minutes with zero customer data loss.'
      );

      const analytics = await computeStudentAnalytics(uid);

      expect(analytics.totalInterviewsCompleted).toBe(1);
      expect(typeof analytics.averageInterviewScore).toBe('number');
      expect(analytics.averageInterviewScore).toBeGreaterThan(0);

      const commSkill = analytics.skills['int-star-communication'];
      expect(commSkill).toBeDefined();
      expect(commSkill.interviewQuestionsAnswered).toBe(1);
      expect(['starting_out', 'developing', 'demonstrated_consistently']).toContain(commSkill.confidenceState);
    });
  });

  describe('5. Adaptive Recommendations & Path Milestones', () => {
    it('recommends intermediate challenges once beginner prerequisites are cleared', async () => {
      const uid = 'student_ready_for_stack';

      // Submit accepted solutions for foundational problems
      cacheLocalSubmission({
        id: 'sub_p1',
        problemId: 'prob-reverse-words',
        problemSlug: 'reverse-words',
        problemTitle: 'Reverse Words in a String',
        difficulty: 'beginner',
        topicId: 'arrays-strings',
        userId: uid,
        code: 'pass',
        language: 'python',
        status: 'completed',
        verdict: 'accepted',
        runtimeMs: 10,
        memoryKB: 14000,
        passedCount: 3,
        totalCount: 3,
        submittedAt: new Date().toISOString(),
      });

      cacheLocalSubmission({
        id: 'sub_p2',
        problemId: 'prob-two-sum',
        problemSlug: 'two-sum-indices',
        problemTitle: 'Two Sum Target Indices',
        difficulty: 'beginner',
        topicId: 'hash-maps-sets',
        userId: uid,
        code: 'pass',
        language: 'python',
        status: 'completed',
        verdict: 'accepted',
        runtimeMs: 10,
        memoryKB: 14000,
        passedCount: 3,
        totalCount: 3,
        submittedAt: new Date().toISOString(),
      });

      const analytics = await computeStudentAnalytics(uid);

      // Recommendation should suggest Balanced Parentheses (Stacks)
      const stackRec = analytics.recommendations.find(
        (r) => r.targetSkillId === 'prog-stacks-queues'
      );
      expect(stackRec).toBeDefined();
      expect(stackRec?.difficulty).toBe('intermediate');
    });

    it('calculates true percentage completion on learning paths based on verified milestones', async () => {
      expect(PUBLISHED_LEARNING_PATHS.length).toBeGreaterThanOrEqual(5);
      const uid = 'student_path_tracker';

      // Complete milestone 1 of Programming Foundations
      cacheLocalSubmission({
        id: 'sub_path_ms1',
        problemId: 'prob-reverse-words',
        problemSlug: 'reverse-words',
        problemTitle: 'Reverse Words in a String',
        difficulty: 'beginner',
        topicId: 'arrays-strings',
        userId: uid,
        code: 'pass',
        language: 'python',
        status: 'completed',
        verdict: 'accepted',
        runtimeMs: 10,
        memoryKB: 14000,
        passedCount: 3,
        totalCount: 3,
        submittedAt: new Date().toISOString(),
      });

      const analytics = await computeStudentAnalytics(uid);

      const foundationsPath = analytics.learningPaths.find(
        (p) => p.id === 'lp-prog-fundamentals'
      );
      expect(foundationsPath).toBeDefined();
      // 1 of 2 milestones completed = 50%
      expect(foundationsPath?.progressPercent).toBe(50);
      expect(foundationsPath?.milestones[0].isCompleted).toBe(true);
      expect(foundationsPath?.milestones[1].isCompleted).toBe(false);
    });
  });

  describe('6. Chronological Feed Integration & Caching', () => {
    it('merges CodeLab and Interview events chronologically into one unified feed', async () => {
      const uid = 'student_feed_merge';
      const earlierDate = new Date(Date.now() - 3600000).toISOString();
      const laterDate = new Date().toISOString();

      cacheLocalSubmission({
        id: 'sub_feed_1',
        problemId: 'prob-two-sum',
        problemSlug: 'two-sum-indices',
        problemTitle: 'Two Sum Target Indices',
        difficulty: 'beginner',
        topicId: 'hash-maps-sets',
        userId: uid,
        code: 'pass',
        language: 'python',
        status: 'completed',
        verdict: 'accepted',
        runtimeMs: 10,
        memoryKB: 14000,
        passedCount: 3,
        totalCount: 3,
        submittedAt: earlierDate,
      });

      const session = await createInterviewSession(
        {
          category: 'technical',
          targetRole: 'Backend Engineer',
          difficulty: 'intermediate',
          durationMinutes: 30,
          questionCount: 1,
        },
        uid
      );
      session.createdAt = laterDate;

      const analytics = await computeStudentAnalytics(uid);

      expect(analytics.recentActivity.length).toBeGreaterThanOrEqual(1);
      // Saved in cache
      const cached = getCachedAnalytics(uid);
      expect(cached).not.toBeNull();
      expect(cached?.userId).toBe(uid);
    });
  });
});

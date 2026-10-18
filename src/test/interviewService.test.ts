import { describe, it, expect, beforeEach } from 'vitest';
import {
  validateInterviewConfig,
  createInterviewSession,
  getInterviewSession,
  submitInterviewAnswer,
  evaluateAndFinalizeSession,
  saveAnswerDraft,
  getAnswerDraft,
  clearAnswerDraft,
  getUserInterviewHistory,
} from '@/services/interviewService';
import { generateQuestionList } from '@/data/interviewQuestionBank';
import { InterviewSetupConfig, InterviewCategory } from '@/types/interview';

describe('InterviewAI Practice Engine - Unit & Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('1. Interview Setup & Configuration Validation', () => {
    it('accepts valid configuration parameters', () => {
      const validConfig: InterviewSetupConfig = {
        category: 'technical',
        targetRole: 'Senior Backend Engineer',
        difficulty: 'intermediate',
        durationMinutes: 30,
        questionCount: 5,
      };
      const result = validateInterviewConfig(validConfig);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('rejects invalid or empty target role', () => {
      const invalidConfig: InterviewSetupConfig = {
        category: 'programming',
        targetRole: '  ',
        difficulty: 'beginner',
        durationMinutes: 30,
        questionCount: 5,
      };
      const result = validateInterviewConfig(invalidConfig);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Target role is required');
    });

    it('rejects out-of-bounds question counts', () => {
      const zeroCount: InterviewSetupConfig = {
        category: 'sql',
        targetRole: 'Data Analyst',
        difficulty: 'intermediate',
        durationMinutes: 30,
        questionCount: 0,
      };
      expect(validateInterviewConfig(zeroCount).isValid).toBe(false);

      const excessCount: InterviewSetupConfig = {
        ...zeroCount,
        questionCount: 15,
      };
      expect(validateInterviewConfig(excessCount).isValid).toBe(false);
    });

    it('rejects out-of-bounds duration limits', () => {
      const shortDuration: InterviewSetupConfig = {
        category: 'hr',
        targetRole: 'Frontend Engineer',
        difficulty: 'beginner',
        durationMinutes: 5,
        questionCount: 3,
      };
      expect(validateInterviewConfig(shortDuration).isValid).toBe(false);

      const excessiveDuration: InterviewSetupConfig = {
        ...shortDuration,
        durationMinutes: 200,
      };
      expect(validateInterviewConfig(excessiveDuration).isValid).toBe(false);
    });

    it('rejects invalid categories', () => {
      const invalidCat = {
        category: 'astrology' as unknown as InterviewCategory,
        targetRole: 'Consultant',
        difficulty: 'beginner',
        durationMinutes: 30,
        questionCount: 5,
      };
      expect(validateInterviewConfig(invalidCat as InterviewSetupConfig).isValid).toBe(false);
    });
  });

  describe('2. Deterministic Question Generator', () => {
    const categories: InterviewCategory[] = ['technical', 'programming', 'sql', 'hr', 'behavioral'];

    categories.forEach((cat) => {
      it(`generates structured questions for category "${cat}" across requested counts`, () => {
        const questions = generateQuestionList(cat, 'Full Stack Engineer', 'intermediate', 3);
        expect(questions).toHaveLength(3);
        questions.forEach((q, idx) => {
          expect(q.id).toBeDefined();
          expect(q.order).toBe(idx + 1);
          expect(q.category).toBe(cat);
          expect(q.questionText.length).toBeGreaterThan(15);
          expect(q.expectedCriteria.length).toBeGreaterThan(0);
        });
      });
    });

    it('respects 5-level difficulty tiers in generated questions', () => {
      const beginnerQuestions = generateQuestionList('technical', 'Junior Engineer', 'beginner', 2);
      const expertQuestions = generateQuestionList('technical', 'Staff Architect', 'expert', 2);

      expect(beginnerQuestions[0].difficulty).toBe('beginner');
      expect(expertQuestions[0].difficulty).toBe('expert');
    });
  });

  describe('3. Session Creation & Lifecycle State Transitions', () => {
    it('creates an initialized in_progress session with owner UID', async () => {
      const config: InterviewSetupConfig = {
        category: 'programming',
        targetRole: 'Systems Engineer',
        difficulty: 'advanced',
        durationMinutes: 45,
        questionCount: 3,
      };

      const session = await createInterviewSession(config, 'user_test_123');

      expect(session.id).toMatch(/^int_/);
      expect(session.userId).toBe('user_test_123');
      expect(session.status).toBe('in_progress');
      expect(session.currentQuestionIndex).toBe(0);
      expect(session.questions).toHaveLength(3);
      expect(session.answers).toEqual({});
    });

    it('retrieves an existing session by ID', async () => {
      const config: InterviewSetupConfig = {
        category: 'sql',
        targetRole: 'Database Admin',
        difficulty: 'intermediate',
        durationMinutes: 30,
        questionCount: 3,
      };

      const created = await createInterviewSession(config, 'user_test_456');
      const retrieved = await getInterviewSession(created.id);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.category).toBe('sql');
    });

    it('returns null for non-existent session IDs', async () => {
      const nonExistent = await getInterviewSession('non_existent_id');
      expect(nonExistent).toBeNull();
    });
  });

  describe('4. Draft Autosave & Recovery', () => {
    it('buffers answer draft to local storage and retrieves it', () => {
      saveAnswerDraft('session_1', 'q_1', 'In a distributed system, CAP theorem states...');
      const draft = getAnswerDraft('session_1', 'q_1');
      expect(draft).toBe('In a distributed system, CAP theorem states...');
    });

    it('clears draft upon successful submission', () => {
      saveAnswerDraft('session_1', 'q_2', 'Draft text to clear');
      clearAnswerDraft('session_1', 'q_2');
      expect(getAnswerDraft('session_1', 'q_2')).toBe('');
    });
  });

  describe('5. Answer Submission, Persistence & Progress', () => {
    it('rejects answers that are too short (under 5 characters)', async () => {
      const session = await createInterviewSession(
        {
          category: 'technical',
          targetRole: 'Frontend Dev',
          difficulty: 'beginner',
          durationMinutes: 30,
          questionCount: 3,
        },
        'user_test_1'
      );

      await expect(
        submitInterviewAnswer(session.id, session.questions[0].id, 'no')
      ).rejects.toThrow('Answer is too short');
    });

    it('rejects answers exceeding 8000 characters', async () => {
      const session = await createInterviewSession(
        {
          category: 'technical',
          targetRole: 'Frontend Dev',
          difficulty: 'beginner',
          durationMinutes: 30,
          questionCount: 3,
        },
        'user_test_1'
      );

      const massiveText = 'a'.repeat(8005);
      await expect(
        submitInterviewAnswer(session.id, session.questions[0].id, massiveText)
      ).rejects.toThrow('8,000 character limit');
    });

    it('records valid answer, advances question index, and evaluates upon final question', async () => {
      const session = await createInterviewSession(
        {
          category: 'technical',
          targetRole: 'Full Stack Engineer',
          difficulty: 'intermediate',
          durationMinutes: 30,
          questionCount: 2,
        },
        'user_test_2'
      );

      // Question 1 submission
      const step1 = await submitInterviewAnswer(
        session.id,
        session.questions[0].id,
        'TCP uses a three-way handshake (SYN, SYN-ACK, ACK) to establish reliable byte-stream connections.'
      );

      expect(step1.isComplete).toBe(false);
      expect(step1.session.currentQuestionIndex).toBe(1);
      expect(step1.session.answers[session.questions[0].id]).toBeDefined();

      // Question 2 submission (final)
      const step2 = await submitInterviewAnswer(
        session.id,
        session.questions[1].id,
        'Database indexing with B-Trees reduces lookup time from O(N) to O(log N) by maintaining balanced trees on disk pages.'
      );

      expect(step2.isComplete).toBe(true);
      expect(step2.session.status).toBe('completed');
      expect(step2.session.report).toBeDefined();
      expect(step2.session.report?.overallScore).toBeGreaterThanOrEqual(0);
      expect(step2.session.report?.overallScore).toBeLessThanOrEqual(100);
      expect(step2.session.report?.criteriaBreakdown.length).toBeGreaterThan(0);
      expect(step2.session.report?.topStrengths.length).toBeGreaterThan(0);
    });
  });

  describe('6. Multi-Criterion Rubric Evaluation & Performance Tiers', () => {
    it('calculates correct PerformanceTier based on overall score', async () => {
      const session = await createInterviewSession(
        {
          category: 'behavioral',
          targetRole: 'Engineering Manager',
          difficulty: 'advanced',
          durationMinutes: 30,
          questionCount: 1,
        },
        'user_test_tier'
      );

      // Submit an elaborate response
      const report = await evaluateAndFinalizeSession(session);
      expect(['Exceptional', 'Strong', 'Developing', 'Needs Practice']).toContain(
        report.performanceTier
      );
      expect(report.disclaimer).toContain('diagnostic guidance');
      expect(report.actionableNextSteps.length).toBeGreaterThan(0);
    });
  });

  describe('7. User Interview History', () => {
    it('returns history sessions sorted by date descending', async () => {
      const uid = 'history_user_99';
      await createInterviewSession(
        {
          category: 'technical',
          targetRole: 'Cloud Engineer',
          difficulty: 'intermediate',
          durationMinutes: 30,
          questionCount: 3,
        },
        uid
      );

      await createInterviewSession(
        {
          category: 'sql',
          targetRole: 'Data Engineer',
          difficulty: 'expert',
          durationMinutes: 45,
          questionCount: 5,
        },
        uid
      );

      const history = await getUserInterviewHistory(uid);
      expect(history.length).toBe(2);
      expect(history[0].userId).toBe(uid);
      expect(new Date(history[0].createdAt).getTime()).toBeGreaterThanOrEqual(
        new Date(history[1].createdAt).getTime()
      );
    });
  });
});

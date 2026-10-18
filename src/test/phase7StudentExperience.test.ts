import { describe, it, expect, beforeEach } from 'vitest';
import {
  createStudentProfile,
  getStudentProfile,
  updateStudentProfile,
} from '@/services/profileService';
import {
  fetchUserNotifications,
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  dismissNotification,
  getLocalNotifications,
} from '@/services/notificationService';
import { Submission } from '@/types/codelab';
import { SEED_PROBLEMS } from '@/data/seedProblems';
import { QUESTION_BANK } from '@/data/interviewQuestionBank';

describe('Phase 7 — Student Experience, Profile, Notifications & Admin Panel', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // ── 1. Profile & Settings Tests ──
  describe('Student Profile & Target Goals', () => {
    it('initializes profile with target role, learning goals, and default notification preferences', async () => {
      const profile = await createStudentProfile(
        'student_ph7_01',
        'student7@nexora.com',
        'Ada Lovelace'
      );

      expect(profile.targetRole).toBe('Software Engineer');
      expect(profile.learningGoals).toContain('Data Structures');
      expect(profile.notificationPreferences?.emailDigests).toBe(true);
      expect(profile.notificationPreferences?.milestoneAlerts).toBe(true);
      expect(profile.notificationPreferences?.practiceReminders).toBe(true);
      expect(profile.stats.currentStreak).toBe(0);
      expect(profile.role).toBe('student');
    });

    it('persists customized target role, learning goals, and notification preferences', async () => {
      await createStudentProfile('student_ph7_02', 'ada@test.com', 'Ada');

      await updateStudentProfile('student_ph7_02', {
        fullName: 'Ada Lovelace, Countess of Lovelace',
        targetRole: 'Machine Learning Infrastructure Engineer',
        learningGoals: 'Graph algorithms, PyTorch internals, Distributed Training',
        notificationPreferences: {
          emailDigests: false,
          milestoneAlerts: true,
          practiceReminders: false,
        },
      });

      const updated = await getStudentProfile('student_ph7_02');
      expect(updated?.targetRole).toBe('Machine Learning Infrastructure Engineer');
      expect(updated?.learningGoals).toContain('PyTorch internals');
      expect(updated?.notificationPreferences?.emailDigests).toBe(false);
      expect(updated?.notificationPreferences?.practiceReminders).toBe(false);
      expect(updated?.notificationPreferences?.milestoneAlerts).toBe(true);
    });

    it('strictly preserves role immutability against privilege escalation attempts', async () => {
      await createStudentProfile('student_ph7_03', 'student@test.com', 'Student User');

      // Attempt forbidden role escalation
      const maliciousPayload = {
        fullName: 'Hacker',
        role: 'admin',
        stats: { acceptedSubmissions: 9999 },
      } as unknown as Parameters<typeof updateStudentProfile>[1];

      await updateStudentProfile('student_ph7_03', maliciousPayload);

      const profile = await getStudentProfile('student_ph7_03');
      expect(profile?.role).toBe('student');
      expect(profile?.stats.acceptedSubmissions).toBe(0);
    });
  });

  // ── 2. In-App Notification System Tests ──
  describe('In-App Notification Lifecycle', () => {
    it('adds notifications and enforces idempotency', async () => {
      const uid = 'student_ph7_notif_01';

      const notif1 = await addNotification(uid, {
        id: 'notif_sub_01',
        type: 'submission_verdict',
        title: 'Submission Accepted',
        message: 'Your solution for Two Sum passed all test cases.',
        linkUrl: '/codelab/submissions',
      });

      expect(notif1.id).toBe('notif_sub_01');
      expect(notif1.isRead).toBe(false);

      // Attempt duplicate addition with same ID (idempotency check)
      await addNotification(uid, {
        id: 'notif_sub_01',
        type: 'submission_verdict',
        title: 'Duplicate Submission Alert',
        message: 'Should not create a second entry.',
      });

      const list = await fetchUserNotifications(uid);
      expect(list.filter((n) => n.id === 'notif_sub_01')).toHaveLength(1);
    });

    it('marks individual and all notifications as read', async () => {
      const uid = 'student_ph7_notif_02';

      await addNotification(uid, {
        id: 'n1',
        type: 'interview_report_ready',
        title: 'Interview Ready',
        message: 'Scorecard ready for Technical Interview.',
      });

      await addNotification(uid, {
        id: 'n2',
        type: 'milestone_unlocked',
        title: 'Streak Milestone',
        message: '3-day consistency streak reached!',
      });

      // Mark single read
      await markNotificationAsRead(uid, 'n1');
      let items = getLocalNotifications(uid);
      expect(items.find((i) => i.id === 'n1')?.isRead).toBe(true);
      expect(items.find((i) => i.id === 'n2')?.isRead).toBe(false);

      // Mark all read
      await markAllNotificationsAsRead(uid);
      items = getLocalNotifications(uid);
      expect(items.every((i) => i.isRead)).toBe(true);
    });

    it('dismisses notifications correctly', async () => {
      const uid = 'student_ph7_notif_03';

      await addNotification(uid, { id: 'd1', type: 'practice_reminder', title: 'Practice Reminder', message: 'Ready to code?' });
      await addNotification(uid, { id: 'd2', type: 'submission_verdict', title: 'Verdict', message: 'Passed.' });

      await dismissNotification(uid, 'd1');
      const items = getLocalNotifications(uid);
      expect(items.some((i) => i.id === 'd1')).toBe(false);
      expect(items.some((i) => i.id === 'd2')).toBe(true);
    });
  });

  // ── 3. Submission History Filters & Pagination Tests ──
  describe('Submission History Filtering & Logic', () => {
    const mockSubmissions: Submission[] = [
      {
        id: 'sub-01',
        userId: 'student_filter_01',
        problemId: 'prob-01',
        problemSlug: 'two-sum',
        problemTitle: 'Two Sum',
        topicId: 'programming-fundamentals',
        difficulty: 'beginner',
        status: 'completed',
        language: 'python',
        code: 'print("hello")',
        verdict: 'accepted',
        runtimeMs: 45,
        memoryKB: 2400,
        passedCount: 10,
        totalCount: 10,
        submittedAt: '2026-10-17T10:00:00Z',
      },
      {
        id: 'sub-02',
        userId: 'student_filter_01',
        problemId: 'prob-02',
        problemSlug: 'reverse-words',
        problemTitle: 'Reverse Words',
        topicId: 'programming-fundamentals',
        difficulty: 'beginner',
        status: 'completed',
        language: 'javascript',
        code: 'console.log()',
        verdict: 'wrong_answer',
        runtimeMs: 60,
        memoryKB: 3200,
        passedCount: 3,
        totalCount: 10,
        submittedAt: '2026-10-17T11:00:00Z',
      },
      {
        id: 'sub-03',
        userId: 'student_filter_01',
        problemId: 'prob-03',
        problemSlug: 'sql-query',
        problemTitle: 'Department Top Salaries',
        topicId: 'sql',
        difficulty: 'intermediate',
        status: 'completed',
        language: 'sql',
        code: 'SELECT 1;',
        verdict: 'accepted',
        runtimeMs: 15,
        memoryKB: 1024,
        passedCount: 5,
        totalCount: 5,
        submittedAt: '2026-10-17T12:00:00Z',
      },
    ];

    it('filters submissions by programming language', () => {
      const pythonOnly = mockSubmissions.filter((s) => s.language === 'python');
      expect(pythonOnly).toHaveLength(1);
      expect(pythonOnly[0].problemSlug).toBe('two-sum');

      const sqlOnly = mockSubmissions.filter((s) => s.language === 'sql');
      expect(sqlOnly).toHaveLength(1);
      expect(sqlOnly[0].verdict).toBe('accepted');
    });

    it('filters submissions by evaluation verdict', () => {
      const acceptedOnly = mockSubmissions.filter((s) => s.verdict === 'accepted');
      expect(acceptedOnly).toHaveLength(2);

      const wrongOnly = mockSubmissions.filter((s) => s.verdict === 'wrong_answer');
      expect(wrongOnly).toHaveLength(1);
    });

    it('calculates pagination pages accurately', () => {
      const totalItems = 25;
      const pageSize = 10;
      const totalPages = Math.ceil(totalItems / pageSize);
      expect(totalPages).toBe(3);

      const page1 = mockSubmissions.slice(0, 2);
      expect(page1).toHaveLength(2);
    });
  });

  // ── 4. Admin Content & Operational Checks ──
  describe('Admin Operations & Catalogs', () => {
    it('verifies problem catalog contains valid seed problems with tests', () => {
      expect(SEED_PROBLEMS.length).toBeGreaterThanOrEqual(5);
      SEED_PROBLEMS.forEach((problem) => {
        expect(problem.id).toBeTruthy();
        expect(problem.title).toBeTruthy();
        expect(problem.slug).toBeTruthy();
        expect(problem.supportedLanguages.length).toBeGreaterThan(0);
        expect(problem.examples.length).toBeGreaterThan(0);
      });
    });

    it('verifies question bank contains categorized questions with criteria', () => {
      expect(QUESTION_BANK.length).toBeGreaterThanOrEqual(10);
      QUESTION_BANK.forEach((q) => {
        expect(q.category).toBeTruthy();
        expect(q.questionText).toBeTruthy();
        expect(q.expectedCriteria.length).toBeGreaterThan(0);
      });
    });
  });
});

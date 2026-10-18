import { describe, it, expect, beforeEach } from 'vitest';
import {
  getDailyChallenge,
  getWeeklyChallenge,
  evaluateChallengeState,
  saveLocalChallengeCompletion,
  getLocalCompletedChallengeIds,
} from '@/services/challengeService';
import {
  computeLevelInfo,
  computeGamificationState,
  getLocalGamificationState,
  saveLocalGamificationState,
  ACHIEVEMENT_DEFINITIONS,
} from '@/services/gamificationService';
import { calculateLearningStreak } from '@/services/streakService';
import { getWeeklyLeaderboard } from '@/services/leaderboardService';
import {
  createSimulatorSession,
  submitSimulatorAnswer,
  completeSimulatorSession,
  getActiveSimulatorSession,
  saveActiveSimulatorSession,
  clearActiveSimulatorSession,
} from '@/services/simulatorService';
import { Submission } from '@/types/codelab';
import { InterviewSessionSummary } from '@/types/interview';
import { SimulatorConfig } from '@/types/simulator';
import { StudyPlan } from '@/types/studyPlan';

function mockSub(overrides: Partial<Submission>): Submission {
  return {
    id: `sub_${Math.random().toString(36).substring(2, 9)}`,
    userId: 'student_test',
    problemId: 'prob-two-sum',
    problemSlug: 'two-sum-indices',
    problemTitle: 'Two Sum',
    difficulty: 'beginner',
    topicId: 'programming-fundamentals',
    language: 'python',
    code: 'print("test")',
    status: 'completed',
    verdict: 'accepted',
    runtimeMs: 45,
    memoryKB: 14200,
    passedCount: 3,
    totalCount: 3,
    submittedAt: '2026-10-15T12:00:00.000Z',
    ...overrides,
  };
}

function mockInterview(overrides: Partial<InterviewSessionSummary>): InterviewSessionSummary {
  return {
    id: `int_${Math.random().toString(36).substring(2, 9)}`,
    userId: 'student_test',
    category: 'technical',
    targetRole: 'Software Engineer',
    difficulty: 'intermediate',
    durationMinutes: 30,
    questionCount: 3,
    status: 'completed',
    score: 82,
    createdAt: '2026-10-15T14:00:00.000Z',
    completedAt: '2026-10-15T14:00:00.000Z',
    ...overrides,
  };
}

describe('Phase 9 — Gamification, Challenges, Achievements & Interview Simulator', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // 1. Daily challenge stability
  it('Scenario 1: Daily challenge is deterministic for all students on the same UTC date', () => {
    const fixedDate = new Date('2026-10-17T00:00:00.000Z');
    const challengeA = getDailyChallenge(fixedDate);
    const challengeB = getDailyChallenge(fixedDate);

    expect(challengeA.id).toBe(challengeB.id);
    expect(challengeA.problemId).toBe(challengeB.problemId);
    expect(challengeA.title).toBe(challengeB.title);
    expect(challengeA.type).toBe('daily');
    expect(challengeA.xpReward).toBe(100);
  });

  // 2. Daily challenge rotation across dates
  it('Scenario 2: Daily challenge changes deterministically across different calendar dates', () => {
    const day1 = new Date('2026-10-17T00:00:00.000Z');
    const day2 = new Date('2026-10-18T00:00:00.000Z');

    const ch1 = getDailyChallenge(day1);
    const ch2 = getDailyChallenge(day2);

    expect(ch1.periodKey).not.toBe(ch2.periodKey);
  });

  // 3. Weekly challenge stability
  it('Scenario 3: Weekly challenge remains stable within the same calendar week', () => {
    const wednesday = new Date('2026-10-14T10:00:00.000Z');
    const friday = new Date('2026-10-16T18:00:00.000Z');

    const chWed = getWeeklyChallenge(wednesday);
    const chFri = getWeeklyChallenge(friday);

    expect(chWed.id).toBe(chFri.id);
    expect(chWed.periodKey).toBe(chFri.periodKey);
    expect(chWed.xpReward).toBe(250);
  });

  // 4. Challenge completion rules
  it('Scenario 4: Only accepted submissions count towards challenge completion', () => {
    const fixedDate = new Date('2026-10-17T00:00:00.000Z');
    const challenge = getDailyChallenge(fixedDate);

    // Failed submission
    const failedSub = mockSub({
      problemId: challenge.problemId,
      verdict: 'wrong_answer',
      submittedAt: '2026-10-17T10:00:00.000Z',
    });
    const stateFailed = evaluateChallengeState(challenge, [failedSub]);
    expect(stateFailed.isCompleted).toBe(false);

    // Accepted submission
    const acceptedSub = mockSub({
      problemId: challenge.problemId,
      verdict: 'accepted',
      submittedAt: '2026-10-17T10:00:00.000Z',
    });
    const stateAccepted = evaluateChallengeState(challenge, [acceptedSub]);
    expect(stateAccepted.isCompleted).toBe(true);
  });

  // 5. Personal bests tracking
  it('Scenario 5: Tracks personal best runtime and memory for completed challenges', () => {
    const fixedDate = new Date('2026-10-17T00:00:00.000Z');
    const challenge = getDailyChallenge(fixedDate);

    const sub1 = mockSub({
      problemId: challenge.problemId,
      verdict: 'accepted',
      runtimeMs: 80,
      memoryKB: 16000,
      submittedAt: '2026-10-17T08:00:00.000Z',
    });
    const sub2 = mockSub({
      problemId: challenge.problemId,
      verdict: 'accepted',
      runtimeMs: 35,
      memoryKB: 14000,
      submittedAt: '2026-10-17T09:00:00.000Z',
    });

    const evaluated = evaluateChallengeState(challenge, [sub1, sub2]);
    expect(evaluated.isCompleted).toBe(true);
    expect(evaluated.bestRuntimeMs).toBe(35);
    expect(evaluated.bestMemoryKB).toBe(14000);
  });

  // 6. Challenge persistence
  it('Scenario 6: Challenge completions persist in local storage', () => {
    const userId = 'student_persist';
    expect(Array.from(getLocalCompletedChallengeIds(userId))).toEqual([]);

    saveLocalChallengeCompletion(userId, 'daily_2026-10-17');
    saveLocalChallengeCompletion(userId, 'weekly_2026-W42');

    const completed = Array.from(getLocalCompletedChallengeIds(userId));
    expect(completed).toContain('daily_2026-10-17');
    expect(completed).toContain('weekly_2026-W42');
  });

  // 7. Quadratic Level Calculation
  it('Scenario 7: Level progression follows quadratic formula', () => {
    const lvl0 = computeLevelInfo(0);
    expect(lvl0.level).toBe(1);
    expect(lvl0.title).toBe('Novice Coder');
    expect(lvl0.progressPercent).toBe(0);

    const lvl100 = computeLevelInfo(100);
    expect(lvl100.level).toBe(2);

    const lvl500 = computeLevelInfo(500);
    expect(lvl500.level).toBeGreaterThanOrEqual(3);
    expect(lvl500.xpInCurrentLevel).toBeGreaterThanOrEqual(0);
  });

  // 8. XP calculation and ledger idempotency
  it('Scenario 8: XP ledger is idempotent and rejects duplicate awards for the same action', () => {
    const sub = mockSub({
      id: 'sub_unique_1',
      problemId: 'prob-two-sum',
      verdict: 'accepted',
    });

    const gam1 = computeGamificationState('student_1', [sub, sub], []);
    // Solving two-sum twice should only reward 50 XP once because transactions are deduplicated by referenceId
    const solveTxs = gam1.transactions.filter((tx) => tx.referenceId === 'prob-two-sum');
    expect(solveTxs.length).toBe(1);
    expect(gam1.totalXP).toBeGreaterThanOrEqual(50);
  });

  // 9. Achievement unlocking - first solve
  it('Scenario 9: Unlocks First Accepted Solution achievement upon first accepted submission', () => {
    const sub = mockSub({ verdict: 'accepted' });
    const gam = computeGamificationState('student_1', [sub], []);

    const firstSolveBadge = gam.badges.find((b) => b.id === 'first_accepted');
    expect(firstSolveBadge).toBeDefined();
    expect(firstSolveBadge?.isUnlocked).toBe(true);
    expect(firstSolveBadge?.progress).toBe(1);
  });

  // 10. Achievement unlocking - candidate in the arena
  it('Scenario 10: Unlocks Candidate In The Arena achievement upon interview completion', () => {
    const interview = mockInterview({ status: 'completed' });
    const gam = computeGamificationState('student_1', [], [interview]);

    const starterBadge = gam.badges.find((b) => b.id === 'interview_first');
    expect(starterBadge?.isUnlocked).toBe(true);
  });

  // 11. Locked badge progress tracking
  it('Scenario 11: Accurately reflects partial progress on locked badges', () => {
    const subs = [
      mockSub({ id: 's1', problemId: 'p1', verdict: 'accepted' }),
      mockSub({ id: 's2', problemId: 'p2', verdict: 'accepted' }),
    ];
    const gam = computeGamificationState('student_1', subs, []);

    const adeptBadge = gam.badges.find((b) => b.id === 'problems_5');
    expect(adeptBadge?.isUnlocked).toBe(false);
    expect(adeptBadge?.progress).toBe(2);
    expect(adeptBadge?.maxProgress).toBe(5);
  });

  // 12. Streak Engine - Consecutive UTC Days
  it('Scenario 12: Calculates consecutive calendar streak correctly across UTC days', () => {
    const s1 = mockSub({ submittedAt: '2026-10-15T10:00:00.000Z' });
    const s2 = mockSub({ submittedAt: '2026-10-16T12:00:00.000Z' });
    const s3 = mockSub({ submittedAt: '2026-10-17T09:00:00.000Z' });

    const streak = calculateLearningStreak([s1, s2, s3], [], new Date('2026-10-17T15:00:00.000Z'));
    expect(streak.currentStreak).toBe(3);
    expect(streak.longestStreak).toBe(3);
    expect(streak.isActiveToday).toBe(true);
  });

  // 13. Streak Engine - Same Day Multiple Submissions
  it('Scenario 13: Multiple submissions on the same calendar day count as 1 streak day', () => {
    const s1 = mockSub({ submittedAt: '2026-10-17T08:00:00.000Z' });
    const s2 = mockSub({ submittedAt: '2026-10-17T12:00:00.000Z' });
    const s3 = mockSub({ submittedAt: '2026-10-17T18:00:00.000Z' });

    const streak = calculateLearningStreak([s1, s2, s3], [], new Date('2026-10-17T20:00:00.000Z'));
    expect(streak.currentStreak).toBe(1);
    expect(streak.qualifyingActivityCount).toBe(3);
  });

  // 14. Streak Engine - Broken Streak
  it('Scenario 14: Resets current streak when a UTC calendar day is skipped', () => {
    const s1 = mockSub({ submittedAt: '2026-10-10T10:00:00.000Z' });
    const s2 = mockSub({ submittedAt: '2026-10-11T12:00:00.000Z' });
    // Skipped Oct 12, 13, 14, 15, 16
    const s3 = mockSub({ submittedAt: '2026-10-17T09:00:00.000Z' });

    const streak = calculateLearningStreak([s1, s2, s3], [], new Date('2026-10-17T15:00:00.000Z'));
    expect(streak.currentStreak).toBe(1);
    expect(streak.longestStreak).toBe(2);
  });

  // 15. Leaderboard tie-breaking
  it('Scenario 15: Resolves leaderboard rankings with deterministic tie-breaking', () => {
    const leaderboard = getWeeklyLeaderboard('student_cur', false, {
      xp: 450,
      challengesCompleted: 3,
      currentStreak: 4,
    });

    expect(leaderboard.length).toBeGreaterThan(0);
    // Verify sorted descending by XP
    for (let i = 0; i < leaderboard.length - 1; i++) {
      expect(leaderboard[i].xp).toBeGreaterThanOrEqual(leaderboard[i + 1].xp);
      expect(leaderboard[i].rank).toBe(i + 1);
    }
  });

  // 16. Leaderboard privacy opt-out
  it('Scenario 16: Anonymizes current student on leaderboard when optOutLeaderboard is true', () => {
    const optOutBoard = getWeeklyLeaderboard('student_cur', true, {
      xp: 9999,
      challengesCompleted: 10,
      currentStreak: 15,
    });

    const entry = optOutBoard.find((e) => e.userId === 'student_cur');
    expect(entry).toBeDefined();
    expect(entry?.displayName).toBe('Anonymous Candidate');
  });

  // 17. Interview Simulator Session Creation
  it('Scenario 17: Creates configured interview simulator session with server deadline', () => {
    const config: SimulatorConfig = {
      targetRole: 'Full Stack Engineer',
      category: 'technical',
      difficulty: 'intermediate',
      questionCount: 3,
      durationMinutes: 20,
      isTimed: true,
      allowVoice: false,
    };

    const session = createSimulatorSession('student_sim', config);
    expect(session.id).toBeDefined();
    expect(session.status).toBe('in_progress');
    expect(session.questions.length).toBe(3);
    expect(session.currentQuestionIndex).toBe(0);
    expect(new Date(session.expiresAt).getTime()).toBeGreaterThan(new Date(session.startedAt).getTime());
  });

  // 18. Simulator follow-up question generation
  it('Scenario 18: Generates dynamic follow-up questions when enabled for technical round', () => {
    const config: SimulatorConfig = {
      targetRole: 'Software Engineer',
      category: 'technical',
      difficulty: 'intermediate',
      questionCount: 2,
      durationMinutes: 15,
      isTimed: true,
      allowVoice: false,
    };

    const session = createSimulatorSession('student_sim', config);
    const qId = session.questions[0].id;
    const { session: updated, followUp } = submitSimulatorAnswer(
      session,
      qId,
      'I led a migration project where we had conflicting deadlines. I prioritized core APIs first and addressed trade-offs carefully.',
      false
    );

    const answeredQ = updated.answers[qId];
    expect(answeredQ).toBeDefined();
    expect(answeredQ.score).toBeGreaterThan(0);
    expect(answeredQ.feedback).toBeDefined();
    expect(followUp).toBeDefined();
    expect(followUp?.questionText).toBeDefined();
  });

  // 19. Simulator multi-question progression
  it('Scenario 19: Advances questions until reaching session completion', async () => {
    const config: SimulatorConfig = {
      targetRole: 'Frontend Engineer',
      category: 'programming',
      difficulty: 'beginner',
      questionCount: 2,
      durationMinutes: 10,
      isTimed: false,
      allowVoice: false,
    };

    let session = createSimulatorSession('student_sim', config);
    expect(session.currentQuestionIndex).toBe(0);

    const q1 = session.questions[0].id;
    const res1 = submitSimulatorAnswer(session, q1, 'Answer 1 with sufficient technical depth and detail.');
    session = res1.session;

    const q2 = session.questions[1].id;
    const res2 = submitSimulatorAnswer(session, q2, 'Answer 2 covering algorithms, complexity, and performance trade-offs.');
    session = res2.session;

    const completed = await completeSimulatorSession(session);
    expect(completed.status).toBe('completed');
    expect(completed.scorecard).toBeDefined();
    expect(completed.scorecard?.overallScore).toBeGreaterThan(0);
  });

  // 20. Simulator Scorecard Generation
  it('Scenario 20: Generates complete scorecard with performance breakdown', async () => {
    const config: SimulatorConfig = {
      targetRole: 'Backend Engineer',
      category: 'sql',
      difficulty: 'intermediate',
      questionCount: 1,
      durationMinutes: 10,
      isTimed: false,
      allowVoice: false,
    };

    const session = createSimulatorSession('student_sim', config);
    const q1 = session.questions[0].id;
    const { session: answered } = submitSimulatorAnswer(
      session,
      q1,
      'I would partition the database using consistent hashing with virtual nodes and read replicas to optimize latency and complexity.'
    );

    const completed = await completeSimulatorSession(answered);
    expect(completed.status).toBe('completed');
    expect(completed.scorecard).toBeDefined();
    expect(completed.scorecard?.overallScore).toBeGreaterThanOrEqual(0);
    expect(completed.scorecard?.recommendations.length).toBeGreaterThan(0);
    expect(completed.scorecard?.keyStrengths.length).toBeGreaterThan(0);
  });

  // 21. Simulator local storage persistence
  it('Scenario 21: Preserves in-progress session across reloads in localStorage', () => {
    const config: SimulatorConfig = {
      targetRole: 'Data Engineer',
      category: 'technical',
      difficulty: 'beginner',
      questionCount: 2,
      durationMinutes: 15,
      isTimed: true,
      allowVoice: false,
    };

    const session = createSimulatorSession('student_sim', config);
    saveActiveSimulatorSession(session);

    const reloaded = getActiveSimulatorSession('student_sim');
    expect(reloaded).not.toBeNull();
    expect(reloaded?.id).toBe(session.id);
    expect(reloaded?.config.targetRole).toBe('Data Engineer');

    clearActiveSimulatorSession('student_sim');
    expect(getActiveSimulatorSession('student_sim')).toBeNull();
  });

  // 22. Completed session produces interview summary for unified analytics
  it('Scenario 22: Completed simulator session provides interview summary', async () => {
    const config: SimulatorConfig = {
      targetRole: 'Software Engineer',
      category: 'behavioral',
      difficulty: 'beginner',
      questionCount: 1,
      durationMinutes: 10,
      isTimed: false,
      allowVoice: false,
    };

    const session = createSimulatorSession('student_sim', config);
    const q1 = session.questions[0].id;
    const { session: answered } = submitSimulatorAnswer(session, q1, 'I handled conflict by listening and reaching consensus.');

    const summary = await completeSimulatorSession(answered);
    expect(summary.scorecard).toBeDefined();
    expect(summary.completedAt).toBeDefined();
  });

  // 23. Study plan task completion awards XP
  it('Scenario 23: Completed study plan tasks award 25 XP per task idempotently', () => {
    const plan: StudyPlan = {
      id: 'plan_1',
      userId: 'student_1',
      title: 'Software Engineer Prep',
      targetRole: 'Software Engineer',
      focusTopics: ['Algorithms'],
      weeklyHours: 5,
      preferredDays: [1, 3, 5],
      startDate: '2026-10-10',
      status: 'active',
      progressPercent: 50,
      tasks: [
        {
          id: 'task_1',
          planId: 'plan_1',
          title: 'Two Sum',
          topic: 'Algorithms',
          taskType: 'solve_problem',
          targetId: 'two-sum-indices',
          difficulty: 'beginner',
          estimatedMinutes: 30,
          reason: 'Core practice',
          actionUrl: '/codelab/workspace/prob-two-sum',
          isCompleted: true,
          scheduledDayIndex: 1,
          dayLabel: 'Monday',
        },
        {
          id: 'task_2',
          planId: 'plan_1',
          title: 'Array Revision',
          topic: 'Algorithms',
          taskType: 'concept_review',
          targetId: 'arrays',
          difficulty: 'beginner',
          estimatedMinutes: 20,
          reason: 'Review foundations',
          actionUrl: '/codelab/problems',
          isCompleted: false,
          scheduledDayIndex: 3,
          dayLabel: 'Wednesday',
        },
      ],
      createdAt: '2026-10-10',
      updatedAt: '2026-10-10',
    };

    const gam = computeGamificationState('student_1', [], [], new Set(), plan);
    const taskTxs = gam.transactions.filter((tx) => tx.source === 'study_task');
    expect(taskTxs.length).toBe(1);
    expect(taskTxs[0].amount).toBe(25);
  });

  // 24. Challenge completion awards bonus XP
  it('Scenario 24: Completed daily challenge awards 100 XP', () => {
    const completedChallengeIds = new Set(['daily_2026-10-17']);
    const gam = computeGamificationState('student_1', [], [], completedChallengeIds);

    const chTxs = gam.transactions.filter((tx) => tx.source === 'daily_challenge');
    expect(chTxs.length).toBe(1);
    expect(chTxs[0].amount).toBe(100);
  });

  // 25. Streak milestones award XP
  it('Scenario 25: 7-day streak milestone awards 100 bonus XP', () => {
    const streak = {
      currentStreak: 7,
      longestStreak: 7,
      lastQualifyingDate: '2026-10-17',
      isActiveToday: true,
      qualifyingActivityCount: 7,
    };

    const gam = computeGamificationState('student_1', [], [], new Set(), null, streak);
    const streakTxs = gam.transactions.filter((tx) => tx.source === 'streak_milestone');
    expect(streakTxs.length).toBe(1);
    expect(streakTxs[0].amount).toBe(100);
  });

  // 26. Local gamification state persistence
  it('Scenario 26: Local gamification state serializes and deserializes accurately', () => {
    const userId = 'student_cache_test';
    const sub = mockSub({ verdict: 'accepted' });
    const gam = computeGamificationState(userId, [sub], []);

    saveLocalGamificationState(gam);
    const cached = getLocalGamificationState(userId);

    expect(cached).not.toBeNull();
    expect(cached?.userId).toBe(userId);
    expect(cached?.totalXP).toBe(gam.totalXP);
    expect(cached?.badges.length).toBe(ACHIEVEMENT_DEFINITIONS.length);
  });
});

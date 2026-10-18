import {
  AchievementBadge,
  StudentLevelInfo,
  XPTransaction,
  StreakInfo,
} from '@/types/gamification';
import { Submission } from '@/types/codelab';
import { InterviewSessionSummary } from '@/types/interview';
import { StudyPlan } from '@/types/studyPlan';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

const LOCAL_STORAGE_XP_PREFIX = 'nexora_gamification_state_';

export const ALL_ACHIEVEMENT_DEFINITIONS: Omit<AchievementBadge, 'isUnlocked' | 'progress' | 'unlockedAt' | 'verifiedEvidence'>[] = [
  {
    id: 'first_accepted',
    title: 'First Accepted Solution',
    description: 'Compile an accepted solution with 100% test case pass rate in CodeLab.',
    category: 'coding',
    icon: 'check-circle-2',
    xpReward: 50,
    maxProgress: 1,
  },
  {
    id: 'problems_5',
    title: 'Algorithm Apprentice',
    description: 'Solve 5 unique programming problems in CodeLab.',
    category: 'coding',
    icon: 'code-2',
    xpReward: 150,
    maxProgress: 5,
  },
  {
    id: 'problems_10',
    title: 'Problem Solving Pro',
    description: 'Solve 10 unique programming problems in CodeLab.',
    category: 'coding',
    icon: 'trophy',
    xpReward: 300,
    maxProgress: 10,
  },
  {
    id: 'daily_first',
    title: 'Daily Dedication',
    description: 'Successfully complete a Daily Coding Challenge on its active calendar day.',
    category: 'consistency',
    icon: 'calendar-check',
    xpReward: 100,
    maxProgress: 1,
  },
  {
    id: 'weekly_first',
    title: 'Weekly Warrior',
    description: 'Solve the designated Weekly Challenge within its assigned time window.',
    category: 'consistency',
    icon: 'award',
    xpReward: 250,
    maxProgress: 1,
  },
  {
    id: 'interview_first',
    title: 'Candidate In The Arena',
    description: 'Complete a full mock diagnostic session in InterviewAI and generate a verified scorecard.',
    category: 'interview',
    icon: 'sparkles',
    xpReward: 100,
    maxProgress: 1,
  },
  {
    id: 'study_task_first',
    title: 'Plan In Action',
    description: 'Complete a verified milestone in your active Personalized Study Plan.',
    category: 'mastery',
    icon: 'target',
    xpReward: 50,
    maxProgress: 1,
  },
  {
    id: 'streak_3',
    title: 'Consistent Momentum',
    description: 'Maintain a 3-day learning streak of qualifying CodeLab or InterviewAI activity.',
    category: 'consistency',
    icon: 'flame',
    xpReward: 100,
    maxProgress: 3,
  },
  {
    id: 'streak_7',
    title: 'Unstoppable Habit',
    description: 'Reach a 7-day learning streak of continuous practice.',
    category: 'consistency',
    icon: 'zap',
    xpReward: 250,
    maxProgress: 7,
  },
  {
    id: 'multi_lang',
    title: 'Polyglot Programmer',
    description: 'Submit accepted solutions in 2 or more distinct programming languages.',
    category: 'coding',
    icon: 'layers',
    xpReward: 150,
    maxProgress: 2,
  },
];

/**
 * Calculates level info from total XP using a transparent quadratic curve
 */
export function calculateLevelFromXP(totalXP: number): StudentLevelInfo {
  // Threshold for level L: XP(L) = 50 * (L - 1) * L
  // Level 1: 0 XP
  // Level 2: 100 XP
  // Level 3: 300 XP
  // Level 4: 600 XP
  // Level 5: 1000 XP
  let level = 1;
  while (true) {
    const nextLevelThreshold = 50 * level * (level + 1);
    if (totalXP >= nextLevelThreshold) {
      level += 1;
    } else {
      break;
    }
  }

  const currentLevelStartXP = 50 * (level - 1) * level;
  const nextLevelThreshold = 50 * level * (level + 1);
  const xpRequiredForNextLevel = nextLevelThreshold - currentLevelStartXP;
  const xpInCurrentLevel = totalXP - currentLevelStartXP;
  const progressPercent = Math.min(100, Math.round((xpInCurrentLevel / xpRequiredForNextLevel) * 100));

  let title = 'Novice Coder';
  if (level >= 15) title = 'Master Software Engineer';
  else if (level >= 10) title = 'Interview-Ready Engineer';
  else if (level >= 7) title = 'CodeLab Specialist';
  else if (level >= 4) title = 'Algorithmic Explorer';
  else if (level >= 2) title = 'Junior Problem Solver';

  return {
    level,
    currentXP: totalXP,
    xpInCurrentLevel,
    xpRequiredForNextLevel,
    progressPercent,
    title,
  };
}

export interface GamificationState {
  userId: string;
  totalXP: number;
  levelInfo: StudentLevelInfo;
  badges: AchievementBadge[];
  transactions: XPTransaction[];
}

/**
 * Derives XP and Achievements idempotently from authentic student records
 */
export function computeGamificationState(
  userId: string,
  submissions: Submission[] = [],
  interviews: InterviewSessionSummary[] = [],
  completedChallengeIds: Set<string> = new Set(),
  studyPlan: StudyPlan | null = null,
  streakInfo: StreakInfo = { currentStreak: 0, longestStreak: 0, lastQualifyingDate: null, isActiveToday: false, qualifyingActivityCount: 0 }
): GamificationState {
  const transactions: XPTransaction[] = [];
  const seenTxKeys = new Set<string>();

  const addTx = (amount: number, source: XPTransaction['source'], referenceId: string, description: string, createdAt: string) => {
    const key = `${source}_${referenceId}`;
    if (!seenTxKeys.has(key)) {
      seenTxKeys.add(key);
      transactions.push({
        id: `tx_${key}`,
        userId,
        amount,
        source,
        referenceId,
        description,
        createdAt,
      });
    }
  };

  // 1. Unique Solved Problems: 50 XP each (earliest accepted submission)
  const solvedProblemMap = new Map<string, Submission>();
  const solvedLanguages = new Set<string>();

  submissions.forEach((s) => {
    if (s.verdict === 'accepted') {
      if (s.language) solvedLanguages.add(s.language.toLowerCase());
      const existing = solvedProblemMap.get(s.problemId);
      if (!existing || new Date(s.submittedAt).getTime() < new Date(existing.submittedAt).getTime()) {
        solvedProblemMap.set(s.problemId, s);
      }
    }
  });

  solvedProblemMap.forEach((sub, probId) => {
    addTx(50, 'problem_solve', probId, `First verified solve for ${sub.problemTitle || probId}`, sub.submittedAt);
  });

  // 2. Completed Daily/Weekly Challenges
  completedChallengeIds.forEach((chId) => {
    const isDaily = chId.includes('daily');
    const xp = isDaily ? 100 : 250;
    addTx(xp, isDaily ? 'daily_challenge' : 'weekly_challenge', chId, `Completed ${isDaily ? 'Daily' : 'Weekly'} Challenge (${chId})`, new Date().toISOString());
  });

  // 3. Completed Interviews: 75 XP each
  interviews.forEach((i) => {
    if (i.status === 'completed') {
      addTx(75, 'mock_interview', i.id, `Completed ${i.category} mock interview`, i.createdAt);
    }
  });

  // 4. Completed Study Tasks: 25 XP each
  const planTasks = studyPlan
    ? (Array.isArray(studyPlan.tasks)
        ? studyPlan.tasks
        : (studyPlan as any).weeks
        ? (studyPlan as any).weeks.flatMap((w: any) => w.tasks || [])
        : [])
    : [];

  planTasks.forEach((t: any) => {
    if (t.isCompleted) {
      addTx(25, 'study_task', t.id, `Completed study task: ${t.title}`, t.completedAt || studyPlan?.updatedAt || new Date().toISOString());
    }
  });

  // 5. Streak Milestones: +100 XP for 7-day streak
  if (streakInfo.longestStreak >= 7) {
    addTx(100, 'streak_milestone', 'streak_7', 'Achieved 7-day consistency streak milestone', new Date().toISOString());
  }

  const totalXP = transactions.reduce((acc, curr) => acc + curr.amount, 0);
  const levelInfo = calculateLevelFromXP(totalXP);

  // Evaluate Achievements
  const uniqueSolvedCount = solvedProblemMap.size;
  const completedInterviewsCount = interviews.filter((i) => i.status === 'completed').length;
  const completedDailyCount = Array.from(completedChallengeIds).filter((id) => id.includes('daily')).length;
  const completedWeeklyCount = Array.from(completedChallengeIds).filter((id) => id.includes('weekly')).length;
  const completedTasksCount = planTasks.filter((t: any) => t.isCompleted).length;
  const maxStreak = Math.max(streakInfo.currentStreak, streakInfo.longestStreak);

  const badges: AchievementBadge[] = ALL_ACHIEVEMENT_DEFINITIONS.map((def) => {
    let progress = 0;
    let isUnlocked = false;
    let unlockedAt: string | undefined = undefined;
    let verifiedEvidence: string | undefined = undefined;

    switch (def.id) {
      case 'first_accepted':
        progress = Math.min(1, uniqueSolvedCount);
        isUnlocked = uniqueSolvedCount >= 1;
        if (isUnlocked) verifiedEvidence = `${uniqueSolvedCount} problem(s) solved with 100% test pass rate`;
        break;
      case 'problems_5':
        progress = Math.min(5, uniqueSolvedCount);
        isUnlocked = uniqueSolvedCount >= 5;
        if (isUnlocked) verifiedEvidence = `${uniqueSolvedCount}/5 unique problems solved in CodeLab`;
        break;
      case 'problems_10':
        progress = Math.min(10, uniqueSolvedCount);
        isUnlocked = uniqueSolvedCount >= 10;
        if (isUnlocked) verifiedEvidence = `${uniqueSolvedCount}/10 unique problems solved in CodeLab`;
        break;
      case 'daily_first':
        progress = Math.min(1, completedDailyCount);
        isUnlocked = completedDailyCount >= 1;
        if (isUnlocked) verifiedEvidence = `${completedDailyCount} daily challenge(s) verified`;
        break;
      case 'weekly_first':
        progress = Math.min(1, completedWeeklyCount);
        isUnlocked = completedWeeklyCount >= 1;
        if (isUnlocked) verifiedEvidence = `${completedWeeklyCount} weekly challenge(s) verified`;
        break;
      case 'interview_first':
        progress = Math.min(1, completedInterviewsCount);
        isUnlocked = completedInterviewsCount >= 1;
        if (isUnlocked) verifiedEvidence = `${completedInterviewsCount} mock interview(s) completed`;
        break;
      case 'study_task_first':
        progress = Math.min(1, completedTasksCount);
        isUnlocked = completedTasksCount >= 1;
        if (isUnlocked) verifiedEvidence = `${completedTasksCount} study task(s) auto-verified`;
        break;
      case 'streak_3':
        progress = Math.min(3, maxStreak);
        isUnlocked = maxStreak >= 3;
        if (isUnlocked) verifiedEvidence = `Active streak reached ${maxStreak} days`;
        break;
      case 'streak_7':
        progress = Math.min(7, maxStreak);
        isUnlocked = maxStreak >= 7;
        if (isUnlocked) verifiedEvidence = `Active streak reached ${maxStreak} days`;
        break;
      case 'multi_lang':
        progress = Math.min(2, solvedLanguages.size);
        isUnlocked = solvedLanguages.size >= 2;
        if (isUnlocked) verifiedEvidence = `Solved in: ${Array.from(solvedLanguages).join(', ')}`;
        break;
    }

    return {
      ...def,
      progress,
      isUnlocked,
      unlockedAt,
      verifiedEvidence,
    };
  });

  return {
    userId,
    totalXP,
    levelInfo,
    badges,
    transactions,
  };
}

/**
 * Cache gamification state locally
 */
export function saveLocalGamificationState(state: GamificationState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${LOCAL_STORAGE_XP_PREFIX}${state.userId}`, JSON.stringify(state));
  } catch {
    // Ignore storage errors
  }

  if (db) {
    try {
      const stateRef = doc(db, 'users', state.userId, 'gamification', 'summary');
      setDoc(
        stateRef,
        {
          totalXP: state.totalXP,
          level: state.levelInfo.level,
          title: state.levelInfo.title,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      ).catch(() => {});
    } catch {
      // Ignore
    }
  }
}

/**
 * Get cached gamification state
 */
export function getLocalGamificationState(userId: string): GamificationState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_XP_PREFIX}${userId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const ACHIEVEMENT_DEFINITIONS = ALL_ACHIEVEMENT_DEFINITIONS;
export const computeLevelInfo = calculateLevelFromXP;


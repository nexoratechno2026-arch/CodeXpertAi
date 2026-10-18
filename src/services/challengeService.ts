import { CodingChallenge } from '@/types/gamification';
import { SEED_PROBLEMS } from '@/data/seedProblems';
import { Submission } from '@/types/codelab';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

const LOCAL_STORAGE_CHALLENGE_PREFIX = 'nexora_challenge_completions_';

/**
 * Returns the UTC date string formatted as YYYY-MM-DD
 */
export function getUtcDateString(d: Date = new Date()): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Returns the ISO week string formatted as YYYY-Www
 */
export function getUtcWeekString(d: Date = new Date()): string {
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNr = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setUTCMonth(0, 1);
  if (target.getUTCDay() !== 4) {
    target.setUTCMonth(0, 1 + ((4 - target.getUTCDay() + 7) % 7));
  }
  const weekNum = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  return `${target.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

/**
 * Simple deterministic hash from string to positive integer
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Generates the current Daily Coding Challenge deterministically using UTC date
 */
export function getDailyChallenge(date: Date = new Date()): CodingChallenge {
  const periodKey = getUtcDateString(date);
  const problems = SEED_PROBLEMS;
  const hash = hashString(`daily_${periodKey}`);
  const assignedProblem = problems[hash % problems.length];

  const startDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0)).toISOString();
  const endDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999)).toISOString();

  return {
    id: `challenge_daily_${periodKey}`,
    type: 'daily',
    title: `Daily Challenge: ${assignedProblem.title}`,
    description: `Solve today's algorithmic challenge to earn bonus XP and maintain your practice streak.`,
    problemId: assignedProblem.id,
    problemSlug: assignedProblem.slug,
    difficulty: assignedProblem.difficulty,
    topicName: assignedProblem.topicName,
    supportedLanguages: assignedProblem.supportedLanguages,
    periodKey,
    startDate,
    endDate,
    xpReward: 100,
    isCompleted: false,
  };
}

/**
 * Generates the current Weekly Coding Challenge deterministically using ISO week
 */
export function getWeeklyChallenge(date: Date = new Date()): CodingChallenge {
  const periodKey = getUtcWeekString(date);
  // Pick from intermediate or advanced problems if available
  const hardProblems = SEED_PROBLEMS.filter(
    (p) => p.difficulty === 'intermediate' || p.difficulty === 'advanced' || p.difficulty === 'expert'
  );
  const candidates = hardProblems.length > 0 ? hardProblems : SEED_PROBLEMS;
  const hash = hashString(`weekly_${periodKey}`);
  const assignedProblem = candidates[hash % candidates.length];

  const now = new Date(date);
  const day = now.getUTCDay();
  const diffToMonday = (day + 6) % 7;
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - diffToMonday, 0, 0, 0));
  const sunday = new Date(Date.UTC(monday.getUTCFullYear(), monday.getUTCMonth(), monday.getUTCDate() + 6, 23, 59, 59, 999));

  return {
    id: `challenge_weekly_${periodKey}`,
    type: 'weekly',
    title: `Weekly Challenge: ${assignedProblem.title}`,
    description: `Deep-dive problem of the week. Master complex trade-offs and edge-case execution for +250 XP.`,
    problemId: assignedProblem.id,
    problemSlug: assignedProblem.slug,
    difficulty: assignedProblem.difficulty,
    topicName: assignedProblem.topicName,
    supportedLanguages: assignedProblem.supportedLanguages,
    periodKey,
    startDate: monday.toISOString(),
    endDate: sunday.toISOString(),
    xpReward: 250,
    isCompleted: false,
  };
}

/**
 * Evaluates completion state and personal best metrics for a challenge using genuine submissions
 */
export function evaluateChallengeState(
  challenge: CodingChallenge,
  submissions: Submission[]
): CodingChallenge {
  // Find accepted submissions for this challenge's problem within its valid time window
  const matchingAccepted = submissions.filter((s) => {
    const isMatchingProb = s.problemId === challenge.problemId || s.problemSlug === challenge.problemSlug;
    if (!isMatchingProb || s.verdict !== 'accepted') return false;

    // Must be submitted at or after challenge startDate
    const subTime = new Date(s.submittedAt).getTime();
    const startTime = new Date(challenge.startDate).getTime();
    return subTime >= startTime;
  });

  if (matchingAccepted.length === 0) {
    return { ...challenge, isCompleted: false };
  }

  // Sort by runtime ascending to compute personal best
  const sortedByRuntime = [...matchingAccepted].sort((a, b) => (a.runtimeMs || 999999) - (b.runtimeMs || 999999));
  const sortedByMemory = [...matchingAccepted].sort((a, b) => (a.memoryKB || 999999) - (b.memoryKB || 999999));
  const earliestSuccess = [...matchingAccepted].sort(
    (a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
  )[0];

  return {
    ...challenge,
    isCompleted: true,
    completedAt: earliestSuccess.submittedAt,
    bestRuntimeMs: sortedByRuntime[0].runtimeMs ?? undefined,
    bestMemoryKB: sortedByMemory[0].memoryKB ?? undefined,
  };
}

/**
 * Get cached completed challenge IDs for user
 */
export function getLocalCompletedChallengeIds(userId: string): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_CHALLENGE_PREFIX}${userId}`);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

/**
 * Saves a completed challenge record
 */
export async function recordChallengeCompletion(
  userId: string,
  challenge: CodingChallenge
): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const existing = getLocalCompletedChallengeIds(userId);
    existing.add(challenge.id);
    localStorage.setItem(
      `${LOCAL_STORAGE_CHALLENGE_PREFIX}${userId}`,
      JSON.stringify(Array.from(existing))
    );
  } catch {
    // Ignore storage errors
  }

  if (db) {
    try {
      const completionRef = doc(db, 'users', userId, 'challengeCompletions', challenge.id);
      await setDoc(completionRef, {
        challengeId: challenge.id,
        type: challenge.type,
        problemId: challenge.problemId,
        periodKey: challenge.periodKey,
        completedAt: challenge.completedAt || new Date().toISOString(),
        bestRuntimeMs: challenge.bestRuntimeMs || null,
        bestMemoryKB: challenge.bestMemoryKB || null,
      }, { merge: true });
    } catch (err) {
      console.warn('[ChallengeService] Failed to persist challenge completion:', err);
    }
  }
}

/**
 * Direct synchronous helper for saving challenge completion ID locally
 */
export function saveLocalChallengeCompletion(userId: string, challengeOrId: CodingChallenge | string): void {
  if (typeof window === 'undefined') return;
  try {
    const id = typeof challengeOrId === 'string' ? challengeOrId : challengeOrId.id;
    const existing = getLocalCompletedChallengeIds(userId);
    existing.add(id);
    localStorage.setItem(
      `${LOCAL_STORAGE_CHALLENGE_PREFIX}${userId}`,
      JSON.stringify(Array.from(existing))
    );
  } catch {
    // Ignore storage errors
  }
}


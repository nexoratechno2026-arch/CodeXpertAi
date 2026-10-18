import { StreakInfo } from '@/types/gamification';
import { Submission } from '@/types/codelab';
import { InterviewSessionSummary } from '@/types/interview';
import { getUtcDateString } from './challengeService';

/**
 * Calculates current streak and longest streak deterministically from authentic activity
 * Timezone: UTC calendar dates (YYYY-MM-DD)
 */
export function calculateLearningStreak(
  submissions: Submission[] = [],
  interviews: InterviewSessionSummary[] = [],
  referenceDate: Date = new Date()
): StreakInfo {
  // Collect all unique UTC dates on which genuine qualifying activity occurred
  const qualifyingDates = new Set<string>();
  let activityCount = 0;

  // 1. Accepted CodeLab submissions count as qualifying
  submissions.forEach((s) => {
    if (s.verdict === 'accepted' && s.submittedAt) {
      const dateStr = getUtcDateString(new Date(s.submittedAt));
      qualifyingDates.add(dateStr);
      activityCount++;
    }
  });

  // 2. Completed InterviewAI sessions count as qualifying
  interviews.forEach((i) => {
    if (i.status === 'completed' && i.createdAt) {
      const dateStr = getUtcDateString(new Date(i.createdAt));
      qualifyingDates.add(dateStr);
      activityCount++;
    }
  });

  if (activityCount === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastQualifyingDate: null,
      isActiveToday: false,
      qualifyingActivityCount: 0,
    };
  }

  // Sort dates descending
  const sortedDates = Array.from(qualifyingDates).sort((a, b) => b.localeCompare(a));
  const todayStr = getUtcDateString(referenceDate);

  // Determine yesterday UTC string
  const yesterday = new Date(Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth(), referenceDate.getUTCDate() - 1));
  const yesterdayStr = getUtcDateString(yesterday);

  const isActiveToday = qualifyingDates.has(todayStr);
  const lastQualifyingDate = sortedDates[0];

  // A streak is active if the student was active today OR yesterday
  let currentStreak = 0;
  if (isActiveToday || qualifyingDates.has(yesterdayStr)) {
    let checkDate = new Date(Date.UTC(
      referenceDate.getUTCFullYear(),
      referenceDate.getUTCMonth(),
      referenceDate.getUTCDate() - (isActiveToday ? 0 : 1)
    ));

    while (true) {
      const dateKey = getUtcDateString(checkDate);
      if (qualifyingDates.has(dateKey)) {
        currentStreak += 1;
        checkDate.setUTCDate(checkDate.getUTCDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate longest streak historically
  let longestStreak = 0;
  let runningStreak = 0;
  let previousDate: Date | null = null;

  // Sort ascending for chronological calculation
  const chronologicalDates = Array.from(qualifyingDates).sort((a, b) => a.localeCompare(b));
  for (const dateKey of chronologicalDates) {
    const [y, m, d] = dateKey.split('-').map(Number);
    const currentDate = new Date(Date.UTC(y, m - 1, d));

    if (!previousDate) {
      runningStreak = 1;
    } else {
      const diffDays = Math.round((currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        runningStreak += 1;
      } else {
        runningStreak = 1;
      }
    }
    previousDate = currentDate;
    if (runningStreak > longestStreak) {
      longestStreak = runningStreak;
    }
  }

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    lastQualifyingDate,
    isActiveToday,
    qualifyingActivityCount: activityCount,
  };
}

import { SkillLevel } from './skill';
import { ProgrammingLanguage } from './user';

export type XPSource =
  | 'problem_solve'
  | 'daily_challenge'
  | 'weekly_challenge'
  | 'mock_interview'
  | 'study_task'
  | 'streak_milestone';

export interface XPTransaction {
  id: string;
  userId: string;
  amount: number;
  source: XPSource;
  referenceId: string; // e.g. submissionId, challengeId, sessionId
  description: string;
  createdAt: string;
}

export interface StudentLevelInfo {
  level: number;
  currentXP: number;
  xpInCurrentLevel: number;
  xpRequiredForNextLevel: number;
  progressPercent: number;
  title: string;
}

export type AchievementCategory = 'coding' | 'interview' | 'consistency' | 'mastery';

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  xpReward: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
  verifiedEvidence?: string;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastQualifyingDate: string | null; // YYYY-MM-DD
  isActiveToday: boolean;
  qualifyingActivityCount: number;
}

export type ChallengeType = 'daily' | 'weekly';

export interface CodingChallenge {
  id: string;
  type: ChallengeType;
  title: string;
  description: string;
  problemId: string;
  problemSlug: string;
  difficulty: SkillLevel;
  topicName: string;
  supportedLanguages: ProgrammingLanguage[];
  periodKey: string; // YYYY-MM-DD for daily, YYYY-Www for weekly
  startDate: string;
  endDate: string;
  xpReward: number;
  isCompleted: boolean;
  completedAt?: string;
  bestRuntimeMs?: number;
  bestMemoryKB?: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatarInitial: string;
  xp: number;
  challengesCompleted: number;
  currentStreak: number;
  isCurrentUser: boolean;
}

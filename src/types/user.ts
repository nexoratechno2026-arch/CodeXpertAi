import { SkillLevel } from './skill';

export type UserRole = 'student' | 'admin';

export type ProgrammingLanguage =
  | 'python'
  | 'javascript'
  | 'typescript'
  | 'java'
  | 'cpp'
  | 'c'
  | 'go'
  | 'sql';

export const PROGRAMMING_LANGUAGE_LABELS: Record<ProgrammingLanguage, string> = {
  cpp: 'C++',
  python: 'Python',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  java: 'Java',
  c: 'C',
  go: 'Go',
  sql: 'SQL',
};

export const formatProgrammingLanguage = (lang?: string): string => {
  if (!lang) return '';
  const key = lang.toLowerCase() as ProgrammingLanguage;
  return PROGRAMMING_LANGUAGE_LABELS[key] || lang.toUpperCase();
};

export interface UserStats {
  totalSubmissions: number;
  acceptedSubmissions: number;
  totalInterviews: number;
  completedInterviews: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
}

export interface NotificationPreferences {
  emailDigests: boolean;
  milestoneAlerts: boolean;
  practiceReminders: boolean;
}

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  role: UserRole;
  selectedLevel: SkillLevel;
  recommendedLevel: SkillLevel | null;
  preferredLanguage: ProgrammingLanguage;
  completedOnboarding: boolean;
  bio?: string;
  targetRole?: string;
  learningGoals?: string;
  notificationPreferences?: NotificationPreferences;
  stats: UserStats;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileUpdateInput {
  fullName?: string;
  selectedLevel?: SkillLevel;
  preferredLanguage?: ProgrammingLanguage;
  bio?: string;
  targetRole?: string;
  learningGoals?: string;
  notificationPreferences?: NotificationPreferences;
  completedOnboarding?: boolean;
}


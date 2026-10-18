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


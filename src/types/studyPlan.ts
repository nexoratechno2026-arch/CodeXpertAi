import { SkillLevel } from './skill';

export type StudyTaskType =
  | 'solve_problem'
  | 'review_failed_problem'
  | 'mock_interview'
  | 'review_feedback'
  | 'concept_review';

export interface StudyTask {
  id: string;
  planId: string;
  title: string;
  topic: string;
  taskType: StudyTaskType;
  targetId: string; // Problem slug or interview category
  difficulty: SkillLevel;
  estimatedMinutes: number;
  reason: string;
  actionUrl: string;
  isCompleted: boolean;
  completedAt?: string;
  verifiedVia?: 'codelab_submission' | 'interview_report' | 'manual';
  scheduledDayIndex: number; // 0 = Sunday, 1 = Monday, etc.
  dayLabel: string; // e.g. "Monday", "Wednesday"
}

export interface StudyPlan {
  id: string;
  userId: string;
  title: string;
  targetRole: string;
  focusTopics: string[];
  weeklyHours: number;
  preferredDays: number[]; // Array of weekday numbers (0-6)
  startDate: string;
  targetCompletionDate?: string;
  tasks: StudyTask[];
  status: 'active' | 'completed' | 'archived';
  progressPercent: number;
  totalEstimatedMinutes?: number;
  createdAt: string;
  updatedAt: string;
}

export interface StudyPlanInput {
  targetRole: string;
  focusTopics: string[];
  weeklyHours: number;
  preferredDays: number[];
  targetCompletionDate?: string;
}

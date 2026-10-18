import { AdaptiveRecommendation } from './analytics';

export type CoachIntent =
  | 'what_have_i_demonstrated'
  | 'topics_needing_practice'
  | 'what_to_practise_next'
  | 'why_recommended'
  | 'improvement_over_time'
  | 'custom_query';

export interface CoachGroundingMetadata {
  verifiedSubmissions: number;
  acceptedSubmissions: number;
  completedInterviews: number;
  averageInterviewScore: number | null;
  consistencyDays: number;
  topSkills: string[];
  weakSkills: string[];
  currentStreak: number;
}

export interface CoachMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: string;
  intent?: CoachIntent;
  groundingMetadata?: CoachGroundingMetadata;
  suggestedActions?: AdaptiveRecommendation[];
  isFallbackMode?: boolean;
}

export interface QuickCoachPrompt {
  id: string;
  label: string;
  prompt: string;
  intent: CoachIntent;
  category: 'progress' | 'practice' | 'planning' | 'insights';
}

export const PRESET_COACH_PROMPTS: QuickCoachPrompt[] = [
  {
    id: 'qp_demonstrated',
    label: 'What skills have I demonstrated so far?',
    prompt: 'Summarize the verified skills and competencies I have successfully demonstrated across CodeLab and InterviewAI.',
    intent: 'what_have_i_demonstrated',
    category: 'progress',
  },
  {
    id: 'qp_weak_topics',
    label: 'Which topics need more practice?',
    prompt: 'Identify the algorithmic or interview topics where my evidence shows recent difficulties or lowest scores.',
    intent: 'topics_needing_practice',
    category: 'practice',
  },
  {
    id: 'qp_next_action',
    label: 'What should I practise today?',
    prompt: 'Based on my target career role and recent performance, recommend the highest-priority practice task for today.',
    intent: 'what_to_practise_next',
    category: 'planning',
  },
  {
    id: 'qp_improvement',
    label: 'Am I improving over time?',
    prompt: 'Evaluate my learning trend over time. Am I solving problems with higher difficulty or improving my interview rubric scores?',
    intent: 'improvement_over_time',
    category: 'insights',
  },
];

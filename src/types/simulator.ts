import { SkillLevel } from './skill';
import { InterviewCategory } from './interview';

export type SimulatorSessionStatus =
  | 'created'
  | 'in_progress'
  | 'evaluating'
  | 'completed'
  | 'abandoned'
  | 'timed_out';

export interface SimulatorConfig {
  targetRole: string;
  category: InterviewCategory;
  difficulty: SkillLevel;
  durationMinutes: number; // 15, 30, 45, 60
  questionCount: number;   // 3, 5, 8
  isTimed: boolean;
  allowVoice: boolean;
  focusTopics?: string[];
}

export interface SimulatorFollowUpQuestion {
  id: string;
  parentQuestionId: string;
  questionText: string;
  contextReason: string;
}

export interface SimulatorAnswer {
  questionId: string;
  questionText: string;
  studentAnswer: string;
  audioTranscriptUsed: boolean;
  submittedAt: string;
  evaluationStatus: 'pending' | 'evaluated' | 'failed';
  score?: number; // 0-100
  feedback?: string;
  strengths?: string[];
  improvements?: string[];
  followUpAnswer?: {
    questionText: string;
    studentAnswer: string;
    submittedAt: string;
  };
}

export interface SimulatorSession {
  id: string;
  userId: string;
  config: SimulatorConfig;
  questions: {
    id: string;
    text: string;
    category: InterviewCategory;
    difficulty: SkillLevel;
    expectedConcepts: string[];
  }[];
  answers: Record<string, SimulatorAnswer>;
  currentQuestionIndex: number;
  activeFollowUp?: SimulatorFollowUpQuestion;
  status: SimulatorSessionStatus;
  startedAt: string;
  expiresAt: string; // Server-verified expiration timestamp
  completedAt?: string;
  overallScore?: number;
  overallSummary?: string;
  scorecard?: {
    overallScore: number;
    keyStrengths: string[];
    recommendations: string[];
  };
  isMockAI: boolean;
}

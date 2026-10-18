import { SkillLevel } from './skill';

export type InterviewCategory =
  | 'technical'
  | 'programming'
  | 'coding_ds'
  | 'sql'
  | 'hr'
  | 'behavioral';

export interface InterviewCategoryMeta {
  id: InterviewCategory;
  label: string;
  description: string;
}

export const INTERVIEW_CATEGORIES: InterviewCategoryMeta[] = [
  {
    id: 'technical',
    label: 'Technical & CS Core',
    description: 'Operating systems, DBMS, computer networks, OOP, and software engineering.',
  },
  {
    id: 'programming',
    label: 'Programming Languages & Syntax',
    description: 'Variables, loops, memory management, exception handling, output prediction, and code debugging.',
  },
  {
    id: 'coding_ds',
    label: 'Coding & Data Structures',
    description: 'Arrays, linked lists, trees, graphs, recursion, dynamic programming, and time/space complexity.',
  },
  {
    id: 'sql',
    label: 'SQL & Database Design',
    description: 'SELECT queries, joins, aggregates, subqueries, CTEs, window functions, and indexing.',
  },
  {
    id: 'hr',
    label: 'HR & Cultural Fit',
    description: 'Self-introduction, career aspirations, strengths, weaknesses, teamwork, and adaptability.',
  },
  {
    id: 'behavioral',
    label: 'Behavioral & Scenario-Based',
    description: 'STAR methodology, conflict resolution, deadlines, leadership, ownership, and engineering trade-offs.',
  },
];

export type InterviewerPersonaId = 'elena' | 'sophia' | 'marcus';

export interface InterviewerPersona {
  id: InterviewerPersonaId;
  name: string;
  title: string;
  gender: 'female' | 'male';
  voiceNamePreference: string;
  bio: string;
  avatarInitials: string;
}

export const INTERVIEWER_PERSONAS: InterviewerPersona[] = [
  {
    id: 'elena',
    name: 'Elena Vance',
    title: 'Lead Systems Architect & Technical Director',
    gender: 'female',
    voiceNamePreference: 'female',
    bio: 'Specializes in distributed systems, clean software architecture, and structured problem-solving with calm, methodical guidance.',
    avatarInitials: 'EV',
  },
  {
    id: 'sophia',
    name: 'Dr. Sophia Chen',
    title: 'Principal AI Researcher & Algorithms Lead',
    gender: 'female',
    voiceNamePreference: 'female',
    bio: 'Focuses on algorithmic rigor, time/space complexity trade-offs, and encouraging analytical depth.',
    avatarInitials: 'SC',
  },
  {
    id: 'marcus',
    name: 'Marcus Sterling',
    title: 'Senior Engineering Manager',
    gender: 'male',
    voiceNamePreference: 'male',
    bio: 'Evaluates behavioral scenarios, communication, engineering leadership, and pragmatic design decisions.',
    avatarInitials: 'MS',
  },
];

export const getInterviewerPersona = (id?: string): InterviewerPersona => {
  return INTERVIEWER_PERSONAS.find((p) => p.id === id) || INTERVIEWER_PERSONAS[0];
};

export interface InterviewSetupConfig {
  category: InterviewCategory;
  targetRole: string;
  difficulty: SkillLevel;
  durationMinutes: number; // 15, 30, 45, 60
  questionCount: number;   // 3, 5, 8
  interviewerPersonaId?: InterviewerPersonaId;
}

export type InterviewStatus =
  | 'configured'
  | 'generating'
  | 'in_progress'
  | 'evaluating'
  | 'completed'
  | 'abandoned'
  | 'failed';

export interface InterviewQuestion {
  id: string;
  order: number;
  category: InterviewCategory;
  targetRole: string;
  difficulty: SkillLevel;
  topic: string;
  questionText: string;
  context?: string;
  scenario?: string;
  expectedCriteria: string[];
  evaluationCriteria?: string[];
  followUps?: string[];
  scoringRubric?: string[];
  starGuidance?: {
    situation?: string;
    task?: string;
    action?: string;
    result?: string;
  };
  tags?: string[];
  maxScore?: number;
}

export interface AnswerSubmission {
  questionId: string;
  answerText: string;
  submittedAt: string;
  wordCount: number;
}

export interface CriterionEvaluation {
  name: string;
  score: number;      // 0 to 100
  maxScore: number;   // 100
  feedback: string;
}

export interface QuestionEvaluation {
  questionId: string;
  questionText: string;
  studentAnswer: string;
  candidateAnswer?: string;
  wordCount?: number;
  overallScore: number; // 0 to 100
  criteria: CriterionEvaluation[];
  strengths: string[];
  improvements: string[];
  modelAnswerSnippet?: string;
  modelExemplar?: string;
  evaluatedAt: string;
}

export type PerformanceTier = 'Exceptional' | 'Strong' | 'Developing' | 'Needs Practice';

export interface EvaluationReport {
  id: string;
  sessionId: string;
  userId: string;
  category: InterviewCategory;
  targetRole: string;
  difficulty: SkillLevel;
  completedAt: string;
  overallScore: number; // 0 to 100
  performanceTier: PerformanceTier;
  criteriaBreakdown: CriterionEvaluation[];
  questionEvaluations: QuestionEvaluation[];
  topStrengths: string[];
  criticalImprovements: string[];
  actionableNextSteps: string[];
  isMockAI: boolean;
  disclaimer: string;
}

export interface InterviewSession {
  id: string;
  userId: string;
  category: InterviewCategory;
  targetRole: string;
  difficulty: SkillLevel;
  durationMinutes: number;
  questionCount: number;
  interviewerPersonaId?: InterviewerPersonaId;
  status: InterviewStatus;
  questions: InterviewQuestion[];
  currentQuestionIndex: number;
  answers: Record<string, AnswerSubmission>;
  report?: EvaluationReport;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface InterviewSessionSummary {
  id: string;
  userId: string;
  category: InterviewCategory;
  targetRole: string;
  difficulty: SkillLevel;
  durationMinutes: number;
  questionCount: number;
  interviewerPersonaId?: InterviewerPersonaId;
  status: InterviewStatus;
  score?: number;
  createdAt: string;
  completedAt?: string;
}

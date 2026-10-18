export type InterviewCategory =
  | 'technical'
  | 'programming'
  | 'sql'
  | 'hr'
  | 'behavioral';

export type SkillLevel =
  | 'absolute_beginner'
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'expert';

export interface GeneratedQuestion {
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
  maxScore?: number;
}

export interface CriterionScore {
  name: string;
  score: number;
  maxScore: number;
  feedback: string;
}

export interface SingleEvaluation {
  questionId: string;
  questionText: string;
  studentAnswer: string;
  overallScore: number;
  criteria: CriterionScore[];
  strengths: string[];
  improvements: string[];
  modelAnswerSnippet?: string;
  evaluatedAt: string;
}

export interface FullEvaluationResult {
  overallScore: number;
  performanceTier: 'Exceptional' | 'Strong' | 'Developing' | 'Needs Practice';
  criteriaBreakdown: CriterionScore[];
  questionEvaluations: SingleEvaluation[];
  topStrengths: string[];
  criticalImprovements: string[];
  actionableNextSteps: string[];
  isMockAI: boolean;
  disclaimer: string;
}

export interface IAIProvider {
  name: string;
  isConfigured(): boolean;
  generateQuestions(
    category: InterviewCategory,
    targetRole: string,
    difficulty: SkillLevel,
    questionCount: number
  ): Promise<GeneratedQuestion[]>;
  evaluateAnswers(
    category: InterviewCategory,
    targetRole: string,
    difficulty: SkillLevel,
    questions: GeneratedQuestion[],
    answers: Record<string, string>
  ): Promise<FullEvaluationResult>;
}

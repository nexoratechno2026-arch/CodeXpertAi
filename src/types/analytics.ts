import { SkillLevel } from './skill';
import { InterviewCategory, PerformanceTier } from './interview';

export type SkillCategory =
  | 'programming_fundamentals'
  | 'programming_languages'
  | 'databases_and_sql'
  | 'interview_skills';

export interface SkillCategoryMeta {
  id: SkillCategory;
  title: string;
  description: string;
}

export const SKILL_CATEGORIES: SkillCategoryMeta[] = [
  {
    id: 'programming_fundamentals',
    title: 'Programming Fundamentals',
    description: 'Core computational logic, data structures, algorithms, and complexity analysis.',
  },
  {
    id: 'programming_languages',
    title: 'Programming Languages',
    description: 'Syntax, idioms, and standard libraries across supported languages.',
  },
  {
    id: 'databases_and_sql',
    title: 'Databases & SQL',
    description: 'Relational data modeling, querying, joins, indexing, and transactional integrity.',
  },
  {
    id: 'interview_skills',
    title: 'Technical & Professional Interview Skills',
    description: 'Concept articulation, trade-off reasoning, STAR communication, and problem deconstruction.',
  },
];

export interface SkillDefinition {
  id: string;
  name: string;
  category: SkillCategory;
  description: string;
  prerequisites: string[];
  suggestedLevel: SkillLevel;
  relatedCodeLabTopics: string[];
  relatedInterviewCategories: InterviewCategory[];
}

export type ConfidenceState =
  | 'not_assessed'              // No evidence recorded
  | 'starting_out'              // 1 attempt or exploratory activity
  | 'developing'                // 2+ attempts or moderate score (50-74)
  | 'demonstrated_consistently'; // Multiple verified completions / high rubric scores (>= 75)

export interface SkillEvidenceSummary {
  skillId: string;
  skillName: string;
  category: SkillCategory;
  confidenceState: ConfidenceState;
  
  // Objective CodeLab evidence
  codeLabProblemsAttempted: number;
  codeLabProblemsSolved: number;
  lastCodeLabSubmissionAt?: string;

  // Subjective InterviewAI evidence
  interviewQuestionsAnswered: number;
  averageInterviewScore?: number;
  lastInterviewPerformanceTier?: PerformanceTier;
  lastInterviewAt?: string;

  // Recommended difficulty for this specific skill
  recommendedDifficulty: SkillLevel;
  evidenceCount: number;
  lastActiveAt?: string;
}

export type RecommendationType =
  | 'codelab_problem'
  | 'interview_practice'
  | 'foundation_review';

export interface AdaptiveRecommendation {
  id: string;
  type: RecommendationType;
  title: string;
  description: string;
  targetSkillId: string;
  targetSkillName: string;
  difficulty: SkillLevel;
  reason: string;
  actionUrl: string;
  actionLabel: string;
  priority: 'high' | 'medium' | 'normal';
}

export interface ActivityFeedItem {
  id: string;
  source: 'codelab' | 'interview';
  title: string;
  detail: string;
  status: string;
  timestamp: string;
  badgeVariant: 'success' | 'accent' | 'warning' | 'default' | 'error';
  linkUrl: string;
}

export interface LearningMilestone {
  id: string;
  title: string;
  description: string;
  type: 'problem' | 'interview' | 'concept';
  targetSlugOrCategory: string;
  difficulty: SkillLevel;
  isCompleted: boolean;
  completedAt?: string;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  targetRole: string;
  difficulty: SkillLevel;
  estimatedHours: number;
  targetSkills: string[];
  milestones: LearningMilestone[];
  progressPercent: number;
  isEnrolled: boolean;
}

export interface StudentUnifiedAnalytics {
  userId: string;
  computedAt: string;
  
  // High-level aggregates
  totalCodeLabAttempted: number;
  totalCodeLabAccepted: number;
  totalInterviewsCompleted: number;
  averageInterviewScore: number | null;
  overallConsistencyDays: number;

  // Detailed breakdowns
  skills: Record<string, SkillEvidenceSummary>;
  recommendations: AdaptiveRecommendation[];
  recentActivity: ActivityFeedItem[];
  learningPaths: LearningPath[];
}

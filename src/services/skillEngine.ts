import { SkillLevel } from '@/types/skill';
import { Submission, Problem } from '@/types/codelab';
import { InterviewSessionSummary } from '@/types/interview';
import { SkillCategory, ConfidenceState } from '@/types/analytics';
import { UNIFIED_SKILLS, getSkillsForProblem, getSkillsForInterview } from '@/data/skillTaxonomy';

export type PerformanceTrend = 'improving' | 'stable' | 'needs_revision' | 'insufficient_data';

export interface EvaluatedTopicSkill {
  skillId: string;
  skillName: string;
  category: SkillCategory;
  confidenceState: ConfidenceState;
  estimatedMastery: number; // 0-100 percentage based strictly on valid evidence
  performanceTrend: PerformanceTrend;
  recommendedDifficulty: SkillLevel;
  
  // Objective CodeLab metrics
  codeLabAttempts: number;
  codeLabSolved: number;
  codeLabFailed: number;
  uniqueProblemsSolved: number;
  lastCodeLabAt?: string;

  // Subjective InterviewAI metrics
  interviewCount: number;
  averageInterviewScore: number | null;
  lastInterviewScore?: number;
  lastInterviewAt?: string;

  evidenceCount: number;
  lastActiveAt?: string;
  hasSufficientData: boolean;
  statusLabel: string;
}

export interface UnifiedSkillAssessmentReport {
  userId: string;
  evaluatedAt: string;
  skills: Record<string, EvaluatedTopicSkill>;
  topStrengths: EvaluatedTopicSkill[];
  priorityRevisionTopics: EvaluatedTopicSkill[];
  unassessedTopics: EvaluatedTopicSkill[];
  overallProficiencyScore: number;
  hasEnoughGlobalEvidence: boolean;
}

/**
 * Evaluates skill mastery deterministically based on genuine persisted CodeLab and InterviewAI evidence
 */
export function evaluateStudentSkills(
  userId: string,
  submissions: Submission[],
  interviews: InterviewSessionSummary[],
  allProblems: Problem[]
): UnifiedSkillAssessmentReport {
  const problemMap = new Map<string, Problem>(allProblems.map((p) => [p.slug, p]));
  const problemIdMap = new Map<string, Problem>(allProblems.map((p) => [p.id, p]));

  // Deduplicate submissions by problemId + submittedAt (guard against duplicate retries)
  const dedupedSubmissions: Submission[] = [];
  const seenSubKeys = new Set<string>();
  submissions.forEach((s) => {
    const key = `${s.problemId}_${s.submittedAt}_${s.verdict}`;
    if (!seenSubKeys.has(key)) {
      seenSubKeys.add(key);
      dedupedSubmissions.push(s);
    }
  });

  // Track unique solved problem IDs
  const solvedProblemIds = new Set<string>();
  dedupedSubmissions
    .filter((s) => s.verdict === 'accepted')
    .forEach((s) => solvedProblemIds.add(s.problemId));

  // Initialize skills map from unified taxonomy
  const skillsMap: Record<string, EvaluatedTopicSkill> = {};
  UNIFIED_SKILLS.forEach((skill) => {
    skillsMap[skill.id] = {
      skillId: skill.id,
      skillName: skill.name,
      category: skill.category,
      confidenceState: 'not_assessed',
      estimatedMastery: 0,
      performanceTrend: 'insufficient_data',
      recommendedDifficulty: skill.suggestedLevel,
      codeLabAttempts: 0,
      codeLabSolved: 0,
      codeLabFailed: 0,
      uniqueProblemsSolved: 0,
      interviewCount: 0,
      averageInterviewScore: null,
      evidenceCount: 0,
      hasSufficientData: false,
      statusLabel: 'Not enough activity yet',
    };
  });

  // Ingest CodeLab submissions
  // Sort chronologically ascending to compute trend
  const sortedSubs = [...dedupedSubmissions].sort(
    (a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
  );

  const skillSolvedProblemSet: Record<string, Set<string>> = {};
  UNIFIED_SKILLS.forEach((s) => {
    skillSolvedProblemSet[s.id] = new Set<string>();
  });

  sortedSubs.forEach((sub) => {
    const prob = problemIdMap.get(sub.problemId) || problemMap.get(sub.problemId);
    if (!prob) return;

    const targetSkills = [...getSkillsForProblem(prob)];
    if (sub.language === 'python' && !targetSkills.includes('lang-python')) {
      targetSkills.push('lang-python');
    }
    if ((sub.language === 'javascript' || sub.language === 'typescript') && !targetSkills.includes('lang-javascript')) {
      targetSkills.push('lang-javascript');
    }
    if (sub.language === 'sql' && !targetSkills.includes('lang-sql')) {
      targetSkills.push('lang-sql');
    }

    targetSkills.forEach((sId) => {
      const skill = skillsMap[sId];
      if (!skill) return;

      skill.codeLabAttempts += 1;
      skill.evidenceCount += 1;

      if (sub.verdict === 'accepted') {
        skill.codeLabSolved += 1;
        skillSolvedProblemSet[sId].add(prob.id);
      } else {
        skill.codeLabFailed += 1;
      }

      if (!skill.lastCodeLabAt || sub.submittedAt > skill.lastCodeLabAt) {
        skill.lastCodeLabAt = sub.submittedAt;
      }
      if (!skill.lastActiveAt || sub.submittedAt > skill.lastActiveAt) {
        skill.lastActiveAt = sub.submittedAt;
      }
    });
  });

  // Populate unique problems solved per skill
  Object.keys(skillsMap).forEach((sId) => {
    skillsMap[sId].uniqueProblemsSolved = skillSolvedProblemSet[sId].size;
  });

  // Ingest completed interviews
  const completedInterviews = interviews.filter(
    (i) => i.status === 'completed' && (typeof i.score === 'number' || typeof (i as any).overallScore === 'number')
  );

  completedInterviews.forEach((interview) => {
    const targetSkills = getSkillsForInterview(interview.category);
    const resolvedScore = typeof interview.score === 'number' ? interview.score : (interview as any).overallScore;

    targetSkills.forEach((sId) => {
      const skill = skillsMap[sId];
      if (!skill) return;

      skill.interviewCount += 1;
      skill.evidenceCount += 1;
      skill.lastInterviewScore = typeof resolvedScore === 'number' ? resolvedScore : undefined;

      if (typeof resolvedScore === 'number') {
        if (skill.averageInterviewScore === null) {
          skill.averageInterviewScore = resolvedScore;
        } else {
          // Weighted moving average
          skill.averageInterviewScore = Math.round(
            (skill.averageInterviewScore * 0.4) + (resolvedScore * 0.6)
          );
        }
      }

      if (!skill.lastInterviewAt || interview.createdAt > skill.lastInterviewAt) {
        skill.lastInterviewAt = interview.createdAt;
      }
      if (!skill.lastActiveAt || interview.createdAt > skill.lastActiveAt) {
        skill.lastActiveAt = interview.createdAt;
      }
    });
  });

  // Compute Mastery, Confidence State, and Trend for each skill
  let totalMasterySum = 0;
  let activeSkillsCount = 0;

  Object.values(skillsMap).forEach((skill) => {
    const totalEvidence = skill.evidenceCount;
    const uniqueSolved = skill.uniqueProblemsSolved;
    const attempts = skill.codeLabAttempts;
    const fails = skill.codeLabFailed;
    const avgScore = skill.averageInterviewScore;

    // Rule 1: No evidence
    if (totalEvidence === 0) {
      skill.confidenceState = 'not_assessed';
      skill.estimatedMastery = 0;
      skill.performanceTrend = 'insufficient_data';
      skill.statusLabel = 'Not enough activity yet';
      skill.hasSufficientData = false;
      return;
    }

    // Rule 2: Minimum evidence threshold (at least 2 actions needed for statistical sufficiency)
    skill.hasSufficientData = totalEvidence >= 2;

    // Rule 3: Compute deterministic estimated mastery
    let codeLabMastery = 0;
    if (attempts > 0) {
      const solveRatio = uniqueSolved / Math.max(1, uniqueSolved + fails);
      // Base scale up to 100 based on unique problems solved and success ratio
      codeLabMastery = Math.min(100, Math.round(uniqueSolved * 30 * solveRatio + solveRatio * 20));
    }

    let interviewMastery = 0;
    if (avgScore !== null) {
      interviewMastery = avgScore;
    }

    if (attempts > 0 && avgScore !== null) {
      // Both code execution and interview evaluation exist: combine 60% objective code / 40% interview
      skill.estimatedMastery = Math.round(codeLabMastery * 0.6 + interviewMastery * 0.4);
    } else if (attempts > 0) {
      skill.estimatedMastery = codeLabMastery;
    } else {
      skill.estimatedMastery = interviewMastery;
    }

    // Rule 4: Confidence States
    if (!skill.hasSufficientData) {
      skill.confidenceState = 'starting_out';
      skill.statusLabel = 'Initial calibration';
      skill.performanceTrend = 'insufficient_data';
    } else if (skill.estimatedMastery >= 75 || uniqueSolved >= 3) {
      skill.confidenceState = 'demonstrated_consistently';
      skill.statusLabel = 'Demonstrated Consistently';
      // Elevate recommended difficulty
      skill.recommendedDifficulty = advanceDifficulty(skill.recommendedDifficulty);
    } else if (skill.estimatedMastery >= 50 || uniqueSolved >= 1) {
      skill.confidenceState = 'developing';
      skill.statusLabel = 'Developing proficiency';
    } else {
      skill.confidenceState = 'starting_out';
      skill.statusLabel = 'Needs foundational practice';
    }

    // Rule 5: Trend detection
    if (skill.hasSufficientData) {
      if (fails >= 2 && skill.codeLabSolved === 0) {
        skill.performanceTrend = 'needs_revision';
      } else if (skill.lastInterviewScore && skill.averageInterviewScore && skill.lastInterviewScore < skill.averageInterviewScore - 15) {
        skill.performanceTrend = 'needs_revision';
      } else if (uniqueSolved >= 2 && fails <= 1) {
        skill.performanceTrend = 'improving';
      } else if (skill.lastInterviewScore && skill.averageInterviewScore && skill.lastInterviewScore > skill.averageInterviewScore) {
        skill.performanceTrend = 'improving';
      } else {
        skill.performanceTrend = 'stable';
      }
    }

    totalMasterySum += skill.estimatedMastery;
    activeSkillsCount += 1;
  });

  const skillsList = Object.values(skillsMap);
  const assessedSkills = skillsList.filter((s) => s.evidenceCount > 0);

  const topStrengths = [...assessedSkills]
    .filter((s) => s.confidenceState === 'demonstrated_consistently' || s.estimatedMastery >= 70)
    .sort((a, b) => b.estimatedMastery - a.estimatedMastery)
    .slice(0, 4);

  const priorityRevisionTopics = [...assessedSkills]
    .filter((s) => s.performanceTrend === 'needs_revision' || (s.hasSufficientData && s.estimatedMastery < 50))
    .sort((a, b) => a.estimatedMastery - b.estimatedMastery)
    .slice(0, 4);

  const unassessedTopics = skillsList
    .filter((s) => s.confidenceState === 'not_assessed')
    .slice(0, 4);

  const overallScore = activeSkillsCount > 0
    ? Math.round(totalMasterySum / Math.max(1, assessedSkills.length))
    : 0;

  return {
    userId,
    evaluatedAt: new Date().toISOString(),
    skills: skillsMap,
    topStrengths,
    priorityRevisionTopics,
    unassessedTopics,
    overallProficiencyScore: overallScore,
    hasEnoughGlobalEvidence: assessedSkills.length >= 2,
  };
}

function advanceDifficulty(current: SkillLevel): SkillLevel {
  switch (current) {
    case 'absolute_beginner':
      return 'beginner';
    case 'beginner':
      return 'intermediate';
    case 'intermediate':
      return 'advanced';
    case 'advanced':
      return 'expert';
    default:
      return 'expert';
  }
}

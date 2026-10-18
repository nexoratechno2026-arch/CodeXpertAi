import {
  StudentUnifiedAnalytics,
  SkillEvidenceSummary,
  AdaptiveRecommendation,
  ActivityFeedItem,
  LearningPath,
} from '@/types/analytics';
import { SkillLevel } from '@/types/skill';
import { UNIFIED_SKILLS, PUBLISHED_LEARNING_PATHS, getSkillsForProblem, getSkillsForInterview } from '@/data/skillTaxonomy';
import { getSubmissionsForUser, getProblems } from './codelabService';
import { getUserInterviewHistory } from './interviewService';
import { Submission, Problem } from '@/types/codelab';
import { InterviewSessionSummary } from '@/types/interview';

const CACHED_ANALYTICS_PREFIX = 'nexora_analytics_cache_';

/**
 * Derives verified learning intelligence from real CodeLab and InterviewAI activity
 */
export async function computeStudentAnalytics(
  userId: string
): Promise<StudentUnifiedAnalytics> {
  const now = new Date().toISOString();

  // 1. Fetch genuine source records
  let submissions: Submission[] = [];
  try {
    submissions = await getSubmissionsForUser(userId);
  } catch (err) {
    console.warn('[AnalyticsService] CodeLab submissions lookup failed:', err);
  }

  let interviewSummaries: InterviewSessionSummary[] = [];
  try {
    interviewSummaries = await getUserInterviewHistory(userId);
  } catch (err) {
    console.warn('[AnalyticsService] Interview history lookup failed:', err);
  }

  // Fetch full problems catalog for metadata mapping
  const { problems: allProblems } = await getProblems({ pageSize: 100 });
  const problemMap = new Map<string, Problem>(allProblems.map((p) => [p.slug, p]));
  const problemIdMap = new Map<string, Problem>(allProblems.map((p) => [p.id, p]));

  // Filter accepted submissions
  const acceptedSubmissions = submissions.filter((s) => s.verdict === 'accepted');
  const solvedProblemSlugs = new Set<string>();
  acceptedSubmissions.forEach((s) => {
    const p = problemIdMap.get(s.problemId) || problemMap.get(s.problemId);
    if (p) solvedProblemSlugs.add(p.slug);
  });

  const completedInterviews = interviewSummaries.filter(
    (s) => s.status === 'completed' && typeof s.score === 'number'
  );

  // 2. Initialize skill evidence maps
  const skillSummaries: Record<string, SkillEvidenceSummary> = {};

  UNIFIED_SKILLS.forEach((skill) => {
    skillSummaries[skill.id] = {
      skillId: skill.id,
      skillName: skill.name,
      category: skill.category,
      confidenceState: 'not_assessed',
      codeLabProblemsAttempted: 0,
      codeLabProblemsSolved: 0,
      interviewQuestionsAnswered: 0,
      evidenceCount: 0,
      recommendedDifficulty: skill.suggestedLevel,
    };
  });

  // 3. Ingest CodeLab evidence
  submissions.forEach((sub) => {
    const prob = problemIdMap.get(sub.problemId) || problemMap.get(sub.problemId);
    if (!prob) return;

    const targetSkillIds = getSkillsForProblem(prob);
    targetSkillIds.forEach((sId) => {
      const summary = skillSummaries[sId];
      if (!summary) return;

      summary.codeLabProblemsAttempted += 1;
      if (sub.verdict === 'accepted') {
        summary.codeLabProblemsSolved += 1;
      }
      summary.evidenceCount += 1;

      if (!summary.lastCodeLabSubmissionAt || sub.submittedAt > summary.lastCodeLabSubmissionAt) {
        summary.lastCodeLabSubmissionAt = sub.submittedAt;
      }
      if (!summary.lastActiveAt || sub.submittedAt > summary.lastActiveAt) {
        summary.lastActiveAt = sub.submittedAt;
      }
    });
  });

  // 4. Ingest InterviewAI evidence
  completedInterviews.forEach((intSummary) => {
    const targetSkillIds = getSkillsForInterview(intSummary.category);
    targetSkillIds.forEach((sId) => {
      const summary = skillSummaries[sId];
      if (!summary) return;

      summary.interviewQuestionsAnswered += intSummary.questionCount;
      summary.evidenceCount += 1;

      if (typeof intSummary.score === 'number') {
        if (!summary.averageInterviewScore) {
          summary.averageInterviewScore = intSummary.score;
        } else {
          summary.averageInterviewScore = Math.round(
            (summary.averageInterviewScore + intSummary.score) / 2
          );
        }
      }

      if (!summary.lastInterviewAt || intSummary.createdAt > summary.lastInterviewAt) {
        summary.lastInterviewAt = intSummary.createdAt;
      }
      if (!summary.lastActiveAt || intSummary.createdAt > summary.lastActiveAt) {
        summary.lastActiveAt = intSummary.createdAt;
      }
    });
  });

  // 5. Evaluate Confidence States and Recommended Difficulties
  Object.values(skillSummaries).forEach((summary) => {
    const solved = summary.codeLabProblemsSolved;
    const attempted = summary.codeLabProblemsAttempted;
    const intScore = summary.averageInterviewScore ?? 0;
    const totalEvidence = summary.evidenceCount;

    if (totalEvidence === 0) {
      summary.confidenceState = 'not_assessed';
      return;
    }

    if (totalEvidence === 1 && solved === 0 && intScore < 60) {
      summary.confidenceState = 'starting_out';
      summary.recommendedDifficulty = 'beginner';
    } else if (solved >= 2 || intScore >= 75) {
      summary.confidenceState = 'demonstrated_consistently';
      // Advance recommended difficulty if consistently proven
      summary.recommendedDifficulty = advanceDifficulty(summary.recommendedDifficulty);
    } else if (solved >= 1 || attempted >= 2 || intScore >= 50) {
      summary.confidenceState = 'developing';
      summary.recommendedDifficulty = summary.recommendedDifficulty || 'intermediate';
    } else {
      summary.confidenceState = 'starting_out';
    }
  });

  // 6. Generate Adaptive Recommendations
  const recommendations: AdaptiveRecommendation[] = [];

  // Rule 1: No problems solved yet -> Recommend baseline problem
  if (acceptedSubmissions.length === 0) {
    recommendations.push({
      id: 'rec-foundational-strings',
      type: 'codelab_problem',
      title: 'Reverse Words in a String',
      description: 'Establish foundational in-place string manipulation and pointer logic.',
      targetSkillId: 'prog-strings-pointers',
      targetSkillName: 'Strings & In-Place Pointer Techniques',
      difficulty: 'absolute_beginner',
      reason: 'No completed coding submissions recorded yet. Start with this foundational problem to establish your coding baseline.',
      actionUrl: '/codelab/problems/reverse-words-sentence',
      actionLabel: 'Solve in CodeLab',
      priority: 'high',
    });
  } else if (!solvedProblemSlugs.has('two-sum-indices')) {
    // Rule 2: Solved basics -> Recommend Hash Table optimization
    recommendations.push({
      id: 'rec-hash-two-sum',
      type: 'codelab_problem',
      title: 'Two Sum Target Indices',
      description: 'Optimize quadratic O(N^2) search down to linear O(N) using Hash Map lookups.',
      targetSkillId: 'prog-hash-tables',
      targetSkillName: 'Hash Tables & O(1) Key-Value Access',
      difficulty: 'beginner',
      reason: 'You have solved string fundamentals. Advance your data structure toolkit with single-pass hash lookups.',
      actionUrl: '/codelab/problems/two-sum-indices',
      actionLabel: 'Solve in CodeLab',
      priority: 'high',
    });
  } else if (!solvedProblemSlugs.has('valid-parentheses-depth')) {
    // Rule 3: Hash table mastered -> Stacks & Parsing
    recommendations.push({
      id: 'rec-stack-parentheses',
      type: 'codelab_problem',
      title: 'Balanced Parentheses Validation',
      description: 'Master LIFO order parsing and bracket verification.',
      targetSkillId: 'prog-stacks-queues',
      targetSkillName: 'Stacks, Queues & Monotonic Buffers',
      difficulty: 'intermediate',
      reason: 'Demonstrated proficiency in hash tables. Progress to LIFO stacks and algorithmic bracket parsing.',
      actionUrl: '/codelab/problems/valid-parentheses-depth',
      actionLabel: 'Solve in CodeLab',
      priority: 'medium',
    });
  }

  // Rule 4: Interview practice recommendation
  if (completedInterviews.length === 0) {
    recommendations.push({
      id: 'rec-first-tech-interview',
      type: 'interview_practice',
      title: 'Technical Core Screening Round',
      description: 'Rehearse memory models, operating system concepts, and computational trade-offs.',
      targetSkillId: 'int-concept-articulation',
      targetSkillName: 'Core CS Concept & Architecture Articulation',
      difficulty: 'beginner',
      reason: 'No completed mock interviews recorded. Complete your first technical interview to evaluate concept communication.',
      actionUrl: '/interview/setup',
      actionLabel: 'Configure Interview',
      priority: 'high',
    });
  } else {
    // Check if SQL has been practiced
    const sqlInterviews = completedInterviews.filter((i) => i.category === 'sql');
    if (sqlInterviews.length === 0) {
      recommendations.push({
        id: 'rec-sql-diagnostic',
        type: 'interview_practice',
        title: 'SQL & Database Design Screening',
        description: 'Test your understanding of indexing, query cost, and transaction isolation.',
        targetSkillId: 'db-indexing-performance',
        targetSkillName: 'B-Tree Indexing & Query Execution Plans',
        difficulty: 'intermediate',
        reason: 'SQL evidence is currently unassessed. Test your query optimization reasoning with an SQL mock interview.',
        actionUrl: '/interview/setup',
        actionLabel: 'Start SQL Interview',
        priority: 'medium',
      });
    }
  }

  // 7. Evaluate Learning Path Progress
  const learningPaths: LearningPath[] = PUBLISHED_LEARNING_PATHS.map((path) => {
    let completedCount = 0;

    const evaluatedMilestones = path.milestones.map((ms) => {
      let isDone = false;
      let completedAt: string | undefined;

      if (ms.type === 'problem') {
        const sub = acceptedSubmissions.find((s) => {
          const p = problemIdMap.get(s.problemId) || problemMap.get(s.problemId);
          return p && p.slug === ms.targetSlugOrCategory;
        });
        if (sub) {
          isDone = true;
          completedAt = sub.submittedAt;
        }
      } else if (ms.type === 'interview') {
        const intv = completedInterviews.find(
          (i) => i.category === ms.targetSlugOrCategory
        );
        if (intv) {
          isDone = true;
          completedAt = intv.completedAt || intv.createdAt;
        }
      }

      if (isDone) completedCount += 1;

      return {
        ...ms,
        isCompleted: isDone,
        completedAt,
      };
    });

    const percent = Math.round((completedCount / Math.max(1, path.milestones.length)) * 100);

    return {
      ...path,
      milestones: evaluatedMilestones,
      progressPercent: percent,
    };
  });

  // 8. Merge Unified Recent Activity Feed
  const recentActivity: ActivityFeedItem[] = [];

  submissions.slice(0, 10).forEach((sub) => {
    const prob = problemIdMap.get(sub.problemId) || problemMap.get(sub.problemId);
    const title = prob ? prob.title : 'CodeLab Problem';
    const isAccepted = sub.verdict === 'accepted';
    const verdictStr = sub.verdict ? sub.verdict.toUpperCase().replace(/_/g, ' ') : 'PENDING';

    recentActivity.push({
      id: sub.id,
      source: 'codelab',
      title: `CodeLab: ${title}`,
      detail: `Verdict: ${verdictStr} (${sub.language.toUpperCase()})`,
      status: sub.verdict || 'pending',
      timestamp: sub.submittedAt,
      badgeVariant: isAccepted ? 'success' : 'error',
      linkUrl: prob ? `/codelab/problems/${prob.slug}` : '/codelab/submissions',
    });
  });

  interviewSummaries.slice(0, 10).forEach((intv) => {
    const isCompleted = intv.status === 'completed';
    recentActivity.push({
      id: intv.id,
      source: 'interview',
      title: `InterviewAI: ${intv.targetRole}`,
      detail: `${intv.category.toUpperCase()} • Score: ${intv.score !== undefined ? `${intv.score}/100` : intv.status}`,
      status: intv.status,
      timestamp: intv.completedAt || intv.createdAt,
      badgeVariant: isCompleted ? 'success' : intv.status === 'in_progress' ? 'warning' : 'default',
      linkUrl: isCompleted ? `/interview/report/${intv.id}` : `/interview/session/${intv.id}`,
    });
  });

  // Sort feed descending by timestamp
  recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // 9. Compute Overall Consistency
  const activeDaysSet = new Set<string>();
  recentActivity.forEach((act) => {
    if (act.timestamp) {
      activeDaysSet.add(act.timestamp.slice(0, 10));
    }
  });

  const avgInterviewScore =
    completedInterviews.length > 0
      ? Math.round(
          completedInterviews.reduce((acc, curr) => acc + (curr.score || 0), 0) /
            completedInterviews.length
        )
      : null;

  const result: StudentUnifiedAnalytics = {
    userId,
    computedAt: now,
    totalCodeLabAttempted: submissions.length,
    totalCodeLabAccepted: acceptedSubmissions.length,
    totalInterviewsCompleted: completedInterviews.length,
    averageInterviewScore: avgInterviewScore,
    overallConsistencyDays: activeDaysSet.size,
    skills: skillSummaries,
    recommendations: recommendations.slice(0, 4),
    recentActivity: recentActivity.slice(0, 10),
    learningPaths,
  };

  // Buffer locally
  saveAnalyticsToLocal(result);

  return result;
}

/**
 * Step up difficulty level if student demonstrates consistency
 */
function advanceDifficulty(level: SkillLevel): SkillLevel {
  switch (level) {
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

function saveAnalyticsToLocal(analytics: StudentUnifiedAnalytics): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      `${CACHED_ANALYTICS_PREFIX}${analytics.userId}`,
      JSON.stringify(analytics)
    );
  } catch {
    // Ignore storage quota errors
  }
}

export function getCachedAnalytics(userId: string): StudentUnifiedAnalytics | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`${CACHED_ANALYTICS_PREFIX}${userId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

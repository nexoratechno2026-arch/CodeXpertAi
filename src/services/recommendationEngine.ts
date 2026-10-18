import { AdaptiveRecommendation } from '@/types/analytics';
import { SEED_PROBLEMS } from '@/data/seedProblems';
import { UnifiedSkillAssessmentReport } from './skillEngine';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

const LOCAL_STORAGE_DISMISSED_REC_PREFIX = 'nexora_dismissed_recs_';

export interface RecommendationFeedback {
  recommendationId: string;
  userId: string;
  status: 'active' | 'dismissed' | 'completed';
  updatedAt: string;
}

export function getDismissedRecommendationIds(userId: string): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_DISMISSED_REC_PREFIX}${userId}`);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export function saveDismissedRecommendation(userId: string, recId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const dismissed = getDismissedRecommendationIds(userId);
    dismissed.add(recId);
    localStorage.setItem(
      `${LOCAL_STORAGE_DISMISSED_REC_PREFIX}${userId}`,
      JSON.stringify(Array.from(dismissed))
    );
  } catch {
    // Ignore storage errors
  }

  if (db) {
    const feedbackRef = doc(db, 'users', userId, 'recommendationFeedback', recId);
    setDoc(
      feedbackRef,
      {
        recommendationId: recId,
        userId,
        status: 'dismissed',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    ).catch(() => {});
  }
}

export const dismissRecommendation = saveDismissedRecommendation;


/**
 * Generates personalized, validated, explainable recommendations based on assessed skills
 */
export function generateAdaptiveRecommendations(
  userId: string,
  assessment: UnifiedSkillAssessmentReport,
  targetRole: string = 'Software Engineer'
): AdaptiveRecommendation[] {
  const dismissedIds = getDismissedRecommendationIds(userId);
  const recommendations: AdaptiveRecommendation[] = [];

  const availableProblems = SEED_PROBLEMS;

  // ── RULE 1: Weak / Revision Needs in Programming ──
  assessment.priorityRevisionTopics.forEach((weakSkill) => {
    if (weakSkill.category === 'programming_fundamentals' || weakSkill.category === 'databases_and_sql') {
      // Find an available problem in this topic or lower difficulty
      const candidateProb = availableProblems.find(
        (p) => p.topicId.includes(weakSkill.skillId.replace('prog-', '').replace('db-', '')) ||
               p.difficulty === 'beginner' || p.difficulty === 'absolute_beginner'
      ) || availableProblems[0];

      const recId = `rec_revision_${weakSkill.skillId}`;
      if (!dismissedIds.has(recId)) {
        recommendations.push({
          id: recId,
          type: 'foundation_review',
          title: `Revision: ${candidateProb.title}`,
          description: `Strengthen your understanding of ${weakSkill.skillName} with focused execution.`,
          targetSkillId: weakSkill.skillId,
          targetSkillName: weakSkill.skillName,
          difficulty: weakSkill.recommendedDifficulty || candidateProb.difficulty,
          reason: `Recommended because your recent ${weakSkill.skillName} attempts show difficulty (${weakSkill.codeLabFailed} failed attempts). Reinforce foundational concepts before attempting harder challenges.`,
          actionUrl: `/codelab/problems/${candidateProb.slug}`,
          actionLabel: 'Practise in CodeLab',
          priority: 'high',
        });
      }
    }
  });

  // ── RULE 2: Adaptive CodeLab Progression ──
  // If student has solved basics, advance difficulty or introduce prerequisites
  const hasSolvedBasics = assessment.skills['prog-fundamentals']?.codeLabSolved > 0 ||
                          assessment.skills['prog-strings-pointers']?.codeLabSolved > 0;

  if (!hasSolvedBasics) {
    const starterProb = availableProblems.find((p) => p.difficulty === 'absolute_beginner') || availableProblems[0];
    const recId = `rec_starter_${starterProb.slug}`;
    if (!dismissedIds.has(recId)) {
      recommendations.push({
        id: recId,
        type: 'codelab_problem',
        title: starterProb.title,
        description: starterProb.description.slice(0, 120) + '...',
        targetSkillId: 'prog-fundamentals',
        targetSkillName: 'Variables, Types & Logic Flow',
        difficulty: starterProb.difficulty,
        reason: 'Start with this beginner problem because there is not enough evidence to recommend a harder level yet.',
        actionUrl: `/codelab/problems/${starterProb.slug}`,
        actionLabel: 'Solve Challenge',
        priority: 'high',
      });
    }
  } else {
    // Student demonstrated basics, recommend intermediate problem
    const intermediateProb = availableProblems.find(
      (p) => (p.difficulty === 'intermediate' || p.difficulty === 'beginner') && p.slug !== 'reverse-words-sentence'
    ) || availableProblems[1];

    const recId = `rec_progression_${intermediateProb.slug}`;
    if (!dismissedIds.has(recId)) {
      recommendations.push({
        id: recId,
        type: 'codelab_problem',
        title: intermediateProb.title,
        description: intermediateProb.description.slice(0, 120) + '...',
        targetSkillId: 'prog-hash-tables',
        targetSkillName: 'Hash Tables & Efficient Lookups',
        difficulty: intermediateProb.difficulty,
        reason: 'Suggested because you completed the foundational programming milestone. Advance to optimal hash mapping and space-time trade-offs.',
        actionUrl: `/codelab/problems/${intermediateProb.slug}`,
        actionLabel: 'Advance Practice',
        priority: 'medium',
      });
    }
  }

  // ── RULE 3: Adaptive InterviewAI Preparation ──
  // Grounded in candidate target role & weak interview areas
  const sqlInterviewSkill = assessment.skills['db-relational-design'] || assessment.skills['lang-sql'];
  const needsSqlPractice = sqlInterviewSkill?.performanceTrend === 'needs_revision' ||
                           (sqlInterviewSkill && sqlInterviewSkill.evidenceCount === 0);

  if (needsSqlPractice && targetRole.toLowerCase().includes('backend') || targetRole.toLowerCase().includes('full stack')) {
    const recId = 'rec_interview_sql_diagnostic';
    if (!dismissedIds.has(recId)) {
      recommendations.push({
        id: recId,
        type: 'interview_practice',
        title: 'SQL & Database Architecture Screening',
        description: 'Rehearse relational data modeling, indexing trade-offs, and query efficiency.',
        targetSkillId: 'lang-sql',
        targetSkillName: 'SQL Querying & Set Logic',
        difficulty: 'intermediate',
        reason: 'Recommended because your target role requires database competence and your recent SQL evidence needs more practice.',
        actionUrl: '/interview/setup',
        actionLabel: 'Start SQL Mock Interview',
        priority: 'high',
      });
    }
  } else {
    const recId = 'rec_interview_core_technical';
    if (!dismissedIds.has(recId)) {
      recommendations.push({
        id: recId,
        type: 'interview_practice',
        title: `${targetRole} Technical Screening`,
        description: 'Practice structured technical explanation, algorithm justification, and trade-off communication.',
        targetSkillId: 'int-concept-articulation',
        targetSkillName: 'Core CS Concept & Architecture Articulation',
        difficulty: 'beginner',
        reason: `Suggested mock screening tailored to your target role (${targetRole}). Rehearse speaking clearly and justifying engineering decisions.`,
        actionUrl: '/interview/setup',
        actionLabel: 'Configure Interview',
        priority: 'medium',
      });
    }
  }

  return recommendations.slice(0, 5);
}

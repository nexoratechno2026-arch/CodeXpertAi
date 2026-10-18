import { CoachMessage, CoachIntent } from '@/types/coach';
import { UnifiedSkillAssessmentReport } from './skillEngine';
import { generateAdaptiveRecommendations } from './recommendationEngine';
import { UserProfile } from '@/types/user';

const MAX_INPUT_CHARS = 500;
const SESSION_CACHE_PREFIX = 'nexora_coach_history_';

export function getCachedCoachHistory(userId: string): CoachMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`${SESSION_CACHE_PREFIX}${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCoachHistory(userId: string, messages: CoachMessage[]): void {
  if (typeof window === 'undefined') return;
  try {
    // Keep max 20 messages in local session buffer
    localStorage.setItem(`${SESSION_CACHE_PREFIX}${userId}`, JSON.stringify(messages.slice(-20)));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Detects intent from student query
 */
export function detectCoachIntent(query: string): CoachIntent {
  const q = query.toLowerCase();

  if (
    q.includes('demonstrated') ||
    q.includes('what skills') ||
    q.includes('what have i done') ||
    q.includes('strengths')
  ) {
    return 'what_have_i_demonstrated';
  }
  if (
    (q.includes('need') && (q.includes('practice') || q.includes('practise'))) ||
    q.includes('weak') ||
    q.includes('struggling') ||
    q.includes('attention') ||
    q.includes('improvement')
  ) {
    return 'topics_needing_practice';
  }
  if (q.includes('why') || q.includes('rationale') || q.includes('reason')) {
    return 'why_recommended';
  }
  if (
    q.includes('today') ||
    q.includes('next') ||
    q.includes('what to learn') ||
    q.includes('what should i') ||
    q.includes('recommend')
  ) {
    return 'what_to_practise_next';
  }
  if (
    q.includes('improving') ||
    q.includes('progress') ||
    q.includes('trend') ||
    q.includes('over time')
  ) {
    return 'improvement_over_time';
  }

  return 'custom_query';
}

/**
 * Evaluates and responds to a student query, strictly grounded in verified evidence
 */
export async function queryLearningCoach(
  userId: string,
  rawQuery: string,
  assessment: UnifiedSkillAssessmentReport,
  profile: UserProfile | null
): Promise<CoachMessage> {
  const sanitizedQuery = rawQuery.trim().slice(0, MAX_INPUT_CHARS);
  const intent = detectCoachIntent(sanitizedQuery);
  const targetRole = profile?.targetRole || 'Software Engineer';
  const recommendations = generateAdaptiveRecommendations(userId, assessment, targetRole);

  const topSkillsNames = assessment.topStrengths.map((s) => s.skillName);
  const weakSkillsNames = assessment.priorityRevisionTopics.map((s) => s.skillName);

  let responseText = '';

  // Handle case where user has zero activity
  if (!assessment.hasEnoughGlobalEvidence && assessment.overallProficiencyScore === 0) {
    responseText = `Hello ${profile?.fullName || 'Student'}! Welcome to your Nexora Learning Coach.

Currently, you do not have enough verified coding submissions or mock interviews recorded to compute a personalized skill diagnosis.

Here is how you can establish your initial baseline:
1. **Solve a foundational coding challenge** in CodeLab (e.g. Reverse Words in a String) to calibrate programming execution.
2. **Launch a short technical mock interview** in InterviewAI to evaluate your verbal concept explanation.

Once you complete an initial exercise, I will generate targeted recommendations tailored to your goal: **${targetRole}**.`;

    return {
      id: `coach_msg_${Date.now()}`,
      sender: 'coach',
      text: responseText,
      timestamp: new Date().toISOString(),
      intent,
      isFallbackMode: true,
      suggestedActions: recommendations,
      groundingMetadata: {
        verifiedSubmissions: 0,
        acceptedSubmissions: 0,
        completedInterviews: 0,
        averageInterviewScore: null,
        consistencyDays: 0,
        topSkills: [],
        weakSkills: [],
        currentStreak: profile?.stats?.currentStreak || 0,
      },
    };
  }

  // Answer the 5 core grounded questions deterministically
  switch (intent) {
    case 'what_have_i_demonstrated': {
      if (assessment.topStrengths.length > 0) {
        const strengthBullets = assessment.topStrengths
          .map((s) => `• **${s.skillName}**: ${s.estimatedMastery}% mastery (${s.uniqueProblemsSolved} unique problems solved, ${s.interviewCount} interviews). Status: ${s.statusLabel}.`)
          .join('\n');

        responseText = `Based on your persisted execution records and interview evaluations, here are the skills you have demonstrated so far:

${strengthBullets}

Overall Proficiency Rating: **${assessment.overallProficiencyScore}/100** across assessed topics.`;
      } else {
        responseText = `You have started practicing, but your current submissions are in the initial calibration stage. Keep solving challenges to reach the 'Demonstrated Consistently' milestone.`;
      }
      break;
    }

    case 'topics_needing_practice': {
      if (assessment.priorityRevisionTopics.length > 0) {
        const weakBullets = assessment.priorityRevisionTopics
          .map((s) => `• **${s.skillName}**: Trend is *${s.performanceTrend.replace(/_/g, ' ')}*. (${s.codeLabFailed} failed runs, estimated mastery: ${s.estimatedMastery}%).`)
          .join('\n');

        responseText = `Here are the primary areas currently needing more practice to reach target readiness for **${targetRole}**:

${weakBullets}

I have added targeted revision exercises to your recommendations below. Focusing on these topics will yield the highest performance improvement.`;
      } else {
        responseText = `Great work! None of your assessed topics currently flag critical revision needs. Your demonstrated skills are trending positively. Consider branching into more advanced topics or taking a mock interview.`;
      }
      break;
    }

    case 'what_to_practise_next': {
      const topRec = recommendations[0];
      if (topRec) {
        responseText = `Here is your highest-priority practice recommendation for today:

**${topRec.title}** (${topRec.difficulty.toUpperCase().replace(/_/g, ' ')})
*Target Skill:* ${topRec.targetSkillName}
*Why this was chosen:* ${topRec.reason}

Completing this will directly address your current learning trajectory for **${targetRole}**.`;
      } else {
        responseText = `You are caught up on pending recommendations! Browse the CodeLab problem catalog or launch a mock interview to calibrate further.`;
      }
      break;
    }

    case 'why_recommended': {
      const recExpl = recommendations
        .map((r, i) => `${i + 1}. **${r.title}**: ${r.reason}`)
        .join('\n\n');

      responseText = `Here is the transparent rationale behind your current recommendations:

${recExpl}

Every recommendation is grounded strictly in your verified execution pass rates and rubric scores.`;
      break;
    }

    case 'improvement_over_time': {
      const activeStreak = profile?.stats?.currentStreak || 0;
      const improvingSkills = Object.values(assessment.skills).filter((s) => s.performanceTrend === 'improving');
      const needsRevisionSkills = Object.values(assessment.skills).filter((s) => s.performanceTrend === 'needs_revision');

      responseText = `Here is your verified progress trend over time:

• **Learning Consistency**: You have maintained an active streak of **${activeStreak} days**.
• **Skills Trending Upward**: ${improvingSkills.length > 0 ? improvingSkills.map((s) => s.skillName).join(', ') : 'Calibration ongoing'}.
• **Areas Under Revision**: ${needsRevisionSkills.length > 0 ? needsRevisionSkills.map((s) => s.skillName).join(', ') : 'None flagging regression'}.
• **Global Mastery Score**: Currently evaluated at **${assessment.overallProficiencyScore}/100**.

Continue your daily practice to consolidate your performance gains!`;
      break;
    }

    default: {
      responseText = `I have analyzed your query: "${sanitizedQuery}".

Based on your verified records for **${targetRole}**, you have completed ${assessment.topStrengths.length} strong skill areas with an overall rating of **${assessment.overallProficiencyScore}/100**.

Your recommended next step is **${recommendations[0]?.title || 'Practice in CodeLab'}**. Check the recommended actions below to continue.`;
      break;
    }
  }

  return {
    id: `coach_msg_${Date.now()}`,
    sender: 'coach',
    text: responseText,
    timestamp: new Date().toISOString(),
    intent,
    isFallbackMode: true,
    suggestedActions: recommendations,
    groundingMetadata: {
      verifiedSubmissions: Object.values(assessment.skills).reduce((sum, s) => sum + s.codeLabAttempts, 0),
      acceptedSubmissions: Object.values(assessment.skills).reduce((sum, s) => sum + s.codeLabSolved, 0),
      completedInterviews: Object.values(assessment.skills).reduce((sum, s) => sum + s.interviewCount, 0),
      averageInterviewScore: assessment.overallProficiencyScore,
      consistencyDays: profile?.stats?.currentStreak || 1,
      topSkills: topSkillsNames,
      weakSkills: weakSkillsNames,
      currentStreak: profile?.stats?.currentStreak || 0,
    },
  };
}

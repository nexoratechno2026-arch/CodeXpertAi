/**
 * Nexora CodeLab + InterviewAI
 * Adaptive Follow-Up Question Engine
 * Generates contextual, turn-by-turn follow-up interview questions referencing candidate responses.
 */

import { InterviewQuestion, InterviewCategory } from '@/types/interview';

export interface FollowUpResult {
  hasFollowUp: boolean;
  followUpText: string;
  focusArea: 'complexity' | 'edge_cases' | 'architecture' | 'ownership' | 'clarification';
  promptReason: string;
}

/**
 * Generate adaptive follow-up question referencing the candidate's actual answer text
 */
export function generateAdaptiveFollowUp(
  _question: InterviewQuestion,
  studentAnswer: string,
  category: InterviewCategory,
  followUpCountForThisQuestion = 0
): FollowUpResult {
  const trimmed = studentAnswer.trim();
  const lower = trimmed.toLowerCase();
  const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;

  // Max 1 follow-up per question to keep interview pacing crisp and on schedule
  if (followUpCountForThisQuestion >= 1) {
    return {
      hasFollowUp: false,
      followUpText: '',
      focusArea: 'complexity',
      promptReason: 'Question quota reached',
    };
  }

  // 1. Brief / Unclear Answer -> Request Clarification
  if (wordCount < 15) {
    return {
      hasFollowUp: true,
      followUpText:
        "Thank you. Could you elaborate a bit more on your reasoning and explain step-by-step how you would structure that approach?",
      focusArea: 'clarification',
      promptReason: 'Answer was concise; asking candidate to expand technical thought process.',
    };
  }

  // 2. Behavioral / HR Track Follow-ups
  if (category === 'hr' || category === 'behavioral') {
    if (!lower.includes('result') && !lower.includes('impact') && !lower.includes('outcome')) {
      return {
        hasFollowUp: true,
        followUpText:
          "That gives good context on what you did. Looking back, what was the measurable result or key takeaway from that experience, and what would you do differently today?",
        focusArea: 'ownership',
        promptReason: 'Candidate covered actions but missed measurable outcome/results in STAR format.',
      };
    }
    if (!lower.includes('challenge') && !lower.includes('obstacle') && !lower.includes('difficult')) {
      return {
        hasFollowUp: true,
        followUpText:
          "What was the most challenging technical or interpersonal obstacle you encountered while doing that, and how did you navigate it?",
        focusArea: 'ownership',
        promptReason: 'Probing resilience and problem-solving under pressure.',
      };
    }
    return {
      hasFollowUp: true,
      followUpText:
        "How did you communicate your decisions with your team or stakeholders to ensure everyone was aligned?",
      focusArea: 'ownership',
      promptReason: 'Evaluating cross-functional communication and leadership.',
    };
  }

  // 3. Technical & Algorithmic Follow-ups
  if (category === 'coding_ds' || category === 'programming') {
    if (!lower.includes('o(') && !lower.includes('time') && !lower.includes('space') && !lower.includes('complexity')) {
      return {
        hasFollowUp: true,
        followUpText:
          "You laid out a solid approach. What would be the exact Big-O time and space complexity of that solution, and where is the primary computational bottleneck?",
        focusArea: 'complexity',
        promptReason: 'Candidate did not explicitly state time/space complexity.',
      };
    }
    if (lower.includes('hash') || lower.includes('map') || lower.includes('dict')) {
      return {
        hasFollowUp: true,
        followUpText:
          "You utilized a hash-based lookup. What happens if memory is severely constrained or if there are hash collisions, and could we solve this in O(1) auxiliary space?",
        focusArea: 'architecture',
        promptReason: 'Probing memory vs computation trade-offs.',
      };
    }
    if (!lower.includes('edge') && !lower.includes('null') && !lower.includes('empty') && !lower.includes('zero')) {
      return {
        hasFollowUp: true,
        followUpText:
          "Good analysis. What critical edge cases (such as empty inputs, negative values, or duplicate records) could break this implementation, and how would you handle them?",
        focusArea: 'edge_cases',
        promptReason: 'Candidate analyzed the happy path; probing boundary robustness.',
      };
    }
  }

  // 4. SQL & Database Follow-ups
  if (category === 'sql') {
    if (!lower.includes('index') && !lower.includes('performance') && !lower.includes('scan')) {
      return {
        hasFollowUp: true,
        followUpText:
          "How would this query perform if the underlying table contained 50 million rows, and what index structure would you add to optimize execution?",
        focusArea: 'architecture',
        promptReason: 'Probing database indexing and large-scale query optimization.',
      };
    }
  }

  // 5. General System Design & Architecture Follow-up
  return {
    hasFollowUp: true,
    followUpText:
      "That is a clear explanation. If traffic increased tenfold or if one of the dependencies failed intermittently, what safeguards or architectural patterns would you introduce?",
    focusArea: 'architecture',
    promptReason: 'Evaluating system resilience, fault tolerance, and scalability.',
  };
}

/**
 * Natural conversational acknowledgment and verbal transitions spoken by the AI interviewer
 */
export function getConversationalTransition(
  kind: 'follow_up' | 'next_question' | 'conclusion',
  _category?: InterviewCategory
): string {
  if (kind === 'follow_up') {
    const followUpPhrases = [
      "Thank you for that explanation. Let's delve into a quick follow-up on that.",
      "Understood. That touches on an important point. Let's explore that a bit further.",
      "I appreciate your breakdown. Let me ask a targeted follow-up based on what you just described.",
      "Good. Building on that reasoning, let's look at one specific aspect.",
    ];
    return followUpPhrases[Math.floor(Math.random() * followUpPhrases.length)];
  }

  if (kind === 'next_question') {
    const nextPhrases = [
      "Thank you for sharing your thought process. Let's transition to the next topic.",
      "Understood. That gives me good signal on your approach. Let's move on to the next question.",
      "Great. Let's shift our focus to the next area of our assessment.",
      "Thank you. Let's proceed with the next technical question.",
    ];
    return nextPhrases[Math.floor(Math.random() * nextPhrases.length)];
  }

  // conclusion
  return "Thank you for completing this technical assessment today. You've walked through all the core problem areas. I am now compiling your detailed performance scorecard and feedback report.";
}

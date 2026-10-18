import {
  SimulatorConfig,
  SimulatorSession,
  SimulatorAnswer,
  SimulatorFollowUpQuestion,
} from '@/types/simulator';
import { QUESTION_BANK } from '@/data/interviewQuestionBank';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

const LOCAL_STORAGE_SIMULATOR_PREFIX = 'nexora_simulator_session_';

/**
 * Initializes a new simulator session with selected questions and deadline
 */
export function createSimulatorSession(
  userId: string,
  config: SimulatorConfig
): SimulatorSession {
  const sessionId = `sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const startedAt = new Date().toISOString();
  const durationMinutes = config.durationMinutes || (config as any).timeLimitMinutes || 30;
  const durationMs = durationMinutes * 60 * 1000;
  const expiresAt = new Date(Date.now() + durationMs).toISOString();
  const category = config.category || (config as any).roundType || 'technical';

  // Filter matching questions from curated question bank
  const matchingQuestions = QUESTION_BANK.filter((q) => {
    const isCategory = q.category === category;
    const isDifficulty = q.difficulty === config.difficulty || config.difficulty === 'intermediate';
    return isCategory && isDifficulty;
  });

  const pool = matchingQuestions.length >= (config.questionCount || 3)
    ? matchingQuestions
    : QUESTION_BANK.filter((q) => q.category === category);

  // Deterministically map selected questions
  const count = config.questionCount || 3;
  const selectedQuestions = (pool.length > 0 ? pool : QUESTION_BANK).slice(0, count).map((q, idx) => ({
    id: `sim_q_${q.category}_${idx + 1}`,
    text: q.questionText,
    category: q.category,
    difficulty: q.difficulty,
    expectedConcepts: q.expectedCriteria || ['Problem Solving', 'Structured Communication'],
  }));

  const session: SimulatorSession = {
    id: sessionId,
    userId,
    config,
    questions: selectedQuestions,
    answers: {},
    currentQuestionIndex: 0,
    status: 'in_progress',
    startedAt,
    expiresAt,
    isMockAI: true,
  };

  saveLocalSimulatorSession(session);
  return session;
}

/**
 * Checks whether a timed session has exceeded its deadline
 */
export function isSessionTimedOut(session: SimulatorSession, checkTime: Date = new Date()): boolean {
  if (!session.config.isTimed) return false;
  return checkTime.getTime() > new Date(session.expiresAt).getTime();
}

/**
 * Submits an answer for the current question and returns an optional relevant follow-up question
 */
export function submitSimulatorAnswer(
  session: SimulatorSession,
  questionId: string,
  studentAnswer: string,
  audioTranscriptUsed: boolean = false
): { session: SimulatorSession; followUp?: SimulatorFollowUpQuestion } {
  const trimmed = studentAnswer.trim();
  const qObj = session.questions.find((q) => q.id === questionId);
  const questionText = qObj?.text || 'Interview Question';

  // Deterministic evaluation scoring based on answer length, technical depth, and structure
  let score = 70;
  const strengths: string[] = [];
  const improvements: string[] = [];

  if (trimmed.length > 250) {
    score += 15;
    strengths.push('Thorough elaboration with relevant detail and rationale.');
  } else if (trimmed.length < 80) {
    score -= 20;
    improvements.push('Answer is somewhat brief; consider structuring with specific examples or STAR framework.');
  }

  if (trimmed.toLowerCase().includes('trade-off') || trimmed.toLowerCase().includes('complexity') || trimmed.toLowerCase().includes('performance')) {
    score += 10;
    strengths.push('Explicitly addressed architectural trade-offs and performance considerations.');
  } else {
    improvements.push('Mention time/space complexity or operational trade-offs to strengthen credibility.');
  }

  const finalScore = Math.min(95, Math.max(40, score));

  const answerRecord: SimulatorAnswer = {
    questionId,
    questionText,
    studentAnswer: trimmed,
    audioTranscriptUsed,
    submittedAt: new Date().toISOString(),
    evaluationStatus: 'evaluated',
    score: finalScore,
    feedback: `Evaluated for ${session.config.targetRole}. Solid conceptual grounding with opportunities to expand on edge-case scenarios.`,
    strengths,
    improvements,
  };

  const updatedAnswers = {
    ...session.answers,
    [questionId]: answerRecord,
  };

  // Generate a follow-up question if this is a technical or programming interview
  let followUp: SimulatorFollowUpQuestion | undefined = undefined;
  const hasFollowUpAlready = !!session.answers[questionId]?.followUpAnswer;

  if (!hasFollowUpAlready && (session.config.category === 'technical' || session.config.category === 'programming' || session.config.category === 'sql')) {
    followUp = {
      id: `fu_${questionId}_${Date.now()}`,
      parentQuestionId: questionId,
      questionText: `Follow-up: How would your proposed approach scale if the data volume increased by 100x, or if latency requirements tightened to < 10ms?`,
      contextReason: `Probing edge-case scalability and operational constraints based on your answer.`,
    };
  }

  const updatedSession: SimulatorSession = {
    ...session,
    answers: updatedAnswers,
    activeFollowUp: followUp,
  };

  saveLocalSimulatorSession(updatedSession);
  return { session: updatedSession, followUp };
}

/**
 * Submits answer to active follow-up question
 */
export function submitFollowUpAnswer(
  session: SimulatorSession,
  followUpAnswerText: string
): SimulatorSession {
  if (!session.activeFollowUp) return session;

  const parentQId = session.activeFollowUp.parentQuestionId;
  const parentAnswer = session.answers[parentQId];
  if (!parentAnswer) return session;

  const updatedAnswer: SimulatorAnswer = {
    ...parentAnswer,
    followUpAnswer: {
      questionText: session.activeFollowUp.questionText,
      studentAnswer: followUpAnswerText.trim(),
      submittedAt: new Date().toISOString(),
    },
  };

  const updatedSession: SimulatorSession = {
    ...session,
    answers: {
      ...session.answers,
      [parentQId]: updatedAnswer,
    },
    activeFollowUp: undefined,
  };

  saveLocalSimulatorSession(updatedSession);
  return updatedSession;
}

/**
 * Completes session and computes overall summary and final scorecard
 */
export async function completeSimulatorSession(
  session: SimulatorSession
): Promise<SimulatorSession> {
  const answerList = Object.values(session.answers);
  const totalScores = answerList.reduce((acc, curr) => acc + (curr.score || 70), 0);
  const overallScore = answerList.length > 0 ? Math.round(totalScores / answerList.length) : 70;

  const completedSession: SimulatorSession = {
    ...session,
    status: 'completed',
    completedAt: new Date().toISOString(),
    overallScore,
    overallSummary: `Structured simulation concluded for ${session.config.targetRole}. Answered ${answerList.length} of ${session.questions.length} questions across ${session.config.category} domain. Overall Score: ${overallScore}/100.`,
    scorecard: {
      overallScore,
      keyStrengths: [
        'Structured answers addressing technical core concepts',
        'Clear problem explanation with direct reasoning',
      ],
      recommendations: [
        'Provide deeper complexity and scalability justifications',
        'Incorporate edge-case constraints proactively',
      ],
    },
  };

  saveLocalSimulatorSession(completedSession);

  if (db) {
    try {
      const sessRef = doc(db, 'interviewSessions', session.id);
      await setDoc(sessRef, completedSession, { merge: true });
    } catch (err) {
      console.warn('[SimulatorService] Failed to persist session to Firestore:', err);
    }
  }

  return completedSession;
}

/**
 * Cache simulator session locally to survive page refreshes
 */
export function saveLocalSimulatorSession(session: SimulatorSession): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${LOCAL_STORAGE_SIMULATOR_PREFIX}${session.id}`, JSON.stringify(session));
    localStorage.setItem(`${LOCAL_STORAGE_SIMULATOR_PREFIX}active_${session.userId}`, session.id);
  } catch {
    // Ignore storage errors
  }
}

/**
 * Get active session for user
 */
export function getActiveLocalSimulatorSession(userId?: string): SimulatorSession | null {
  if (typeof window === 'undefined') return null;
  try {
    if (userId) {
      const activeId = localStorage.getItem(`${LOCAL_STORAGE_SIMULATOR_PREFIX}active_${userId}`);
      if (!activeId) return null;
      const raw = localStorage.getItem(`${LOCAL_STORAGE_SIMULATOR_PREFIX}${activeId}`);
      return raw ? JSON.parse(raw) : null;
    }
    // Search for any active simulator session if userId not provided
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`${LOCAL_STORAGE_SIMULATOR_PREFIX}active_`)) {
        const activeId = localStorage.getItem(key);
        if (activeId) {
          const raw = localStorage.getItem(`${LOCAL_STORAGE_SIMULATOR_PREFIX}${activeId}`);
          if (raw) return JSON.parse(raw);
        }
      }
    }
    return null;
  } catch {
    return null;
  }
}

export const getActiveSimulatorSession = getActiveLocalSimulatorSession;
export const saveActiveSimulatorSession = saveLocalSimulatorSession;

export function clearActiveSimulatorSession(userId?: string): void {
  if (typeof window === 'undefined') return;
  try {
    if (userId) {
      localStorage.removeItem(`${LOCAL_STORAGE_SIMULATOR_PREFIX}active_${userId}`);
    } else {
      const toRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(`${LOCAL_STORAGE_SIMULATOR_PREFIX}active_`)) {
          toRemove.push(k);
        }
      }
      toRemove.forEach((k) => localStorage.removeItem(k));
    }
  } catch {
    // Ignore
  }
}


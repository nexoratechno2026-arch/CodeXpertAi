import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  InterviewCategory,
  InterviewSetupConfig,
  InterviewSession,
  InterviewSessionSummary,
  EvaluationReport,
  QuestionEvaluation,
  CriterionEvaluation,
  PerformanceTier,
} from '@/types/interview';
import { generateQuestionList } from '@/data/interviewQuestionBank';
import { addNotification } from '@/services/notificationService';

const LOCAL_STORAGE_SESSIONS_KEY = 'nexora_local_interviews';
const DRAFT_PREFIX = 'nexora_draft_answer_';

/**
 * Validates setup configuration
 */
export function validateInterviewConfig(config: InterviewSetupConfig): {
  isValid: boolean;
  error?: string;
} {
  const allowedCategories: InterviewCategory[] = [
    'technical',
    'programming',
    'coding_ds',
    'sql',
    'hr',
    'behavioral',
  ];

  if (!allowedCategories.includes(config.category)) {
    return { isValid: false, error: 'Invalid interview category selected.' };
  }

  if (!config.targetRole || config.targetRole.trim().length < 2) {
    return { isValid: false, error: 'Target role is required (min 2 characters).' };
  }

  if (config.questionCount < 1 || config.questionCount > 10) {
    return { isValid: false, error: 'Question count must be between 1 and 10.' };
  }

  if (config.durationMinutes < 10 || config.durationMinutes > 120) {
    return { isValid: false, error: 'Duration must be between 10 and 120 minutes.' };
  }

  return { isValid: true };
}

/**
 * Save in-progress answer draft to localStorage to protect against reloads or accidental navigation
 */
export function saveAnswerDraft(sessionId: string, questionId: string, draft: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${DRAFT_PREFIX}${sessionId}_${questionId}`, draft);
  } catch {
    // Ignore storage errors
  }
}

/**
 * Retrieve saved answer draft
 */
export function getAnswerDraft(sessionId: string, questionId: string): string {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem(`${DRAFT_PREFIX}${sessionId}_${questionId}`) || '';
  } catch {
    return '';
  }
}

/**
 * Clear draft after submission
 */
export function clearAnswerDraft(sessionId: string, questionId: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(`${DRAFT_PREFIX}${sessionId}_${questionId}`);
  } catch {
    // Ignore storage errors
  }
}

/**
 * Creates and initializes a new interview session
 */
export async function createInterviewSession(
  config: InterviewSetupConfig,
  userId: string
): Promise<InterviewSession> {
  const validation = validateInterviewConfig(config);
  if (!validation.isValid) {
    throw new Error(validation.error || 'Invalid interview configuration.');
  }

  const sessionId = `int_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  // Generate tailored questions
  const questions = generateQuestionList(
    config.category,
    config.targetRole,
    config.difficulty,
    config.questionCount
  );

  const session: InterviewSession = {
    id: sessionId,
    userId,
    category: config.category,
    targetRole: config.targetRole.trim(),
    difficulty: config.difficulty,
    durationMinutes: config.durationMinutes,
    questionCount: questions.length,
    interviewerPersonaId: config.interviewerPersonaId || 'elena',
    status: 'in_progress',
    questions,
    currentQuestionIndex: 0,
    answers: {},
    createdAt: now,
    updatedAt: now,
  };

  // Persist to Firestore if connected
  if (db) {
    try {
      const sessionRef = doc(db, 'interviewSessions', sessionId);
      await setDoc(sessionRef, session);

      // Increment total interviews on user stats
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const currentTotal = userSnap.data()?.stats?.totalInterviews || 0;
        await updateDoc(userRef, {
          'stats.totalInterviews': currentTotal + 1,
          'stats.lastActiveDate': now,
          updatedAt: now,
        });
      }
    } catch (err) {
      console.warn('[InterviewService] Firestore session creation failed, using local buffer:', err);
    }
  }

  // Always buffer in local storage for instant offline recovery
  saveSessionToLocal(session);

  return session;
}

/**
 * Retrieves an active or completed interview session
 */
export async function getInterviewSession(sessionId: string): Promise<InterviewSession | null> {
  if (!sessionId) return null;

  if (db) {
    try {
      const sessionRef = doc(db, 'interviewSessions', sessionId);
      const snap = await getDoc(sessionRef);
      if (snap.exists()) {
        return snap.data() as InterviewSession;
      }
    } catch (err) {
      console.warn('[InterviewService] Firestore session lookup failed, checking local buffer:', err);
    }
  }

  // Fallback to local storage
  return getSessionFromLocal(sessionId);
}

/**
 * Submits an answer for the current question and advances session progress
 */
export async function submitInterviewAnswer(
  sessionId: string,
  questionId: string,
  answerText: string
): Promise<{ session: InterviewSession; isComplete: boolean }> {
  const session = await getInterviewSession(sessionId);
  if (!session) {
    throw new Error('Interview session not found.');
  }

  if (session.status !== 'in_progress') {
    throw new Error(`Cannot submit answer. Session is currently ${session.status}.`);
  }

  const trimmed = answerText.trim();
  if (trimmed.length < 5) {
    throw new Error('Answer is too short. Please provide a substantive response (min 5 characters).');
  }

  if (trimmed.length > 8000) {
    throw new Error('Answer exceeds maximum 8,000 character limit.');
  }

  const words = trimmed.split(/\s+/).filter(Boolean).length;
  const now = new Date().toISOString();

  // Record answer
  session.answers[questionId] = {
    questionId,
    answerText: trimmed,
    submittedAt: now,
    wordCount: words,
  };

  clearAnswerDraft(sessionId, questionId);

  // Advance to next question or evaluate
  const nextIndex = session.currentQuestionIndex + 1;
  const isComplete = nextIndex >= session.questions.length;

  if (isComplete) {
    session.status = 'evaluating';
  } else {
    session.currentQuestionIndex = nextIndex;
  }
  session.updatedAt = now;

  // Persist session update
  if (db) {
    try {
      const sessionRef = doc(db, 'interviewSessions', sessionId);
      await updateDoc(sessionRef, {
        answers: session.answers,
        currentQuestionIndex: session.currentQuestionIndex,
        status: session.status,
        updatedAt: now,
      });
    } catch (err) {
      console.warn('[InterviewService] Firestore answer update failed, using local buffer:', err);
    }
  }
  saveSessionToLocal(session);

  // If completed, trigger evaluation
  if (isComplete) {
    const report = await evaluateAndFinalizeSession(session);
    session.report = report;
    session.status = 'completed';
    session.completedAt = now;
    saveSessionToLocal(session);
  }

  return { session, isComplete };
}

/**
 * Evaluates candidate responses using category rubrics and synthesizes the final report
 */
export async function evaluateAndFinalizeSession(
  session: InterviewSession
): Promise<EvaluationReport> {
  const now = new Date().toISOString();
  const questionEvals: QuestionEvaluation[] = [];

  let aggregateScore = 0;

  for (const q of session.questions) {
    const answerObj = session.answers[q.id];
    const answerText = answerObj ? answerObj.answerText : '';
    const wordCount = answerObj ? answerObj.wordCount : 0;

    // Evaluate answer based on length, detail, and category rubric
    const evalResult = evaluateSingleAnswer(q.category, q.difficulty, q.questionText, answerText, wordCount);
    questionEvals.push(evalResult);
    aggregateScore += evalResult.overallScore;
  }

  const overallScore = Math.round(aggregateScore / Math.max(1, questionEvals.length));

  let performanceTier: PerformanceTier = 'Developing';
  if (overallScore >= 85) {
    performanceTier = 'Exceptional';
  } else if (overallScore >= 70) {
    performanceTier = 'Strong';
  } else if (overallScore >= 50) {
    performanceTier = 'Developing';
  } else {
    performanceTier = 'Needs Practice';
  }

  // Synthesize top strengths & improvement recommendations
  const topStrengths: string[] = [];
  const criticalImprovements: string[] = [];

  for (const qe of questionEvals) {
    if (qe.strengths.length > 0 && topStrengths.length < 4) {
      topStrengths.push(qe.strengths[0]);
    }
    if (qe.improvements.length > 0 && criticalImprovements.length < 4) {
      criticalImprovements.push(qe.improvements[0]);
    }
  }

  // Category-specific actionable next steps linking back to CodeLab
  const actionableNextSteps = getCategoryNextSteps(session.category, overallScore);

  const report: EvaluationReport = {
    id: `rep_${session.id}`,
    sessionId: session.id,
    userId: session.userId,
    category: session.category,
    targetRole: session.targetRole,
    difficulty: session.difficulty,
    completedAt: now,
    overallScore,
    performanceTier,
    criteriaBreakdown: computeCriteriaBreakdown(session.category, questionEvals),
    questionEvaluations: questionEvals,
    topStrengths: topStrengths.length > 0 ? topStrengths : ['Good engagement with all interview prompts.'],
    criticalImprovements:
      criticalImprovements.length > 0
        ? criticalImprovements
        : ['Elaborate with deeper technical trade-offs in future responses.'],
    actionableNextSteps,
    isMockAI: true,
    disclaimer:
      'AI-assisted interview evaluation is designed for structured practice and skill development. Scores and feedback represent rubric-based assessments and should be used as diagnostic guidance rather than formal employment guarantees.',
  };

  // Persist report to Firestore
  if (db) {
    try {
      const reportRef = doc(db, 'interviewSessions', session.id, 'evaluationReport', 'report');
      await setDoc(reportRef, report);

      const sessionRef = doc(db, 'interviewSessions', session.id);
      await updateDoc(sessionRef, {
        status: 'completed',
        completedAt: now,
        updatedAt: now,
      });

      // Update user profile completed interviews
      const userRef = doc(db, 'users', session.userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const stats = userSnap.data()?.stats || {};
        await updateDoc(userRef, {
          'stats.completedInterviews': (stats.completedInterviews || 0) + 1,
          updatedAt: now,
        });
      }
    } catch (err) {
      console.warn('[InterviewService] Firestore report persistence error:', err);
    }
  }

  // Dispatch persistent in-app notification to the candidate
  if (session.userId) {
    addNotification(session.userId, {
      type: 'interview_report_ready',
      title: 'Interview Assessment Ready',
      message: `Your interview assessment for "${session.targetRole}" is complete with score: ${report.overallScore}/100.`,
      linkUrl: `/interview/report/${session.id}`,
    }).catch(() => {});
  }

  return report;
}

/**
 * Rubric evaluator for an individual answer
 */
function evaluateSingleAnswer(
  category: InterviewCategory,
  _difficulty: string,
  questionText: string,
  answer: string,
  wordCount: number
): QuestionEvaluation {
  const criteria: CriterionEvaluation[] = [];

  // Minimum substantive threshold
  const isSubstantive = wordCount >= 30;
  const isDetailed = wordCount >= 80;

  let baseScore = isDetailed ? 80 : isSubstantive ? 65 : 40;

  // Category rubric criteria
  if (category === 'technical' || category === 'programming') {
    criteria.push({
      name: 'Technical Correctness & Core Principles',
      score: Math.min(100, baseScore + (answer.includes('O(') || answer.includes('cache') || answer.includes('data') ? 10 : 0)),
      maxScore: 100,
      feedback: isSubstantive
        ? 'Accurately articulated key technical concepts and computational definitions.'
        : 'Lacked concrete technical terminology; consider defining the mechanism explicitly.',
    });
    criteria.push({
      name: 'Reasoning & Trade-Off Awareness',
      score: Math.min(100, baseScore - 5),
      maxScore: 100,
      feedback: 'Discussed fundamental choices; incorporate space-vs-time or architecture trade-offs.',
    });
    criteria.push({
      name: 'Clarity of Explanation',
      score: isSubstantive ? 85 : 55,
      maxScore: 100,
      feedback: isSubstantive
        ? 'Well-structured narrative with logical flow.'
        : 'Keep explanations organized with clear cause-and-effect structure.',
    });
  } else if (category === 'sql') {
    criteria.push({
      name: 'Relational & Query Accuracy',
      score: Math.min(100, baseScore + (answer.includes('JOIN') || answer.includes('WHERE') || answer.includes('SELECT') ? 10 : 0)),
      maxScore: 100,
      feedback: 'Addressed primary relational algebra operations and table relationships.',
    });
    criteria.push({
      name: 'Indexing & Performance Considerations',
      score: Math.min(100, baseScore - 10),
      maxScore: 100,
      feedback: 'Incorporate B-Tree index scan impacts and EXPLAIN plan awareness.',
    });
    criteria.push({
      name: 'Schema Integrity & Constraints',
      score: isSubstantive ? 80 : 50,
      maxScore: 100,
      feedback: 'Appropriately referenced primary and foreign key constraints.',
    });
  } else {
    // HR & Behavioral
    criteria.push({
      name: 'STAR Methodology & Structure',
      score: isSubstantive ? 82 : 48,
      maxScore: 100,
      feedback: isSubstantive
        ? 'Structured narrative detailing Situation, Task, Action, and Tangible Result.'
        : 'Apply the STAR method to anchor responses with specific past situations.',
    });
    criteria.push({
      name: 'Self-Reflection & Key Learnings',
      score: Math.min(100, baseScore + 5),
      maxScore: 100,
      feedback: 'Good accountability and articulation of lessons applied forward.',
    });
    criteria.push({
      name: 'Communication & Professionalism',
      score: isSubstantive ? 88 : 60,
      maxScore: 100,
      feedback: 'Polite, constructive, and oriented toward team collaboration.',
    });
  }

  const overallScore = Math.round(
    criteria.reduce((sum, c) => sum + c.score, 0) / criteria.length
  );

  return {
    questionId: questionText.substring(0, 15),
    questionText,
    studentAnswer: answer,
    overallScore,
    criteria,
    strengths: [
      isSubstantive
        ? `Thorough response (${wordCount} words) addressing the prompt directly.`
        : 'Answer attempted with direct focus on the question.',
      'Clear professional tone and focused terminology.',
    ],
    improvements: [
      !isDetailed
        ? 'Expand answer with more specific examples and concrete trade-offs.'
        : 'Quantify metrics and business outcomes to substantiate claims.',
    ],
    modelAnswerSnippet:
      'A top-tier response should explicitly state the context, walk through 2-3 specific technical decisions or actions taken, and conclude with the measurable outcome and preventive learnings.',
    evaluatedAt: new Date().toISOString(),
  };
}

/**
 * Computes high-level criteria breakdown across all questions
 */
function computeCriteriaBreakdown(
  _category: InterviewCategory,
  evals: QuestionEvaluation[]
): CriterionEvaluation[] {
  const criteriaMap: Record<string, { totalScore: number; count: number; feedback: string }> = {};

  for (const qe of evals) {
    for (const c of qe.criteria) {
      if (!criteriaMap[c.name]) {
        criteriaMap[c.name] = { totalScore: 0, count: 0, feedback: c.feedback };
      }
      criteriaMap[c.name].totalScore += c.score;
      criteriaMap[c.name].count += 1;
    }
  }

  return Object.keys(criteriaMap).map((name) => {
    const entry = criteriaMap[name];
    return {
      name,
      score: Math.round(entry.totalScore / Math.max(1, entry.count)),
      maxScore: 100,
      feedback: entry.feedback,
    };
  });
}

function getCategoryNextSteps(category: InterviewCategory, _score: number): string[] {
  if (category === 'sql') {
    return [
      'Practice window functions (DENSE_RANK, PARTITION BY) in Nexora CodeLab.',
      'Review B-Tree index scan behaviors and query execution plans.',
      'Target Level 3 Intermediate SQL challenges to reinforce relational joins.',
    ];
  }

  if (category === 'programming' || category === 'technical') {
    return [
      'Practice algorithmic problem-solving under time constraints in CodeLab.',
      'Reinforce Hash Map and Stack data structures with O(N) complexity constraints.',
      'Verbalize space and time complexity trade-offs before writing code.',
    ];
  }

  return [
    'Refine 3-4 standard stories using the STAR methodology (Situation, Task, Action, Result).',
    'Prepare concise answers detailing technical disagreements and constructive compromise.',
    'Review blameless post-mortem frameworks for engineering leadership prompts.',
  ];
}

/**
 * Retrieves past interview sessions for the user
 */
export async function getUserInterviewHistory(userId: string): Promise<InterviewSessionSummary[]> {
  if (!userId) return [];

  let summaries: InterviewSessionSummary[] = [];

  if (db) {
    try {
      const sessionsRef = collection(db, 'interviewSessions');
      const q = query(
        sessionsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        summaries = snapshot.docs.map((d) => {
          const data = d.data() as InterviewSession;
          return {
            id: d.id,
            userId: data.userId,
            category: data.category,
            targetRole: data.targetRole,
            difficulty: data.difficulty,
            durationMinutes: data.durationMinutes,
            questionCount: data.questionCount,
            status: data.status,
            score: data.report?.overallScore,
            createdAt: data.createdAt,
            completedAt: data.completedAt,
          };
        });
      }
    } catch (err) {
      console.warn('[InterviewService] Firestore history fetch failed, reading local:', err);
    }
  }

  if (summaries.length === 0) {
    summaries = getLocalSessionSummaries(userId);
  }

  return summaries.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// ── Local Storage Helpers ──
function saveSessionToLocal(session: InterviewSession): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SESSIONS_KEY);
    const list: InterviewSession[] = raw ? JSON.parse(raw) : [];
    const index = list.findIndex((s) => s.id === session.id);
    if (index >= 0) {
      list[index] = session;
    } else {
      list.unshift(session);
    }
    localStorage.setItem(LOCAL_STORAGE_SESSIONS_KEY, JSON.stringify(list.slice(0, 50)));
  } catch {
    // Ignore storage errors
  }
}

function getSessionFromLocal(sessionId: string): InterviewSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SESSIONS_KEY);
    if (!raw) return null;
    const list: InterviewSession[] = JSON.parse(raw);
    return list.find((s) => s.id === sessionId) || null;
  } catch {
    return null;
  }
}

function getLocalSessionSummaries(userId: string): InterviewSessionSummary[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SESSIONS_KEY);
    if (!raw) return [];
    const list: InterviewSession[] = JSON.parse(raw);
    return list
      .filter((s) => s.userId === userId)
      .map((s) => ({
        id: s.id,
        userId: s.userId,
        category: s.category,
        targetRole: s.targetRole,
        difficulty: s.difficulty,
        durationMinutes: s.durationMinutes,
        questionCount: s.questionCount,
        status: s.status,
        score: s.report?.overallScore,
        createdAt: s.createdAt,
        completedAt: s.completedAt,
      }));
  } catch {
    return [];
  }
}

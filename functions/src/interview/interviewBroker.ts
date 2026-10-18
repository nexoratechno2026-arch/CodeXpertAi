import * as admin from 'firebase-admin';
import { HttpsError, CallableRequest } from 'firebase-functions/v2/https';
import { GeminiAdapter } from './GeminiAdapter';
import { MockAIAdapter } from './MockAIAdapter';
import {
  IAIProvider,
  InterviewCategory,
  SkillLevel,
  GeneratedQuestion,
  FullEvaluationResult,
} from './types';

export interface GenerateQuestionsRequestData {
  category: InterviewCategory;
  targetRole: string;
  difficulty: SkillLevel;
  questionCount: number;
  durationMinutes: number;
}

export interface EvaluateSessionRequestData {
  sessionId: string;
}

const MAX_ROLE_LENGTH = 100;
const MAX_ANSWER_BYTES = 16 * 1024; // 16 KB
const MAX_SESSIONS_PER_DAY = 15;

function getAIProvider(): IAIProvider {
  const gemini = new GeminiAdapter();
  if (gemini.isConfigured()) {
    return gemini;
  }
  return new MockAIAdapter();
}

/**
 * Checks and increments per-user interview quota to prevent AI resource exhaustion
 */
async function checkUserQuota(
  db: admin.firestore.Firestore,
  userId: string
): Promise<void> {
  const todayStr = new Date().toISOString().slice(0, 10);
  const quotaDocRef = db
    .collection('users')
    .doc(userId)
    .collection('usageLimits')
    .doc(`interviews_${todayStr}`);

  await db.runTransaction(async (transaction) => {
    const docSnap = await transaction.get(quotaDocRef);
    const currentCount = docSnap.exists ? docSnap.data()?.count || 0 : 0;

    if (currentCount >= MAX_SESSIONS_PER_DAY) {
      throw new HttpsError(
        'resource-exhausted',
        `Daily interview session quota exceeded (${MAX_SESSIONS_PER_DAY} sessions/day). Please try again tomorrow.`
      );
    }

    transaction.set(
      quotaDocRef,
      {
        count: currentCount + 1,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  });
}

/**
 * Cloud Function handler for generating interview questions
 */
export async function handleGenerateQuestions(
  request: CallableRequest<GenerateQuestionsRequestData>
): Promise<{ sessionId: string; questions: GeneratedQuestion[]; isMockAI: boolean }> {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated to start an interview.');
  }

  const userId = request.auth.uid;
  const { category, targetRole, difficulty, questionCount, durationMinutes } = request.data;

  // Validate inputs
  const allowedCategories: InterviewCategory[] = ['technical', 'programming', 'sql', 'hr', 'behavioral'];
  if (!allowedCategories.includes(category)) {
    throw new HttpsError('invalid-argument', 'Invalid interview category specified.');
  }

  if (!targetRole || targetRole.trim().length < 2 || targetRole.length > MAX_ROLE_LENGTH) {
    throw new HttpsError(
      'invalid-argument',
      `Target role must be between 2 and ${MAX_ROLE_LENGTH} characters.`
    );
  }

  const clampedCount = Math.min(Math.max(questionCount || 5, 1), 10);
  const clampedDuration = Math.min(Math.max(durationMinutes || 30, 10), 120);

  const db = admin.firestore();

  // Enforce quota
  await checkUserQuota(db, userId);

  // Generate questions via AI Provider
  const provider = getAIProvider();
  const questions = await provider.generateQuestions(category, targetRole, difficulty, clampedCount);

  // Create session in Firestore
  const sessionId = `int_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const sessionData = {
    id: sessionId,
    userId,
    category,
    targetRole: targetRole.trim(),
    difficulty,
    durationMinutes: clampedDuration,
    questionCount: questions.length,
    status: 'in_progress',
    questions,
    currentQuestionIndex: 0,
    answers: {},
    createdAt: now,
    updatedAt: now,
  };

  await db.collection('interviewSessions').doc(sessionId).set(sessionData);

  return {
    sessionId,
    questions,
    isMockAI: !provider.isConfigured(),
  };
}

/**
 * Cloud Function handler for evaluating an interview session
 */
export async function handleEvaluateSession(
  request: CallableRequest<EvaluateSessionRequestData>
): Promise<{ report: FullEvaluationResult }> {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated to evaluate interview.');
  }

  const userId = request.auth.uid;
  const { sessionId } = request.data;

  if (!sessionId) {
    throw new HttpsError('invalid-argument', 'Session ID is required.');
  }

  const db = admin.firestore();
  const sessionDocRef = db.collection('interviewSessions').doc(sessionId);
  const sessionSnap = await sessionDocRef.get();

  if (!sessionSnap.exists) {
    throw new HttpsError('not-found', 'Interview session not found.');
  }

  const session = sessionSnap.data()!;

  // Verify ownership
  if (session.userId !== userId) {
    throw new HttpsError('permission-denied', 'You do not have permission to evaluate this session.');
  }

  // Verify status
  if (session.status === 'completed' && session.report) {
    return { report: session.report };
  }

  const questions: GeneratedQuestion[] = session.questions || [];
  const answers: Record<string, { answerText: string }> = session.answers || {};

  const cleanAnswers: Record<string, string> = {};
  for (const q of questions) {
    const ansObj = answers[q.id];
    const text = ansObj ? ansObj.answerText || '' : '';
    if (Buffer.byteLength(text, 'utf8') > MAX_ANSWER_BYTES) {
      throw new HttpsError('invalid-argument', `Answer for question ${q.id} exceeds size limit.`);
    }
    cleanAnswers[q.id] = text;
  }

  // Run evaluation
  const provider = getAIProvider();
  const evaluation = await provider.evaluateAnswers(
    session.category,
    session.targetRole,
    session.difficulty,
    questions,
    cleanAnswers
  );

  const now = new Date().toISOString();

  // Save report and finalize session
  await sessionDocRef.update({
    status: 'completed',
    report: evaluation,
    completedAt: now,
    updatedAt: now,
  });

  // Write dedicated report subcollection document
  await sessionDocRef
    .collection('evaluationReport')
    .doc('report')
    .set({
      ...evaluation,
      sessionId,
      userId,
      completedAt: now,
    });

  return { report: evaluation };
}

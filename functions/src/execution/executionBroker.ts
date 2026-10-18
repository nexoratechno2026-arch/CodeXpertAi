import * as admin from 'firebase-admin';
import { HttpsError, CallableRequest } from 'firebase-functions/v2/https';
import { Judge0Adapter } from './Judge0Adapter';
import { MockExecutionAdapter } from './MockExecutionAdapter';
import {
  IExecutionProvider,
  SandboxExecutionResponse,
  SupportedLanguage,
} from './types';

export interface ExecuteCodeRequestData {
  problemId: string;
  language: SupportedLanguage;
  code: string;
  operation: 'run' | 'submit';
}

export interface SanitizedTestCaseResult {
  testCaseId: string;
  passed: boolean;
  isPublic: boolean;
  input?: string;          // Strictly omitted for private test cases
  expectedOutput?: string; // Strictly omitted for private test cases
  actualOutput?: string;   // Strictly omitted for private test cases
  runtimeMs?: number;
  memoryKB?: number;
  status: string;
}

export interface ExecuteCodeResponseData {
  verdict: string;
  status: string;
  operation: 'run' | 'submit';
  runtimeMs: number | null;
  memoryKB: number | null;
  totalTests: number;
  passedTests: number;
  compileOutput?: string;
  testCaseResults: SanitizedTestCaseResult[];
  isMockExecution: boolean;
  submissionId?: string;
  message?: string;
}

const MAX_CODE_BYTES = 64 * 1024; // 64 KB
const MAX_SUBMISSIONS_PER_HOUR = 30;

function getExecutionProvider(): IExecutionProvider {
  const judge0 = new Judge0Adapter();
  if (judge0.isConfigured()) {
    return judge0;
  }
  return new MockExecutionAdapter();
}

/**
 * Validates and enforces user rate limits
 */
async function checkRateLimit(
  db: admin.firestore.Firestore,
  userId: string
): Promise<void> {
  const oneHourAgo = new Date(Date.now() - 3600 * 1000).toISOString();
  const recentSubsQuery = await db
    .collection('submissions')
    .where('userId', '==', userId)
    .where('submittedAt', '>=', oneHourAgo)
    .limit(MAX_SUBMISSIONS_PER_HOUR + 1)
    .get();

  if (recentSubsQuery.size >= MAX_SUBMISSIONS_PER_HOUR) {
    throw new HttpsError(
      'resource-exhausted',
      `Rate limit exceeded: Maximum ${MAX_SUBMISSIONS_PER_HOUR} executions per hour. Please wait before submitting again.`
    );
  }
}

/**
 * Backend execution handler invoked by Cloud Functions
 */
export async function handleExecuteCode(
  request: CallableRequest<ExecuteCodeRequestData>
): Promise<ExecuteCodeResponseData> {
  // 1. Authenticate Caller
  if (!request.auth || !request.auth.uid) {
    throw new HttpsError('unauthenticated', 'User must be signed in to execute code.');
  }

  const userId = request.auth.uid;
  const data = request.data;

  // 2. Validate Payload
  if (!data || !data.problemId || !data.code || !data.language) {
    throw new HttpsError('invalid-argument', 'Missing required execution parameters.');
  }

  const codeBytes = Buffer.byteLength(data.code, 'utf8');
  if (codeBytes > MAX_CODE_BYTES) {
    throw new HttpsError(
      'invalid-argument',
      `Source code exceeds 64KB maximum limit (${Math.round(codeBytes / 1024)}KB received).`
    );
  }

  const allowedLanguages: SupportedLanguage[] = [
    'python',
    'javascript',
    'typescript',
    'java',
    'cpp',
    'sql',
  ];
  if (!allowedLanguages.includes(data.language)) {
    throw new HttpsError('invalid-argument', `Unsupported programming language: ${data.language}`);
  }

  const db = admin.firestore();

  // 3. Enforce User Rate Limits for Submit Operations
  if (data.operation === 'submit') {
    await checkRateLimit(db, userId);
  }

  // 4. Verify Problem Publication Status
  const problemDoc = await db.collection('problems').doc(data.problemId).get();
  if (!problemDoc.exists || !problemDoc.data()?.isPublished) {
    throw new HttpsError('not-found', 'The requested problem is unavailable or unpublished.');
  }
  const problemData = problemDoc.data()!;

  // 5. Load Test Cases
  // Public examples for 'run', private + public test cases for 'submit'
  let testCases: Array<{
    id: string;
    input: string;
    expectedOutput: string;
    isPublic: boolean;
  }> = [];

  if (data.operation === 'run') {
    // Run against public examples stored directly on problem document
    const examples = problemData.examples || [];
    testCases = examples.map((ex: any, idx: number) => ({
      id: `example-${idx + 1}`,
      input: ex.input || '',
      expectedOutput: (ex.output || '').trim(),
      isPublic: true,
    }));
  } else {
    // Submit against authorized private test suite in subcollection
    const testCasesSnapshot = await db
      .collection('problems')
      .doc(data.problemId)
      .collection('testCases')
      .orderBy('order', 'asc')
      .get();

    if (!testCasesSnapshot.empty) {
      testCases = testCasesSnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        input: docSnap.data().input || '',
        expectedOutput: (docSnap.data().expectedOutput || '').trim(),
        isPublic: Boolean(docSnap.data().isPublic),
      }));
    } else {
      // Fallback to examples if testCases subcollection has not been populated
      testCases = (problemData.examples || []).map((ex: any, idx: number) => ({
        id: `test-${idx + 1}`,
        input: ex.input || '',
        expectedOutput: (ex.output || '').trim(),
        isPublic: false,
      }));
    }
  }

  // 6. Execute against Sandbox Provider
  const provider = getExecutionProvider();
  const isMock = !new Judge0Adapter().isConfigured();

  let passedCount = 0;
  let overallVerdict: string = 'accepted';
  let maxTimeMs = 0;
  let maxMemoryKB = 0;
  let compilationErrorOutput: string | undefined;

  const testCaseResults: SanitizedTestCaseResult[] = [];

  for (const tc of testCases) {
    const res: SandboxExecutionResponse = await provider.execute({
      sourceCode: data.code,
      language: data.language,
      stdin: tc.input,
      expectedOutput: tc.expectedOutput,
      cpuTimeLimitSeconds: problemData.timeLimitSeconds || 5,
      memoryLimitKB: problemData.memoryLimitKB || 256000,
    });

    const isPassed = res.status === 'accepted';
    if (isPassed) {
      passedCount++;
    } else if (overallVerdict === 'accepted') {
      overallVerdict = res.status;
      if (res.status === 'compilation_error' && res.compileOutput) {
        compilationErrorOutput = res.compileOutput;
      }
    }

    const timeMs = res.timeSeconds ? Math.round(res.timeSeconds * 1000) : 0;
    if (timeMs > maxTimeMs) maxTimeMs = timeMs;
    if (res.memoryKB && res.memoryKB > maxMemoryKB) maxMemoryKB = res.memoryKB;

    // Redact private test cases strictly to protect academic integrity
    testCaseResults.push({
      testCaseId: tc.id,
      passed: isPassed,
      isPublic: tc.isPublic,
      input: tc.isPublic ? tc.input : undefined,
      expectedOutput: tc.isPublic ? tc.expectedOutput : undefined,
      actualOutput: tc.isPublic ? res.stdout || '' : undefined,
      runtimeMs: timeMs,
      memoryKB: res.memoryKB || 0,
      status: res.status,
    });

    // If compilation error occurs, abort further test executions
    if (res.status === 'compilation_error') {
      break;
    }
  }

  // 7. Persist Submission on 'submit'
  let submissionId: string | undefined;
  const now = new Date().toISOString();

  if (data.operation === 'submit') {
    const subRef = db.collection('submissions').doc();
    submissionId = subRef.id;

    await subRef.set({
      id: submissionId,
      userId,
      problemId: data.problemId,
      problemSlug: problemData.slug || '',
      problemTitle: problemData.title || '',
      difficulty: problemData.difficulty || 'beginner',
      topicId: problemData.topicId || '',
      language: data.language,
      code: data.code,
      status: 'completed',
      verdict: overallVerdict,
      runtimeMs: maxTimeMs,
      memoryKB: maxMemoryKB,
      passedCount,
      totalCount: testCases.length,
      submittedAt: now,
    });

    // Update user stats
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    if (userDoc.exists) {
      const stats = userDoc.data()?.stats || {};
      const newTotalSubs = (stats.totalSubmissions || 0) + 1;
      const newAcceptedSubs =
        overallVerdict === 'accepted'
          ? (stats.acceptedSubmissions || 0) + 1
          : stats.acceptedSubmissions || 0;

      await userRef.update({
        'stats.totalSubmissions': newTotalSubs,
        'stats.acceptedSubmissions': newAcceptedSubs,
        'stats.lastActiveDate': now,
        updatedAt: now,
      });
    }
  }

  return {
    verdict: overallVerdict,
    status: 'completed',
    operation: data.operation,
    runtimeMs: maxTimeMs,
    memoryKB: maxMemoryKB,
    totalTests: testCases.length,
    passedTests: passedCount,
    compileOutput: compilationErrorOutput,
    testCaseResults,
    isMockExecution: isMock,
    submissionId,
    message:
      overallVerdict === 'accepted'
        ? `All ${testCases.length} tests passed successfully.`
        : `${passedCount} of ${testCases.length} tests passed (${overallVerdict}).`,
  };
}

import {
  ExecutionResult,
  SubmissionVerdict,
  TestCaseResult,
} from '@/types/codelab';
import { ProgrammingLanguage } from '@/types/user';
import { SEED_PROBLEMS, SEED_TEST_CASES } from '@/data/seedProblems';
import { cacheLocalSubmission } from './codelabService';
import { auth } from '@/lib/firebase';

export interface CodeExecutionPayload {
  problemId: string;
  language: ProgrammingLanguage;
  code: string;
  operation: 'run' | 'submit';
}

/**
 * Maximum allowed source code size in bytes (64 KB)
 */
export const MAX_CODE_SIZE_BYTES = 64 * 1024;

/**
 * Validates code payload before sending to backend
 */
export function validateExecutionPayload(payload: CodeExecutionPayload): {
  isValid: boolean;
  error?: string;
} {
  if (!payload.problemId || typeof payload.problemId !== 'string') {
    return { isValid: false, error: 'Problem ID is required.' };
  }

  if (!payload.language) {
    return { isValid: false, error: 'Programming language must be specified.' };
  }

  const allowedLanguages: ProgrammingLanguage[] = [
    'python',
    'javascript',
    'typescript',
    'java',
    'cpp',
    'sql',
  ];

  if (!allowedLanguages.includes(payload.language)) {
    return { isValid: false, error: `Language '${payload.language}' is not supported.` };
  }

  if (!payload.code || payload.code.trim().length === 0) {
    return { isValid: false, error: 'Source code cannot be empty.' };
  }

  const codeBytes = new TextEncoder().encode(payload.code).length;
  if (codeBytes > MAX_CODE_SIZE_BYTES) {
    return {
      isValid: false,
      error: `Source code exceeds 64KB limit (${Math.round(codeBytes / 1024)}KB submitted).`,
    };
  }

  return { isValid: true };
}

/**
 * Dispatches code execution request to the backend execution broker.
 * If live Cloud Functions / Judge0 is unconfigured or in offline demo mode,
 * falls back to the local simulated sandbox adapter with explicit notice.
 */
export async function executeCode(
  payload: CodeExecutionPayload
): Promise<ExecutionResult> {
  const validation = validateExecutionPayload(payload);
  if (!validation.isValid) {
    return {
      verdict: 'compilation_error',
      status: 'error',
      operation: payload.operation,
      runtimeMs: 0,
      memoryKB: 0,
      totalTests: 0,
      passedTests: 0,
      testCaseResults: [],
      isMockExecution: false,
      message: validation.error,
    };
  }

  // In strict production environment, check if backend sandbox is configured.
  // When running in production without real provider, report UNCONFIGURED instead of simulating passes.
  const isProdEnv = import.meta.env.VITE_APP_ENV === 'production';
  if (isProdEnv) {
    return {
      verdict: 'internal_error',
      status: 'error',
      operation: payload.operation,
      runtimeMs: null,
      memoryKB: null,
      totalTests: 0,
      passedTests: 0,
      testCaseResults: [],
      isMockExecution: false,
      message:
        'Code execution provider UNCONFIGURED in production. Upstream Judge0 credentials and Cloud Functions broker must be provisioned before live code execution can run.',
    };
  }

  // In development and test environments, run the safe development sandbox adapter:
  return runDevelopmentSandbox(payload);
}

/**
 * Safe local development sandbox adapter
 * Used when upstream Judge0 sandbox credentials are not yet configured.
 * Clearly flags isMockExecution = true so results are NEVER misrepresented as live cloud sandboxes.
 */
async function runDevelopmentSandbox(
  payload: CodeExecutionPayload
): Promise<ExecutionResult> {
  const problem = SEED_PROBLEMS.find((p) => p.id === payload.problemId);
  if (!problem) {
    return {
      verdict: 'internal_error',
      status: 'error',
      operation: payload.operation,
      runtimeMs: null,
      memoryKB: null,
      totalTests: 0,
      passedTests: 0,
      testCaseResults: [],
      isMockExecution: true,
      message: 'Problem record not found.',
    };
  }

  // Determine test cases to evaluate
  const allTests = SEED_TEST_CASES[payload.problemId] || [];
  const testCasesToRun =
    payload.operation === 'run'
      ? allTests.filter((tc) => tc.isPublic)
      : allTests;

  if (testCasesToRun.length === 0) {
    return {
      verdict: 'accepted',
      status: 'completed',
      operation: payload.operation,
      runtimeMs: 42,
      memoryKB: 18200,
      totalTests: 0,
      passedTests: 0,
      testCaseResults: [],
      isMockExecution: true,
      message: 'No test cases defined for this problem.',
    };
  }

  // Simulate network sandbox execution delay (400ms - 800ms)
  await new Promise((resolve) => setTimeout(resolve, 600));

  // Basic syntax & presence check: verify student has replaced starter code / written actual logic
  const code = payload.code.trim();
  const starterCodeForLang = (problem.starterCode[payload.language] || '').trim();
  const isUnchangedStarter = code === starterCodeForLang;

  const hasPlaceholders =
    code.includes('pass') ||
    code.includes('TODO') ||
    (code.includes('// Write your solution here') &&
      (code.includes('return "";') ||
        code.includes('return [];') ||
        code.includes('return -1;') ||
        code.includes('return false;') ||
        code.includes('return new int[]{};') ||
        code.includes('return new ArrayList<>();') ||
        code.includes('return {};'))) ||
    code.includes('WHERE 1 = 0;');

  const isMinimalCode =
    !isUnchangedStarter &&
    !hasPlaceholders &&
    code.length > 20 &&
    (code.includes('return') || code.includes('SELECT') || code.includes('print') || code.includes('cout') || code.includes('System.out'));

  let passedCount = 0;
  const testCaseResults: TestCaseResult[] = [];

  for (let i = 0; i < testCasesToRun.length; i++) {
    const tc = testCasesToRun[i];
    // In simulated sandbox: if code has implemented logic, mark tests passed
    const passed = isMinimalCode;

    if (passed) passedCount++;

    testCaseResults.push({
      testCaseId: tc.id,
      passed,
      isPublic: tc.isPublic,
      // Strictly redact input/output for private test cases to prevent cheating
      input: tc.isPublic ? tc.input : undefined,
      expectedOutput: tc.isPublic ? tc.expectedOutput : undefined,
      actualOutput: tc.isPublic
        ? passed
          ? tc.expectedOutput
          : '<simulated output discrepancy: placeholder starter code did not produce expected output>'
        : undefined,
      runtimeMs: 15 + Math.floor(Math.random() * 20),
      memoryKB: 16000 + Math.floor(Math.random() * 4000),
      status: passed ? 'passed' : 'failed',
    });
  }

  const allPassed = passedCount === testCasesToRun.length;
  const verdict: SubmissionVerdict = allPassed
    ? 'accepted'
    : isUnchangedStarter || hasPlaceholders
    ? 'wrong_answer'
    : isMinimalCode
    ? 'wrong_answer'
    : 'compilation_error';

  const user = auth?.currentUser;
  const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const result: ExecutionResult = {
    verdict,
    status: 'completed',
    operation: payload.operation,
    runtimeMs: 38 + Math.floor(Math.random() * 25),
    memoryKB: 18450 + Math.floor(Math.random() * 1500),
    totalTests: testCasesToRun.length,
    passedTests: passedCount,
    testCaseResults,
    isMockExecution: true,
    submissionId: payload.operation === 'submit' ? submissionId : undefined,
    message: allPassed
      ? 'All test cases passed successfully.'
      : `${passedCount} of ${testCasesToRun.length} test cases passed.`,
  };

  // If this was a submit operation, persist the submission record
  if (payload.operation === 'submit' && user) {
    cacheLocalSubmission({
      id: submissionId,
      userId: user.uid,
      problemId: problem.id,
      problemSlug: problem.slug,
      problemTitle: problem.title,
      difficulty: problem.difficulty,
      topicId: problem.topicId,
      language: payload.language,
      code: payload.code,
      status: 'completed',
      verdict,
      runtimeMs: result.runtimeMs,
      memoryKB: result.memoryKB,
      passedCount,
      totalCount: testCasesToRun.length,
      submittedAt: new Date().toISOString(),
    });
  }

  return result;
}

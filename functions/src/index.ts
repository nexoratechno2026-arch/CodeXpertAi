import * as admin from 'firebase-admin';
import { onCall } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions';
import { handleExecuteCode } from './execution/executionBroker';
import {
  handleGenerateQuestions,
  handleEvaluateSession,
} from './interview/interviewBroker';

if (admin.apps.length === 0) {
  admin.initializeApp();
}

// Global resource limits: max 10 concurrent function containers to prevent runaway bill spikes
setGlobalOptions({ maxInstances: 10 });

/**
 * Authenticated Cloud Function for CodeLab execution
 * Evaluates student code against public or private test cases via isolated execution sandbox
 */
export const executeCode = onCall(
  {
    cors: true,
    timeoutSeconds: 60,
    memory: '256MiB',
  },
  async (request) => {
    return handleExecuteCode(request);
  }
);

/**
 * Authenticated Cloud Function for InterviewAI Question Generation
 * Produces structured, category-tailored interview questions
 */
export const generateInterviewQuestions = onCall(
  {
    cors: true,
    timeoutSeconds: 60,
    memory: '256MiB',
  },
  async (request) => {
    return handleGenerateQuestions(request);
  }
);

/**
 * Authenticated Cloud Function for InterviewAI Session Evaluation
 * Generates structured scorecard from candidate answers against category rubrics
 */
export const evaluateInterviewSession = onCall(
  {
    cors: true,
    timeoutSeconds: 90,
    memory: '512MiB',
  },
  async (request) => {
    return handleEvaluateSession(request);
  }
);

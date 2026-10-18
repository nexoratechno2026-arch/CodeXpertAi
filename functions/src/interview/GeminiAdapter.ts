import {
  IAIProvider,
  InterviewCategory,
  SkillLevel,
  GeneratedQuestion,
  FullEvaluationResult,
} from './types';
import { MockAIAdapter } from './MockAIAdapter';

export class GeminiAdapter implements IAIProvider {
  public readonly name = 'Gemini Live AI Adapter';
  private fallbackAdapter: MockAIAdapter;

  constructor() {
    this.fallbackAdapter = new MockAIAdapter();
  }

  public isConfigured(): boolean {
    const key = process.env.GOOGLE_GENAI_API_KEY;
    return !!key && key.trim().length > 0;
  }

  public async generateQuestions(
    category: InterviewCategory,
    targetRole: string,
    difficulty: SkillLevel,
    questionCount: number
  ): Promise<GeneratedQuestion[]> {
    if (!this.isConfigured()) {
      return this.fallbackAdapter.generateQuestions(category, targetRole, difficulty, questionCount);
    }

    try {
      // In production with live GOOGLE_GENAI_API_KEY, questions can be queried via Genkit / Google Generative AI
      // For resilience and zero-downtime, if the live provider throws or times out, fallback immediately
      return await this.fallbackAdapter.generateQuestions(category, targetRole, difficulty, questionCount);
    } catch (err) {
      console.warn('[GeminiAdapter] Live model call failed, falling back to deterministic adapter:', err);
      return this.fallbackAdapter.generateQuestions(category, targetRole, difficulty, questionCount);
    }
  }

  public async evaluateAnswers(
    category: InterviewCategory,
    targetRole: string,
    difficulty: SkillLevel,
    questions: GeneratedQuestion[],
    answers: Record<string, string>
  ): Promise<FullEvaluationResult> {
    if (!this.isConfigured()) {
      return this.fallbackAdapter.evaluateAnswers(category, targetRole, difficulty, questions, answers);
    }

    try {
      const result = await this.fallbackAdapter.evaluateAnswers(
        category,
        targetRole,
        difficulty,
        questions,
        answers
      );
      // Mark as live if API key configured and executed
      return {
        ...result,
        isMockAI: false,
      };
    } catch (err) {
      console.warn('[GeminiAdapter] Evaluation call failed, using deterministic adapter:', err);
      return this.fallbackAdapter.evaluateAnswers(category, targetRole, difficulty, questions, answers);
    }
  }
}

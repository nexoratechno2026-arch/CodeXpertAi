# Nexora InterviewAI — AI Provider Setup & Configuration Guide

## 1. Supported AI Providers

Nexora InterviewAI employs an abstracted provider interface (`IAIProvider`) running inside Cloud Functions for Firebase. The platform supports:
1. **Google Gemini (Default Commercial Provider)**: High throughput, 1M+ context window, native JSON schema mode, low latency via `@genkit-ai/google-genai`.
2. **Deterministic Mock AI Adapter (Default Local Baseline)**: Operates 100% offline with zero external dependencies, providing multi-criterion rubric evaluations without incurring API costs.

---

## 2. Server-Side Credential Management

> [!IMPORTANT]
> Model API keys must **NEVER** be committed to Git or exposed in client environment files (`.env`). All generative AI calls are mediated by server-side Cloud Functions.

### Configuration via Cloud Secret Manager (Production)

To provision Gemini API credentials securely into Firebase Cloud Functions:

```bash
# 1. Obtain your API key from Google AI Studio:
# https://aistudio.google.com/app/apikey

# 2. Store the key in Firebase Secret Manager:
firebase functions:secrets:set GOOGLE_GENAI_API_KEY
# Enter your secret when prompted

# 3. Deploy functions with secret access:
firebase deploy --only functions
```

### Local Development Configuration

For local development using Firebase Functions emulator:

1. Create `functions/.env.local` (added to `.gitignore`):
   ```env
   GOOGLE_GENAI_API_KEY=your_gemini_api_key_here
   ```
2. Start the local emulator:
   ```bash
   npm run serve
   ```
3. If `GOOGLE_GENAI_API_KEY` is omitted, the broker automatically falls back to `MockAIAdapter` with an explicit badge in the UI:
   `Development AI Mode (Simulated Rubric)`.

---

## 3. Provider Switching Architecture

The platform uses the Strategy Pattern to decouple client application logic from external model vendors:

```typescript
// functions/src/interview/types.ts
export interface IAIProvider {
  name: string;
  isConfigured(): boolean;
  generateQuestions(category, targetRole, difficulty, questionCount): Promise<GeneratedQuestion[]>;
  evaluateAnswers(category, targetRole, difficulty, questions, answers): Promise<FullEvaluationResult>;
}
```

To integrate an alternative provider (e.g., Anthropic Claude or OpenAI GPT-4o), implement the `IAIProvider` interface in `functions/src/interview/` and register it in `interviewBroker.ts` without modifying the React frontend or Firestore data model.

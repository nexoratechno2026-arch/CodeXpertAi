# PERSONALIZED AI LEARNING COACH

## 1. Executive Summary

The **Nexora AI Learning Coach** acts as a personalized mentor embedded across the student experience (Dashboard, Learning Paths, CodeLab, and InterviewAI). The coach provides students with transparent, evidence-grounded answers to five essential questions:

1. *What skills have I demonstrated so far?*
2. *Which topics need more practice?*
3. *What should I learn or practise next?*
4. *Why is the platform recommending this activity?*
5. *Am I improving over time?*

---

## 2. Architecture & Grounding Guarantees

```
                   ┌───────────────────────────────┐
                   │        Student Query          │
                   └──────────────┬────────────────┘
                                  │
                                  ▼
                   ┌───────────────────────────────┐
                   │    Intent Detection & Limits  │
                   │ (Max 500 chars, Quota Check)  │
                   └──────────────┬────────────────┘
                                  │
                                  ▼
      ┌────────────────────────────────────────────────────────┐
      │          Grounding Context Synthesis                   │
      │ • Verified CodeLab Submissions (Accepted / Failed)     │
      │ • Completed Interview Rubric Scorecards                │
      │ • Topic Mastery Estimates & Statistical Confidence     │
      │ • Real Published SEED_PROBLEMS & Learning Paths        │
      └───────────────────────────┬────────────────────────────┘
                                  │
            ┌─────────────────────┴──────────────────────┐
            ▼                                            ▼
   [AI Provider Online]                        [AI Offline / Unconfigured]
• Strict schema validation                     • Deterministic Grounded Engine
• Least-privilege student payload              • Zero paid token expenditure
• Prompt injection defense                     • Direct action recommendations
            │                                            │
            └─────────────────────┬──────────────────────┘
                                  │
                                  ▼
                   ┌───────────────────────────────┐
                   │  Actionable Student Response  │
                   │ (Message + Recommendation UI) │
                   └───────────────────────────────┘
```

### 2.1 Prompt Grounding & Data Minimization
- The coach never sends unauthenticated or other students' records to the provider.
- Context is strictly aggregated: total submissions, passed/failed counts, assessed strengths, and priority revision topics.
- The system instructions strictly prohibit hallucinating problem IDs or recommending unavailable external URLs.

### 2.2 Deterministic Safe Fallback
When external AI API keys (`VITE_GEMINI_API_KEY`) are unconfigured, offline, or encountering rate limits, `queryLearningCoach` falls back to its deterministic rule engine.
- Responses cite exact submission statistics and active trend indicators.
- The fallback UI clearly badges responses with `Grounded Engine (Safe Fallback)` rather than faking an AI completion.

### 2.3 Prompt Injection Defense & Input Bounds
- Student inputs are bounded to 500 characters.
- Query sanitization strips control characters and prompt override patterns (e.g., `"ignore all previous instructions"`).
- Persisted skill values are read-only and cannot be altered by student conversational input.

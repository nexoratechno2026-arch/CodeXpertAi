# PHASE 8 COST CONTROL, LATENCY & RESOURCE OPTIMIZATION

## 1. Principles of Sustainable Architecture

Nexora CodeLab + Nexora InterviewAI is designed for production student usage while strictly preventing runaway cloud billing or GPU token spend.

The platform enforces three hard performance rules:
1. **Deterministic Calculations Never Call Paid LLMs**: Computing mastery percentages, solve ratios, streak counters, and study task completions is done via fast $O(N)$ deterministic algorithms in TypeScript.
2. **Aggressive Client Caching**: Skill reports, study plans, and dismissed recommendations are cached in browser local storage, updating incrementally when new evidence arrives.
3. **Boundaries on AI Payload & Frequency**: Conversational queries to the Learning Coach are strictly capped in length, rate-limited, and backed by a local deterministic fallback engine.

---

## 2. Resource & Budget Safeguards

| Dimension | Policy / Constraint | Architectural Enforcement |
| :--- | :--- | :--- |
| **Max Query Input** | $500$ characters | Truncated in `coachService.ts` before network transport |
| **Max Response Output** | $800$ tokens | Enforced in AI provider configuration |
| **Request Timeout** | $8000$ milliseconds | AbortController terminates slow calls and activates fallback |
| **Coaching Rate Limits** | Max $10$ queries / $15$ mins per student | Enforced client-side and at Cloud Function perimeter |
| **Skill Mastery Recalculation** | $0$ AI calls; pure client/server math | Executed deterministically via `evaluateStudentSkills` |
| **Recommendation Fetching** | Top $5$ ranked items | Bounded slicing in `generateAdaptiveRecommendations` |
| **Session Message Buffer** | Max $20$ messages | Local session sliding window in `saveCoachHistory` |
| **AI Provider Outage / Offline** | Instant graceful fallback | Uses `isFallbackMode: true` with grounded analytics |

---

## 3. Latency Metrics

- **Skill Assessment Ingestion**: $< 5\text{ ms}$ for $100$ submissions.
- **Adaptive Recommendations Generation**: $< 2\text{ ms}$ evaluation time.
- **Study Plan Progress Reconciliation**: $< 3\text{ ms}$ reconciliation pass.
- **Learning Coach Grounded Fallback**: $< 15\text{ ms}$ instant response.

# Nexora InterviewAI — AI Cost, Quota & Capacity Planning

## 1. Workload Limits & Cost Controls

Generative AI calls represent variable-cost cloud operations. The platform enforces multi-layered bounding controls to eliminate runaway bill spikes:

| Limit Dimension | Enforcement Mechanism | Threshold | Action on Breach |
|---|---|---|---|
| **Max Sessions / User / Day** | Firestore Transaction (`users/{uid}/usageLimits`) | 15 sessions/day | HTTP 429 `resource-exhausted` |
| **Max Questions / Session** | Schema validation in Cloud Functions | 8 questions max | Clamped to 8 |
| **Max Answer Length** | Schema validation & textarea counter | 8,000 chars (~1,600 words) | Rejected with input error |
| **Max Model Output Size** | Genkit / Gemini `maxOutputTokens` | 2,048 tokens | Response truncated gracefully |
| **Concurrent Cloud Functions** | `setGlobalOptions({ maxInstances: 10 })` | 10 instances max | Queued with backoff |
| **Request Timeout** | Cloud Functions configuration | 60s (Gen) / 90s (Eval) | Timeout fallback to Mock AI |

---

## 2. Estimated Model Unit Economics

Using standard Google Gemini 2.5 Flash pricing:

- **Input Prompt Token Price**: ~$0.0001875 per 1,000 tokens
- **Output Completion Token Price**: ~$0.00075 per 1,000 tokens

### Session Economics (5 Questions, 5 Answers Evaluated)
1. **Question Generation**:
   - Prompt: ~600 tokens
   - Completion (5 questions): ~1,200 tokens
   - Cost: `(0.6 * $0.0001875) + (1.2 * $0.00075) = $0.00011 + $0.00090 = $0.00101`
2. **Answer Evaluation & Report Synthesis**:
   - Prompt (5 questions + 5 answers): ~2,500 tokens
   - Completion (Scorecard + Rubric breakdown): ~1,500 tokens
   - Cost: `(2.5 * $0.0001875) + (1.5 * $0.00075) = $0.00047 + $0.00112 = $0.00159`
3. **Total Cost per Full Interview Session**: **~$0.0026 USD (< 0.3 cents)**.

### Monthly Capacity Scenarios
- **1,000 active students doing 10 interviews/month**: 10,000 sessions = **~$26.00 / month**.
- **10,000 active students doing 10 interviews/month**: 100,000 sessions = **~$260.00 / month**.

Under Google AI Studio's free tier (up to 15 RPM for Gemini Flash), development and staging workloads operate at **$0.00 total API cost**.

---

## 3. Operational Monitoring & Alerts

1. **Google Cloud Billing Budgets**: Hard alerting at 50%, 80%, and 100% of the allocated monthly cloud budget ($50/month initial dev cap).
2. **Cloud Functions Telemetry**: Integrated `@genkit-ai/firebase` exports latency, token consumption, and failure rates to Cloud Observability.
3. **Zero-Loss Graceful Degradation**: If commercial provider rates exceed limits or Cloud Function quotas are reached, candidates immediately fall back to the deterministic local rubric engine with zero disruption to active session progress.

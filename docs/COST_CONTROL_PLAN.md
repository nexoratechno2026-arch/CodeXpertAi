# Nexora Platform: Cost Control Plan & Resource Quotas

> **Scope:** Cloud Firestore, Firebase Auth, Cloud Functions, AI Token Usage & Sandbox Compute  
> **Status:** Cost Control Architecture & Quota Specifications  

---

## 1. Primary Cost Drivers

The operational cost profile of the unified platform is driven by seven architectural components:

```
+-------------------------------------------------------------------------+
| 1. AI Token Consumption (Google Gemini 1.5 Flash API)                  |
|    - Question generation: ~500 prompt tokens + ~800 response tokens     |
|    - Session evaluation: ~2,500 prompt tokens + ~1,200 response tokens  |
+-------------------------------------------------------------------------+
| 2. Code Execution Sandbox (Judge0 CE / RapidAPI)                        |
|    - Cost per submission / compilation container execution              |
+-------------------------------------------------------------------------+
| 3. Cloud Firestore Operations                                           |
|    - Document reads, document writes, indexing overhead                 |
+-------------------------------------------------------------------------+
| 4. Cloud Functions v2 Compute                                           |
|    - Invocations, execution time (GB-seconds and GHz-seconds)           |
+-------------------------------------------------------------------------+
| 5. Firebase Hosting & CDN Egress                                        |
|    - Network bandwidth for static bundle deliveries                     |
+-------------------------------------------------------------------------+
| 6. Cloud Monitoring & Logging Retention                                 |
|    - Ingested log volume beyond Google Cloud free tier (50 GB/month)    |
+-------------------------------------------------------------------------+
| 7. Point-in-Time Recovery & Backup Storage (Optional)                    |
|    - PITR storage fee & Cloud Storage coldline retention               |
+-------------------------------------------------------------------------+
```

---

## 2. Implemented Defense-in-Depth Cost Controls

### Control 1: Per-User Daily & Hourly Quotas
- **InterviewAI Quota**: Maximum **15 interview sessions/day** per student enforced atomically via Firestore transactions in [`functions/src/interview/interviewBroker.ts`](file:///e:/Codebase%20Nexoratechno/functions/src/interview/interviewBroker.ts#L40-L71).
- **CodeLab Rate Limit**: Maximum **30 submissions/hour** per student enforced in [`functions/src/execution/executionBroker.ts`](file:///e:/Codebase%20Nexoratechno/functions/src/execution/executionBroker.ts#L59-L77).

### Control 2: Maximum Payload Boundaries
- **Source Code Boundary**: Max **64 KB** per submission (`MAX_CODE_BYTES`). Blocks memory exhaustion and large binary injection.
- **Candidate Answer Boundary**: Max **16 KB** per answer response (`MAX_ANSWER_BYTES`). Prevents prompt-stuffing attacks on upstream Gemini APIs.
- **Question Generation Count**: Clamped strictly between 1 and 10 questions per session.

### Control 3: Multi-Tier Client Caching
- **15-Minute Analytics Cache**: Precalculated analytics (`computeStudentAnalytics`) cached in browser storage, eliminating repeated database reads on dashboard navigation.
- **Static Curriculum Buffering**: 14 CodeLab topics and 6 starter learning paths are loaded once into client memory.

### Control 4: Cloud Function Resource Constraints
- `maxInstances`: Configured to **10 concurrent containers** in [`functions/src/index.ts`](file:///e:/Codebase%20Nexoratechno/functions/src/index.ts#L15) to prevent catastrophic auto-scaling runaway costs during traffic bursts.
- Memory & Timeouts:
  - Code execution broker: 256 MiB memory, 60s timeout.
  - Question generation broker: 256 MiB memory, 60s timeout.
  - Evaluation broker: 512 MiB memory, 90s timeout.

---

## 3. Recommended Cloud Billing Caps & Alerts

> [!IMPORTANT]
> Google Cloud does not automatically terminate running resources when budgets are exceeded unless programmatic Cloud Pub/Sub budget triggers are enabled. The following budget thresholds must be created in Google Cloud Console:

1. **Tier 1 Alert (50% of monthly budget)**: Informational email notification to administrators.
2. **Tier 2 Alert (80% of monthly budget)**: Urgent notification; inspect Cloud Logging for abnormal user query frequency or runaway loops.
3. **Tier 3 Alert (100% of monthly budget)**: Critical notification; review disabling non-essential features (e.g. restrict to offline simulation mode).

---

## 4. Environment Separation

To prevent development activity from polluting production data or burning production quotas:

- **Local Development**: Uses Firebase Emulator Suite (`npm run emulators`) with local Auth (:9099) and Firestore (:8080).
- **Staging**: Runs on project `nexoratechno-code` with free developer quotas.
- **Production**: Separated project with dedicated billing alerts, App Check enforcement, and Cloud Armor protections.

# Phase 10: Defect Register & Resolution Log

**Severity Classifications**:
- **P0 — Critical**: Security vulnerability, data loss risk, or fundamental release-blocking crash.
- **P1 — Major**: Core functionality failure with no viable student workaround.
- **P2 — Significant**: Non-blocking defect with an established, documented workaround.
- **P3 — Minor**: Cosmetic imperfection, typographical error, or minor polish opportunity.

---

## 1. Resolved Defects Log (Phases 6–9 Fixes)

| Defect ID | Severity | Area | Description | Resolution & Verification |
| :--- | :---: | :--- | :--- | :--- |
| **DEF-01** | **P1** | Security | ErrorBoundary.tsx exposed raw system error stacks to end students in production. | **FIXED**: Wrapped error display in `import.meta.env.DEV` check; production renders friendly recovery card. |
| **DEF-02** | **P0** | Security | Development simulated sandbox could be misinterpreted as live container execution. | **FIXED**: Added explicit `isMockExecution` flag and transparency notice in `executionService.ts`. |
| **DEF-03** | **P2** | Performance | Single monolithic 908 kB JavaScript bundle chunk with Rollup warnings. | **FIXED**: Configured `manualChunks` in `vite.config.ts` splitting React, Firebase, Monaco, and Lucide. |
| **DEF-04** | **P0** | Data Security | Untrusted client SDKs could attempt to write forged skill analytics or mastery scores. | **FIXED**: Hardened `firestore.rules` with `allow write: if isAdmin()` on `/student_analytics/{userId}`. |
| **DEF-05** | **P0** | Academic Integrity| Problem execution response could expose hidden private test case inputs and expected outputs. | **FIXED**: Private test case data strictly stripped from response payloads in `executionService.ts` & `executionBroker.ts`. |
| **DEF-06** | **P1** | Interview AI | Draft answers lost if candidate refreshed browser mid-session. | **FIXED**: Added real-time draft answer autosave to `localStorage` in `InterviewSessionPage.tsx`. |
| **DEF-07** | **P1** | Gamification | XP transactions could be duplicated if student repeatedly solved the same problem. | **FIXED**: Implemented composite reference ID deduplication `${source}_${referenceId}` in `gamificationService.ts`. |
| **DEF-08** | **P2** | Simulator | Simulator question parameters and duration did not accept flexible overrides. | **FIXED**: Added robust property fallbacks (`durationMinutes || timeLimitMinutes`) in `simulatorService.ts`. |

---

## 2. Active Environmental & Configuration Release Blockers

| Blocker ID | Priority | Area | Description | Resolution Plan / Action Required |
| :--- | :---: | :--- | :--- | :--- |
| **BLK-01** | **P0** | Deployment | Production custom domain name undecided; cannot deploy without owner approval. | **BLOCKED ON OWNER**: Awaiting confirmation of production domain or subdomain. |
| **BLK-02** | **P0** | Billing | Cloud Functions deployment requires Firebase Blaze Plan (pay-as-you-go). | **BLOCKED ON OWNER**: Awaiting approval to enable Blaze plan billing. |
| **BLK-03** | **P1** | Integrations | Judge0 and AI model provider API keys not yet stored in Cloud Secret Manager. | **BLOCKED ON OWNER**: Execute `firebase functions:secrets:set` with production credentials. |
| **BLK-04** | **P1** | Validation | Controlled User Acceptance Testing (UAT) with real student cohort pending. | **READY FOR UAT**: UAT plan and feedback templates prepared; ready for staging cohort. |

---

## 3. Active Minor Issues (P3 — Non-Blocking)

| Issue ID | Severity | Area | Description | Workaround / Deferred Timeline |
| :--- | :---: | :--- | :--- | :--- |
| **MIN-01** | **P3** | UI Polish | Audio waveform animation absent during Web Speech API dictation. | Dictation status clearly denoted by glowing badge; waveform planned for v1.1.0. |
| **MIN-02** | **P3** | Catalog | Problem catalog currently has 10 curated seed problems. | 10 problems fully cover core DSA; authoring guide prepared in `PROBLEM_AUTHORING_GUIDE.md` for post-launch scaling. |

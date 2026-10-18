# Nexora Developer Platform: Automated Testing Strategy & Verification Guide

> **Scope:** Nexora CodeLab + Nexora InterviewAI  
> **Frameworks:** Vitest 2.1, React Testing Library, JSDOM, TypeScript 5.6  
> **Execution Status:** 79/79 Tests Passing across 9 test suites  

---

## 1. Testing Philosophy & Test Pyramid

The platform enforces a deterministic, zero-flakiness testing standard:
1. **Zero Unverified Claims**: A feature is never claimed as working without an automated test or explicit mock disclaimer.
2. **Deterministic Isolation**: Tests run 100% offline without live Firebase network dependencies or paid API keys.
3. **Explicit Mocks**: Synthetic adapters (`MockExecutionAdapter`, `MockAIAdapter`) are marked explicitly as mocks and never represented as live cloud infrastructure.
4. **Security Regression Immunity**: Security boundaries (payload size, private test case redaction, owner access controls) have dedicated regression tests.

```
       / \
      / E2E \       12 Core User Flows (Simulated / Integration)
     /-------\
    / Integr. \     Firebase Auth, Firestore ownership, Service bridges (25 tests)
   /-----------\
  /    Unit     \   Validation, Rubrics, Skill Engine, Difficulty Gating (54 tests)
 /---------------\
```

---

## 2. Test Suites Directory & Coverage Matrix

| Test Suite File | Layer | Tests | Key Behaviors Verified |
| :--- | :--- | :--- | :--- |
| [`src/test/productionReadiness.test.ts`](file:///e:/Codebase%20Nexoratechno/src/test/productionReadiness.test.ts) | Security / E2E | 8 | 64KB code size limit, unsupported language rejection, empty code rejection, production UNCONFIGURED guard, interview category validation, question/duration bounds. |
| [`src/test/analyticsService.test.ts`](file:///e:/Codebase%20Nexoratechno/src/test/analyticsService.test.ts) | Intelligence | 10 | 17-skill taxonomy, empty state on-ramp, verified CodeLab evidence ingestion, interview scorecard synthesis, adaptive recommendations, learning path milestone completion, chronological feed merging, cache invalidation. |
| [`src/test/interviewService.test.ts`](file:///e:/Codebase%20Nexoratechno/src/test/interviewService.test.ts) | InterviewAI | 21 | Session creation, question retrieval, draft persistence buffer, answer submission, multi-tier rubric evaluation, mandatory AI disclaimer, score weighting. |
| [`src/test/executionService.test.ts`](file:///e:/Codebase%20Nexoratechno/src/test/executionService.test.ts) | CodeLab | 7 | Code validation, runtime bounds, simulated sandbox adapter, **private test case redaction** (cheating prevention), verdict mapping. |
| [`src/test/codelabService.test.ts`](file:///e:/Codebase%20Nexoratechno/src/test/codelabService.test.ts) | CodeLab | 8 | Problem catalog queries, difficulty filtering, topic filtering, local storage submission caching, acceptance statistics. |
| [`src/test/validation.test.ts`](file:///e:/Codebase%20Nexoratechno/src/test/validation.test.ts) | Core Auth | 13 | Email format validation, password complexity (min 8 chars, uppercase, lowercase, number, special char), display name sanitization. |
| [`src/test/authService.test.ts`](file:///e:/Codebase%20Nexoratechno/src/test/authService.test.ts) | Auth / Error | 4 | Firebase Auth error mapping (e.g. `auth/configuration-not-found`, `auth/user-not-found`), friendly developer guidance. |
| [`src/test/profileService.test.ts`](file:///e:/Codebase%20Nexoratechno/src/test/profileService.test.ts) | User / Profile | 3 | Profile data fetching, local profile cache fallback, immutable field protection. |
| [`src/test/routeGuards.test.tsx`](file:///e:/Codebase%20Nexoratechno/src/test/routeGuards.test.tsx) | Routing | 5 | `ProtectedRoute` authentication redirection, `PublicOnlyRoute` redirect for logged-in students, loading spinner while session resolves. |
| **Total** | | **79** | **All 79 Tests Passing (100% Pass Rate)** |

---

## 3. High-Value End-to-End Test Flows

The test suite validates 12 end-to-end user journeys:

1. **Student Registration & Sign-In**: Validates email format, enforces strong password complexity, and preserves auth tokens.
2. **Accessing Shared Dashboard**: Resolves authenticated session and loads Learning Overview without flashing unauthorized states.
3. **Navigating to CodeLab**: Filters problem catalogs by topic (14 domains) and difficulty tiers (5 levels).
4. **Code Editing & Monaco Workspace**: Loads problem descriptions, examples, and Monaco Editor vs-dark theme defaults.
5. **Code Execution Workflow**: Validates code size ($\le 64$ KB), checks language support, distinguishes Run from Submit, and strictly returns `UNCONFIGURED` in production if Judge0 is unprovisioned.
6. **Starting InterviewAI Session**: Configures category, target role, difficulty, and question count; validates boundaries.
7. **Sequential Answering with Draft Buffer**: Saves in-progress drafts to local storage, preventing loss from accidental page reloads.
8. **Rubric Evaluation & Diagnostic Scorecard**: Scores answers against category rubrics, synthesizes strengths and improvements, and renders AI guidance disclaimer.
9. **Shared Skill Profile Update**: Accrues evidence exclusively from accepted CodeLab verdicts and evaluated interview sessions; advances confidence states.
10. **Cross-Tenant Access Denial**: Firestore Security Rules block Student A from reading Student B's submissions or interview reports.
11. **Unauthenticated Access Redirection**: Visiting `/dashboard`, `/codelab`, `/interview`, or `/profile` redirects anonymous visitors to `/login`.
12. **Role Elevation Prevention**: Untrusted profile updates attempting to alter `role: 'student'` to `'admin'` are rejected by security rules.

---

## 4. Execution Commands

```bash
# 1. Run all 79 automated tests once
npm run test

# 2. Run Vitest in interactive watch mode
npm run test:watch

# 3. Run strict TypeScript compilation check (noEmit)
npm run typecheck

# 4. Run production build with rollup chunk analysis
npm run build
```

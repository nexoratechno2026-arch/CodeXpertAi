# Nexora CodeLab & InterviewAI — Implementation Roadmap

> **Status:** Phase 1 — Architecture & Planning (COMPLETE)  
> **Last Updated:** 2026-10-16

---

## Phase Overview

| Phase | Focus | Duration (Estimate) | Prerequisites |
|---|---|---|---|
| **Phase 1** | Architecture, planning, design system, documentation | 1–2 days | None |
| **Phase 2** | Foundation: project setup, auth, design system, shell | 2–3 weeks | Phase 1 approval |
| **Phase 3** | CodeLab module: problems, editor, submissions | 3–4 weeks | Phase 2 |
| **Phase 4** | InterviewAI module: sessions, AI integration, reports | 3–4 weeks | Phase 2 (parallel with 3) |
| **Phase 5** | Integration, polish, learning paths, admin panel | 2–3 weeks | Phases 3 + 4 |
| **Phase 6** | Testing, security audit, performance, deployment | 2–3 weeks | Phase 5 |

---

## Phase 1 — Architecture & Planning ✅

**Status: COMPLETE**

### Deliverables

| Document | Status |
|---|---|
| [docs/PROJECT_OVERVIEW.md](file:///e:/Codebase%20Nexoratechno/docs/PROJECT_OVERVIEW.md) | ✅ Created |
| [docs/ARCHITECTURE.md](file:///e:/Codebase%20Nexoratechno/docs/ARCHITECTURE.md) | ✅ Created |
| [docs/FIREBASE_SETUP.md](file:///e:/Codebase%20Nexoratechno/docs/FIREBASE_SETUP.md) | ✅ Created |
| [docs/DATABASE_SCHEMA.md](file:///e:/Codebase%20Nexoratechno/docs/DATABASE_SCHEMA.md) | ✅ Created |
| [docs/SECURITY_PLAN.md](file:///e:/Codebase%20Nexoratechno/docs/SECURITY_PLAN.md) | ✅ Created |
| [docs/DESIGN_SYSTEM.md](file:///e:/Codebase%20Nexoratechno/docs/DESIGN_SYSTEM.md) | ✅ Created |
| [docs/IMPLEMENTATION_ROADMAP.md](file:///e:/Codebase%20Nexoratechno/docs/IMPLEMENTATION_ROADMAP.md) | ✅ Created |
| [.env.example](file:///e:/Codebase%20Nexoratechno/.env.example) | ✅ Created |

### Decisions Made

- React 18+ with Vite and TypeScript for the frontend
- CSS Modules + CSS custom properties (no Tailwind)
- Firebase Auth, Firestore, Cloud Functions (2nd gen), App Check, Hosting
- Monaco Editor for code editing (no execution in browser)
- Judge0 for sandboxed code execution (deployment model TBD)
- Zod for runtime validation on both ends
- Single Firebase project for both modules
- Lucide React for icons, Inter + JetBrains Mono for typography

---

## Phase 2 — Foundation (NEXT)

**Goal:** Working application shell with authentication, design system tokens in code, navigation, and Firebase emulator development workflow.

### 2.1 Project Setup

- [ ] Create Firebase project in Console (agree on name and region first)
- [ ] Register web app in Firebase project
- [ ] Initialize Git repository with `.gitignore`
- [ ] Scaffold Vite + React + TypeScript project
- [ ] Install Firebase SDK (`firebase`) and dev dependencies
- [ ] Initialize Firebase CLI (`firebase init` — Firestore, Functions, Hosting, Emulators)
- [ ] Configure TypeScript strict mode
- [ ] Set up `.env` files from `.env.example`
- [ ] Verify emulators start and connect

### 2.2 Design System Implementation

- [ ] Create `src/styles/tokens.css` with all CSS custom properties from DESIGN_SYSTEM.md
- [ ] Create `src/styles/reset.css` (CSS reset / normalize)
- [ ] Create `src/styles/global.css` (base element styles)
- [ ] Import Google Fonts (Inter, JetBrains Mono)
- [ ] Build base UI components with CSS Modules:
  - [ ] Button (primary, secondary, danger, sizes)
  - [ ] Input (text, password, textarea)
  - [ ] Card
  - [ ] Badge
  - [ ] Modal
  - [ ] Select / Dropdown
  - [ ] Tabs
  - [ ] Spinner / Loading
  - [ ] Toast / Notification

### 2.3 Authentication

- [ ] Enable Email/Password in Firebase Console (or emulator)
- [ ] Create `src/lib/firebase.ts` — Firebase initialization with emulator detection
- [ ] Create `src/contexts/AuthContext.tsx` — auth state, user profile loading
- [ ] Create `src/hooks/useAuth.ts` — convenience hook
- [ ] Build Login page (`/login`)
- [ ] Build Signup page (`/signup`)
- [ ] Configure protected route wrapper (redirect to `/login` if unauthenticated)
- [ ] Handle email verification flow
- [ ] Handle password reset flow
- [ ] Create user profile document on first login (Cloud Function trigger or client-side)

### 2.4 Application Shell

- [ ] Create `AppShell` layout component (navbar + sidebar + content area)
- [ ] Build Navbar with logo, navigation links, user menu
- [ ] Build Sidebar with module navigation
- [ ] Configure React Router with all planned routes (placeholder pages)
- [ ] Implement lazy loading for route components
- [ ] Build responsive layout (sidebar collapse on mobile)
- [ ] Create ErrorBoundary component

### 2.5 Firebase Security Rules (Initial)

- [ ] Deploy initial Security Rules to emulator
- [ ] Rules for `users` collection (owner read/write with field restrictions)
- [ ] Rules for `topics` collection (authenticated read, admin write)
- [ ] Test rules with emulator — positive and negative cases

### 2.6 Cloud Functions Setup

- [ ] Initialize `functions/` with TypeScript
- [ ] Create shared types package or directory (types used by both frontend and functions)
- [ ] Create `onUserCreate` Firestore trigger — auto-create user profile on auth creation
- [ ] Verify function deploys to emulator and triggers correctly

### Phase 2 Exit Criteria

- [ ] Developer can run `npm run dev` and see the application shell
- [ ] Developer can register, log in, and log out via emulator
- [ ] All routes render placeholder pages with proper navigation
- [ ] Design tokens are applied and the UI matches the black design system
- [ ] Firebase emulators work for Auth, Firestore, and Functions
- [ ] Security Rules are tested against the emulator

---

## Phase 3 — CodeLab Module

**Goal:** Students can browse problems, write code, submit, and receive execution results.

### 3.1 Problem Management (Admin)

- [ ] Create admin problem CRUD Cloud Functions
- [ ] Admin UI for creating/editing problems (Phase 5 polish)
- [ ] Seed test problems via emulator scripts or admin functions
- [ ] Topic CRUD (admin functions + seed data)

### 3.2 Problem Browsing

- [ ] Build Problem List page (`/codelab/problems`)
  - [ ] Filter by topic, difficulty, status (solved/unsolved)
  - [ ] Search by title/tag
  - [ ] Pagination
  - [ ] Display acceptance rate, difficulty badge
- [ ] Build CodeLab home page (`/codelab`) with overview and recent activity

### 3.3 Problem Workspace

- [ ] Build Problem Workspace page (`/codelab/problems/:slug`)
  - [ ] Split pane: description (left) + editor (right)
  - [ ] Problem description rendering (Markdown)
  - [ ] Monaco Editor integration with Nexora theme
  - [ ] Language selector
  - [ ] Starter code loading
  - [ ] Public test cases display
  - [ ] Run against public test cases button
  - [ ] Submit button (runs against all test cases)
  - [ ] Results panel (verdict, runtime, memory, per-test-case results)

### 3.4 Code Execution Integration

- [ ] Evaluate Judge0 Cloud vs self-hosted — make deployment decision
- [ ] Create `submitCode` Cloud Function
  - [ ] Validate input (Zod)
  - [ ] Verify auth and rate limits
  - [ ] Load problem and private test cases (Admin SDK)
  - [ ] Call Judge0 API for each test case (or batch)
  - [ ] Compare outputs, compute verdict
  - [ ] Write submission document to Firestore
  - [ ] Return result to client
- [ ] Handle execution errors gracefully (timeouts, compilation errors)
- [ ] Configure Judge0 credentials in Cloud Functions secrets

### 3.5 Submissions History

- [ ] Build Submissions page (`/codelab/submissions`)
  - [ ] List user's submissions with filters (problem, verdict, language)
  - [ ] Submission detail view (code, results, timing)
- [ ] Update user stats via Firestore trigger on new submission

### 3.6 Skill Tracking

- [ ] Create `onSubmissionCreate` Firestore trigger
  - [ ] Update `skillRecords` for the relevant topic
  - [ ] Update user `stats` (total submissions, accepted, streak)
- [ ] Display skill records on dashboard and profile

### Phase 3 Exit Criteria

- [ ] At least 10 seed problems across 3 topics
- [ ] Student can browse, filter, and select a problem
- [ ] Student can write code in Monaco Editor and submit
- [ ] Submission executes against public and private test cases via Judge0
- [ ] Verdict (accepted/wrong answer/TLE/etc.) displays correctly
- [ ] Submission history is viewable
- [ ] Skill records update after each submission

---

## Phase 4 — InterviewAI Module ✅

**Status: COMPLETE**

**Goal:** Students can configure, participate in structured text-based AI-assisted mock interviews, and receive comprehensive rubric-based evaluation reports with direct CodeLab practice loops.

### 4.1 AI Provider Integration
- [x] Abstracted provider interface (`IAIProvider`) in Cloud Functions
- [x] Gemini Provider (`GeminiAdapter`) with Genkit & Google Generative AI integration
- [x] Deterministic Mock AI Provider (`MockAIAdapter`) baseline for development and test execution
- [x] Strict Zod and TypeScript schema validation for all questions and evaluation scorecards
- [x] Server-side secret management (`GOOGLE_GENAI_API_KEY`) via Cloud Secret Manager
- [x] Zero client exposure of AI credentials or raw prompt engineering

### 4.2 Interview Categories & Question Bank
- [x] 5 supported categories: Technical, Programming, SQL, HR, Behavioral
- [x] 5-level difficulty alignment (Absolute Beginner, Beginner, Intermediate, Advanced, Expert)
- [x] Structured question templates with topic, scenario, and rubric criteria
- [x] Deterministic, verified question generation (`generateQuestionList`)

### 4.3 Interview Setup & Navigation
- [x] Interview overview (`/interview`) with verified real session history & metrics
- [x] Interview setup (`/interview/setup`) with category, target role, difficulty, duration, and question count
- [x] Session launcher with parameter validation and automatic routing

### 4.4 Active Interview Session
- [x] Interview session route (`/interview/session/:id`)
- [x] Sequential question progression with progress bar & advisory timer
- [x] Real-time draft buffer (`localStorage`) protecting against accidental reloads or disconnects
- [x] Substantive answer length validation (5 to 8,000 characters)
- [x] Evaluating state transition screen

### 4.5 Evaluation Reports & CodeLab Feedback Loop
- [x] Final scorecard route (`/interview/report/:id`)
- [x] Overall score (0-100) and PerformanceTier classification (Exceptional, Strong, Developing, Needs Practice)
- [x] Multi-criterion breakdown bars with actionable rationale
- [x] Per-question review with candidate answer, evaluator feedback, and model exemplars
- [x] Unified Next Steps linking observed gaps to real practice problems in Nexora CodeLab
- [x] AI transparency disclaimer

### Phase 4 Exit Criteria
- [x] All 5 interview categories supported with 5-tier difficulty
- [x] Student can configure, run, and complete interview sessions
- [x] Session lifecycle state machine fully validated
- [x] Real interview history rendered with zero fabricated metrics
- [x] 61 automated unit and integration tests passing cleanly
- [ ] Reports are stored and viewable at `/interview/report/:id`
- [ ] AI responses are validated against schemas
- [ ] API key is server-side only

---

## Phase 5 — Nexora Unified Skill Intelligence, Analytics & Adaptive Learning (COMPLETED)

**Goal:** Unified cross-module analytics engine, transparent skill taxonomy, deterministic recommendations, and verified milestone tracking.

### 5.1 Unified Dashboard (`/dashboard`)
- [x] Implemented Learning Overview with actual verified metrics (problems accepted, interviews completed, average score)
- [x] Unified Skill Map with 4 categories and accessible confidence state badges
- [x] CodeLab Progress module card showing verified problem distribution and pass rate
- [x] InterviewAI Progress module card showing completed sessions and rubric scores
- [x] Unified Chronological Activity Feed combining CodeLab submissions and Interview sessions
- [x] Explainable Recommended Next Steps with direct action links and grounded reasons
- [x] Safe empty states explaining what data is missing with gentle diagnostic on-ramps

### 5.2 Unified Skill Taxonomy & Mapping
- [x] 17 canonical skills across Programming Fundamentals, Languages, Databases & SQL, and Interview Skills
- [x] Explicit deterministic mapping functions (`getSkillsForProblem`, `getSkillsForInterview`)
- [x] Separation of objective execution evidence from subjective AI evaluation scores
- [x] 4-tier confidence state machine (`not_assessed`, `starting_out`, `developing`, `demonstrated_consistently`)

### 5.3 Adaptive Recommendation & Difficulty Engine
- [x] Deterministic heuristic decision matrix based on verified evidence
- [x] Prerequisite gating and avoidance of knee-jerk demotions
- [x] Topic-specific difficulty recommendations across 5 standard levels
- [x] Strict user sovereignty preserving voluntary difficulty selection

### 5.4 Structured Learning Paths & Milestones (`/learning-paths`)
- [x] 6 published starter curricula (Programming Foundations, Python Foundations, JavaScript Foundations, DSA Mastery, SQL & Relational Schema, Technical Interview Prep)
- [x] Milestone completion derived strictly from verified submissions and scorecards
- [x] Direct action triggers ("Start Problem", "Start Interview") for each curriculum milestone

### 5.5 Security & Data Integrity
- [x] Firestore security rules protecting `student_analytics/{userId}` from client tampering
- [x] Zero fabricated progress, mock exclusion from mastery records
- [x] Multi-tier caching (15-min TTL) and bounded queries (max 100 historical submissions)

### Phase 5 Exit Criteria
- [x] Dashboard shows unified cross-module data with zero mock leakage
- [x] All 6 starter learning paths functional with real milestone completion
- [x] 71 automated tests passing across the test suite
- [x] TypeScript compilation and production build passing with 0 errors


---

## Phase 6 — Production Readiness, Security Hardening & Launch Preparation (AUDITED & READY FOR STAGING)

**Goal:** Production readiness audit, security hardening, bundle optimization, comprehensive test suites, and staging launch preparation.

### 6.1 Testing & Verification
- [x] 79 automated unit and integration tests passing cleanly across 9 test suites
- [x] Security regression tests covering 64KB boundary limits, language validation, and UNCONFIGURED production sandbox guards
- [x] Private test case redaction verified (cheating prevention)
- [x] InterviewAI input validation and session duration clamping verified
- [x] Cloud Functions backend compiled with 0 TypeScript errors

### 6.2 Security Hardening
- [x] ErrorBoundary hardened to redact raw internal error messages in production builds
- [x] Zero hardcoded privileged secrets verified across `src/` and `functions/src/`
- [x] Firestore Security Rules hardened to deny client write operations on submissions, reports, and analytics
- [x] User daily session quotas (15/day) and hourly execution rate limits (30/hour) enforced in Cloud Functions brokers
- [x] Production UNCONFIGURED guard: Prevents simulating execution passes in live production if upstream sandboxes are missing

### 6.3 Performance & Optimization
- [x] Bundle size optimized via manualChunks in `vite.config.ts`; monolith partitioned into vendor chunks with 0 warnings
- [x] Multi-tier 15-minute client caching for derived skill analytics
- [x] Cloud Functions container concurrency capped at `maxInstances: 10`

### 6.4 Operational Documentation Deliverables
- [x] `docs/PRODUCTION_READINESS_AUDIT.md` (18 operational areas audited)
- [x] `docs/TESTING_STRATEGY.md` (Test pyramid, 9 suites, 12 E2E flows)
- [x] `docs/PERFORMANCE_AND_RELIABILITY.md` (Bundle measurements and query optimization)
- [x] `docs/MONITORING_AND_INCIDENT_RESPONSE.md` (Logging standard, severity levels, triage runbook)
- [x] `docs/BACKUP_AND_RECOVERY.md` (PITR, daily exports, RPO/RTO targets, rollback)
- [x] `docs/COST_CONTROL_PLAN.md` (Primary cost drivers, per-user quotas, budget alerts)
- [x] `docs/DEPLOYMENT_PLAN.md` (3-environment separation, staging deployment, post-deploy smoke tests)
- [x] `docs/RELEASE_CHECKLIST.md` (18 release gates tracked)

### 6.5 Remaining Pre-Launch Requirements (Pending Explicit Approval)
- [ ] Cloud Armor & External HTTPS Load Balancer provisioning
- [ ] Production reCAPTCHA Enterprise registration for App Check enforcement
- [ ] Production Judge0 and Google AI Studio API key provisioning in Cloud Functions Secret Manager
- [ ] Final DNS cutover to production custom domain (Awaiting explicit authorization)

---

## Risk Register

| # | Risk | Severity | Likelihood | Mitigation |
|---|---|---|---|---|
| 1 | Judge0 Cloud pricing becomes prohibitive at scale | High | Medium | Evaluate self-hosting early; implement aggressive rate limiting |
| 2 | AI provider costs exceed budget | High | Medium | Per-user daily limits; token budget per session; caching common patterns |
| 3 | AI generates incorrect or harmful content | Medium | Medium | Schema validation; content filtering; explicit disclaimers |
| 4 | Firestore read costs spike from inefficient queries | Medium | Medium | Denormalize early; minimize `get()` in Security Rules; monitor billing |
| 5 | Monaco Editor bundle size impacts load time | Low | High | Lazy load Monaco; code-split the editor route |
| 6 | Firebase Hosting limitations with Vite/SPA | Low | Low | Fallback to Vercel/Cloudflare Pages if needed |
| 7 | Rate limiting insufficient for determined abuse | Medium | Low | Layer limits: App Check + Functions rate limits + Firestore Rules |
| 8 | Prompt injection in AI interviews | Medium | Medium | System prompt isolation; input sanitization; output validation |

---

## Unresolved Decisions

These decisions are explicitly deferred and must be resolved before or during the specified phase:

| # | Decision | Resolve By | Owner |
|---|---|---|---|
| 1 | AI model provider selection (Gemini vs OpenAI) | Phase 4 start | Team |
| 2 | Judge0 deployment model (Cloud vs self-hosted) | Phase 3 start | Team |
| 3 | Firebase project name and region | Phase 2 start | Team |
| 4 | Production domain name (.com) | Phase 6 | Business |
| 5 | Social auth providers (Google, GitHub) | Phase 2 | Team |
| 6 | Staging environment strategy (separate project vs isolation) | Phase 2 | Team |
| 7 | Firestore region selection | Phase 2 start | Team |
| 8 | Full-text search solution (if needed) | Phase 5 | Team |
| 9 | Mobile app consideration (PWA vs native) | Post Phase 6 | Business |
| 10 | Pricing model (free tier vs paid plans) | Post Phase 6 | Business |

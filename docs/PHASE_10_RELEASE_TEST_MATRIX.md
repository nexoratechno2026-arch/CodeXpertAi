# Phase 10: Release Test Matrix & Verification Journeys

**Document Version**: 1.0.0  
**Test Harness**: Vitest 2.1.9, TypeScript 5.6.3, React 18, Firebase Web SDK  
**Test Suites**: 12 test suites, 136 automated test cases  

---

## Section A: Authentication & Account Security

| Test ID | Test Case & Objective | Prerequisites | Test Execution Steps | Expected Result | Actual Result | Status | Severity | Evidence Location |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| **AUTH-01** | Student registration with valid email & password | Unauthenticated session | 1. Enter email, password, full name.<br>2. Submit registration form. | Account created; profile initialized as `role: 'student'`; redirected to dashboard. | Account created and user authenticated. | **PASS** | Critical | `src/test/authService.test.ts` |
| **AUTH-02** | Registration with malformed email or short password | Unauthenticated session | 1. Enter invalid email.<br>2. Enter 4-character password. | Validation rejects submission before hitting Firebase; helpful error shown. | Rejection occurs with specific validation message. | **PASS** | High | `src/test/validation.test.ts` |
| **AUTH-03** | Unauthorized access to protected routes | No active auth session | 1. Navigate to `/dashboard` directly.<br>2. Navigate to `/codelab/workspace/prob-two-sum`. | Redirects immediately to `/login` preserving intended redirect target in state. | Clean redirect to `/login` with target preserved. | **PASS** | Critical | `src/test/routeGuards.test.tsx` |
| **AUTH-04** | Role guard: Student attempting admin route access | Authenticated as student | 1. Navigate to `/admin`. | Access denied; redirected with permission notice. | Redirected to unauthorized notice. | **PASS** | High | `src/test/routeGuards.test.tsx` |
| **AUTH-05** | Account data isolation between students | Two accounts (A and B) | 1. Student A queries submissions of Student B. | Firestore security rule rejects request (`isOwner` fails). | Rejected by Firestore security rules. | **PASS** | Critical | `firestore.rules:L94` |
| **AUTH-06** | Student self-privilege escalation prevention | Authenticated as student | 1. Student sends profile update with `role: 'admin'`. | Firestore rule blocks write (`affectedKeys().hasAny(['role'])`). | Update denied by rules. | **PASS** | Critical | `firestore.rules:L36-L38` |

---

## Section B: Nexora CodeLab

| Test ID | Test Case & Objective | Prerequisites | Test Execution Steps | Expected Result | Actual Result | Status | Severity | Evidence Location |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| **CODE-01** | Browse problem catalog & filter by difficulty/topic | Authenticated student | 1. Navigate to `/codelab/problems`.<br>2. Filter by `beginner` and `arrays`. | Problem list updates immediately; only matching published problems render. | Filters correctly display matching problems. | **PASS** | Medium | `src/test/codelabService.test.ts` |
| **CODE-02** | Code execution payload size limit (> 64 KB) | Problem workspace open | 1. Paste code payload exceeding 64 KB.<br>2. Click Run. | Client rejects payload with clear byte size limit error. | Validated and rejected with 64KB message. | **PASS** | High | `src/test/executionService.test.ts` |
| **CODE-03** | Redaction of hidden/private test cases in results | Submitting solution | 1. Submit solution with private test cases.<br>2. Inspect network execution response. | Private test case inputs and outputs are strictly omitted from client response. | Private test case details redacted. | **PASS** | Critical | `src/test/executionService.test.ts` |
| **CODE-04** | Compilation error handling & display | Problem workspace open | 1. Introduce syntax error in code.<br>2. Click Run. | Compiler error shown with line number in results panel without application crash. | Handled with syntax error verdict. | **PASS** | Medium | `src/test/codelabService.test.ts` |
| **CODE-05** | Submission ledger persistence across reloads | Valid submission completed | 1. Submit code.<br>2. Refresh browser and check history tab. | Submission appears in persistent history with timestamp, verdict, runtime, and memory. | History restored from Firestore/localStorage. | **PASS** | High | `src/test/codelabService.test.ts` |

---

## Section C: Nexora InterviewAI

| Test ID | Test Case & Objective | Prerequisites | Test Execution Steps | Expected Result | Actual Result | Status | Severity | Evidence Location |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| **INT-01** | Interview configuration setup validation | Authenticated student | 1. Select category, target role, difficulty, time.<br>2. Submit configuration. | Configuration validated; question pool allocated matching role and category. | Setup validated and initialized. | **PASS** | High | `src/test/interviewService.test.ts` |
| **INT-02** | Interview answer draft recovery across refresh | Active interview session | 1. Type answer in question 1.<br>2. Refresh browser without submitting. | Draft answer restored seamlessly in textarea. | Draft recovered from local state. | **PASS** | High | `src/test/interviewService.test.ts` |
| **INT-03** | Structured scorecard & rubric generation | Completed interview | 1. Submit all required answers.<br>2. Generate final report. | Report generated with category criteria scores, strengths, and CodeLab next steps. | Scorecard compiled with rubric scores. | **PASS** | Critical | `src/test/interviewService.test.ts` |
| **INT-04** | AI Scoring Transparency notice display | Report page open | 1. View completed report page. | Clear notice displayed: AI-generated assessment, not an official hiring decision. | Disclaimer rendered prominently. | **PASS** | High | `src/features/interview/InterviewReportPage.tsx` |
| **INT-05** | Interview report privacy isolation | Two student accounts | 1. User A tries to open `/interview/report/{id}` of User B. | Session access denied; redirects with error. | Protected by Firestore session rules. | **PASS** | Critical | `firestore.rules:L125` |

---

## Section D: Dashboard & Learning Intelligence

| Test ID | Test Case & Objective | Prerequisites | Test Execution Steps | Expected Result | Actual Result | Status | Severity | Evidence Location |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| **DASH-01** | Metric consistency with authentic activity | Authenticated student | 1. View Problems Solved and Interviews Taken on dashboard. | Displayed numbers match exact count of accepted submissions and completed sessions. | Verified counts match database records. | **PASS** | High | `src/test/phase7StudentExperience.test.ts` |
| **DASH-02** | First-time user onboarding prompt | Brand new account | 1. Log in with new account (0 submissions). | Clear starter card prompting to solve first problem or mock interview without broken UI. | Quick-start prompt displayed. | **PASS** | Medium | `src/test/phase7StudentExperience.test.ts` |
| **DASH-03** | Bayesian skill mastery calibration | Submissions recorded | 1. Evaluate student skills across 6 categories. | Categories with evidence calibrated; empty categories honest (0% proficiency). | Skill scores derived directly from evidence. | **PASS** | High | `src/test/phase8LearningCoach.test.ts` |
| **DASH-04** | Adaptive recommendations mapping | Gaps identified | 1. Query recommendations for Software Engineer role. | Returns real CodeLab problems matching identified weak areas. | Concrete problem recommendations generated. | **PASS** | High | `src/test/phase8LearningCoach.test.ts` |
| **DASH-05** | Personalized study plan task tracking | Active study plan | 1. Complete CodeLab problem assigned in study plan. | Task marked completed automatically with progress percentage incremented. | Progress updated and recomputed. | **PASS** | High | `src/test/phase8LearningCoach.test.ts` |

---

## Section E: Gamification & Engagement

| Test ID | Test Case & Objective | Prerequisites | Test Execution Steps | Expected Result | Actual Result | Status | Severity | Evidence Location |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| **GAME-01** | Daily challenge stability across students | Same UTC date | 1. Call `getDailyChallenge()` on Date X from two sessions. | Both receive identical problem ID and period key. | Deterministic matching problem assigned. | **PASS** | High | `src/test/phase9GamificationAndSimulator.test.ts` |
| **GAME-02** | Acceptance-only challenge completion | Active challenge | 1. Submit failed code (`wrong_answer`).<br>2. Submit accepted code (`accepted`). | Failed code does not complete challenge; accepted code completes and records personal best. | Completion verified only on acceptance. | **PASS** | Critical | `src/test/phase9GamificationAndSimulator.test.ts` |
| **GAME-03** | XP transaction ledger deduplication | Authenticated student | 1. Solve same problem 5 times. | First solve awards +50 XP; remaining 4 attempts award 0 XP. Ledger has 1 transaction. | Deduplicated via reference ID. | **PASS** | Critical | `src/test/phase9GamificationAndSimulator.test.ts` |
| **GAME-04** | UTC streak consistency calculation | Submissions logged | 1. Submissions on Day 1, 2, 3 (UTC).<br>2. Skip Day 4.<br>3. Submit on Day 5. | Streak increments to 3, resets to 1 on Day 5. Longest streak preserved as 3. | Streak matches UTC calendar rules. | **PASS** | High | `src/test/phase9GamificationAndSimulator.test.ts` |
| **GAME-05** | Leaderboard privacy opt-out | Opt-out enabled | 1. View leaderboard with `optOutOfLeaderboards: true`. | User display name replaced by `Anonymous Candidate`. | Pseudonym rendered properly. | **PASS** | High | `src/test/phase9GamificationAndSimulator.test.ts` |

---

## Section F: Advanced Simulator & Voice Mode

| Test ID | Test Case & Objective | Prerequisites | Test Execution Steps | Expected Result | Actual Result | Status | Severity | Evidence Location |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| **SIM-01** | Simulator server deadline enforcement | Active simulation | 1. Start simulation with 20m duration.<br>2. Refresh browser.<br>3. Verify deadline. | Deadline continues counting down; state restored from local storage. | Server timestamp countdown enforced. | **PASS** | High | `src/test/phase9GamificationAndSimulator.test.ts` |
| **SIM-02** | Contextual follow-up question generation | Submitting answer | 1. Submit technical answer mentioning scalability. | Engine dynamically generates follow-up probe testing edge-case latency. | Contextual follow-up question generated. | **PASS** | Medium | `src/test/phase9GamificationAndSimulator.test.ts` |
| **SIM-03** | Web Speech API speech-to-text dictation | Supported browser | 1. Click Start Dictation.<br>2. Speak answer. | Live transcript appears in review box; candidate can edit before submission. | Audio streams converted to editable text. | **PASS** | Medium | `src/components/interview/VoiceAnswerInput.tsx` |
| **SIM-04** | Voice fallback when unsupported or denied | Unsupported client | 1. Web Speech API unavailable in browser. | Degrades automatically to standard textarea with zero console errors. | Standard text input rendered cleanly. | **PASS** | High | `src/components/interview/VoiceAnswerInput.tsx` |

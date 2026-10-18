# Phase 10: User Acceptance Testing (UAT) Plan & Execution Protocols

**Product**: Nexora CodeLab + Nexora InterviewAI  
**Test Cohort Target**: 5–10 Pilot Engineering Students (Staging Environment)  
**Objective**: Validate real-world student usability, workflow intuitiveness, clarity of feedback, and system resilience.

---

## 1. Pilot Testing Guardrails

1. **Pre-Release Environment**: Testers will operate exclusively on the dedicated Firebase Hosting Preview Channel or local staging environment.
2. **Synthetic Data**: Testers will create dedicated pilot accounts (e.g. `tester+01@example.com`); no personal credentials will be required.
3. **No Fabricated Data**: This document establishes the standardized testing protocol. Actual tester names, qualitative feedback, and final sign-offs must be recorded by the release manager during the live UAT sessions, not generated prematurely.

---

## 2. Standardized UAT Test Scenarios

### Scenario 1: New Student First-Time Registration & Onboarding
- **Objective**: Verify that a first-time candidate can create an account, specify their target engineering role, and understand their initial zero-state dashboard.
- **Prerequisites**: Access to staging URL; unauthenticated browser session.
- **Step-by-Step Instructions**:
  1. Open the application landing page.
  2. Click "Get Started" or "Sign Up".
  3. Enter email, secure password, and display name.
  4. Select target role (e.g., "Full Stack Engineer") and preferred language.
  5. Submit registration and land on `/dashboard`.
- **Expected Result**: Account is created; user is redirected to dashboard; starter prompt recommends solving the first problem or diagnostic mock interview; 0 problems solved shown cleanly without NaN/errors.
- **Actual Result**: *(To be populated by tester during UAT)*
- **Status**: [ ] PENDING / [ ] PASS / [ ] FAIL
- **Tester Feedback**: *(Record verbatim)*
- **Defects Discovered**: *(Record Defect IDs if any)*

---

### Scenario 2: Solving an Algorithmic CodeLab Problem
- **Objective**: Verify problem browsing, code editor interactions, test case execution, and submission verification.
- **Prerequisites**: Authenticated student session.
- **Step-by-Step Instructions**:
  1. Navigate to `/codelab/problems`.
  2. Filter by "Beginner" and select "Two Sum".
  3. Inspect problem description, constraints, and public examples.
  4. Write solution code in Monaco editor.
  5. Click "Run Code" to verify against sample cases.
  6. Click "Submit" to execute against the full evaluation suite.
- **Expected Result**: Sample tests show pass/fail instantly; submit operation triggers full verification; on 100% pass rate, verdict is "Accepted"; +50 XP awarded; achievement unlocked notification appears.
- **Actual Result**: *(To be populated by tester during UAT)*
- **Status**: [ ] PENDING / [ ] PASS / [ ] FAIL
- **Tester Feedback**: *(Record verbatim)*
- **Defects Discovered**: *(Record Defect IDs if any)*

---

### Scenario 3: Reviewing Submission History & Personal Bests
- **Objective**: Verify that students can inspect their historical attempts, runtime metrics, and code revisions.
- **Prerequisites**: At least one previous submission completed.
- **Step-by-Step Instructions**:
  1. In the CodeLab workspace, open the "Submissions" tab.
  2. Click on the latest submission item.
  3. Inspect the code snippet, verdict, runtime latency (`ms`), and memory footprint (`KB`).
- **Expected Result**: Submission details expand cleanly; submitted code is read-only; runtime and memory metrics reflect actual execution results.
- **Actual Result**: *(To be populated by tester during UAT)*
- **Status**: [ ] PENDING / [ ] PASS / [ ] FAIL
- **Tester Feedback**: *(Record verbatim)*
- **Defects Discovered**: *(Record Defect IDs if any)*

---

### Scenario 4: Starting & Completing a Multi-Turn Mock Interview
- **Objective**: Verify category selection, interview question flow, answer input, and timer countdown.
- **Prerequisites**: Authenticated student session.
- **Step-by-Step Instructions**:
  1. Navigate to `/interview/setup`.
  2. Select "Technical & CS Core", 3 questions, 15 minutes.
  3. Click "Start Mock Interview".
  4. Answer Question 1 using typed text.
  5. Submit answer and observe progression to Question 2.
  6. Complete remaining questions and click "Finish & Generate Report".
- **Expected Result**: Timer counts down monotonically; answers persist across page reloads; question index advances smoothly; finalizing session triggers report compilation.
- **Actual Result**: *(To be populated by tester during UAT)*
- **Status**: [ ] PENDING / [ ] PASS / [ ] FAIL
- **Tester Feedback**: *(Record verbatim)*
- **Defects Discovered**: *(Record Defect IDs if any)*

---

### Scenario 5: Viewing Feedback, Rubrics & Scorecard Reports
- **Objective**: Verify that the generated interview scorecard is understandable, actionable, and transparent.
- **Prerequisites**: Completed interview session from Scenario 4.
- **Step-by-Step Instructions**:
  1. View the completed report at `/interview/report/{id}`.
  2. Inspect the overall score (0–100), performance tier, and category criteria breakdown.
  3. Review highlighted strengths and critical improvements.
  4. Check the "Practice in CodeLab" recommended next steps.
  5. Check the AI Scoring Transparency notice at the bottom.
- **Expected Result**: Scorecard renders cleanly; scores reflect substantive answer quality; actionable next steps link directly to CodeLab; transparency notice is clearly visible.
- **Actual Result**: *(To be populated by tester during UAT)*
- **Status**: [ ] PENDING / [ ] PASS / [ ] FAIL
- **Tester Feedback**: *(Record verbatim)*
- **Defects Discovered**: *(Record Defect IDs if any)*

---

### Scenario 6: Reviewing Adaptive Recommendations & Study Plans
- **Objective**: Verify that CodeLab and InterviewAI activity informs personalized learning recommendations.
- **Prerequisites**: At least one submission and one completed interview.
- **Step-by-Step Instructions**:
  1. Return to `/dashboard`.
  2. Review the "Adaptive Recommendations" section.
  3. Review the "Active Study Plan" card and week tasks.
  4. Click "Solve" on an adaptive recommendation item.
- **Expected Result**: Recommendation targets identified skill weaknesses; clicking opens the corresponding problem in CodeLab; study plan progress reflects completed milestones.
- **Actual Result**: *(To be populated by tester during UAT)*
- **Status**: [ ] PENDING / [ ] PASS / [ ] FAIL
- **Tester Feedback**: *(Record verbatim)*
- **Defects Discovered**: *(Record Defect IDs if any)*

---

### Scenario 7: Returning Student Continuing Previous Work
- **Objective**: Verify session resumption, streak calculation, and persistent state across login sessions.
- **Prerequisites**: Student account with prior activity logged on previous day.
- **Step-by-Step Instructions**:
  1. Log out from `/profile`.
  2. Close and re-open browser.
  3. Log back in with registered credentials.
  4. Inspect Day Streak, Problem Solved counts, and XP Level banner.
- **Expected Result**: Streak shows continuity based on UTC calendar rules; XP and unlocked achievements are preserved; recent activity feed displays past accomplishments.
- **Actual Result**: *(To be populated by tester during UAT)*
- **Status**: [ ] PENDING / [ ] PASS / [ ] FAIL
- **Tester Feedback**: *(Record verbatim)*
- **Defects Discovered**: *(Record Defect IDs if any)*

---

### Scenario 8: Provider Failure & Network Interruption Resilience
- **Objective**: Verify user experience during network disconnection or provider timeouts.
- **Prerequisites**: Active session.
- **Step-by-Step Instructions**:
  1. Open problem editor or interview session.
  2. Simulate offline network (DevTools Network -> Offline).
  3. Attempt to submit code or answer.
  4. Re-enable network.
- **Expected Result**: System displays an informative error card without crashing or wiping student input; student can retry upon network restoration without loss of work.
- **Actual Result**: *(To be populated by tester during UAT)*
- **Status**: [ ] PENDING / [ ] PASS / [ ] FAIL
- **Tester Feedback**: *(Record verbatim)*
- **Defects Discovered**: *(Record Defect IDs if any)*

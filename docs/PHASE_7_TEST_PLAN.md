# Phase 7 — Verification & Test Plan

## 1. Test Objectives
Ensure that all Phase 7 additions—Unified Dashboard, Profile & Account Settings, Submission Pagination & Filters, Printable Interview Reports, Notifications System, and Admin Operations—function reliably, securely, and preserve backward compatibility with all Phase 1–6 implementations.

## 2. Test Matrix & Automated Verification

| Category | Test Case | Target Component | Status |
| :--- | :--- | :--- | :--- |
| **Profile** | Initialize with target role & learning goals | `profileService.ts` | **PASS** (Automated) |
| **Profile** | Persist notification preferences | `profileService.ts` | **PASS** (Automated) |
| **Profile** | Enforce immutability of `role` and `stats` | `profileService.ts` | **PASS** (Automated) |
| **Notifications** | Add notification & verify idempotency | `notificationService.ts` | **PASS** (Automated) |
| **Notifications** | Read status & mark all as read | `notificationService.ts` | **PASS** (Automated) |
| **Notifications** | Individual notification dismissal | `notificationService.ts` | **PASS** (Automated) |
| **Submissions** | Filter submissions by programming language | `SubmissionsPage.tsx` | **PASS** (Automated) |
| **Submissions** | Filter submissions by verdict | `SubmissionsPage.tsx` | **PASS** (Automated) |
| **Submissions** | Calculate pagination pages accurately | `SubmissionsPage.tsx` | **PASS** (Automated) |
| **Interview** | Rubric evaluations & score calculation | `interviewService.ts` | **PASS** (Automated) |
| **Admin** | Problem catalog contains valid seed problems | `seedProblems.ts` | **PASS** (Automated) |
| **Admin** | Question bank contains categories & criteria | `interviewQuestionBank.ts` | **PASS** (Automated) |
| **Route Security**| Guard routes against unauthorized access | `routeGuards.test.tsx` | **PASS** (Automated) |
| **Execution** | Redact private test cases from student responses | `executionService.test.ts` | **PASS** (Automated) |

## 3. Manual & Visual Testing Strategy
1. **Student Dashboard (`/dashboard`)**:
   - Verify avatar with initials is rendered next to greeting.
   - Verify target role and learning goals are shown when configured.
   - Verify day streak reflects real persisted active consistency.
   - Verify "Get Started" prompt displays when user has 0 attempts.
2. **Profile Settings (`/profile`)**:
   - Edit name, role, goals, and checkboxes; click Save; confirm persistence.
   - Click "Send Password Reset Email"; verify alert banner appears.
   - Open Deletion modal; type confirmation phrase; verify button enablement.
3. **Submission History (`/codelab/submissions`)**:
   - Filter by language and verdict; verify filtered count update.
   - Navigate pagination pages.
4. **Printable Report (`/interview/report/:id`)**:
   - Click "Print / Export Report"; check print preview hides navbar/sidebar and renders clean scorecard.
5. **Admin Panel (`/admin`)**:
   - Toggle problem status between Published and Unpublished.
   - Verify audit log entry is immediately recorded.
   - Test Student Support lookup with a valid UID.

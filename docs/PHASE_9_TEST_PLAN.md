# Phase 9 Test Plan — Gamification, Challenges, Achievements & Interview Simulator

## 1. Test Architecture & Scope

This document details the automated verification strategy for Phase 9 features across CodeLab, InterviewAI, and the unified student experience.

### Test Matrix
- **Test Runner**: Vitest 2.1.9 with `@testing-library/react` and jsdom.
- **Test Suite**: `src/test/phase9GamificationAndSimulator.test.ts`
- **Total Test Scenarios**: 26 automated unit and integration tests.
- **Pass Rate Requirement**: 100% (26 / 26 passing, zero regressions in existing suites).

---

## 2. Test Scenarios & Verification Matrix

| # | Test Scenario | Module | Acceptance Criteria |
| :-: | :--- | :--- | :--- |
| **1** | Daily Challenge Stability | `challengeService` | Deterministic UTC-day mapping; same challenge for all users on same date. |
| **2** | Daily Challenge Rotation | `challengeService` | Challenge changes cleanly across consecutive UTC dates. |
| **3** | Weekly Challenge Stability | `challengeService` | Same challenge returned across days in identical ISO calendar week. |
| **4** | Challenge Completion Rules | `challengeService` | Only `verdict === 'accepted'` submissions complete the challenge. |
| **5** | Personal Bests Tracking | `challengeService` | Tracks and updates minimum runtime (`ms`) and memory (`KB`). |
| **6** | Challenge Local Persistence | `challengeService` | Stores and retrieves completed challenge IDs from localStorage. |
| **7** | Quadratic Level Calculation | `gamificationService` | Calculates level, XP progress, and honor titles accurately. |
| **8** | XP Ledger Idempotency | `gamificationService` | Solving same problem twice awards XP exactly once. |
| **9** | First Solve Achievement | `gamificationService` | Unlocks `first_accepted` badge upon first verified accepted solution. |
| **10** | Interview Achievement | `gamificationService` | Unlocks `interview_first` badge upon completing a mock interview. |
| **11** | Locked Badge Progress | `gamificationService` | Calculates partial progress (e.g., 2 / 5) for locked achievements. |
| **12** | Consecutive UTC Days Streak | `streakService` | Streak increments on consecutive UTC calendar days. |
| **13** | Same-Day Multiple Submissions | `streakService` | Multiple submissions on one day count as 1 streak day. |
| **14** | Broken Streak Recovery | `streakService` | Resets current streak to 1 when a calendar day is skipped. |
| **15** | Leaderboard Tie-Breaking | `leaderboardService` | Ranks descending by XP, challenges, streak, and timestamp. |
| **16** | Leaderboard Privacy Opt-Out | `leaderboardService` | Displays `Anonymous Candidate` when student opts out. |
| **17** | Simulator Session Creation | `simulatorService` | Initializes session with questions and server-verified deadline. |
| **18** | Follow-Up Question Generation | `simulatorService` | Generates dynamic technical follow-up questions for deep answers. |
| **19** | Simulator Multi-Question Flow | `simulatorService` | Advances question index through all configured interview questions. |
| **20** | Simulator Scorecard | `simulatorService` | Generates final scorecard with strengths and recommendations. |
| **21** | Simulator Local Persistence | `simulatorService` | Preserves in-progress simulation across browser reloads. |
| **22** | Simulator Summary Analytics | `simulatorService` | Completed sessions integrate with interview analytics history. |
| **23** | Study Task XP Awards | `gamificationService` | Completed study plan tasks award 25 XP each idempotently. |
| **24** | Daily Challenge Bonus XP | `gamificationService` | Completed daily challenge awards +100 bonus XP. |
| **25** | Streak Milestone Bonus XP | `gamificationService` | 7-day streak milestone awards +100 bonus XP. |
| **26** | Gamification State Storage | `gamificationService` | Serializes and restores complete gamification state locally. |

---

## 3. Regression Testing Results

All 12 repository test files passed cleanly:
- `validation.test.ts` (13 tests)
- `profileService.test.ts` (3 tests)
- `productionReadiness.test.ts` (8 tests)
- `phase7StudentExperience.test.ts` (11 tests)
- `codelabService.test.ts` (8 tests)
- `interviewService.test.ts` (21 tests)
- `analyticsService.test.ts` (10 tests)
- `executionService.test.ts` (7 tests)
- `phase8LearningCoach.test.ts` (20 tests)
- `phase9GamificationAndSimulator.test.ts` (26 tests)
- `authService.test.ts` (4 tests)
- `routeGuards.test.tsx` (5 tests)

**Total**: 136 tests passing, 0 failing.

# Nexora Verified Achievements & Badges System

## 1. Design Overview

Achievements in Nexora represent verifiable milestones earned through genuine platform engagement.
Unlike superficial badges that unlock on button clicks or page navigation, every badge in Nexora requires **auditable backend activity**:
- Passing unit test suites with compiler execution.
- Completing multi-turn technical interview simulations.
- Maintaining continuous daily study habits over multiple calendar weeks.

---

## 2. Verified Badges Catalog

The Phase 9 system ships with 10 unlockable achievement badges spanning four categories:
1. `coding` (Algorithmic mastery and problem completion)
2. `interview` (Interview readiness, depth, and communication)
3. `consistency` (Streak longevity and daily habits)
4. `mastery` (Holistic platform progress and study plan execution)

| Badge ID | Badge Title | Category | Target Threshold | XP Reward | Evidence Criterion |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `first_accepted` | **First Accepted Solution** | `coding` | 1 problem | `+50 XP` | First verified `accepted` submission in CodeLab. |
| `problems_5` | **Algorithm Apprentice** | `coding` | 5 problems | `+150 XP` | 5 unique problem IDs solved with all tests passed. |
| `problems_10` | **Problem Solving Pro** | `coding` | 10 problems | `+300 XP` | 10 unique problem IDs solved. |
| `daily_first` | **Daily Dedication** | `consistency` | 1 challenge | `+100 XP` | First accepted solution for a designated Daily Challenge. |
| `weekly_first` | **Weekly Warrior** | `consistency` | 1 challenge | `+250 XP` | Accepted solution for a designated Weekly Challenge. |
| `interview_first` | **Candidate In The Arena** | `interview` | 1 interview | `+100 XP` | First completed mock diagnostic interview session with scorecard. |
| `interview_3` | **Mock Interview Veteran** | `interview` | 3 interviews | `+200 XP` | 3 full mock interviews completed across any categories. |
| `streak_3` | **Consistent Habit** | `consistency` | 3 days | `+75 XP` | 3 consecutive UTC calendar days with qualifying activity. |
| `streak_7` | **Relentless Focus** | `consistency` | 7 days | `+200 XP` | 7 consecutive UTC calendar days with qualifying activity. |
| `study_plan_starter` | **Structured Scholar** | `mastery` | 3 tasks | `+100 XP` | Complete 3 verified daily tasks in an active study plan. |

---

## 3. Evaluation & Idempotency Engine

1. **State Evaluation**: Whenever student analytics are queried, `computeGamificationState(...)` evaluates every badge rule against the student's authentic submissions, completed interviews, and study tasks.
2. **Deterministic Progress**: For locked badges, `progress` and `maxProgress` (e.g., `2 / 5 problems solved`) are computed accurately and rendered with real-time visual progress bars.
3. **Idempotent Rewards**: When a badge unlocks, its one-time bonus XP transaction is added to the ledger with reference ID `badge_${badgeId}`. If already unlocked, no additional XP is granted.
4. **Offline Resilience & Cache**: Evaluated achievements are cached in `localStorage` under `nexora_gamification_state_${userId}` and synchronized with Firestore when online.

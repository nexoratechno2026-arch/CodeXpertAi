# Nexora CodeLab — Daily & Weekly Coding Challenges

## 1. Overview & Purpose

Daily and Weekly Coding Challenges introduce structured, continuous practice for candidates preparing for top-tier software engineering roles.
Rather than presenting arbitrary or synthetic problems, challenges in Nexora map deterministically to verified problems in the curated problem bank (`SEED_PROBLEMS`).

Challenges provide:
- **Daily Calibration**: Consistent algorithmic problem solving with focused UTC time windows.
- **Weekly Deep Dives**: Multi-concept or optimization-heavy problems incentivizing comprehensive testing.
- **Competitive Metrics**: Personal best tracking for runtime latency (`ms`) and memory footprint (`KB`).
- **Integrity Enforcement**: Bonus XP is granted only upon verified compiler acceptance (`verdict === 'accepted'`) with 100% test case pass rate.

---

## 2. Deterministic Rotation Engine

To ensure fairness across global candidates without requiring complex scheduling cron jobs or central database seeds, challenges rotate using a deterministic cryptographic hash of the UTC calendar period.

### Daily Rotation
- **Period Key**: `YYYY-MM-DD` (UTC midnight to midnight)
- **Rotation Formula**:
  ```ts
  const hash = sha256(utcDateString);
  const problemIndex = Math.abs(hashInt) % availableProblems.length;
  ```
- **Guaranteed Consistency**: Every candidate globally sees the exact same problem on any given UTC calendar date.

### Weekly Rotation
- **Period Key**: `YYYY-Www` (ISO week date, Monday 00:00 UTC through Sunday 23:59 UTC)
- **Rotation Formula**:
  ```ts
  const hash = sha256(isoWeekString);
  const problemIndex = Math.abs(hashInt) % availableProblems.length;
  ```

---

## 3. Evaluation & Personal Best Metrics

When a student attempts a challenge:
1. All submissions are recorded in the authentic CodeLab submission ledger.
2. The challenge service checks:
   - `s.problemId === challenge.problemId`
   - `s.verdict === 'accepted'`
   - `s.submittedAt >= challenge.startDate && s.submittedAt <= challenge.endDate`
3. If criteria are met:
   - `isCompleted` is marked `true`.
   - `bestRuntimeMs = Math.min(...acceptedSubmissions.map(s => s.runtimeMs))`
   - `bestMemoryKB = Math.min(...acceptedSubmissions.map(s => s.memoryKB))`
   - Completion record is saved locally in `localStorage` and synchronized with Firestore at `/users/{userId}/challengeCompletions/{challengeId}`.

---

## 4. Anti-Tampering & Fairness Rules

- **No Points for Failures**: Unaccepted verdicts (`wrong_answer`, `time_limit_exceeded`, `runtime_error`, `compile_error`) never mark a challenge completed.
- **Strict Deduplication**: Bonus XP (100 XP daily, 250 XP weekly) is awarded exactly once per unique challenge period. Re-submitting an already-completed challenge updates personal best metrics but never awards duplicate XP.
- **UTC Clock Authority**: Client-side clock manipulation cannot artificially unlock expired challenges; periods are computed relative to standard UTC ISO calendar days.

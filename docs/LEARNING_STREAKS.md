# Nexora Learning Streaks & Consistency Engine

## 1. Overview & Objectives

Consistency is the single most predictive metric of candidate success in technical software engineering interviews.
The Nexora Streak Engine measures genuine day-to-day engagement using a transparent, UTC-standardized calendar.

---

## 2. Qualifying Activity Rules

A UTC calendar day (`YYYY-MM-DD`) is marked as **qualifying** if and only if at least one of the following events occurred within that day (00:00:00 UTC to 23:59:59 UTC):
1. **CodeLab Submission**: A submission with `verdict === 'accepted'` and `status === 'completed'`.
2. **InterviewAI Completion**: A completed interview session (`status === 'completed'`) generating an evaluation report.

### Non-Qualifying Events
To prevent cheating, the following actions **do not** qualify as daily activity:
- Simply logging into or browsing the platform.
- Attempting a problem with compile errors or failed test cases without subsequently achieving an accepted verdict.
- Viewing problem solutions or reading feedback without submitting code or answers.

---

## 3. Consecutive Day Calculation Algorithm

The calculation algorithm evaluates the candidate's authentic timeline chronologically:

1. **Unique UTC Day Deduplication**:
   All timestamps from qualifying activities are converted to UTC date strings (`YYYY-MM-DD`) and stored in a mathematical `Set`. Multiple activities on the same day condense into a single qualifying day.

2. **Current Streak Evaluation**:
   - If the student was active **today (UTC)**: Streak count is $1 + \text{consecutive preceding days}$.
   - If the student was active **yesterday (UTC)** but not yet today: The streak remains active (pending today's activity) with length equal to consecutive preceding days ending yesterday.
   - If yesterday was **missed**: Current streak is reset to `0` (or `1` if the student resumed activity today).

3. **Longest Streak Evaluation**:
   The engine iterates through all historical qualifying days sorted in ascending chronological order:
   - Tracks `runningStreak`.
   - If $\text{Day}_{n} - \text{Day}_{n-1} = 1 \text{ day}$, `runningStreak` increments by 1.
   - If $\text{Day}_{n} - \text{Day}_{n-1} > 1 \text{ day}$, `runningStreak` resets to 1.
   - `longestStreak = Math.max(longestStreak, runningStreak)`.

---

## 4. Timezone Fairness & Edge Cases

- **International Standard**: All computations use `Date.UTC()` methods. This prevents timezone manipulation where users change local laptop clock offsets to artificially revive broken streaks.
- **Grace Window**: A candidate active late in their local evening has until 23:59:59 UTC to log their qualifying activity, preventing unfair mid-session cutoffs.

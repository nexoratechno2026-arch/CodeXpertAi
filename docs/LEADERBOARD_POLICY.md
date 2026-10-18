# Nexora Leaderboard Policy, Privacy & Anti-Harassment Rules

## 1. Overview & Purpose

The Nexora Weekly Leaderboard provides healthy motivation and benchmark peer comparison for candidates practicing technical interviews and algorithmic coding.
The leaderboard is strictly designed as an academic progress indicator, never as a public shaming mechanism.

---

## 2. Privacy & Opt-Out Controls

Nexora places complete control in the hands of the individual student:

1. **Opt-Out Preference**: In account settings (`/profile`), students can enable or disable public leaderboard participation (`optOutOfLeaderboards: boolean`).
2. **Pseudonym Protection**: If a user opts out or prefers anonymity, their entry is rendered as `Anonymous Candidate` or excluded entirely from public listings.
3. **Restricted Contact**: Leaderboards do not display personal emails, phone numbers, or social media handles. Only display names and avatar initials are visible.
4. **No Direct Messaging**: To eliminate harassment, unsolicited contact, or spam, leaderboards do not provide user-to-user messaging or profile scraping endpoints.

---

## 3. Deterministic Ranking & Tie-Breaking Rules

Rankings are computed with deterministic tie-breaking logic to ensure reproducible positions:

1. **Primary Metric**: Total Weekly Experience Points (`xp`) descending.
2. **Secondary Metric**: Total Challenges Completed (`challengesCompleted`) descending.
3. **Tertiary Metric**: Active Consistency Streak (`currentStreak`) descending.
4. **Quaternary Metric**: Earliest Activity Timestamp (`updatedAt`) ascending (rewarding candidates who completed goals earlier in the week).

---

## 4. Exclusion & Moderation Policies

The following accounts are automatically filtered out from leaderboard calculations:
- Platform administrator accounts (`role === 'admin'`).
- Staff or test accounts (`role === 'staff'`).
- Accounts flagged for automated scripting, spam submissions, or test-case scraping.
- Users who have opted out in their profile privacy settings.

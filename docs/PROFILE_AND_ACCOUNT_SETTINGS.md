# Profile and Account Settings Specification

## 1. Overview
The Student Profile (`/profile`) manages individual identity, career preferences, notification configurations, and account security controls.

## 2. Profile Data Model & Immutability Rules

### 2.1 Modifiable Fields (Student Controllable)
- **Full Name** (`fullName`): Truncated and trimmed (up to 100 characters).
- **Target Role** (`targetRole`): Career focus target (e.g., "Full Stack Engineer", "Backend Developer").
- **Learning Goals** (`learningGoals`): Student-selected topics (e.g., "Algorithms, System Design, SQL").
- **Preferred Programming Language** (`preferredLanguage`): Primary language for starter code templates.
- **Skill Tier Preference** (`selectedLevel`): Self-selected entry difficulty level.
- **Bio** (`bio`): Candidate introduction statement (up to 500 characters).
- **Notification Preferences** (`notificationPreferences`):
  - `emailDigests`: Digest summary emails (when email delivery configured).
  - `milestoneAlerts`: Learning streak and completion alerts.
  - `practiceReminders`: Reminders to practice regularly.

### 2.2 Privileged & Immutable Fields
The following fields can NEVER be modified by the student via client-side profile updates:
- `role`: Role privilege is strictly managed via server-side Admin SDK.
- `uid`: Identity key bound to Firebase Authentication.
- `email`: Read-only identity identifier.
- `stats`: All submission counts, accepted problems, and interview statistics are strictly computed server-side from immutable event records.
- `recommendedLevel`: Algorithmic recommendation computed by the analytics service.
- `createdAt`: Immutable document inception timestamp.

Enforced in `firestore.rules`:
```javascript
allow update: if isOwner(userId)
  && !request.resource.data.diff(resource.data).affectedKeys()
      .hasAny(['role', 'stats', 'recommendedLevel', 'uid', 'email', 'createdAt']);
```

## 3. Account Security Controls

### 3.1 Password Reset
- Leverages Firebase Authentication's native `sendPasswordResetEmail(auth, email)` flow.
- Passwords are NEVER transmitted to, processed by, or stored in Firestore.
- Throttled with feedback banners preventing repetitive automated triggering.

### 3.2 Account Deletion Workflow
- Destructive modal requiring explicit typed confirmation (`DELETE MY ACCOUNT`).
- Explains the retention policy:
  - Associated personal profile document is expunged.
  - Submissions and interview sessions are anonymized or purged.
  - Authenticated identity is revoked.
- Requires re-authentication if the user's auth token has expired.

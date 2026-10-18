# PHASE 8 DATA SECURITY, PRIVACY & ACCESS CONTROL SPECIFICATION

## 1. Security Architecture & Boundary Model

Phase 8 introduces the **AI Learning Coach, Adaptive Practice, and Personalized Study Plans** without compromising the security model established in Phases 1–7.

```
+-------------------------------------------------------------------------+
|                         STUDENT CLIENT BROWSER                          |
|  - Can read own profile, submissions, interview reports, and plans      |
|  - Can write study task preferences, feedback, and execution code       |
|  - CANNOT write or alter skill mastery, levels, or verified badges      |
+------------------------------------+------------------------------------+
                                     |
                                     v [HTTPS / WSS / gRPC]
+-------------------------------------------------------------------------+
|                       FIRESTORE SECURITY RULES                          |
|                                                                         |
|  /users/{userId}                        => read/write if isOwner(userId)|
|  /users/{userId}/studyPlans/{planId}    => read/write if isOwner(userId)|
|  /users/{userId}/recommendationFeedback => read/write if isOwner(userId)|
|  /analytics/{userId}                    => read if isOwner; write ADMIN |
|  /submissions/{subId}                   => read if isOwner; write ADMIN |
|  /interviewSessions/{sessId}            => read if isOwner; write ADMIN |
+------------------------------------+------------------------------------+
                                     |
                                     v [Internal Trusted Operations]
+-------------------------------------------------------------------------+
|                  TRUSTED ENGINE / BACKEND ADAPTERS                      |
|  - Computes skill estimates deterministically from authentic verdicts   |
|  - Auto-verifies study tasks against compiled test case outcomes        |
|  - Enforces 500-character input caps & rate-limiting per student        |
+-------------------------------------------------------------------------+
```

---

## 2. Hardened Security Rules (`firestore.rules`)

The following rules protect Phase 8 subcollections:

```javascript
// Study Plans & Tasks: Private to authenticated owner
match /users/{userId}/studyPlans/{planId} {
  allow read: if isAuthenticated() && isOwner(userId);
  allow write: if isAuthenticated() && isOwner(userId);
}

// Recommendation Feedback (Dismissals / Preferences): Private to owner
match /users/{userId}/recommendationFeedback/{recId} {
  allow read: if isAuthenticated() && isOwner(userId);
  allow write: if isAuthenticated() && isOwner(userId);
}

// Core Analytics & Skill Mastery: Students can read; writes restricted to Admin/Harness
match /analytics/{userId} {
  allow read: if isAuthenticated() && (isOwner(userId) || isAdmin());
  allow write: if isAdmin();
}
```

---

## 3. Privacy, Data Minimization & Anti-Tampering

1. **Anti-Tampering for Mastery**: Untrusted clients cannot submit arbitrary mastery numbers or mark milestones as verified without corresponding submission records.
2. **PII and Log Hygiene**: No personally identifiable information (passwords, emails, raw code snippets, private test outputs) is logged to console or external monitoring sinks.
3. **Isolated Tenancy**: All user subcollections (`studyPlans`, `recommendationFeedback`, `submissions`, `interviewSessions`) are strictly partitioned by Firebase UID. Querying across users is rejected by Firestore security rules.
4. **Idempotent Retry Safety**: Submissions and feedback events employ composite keys (`${problemId}_${submittedAt}_${verdict}`) to prevent replay attacks or network retry inflation.

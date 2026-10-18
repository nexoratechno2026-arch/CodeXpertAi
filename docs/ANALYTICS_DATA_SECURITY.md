# Nexora Analytics Data Security & Privacy Controls

## 1. Security Architecture & Threat Vectors

Analytics data contains aggregated representations of student competency, learning activity, and evaluation scores. Unprotected analytics surfaces risk:
1. **Tampering / False Credentialing**: Malicious clients forging mastery scores, acceptance ratios, or milestone completions.
2. **Cross-Tenant Data Exposure**: One student viewing another student's interview feedback, code submissions, or skill profiles.
3. **Data Leakage in Public Feeds**: Exposing private test cases or private candidate interview transcripts in activity logs.
4. **Denial-of-Service / Resource Exhaustion**: Flooding compute endpoints with repeated unbounded analytics recalculations.

---

## 2. Three-Layer Protection Model

```
+-------------------------------------------------------------------+
| Layer 1: Edge & Network Security                                  |
| - HTTPS Strict-Transport-Security (HSTS)                          |
| - Firebase App Check with reCAPTCHA Enterprise / Play Integrity   |
| - Origin validation & Content Security Policy (CSP)               |
+-------------------------------------------------------------------+
                                  │
                                  ▼
+-------------------------------------------------------------------+
| Layer 2: Application & Analytics API                              |
| - Cryptographic Firebase Auth UID verification                    |
| - Client-write prevention: Analytics derived exclusively server-side|
| - In-memory and local storage caching (15-minute TTL)             |
| - Private test case & prompt transcript redaction                 |
+-------------------------------------------------------------------+
                                  │
                                  ▼
+-------------------------------------------------------------------+
| Layer 3: Firestore Database Security Rules                        |
| - Path: /student_analytics/{userId}                               |
| - Read: request.auth != null && request.auth.uid == userId        |
| - Write: FALSE (Immutable to untrusted client SDKs)               |
+-------------------------------------------------------------------+
```

---

## 3. Firestore Rules for Analytics

Client SDK writes to `student_analytics` are forbidden. Only trusted backend functions (Firebase Admin SDK) or deterministic in-app engines running against verified submissions can derive analytics:

```javascript
// Firestore Security Rules Definition
match /student_analytics/{userId} {
  // Only the authentic student can read their private skill profile
  allow read: if request.auth != null && request.auth.uid == userId;

  // Untrusted client writes are strictly blocked to prevent tampering
  allow write: if false;
}

match /learning_paths/{pathId} {
  // Published curricula are readable by authenticated learners
  allow read: if request.auth != null;
  allow write: if false; // Curricula managed by admin/seed tooling
}
```

---

## 4. Privacy & Fairness Guarantees

1. **No Public Leaderboards by Default**: To prevent toxic comparison and anxiety, student analytics are strictly private.
2. **No Hiring Automation**: Nexora analytics are designed solely for self-directed learning. No algorithmic hiring decisions, predictive employability ratings, or automatic candidate rejections are performed.
3. **Data Minimization in Feeds**: Activity feed records contain only high-level metadata (problem title, difficulty, verdict, score). Raw candidate code and proprietary evaluation prompts are strictly omitted from feed payloads.
4. **Right to Rectification & Deletion**: If a submission or interview session is purged, re-running `computeStudentAnalytics(userId)` recalculates the student's metrics cleanly with zero residual ghost data.

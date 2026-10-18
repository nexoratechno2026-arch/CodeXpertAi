# Nexora Platform — Database Protection & Access Strategy

> **Document:** `docs/DATABASE_PROTECTION.md`  
> **Status:** Architecture Specification & Implementation Framework  
> **Database:** Cloud Firestore (Primary Application Store)  
> **Target Scope:** Nexora CodeLab & Nexora InterviewAI (Unified Web Application)  
> **Last Updated:** 2026-10-16  

---

## 1. Core Database Architecture & Access Strategy

Cloud Firestore is a fully managed, document-oriented NoSQL database. While client SDKs can communicate directly with Firestore, **sensitive business logic, answer keys, prompt instructions, and evaluation verdicts must be strictly backend-mediated**.

### Access Model Dichotomy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT ACCESS DICHOTOMY                         │
│                                                                        │
│   CLIENT SDK (Direct Access)            BACKEND API (Mediated Access)  │
│   Protected by Security Rules           Protected by Cloud Run / Admin │
│   ───────────────────────────           ────────────────────────────── │
│   • users/{uid} (Read/Update profile)   • problems/{id}/testCases      │
│   • topics/{id} (Read published)        • interviewTemplates/prompts   │
│   • problems/{id} (Read metadata)       • submissions (Compute verdict)│
│   • learningPaths/{id} (Read catalog)   • evaluationReport (Generate)  │
│                                         • adminAuditLog (Write audit)  │
│                                         • role assignment (Admin claim)│
└────────────────────────────────────────────────────────────────────────┘
```

1. **Client-Direct Pattern (Non-Sensitive / User-Owned):**  
   The client queries Firestore directly using the Web SDK. Access is strictly gated by **Firestore Security Rules** evaluated at the database engine level based on `request.auth.uid`.
2. **Backend-Mediated Pattern (Sensitive / Orchestrated):**  
   The client calls a Cloud Run / Cloud Functions API endpoint with a Bearer JWT. The backend verifies the user, validates input schemas with Zod, applies rate limits, and accesses Firestore using the **Firebase Admin SDK**. The client never has direct read or write access to these documents.

---

## 2. Collection Access Matrix

| Collection Path | Sensitivity | Access Model | Read Authorization | Write Authorization | Service Identity |
|---|---|---|---|---|---|
| `users/{userId}` | Private / PII | Client-Direct | Owner (`auth.uid == userId`) OR Admin | Owner (`auth.uid == userId`) for whitelisted fields only (`fullName`, `selectedLevel`, `preferredLanguage`, `bio`). **Role & stats immutable**. | Firebase Auth Client / `sa-web-api` |
| `users/{userId}/skillRecords/{topicId}` | Progress Metrics | Backend-Mediated | Owner (`auth.uid == userId`) OR Admin | **Blocked from Client.** Updated exclusively by Cloud Run / Cloud Functions trigger on submission verdict. | `sa-code-broker` / `sa-ai-orchestrator` |
| `users/{userId}/submissions/{id}` | Academic Work | Hybrid | Owner (`auth.uid == userId`) OR Admin | Client can create with `status: "pending"`. **Verdict, runtime, and memory are writable only by backend**. | `sa-code-broker` |
| `topics/{topicId}` | Public Catalog | Client-Direct | All authenticated users (`request.auth != null`) | Admin only (`token.role == "admin"`) | `sa-web-api` |
| `problems/{problemId}` | Public Catalog | Client-Direct | Authenticated users if `isPublished == true`; Admins can read drafts | Admin only (`token.role == "admin"`) | `sa-web-api` |
| `problems/{id}/testCases/{testId}` | **High (Answer Key)** | **Backend-Mediated** | Authenticated users can read **only** where `isPublic == true`. Private test cases: **rules return false**. | Admin only (`token.role == "admin"`) | `sa-code-broker` (Admin SDK bypasses rules) |
| `interviewTemplates/{id}` | Public Catalog | Client-Direct | Authenticated users if `isPublished == true` | Admin only (`token.role == "admin"`) | `sa-web-api` |
| `interviewTemplates/{id}/adminConfig/prompts` | **High (AI Prompts)** | **Backend-Mediated** | **Blocked from Client (`allow read: if false`)**. Accessible only via Admin SDK. | Admin only via trusted API | `sa-ai-orchestrator` |
| `interviewSessions/{sessionId}` | Private Candidate Data | Backend-Mediated | Session Owner (`userId == auth.uid`) OR Admin | **Blocked from Client direct write.** Created and updated exclusively via Interview API. | `sa-ai-orchestrator` |
| `interviewSessions/{id}/messages/{msgId}` | Conversational Stream | Backend-Mediated | Session Owner (`userId == auth.uid`) OR Admin | Candidate can append answers via API. AI interviewer messages created exclusively by backend. | `sa-ai-orchestrator` |
| `interviewSessions/{id}/evaluationReport/report` | Evaluation Scorecard | Backend-Mediated | Session Owner (`userId == auth.uid`) OR Admin | **Blocked from Client.** Generated and stored exclusively by backend AI pipeline. | `sa-ai-orchestrator` |
| `learningPaths/{pathId}` | Public Catalog | Client-Direct | Authenticated users if `isPublished == true` | Admin only | `sa-web-api` |
| `platformConfig/{configId}` | Operational Config | Hybrid | Authenticated users can read `configId == "general"`. Execution limits admin-only. | Admin only | `sa-web-api` |
| `adminAuditLog/{logId}` | **High (Audit Trail)** | **Backend-Mediated** | Admin only (`token.role == "admin"`) | **Blocked from all clients.** Appended exclusively via Admin SDK in Cloud Run. | All backend service accounts |

---

## 3. Deep Dive: Protecting Critical Assets

### 3.1 Private Test Cases & Anti-Cheating Protection
- **The Threat:** Students inspecting network tabs or query responses to extract hidden edge cases, test inputs, and expected outputs.
- **Protection Architecture:**
  - Test cases are partitioned into a subcollection: `problems/{problemId}/testCases/{testCaseId}`.
  - The Firestore Security Rule explicitly restricts client queries:
    ```javascript
    match /testCases/{testCaseId} {
      allow read: if isAuthenticated() && (resource.data.isPublic == true || isAdmin());
      allow write: if isAdmin();
    }
    ```
  - When a student runs code, the request goes to the `submitCode` API endpoint. The **Execution Broker** uses the Firebase Admin SDK to fetch all test cases (both public and private), dispatches them to Judge0, compares outputs server-side, and returns only:
    `{ passed: boolean, testNumber: 4, runtimeMs: 12, memoryKB: 4096 }`.
  - The actual input strings, expected outputs, and test descriptions for private cases are **never transmitted to the browser**.

### 3.2 AI System Prompts & Rubric Isolation
- **The Threat:** Prompt injection, system prompt extraction, or reverse-engineering evaluation scoring formulas to game interview scores.
- **Protection Architecture:**
  - System prompts, few-shot examples, and grading weights are stored in:
    `interviewTemplates/{templateId}/adminConfig/prompts`.
  - The Firestore rule denies all client access:
    ```javascript
    match /adminConfig/{configId} {
      allow read, write: if isAdmin();
    }
    ```
  - The **AI Interview Orchestrator** loads prompt templates directly using its dedicated service identity. Candidate answers are inserted into the prompt as sanitized user content blocks with boundary delimiters (`<<<CANDIDATE_ANSWER>>>`), mitigating indirect prompt injection.

### 3.3 Role Immutability & Admin Privilege Protection
- **The Threat:** Malicious students modifying their user document in Firestore to elevate `role: "student"` to `role: "admin"`.
- **Protection Architecture:**
  1. **Dual Verification:** Admin status is determined by **Firebase Auth Custom Claims** (`request.auth.token.role == 'admin'`). The Firestore document `users/{uid}.role` is merely a mirror for UI rendering.
  2. **Security Rule Guard:**
     ```javascript
     allow update: if isOwner(userId)
       && !request.resource.data.diff(resource.data).affectedKeys()
           .hasAny(["role", "stats", "recommendedLevel", "uid", "email", "createdAt"]);
     ```
  3. **No Client Role Promotion:** The client SDK cannot issue custom claims. Only the Firebase Admin SDK running in a trusted, authenticated script or Cloud Function can execute `admin.auth().setCustomUserClaims(uid, { role: "admin" })`.

---

## 4. Database Workload Management & Cost Control

### 4.1 Bounded Queries & Mandatory Pagination
Firestore charges primarily per document read. Unbounded queries (`collection('problems').get()`) present critical cost and performance risks:

- **Mandatory Limits:** All list queries must enforce `.limit(N)` where `N <= 50`.
- **Cursor-Based Pagination:** Pagination uses `.startAfter(lastVisibleDoc)` rather than offset-based counting.
- **Composite Index Optimization:** Composite indexes are defined in `firestore.indexes.json` to support multi-field sorting without requiring table scans:
  - `problems`: `(isPublished ASC, difficulty ASC, title ASC)`
  - `problems`: `(isPublished ASC, topicId ASC, difficulty ASC)`
  - `submissions`: `(problemId ASC, submittedAt DESC)`
  - `interviewSessions`: `(userId ASC, createdAt DESC)`

### 4.2 Denormalization Strategy
To avoid expensive relational joins across collections:
- Stable display names (`topicName`, `problemTitle`, `templateName`) are denormalized into submission and session documents at creation time.
- Aggregated student statistics (`acceptedSubmissions`, `completedInterviews`, `currentStreak`) are maintained directly on `users/{userId}.stats` by backend triggers, eliminating the need to count hundreds of submission documents on every dashboard view.

### 4.3 Avoiding Rule-Level `get()` Cascades
In Firestore Security Rules, calling `get(/databases/$(database)/documents/...)` counts as a billed document read for every document evaluated.
- **Mitigation:** Subcollection paths are used to inherit ownership (`users/{userId}/submissions/{subId}` verifies ownership via path argument `userId == request.auth.uid` with **zero `get()` reads**).
- `get()` is reserved strictly for checking session ownership in interview messages where direct nesting is unavoidable.

---

## 5. Data Retention, Backup & Incident Recovery

### 5.1 Data Retention & Purging Policies
| Data Category | Retention Window | Purging Mechanism |
|---|---|---|
| User Profile & Skill Records | Lifetime of Account | Deleted immediately upon user account deletion |
| Code Submissions (Source Code) | 365 Days | Scheduled Cloud Scheduler job archives code > 1 year to Coldline GCS |
| Interview Messages | 180 Days | Purged after evaluation report is synthesized |
| Evaluation Reports | Lifetime of Account | Maintained for student career tracking |
| Admin Audit Logs | 730 Days (2 Years) | Retained for security compliance, immutable |

### 5.2 Backup Architecture
1. **Point-in-Time Recovery (PITR):**
   - Enabled across all production Firestore databases.
   - Preserves continuous commit logs for **7 days**.
   - Permits microsecond-accurate data recovery in the event of accidental mass corruption or unauthorized writes.
2. **Automated Scheduled Exports:**
   - Daily Cloud Function trigger executes `gcloud firestore export gs://nexora-firestore-backups-prod/daily/$(date +%Y-%m-%d)`.
   - Backup bucket is configured with **Object Lifecycle Management** to transition exports to Nearline storage after 14 days and delete after 30 days.
   - Backup bucket has **Object Versioning** and **Bucket Lock (WORM)** enabled to prevent ransomware tampering.

### 5.3 Automated Testing of Security Rules
All Firestore rules must pass automated unit testing using the `@firebase/rules-unit-testing` library against the local **Firebase Emulator Suite** prior to production deployment:
```bash
# Security Rules Verification Command
firebase emulators:exec --only firestore "npm run test:rules"
```
The test suite validates:
- Student can read their own profile; cannot read another student's profile.
- Student cannot update `role` to `'admin'`.
- Student cannot read private test cases (`isPublic == false`).
- Student cannot read AI prompt configuration documents.
- Admin can read all collections and manage catalogs.

# Nexora CodeLab & InterviewAI — Security Plan

> **Status:** Phase 2 — Implemented Controls & Security Rules Verification  
> **Last Updated:** 2026-10-16

---

## 1. Security Principles

1. **Never trust the client** — All authorization, validation, and sensitive logic runs server-side
2. **Least privilege** — Users access only their own data; admins have scoped elevated access
3. **Defense in depth** — Multiple layers (Auth, Rules, Functions, App Check) rather than one gate
4. **Secrets stay server-side** — API keys, service accounts, and private data never reach the browser
5. **Explicit over implicit** — Default deny; every access path is explicitly permitted
6. **Separation of concerns** — Objective code execution results vs. subjective AI evaluations are clearly distinguished

---

## 2. Threat Model

### 2.1 Threat Actors

| Actor | Capability | Motivation |
|---|---|---|
| **Unauthenticated visitor** | Public endpoints, no auth token | Curiosity, automated scanning |
| **Authenticated student** | Valid auth token, Firestore SDK access, browser dev tools | Cheat on problems, access private test cases, inflate scores |
| **Malicious student** | Technical sophistication, proxy tools, code injection | Bypass execution limits, access other users' data, abuse AI |
| **Compromised admin account** | Admin custom claims, Console access | Data exfiltration, privilege escalation |
| **External attacker** | Network-level, API probing | Data breach, resource abuse, DDoS |

### 2.2 Attack Surface

| Surface | Threats | Mitigations (detailed below) |
|---|---|---|
| Firebase Auth | Brute force, credential stuffing, account takeover | Rate limiting, password requirements, email verification |
| Firestore direct access | Unauthorized reads/writes, data exfiltration | Security Rules, field validation |
| Cloud Functions endpoints | Parameter tampering, injection, abuse | Input validation (Zod), auth verification, rate limits |
| Code execution (Judge0) | Infinite loops, fork bombs, network access, resource exhaustion | Sandboxed provider, time/memory limits, no network |
| AI provider integration | Prompt injection, response manipulation, API key exposure | Server-side only, response validation, prompt hardening |
| Frontend bundle | Secret extraction, XSS, CSRF | No secrets in bundle, CSP headers, Firebase Auth CSRF protection |
| Admin operations | Privilege escalation, unauthorized role assignment | Custom claims via Admin SDK only, audit logging |

---

## 3. Authentication Security

### 3.1 Firebase Authentication Configuration

| Setting | Value | Rationale |
|---|---|---|
| **Email/Password** | Enabled | Primary auth method |
| **Email Verification** | Required for full access | Prevents fake accounts |
| **Password Minimum Length** | 8 characters | Industry standard |
| **Password Complexity** | At least one uppercase, one lowercase, one number | Reasonable without being hostile |
| **Account Enumeration Protection** | Enabled | Prevents email discovery |
| **Social Providers** | Deferred to Phase 2 | Evaluate Google, GitHub sign-in |

### 3.2 Session Management

- Firebase Auth manages session tokens (ID tokens + refresh tokens)
- ID tokens expire after 1 hour and auto-refresh via the SDK
- Token verification happens server-side in Cloud Functions using `auth.verifyIdToken()`
- No custom session cookies in Phase 1 (stateless ID token model)

### 3.3 Admin Role Assignment

```
NEVER:
  ❌ Client writes role field to Firestore
  ❌ User self-assigns admin role
  ❌ Role stored only in Firestore (bypassable via direct API)

ALWAYS:
  ✅ Admin SDK sets custom claims: admin.auth().setCustomUserClaims(uid, { role: "admin" })
  ✅ Security Rules check: request.auth.token.role == "admin"
  ✅ Cloud Functions verify claims before processing admin operations
  ✅ Firestore role field is synchronized but is NOT the source of truth
```

The custom claim on the Firebase Auth token is the source of truth for admin status. The `role` field in the Firestore `users` document is a convenience copy kept in sync by Cloud Functions and is never trusted for authorization decisions.

---

## 4. Firestore Security Rules Strategy

### 4.1 Rule Design Principles

1. **Default deny** — No match rule without explicit `allow`
2. **Path-based ownership** — `users/{userId}` documents are owned by the matching auth UID
3. **Field-level protection** — Prevent clients from modifying server-managed fields (`role`, `stats`, `recommendedLevel`)
4. **Status constraints** — New submissions must have `status: "pending"`; clients cannot set verdicts
5. **Type validation** — Validate data types, string lengths, and enum values in rules
6. **Minimize `get()` calls** — Each `get()` in rules is a billed read; use path-based ownership where possible

### 4.2 Critical Rules

| Collection | Key Rule | Why |
|---|---|---|
| `users/{userId}` | Owner can't write `role`, `stats`, `recommendedLevel` | Prevents privilege escalation and score inflation |
| `problems/{id}/testCases` | Clients can only read where `isPublic == true` | Protects answer keys |
| `interviewTemplates/{id}/adminConfig` | Only admins can read | Protects AI prompts from gaming |
| `interviewSessions` | Cloud Functions only for writes | Prevents session manipulation |
| `submissions` | Create with `status: "pending"` only | Prevents fake verdicts |
| `adminAuditLog` | Cloud Functions write only; admin read only | Audit integrity |

### 4.3 Validation Rules (Planned)

```javascript
// Example: Validate user profile update
allow update: if isOwner(userId)
  // Prevent modifying protected fields
  && !request.resource.data.diff(resource.data).affectedKeys()
      .hasAny(["role", "stats", "recommendedLevel", "uid", "email", "createdAt"])
  // Validate field types and lengths
  && request.resource.data.displayName is string
  && request.resource.data.displayName.size() >= 1
  && request.resource.data.displayName.size() <= 100
  && request.resource.data.bio is string
  && request.resource.data.bio.size() <= 500
  && request.resource.data.selectedLevel in [
      "absolute_beginner", "beginner", "intermediate", "advanced", "expert"
  ]
  && request.resource.data.preferredLanguage in [
      "python", "javascript", "java", "cpp", "c", "go", "sql"
  ];
```

Full Security Rules are documented in [DATABASE_SCHEMA.md](file:///e:/Codebase%20Nexoratechno/docs/DATABASE_SCHEMA.md) § Security Rules Summary.

---

## 5. Cloud Functions Security

### 5.1 Authentication Verification

Every callable Cloud Function verifies authentication:

```typescript
import { onCall, HttpsError } from "firebase-functions/v2/https";

export const submitCode = onCall(async (request) => {
  // 1. Verify authentication
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Authentication required");
  }
  
  // 2. Verify App Check (when enforced)
  if (!request.app) {
    throw new HttpsError("failed-precondition", "App Check token required");
  }
  
  // 3. Validate input with Zod
  const parsed = submitCodeSchema.safeParse(request.data);
  if (!parsed.success) {
    throw new HttpsError("invalid-argument", "Invalid submission data");
  }
  
  // 4. Verify ownership / authorization
  // ...
  
  // 5. Process request
  // ...
});
```

### 5.2 Input Validation

All Cloud Function inputs are validated using Zod schemas:

```typescript
import { z } from "zod";

const submitCodeSchema = z.object({
  problemId: z.string().min(1).max(128),
  language: z.enum(["python", "javascript", "java", "cpp", "c", "go", "sql"]),
  code: z.string().min(1).max(65536), // 64 KB max code size
});

const startInterviewSchema = z.object({
  templateId: z.string().min(1).max(128),
  difficulty: z.enum(["absolute_beginner", "beginner", "intermediate", "advanced", "expert"]),
});

const answerQuestionSchema = z.object({
  sessionId: z.string().min(1).max(128),
  content: z.string().min(1).max(10000),
  codeSubmission: z.object({
    language: z.enum(["python", "javascript", "java", "cpp", "c", "go", "sql"]),
    code: z.string().min(1).max(65536),
  }).optional(),
});
```

### 5.3 Rate Limiting

Cloud Functions enforce per-user rate limits:

| Operation | Limit | Window |
|---|---|---|
| Code submissions | 30 | Per hour |
| Interview sessions started | 5 | Per day |
| Interview messages | 100 | Per session |
| Diagnostic assessments | 3 | Per day |

Implementation approach:
- Store rate limit counters in Firestore under `users/{uid}/rateLimits/{operation}`
- Check and increment atomically in Cloud Functions before processing
- Consider Cloud Tasks or Redis for high-volume rate limiting in later phases

### 5.4 Admin Operation Authorization

```typescript
function verifyAdmin(request: CallableRequest): void {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Authentication required");
  }
  if (request.auth.token.role !== "admin") {
    throw new HttpsError("permission-denied", "Admin access required");
  }
}
```

All admin operations:
1. Verify admin custom claim
2. Validate input
3. Execute operation
4. Write to `adminAuditLog`

---

## 6. Code Execution Security

### 6.1 Architecture

```
Student code NEVER executes in:
  ❌ The browser (beyond Monaco editing)
  ❌ Cloud Functions
  ❌ Any trusted backend process

Student code ONLY executes in:
  ✅ Judge0 sandboxed containers (isolated process, no network, resource limits)
```

### 6.2 Execution Limits

| Limit | Value | Rationale |
|---|---|---|
| **Time limit** | Configurable per problem (default 5s, max 30s) | Prevent infinite loops |
| **Memory limit** | Configurable per problem (default 256 MB, max 512 MB) | Prevent memory exhaustion |
| **Output size** | 64 KB max | Prevent output bombing |
| **Code size** | 64 KB max | Reasonable for any single-file solution |
| **Network access** | Disabled | Prevent data exfiltration, external calls |
| **File system** | Read-only or tmpfs, limited | Prevent persistent storage abuse |
| **Process creation** | Limited (no fork bombs) | Resource protection |
| **Concurrent executions per user** | 3 | Prevent resource monopolization |

### 6.3 Credential Protection

- `JUDGE0_API_URL` and `JUDGE0_API_KEY` stored in Cloud Functions secrets
- Never sent to the client
- Cloud Functions act as a proxy: validate request → call Judge0 → return sanitized result
- Error messages from Judge0 are sanitized before returning to client (no internal URLs, no stack traces)

### 6.4 Test Case Protection

- Private test cases are stored in Firestore subcollection with Security Rules denying client access
- Cloud Functions load private test cases using Admin SDK (bypasses Security Rules)
- Test case inputs/outputs are sent to Judge0 but never returned to the client
- Only pass/fail status, runtime, and memory usage are returned for private test cases

---

## 7. AI Integration Security

### 7.1 Credential Protection

- AI provider API key stored in Cloud Functions secrets (`AI_PROVIDER_API_KEY`)
- All AI calls are made from Cloud Functions, never from the client
- Client sends interview answers to Cloud Functions; Functions call the AI provider

### 7.2 Prompt Injection Mitigation

| Measure | Implementation |
|---|---|
| **System prompt isolation** | System prompts stored in admin-only Firestore documents, prepended server-side |
| **Input sanitization** | Student answers are treated as user content, not system instructions |
| **Structured output** | Request JSON-structured responses from the AI model |
| **Schema validation** | Validate AI responses against Zod schemas before storing |
| **Output filtering** | Strip any unexpected content, HTML, or scripts from AI responses |
| **Conversation context limits** | Cap context window to prevent token abuse |

### 7.3 Response Validation

```typescript
const aiQuestionResponseSchema = z.object({
  question: z.string().min(10).max(5000),
  questionType: z.enum(["conceptual", "coding", "followup", "behavioral"]),
  topicId: z.string().optional(),
  codingChallenge: z.object({
    problemDescription: z.string(),
    expectedLanguages: z.array(z.string()),
    starterCode: z.record(z.string()),
    testCases: z.array(z.object({
      input: z.string(),
      output: z.string(),
    })),
  }).optional(),
});

// After AI call:
const parsed = aiQuestionResponseSchema.safeParse(aiResponse);
if (!parsed.success) {
  // Log the malformed response for debugging
  // Return a graceful fallback or error to the student
  throw new HttpsError("internal", "Failed to generate question. Please try again.");
}
```

### 7.4 Usage Limits

| Limit | Value | Rationale |
|---|---|---|
| Interviews per day per user | 5 | Cost control |
| Messages per interview session | 100 | Prevent abuse |
| AI token budget per session | Configurable | Cost control |
| Concurrent AI calls per user | 1 | Prevent parallel abuse |

### 7.5 AI Content Disclaimer

The platform explicitly communicates:
- Evaluation reports are AI-generated and marked with `isAIGenerated: true`
- AI scores are subjective assessments, not certified evaluations
- Code execution results (pass/fail) are objective and separate from AI opinions
- The platform does not guarantee job placement or certification
- AI responses may contain errors; students should verify technical claims

---

## 8. Frontend Security

### 8.1 No Secrets in Frontend

| Allowed in Frontend | Not Allowed in Frontend |
|---|---|
| Firebase web config (`apiKey`, `authDomain`, etc.) | Service account keys |
| App Check reCAPTCHA site key | AI provider API keys |
| Public feature flags | Judge0 credentials |
| | Admin SDK credentials |
| | Any `GOOGLE_APPLICATION_CREDENTIALS` |

### 8.2 Content Security Policy (CSP)

Configure CSP headers in Firebase Hosting:

```json
{
  "headers": [
    {
      "source": "**",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://*.cloudfunctions.net; img-src 'self' data: https:; frame-ancestors 'none';"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    }
  ]
}
```

> [!NOTE]
> The CSP `connect-src` directive will need to be updated once the specific Firebase project domain and any CDN domains are known. Monaco Editor may require additional `script-src` or `worker-src` entries for web workers.

### 8.3 XSS Prevention

- React's JSX auto-escapes rendered content
- Markdown rendering (`react-markdown`) configured with sanitization
- AI-generated content rendered through sanitized Markdown only
- No `dangerouslySetInnerHTML` except with explicit sanitization (DOMPurify if needed)
- User-submitted code displayed in Monaco Editor (not rendered as HTML)

### 8.4 CSRF Protection

- Firebase Authentication uses ID tokens, not cookies, for API authentication
- Callable Cloud Functions automatically verify the Firebase Auth token
- No custom cookie-based authentication that would require CSRF tokens

---

## 9. App Check Integration

### 9.1 Purpose

Firebase App Check helps ensure that requests to backend services come from the legitimate app, not from automated scripts or modified clients.

### 9.2 Configuration

| Setting | Value |
|---|---|
| **Attestation Provider** | reCAPTCHA Enterprise (web) |
| **Enforced Services** | Cloud Functions (callable), Cloud Firestore |
| **Debug Provider** | Enabled for local development and CI |

### 9.3 Limitations

- App Check is not a complete security solution — it raises the bar for abuse but can be bypassed by sophisticated attackers
- It should be used **in addition to**, not instead of, proper Security Rules and Cloud Functions authorization
- Does not replace rate limiting or input validation

---

## 10. Data Privacy

### 10.1 Data Classification

| Classification | Examples | Access |
|---|---|---|
| **Public** | Problem descriptions, topic names, published templates | Any authenticated user |
| **User-Private** | Submissions, interview sessions, skill records, profile | Owner + admins |
| **Admin-Only** | Private test cases, AI prompts, audit logs, platform config | Admins + Cloud Functions |
| **Secrets** | API keys, service account keys | Cloud Functions runtime only |

### 10.2 Data Deletion (GDPR Readiness)

When a user requests account deletion (Phase 2+ implementation):

1. Delete Firebase Auth account
2. Delete `users/{uid}` document and all subcollections (`skillRecords`, `submissions`)
3. Delete or anonymize `interviewSessions` where `userId == uid`
4. Delete associated `messages` and `evaluationReport` subcollections
5. Log the deletion in `adminAuditLog`
6. Provide data export before deletion (JSON download of all user data)

### 10.3 Data Minimization

- Collect only necessary information for platform functionality
- No tracking beyond Firebase Analytics (deferred to Phase 3+)
- No third-party analytics or advertising SDKs
- Profile data is optional beyond email and display name

---

## 11. Incident Response Plan

### 11.1 Security Event Categories

| Category | Examples | Response |
|---|---|---|
| **P0 — Critical** | API key exposure, data breach, auth bypass | Rotate credentials immediately, disable affected service, notify users |
| **P1 — High** | Privilege escalation bug, private test case leak | Patch and deploy within 24 hours, review access logs |
| **P2 — Medium** | Rate limit bypass, minor data exposure | Patch within 1 week, add monitoring |
| **P3 — Low** | UI-only issues, cosmetic security headers | Address in next release cycle |

### 11.2 Credential Rotation

| Credential | Rotation Trigger | Procedure |
|---|---|---|
| Firebase web config | Exposure of project | Regenerate API key in Console, update environment |
| AI provider API key | Suspected compromise | Rotate in provider dashboard, update Cloud Functions secrets |
| Judge0 API key | Suspected compromise | Rotate in provider dashboard, update Cloud Functions secrets |
| Service account key | Suspected compromise | Generate new key, revoke old, redeploy |

---

## 12. Security Checklist (Pre-Launch)

- [ ] Security Rules tested against emulator with positive and negative test cases
- [ ] All Cloud Functions verify authentication and App Check
- [ ] All Cloud Functions validate input with Zod schemas
- [ ] Rate limits implemented and tested
- [ ] No secrets in frontend environment variables or source code
- [ ] CSP headers configured and tested
- [ ] Private test cases inaccessible from client (verified)
- [ ] AI prompts inaccessible from client (verified)
- [ ] Admin role assignment only via Admin SDK (verified)
- [ ] Audit logging for all admin operations
- [ ] Error messages do not leak internal details
- [ ] Dependencies audited for known vulnerabilities (`npm audit`)
- [ ] Firebase App Check enforced on production
- [ ] HTTPS enforced (Firebase Hosting default)
- [ ] Data export / deletion flow documented

# Nexora Platform — Three-Layer Security Architecture

> **Document:** `docs/SECURITY_ARCHITECTURE.md`  
> **Status:** Architecture Specification & Implementation Framework  
> **Target Scope:** Nexora CodeLab & Nexora InterviewAI (Unified Web Application)  
> **Last Updated:** 2026-10-16  

---

## 1. Executive Security Summary

The Nexora developer platform integrates two distinct modules—**Nexora CodeLab** (algorithmic assessment and practice) and **Nexora InterviewAI** (adaptive technical mock interviews)—into a **single web application**. 

To protect against source code tampering, prompt injection, automated scraping, credential theft, denial-of-service, and unauthorized database mutation, the platform enforces a **Three-Layer Security Architecture**:

```
                       UNTRUSTED INTERNET / CLIENT BROWSER
                                        │
┌───────────────────────────────────────▼────────────────────────────────────────┐
│ LAYER 1: EDGE & NETWORK PROTECTION                                             │
│                                                                                │
│  [HTTPS / TLS 1.3] ──► [Global External Application Load Balancer]             │
│                              │ (Edge SSL termination & HTTP/2-3)               │
│                              ▼                                                 │
│                        [Google Cloud Armor WAF]                                │
│                        ├── Layer 7 DDoS Mitigation (SYN, UDP, HTTP Floods)     │
│                        ├── Rate-Limiting Policies (Per-IP & Per-Session)       │
│                        ├── Preconfigured WAF Rules (OWASP Top 10, SQLi, XSS)   │
│                        └── Geo & IP Reputation Filters                         │
└───────────────────────────────────────┬────────────────────────────────────────┘
                                        │ Authenticated Ingress
┌───────────────────────────────────────▼────────────────────────────────────────┐
│ LAYER 2: APPLICATION & API PROTECTION (Cloud Run / Cloud Functions 2nd Gen)    │
│                                                                                │
│  [API Gateway / Ingress Router]                                                │
│  ├── 1. Firebase App Check Attestation (reCAPTCHA Enterprise)                  │
│  ├── 2. Firebase Authentication Token Verification (JWT / Custom Claims)       │
│  ├── 3. Strict Input Validation & Schema Sanitization (Zod)                    │
│  └── 4. Per-User & Per-Operation Rate Quotas (Redis / Firestore Counters)      │
│                                                                                │
│  [Workload-Isolated Services]                                                  │
│  ├── Service A: General Web API & User Profile Management                      │
│  ├── Service B: AI Interview Orchestrator (Server-side LLM, Prompts Hidden)    │
│  └── Service C: Code Execution Broker (Sandboxed Judge0 API, Zero Direct Exec) │
│                                                                                │
│  [Secret Management & Least-Privilege IAM Service Accounts]                   │
│  └── Cloud Secret Manager: AI API Keys, Judge0 Keys (Never sent to client)     │
└───────────────────────────────────────┬────────────────────────────────────────┘
                                        │ Authenticated Service Identity (Admin SDK)
                                        │ OR Client Direct with Restrictive Rules
┌───────────────────────────────────────▼────────────────────────────────────────┐
│ LAYER 3: DATABASE & DATA PROTECTION (Cloud Firestore)                          │
│                                                                                │
│  [Access Routing]                                                              │
│  ├── Backend-Mediated Access (Sensitive: Private Tests, Prompts, Audit Logs)   │
│  └── Client-Direct Access (Non-Sensitive: Profile display, Public topics)      │
│                                                                                │
│  [Firestore Security Rules Enforcement]                                        │
│  ├── Path-based Auth UID Ownership (users/{userId} matches request.auth.uid)   │
│  ├── Role Immutability (Client cannot write role="admin", stats, or verdicts)  │
│  └── Deny-by-default for subcollections (skillRecords, testCases, auditLog)    │
│                                                                                │
│  [Data Lifecycle & Resilience]                                                 │
│  ├── Point-in-Time Recovery (PITR) & Automated Daily GCS Backups               │
│  ├── Bounded Queries (Mandatory limits & cursor pagination)                    │
│  └── Audit Logging (adminAuditLog collection + Cloud Audit Logs)               │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Layer 1: Edge and Network Protection

### 2.1 Transport Security (HTTPS / TLS)
- **Mandatory HTTPS:** Strict Transport Security (HSTS) with `max-age=31536000; includeSubDomains; preload` enforced on all client endpoints.
- **TLS Configuration:** Minimum TLS version 1.2; TLS 1.3 negotiated by default. Deprecated cipher suites (RC4, 3DES, CBC-mode ciphers) are disabled.
- **Certificate Management:** Google-managed SSL/TLS certificates with automated 90-day rotation provisioned at the Load Balancer / Firebase Hosting edge.

### 2.2 Ingress Architecture: Global External Application Load Balancer
- **Edge Routing:** Incoming HTTP/S traffic terminates at Google’s globally distributed Edge Points of Presence (PoPs).
- **Backend Service Mapping:**
  - Static Web Assets / SPA: Served via Firebase Hosting / Cloud CDN.
  - API & Workload Endpoints: Routed to Cloud Run backend services via Serverless Network Endpoint Groups (Serverless NEGs).
- **Network Ingress Restrictions:** Cloud Run services can be configured with `ingress: internal-and-cloud-load-balancing` so direct `.run.app` URLs cannot be accessed publicly, forcing all traffic through Cloud Armor and the Load Balancer.

### 2.3 Cloud Armor Web Application Firewall (WAF)
Cloud Armor provides Layer 3–7 infrastructure protection and application-aware filtering:

| Protection Mechanism | Policy Specification | Status in Baseline vs Production |
|---|---|---|
| **L3/L4 DDoS Mitigation** | Built-in Google Cloud edge capacity absorbs volumetric attacks (UDP/SYN floods) automatically. | **Baseline:** Active by default on GCP edge.<br>**Production:** Active by default. |
| **L7 DDoS & Rate Limiting** | Limit client requests to **120 requests per minute per IP** for general API endpoints, and **10 requests per minute per IP** for authentication/submission endpoints. | **Baseline:** Application-level limits.<br>**Production:** Enforced at Cloud Armor edge. |
| **Preconfigured WAF Rules** | Evaluates OWASP Top 10 vulnerabilities: SQL Injection (`sqli-v33-stable`), Cross-Site Scripting (`xss-v33-stable`), Local File Inclusion (`lfi-v33-stable`), and Remote Code Execution (`rce-v33-stable`). | **Baseline:** Sanitization in code (Zod).<br>**Production:** Cloud Armor WAF rule inspection. |
| **IP Reputation & Geo-blocking** | Threat intelligence blocks known malicious botnets, Tor exit nodes (optional), and high-risk IP blocks using Google Threat Intelligence. | **Baseline:** App Check client attestation.<br>**Production:** Cloud Armor threat intelligence. |
| **Request Size Limits** | Cloud Armor drops payloads exceeding **2 MB** at the edge before backend invocation. Code submissions are capped at 64 KB; JSON payloads capped at 256 KB. | **Baseline:** Cloud Run/Functions request body limit.<br>**Production:** Cloud Armor edge policy. |

> [!WARNING]
> **Billing Prerequisites & Reality Check:**  
> Cloud Armor and Global External Application Load Balancers incur fixed monthly infrastructure costs (~$18–$25/month for the forwarding rule + $5/month per Cloud Armor policy + per-rule evaluation fees).  
> **Phase 2 Status:** Documented and scaffolded. Not provisioned in Phase 2 to prevent unauthorized billing. In Phase 2, baseline edge protection is provided by Firebase Hosting's global CDN and Google Cloud standard infrastructure.

---

## 3. Layer 2: Application and API Protection

### 3.1 Compute Runtime: Cloud Run vs Cloud Functions 2nd Gen
Both run on Google Cloud Run under the hood, but provide distinct operational boundaries:

| Dimension | Cloud Functions (2nd Gen) | Cloud Run (Dedicated Microservices) |
|---|---|---|
| **Primary Use Case** | Event triggers (Firestore `onWrite`, Auth `onCreate`), scheduled jobs | Long-lived API endpoints, SSE/streaming AI responses, containerized services |
| **Concurrency** | Up to 80 concurrent requests per container | Up to 1,000 concurrent requests per container |
| **Execution Timeout** | Max 9 minutes | Max 60 minutes (ideal for long AI interview evaluations) |
| **VPC & Ingress** | Supports Serverless VPC Access connector | Native VPC egress, Private Service Connect, and `internal-and-cloud-load-balancing` |
| **Recommendation** | Use for asynchronous database triggers and scheduled maintenance. | Recommended for API endpoints (`/api/v1/interview`, `/api/v1/codelab`). |

### 3.2 Authentication & Token Verification
Every protected backend request passes through a mandatory authentication pipeline:

```typescript
// Architectural Pattern: Server-Side Token Verification
import { getAuth } from 'firebase-admin/auth';
import type { Request, Response, NextFunction } from 'express';

export async function authenticateRequest(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'UNAUTHENTICATED', message: 'Missing or malformed authorization header.' });
  }

  const idToken = authHeader.split('Bearer ')[1];
  try {
    // 1. Verify token signature, expiration, and revocation status
    const decodedToken = await getAuth().verifyIdToken(idToken, true /* checkRevoked */);
    
    // 2. Attach verified user context to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      role: decodedToken.role === 'admin' ? 'admin' : 'student',
    };
    next();
  } catch (error: any) {
    if (error.code === 'auth/id-token-revoked') {
      return res.status(401).json({ error: 'TOKEN_REVOKED', message: 'Session has been revoked. Please re-authenticate.' });
    }
    return res.status(401).json({ error: 'INVALID_TOKEN', message: 'Invalid authentication credentials.' });
  }
}
```

### 3.3 Firebase App Check (Abuse Protection)
- **Attestation Provider:** reCAPTCHA Enterprise for web clients.
- **Backend Verification:** Protected endpoints verify the `X-Firebase-AppCheck` header using `getAppCheck().verifyToken(appCheckToken)`.
- **Enforcement Strategy:** Requests with invalid or missing App Check tokens are rejected with HTTP 403 Forbidden. The debug token provider is restricted strictly to local developer environments and CI.

### 3.4 Workload Separation & Resource Isolation
To prevent resource starvation and security cross-contamination, workloads are decoupled into separate execution tiers:

```
                        INCOMING API TRAFFIC
                                 │
           ┌─────────────────────┼─────────────────────┐
           ▼                     ▼                     ▼
  [General Web API]     [AI Orchestration]     [Execution Broker]
  - User Profiles       - Question Generation  - Request Validation
  - Dashboard Metrics   - Conversational AI    - Test Case Loading
  - Problem Browsing    - Report Synthesis     - Judge0 Proxying
  ───────────────       ──────────────────     ──────────────────
  Concurrency: High (80) Concurrency: Low (5)  Concurrency: Bounded (10)
  Timeout: 15s          Timeout: 120s          Timeout: 30s
  Memory: 256 MB        Memory: 512 MB-1 GB    Memory: 512 MB
  Service Account:      Service Account:       Service Account:
  sa-web-api@           sa-ai-orchestrator@    sa-code-broker@
```

### 3.5 Code Execution Isolation (Anti-Arbitrary Code Execution)
- **Strict Prohibition:** Student code is **NEVER** compiled, interpreted, or executed inside Cloud Run containers, Cloud Functions, or any shared application backend.
- **Dedicated Sandbox Service:** Student code is dispatched exclusively to an isolated external sandbox (Judge0).
- **Execution Constraints:**
  - Network egress: Disabled (containers cannot call external URLs, download scripts, or exfiltrate tokens).
  - CPU limit: 1.0 vCPU per test run.
  - Memory limit: Max 256 MB per test run.
  - Wall-clock time limit: 5 seconds per test case.
  - System calls: Process creation (`fork`, `exec`), disk writes outside `/tmp` (mounted `noexec,nosuid`), and root access are blocked by Linux seccomp/cgroup boundaries.

### 3.6 Secret Management
- **Zero Secrets in Frontend:** API keys for AI models (Gemini / OpenAI), Judge0 authorization keys, and Firebase service account credentials reside exclusively in **Google Cloud Secret Manager**.
- **Runtime Injection:** Cloud Run mounts secrets as environment variables or files via Secret Manager integration (`projects/.../secrets/AI_PROVIDER_API_KEY/versions/latest`).
- **Rotation:** Secrets can be rotated in Secret Manager without redeploying code.

### 3.7 Secure Logging and Error Masking
- **No Sensitive Logging:** Passwords, plain tokens, student interview draft answers, and private test case outputs are never written to Cloud Logging.
- **Structured Audit Events:** Security events (authentication failures, permission denials, role changes) log:
  ```json
  {
    "severity": "WARNING",
    "eventType": "AUTHZ_FAILURE",
    "uid": "usr_9981",
    "targetResource": "problems/p102/testCases",
    "action": "READ_PRIVATE_TESTS",
    "ip": "203.0.113.19",
    "timestamp": "2026-10-16T16:10:00Z"
  }
  ```
- **Error Sanitization:** All HTTP 500 internal errors return generic identifiers (`"error": "INTERNAL_ERROR", "requestId": "req_abc123"`). Stack traces, internal IP addresses, and database connection strings are stripped.

---

## 4. Layer 3: Database and Data Protection

### 4.1 Storage Model: Cloud Firestore
Cloud Firestore serves as the primary NoSQL document store. It provides multi-region replication, automatic encryption at rest (Google-managed or CMEK), and fine-grained Security Rules.

### 4.2 Data Access Patterns: Backend-Mediated vs Client-Direct

To achieve enterprise-grade isolation, collections are bifurcated into two distinct access models:

| Collection Path | Data Sensitivity | Access Pattern | Enforcement Mechanism |
|---|---|---|---|
| `users/{userId}` | Private / Personal | **Client-Direct + Rules** | Firestore Rules (`request.auth.uid == userId`) |
| `users/{userId}/skillRecords` | Progress Metrics | **Backend-Mediated** | Rules deny client writes; updated only by backend triggers |
| `users/{userId}/submissions` | Student Code | **Backend-Mediated** | Client creates with `pending`; execution result written only by backend |
| `topics/{topicId}` | Public Catalog | **Client-Direct + Rules** | Read allowed to all authenticated users; writes admin-only |
| `problems/{problemId}` | Public Metadata | **Client-Direct + Rules** | Read allowed if `isPublished == true`; writes admin-only |
| `problems/{problemId}/testCases` | **High (Answer Key)** | **Backend-Mediated** | Rules allow reading public examples only; private tests accessible **only** via Admin SDK |
| `interviewTemplates/{templateId}` | Public Template | **Client-Direct + Rules** | Read allowed if `isPublished == true`; writes admin-only |
| `interviewTemplates/{id}/adminConfig` | **High (AI Prompts)** | **Backend-Mediated** | Rules deny all client reads; loaded only by AI Orchestrator |
| `interviewSessions/{sessionId}` | Private Candidate Data | **Backend-Mediated** | Rules restrict reads to session owner; state updates driven by API |
| `interviewSessions/{id}/messages` | Conversational Data | **Backend-Mediated** | AI responses generated server-side; client cannot fabricate interviewer messages |
| `interviewSessions/{id}/evaluationReport` | Evaluation Feedback | **Backend-Mediated** | Only backend AI orchestrator can create or modify evaluation reports |
| `platformConfig/{configId}` | Configuration | **Backend-Mediated** | Read-only for general flags; admin-only for operational settings |
| `adminAuditLog/{logId}` | **High (Audit Trail)** | **Backend-Mediated** | Client writes completely blocked; appended only by trusted services |

### 4.3 Data Encryption
- **In Transit:** TLS 1.3 encryption across all client-to-database and server-to-database connections.
- **At Rest:** AES-256 encryption applied automatically by Google Cloud. Customer-Managed Encryption Keys (CMEK) via Cloud KMS can be layered for strict compliance requirements.

### 4.4 Backup, Disaster Recovery & Data Lifecycle
- **Continuous Backups (PITR):** Point-in-Time Recovery enabled for up to 7 days, allowing restoration to any microsecond.
- **Scheduled Backups:** Daily automated exports stored in a multi-region Cloud Storage bucket (`gs://nexora-firestore-backups-prod`) with a 30-day retention lifecycle policy.
- **GDPR / Data Deletion:** User deletion triggers automated cascade deletion across `users/{uid}`, `skillRecords`, `submissions`, and anonymizes interview sessions.

---

## 5. Trust Boundaries & Threat Model (STRIDE)

| Threat Category | Potential Attack Vector | Nexora Mitigation Architecture |
|---|---|---|
| **Spoofing** | Attacker impersonates another student or administrator | Firebase Auth ID token verification with cryptographically signed JWTs. Role verified via token custom claims, never client-submitted payload. |
| **Tampering** | Student submits solution and self-assigns `"verdict": "accepted"` | Firestore Security Rules deny client updates to verdicts. Verdicts are written exclusively by the trusted backend execution broker. |
| **Repudiation** | Administrator denies deleting a problem or modifying test cases | All administrative actions log to `adminAuditLog` with admin UID, IP address, timestamp, and target document ID. |
| **Information Disclosure** | Student reads hidden test cases or AI prompt instructions to cheat | Private test cases and AI system prompts reside in backend-mediated subcollections where Firestore rules deny client reads. |
| **Denial of Service** | Botnet floods the code execution or AI interview APIs to exhaust budget | Layer 1 Cloud Armor IP rate-limiting, Layer 2 user quotas (30 submissions/hour, 5 interviews/day), and App Check reCAPTCHA Enterprise. |
| **Elevation of Privilege** | Student modifies their Firestore document to set `role: "admin"` | Firestore rules enforce `!request.resource.data.diff(resource.data).affectedKeys().hasAny(["role"])`. Admin SDK custom claims are the single source of truth. |

---

## 6. Residual Risks & Launch Gate Checklist

Before opening the platform to public student traffic, the following verification milestones must be passed:

- [ ] **Cloud Armor Deployment:** Configure production load balancer with Cloud Armor WAF and verify rate-limiting policies.
- [ ] **App Check Production Attestation:** Register production domain in reCAPTCHA Enterprise console and enable enforcement.
- [ ] **VPC & Ingress Lockdown:** Restrict Cloud Run services to accept traffic only via the Load Balancer (`internal-and-cloud-load-balancing`).
- [ ] **Secret Manager Audit:** Verify no credentials appear in repository commits, `.env` files, or client bundle artifacts.
- [ ] **Security Rules Automated Test Suite:** Run emulator test matrix verifying zero unauthorized reads on private test cases, prompts, and peer user profiles.
- [ ] **Budget & Anomaly Alerts:** Configure Google Cloud billing alerts at $50, $100, and $500 thresholds with automated Slack/email notifications.

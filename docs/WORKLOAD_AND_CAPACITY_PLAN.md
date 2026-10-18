# Nexora Platform — Workload Separation & Capacity Plan

> **Document:** `docs/WORKLOAD_AND_CAPACITY_PLAN.md`  
> **Status:** Capacity, Quota & Performance Specification  
> **Target Scope:** Nexora CodeLab & Nexora InterviewAI (Unified Web Application)  
> **Last Updated:** 2026-10-16  

---

## 1. Workload Categorization & Resource Allocations

To prevent expensive computational tasks (code evaluation, generative LLM synthesis) from degrading interactive user responsiveness, workloads are classified into three decoupled profiles:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ WORKLOAD PROFILE 1: INTERACTIVE USER API (Synchronous / High Concurrency)        │
│                                                                                 │
│ • Endpoints: /api/v1/user/profile, /api/v1/problems, /api/v1/dashboard         │
│ • Profile: I/O-bound, low CPU, fast document reads/writes                      │
│ • Container Sizing: 0.5 vCPU, 256 MB RAM                                        │
│ • Concurrency: 80 requests / container                                         │
│ • Timeout: 15 seconds                                                           │
│ • Target Latency (p95): < 250 ms                                                │
│ • Autoscaling: 0 to 20 instances (Rapid scaling)                                │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│ WORKLOAD PROFILE 2: AI INTERVIEW ORCHESTRATION (Stream / Bounded Async)         │
│                                                                                 │
│ • Endpoints: /api/v1/interview/start, /api/v1/interview/answer, /end            │
│ • Profile: High latency, network-bound to AI provider, SSE streaming           │
│ • Container Sizing: 1.0 vCPU, 512 MB – 1024 MB RAM                              │
│ • Concurrency: 5 concurrent streams / container                                 │
│ • Timeout: 120 seconds                                                          │
│ • Target Latency (Time to First Token): < 1.2 seconds                           │
│ • Autoscaling: 0 to 10 instances (Strict cap to prevent LLM budget overruns)   │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│ WORKLOAD PROFILE 3: CODE EXECUTION BROKER (Isolated Sandboxing)                 │
│                                                                                 │
│ • Endpoints: /api/v1/codelab/submit, /api/v1/codelab/run-test                   │
│ • Profile: Dispatcher to Judge0; runs public & private test suites              │
│ • Container Sizing: 1.0 vCPU, 512 MB RAM                                        │
│ • Concurrency: 10 concurrent runs / container                                   │
│ • Timeout: 30 seconds                                                           │
│ • Target Latency (p95): < 3.5 seconds (including 5 test cases)                  │
│ • Autoscaling: 0 to 15 instances                                                │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Per-User Quotas & Rate Limits

Rate limits are applied at the application and gateway layer to prevent resource exhaustion, credential brute-forcing, and accidental runaway client loops.

### 2.1 Quota Matrix

| Operation | Window | Maximum Limit | Burst Allowance | Enforcement Point | Exceeded Response |
|---|---|---|---|---|---|
| **Account Login** | 1 Minute | 5 attempts | 2 | Cloud Armor / Auth API | HTTP 429 (`TOO_MANY_ATTEMPTS`) |
| **Password Reset** | 1 Hour | 3 requests | 1 | Cloud Functions / Auth | HTTP 429 (`RESET_LIMIT_REACHED`) |
| **Profile Updates** | 1 Hour | 10 updates | 3 | Cloud Run Web API | HTTP 429 (`UPDATE_LIMIT_EXCEEDED`) |
| **Code Submissions** | 1 Hour | **30 submissions** | 3 per minute | Code Execution Broker | HTTP 429 (`SUBMISSION_QUOTA_EXCEEDED`) |
| **Code Run (Public Tests)** | 1 Minute | 5 runs | 2 | Code Execution Broker | HTTP 429 (`RUN_RATE_LIMITED`) |
| **Mock Interview Sessions**| 24 Hours | **5 sessions** | 1 concurrent | AI Interview API | HTTP 429 (`DAILY_INTERVIEW_LIMIT_REACHED`) |
| **Interview Answer Exchange**| Session | **100 messages** | 5 per minute | AI Interview API | HTTP 400 (`SESSION_MESSAGE_CAP_REACHED`) |

### 2.2 Quota Storage & Atomicity
- **Implementation:** In Phase 2/3, counters are tracked using atomic Firestore increment transactions under `users/{userId}/rateLimits/{operation}` with window expiration timestamps.
- **Production Evolution:** High-volume ingress rate limits transition to **Cloud Armor** (Layer 1) and **Serverless VPC Memorystore for Redis** (Layer 2) for sub-millisecond sliding-window counter evaluation.

---

## 3. Idempotency & Fault Tolerance

Network drops or client retries during expensive operations (such as code evaluation or AI report generation) must not trigger duplicate executions or double billing.

### 3.1 Idempotency Architecture
- **Header:** The frontend generates a unique UUIDv4 `Idempotency-Key` header on all POST requests that trigger submissions or interview starts.
- **Verification Flow:**
  ```
  Client POST /api/v1/codelab/submit
  Headers: Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000
    │
    ├── 1. Backend checks idempotency cache in Firestore / Redis:
    │      key = `idempotency:${uid}:${idempotencyKey}`
    │
    ├── 2. IF key exists and status == 'COMPLETED':
    │      Return cached verdict response immediately (HTTP 200 OK)
    │
    ├── 3. IF key exists and status == 'IN_PROGRESS':
    │      Return HTTP 409 Conflict ("Operation already in progress")
    │
    └── 4. IF key does not exist:
           Set status='IN_PROGRESS' with 60-second TTL -> Execute -> Store result -> Return
  ```

### 3.2 Third-Party Timeout & Exponential Backoff
- **AI Model Provider Failures:** When calling Gemini or OpenAI, the client library wraps requests in an exponential backoff policy:
  - Initial delay: 500 ms
  - Max retries: 2
  - Multiplier: 2.0
  - Jitter: ±20%
- **Circuit Breaker:** If 5 consecutive AI requests time out or fail with HTTP 503 from the upstream provider, the circuit opens for 30 seconds, returning a graceful fallback notice: *"AI interview synthesis is experiencing high upstream demand. Please retry in 1 minute."*

---

## 4. Caching & Content Delivery Strategy

Caching must be carefully segregated to avoid leaking private student solutions or personalized interview reports.

### 4.1 Caching Rules

| Asset Category | Cache Control Header | CDN Caching (Edge) | Browser Caching | Risk Assessment |
|---|---|---|---|---|
| **Static Web Bundles (JS/CSS)** | `public, max-age=31536000, immutable` | Yes | Yes | Zero risk; assets are content-hashed by Vite. |
| **Root HTML (`index.html`)** | `no-cache, no-store, must-revalidate` | No | No | Ensures instant SPA updates on new deployment. |
| **Public Problems Catalog** | `public, max-age=300, s-maxage=3600` | Yes (1 hour) | Yes (5 mins) | Public metadata; fast edge delivery. |
| **Public Topics Catalog** | `public, max-age=600, s-maxage=7200` | Yes (2 hours) | Yes (10 mins) | Stable taxonomy; safe to cache. |
| **Student Profiles & Stats** | `private, no-cache, no-store` | **STRICTLY NO** | **STRICTLY NO** | Contains personal identity; never cache. |
| **Code Submissions & Tests** | `private, no-cache, no-store` | **STRICTLY NO** | **STRICTLY NO** | Contains private student code & answers. |
| **Interview Reports & Messages**| `private, no-cache, no-store` | **STRICTLY NO** | **STRICTLY NO** | Confidential career evaluation; never cache. |

---

## 5. Observability, Alerting & Monitoring

### 5.1 Google Cloud Monitoring Metrics
The platform tracks key performance indicators (KPIs) in Google Cloud Monitoring:

1. **Cloud Run / Functions:**
   - Request count & Latency percentiles (p50, p95, p99).
   - HTTP 4xx and 5xx error rates.
   - Container CPU and memory utilization.
   - Active instance counts and cold start frequency.
2. **Cloud Firestore:**
   - Document reads, writes, and deletes per minute.
   - Query latency per collection.
   - Active point-in-time recovery storage volume.
3. **External Providers (Judge0 & AI):**
   - Upstream response latency.
   - Per-minute token consumption (AI).
   - Execution failure rate (sandbox errors vs user code compilation errors).

### 5.2 Automated Incident Alerts
| Alert Channel | Metric Threshold | Action Required |
|---|---|---|
| **High Error Rate (P1)** | 5xx error rate > 3% for 5 consecutive minutes | Immediate developer on-call notification; inspect Cloud Logging. |
| **Spike in Latency (P2)** | p95 latency > 2,000 ms for 10 minutes | Review database query profiles and upstream provider latency. |
| **Abnormal Cost / Budget (P1)** | Cloud spend exceeds 80% of monthly budget tier | Automated email & webhook to administrators; inspect runaway loops. |
| **Security Failure Spike (P2)** | Auth failure rate > 50 / minute from single IP | Cloud Armor rate-limiting rule triggered; evaluate IP ban. |

---

## 6. Pre-Launch Load Testing Plan

Before opening public registration, the platform must undergo structured load verification using **k6** or **Locust** in the staging environment:

1. **Test Scenario A: Peak Interactive Traffic**
   - 250 virtual users browsing problems, viewing dashboards, updating profiles.
   - Target: 0% 5xx errors; p95 latency < 300 ms.
2. **Test Scenario B: Burst Submission Concurrency**
   - 25 simultaneous code submissions across Python, JavaScript, and C++.
   - Target: Bounded queuing in Judge0 broker; all verdicts resolved within 8 seconds.
3. **Test Scenario C: AI Interview Concurrent Sessions**
   - 10 simultaneous active interview sessions receiving question generations.
   - Target: Token budgets strictly respected; zero timeout errors.

---

## 7. Phase 5 Learning Analytics & Recommendation Workload Controls

### 7.1 Analytics Ingestion & Bounded Reads
To prevent historical data scans from inflating Firestore read billing:
- **Bounded Submission Lookups**: Analytics queries fetch only the user's historical submissions (`where("userId", "==", uid)`), limited to a maximum batch of 100 recent submissions.
- **Feed Event Bounding**: Activity feed items are capped at 20 items per view.
- **Sub-Document Aggregation**: Skill summaries are aggregated in-memory rather than issuing 17 separate database sub-queries.

### 7.2 Multi-Tier Caching
- **Client In-Memory / Local Cache**: Results of `computeStudentAnalytics(uid)` are cached for 15 minutes in browser storage (`nexora_analytics_cache_${uid}`). Repeated page switches between `/dashboard`, `/learning-paths`, and problem views execute in 0ms without hitting Firestore.
- **Invalidation Strategy**: Cache is automatically invalidated when a new submission is completed or an interview answer is evaluated.

### 7.3 Protection Against Compute Flooding
- Rate-limited to max 1 recalculation per 10 seconds per authenticated student.
- Anonymous / unauthenticated callers cannot trigger analytics computation.

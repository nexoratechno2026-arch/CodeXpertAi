# Nexora Platform — Network Architecture & Workload Isolation

> **Document:** `docs/NETWORK_ARCHITECTURE.md`  
> **Status:** Architecture Specification  
> **Target Scope:** Nexora CodeLab & Nexora InterviewAI (Unified Web Application)  
> **Last Updated:** 2026-10-16  

---

## 1. Network Philosophy: Logical Separation vs Actual Network Isolation

A common architectural misconception is assuming that using Firebase services (Authentication, Firestore, Hosting) automatically grants a dedicated private network topology. In reality:

1. **Managed Services Reality:** Firebase Authentication, Cloud Firestore, and Firebase Hosting are globally distributed, multi-tenant Google Cloud services accessible over public HTTPS endpoints. They do not reside inside a customer-managed Virtual Private Cloud (VPC) by default.
2. **Access Control Enforcement:** Isolation between students and data in Firestore is enforced primarily by **Authentication tokens and Firestore Security Rules at Layer 7**, not by Layer 3 IP subnets.
3. **Actual Network Isolation:** True network isolation occurs when:
   - Cloud Run container services are placed behind a **Virtual Private Cloud (VPC)** using a **Serverless VPC Access connector**.
   - Cloud Run ingress is locked to `internal-and-cloud-load-balancing`, blocking all direct internet requests to the `.run.app` URLs.
   - Egress to Google APIs (Firestore, Secret Manager) is routed privately via **Private Google Access** or **Private Service Connect**, never traversing the public internet.
   - Code execution sandboxes run in isolated networks with outbound internet access completely disabled.

---

## 2. Environment Topology (Multi-Project Architecture)

Nexora enforces environment separation at the **Google Cloud Project level**. Both Nexora CodeLab and Nexora InterviewAI coexist in the **same project per environment**:

```
┌─────────────────────────┐   ┌─────────────────────────┐   ┌─────────────────────────┐
│ DEVELOPMENT ENVIRONMENT │   │   STAGING ENVIRONMENT   │   │ PRODUCTION ENVIRONMENT  │
│ GCP Project:            │   │ GCP Project:            │   │ GCP Project:            │
│ `nexora-platform-dev`   │   │ `nexora-platform-staging│   │ `nexora-platform-prod`  │
│                         │   │                         │   │                         │
│ ├── Local Emulators     │   │ ├── Pre-prod Testing    │   │ ├── Live Student Data   │
│ ├── Dev Firestore       │   │ ├── Load & Security Run │   │ ├── Production Rules    │
│ └── Test Seed Data      │   │ └── Staging Deployments │   │ └── Cloud Armor Active  │
└─────────────────────────┘   └─────────────────────────┘   └─────────────────────────┘
```

> [!IMPORTANT]
> **No Per-Module Projects:** We do **NOT** create separate Firebase projects for CodeLab and InterviewAI. They share user profiles, skill trees, and authentication state. Separation is maintained across lifecycle environments (Dev, Staging, Prod), never across product modules.

---

## 3. Ingress Pathways & Traffic Flow

### 3.1 Production Ingress Flow

```
[Student Browser / Client]
         │
         │ HTTPS / TLS 1.3
         ▼
[Google Front End (GFE) / Global Edge Points of Presence]
         │
         ├──► Static Assets & SPA Router (Firebase Hosting / Cloud CDN)
         │
         └──► Dynamic API Requests (/api/v1/*)
                   │
                   ▼
         [Global External Application Load Balancer]
                   │
                   ├──► Evaluates Cloud Armor Security Policies (WAF & Rate Limits)
                   │
                   ▼ (Serverless Network Endpoint Group)
         [Cloud Run Backend Services]
           (Ingress locked to: 'internal-and-cloud-load-balancing')
```

### 3.2 Ingress Control Configuration
To enforce that all API requests pass through the Load Balancer and Cloud Armor:
```bash
# Production Ingress Lockdown
gcloud run services update nexora-api \
  --ingress internal-and-cloud-load-balancing \
  --region asia-south1 \
  --project nexora-platform-prod
```
*Effect:* Any attempt to call `https://nexora-api-xxxx-as.a.run.app` directly from the internet returns an immediate HTTP 403 Forbidden.

---

## 4. Workload Separation & Microservice Topology

To ensure high availability, prevent CPU starvation, and isolate execution boundaries, the application runtime is divided into three isolated workloads:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ CUSTOMER-MANAGED VPC NETWORK (`nexora-vpc-prod`)                                │
│                                                                                 │
│   ┌────────────────────────────────────────────────────────┐                    │
│   │ Serverless VPC Access Connector (`vpc-connector-prod`)  │                    │
│   │ Subnet: 10.8.0.0/28 (Allocated IP range for Cloud Run)  │                    │
│   └──────────────────────────┬─────────────────────────────┘                    │
│                              │                                                  │
│         ┌────────────────────┼────────────────────┐                             │
│         │ Private Egress     │ Private Egress     │ Private Egress              │
│         ▼                    ▼                    ▼                             │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                     │
│  │ WORKLOAD 1:  │     │ WORKLOAD 2:  │     │ WORKLOAD 3:  │                     │
│  │ General Web  │     │ AI Interview │     │ Code Broker  │                     │
│  │ API Service  │     │ Orchestrator │     │ & Submissions│                     │
│  └──────┬───────┘     └──────┬───────┘     └──────┬───────┘                     │
│         │                    │                    │                             │
│         │                    │                    │ Dispatches                  │
│         │                    │                    ▼                             │
│         │                    │             ┌──────────────┐                     │
│         │                    │             │ Judge0       │                     │
│         │                    │             │ Sandboxed    │                     │
│         │                    │             │ Execution    │                     │
│         │                    │             │ (No Internet)│                     │
│         │                    │             └──────────────┘                     │
│         │                    │                                                  │
│         ▼                    ▼                                                  │
│  ┌────────────────────────────────────────────────────────┐                     │
│  │ PRIVATE SERVICE CONNECT / PRIVATE GOOGLE ACCESS        │                     │
│  │ ├── Cloud Firestore (Encrypted Database Egress)        │                     │
│  │ ├── Cloud Secret Manager (API Key Egress)              │                     │
│  │ └── Cloud Logging & Audit Trails                       │                     │
│  └────────────────────────────────────────────────────────┘                     │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 4.1 Workload 1: General Web & Profile API
- **Purpose:** Serve profile updates, problem catalog browsing, topic listings, and dashboard aggregation.
- **Resource Sizing:** 0.5 vCPU, 256 MB RAM, concurrency: 80.
- **Scaling:** Scales rapidly to handle spiky web traffic; minimum instances: 0 (cold start ~1.5s) or 1 for production.
- **IAM Identity:** `sa-web-api@nexora-platform-prod.iam.gserviceaccount.com`
- **Permissions:** Read/Write on `users`, `topics`, `learningPaths`. No access to AI API keys.

### 4.2 Workload 2: AI Interview Orchestrator
- **Purpose:** Generate questions, conduct conversational follow-ups, synthesize rubric evaluations.
- **Resource Sizing:** 1.0 vCPU, 512 MB – 1 GB RAM, concurrency: 5 (CPU-intensive stream processing), timeout: 120s.
- **Scaling:** Bounded autoscaling (max 10 instances) to prevent runaway third-party API spend.
- **IAM Identity:** `sa-ai-orchestrator@nexora-platform-prod.iam.gserviceaccount.com`
- **Permissions:** Read/Write on `interviewSessions`, Read on `interviewTemplates` and `adminConfig/prompts`, Secret Manager Accessor for `AI_PROVIDER_API_KEY`.

### 4.3 Workload 3: Code Execution Broker
- **Purpose:** Validate student code, fetch private test cases, dispatch execution requests to Judge0 sandbox, compute pass/fail verdicts.
- **Resource Sizing:** 1.0 vCPU, 512 MB RAM, concurrency: 10, timeout: 30s.
- **Isolation:** Never runs student code locally. Dispatches payload to Judge0 API over TLS.
- **IAM Identity:** `sa-code-broker@nexora-platform-prod.iam.gserviceaccount.com`
- **Permissions:** Read on `problems` & `testCases` (including private cases), Write on `submissions`, Secret Manager Accessor for `JUDGE0_API_KEY`.

---

## 5. Architectural Comparison: Baseline vs Production Option

To avoid overengineering during Phase 2 while providing a clear production roadmap, we establish two architectural tiers:

| Dimension | Baseline Tier (Developer / Lean Launch) | Production Tier (Hardened Enterprise) |
|---|---|---|
| **Edge Ingress** | Firebase Hosting CDN directly to Cloud Run HTTPS URLs | Global External Application Load Balancer with Cloud Armor WAF |
| **DDoS Mitigation** | Google Cloud standard infrastructure DDoS protection | Cloud Armor Advanced DDoS mitigation & adaptive Layer 7 protection |
| **WAF & Threat Intel** | Application-level sanitization & Zod schema validation | Cloud Armor preconfigured OWASP Core Rule Sets & IP threat reputation |
| **Rate Limiting** | Application-level in-memory / Firestore counters | Edge-enforced rate limiting per IP (120 req/min general, 10 req/min auth) |
| **Ingress Lockdown** | Cloud Run services accept public traffic (`--ingress all`), authenticate via JWT | Cloud Run ingress set to `--ingress internal-and-cloud-load-balancing` |
| **VPC & Private Egress** | Direct public egress to Google APIs over TLS | Serverless VPC Access connector + Private Google Access |
| **Monthly Fixed Cost** | **$0.00** (Pure pay-as-you-go; completely within free tier initially) | **~$25 - $45 / month** (Forwarding rules, Cloud Armor policies, VPC connector) |
| **Operational Overhead** | Minimal; single `firebase deploy` workflow | Moderate; requires Terraform or GCP networking management |
| **Recommended Timing** | **Phase 2 & Phase 3 Development & MVP** | **Phase 6 Production Go-Live** |

---

## 6. Implementation Guidance for Phase 2

For Phase 2, the platform is deployed using the **Baseline Tier**:
1. All client assets are served from Firebase Hosting.
2. APIs authenticate via Firebase Authentication JWTs attached to HTTP requests.
3. Client attestation is supported via Firebase App Check (reCAPTCHA Enterprise).
4. Code execution and AI calls are isolated logically in backend services.
5. **No billable VPC connectors or Cloud Armor policies are provisioned in Phase 2**, preserving cost efficiency until production deployment authorization is granted.

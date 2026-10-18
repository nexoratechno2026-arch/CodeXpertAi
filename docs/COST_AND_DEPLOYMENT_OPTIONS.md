# Nexora Platform — Cost Modeling & Deployment Tiers

> **Document:** `docs/COST_AND_DEPLOYMENT_OPTIONS.md`  
> **Status:** Financial Analysis & Architecture Tiering  
> **Target Scope:** Nexora CodeLab & Nexora InterviewAI (Unified Web Application)  
> **Last Updated:** 2026-10-16  

---

## 1. Executive Cost & Deployment Overview

Deploying an enterprise-grade cloud architecture requires balancing **security hardening** against **operational budget**. In accordance with Nexora Techno’s engineering policies:
- No billable Google Cloud infrastructure may be provisioned without explicit authorization.
- We establish two transparent deployment tiers:
  1. **Baseline Tier (Lean Developer / MVP Launch):** Maximizes Google Cloud and Firebase free allowances, operating at near-zero fixed cost while enforcing strict Layer 2 and Layer 3 security controls.
  2. **Production Tier (Hardened Enterprise):** Incorporates Layer 1 edge networking (Cloud Armor, Global Load Balancer, VPC connectors) for high-scale enterprise defense.

---

## 2. Deployment Architecture Tiers

### 2.1 Tier A: Baseline (Developer / Lean Launch)

```
[Internet] ──► [Firebase Hosting Edge CDN] ──► [Client Browser]
                       │
                       │ Direct Authenticated HTTPS (JWT + App Check)
                       ▼
             [Cloud Run / Cloud Functions]
             ├── Ingress: All (Open with JWT verification)
             ├── Secrets in Secret Manager
             └── App Check Attestation Enforced
                       │
                       ▼
             [Cloud Firestore Managed Store]
             └── Protected by Security Rules (Auth UID ownership)
```

- **Core Components:**
  - Frontend: Firebase Hosting (Global CDN, automated SSL).
  - API & Logic: Cloud Functions 2nd Gen / Cloud Run with direct HTTPS ingress.
  - Database: Cloud Firestore (Default database, Multi-region).
  - Auth: Firebase Authentication (Email/Password).
  - Security: Firebase App Check (reCAPTCHA Enterprise), Zod schema validation, Firestore Security Rules.
- **Cost Profile:** **$0.00 – $5.00 / month** (Almost completely within Google Cloud free tier during development and initial pilot).
- **Strengths:** Rapid iteration, automated deployments, zero idle costs, no networking maintenance.
- **Limitations:** Relies on Google’s standard infrastructure DDoS mitigation; lacks custom Cloud Armor WAF rules; Cloud Run endpoints accept direct HTTPS requests (relying on software token validation).

---

### 2.2 Tier B: Production (Hardened Enterprise)

```
[Internet] ──► [Global External Application Load Balancer]
                       │
                       ▼
             [Google Cloud Armor WAF Policy]
             ├── Layer 7 DDoS Mitigation & IP Rate Limiting
             └── Preconfigured OWASP Core Rule Sets
                       │
                       ▼ (Serverless Network Endpoint Group)
             [Cloud Run Services]
             ├── Ingress: internal-and-cloud-load-balancing (Locked down)
             └── Connected to Serverless VPC Access Connector
                       │
                       ▼ (Private Google Access via VPC)
             [Cloud Firestore / Secret Manager / Cloud Logging]
```

- **Core Components:**
  - Ingress: Global External Application Load Balancer with Anycast IP.
  - Perimeter WAF: Cloud Armor Standard/Plus with adaptive rate limiting and threat intelligence.
  - API & Logic: Cloud Run with ingress restricted to `internal-and-cloud-load-balancing`.
  - Network: Dedicated VPC (`nexora-vpc-prod`) with Serverless VPC Access connector.
  - Secrets: Cloud Secret Manager with automated rotation.
  - Backups: Continuous PITR + Daily Multi-Region Cloud Storage exports.
- **Cost Profile:** **~$28.00 – $65.00 / month base fixed cost** + usage-based compute/AI fees.
- **Strengths:** Complete perimeter defense; drops abusive botnets at Google’s edge before hitting application containers; total network lockdown of Cloud Run endpoints.
- **Limitations:** Fixed monthly infrastructure costs regardless of traffic; requires GCP networking administration.

---

## 3. Itemized Monthly Cost Modeling Across Traffic Scales

The following financial estimates model total platform operating costs across three distinct adoption stages:

### Scale 1: Initial Pilot (0 – 500 Active Students)
*Characteristics: ~1,500 problems solved/month, ~200 mock interviews/month.*

| Service | Usage Profile | Baseline Tier Cost | Production Tier Cost |
|---|---|---|---|
| **Firebase Hosting** | 10 GB bandwidth, 0.5 GB storage | $0.00 (Free Tier) | $0.00 (Free Tier) |
| **Firebase Auth** | 500 MAU | $0.00 (Free up to 50k) | $0.00 (Free up to 50k) |
| **Cloud Firestore** | 30k reads/day, 5k writes/day, 1 GB storage | $0.00 (Free Tier) | $0.00 (Free Tier) |
| **Cloud Run / Functions**| 50,000 invocations, 20k vCPU-seconds | $0.00 (Free Tier) | $0.00 (Free Tier) |
| **Global Load Balancer** | 1 Forwarding Rule, 5 GB egress | Not provisioned ($0) | ~$18.50 / month |
| **Cloud Armor** | 1 Security Policy, 5 rules | Not provisioned ($0) | ~$5.00 / month |
| **VPC Access Connector** | 2 e2-micro instances | Not provisioned ($0) | ~$8.00 / month |
| **Judge0 API (Code)** | ~1,500 executions (Self-hosted or SaaS basic) | $10.00 / month | $10.00 / month |
| **AI Model API (Gemini)**| ~200 interviews × ~15k tokens = 3M tokens | ~$1.50 / month | ~$1.50 / month |
| **Total Estimated Cost** | | **~$11.50 / month** | **~$43.00 / month** |

---

### Scale 2: Growing Platform (2,500 – 10,000 Active Students)
*Characteristics: ~50,000 problems solved/month, ~5,000 mock interviews/month.*

| Service | Usage Profile | Baseline Tier Cost | Production Tier Cost |
|---|---|---|---|
| **Firebase Hosting** | 150 GB bandwidth | ~$2.00 | ~$2.00 |
| **Firebase Auth** | 5,000 MAU | $0.00 (Free Tier) | $0.00 (Free Tier) |
| **Cloud Firestore** | 400k reads/day, 80k writes/day, 10 GB storage | ~$8.50 | ~$8.50 |
| **Cloud Run / Functions**| 1.2M invocations, 500k vCPU-sec, 250k GB-sec | ~$12.00 | ~$12.00 |
| **Global Load Balancer** | 1 Forwarding Rule + 150 GB traffic | Not provisioned ($0) | ~$22.00 |
| **Cloud Armor** | 1 Policy, 10 rules + 2M requests evaluated | Not provisioned ($0) | ~$6.50 |
| **VPC Access Connector** | 2 e2-standard-2 instances | Not provisioned ($0) | ~$16.00 |
| **Judge0 API (Code)** | ~50,000 executions (Self-hosted Cloud Run) | ~$35.00 | ~$35.00 |
| **AI Model API (Gemini)**| ~5,000 interviews × ~15k tokens = 75M tokens | ~$37.50 | ~$37.50 |
| **Total Estimated Cost** | | **~$95.00 / month** | **~$139.50 / month** |

---

### Scale 3: High-Scale Campus & Enterprise (50,000+ Students)
*Characteristics: ~1,000,000 problems solved/month, ~50,000 mock interviews/month.*

| Service | Primary Cost Drivers | Estimated Monthly Cost |
|---|---|---|
| **Edge & Network (Prod)** | Load Balancer, Cloud Armor WAF, multi-region CDN egress | ~$75.00 |
| **Cloud Run (Compute)** | Autoscaled microservices handling high concurrency | ~$180.00 |
| **Cloud Firestore** | High read/write throughput with PITR continuous backup | ~$120.00 |
| **Judge0 Sandbox Fleet** | Dedicated GKE / Cloud Run sandbox cluster | ~$220.00 |
| **AI Model Tokens** | 750M tokens (Gemini 2.0 Flash / OpenAI batch) | ~$350.00 |
| **Total Estimated Cost** | | **~$945.00 / month** |

---

## 4. Formal Decision Gates & Approval Process

To enforce technical credibility and financial discipline, the transition between tiers follows strict authorization gates:

```
┌────────────────────────┐
│ PHASE 2 & 3: DEV / MVP │ ──► Deploy on BASELINE TIER ($0 fixed)
└───────────┬────────────┘     • Firebase Hosting + Cloud Run direct
            │                  • Strict Firestore Rules & Zod validation
            ▼
┌────────────────────────┐
│ PHASE 5: PRE-LAUNCH    │ ──► DECISION GATE 1: Security Audit & k6 Load Test
└───────────┬────────────┘     • Measure real latency and API failure rates
            │                  • Verify budget approval from Nexora Techno
            ▼
┌────────────────────────┐
│ PHASE 6: PRODUCTION    │ ──► PROVISION PRODUCTION TIER (~$30–$45/mo fixed)
└────────────────────────┘     • Provision Global Load Balancer & Cloud Armor
                               • Lockdown Cloud Run ingress to internal
                               • Enable continuous 7-day PITR on Firestore
```

> [!CAUTION]
> **No Autonomous Billable Actions:**  
> The agent and development team will **never** enable billable Load Balancer forwarding rules, provision Cloud Armor policies, purchase domain names, or scale third-party API quotas without explicit, documented user authorization.

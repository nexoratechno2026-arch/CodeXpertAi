# Phase 10: Post-Launch Monitoring & Operational Health Protocols

## 1. Monitoring Windows & Observability Cadence

Following production release, engineering will observe platform health across 3 distinct operational windows:

- **Window 1 (T+0 to T+2 Hours) — Active Hypercare**:
  - Live observation of Cloud Functions invocation logs.
  - Real-time error rate tracking in Google Cloud Error Reporting.
  - Active verification of user registrations and code execution verdicts.
- **Window 2 (Day 1 to Day 7) — Stabilization**:
  - Daily review of Firestore read/write quota consumption.
  - Review of daily and weekly challenge rotation stability.
  - Analysis of UAT feedback and early bug reports.
- **Window 3 (Week 2 onwards) — Ongoing Steady-State**:
  - Weekly review of compute costs and AI model token consumption.
  - Monthly capacity and quota reviews against active student growth.

---

## 2. Key Operational Health Metrics

| Metric | Normal Operating Baseline | Warning Threshold | Critical Incident Threshold |
| :--- | :---: | :---: | :---: |
| **HTTP 5xx Error Rate** | < 0.1% | > 1.0% | > 3.0% (Trigger SEV-1) |
| **Code Execution Latency (P95)** | < 1,500 ms | > 3,500 ms | > 6,000 ms (Degraded) |
| **AI Evaluation Latency (P95)** | < 3,000 ms | > 7,000 ms | > 15,000 ms (Timeout risk) |
| **Daily Invocations Surge** | Baseline $\pm$ 20% | + 100% baseline | + 300% (Runaway check) |
| **Auth Failures** | < 0.5% | > 2.0% | > 5.0% (Auth outage) |

---

## 3. Daily Health Verification Script / Checklist

Operations engineers will perform the following daily check:
1. Verify Google Cloud Console shows zero unhandled Cloud Function crashes.
2. Verify daily challenge rotated at 00:00 UTC without manual intervention.
3. Check billing dashboard to confirm cumulative monthly spend tracks within budget.
4. Verify no unresolved high-priority student feedback tickets.

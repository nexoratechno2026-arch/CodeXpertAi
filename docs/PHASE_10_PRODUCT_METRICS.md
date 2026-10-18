# Phase 10: Product Success Metrics & Privacy-Conscious Measurement Plan

## 1. Measurement Philosophy & Student Privacy

Nexora CodeLab + Nexora InterviewAI measures product success strictly through genuine academic outcomes:
- **No Vanity Metrics**: We do not track misleading click counters, inflated dwell times, or fabricated placement numbers.
- **Privacy By Design**: No third-party ad trackers, cross-site cookies, or surveillance telemetry are installed.
- **Anonymized Aggregation**: All cohort analytics are aggregated without exposing individual student emails or identifiable source code.

---

## 2. Product Metric Definitions

| Metric ID | Metric Name | Definition & Business Meaning | Primary Data Source | Calculation Method | Privacy Handling | Collection Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **MET-01** | **Verified Problem Solves** | Total unique problems solved with 100% test case pass rate. | Firestore `/submissions` | Count of unique `problemId` records where `verdict === 'accepted'`. | Aggregated across cohort; raw code never logged. | **ACTIVE** |
| **MET-02** | **Interview Completion Rate** | Percentage of initialized interview sessions that reach full scorecard generation. | Firestore `/interviewSessions` | $\frac{\text{Completed Sessions}}{\text{Configured Sessions}} \times 100$ | Only status metadata collected; answers remain private. | **ACTIVE** |
| **MET-03** | **Daily Challenge Participation** | Daily active candidates completing the designated UTC daily problem. | Firestore `/users/{uid}/challengeCompletions` | Unique user IDs completing challenge within active 24h window. | Count only; candidate names anonymized in stats. | **ACTIVE** |
| **MET-04** | **Consistency Retention (7-Day Streak)** | Candidates maintaining active learning consistency across $\ge 7$ consecutive days. | Firestore `/users/{uid}/gamification` | Count of candidates with `currentStreak >= 7`. | Anonymized user count. | **ACTIVE** |
| **MET-05** | **Execution Provider Reliability** | Percentage of sandbox code executions returning valid verdicts within SLA (< 2,000 ms). | Cloud Functions execution logs | $\frac{\text{Successful Invocations}}{\text{Total Invocations}} \times 100$ | Redacted execution logs without user code. | **READY (Staging)** |
| **MET-06** | **AI Evaluation Latency** | Time required to compile interview report and category rubric scores. | Cloud Functions execution logs | P50, P90, P99 duration from answer submission to report creation. | Latency metadata only. | **READY (Staging)** |
| **MET-07** | **Cost Per Active Candidate** | Monthly infrastructure and provider spend divided by monthly active students. | Google Cloud Billing & Provider Statements | $\frac{\text{Total Cloud & Provider Invoices}}{\text{Monthly Active Students (MAS)}}$ | Internal engineering metric only. | **READY (Post-Billing)** |

---

## 3. Transparency & Integrity Standards

1. **No Fake Dashboard Data**: All metrics displayed on student dashboards reflect authentic database records. Zero accounts have simulated numbers or mock rankings injected into live views.
2. **No Unsupported Placement Claims**: The product is an engineering practice tool designed for skill calibration. We make zero unsubstantiated employment guarantees.

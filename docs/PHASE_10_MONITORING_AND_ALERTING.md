# Phase 10: Production Observability, Monitoring & Alerting Strategy

## 1. Overview & Architecture

To maintain high availability and rapid incident detection for Nexora CodeLab + Nexora InterviewAI, observability is structured into 4 layers:
1. **Client-Side Exception Telemetry**: React Error Boundary traps and structured client error logs.
2. **Serverless Function Observability**: Google Cloud Logging structured payloads with request IDs and caller hashes.
3. **Third-Party Provider Health Monitoring**: Health check wrappers monitoring latency and availability of Judge0 and AI model providers.
4. **Cloud Cost & Quota Monitoring**: Proactive Google Cloud budget alerts.

---

## 2. Structured Log Hygiene Rules

Logs must strictly maintain student data privacy:
- **FORBIDDEN IN LOGS**: Passwords, auth tokens, raw source code payloads, private test cases, candidate interview answers, and full API secret strings.
- **MANDATORY IN LOGS**: Timestamp (`ISO 8601`), Request ID, Function Name, Operation Type (`run` | `submit` | `evaluate`), Duration (`ms`), Status Code, and Redacted Error Message.

```json
{
  "severity": "INFO",
  "timestamp": "2026-10-17T12:00:00.000Z",
  "requestId": "req_8f9a2b",
  "function": "executeCode",
  "userIdHash": "sha256_e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "problemId": "prob-two-sum",
  "language": "python",
  "durationMs": 420,
  "verdict": "accepted",
  "isMock": false
}
```

---

## 3. Recommended Monitoring & Alerting Setup

*(Integration Status: **BLOCKED** on Firebase Blaze Plan & Production Cloud Console access)*

When the Blaze Plan is authorized, configure the following Google Cloud Monitoring alert policies:

| Alert Policy Name | Trigger Condition | Evaluation Window | Notification Channel | Severity |
| :--- | :--- | :---: | :--- | :---: |
| **High Function Error Rate** | Error count > 5% of total invocations | 5 minutes | Email / PagerDuty / Slack | **P1** |
| **Execution Latency Spike** | 95th percentile latency > 5,000 ms | 10 minutes | Engineering Slack | **P2** |
| **Runaway Function Invocations** | Invocations > 1,000 / minute | 3 minutes | Engineering Lead SMS | **P0** |
| **Budget Consumption Threshold** | Total monthly spend reaches 50%, 80%, 100% | Real-time | Financial Owner Email | **P1** |
| **Provider Auth Failure** | HTTP 401/403 from Judge0 or Gemini | Immediate (1 event) | Infrastructure Admin | **P0** |

---

## 4. Setup Instructions for Production Launch

1. Open Google Cloud Console -> **Monitoring** -> **Alerting**.
2. Click **Create Policy** -> Select metric `cloudfunctions.googleapis.com/function/execution_count`.
3. Set filter `status != 'ok'`.
4. Configure threshold `Condition: is above 5% for 5 minutes`.
5. Add notification channels (Ops email, Slack webhook).
6. Save policy as `Nexora-CloudFunctions-ErrorRate-Alert`.

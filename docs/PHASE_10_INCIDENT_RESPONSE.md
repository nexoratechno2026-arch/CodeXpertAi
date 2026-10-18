# Phase 10: Operational Incident Response Playbooks

**Document Version**: 1.0.0  
**Severity Levels**:
- **SEV-1 (Critical)**: Whole platform outage, student data breach, or runaway cost spike. Response within 15 minutes.
- **SEV-2 (Major)**: Core feature unavailable (e.g. Code execution down or AI interviews failing). Response within 1 hour.
- **SEV-3 (Moderate)**: Degraded non-blocking component (e.g. Leaderboard sync delayed). Response within 4 hours.

---

## Playbook 1: Authentication Failures & Account Lockouts
- **Symptoms**: Students receive "auth/network-request-failed", "auth/internal-error", or sudden 401s on login.
- **Action Steps**:
  1. Check Google Cloud Status Dashboard (`status.cloud.google.com`) for Firebase Auth regional incidents.
  2. Inspect browser network console for CORS errors or domain mismatch.
  3. Verify Firebase Auth domain authorized domains list in Firebase Console -> Auth -> Settings -> Authorized Domains.
  4. Ensure client system time is synchronized (NTP drift can invalidate JWT tokens).

---

## Playbook 2: Firestore Permission & Security Rule Failures
- **Symptoms**: Students see "Missing or insufficient permissions" on valid pages.
- **Action Steps**:
  1. Inspect `firestore.rules` commit history to identify recent changes.
  2. Check Firebase Console -> Firestore -> Rules Monitor for rejected query paths.
  3. If a bad rule was deployed, execute immediate rollback:
     ```bash
     firebase deploy --only firestore:rules
     ```
  4. Verify that requests include expected JWT claims (`request.auth.uid`).

---

## Playbook 3: AI Model Provider Outages (Gemini / OpenAI)
- **Symptoms**: Interview evaluations hanging or returning HTTP 500/503.
- **Action Steps**:
  1. Check AI Provider public status dashboard.
  2. Verify secret validity in Secret Manager (`AI_PROVIDER_API_KEY`).
  3. Check Cloud Functions logs for quota exhaustion (HTTP 429).
  4. If provider outage exceeds 15 minutes, enable deterministic mock evaluation fallback in `interviewBroker.ts` to maintain student practice availability with transparency disclaimers.

---

## Playbook 4: Code Execution Sandbox Outages (Judge0)
- **Symptoms**: CodeLab "Run" and "Submit" operations fail with execution timeouts.
- **Action Steps**:
  1. Test Judge0 API endpoint directly with an admin cURL health check.
  2. Verify Judge0 subscription and quota balance.
  3. Inspect Cloud Functions logs for network latency.
  4. In `executionBroker.ts`, fallback automatically activates to simulated local execution mode with honest `isMockExecution: true` metadata.

---

## Playbook 5: Unexpected Billing Increases / Runaway Spikes
- **Symptoms**: Budget alert email triggered (> 80% or 100% threshold).
- **Action Steps**:
  1. Immediately inspect Google Cloud Cost Management -> Billing Reports -> Group by Service.
  2. Identify runaway component (typically un-throttled Cloud Functions invocations or excessive Firestore reads).
  3. Apply emergency capacity limiter:
     - Set Cloud Functions `maxInstances: 2` in `index.ts`.
     - Deploy immediately: `firebase deploy --only functions`.
  4. Check for automated scraping bots or script loops.

---

## Playbook 6: Suspected Data Exposure or Security Incident
- **Symptoms**: Suspicious query pattern or report of cross-user data visibility.
- **Action Steps**:
  1. Immediately deploy lock-down emergency Firestore rules denying write operations.
  2. Revoke active user sessions in Firebase Auth Console.
  3. Rotate all third-party API credentials (`firebase functions:secrets:set`).
  4. Audit Cloud Logging query records to identify exact scope of exposed documents.
  5. Prepare transparent disclosure to affected users.

---

## Playbook 7: Failed Deployments
- **Symptoms**: `firebase deploy` fails mid-process or production website renders blank/error page.
- **Action Steps**:
  1. Do not re-run failed deploy with forced overrides.
  2. Execute immediate hosting rollback:
     ```bash
     firebase hosting:rollback
     ```
  3. Inspect deployment logs in CI/CD or terminal.
  4. Verify local production build with `npm run build && npm run preview` before retrying.

---

## Playbook 8: Data Corruption or Accidental Deletion
- **Symptoms**: Problem definitions corrupted or user progress records missing.
- **Action Steps**:
  1. Switch platform to read-only maintenance mode via `emergency-rules.json`.
  2. Identify the exact corruption timestamp.
  3. Execute point-in-time restoration or snapshot import via `gcloud firestore import`.
  4. Verify restored collection checksums and re-enable production rules.

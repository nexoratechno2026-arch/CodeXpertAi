# Nexora Platform — Backup, Disaster Recovery & Business Continuity

> **Document:** `docs/BACKUP_AND_DISASTER_RECOVERY.md`  
> **Status:** Operational Procedure & Recovery Runbook  
> **Target Scope:** Nexora CodeLab & Nexora InterviewAI (Unified Web Application)  
> **Last Updated:** 2026-10-16  

---

## 1. Business Continuity Overview

Data integrity and service continuity are paramount for student career trust and institutional compliance. This document establishes the formal recovery targets, backup schedules, and emergency runbooks for the unified platform.

### Target Recovery Objectives

| Metric | Target | Definition | Implementation Mechanism |
|---|---|---|---|
| **RPO (Recovery Point Objective)** | **< 1 Minute** (Continuous)<br>Max 24 Hours (Cold Disaster) | Maximum acceptable data loss window during a disaster event. | Point-in-Time Recovery (PITR) provides microsecond granularity for up to 7 days; daily GCS exports provide immutable secondary backups. |
| **RTO (Recovery Time Objective)** | **< 2 Hours** (Data Restore)<br>< 30 Mins (Code / App) | Maximum acceptable duration to restore platform availability after an outage. | Automated Terraform/CLI restore commands into a new database instance or environment. |

---

## 2. Backup Architecture & Storage Tiers

```
┌────────────────────────────────────────────────────────────────────────┐
│                        BACKUP ARCHITECTURE                             │
│                                                                        │
│  [Cloud Firestore Production Database]                                │
│        │                                                               │
│        ├── Continuous PITR Log Retention (7 Days)                      │
│        │   └── Instantaneous point-in-time restore to any second       │
│        │                                                               │
│        └── Daily Scheduled Export (Cloud Functions + Cloud Scheduler)  │
│              │                                                         │
│              ▼                                                         │
│  [Multi-Region Cloud Storage Bucket]                                   │
│  `gs://nexora-firestore-backups-prod`                                  │
│  ├── Multi-Region: `asia` (or `us`) dual-region redundancy             │
│  ├── Object Versioning: ENABLED (Anti-ransomware protection)           │
│  ├── Object Lifecycle Management:                                      │
│  │   ├── Days 0–14: Standard Storage                                   │
│  │   ├── Days 15–30: Nearline Storage (Reduced cost)                   │
│  │   └── Day 30+: Automatic Deletion                                   │
│  └── IAM: Access restricted to `sa-backup-service@` and Admins         │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Point-in-Time Recovery (PITR)
- **Status:** Standard Google Cloud Firestore feature.
- **Enabling Command:**
  ```bash
  gcloud firestore databases update \
    --point-in-time-recovery-enable \
    --database="(default)" \
    --project=nexora-platform-prod
  ```
- **Capability:** Allows full database restoration to any specific timestamp within the past 7 days, eliminating risk from accidental batch deletes or malicious code mutations.

### 2.2 Scheduled Daily Exports
- **Frequency:** Every night at 02:00 UTC (off-peak hours).
- **Execution Script:** Triggered via Google Cloud Scheduler invoking a secured Cloud Function that calls the Firestore Admin export API:
  ```typescript
  import { v1 } from '@google-cloud/firestore';
  const client = new v1.FirestoreAdminClient();

  export async function executeScheduledBackup() {
    const projectId = process.env.GCP_PROJECT_ID;
    const databaseName = client.databasePath(projectId, '(default)');
    const bucket = `gs://nexora-firestore-backups-prod/${new Date().toISOString().split('T')[0]}`;

    const [response] = await client.exportDocuments({
      name: databaseName,
      outputUriPrefix: bucket,
      collectionIds: [], // All collections
    });
    console.info(`[Backup] Export triggered successfully: ${response.name}`);
  }
  ```

---

## 3. Disaster Scenarios & Emergency Runbooks

### Runbook 1: Accidental Data Corruption or Malicious Deletion
**Scenario:** A software defect, unauthorized script, or human error corrupts or deletes records in `problems` or `users`.

1. **Assess Impact & Halt Mutations:**
   - Temporarily place the web application into maintenance mode by setting `platformConfig/general.maintenanceMode = true`.
2. **Identify Corruption Timestamp:**
   - Review Cloud Audit Logs to determine the exact UTC timestamp of the destructive event (`T_incident`).
3. **Restore Database via PITR:**
   - Execute PITR restore to a timestamp 60 seconds prior to the incident (`T_incident - 60s`):
     ```bash
     gcloud firestore databases restore \
       --source-database="(default)" \
       --destination-database="restored-db" \
       --restore-time="2026-10-16T14:30:00Z" \
       --project=nexora-platform-prod
     ```
4. **Data Verification:**
   - Inspect `restored-db` using the Firebase Console or Admin SDK scripts to verify data consistency.
5. **Switch Traffic & Resume Operations:**
   - Update Cloud Run environment configuration to point to the restored database, or promote the restored database to default.
   - Disable maintenance mode.

---

### Runbook 2: Regional Cloud Outage (High-Availability Failover)
**Scenario:** A major infrastructure disruption impacts the primary GCP region (`asia-south1`).

1. **Storage Protection:**
   - Cloud Firestore multi-region configurations automatically maintain synchronous copies across multiple geographical zones within the region.
2. **Compute Re-Routing:**
   - Cloud Run is a regional service. In the event of total regional outage, execute the deployment script targeting the secondary paired region (`asia-southeast1`):
     ```bash
     gcloud run deploy nexora-api \
       --image=gcr.io/nexora-platform-prod/api:latest \
       --region=asia-southeast1 \
       --project=nexora-platform-prod
     ```
3. **Update Load Balancer NEG:**
   - Attach the new regional Serverless Network Endpoint Group to the Global Application Load Balancer backend service.
   - Global Load Balancer reroutes incoming global student traffic within 3–5 minutes.

---

### Runbook 3: Compromised Service Account or Leaked Credentials
**Scenario:** A developer mistakenly commits a service account key or third-party API key to a public repository.

1. **Immediate Revocation (Within 15 Minutes):**
   - **For GCP Service Account Keys:**
     ```bash
     # List active keys
     gcloud iam service-accounts keys list --iam-account=sa-compromised@nexora-platform-prod.iam.gserviceaccount.com
     # Delete compromised key immediately
     gcloud iam service-accounts keys delete KEY_ID --iam-account=sa-compromised@...
     ```
   - **For AI API Keys / Judge0 Keys:**
     - Log in to the provider dashboard (Google AI Studio / OpenAI / Judge0) and click **Revoke Key**.
2. **Generate New Credentials in Secret Manager:**
   - Generate a replacement key and push as a new version in Secret Manager:
     ```bash
     echo -n "new_secret_value" | gcloud secrets versions add AI_PROVIDER_API_KEY --data-file=-
     ```
3. **Container Restart:**
   - Restart Cloud Run instances to pick up the latest secret version:
     ```bash
     gcloud run services update nexora-api --update-env-vars=SECRET_VERSION=v2
     ```
4. **Audit Scope of Breach:**
   - Inspect Cloud Audit Logs for all API calls made by the compromised identity during the exposure window.

---

## 4. Periodic Verification & Testing Schedule

Backups that have not been tested for restoration are not valid backups. Nexora mandates structured disaster recovery drills:

| Drill Frequency | Verification Procedure | Success Criteria |
|---|---|---|
| **Monthly** | Restore latest daily export into the staging environment (`nexora-platform-staging`). | Verify record count in `users` and `problems` matches production within 0.1%. |
| **Quarterly** | Execute PITR recovery drill to a temporary database instance. | Verify restoration completes within the 2-hour RTO target. |
| **Semi-Annually** | Simulated credential rotation drill (revoke and re-provision all Secret Manager secrets). | Verify zero downtime during seamless container secret uptake. |

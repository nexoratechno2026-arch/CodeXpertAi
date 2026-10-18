# Phase 10: Backup & Disaster Recovery Architecture

## 1. Overview & Objectives

Nexora stores student profiles, problem submission histories, mock interview scorecards, and learning roadmap states in Google Cloud Firestore.
This document defines the recovery point objective (RPO), recovery time objective (RTO), and operational procedures for database backups and point-in-time recovery.

- **Recovery Point Objective (RPO)**: $\le 1 \text{ hour}$ (using Firestore automated point-in-time recovery) or $\le 24 \text{ hours}$ (using daily exported snapshots).
- **Recovery Time Objective (RTO)**: $\le 2 \text{ hours}$ to restore full platform availability following a catastrophic incident.

---

## 2. Backup Mechanisms

### 1. Point-in-Time Recovery (PITR)
- **Status**: Native Firestore Enterprise feature (available when Blaze plan is active).
- **Retention**: Continuous continuous retention for 7 days.
- **Capability**: Enables granular restoration to any microsecond timestamp within the preceding 7 days, providing complete protection against accidental script deletion or corrupted data migrations.

### 2. Scheduled Daily Cloud Storage Snapshots
Automated daily export of all collections to a dedicated Cloud Storage bucket (`gs://nexora-firestore-backups-${ENV}`):
```bash
gcloud firestore export gs://nexora-firestore-backups-prod \
  --collection-ids='users,problems,submissions,interviewSessions,student_analytics,platformConfig'
```

---

## 3. Disaster Recovery Runbook

### Step 1: Incident Assessment & Read-Only Locking
If data corruption or malicious tampering is suspected:
1. Temporarily deploy restrictive emergency rules to prevent further corrupted writes:
   ```bash
   firebase deploy --only firestore:rules --config emergency-rules.json
   ```
2. Notify the team and initiate an incident channel.

### Step 2: Restore from Export Snapshot
To import a verified snapshot into a clean target Firestore instance:
```bash
gcloud firestore import gs://nexora-firestore-backups-prod/2026-10-17T00:00:00/
```

### Step 3: Consistency & Integrity Verification
Run verification scripts to ensure:
- User count matches pre-incident baseline.
- Submission IDs and problem mappings remain intact.
- Firestore security rules are reinstated to standard production enforcement.

### Step 4: Resume Platform Operations
1. Re-deploy verified production security rules:
   ```bash
   firebase deploy --only firestore:rules
   ```
2. Verify frontend reads on `/dashboard`, `/codelab/problems`, and `/interview`.
3. Publish incident post-mortem.

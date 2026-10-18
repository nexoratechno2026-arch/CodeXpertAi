# Nexora Platform: Backup, Disaster Recovery & Data Lifecycle Policy

> **Scope:** Cloud Firestore, Firebase Auth, User Profiles, Submissions & Interview History  
> **Target Environment:** GCP Project `nexoratechno-code`  

---

## 1. Cloud Firestore Backup Architecture

Firestore provides two complementary backup strategies within Google Cloud Platform:

```
+-------------------------------------------------------------------+
| Strategy 1: Point-in-Time Recovery (PITR)                         |
| - Continuous change logging up to 7 days in the past.             |
| - Enables microsecond-level restoration to any point in time.     |
| - Ideal for recovering from accidental document corruption.       |
+-------------------------------------------------------------------+
                                  │
+-------------------------------------------------------------------+
| Strategy 2: Scheduled Daily Firestore Export (Cloud Storage)      |
| - Nightly automated export via Cloud Scheduler & Cloud Functions.  |
| - Stored in a dedicated multi-region Cloud Storage backup bucket. |
| - Long-term compliance retention (30 days to 1 year).             |
+-------------------------------------------------------------------+
```

---

## 2. Recovery Objectives (Proposed Targets)

> [!IMPORTANT]
> The following figures represent **proposed operational targets**, not contractual guarantees, until verified through scheduled recovery drill simulations in staging.

| Metric | Proposed Target | Description |
| :--- | :--- | :--- |
| **Recovery Point Objective (RPO)** | **$\le 5$ minutes** (via PITR)<br>**$\le 24$ hours** (via Daily Export) | Maximum acceptable data loss window in the event of an infrastructure catastrophe. |
| **Recovery Time Objective (RTO)** | **$\le 60$ minutes** | Target duration required to restore database state and verify integrity in an authorized recovery environment. |

---

## 3. Scheduled Daily Export & Cost Considerations

### Export Command (GCP Cloud SDK)
```bash
# Automated daily export of core student data collections
gcloud firestore export gs://nexoratechno-firestore-backups/$(date +%Y-%m-%d) \
  --collection-ids='users','problems','submissions','interviewSessions','student_analytics'
```

### Cost Implications
- Firestore export reads are billed at standard Firestore read rates during the export window.
- Cloud Storage storage is billed at Standard / Coldline rates ($\approx \$0.02/\text{GB/month}$).
- **Enabling PITR**: Incurs a minor hourly fee ($\approx \$0.18/\text{GB/month}$) on the database storage volume.
- **Approval Boundary**: Paid backup storage buckets and PITR retention are **pending explicit user authorization** before provisioning in Google Cloud Console.

---

## 4. Restoration & Verification Procedure

A backup cannot be considered valid until a restoration test has succeeded in an isolated verification database:

### Step 1: Create an Isolated Test Database
```bash
gcloud firestore databases create --database=recovery-test-db --location=asia-south1
```

### Step 2: Import Backup Archive
```bash
gcloud firestore import gs://nexoratechno-firestore-backups/2026-10-17 \
  --database=recovery-test-db
```

### Step 3: Integrity Verification
1. Compare total document counts across `users`, `submissions`, and `interviewSessions` against production baseline.
2. Run read queries to verify schema integrity and index structures.
3. Purge `recovery-test-db` once verification is certified.

---

## 5. Data Deletion & Student Retention Lifecycle

Under student privacy guidelines and GDPR/right-to-erasure compliance:

1. **User Account Deletion**:
   - Triggering user deletion permanently purges the Firebase Auth record and user profile document (`/users/{userId}`).
2. **Submissions & Interview Sessions**:
   - Submissions and interview sessions can be anonymized (disassociating `userId`) or permanently deleted according to the student's request.
3. **Derived Skill Analytics**:
   - Purging a student's record removes `/student_analytics/{userId}` completely, leaving zero residual ghost records in the platform.

---

## 6. Safe Application Rollback Procedure

### Frontend Release Rollback (Firebase Hosting)
Firebase Hosting retains release snapshots for every deployment:
```bash
# List previous release versions
firebase hosting:releases:list

# Instantly roll back to previous stable release
firebase hosting:rollback
```

### Firestore Security Rules Rollback
```bash
# Revert firestore.rules to previous Git tag and redeploy
firebase deploy --only firestore:rules
```

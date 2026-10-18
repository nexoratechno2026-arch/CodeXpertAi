# Phase 10: Production Rollback & Emergency Recovery Plan

## 1. Rollback Triggers & Thresholds

Initiate an immediate rollback if any of the following conditions occur within 60 minutes of production release:
1. **Critical Crash Rate**: Client error boundary triggers on > 2% of page sessions.
2. **Authentication Outage**: Students cannot log in or register.
3. **Database Write Failure**: Submissions or interview reports cannot be saved due to permission rejections.
4. **Security Vulnerability**: Report of cross-user data leakage or unauthorized admin access.
5. **Cost Runaway**: Cloud Functions invocations surge unexpectedly exceeding normal hourly limits.

---

## 2. Fast Rollback Procedures

### Hosting Rollback (< 60 seconds)
Firebase Hosting maintains atomic releases with instant rollback capability without rebuilding:

```bash
# Instant rollback to the previous hosting release
firebase hosting:rollback
```

This immediately points production traffic back to the prior stable release artifact across all global CDN edge locations.

### Cloud Functions Rollback (< 3 minutes)
If a backend breaking change occurred in `functions/`:

1. Checkout the previous stable git commit tag:
   ```bash
   git checkout tags/v0.9.0-stable
   ```
2. Build and redeploy the stable functions artifact:
   ```bash
   npm --prefix functions run build
   firebase deploy --only functions
   ```

### Firestore Security Rules Rollback (< 30 seconds)
If a rule regression caused permission denials:

1. Restore previous `firestore.rules` file from git history:
   ```bash
   git checkout HEAD~1 -- firestore.rules
   ```
2. Deploy the verified rules file immediately:
   ```bash
   firebase deploy --only firestore:rules
   ```

---

## 3. Communication & Post-Mortem Sequence

1. **Internal Notification**: Post status alert in incident channel: *"Rollback initiated for v1.0.0 due to [Trigger]. CDN traffic restored to stable release."*
2. **User Notification**: Update platform status banner to reassure students that submitted code and history are intact.
3. **Post-Mortem**: Document root cause, failed test gaps, and preventive measures within 24 hours.

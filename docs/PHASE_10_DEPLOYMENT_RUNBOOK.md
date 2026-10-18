# Phase 10: Production Deployment Runbook

**Stack**: React 18 / Vite / TypeScript / Firebase Hosting / Cloud Functions v2 / Cloud Firestore  
**Prerequisites**: All items in `PHASE_10_RELEASE_CHECKLIST.md` verified; explicit owner authorization received.

---

## 1. Stage A: Staging Preview Channel Deployment

To deploy a non-destructive staging preview channel for pilot student UAT without touching production traffic:

```bash
# 1. Ensure dependencies and type safety
npm run typecheck
npm run test

# 2. Build production assets
npm run build

# 3. Deploy to ephemeral preview channel (expires in 14 days)
firebase hosting:channel:deploy staging-uat-preview --expires 14d
```

Output will provide a secure preview URL (e.g., `https://nexoratechno-code--staging-uat-preview-xxxx.web.app`). Provide this URL to pilot testers along with `PHASE_10_UAT_PLAN.md`.

---

## 2. Stage B: Setting Production Secrets (Serverless Cloud Functions)

*(Requires Firebase Blaze Plan activation)*

Configure production third-party credentials securely in Google Cloud Secret Manager:

```bash
# Set Judge0 code execution provider endpoint & credential
firebase functions:secrets:set JUDGE0_API_URL
# Input: https://judge0-ce.p.rapidapi.com (or your private host)

firebase functions:secrets:set JUDGE0_API_KEY
# Input: [Your secret key]

# Set AI model provider key (Google Gemini or OpenAI)
firebase functions:secrets:set AI_PROVIDER_API_KEY
# Input: [Your secret key]
```

---

## 3. Stage C: Full Production Go-Live Deployment

*(STRICT WARNING: Do NOT execute without explicit owner sign-off)*

When explicit authorization is granted:

```bash
# 1. Clean build of frontend and backend
npm run build
npm --prefix functions run build

# 2. Deploy Firestore database rules and indexes
firebase deploy --only firestore:rules,firestore:indexes

# 3. Deploy backend Cloud Functions
firebase deploy --only functions

# 4. Deploy production hosting
firebase deploy --only hosting
```

---

## 4. Stage D: Post-Deployment Smoke Testing

Immediately after production deployment completes, execute the following smoke verification tests:

1. **Root Load & CDN Check**:
   - Navigate to the production URL. Verify status code 200 and HTTPS certificate valid.
2. **Authentication Flow**:
   - Sign in with a test account. Verify immediate redirect to `/dashboard`.
3. **CodeLab Smoke Test**:
   - Open `/codelab/workspace/prob-two-sum`.
   - Run sample tests. Confirm execution response within 1.5s.
4. **InterviewAI Smoke Test**:
   - Open `/interview/setup`.
   - Start a 1-question behavioral screening.
   - Submit response and confirm report compiles cleanly.
5. **Console & Error Check**:
   - Verify DevTools Console shows 0 fatal uncaught exceptions.

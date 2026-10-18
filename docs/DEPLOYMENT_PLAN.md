# Nexora Platform: Multi-Environment Deployment & Staging Plan

> **Stack:** React 18 SPA + Vite 6 + Firebase Hosting + Cloud Functions v2 + Cloud Firestore  
> **Active GCP Project:** `nexoratechno-code`  

---

## 1. Environment Architecture & Separation

The platform enforces strict separation across three environments:

```
+---------------------+      +---------------------+      +---------------------+
| 1. Local Dev        |      | 2. Staging          |      | 3. Production       |
| - Offline Emulators |      | - GCP Project:      |      | - Dedicated Project |
| - Auth: :9099       | ---> |   nexoratechno-code | ---> | - App Check Enforced|
| - Firestore: :8080  |      | - Internal testing  |      | - Cloud Armor WAF   |
| - Functions: :5001  |      | - Synthetic mocks   |      | - Paid Provider API |
+---------------------+      +---------------------+      +---------------------+
```

---

## 2. Environment Configuration & Variable Matrix

### Client-Side Variables (`.env`)
These are baked into the Vite static build; they identify public project configuration and **contain no server secrets**:

| Variable Name | Staging Value (`nexoratechno-code`) | Purpose |
| :--- | :--- | :--- |
| `VITE_FIREBASE_API_KEY` | `AIzaSyCwf8pcohlNtUhKxfQDEXEwKj0QX8XR4L4` | Firebase Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | `nexoratechno-code.firebaseapp.com` | Auth redirect origin |
| `VITE_FIREBASE_PROJECT_ID` | `nexoratechno-code` | GCP Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | `nexoratechno-code.firebasestorage.app` | Cloud Storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `266167032828` | Cloud Messaging ID |
| `VITE_FIREBASE_APP_ID` | `1:266167032828:web:09839966cd6d2cbed33079` | Web App ID |
| `VITE_APP_NAME` | `Nexora CodeLab` | Platform brand name |
| `VITE_APP_ENV` | `staging` / `production` | Environment flag |
| `VITE_USE_FIREBASE_EMULATORS` | `false` | Emulator toggle |

### Server-Side Secrets (Cloud Functions Secret Manager)
Configured strictly via Google Secret Manager; never present in frontend bundles:
- `JUDGE0_API_URL`: Endpoint for Judge0 code execution.
- `JUDGE0_API_KEY`: Credential for Judge0 RapidAPI / CE broker.
- `AI_PROVIDER_API_KEY`: API key for Google Gemini model generation.

Command to set secrets:
```bash
firebase functions:secrets:set JUDGE0_API_URL
firebase functions:secrets:set JUDGE0_API_KEY
firebase functions:secrets:set AI_PROVIDER_API_KEY
```

---

## 3. Step-by-Step Staging Deployment Procedure

### Step 1: Pre-Deployment Build & Verification
```bash
# 1. Verify TypeScript strict type compilation
npm run typecheck

# 2. Run all 79 automated test suites
npm run test

# 3. Compile Cloud Functions backend
cd functions && npm run build && cd ..

# 4. Generate optimized production frontend build
npm run build
```

### Step 2: Deploy Firestore Rules & Indexes
```bash
# Deploy security rules preventing unauthorized reads/writes
firebase deploy --only firestore:rules,firestore:indexes --project nexoratechno-code
```

### Step 3: Deploy Cloud Functions Backend
```bash
# Deploy isolated execution and interview brokers
firebase deploy --only functions --project nexoratechno-code
```

### Step 4: Deploy Static Web Assets (Firebase Hosting)
```bash
# Deploy SPA bundle to Firebase Hosting CDN
firebase deploy --only hosting --project nexoratechno-code
```

---

## 4. Post-Deployment Smoke Test Protocol

Immediately after deployment to staging, verify the following 7 smoke tests:

1. **Root Redirection**: Navigate to staging URL; landing page renders with zero console errors and `#090909` dark styling.
2. **Auth Gateway**: Create a new test user account; verify authentication session resolves and profile document is created in Firestore.
3. **Dashboard Health**: Navigate to `/dashboard`; verify Learning Overview loads metrics and Skill Map displays without errors.
4. **CodeLab Problem Catalog**: Browse `/codelab/problems`; open `two-sum-indices`; verify Monaco Editor mounts in `vs-dark` theme.
5. **Code Execution Sandbox**: Run code; verify response returns structured test case results with private test cases strictly redacted.
6. **InterviewAI Practice Flow**: Start a Technical Mock Interview; submit an answer; verify diagnostic report renders with category rubrics and AI disclaimer.
7. **Security Isolation**: In an incognito browser window, verify accessing another student's submission URL returns unauthorized or redirected to `/login`.

---

## 5. Instant Rollback Procedure

If a post-deployment smoke test fails:

```bash
# Roll back Firebase Hosting to previous stable release snapshot
firebase hosting:rollback

# If Firestore rules need reversion:
git checkout <previous-stable-tag> -- firestore.rules
firebase deploy --only firestore:rules
```

---

## 6. Strict Boundary Reminders

- **No Public DNS Cutover**: Custom domain binding will only occur after explicit staging sign-off.
- **nexoratechno.in Untouched**: The corporate production domain is completely isolated from this repository.
- **No Domain Purchases**: Built to support upcoming platform domain when approved.

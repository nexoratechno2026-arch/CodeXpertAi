# Nexora CodeLab & InterviewAI — Firebase Setup Guide

> **Status:** Phase 3 — CodeLab Coding Engine & Secure Execution Active  
> **Last Updated:** 2026-10-17

---

## 1. Firebase Project Strategy

A **single dedicated Firebase project** serves both Nexora CodeLab and Nexora InterviewAI. This project is completely separate from any existing Nexora Techno infrastructure.

| Aspect | Detail |
|---|---|
| **Project Name** | To be created (e.g., `nexora-codelab-prod`) |
| **Project ID** | Assigned at creation — do not invent |
| **Region** | To be selected at creation (consider `asia-south1` for India-primary users or `us-central1` for global default) |
| **Billing Plan** | Blaze (pay-as-you-go) — required for Cloud Functions, external network calls |
| **Existing Site** | nexoratechno.in is **not** part of this project |

> [!WARNING]
> Do not create the Firebase project until the team agrees on the project name, region, and billing account. Do not invent project IDs or credentials in code.

---

## 2. Required Firebase Services

### 2.1 Firebase Authentication

**Purpose:** User registration, login, password reset, session management.

**Configuration Steps:**
1. Enable Authentication in the Firebase Console
2. Enable the **Email/Password** sign-in provider
3. Configure password requirements (minimum length, complexity)
4. Configure email verification templates with Nexora branding
5. Configure password reset email templates
6. Optionally evaluate and enable **Google Sign-In** (Phase 2 decision)
7. Set up authorized domains (localhost for dev, production domain when available)

**Custom Claims (Admin Role):**
- Admin status is set via custom claims using the Firebase Admin SDK in Cloud Functions
- Claims are **never** set from the client
- Pattern: `{ role: "admin" }` on the user's auth token
- Security Rules and Cloud Functions check `request.auth.token.role == "admin"` for admin operations

### 2.2 Cloud Firestore

**Purpose:** Primary application database.

**Configuration Steps:**
1. Create Firestore database in the selected region
2. Start in **locked mode** (deny all) and deploy custom Security Rules
3. Deploy composite indexes as defined in `firestore.indexes.json`
4. Configure Firestore Emulator for local development

**Key Decisions:**
- Single database (default) — Firestore named databases are available but add complexity
- Document structure detailed in [DATABASE_SCHEMA.md](file:///e:/Codebase%20Nexoratechno/docs/DATABASE_SCHEMA.md)

### 2.3 Cloud Functions for Firebase (2nd Gen)

**Purpose:** Trusted server-side logic, external API orchestration, admin operations.

**Configuration Steps:**
1. Initialize Cloud Functions with TypeScript: `firebase init functions`
2. Set runtime to Node.js 20
3. Configure function region to match Firestore region
4. Store secrets using `firebase functions:secrets:set`:
   - `JUDGE0_API_URL` — Code execution provider endpoint
   - `JUDGE0_API_KEY` — Code execution provider credential
   - `AI_PROVIDER_API_KEY` — AI model provider credential
5. Configure App Check enforcement on callable functions
6. Set memory/timeout per function based on workload:

| Function Category | Memory | Timeout | Concurrency |
|---|---|---|---|
| Code submission orchestration | 512 MB | 60 s | 10 |
| AI interview orchestration | 512 MB | 120 s | 5 |
| Admin CRUD operations | 256 MB | 30 s | 80 |
| Firestore triggers | 256 MB | 30 s | 80 |

> [!NOTE]
> These are starting estimates. Actual values should be tuned based on load testing in Phase 3+.

### 2.4 Firebase App Check

**Purpose:** Help protect backend resources from unauthorized clients.

**Configuration Steps:**
1. Register the web app in App Check settings
2. Select **reCAPTCHA Enterprise** as the attestation provider for web
3. Obtain reCAPTCHA Enterprise site key from Google Cloud Console
4. Enable App Check enforcement on:
   - Cloud Functions (callable functions)
   - Cloud Firestore
5. Configure the App Check debug provider for local development and CI
6. Add the site key to frontend environment variables (this is a public key, not a secret)

### 2.5 Firebase Hosting

**Purpose:** Deploy the production SPA.

**Configuration Steps:**
1. Initialize Hosting: `firebase init hosting`
2. Set public directory to `dist` (Vite build output)
3. Configure SPA rewrites:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        "source": "index.html",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache, no-store, must-revalidate"
          }
        ]
      }
    ]
  }
}
```

4. Configure custom domain when selected (Phase 2+)

> [!NOTE]
> If Vite's build output or SSR requirements conflict with Firebase Hosting, evaluate alternatives (Vercel, Cloudflare Pages) during Phase 2. Firebase Hosting is the default plan.

---

## 3. Firebase CLI Setup

### 3.1 Prerequisites

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Verify installation
firebase --version

# Login to Firebase
firebase login

# Verify the correct Google account
firebase projects:list
```

### 3.2 Project Initialization

```bash
# Initialize Firebase in the project root (after project creation)
firebase init

# Select services:
# - Firestore
# - Functions
# - Hosting
# - Emulators

# Select the created Firebase project
# Use TypeScript for Functions
# Use default Firestore rules file (firestore.rules)
# Use default Firestore indexes file (firestore.indexes.json)
```

### 3.3 Expected Firebase Configuration Files

After initialization, these files are created:

| File | Purpose |
|---|---|
| `firebase.json` | Main Firebase configuration (hosting, functions, emulators) |
| `.firebaserc` | Project alias mapping |
| `firestore.rules` | Firestore Security Rules |
| `firestore.indexes.json` | Composite index definitions |
| `functions/` | Cloud Functions source directory |
| `functions/package.json` | Functions dependencies |
| `functions/tsconfig.json` | Functions TypeScript configuration |
| `functions/src/index.ts` | Functions entry point |

---

## 4. Firebase Emulator Suite

### 4.1 Emulator Configuration

Add to `firebase.json`:

```json
{
  "emulators": {
    "auth": {
      "port": 9099
    },
    "functions": {
      "port": 5001
    },
    "firestore": {
      "port": 8080
    },
    "hosting": {
      "port": 5000
    },
    "ui": {
      "enabled": true,
      "port": 4000
    }
  }
}
```

### 4.2 Starting Emulators

```bash
# Start all emulators
firebase emulators:start

# Start with data import (to seed test data)
firebase emulators:start --import=./emulator-data

# Export data on shutdown (to preserve test data)
firebase emulators:start --import=./emulator-data --export-on-exit=./emulator-data
```

### 4.3 Connecting the Frontend to Emulators

In the frontend Firebase initialization (`src/lib/firebase.ts`), conditionally connect to emulators:

```typescript
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

const app = initializeApp({
  // Config from environment variables — see .env.example
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
});

const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);

if (import.meta.env.DEV) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099");
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);
}

export { app, auth, db, functions };
```

> [!IMPORTANT]
> Firebase web configuration values (`apiKey`, `authDomain`, etc.) are **not equivalent to server secrets**. They identify the Firebase project to client SDKs and are safe to include in frontend environment variables. However, access is controlled by Security Rules, App Check, and Authentication — not by keeping these values secret. See [SECURITY_PLAN.md](file:///e:/Codebase%20Nexoratechno/docs/SECURITY_PLAN.md) for the full access control strategy.

---

## 5. Frontend Firebase SDK Dependencies

```json
{
  "dependencies": {
    "firebase": "^11.x"
  }
}
```

The modular Firebase v11 SDK supports tree-shaking, so only imported modules are bundled. Use modular imports:

```typescript
// Good — tree-shakeable
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

// Avoid — imports entire library
import firebase from "firebase/app";
```

---

## 6. Cloud Functions Dependencies (Planned)

```json
{
  "dependencies": {
    "firebase-admin": "^13.x",
    "firebase-functions": "^6.x",
    "zod": "^3.x"
  }
}
```

AI provider SDK and Judge0 client will be added in Phase 2 after provider selection.

---

## 7. Deployment Commands

```bash
# Deploy everything
firebase deploy

# Deploy only Firestore rules
firebase deploy --only firestore:rules

# Deploy only indexes
firebase deploy --only firestore:indexes

# Deploy only functions
firebase deploy --only functions

# Deploy only hosting
firebase deploy --only hosting

# Deploy specific function
firebase deploy --only functions:submitCode
```

---

## 8. Environment Configuration

See [`.env.example`](file:///e:/Codebase%20Nexoratechno/.env.example) for the complete list of environment variables.

**Frontend variables** (prefixed `VITE_`):
- Firebase web config values (public, not secrets)
- App Check reCAPTCHA site key (public)

**Cloud Functions secrets** (managed via `firebase functions:secrets:set`):
- `JUDGE0_API_URL` — Code execution endpoint
- `JUDGE0_API_KEY` — Code execution credential
- `AI_PROVIDER_API_KEY` — AI model provider key

> [!CAUTION]
> Never place service-account private keys, AI API keys, Judge0 credentials, or any server secrets in `VITE_` prefixed environment variables. These would be embedded in the client bundle and exposed to all users.

---

## 9. Cost Drivers

| Service | Free Tier | Cost Driver | Estimated Phase 2 Impact |
|---|---|---|---|
| **Authentication** | 50K MAU free | Monthly active users | Low initially |
| **Firestore** | 1 GiB storage, 50K reads/day, 20K writes/day | Reads per problem view, writes per submission | Moderate with growth |
| **Cloud Functions** | 2M invocations/month, 400K GB-seconds | Submissions, AI calls, triggers | Primary cost driver |
| **Hosting** | 10 GB storage, 360 MB/day transfer | Static asset serving | Low |
| **App Check** | reCAPTCHA Enterprise has its own pricing | API calls for attestation | Low |
| **Judge0 Cloud** | Limited free tier | Per-submission execution | Significant at scale |
| **AI Provider** | Varies | Per-token for generation and evaluation | Significant at scale |

> [!IMPORTANT]
> Judge0 and AI provider costs are the dominant cost drivers at scale. Implement per-user rate limits and consider caching strategies. Evaluate Judge0 self-hosting vs cloud pricing during Phase 2.

---

## 10. Pre-Implementation Checklist

- [ ] Team agrees on Firebase project name and region
- [ ] Google Cloud billing account configured
- [ ] Firebase project created in Console
- [ ] Web app registered in Firebase project
- [ ] Authentication email/password provider enabled
- [ ] Firestore database created in selected region
- [ ] Firebase CLI installed and authenticated
- [ ] `firebase init` run in project repository
- [ ] Emulators verified working locally
- [ ] App Check configured with reCAPTCHA Enterprise
- [ ] Cloud Functions secrets placeholder structure documented
- [ ] `.env.example` distributed to team (no real values)

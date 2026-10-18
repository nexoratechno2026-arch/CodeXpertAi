# Nexora CodeLab & InterviewAI — System Architecture

> **Status:** Phase 1 — Architecture & Planning  
> **Last Updated:** 2026-10-16

---

## 1. Architecture Overview

The platform follows a **Firebase-first, serverless architecture** with a React single-page application (SPA) frontend communicating with Firebase services and orchestrating external providers through Cloud Functions.

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                       │
│                                                             │
│  React SPA (TypeScript)                                     │
│  ├── Firebase Auth SDK (session management)                 │
│  ├── Firestore SDK (real-time reads, writes per rules)      │
│  ├── Monaco Editor (code editing, no execution)             │
│  └── Firebase App Check (client attestation)                │
│                                                             │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               │ Auth, Firestore,             │ HTTPS Callable
               │ App Check                    │ Functions
               │                              │
┌──────────────▼──────────────────────────────▼───────────────┐
│                     FIREBASE PLATFORM                        │
│                                                              │
│  ┌────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │ Authentication  │  │ Cloud Firestore  │  │   Hosting    │ │
│  │ (email/pass,   │  │ (primary DB)     │  │ (SPA deploy) │ │
│  │  social TBD)   │  │                  │  │              │ │
│  └────────────────┘  └──────────────────┘  └──────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              Cloud Functions (TypeScript)               │  │
│  │                                                        │  │
│  │  ├── Code Execution Orchestrator                       │  │
│  │  │   └── Validates → calls Judge0 → returns verdict    │  │
│  │  │                                                     │  │
│  │  ├── AI Interview Orchestrator                         │  │
│  │  │   └── Validates → calls AI provider → stores result │  │
│  │  │                                                     │  │
│  │  ├── Admin Operations                                  │  │
│  │  │   └── Problem CRUD, user management, analytics      │  │
│  │  │                                                     │  │
│  │  └── Firestore Triggers                                │  │
│  │      └── On-write hooks for denormalization, cleanup   │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────┐  ┌──────────────────┐                    │
│  │  App Check     │  │ Security Rules   │                    │
│  │  (reCAPTCHA    │  │ (Firestore)      │                    │
│  │   Enterprise)  │  │                  │                    │
│  └────────────────┘  └──────────────────┘                    │
└──────────────────────────────┬───────────────────────────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
   │   Judge0     │  │  AI Model    │  │   Future     │
   │   (Code      │  │  Provider    │  │   Services   │
   │   Execution) │  │  (Gemini /   │  │              │
   │              │  │   OpenAI)    │  │              │
   └──────────────┘  └──────────────┘  └──────────────┘
     Sandboxed          Server-side
     Execution          calls only
```

---

## 2. Technology Decisions

### 2.1 Frontend

| Decision | Choice | Rationale |
|---|---|---|
| **Framework** | React 18+ with TypeScript | Mature ecosystem, strong typing, wide library support, team familiarity |
| **Build Tool** | Vite | Fast HMR, native ESM, simple configuration, good React/TS support |
| **Routing** | React Router v6+ | Standard SPA routing, nested layouts, route-level code splitting |
| **State Management** | React Context + `useReducer` for global state; component-local state otherwise | Avoids heavy dependencies; Firebase SDKs handle most real-time state |
| **Code Editor** | Monaco Editor (`@monaco-editor/react`) | VS Code engine, syntax highlighting, IntelliSense, language support |
| **Styling** | CSS Modules + CSS custom properties (design tokens) | Scoped styles, no runtime cost, full control over the design system, no framework dependency |
| **HTTP Client** | Firebase callable functions (SDK); `fetch` for non-Firebase calls | Automatic auth token attachment for callable functions |
| **Markdown Rendering** | `react-markdown` with `remark-gfm` | Problem descriptions use Markdown |

> [!IMPORTANT]
> Tailwind CSS is **not** used. The black-first design system is implemented through CSS custom properties and CSS Modules, giving full control over every token without framework constraints.

### 2.2 Backend (Cloud Functions)

| Decision | Choice | Rationale |
|---|---|---|
| **Runtime** | Node.js 20 LTS | Firebase Functions 2nd gen support, TypeScript native |
| **Language** | TypeScript (strict mode) | Type safety, shared types with frontend |
| **Functions Generation** | 2nd gen (Cloud Functions for Firebase) | Better scaling, concurrency, longer timeouts, Cloud Run backing |
| **Validation** | Zod | Runtime schema validation for all inputs and AI responses |
| **AI SDK** | Provider-specific SDK (Gemini SDK or OpenAI SDK) | Direct integration, evaluated during Phase 2 |
| **Code Execution** | Judge0 API (self-hosted or cloud) | Sandboxed multi-language execution, API-based |

### 2.3 Firebase Services

| Service | Usage | Required |
|---|---|---|
| **Authentication** | User registration, login, session management | Yes |
| **Cloud Firestore** | Primary application database | Yes |
| **Cloud Functions** | Server-side logic, API orchestration | Yes |
| **App Check** | Client attestation for backend protection | Yes |
| **Hosting** | SPA deployment (evaluated — may use alternative if framework constraints arise) | Planned |
| **Storage** | Profile images, future file uploads (Phase 2+) | Deferred |
| **Analytics** | Usage tracking (Phase 3+) | Deferred |
| **Crashlytics** | Error reporting (Phase 3+) | Deferred |

> [!NOTE]
> Firebase Emulator Suite is used for **all local development**. See [FIREBASE_SETUP.md](file:///e:/Codebase%20Nexoratechno/docs/FIREBASE_SETUP.md) for emulator configuration.

---

## 3. Data Flow Diagrams

### 3.1 Code Submission Flow

```
Student                  React SPA              Cloud Function          Judge0
  │                        │                        │                     │
  ├──submit code──────────►│                        │                     │
  │                        ├──callable: submitCode─►│                     │
  │                        │                        ├──validate input     │
  │                        │                        ├──verify auth        │
  │                        │                        ├──load private tests │
  │                        │                        ├──POST /submissions─►│
  │                        │                        │                     ├──execute
  │                        │                        │                     │  in sandbox
  │                        │                        │◄──result───────────┤
  │                        │                        ├──compare outputs    │
  │                        │                        ├──compute verdict    │
  │                        │                        ├──write to Firestore │
  │                        │◄──return verdict──────┤                     │
  │◄──display result──────┤                        │                     │
```

### 3.2 AI Interview Flow

```
Student                  React SPA              Cloud Function          AI Provider
  │                        │                        │                     │
  ├──start interview──────►│                        │                     │
  │                        ├──callable: startInt.──►│                     │
  │                        │                        ├──create session doc │
  │                        │                        ├──POST question req─►│
  │                        │                        │◄──generated Q──────┤
  │                        │                        ├──store question     │
  │                        │◄──return question─────┤                     │
  │◄──display question────┤                        │                     │
  │                        │                        │                     │
  ├──answer──────────────►│                        │                     │
  │                        ├──callable: answer─────►│                     │
  │                        │                        ├──validate           │
  │                        │                        ├──POST follow-up────►│
  │                        │                        │◄──follow-up Q──────┤
  │                        │                        ├──store exchange     │
  │                        │◄──return next Q───────┤                     │
  │◄──display─────────────┤                        │                     │
  │                        │                        │                     │
  ├──end interview────────►│                        │                     │
  │                        ├──callable: endInt.────►│                     │
  │                        │                        ├──POST evaluate─────►│
  │                        │                        │◄──evaluation───────┤
  │                        │                        ├──validate schema    │
  │                        │                        ├──store report       │
  │                        │◄──return report ID────┤                     │
  │◄──redirect to report──┤                        │                     │
```

---

## 4. Cloud Functions Inventory (Planned)

| Function | Trigger | Purpose |
|---|---|---|
| `submitCode` | HTTPS Callable | Validate submission, call Judge0, compute verdict, store result |
| `startInterview` | HTTPS Callable | Create interview session, generate first question via AI |
| `answerQuestion` | HTTPS Callable | Process answer, generate follow-up or next question |
| `endInterview` | HTTPS Callable | Trigger evaluation, generate and store report |
| `getDiagnostic` | HTTPS Callable | Generate/retrieve diagnostic assessment for skill placement |
| `adminCreateProblem` | HTTPS Callable | Admin-only: create/update coding problem with test cases |
| `adminManageUsers` | HTTPS Callable | Admin-only: user role management, moderation |
| `onSubmissionCreate` | Firestore Trigger | Update skill records, streak, statistics on new submission |
| `onReportCreate` | Firestore Trigger | Update skill records and recommendations after interview |
| `scheduledCleanup` | Cloud Scheduler | Purge expired sessions, old temporary data |

---

## 5. External Provider Integration

### 5.1 Code Execution — Judge0

| Aspect | Detail |
|---|---|
| **Role** | Execute student code in isolated sandboxes |
| **Integration Point** | Cloud Functions only (never from client) |
| **Deployment Options** | Judge0 Cloud (SaaS) or self-hosted on Cloud Run / VM |
| **Supported Languages** | Python, JavaScript, Java, C++, C, Go, SQL (per Judge0 support) |
| **Security** | Time limits, memory limits, output size limits, network isolation |
| **Credential Storage** | `JUDGE0_API_URL` and `JUDGE0_API_KEY` in Cloud Functions environment/secrets |

> [!WARNING]
> Judge0 Cloud has rate limits and costs per submission. Self-hosting gives control but requires infrastructure management. Decision deferred to Phase 2 evaluation.

### 5.2 AI Model Provider

| Aspect | Detail |
|---|---|
| **Role** | Generate interview questions, follow-ups, evaluations, coding explanations |
| **Candidates** | Google Gemini API, OpenAI API |
| **Integration Point** | Cloud Functions only (never from client) |
| **Credential Storage** | `AI_PROVIDER_API_KEY` in Cloud Functions secrets |
| **Response Validation** | All AI responses validated against Zod schemas before storage |
| **Failure Handling** | Timeouts, retries with backoff, fallback error messages |
| **Usage Limits** | Per-user daily/hourly limits enforced in Cloud Functions |

---

## 6. Frontend Architecture

### 6.1 Project Structure (Planned)

```
src/
├── main.tsx                    # Entry point
├── App.tsx                     # Root component, providers, router
├── routes/                     # Route-level components (code-split)
│   ├── Home.tsx
│   ├── Login.tsx
│   ├── Signup.tsx
│   ├── Dashboard.tsx
│   ├── codelab/
│   │   ├── CodelabHome.tsx
│   │   ├── ProblemList.tsx
│   │   ├── ProblemWorkspace.tsx
│   │   └── Submissions.tsx
│   ├── interview/
│   │   ├── InterviewHome.tsx
│   │   ├── InterviewSetup.tsx
│   │   ├── InterviewSession.tsx
│   │   └── InterviewReport.tsx
│   ├── LearningPaths.tsx
│   ├── Profile.tsx
│   └── admin/
│       └── AdminPanel.tsx
├── components/                 # Shared UI components
│   ├── layout/
│   │   ├── AppShell.tsx
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   ├── editor/
│   │   └── CodeEditor.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Modal.tsx
│   │   ├── Select.tsx
│   │   ├── Tabs.tsx
│   │   └── Spinner.tsx
│   └── feedback/
│       ├── Toast.tsx
│       └── ErrorBoundary.tsx
├── hooks/                      # Custom React hooks
│   ├── useAuth.ts
│   ├── useFirestore.ts
│   └── useCallable.ts
├── contexts/                   # React context providers
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
├── lib/                        # Utilities and Firebase setup
│   ├── firebase.ts
│   ├── constants.ts
│   └── validators.ts
├── types/                      # Shared TypeScript types
│   ├── user.ts
│   ├── problem.ts
│   ├── interview.ts
│   └── common.ts
└── styles/                     # Global styles and tokens
    ├── tokens.css
    ├── reset.css
    └── global.css
```

### 6.2 Routing Strategy

- **React Router v6** with lazy-loaded route components
- **Layout routes** for shared `AppShell` (navbar, sidebar)
- **Protected routes** via `AuthContext` — redirects unauthenticated users to `/login`
- **Admin routes** additionally check user role claim from Firebase Auth custom claims
- Route-level code splitting with `React.lazy` + `Suspense`

### 6.3 Authentication Flow (Client Side)

```
┌─────────────┐    ┌──────────────┐    ┌──────────────┐
│  /login or  │───►│ Firebase Auth│───►│  AuthContext  │
│  /signup    │    │  SDK call    │    │  updates      │
└─────────────┘    └──────────────┘    └──────┬───────┘
                                              │
                                    ┌─────────▼─────────┐
                                    │ onAuthStateChanged │
                                    │ listener fires     │
                                    └─────────┬─────────┘
                                              │
                                    ┌─────────▼─────────┐
                                    │ Fetch user profile │
                                    │ from Firestore     │
                                    └─────────┬─────────┘
                                              │
                                    ┌─────────▼─────────┐
                                    │ Redirect to        │
                                    │ /dashboard         │
                                    └───────────────────┘
```

> [!IMPORTANT]
> Client-side route guards are a **UX convenience only**. All sensitive operations are protected server-side via Security Rules and Cloud Functions auth verification. See [SECURITY_PLAN.md](file:///e:/Codebase%20Nexoratechno/docs/SECURITY_PLAN.md).

---

## 7. Deployment Architecture

### 7.1 Planned Deployment

| Component | Platform | Notes |
|---|---|---|
| Frontend SPA | Firebase Hosting | Single-page app with `rewrites` to `index.html`. Evaluate compatibility with Vite build output |
| Cloud Functions | Cloud Functions for Firebase (2nd gen) | Auto-scaled, deployed via `firebase deploy` |
| Firestore | Google Cloud (managed) | Part of Firebase project, multi-region TBD |
| Custom Domain | TBD | Domain not yet selected; Firebase Hosting supports custom domains |

### 7.2 Environment Strategy

| Environment | Firebase Project | Purpose |
|---|---|---|
| **Local** | Emulator Suite | Development, testing, no cloud costs |
| **Staging** | Dedicated or same project with rules | Pre-production validation |
| **Production** | Dedicated project | Live users |

> [!NOTE]
> Whether staging uses a separate Firebase project or the same project with isolated Firestore collections is a decision for Phase 2. Separate projects provide stronger isolation but increase management overhead.

---

## 8. Unresolved Architecture Decisions

| # | Decision | Options | Status |
|---|---|---|---|
| 1 | AI model provider | Gemini API vs OpenAI API vs multi-provider | Evaluate Phase 2 |
| 2 | Judge0 deployment | Cloud SaaS vs self-hosted | Evaluate Phase 2 |
| 3 | Staging environment | Separate Firebase project vs same project isolation | Decide Phase 2 |
| 4 | Social auth providers | Google, GitHub, or email-only initially | Decide Phase 2 |
| 5 | Firestore region | `us-central1`, `asia-south1`, or multi-region | Decide at project creation |
| 6 | Real-time features | Firestore real-time listeners vs polling for interview sessions | Evaluate Phase 2 |
| 7 | Image/file storage | Firebase Storage timing and configuration | Deferred |
| 8 | Domain selection | `.com` domain choice | Pending business decision |

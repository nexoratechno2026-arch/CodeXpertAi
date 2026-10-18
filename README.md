# Nexora CodeLab & InterviewAI — Unified Developer Platform

> **Status:** Phase 6 Audited & Hardened (Production Readiness, Security Hardening & Staging Release Ready)  
> **Owner:** Nexora Techno  
> **Architecture:** Single React SPA • Monaco Editor • Unified Firebase Auth • Cloud Firestore • Cloud Functions AI & Sandbox Brokers • Deterministic Analytics Engine • Black Design System  

---

## 1. Product Identity

This is an official **Nexora Techno** product delivering two tightly integrated developer preparation modules inside a **single web application**:

1. **Nexora CodeLab** — Structured algorithmic practice and programming assessments with 5 difficulty tiers, 14 topic domains, Monaco Editor, and sandboxed code execution architecture.
2. **Nexora InterviewAI** — AI-assisted technical, programming, SQL, HR, and behavioral mock interviews with structured, multi-dimensional rubric evaluations and CodeLab feedback loops.
3. **Unified Skill Intelligence** — Deterministic cross-module analytics answering what skills the student is practicing, verified confidence states, explainable next steps, and true milestone progress across 6 structured learning paths.

### Strict Architectural Boundaries
- **One Web Application:** All modules reside within one frontend, one shared authentication system, one shared student profile, and one deployment.
- **Independent Product:** Does **not** modify, overwrite, or redeploy the existing production website at `nexoratechno.in`.
- **Domain Independence:** Built to run under its own upcoming domain; no assumptions or domain purchases are made.

---

## 2. Technology Stack

- **Frontend Core:** React 18, TypeScript (strict mode), Vite 6
- **Code Editor:** Monaco Editor (`@monaco-editor/react`) with custom vs-dark styling
- **Routing:** React Router v6 with layout wrappers, protected route guards, public-only redirects, and role-based administrative gating
- **Design System:** Black-first developer product aesthetic (`#090909`, `#111111`, `#171717`, `#292929`, `#F5F5F5`, `#A1A1AA`, `#3B82F6`) using CSS Modules and CSS Custom Properties. **No Tailwind CSS**.
- **Typography:** `Inter` (UI elements) and `JetBrains Mono` (code and numerical data)
- **Icons:** `lucide-react`
- **Backend & Data:** Firebase Authentication, Cloud Firestore, Firebase Cloud Functions (v2), Firebase App Check (reCAPTCHA Enterprise), Firebase Emulator Suite
- **Generative AI & Execution Sandbox:** Abstracted `IAIProvider` (Gemini API with offline deterministic rubric baseline) and isolated Judge0 sandbox integration
- **Learning Analytics & Taxonomy:** 17 canonical skills across 4 categories, 4-tier confidence state machine, explainable adaptive recommendations, and 6 published curricula
- **Testing:** Vitest, `@testing-library/react`, `@testing-library/jest-dom`, jsdom (79 unit & integration tests passing)

---

## 3. Application Routes

| Path | Access Level | Description |
|---|---|---|
| `/` | Public | Official platform landing page detailing both modules and 5 skill tiers |
| `/login` | Public Only | Secure email/password login with forgot-password recovery |
| `/signup` | Public Only | Student registration with password complexity verification |
| `/dashboard` | Authenticated | **Phase 5 Unified Dashboard**: Learning Overview, Skill Map, CodeLab & InterviewAI cards, Activity Feed, Recommendations |
| `/codelab` | Authenticated | CodeLab overview, 14 topic domains, and measured proficiency |
| `/codelab/problems` | Authenticated | Problem library catalog with search, difficulty, topic, and language filters |
| `/codelab/problems/:slug` | Authenticated | Interactive problem workspace with Monaco Editor, Run, and Submit workflows |
| `/codelab/submissions` | Authenticated | Personal submission history and execution verdicts |
| `/interview` | Authenticated | InterviewAI overview with real session history and verified metrics |
| `/interview/setup` | Authenticated | Mock interview session configuration (category, role, difficulty, duration, question count) |
| `/interview/session/:id` | Authenticated | Active interview practice environment with sequential questions and draft buffer |
| `/interview/report/:id` | Authenticated | Diagnostic scorecard with performance tier, rubric breakdown, and CodeLab links |
| `/learning-paths` | Authenticated | **Phase 5 Structured Curricula**: 6 published paths with real milestone completion tracking |
| `/profile` | Authenticated | Student profile, skill tier settings, and language preferences |
| `/admin` | Admin Role Only | Restricted portal for problem curation, rubrics, and audit logs |
| `*` | Any | 404 Not Found recovery view |

---

## 4. Getting Started Locally

### Prerequisites
- Node.js `v20+` or `v24+` LTS
- npm `v10+` or `v11+`
- (Optional for emulators) Java JRE for Firebase Emulator Suite

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd "Codebase Nexoratechno"

# Install dependencies
npm install
```

### Environment Configuration

Copy the example environment template:

```bash
cp .env.example .env
```

Update `.env` with your Firebase project credentials from the Firebase Console (Project Settings → General → Your Apps):

```env
VITE_FIREBASE_API_KEY=your_actual_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=000000000000
VITE_FIREBASE_APP_ID=1:000000000000:web:xxxxxxxxxxxxxxxx
```

> **Note:** If `.env` is unconfigured or credentials are missing, the application runs gracefully in local scaffolding mode with an informational status banner rather than crashing.

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Type Checking & Automated Testing

```bash
# Run TypeScript strict typecheck
npm run typecheck

# Run Vitest unit & integration test suites (71 tests across 8 suites)
npm run test

# Run Vitest in watch mode
npm run test:watch
```

### Production Build

```bash
npm run build
npm run preview
```

---

## 5. Firebase Emulator Development

For 100% offline development without cloud costs or external network dependencies:

```bash
# Start Firebase Local Emulators (Auth on :9099, Firestore on :8080, UI on :4000)
npm run emulators
```

Set in `.env`:
```env
VITE_USE_FIREBASE_EMULATORS=true
```

---

## 6. Security Principles

1. **Client Never Trusted:** All sensitive authorizations, verdicts, and AI calls execute server-side.
2. **Mastery Immutability:** Students cannot write directly to `student_analytics/{userId}` to forge progress; Firestore Security Rules reject client writes.
3. **Role Immutability:** Accounts are created with `role: "student"`. The student cannot promote themselves to `admin` via profile updates or client requests; Firestore Security Rules reject role alterations.
4. **Private Test Cases:** Stored in protected subcollections inaccessible to students; loaded only by trusted Cloud Functions.
5. **No Secrets in Bundle:** No service account keys, AI provider API keys, or Judge0 credentials reside in the frontend.

---

## 7. Roadmap Status

- [x] **Phase 1:** Core Foundation, Architecture & Design System
- [x] **Phase 2:** Authentication, Profiles & Firebase Security Layer
- [x] **Phase 3:** Nexora CodeLab — Sandboxed Code Execution & Testing Engine
- [x] **Phase 4:** Nexora InterviewAI — AI Mock Interview Engine & Multi-Tier Rubrics
- [x] **Phase 5:** Nexora Unified Skill Intelligence, Analytics & Adaptive Learning
- [x] **Phase 6:** Production Readiness, Security Hardening & Staging Release Ready (Pending explicit user authorization for live DNS & production deployment)


# CodeXpertAi-

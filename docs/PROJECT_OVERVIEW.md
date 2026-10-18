# Nexora CodeLab & InterviewAI — Project Overview

> **Status:** Phase 1 — Architecture & Planning  
> **Owner:** Nexora Techno  
> **Last Updated:** 2026-10-16

---

## 1. Product Identity

This is an official **Nexora Techno** product consisting of two integrated modules delivered as a single web application:

| Module | Purpose |
|---|---|
| **Nexora CodeLab** | Structured coding practice platform with a Monaco-based editor, sandboxed code execution, topic/skill progression, and curated problem sets |
| **Nexora InterviewAI** | AI-powered mock interview system with adaptive question generation, real-time coding challenges, conversational follow-ups, and structured evaluation reports |

### Key Constraints

- Both modules share **one frontend, one Firebase project, one authentication system, one user profile, and one deployment**.
- The existing production website at [nexoratechno.in](https://nexoratechno.in) is **not modified** by this project.
- This project requires a **new repository**, a **new dedicated Firebase project**, its own environment configuration, and a **new deployment**.
- The `.com` domain has not been selected. No domain purchase or DNS configuration is assumed.

---

## 2. Target Users

| Persona | Description |
|---|---|
| **Students** | Primary users. Practice coding problems at their skill level, take AI-driven mock interviews, track progress across topics |
| **Administrators** | Nexora Techno staff. Manage problem sets, review submissions, configure interview templates, moderate content, view platform analytics |

> [!NOTE]
> Phase 1 does not introduce public instructor accounts, team features, or enterprise tenancy. These may be evaluated in future phases.

---

## 3. Module Summary

### 3.1 Nexora CodeLab

- Browse and filter coding problems by topic, difficulty, and skill level
- Solve problems in a Monaco Editor with syntax highlighting and language support
- Submit code for execution against public and private test cases via an external sandboxed execution provider (e.g., Judge0)
- View submission history, verdict, runtime, and memory usage
- Track per-topic mastery and overall skill progression

### 3.2 Nexora InterviewAI

- Configure a mock interview session: select role, topics, difficulty, and duration
- AI generates contextual technical questions (conceptual + coding)
- Conversational follow-up questions adapt based on answers
- Coding challenges within interviews use the same Monaco Editor and execution pipeline
- Structured evaluation reports with per-question scoring, strengths, and improvement areas
- Reports stored persistently under the user's profile

### 3.3 Shared Capabilities

- Firebase Authentication (email/password; social providers evaluated later)
- Unified student profile with skill levels, topic mastery, and cross-module progress
- Shared dashboard with combined analytics
- Learning paths linking CodeLab problems and InterviewAI sessions
- Role-based access control enforced server-side via Cloud Functions and Security Rules
- Consistent black-first design system across all routes

---

## 4. Skill Level System

Five levels are supported across the platform:

| Level | Enum Value | Description |
|---|---|---|
| Absolute Beginner | `absolute_beginner` | No prior programming experience |
| Beginner | `beginner` | Basic syntax and simple problems |
| Intermediate | `intermediate` | Data structures, algorithms, moderate complexity |
| Advanced | `advanced` | Complex algorithms, system design concepts |
| Expert / Hardest | `expert` | Competition-level, advanced system design, edge cases |

- Students can **select** a preferred level or take an **optional diagnostic assessment**
- The platform stores **selected level**, **recommended level**, and **per-topic mastery** independently
- A student can be Advanced in Python but Beginner in SQL

---

## 5. Application Routes

All routes exist within the single application:

| Route | Module | Purpose |
|---|---|---|
| `/` | Shared | Landing / home page |
| `/login` | Auth | Sign in |
| `/signup` | Auth | Create account |
| `/dashboard` | Shared | Unified student dashboard with cross-module analytics |
| `/codelab` | CodeLab | CodeLab module home |
| `/codelab/problems` | CodeLab | Problem listing with filters |
| `/codelab/problems/:slug` | CodeLab | Problem workspace (editor + execution) |
| `/codelab/submissions` | CodeLab | Submission history |
| `/interview` | InterviewAI | Interview module home |
| `/interview/setup` | InterviewAI | Configure a new interview session |
| `/interview/session/:id` | InterviewAI | Active interview session |
| `/interview/report/:id` | InterviewAI | View evaluation report |
| `/learning-paths` | Shared | Guided learning paths |
| `/profile` | Shared | User profile, settings, skill levels |
| `/admin` | Admin | Admin panel (role-gated) |

---

## 6. Relationship to nexoratechno.in

| Aspect | nexoratechno.in | This Project |
|---|---|---|
| Repository | Separate (existing) | New repository |
| Firebase Project | Separate or none | New dedicated project |
| Domain | nexoratechno.in | TBD (new `.com`) |
| Deployment | Independent | Independent |
| Codebase | Unchanged | New |
| User Accounts | Not shared | Independent Firebase Auth |

---

## 7. Phase 1 Scope

Phase 1 produces **architecture and planning documents only**:

- `docs/PROJECT_OVERVIEW.md` — This document
- `docs/ARCHITECTURE.md` — System architecture and technology choices
- `docs/FIREBASE_SETUP.md` — Firebase project configuration and service setup
- `docs/DATABASE_SCHEMA.md` — Firestore collection structure and data model
- `docs/SECURITY_PLAN.md` — Security architecture, threat model, and access control
- `docs/DESIGN_SYSTEM.md` — Black-first design system tokens and component specifications
- `docs/IMPLEMENTATION_ROADMAP.md` — Phased development plan
- `.env.example` — Environment variable template (no real values)

### Phase 1 Does NOT Include

- Frontend implementation beyond architecture decisions
- Real Firebase project creation or credential configuration
- Production database writes
- AI provider integration or API calls
- Code execution provider integration
- Domain purchase
- Package installation
- Modifications to nexoratechno.in

---

## 8. Terminology

| Term | Meaning |
|---|---|
| **Problem** | A coding challenge in CodeLab with description, constraints, test cases, and expected solutions |
| **Submission** | A student's code submission against a problem, sent to the execution provider for evaluation |
| **Interview Session** | A complete mock interview from setup through evaluation |
| **Evaluation Report** | AI-generated structured feedback on an interview session |
| **Topic** | A subject area (e.g., Arrays, SQL, Dynamic Programming) |
| **Skill Record** | Per-user, per-topic mastery tracking |
| **Learning Path** | A curated sequence of problems and interview sessions for a goal |
| **Diagnostic Assessment** | Optional assessment to determine recommended skill level for a topic |

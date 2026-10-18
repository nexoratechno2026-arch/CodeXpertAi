# Phase 8 — Repository Audit & Baseline Architecture Report
## AI Learning Coach, Unified Skill Intelligence, Adaptive Practice & Personalized Learning Plans

**Date:** 2026-10-17  
**Branch / Target:** Production Preparation (`Nexora CodeLab + Nexora InterviewAI`)  
**Scope:** Individual student learning intelligence, adaptive recommendations, study plan generation, and AI learning coach.

---

### 1. Pre-Implementation Audit Findings

#### 1.1 Existing Implementations (From Phases 1–7)
1. **Unified Skill Taxonomy (`src/data/skillTaxonomy.ts`)**:
   - Defines 15 distinct `UNIFIED_SKILLS` across 4 categories: `programming_fundamentals`, `programming_languages`, `databases_and_sql`, and `interview_skills`.
   - Includes helper mappers `getSkillsForProblem(problem)` and `getSkillsForInterview(category)`.
   - Contains 3 published learning paths: Frontend Engineer, Backend Systems Engineer, and Full Stack Interview Readiness.
2. **Analytics & Aggregation Service (`src/services/analyticsService.ts`)**:
   - Computes `StudentUnifiedAnalytics` by pulling CodeLab submissions and InterviewAI summaries.
   - Calculates basic problem acceptance counts, consistency days, and confidence states (`not_assessed`, `starting_out`, `developing`, `demonstrated_consistently`).
   - Computes static deterministic recommendations based on hardcoded slug sequences.
3. **Student Dashboard (`src/features/dashboard/DashboardPage.tsx`)**:
   - Renders verified metrics, unified skill map cards, and adaptive recommendations.
   - Connects to user profile career targets and day streaks.
4. **Learning Paths Page (`src/features/learning/LearningPathsPage.tsx`)**:
   - Displays published learning path milestones with verified completion checkmarks based on actual problem solving and interview reports.
5. **Code Execution & Interview Engines**:
   - Sandboxed Monaco editor and compiler runner in CodeLab.
   - Rubric-based evaluation engine in InterviewAI with exemplar answers and score breakdowns.

---

### 2. Gaps & Deficiencies Identified for Phase 8

| Area | Current Baseline | Phase 8 Required Capability | Gap Severity |
| :--- | :--- | :--- | :--- |
| **Skill Assessment Engine** | Aggregates simple attempt and solve counts. Lacks recency weighting, attempt success ratio, and performance trend tracking. | Multi-dimensional rules-based assessment calculating estimated mastery (0-100), performance trend (`improving`, `stable`, `needs_revision`), and evidence sufficiency. | **HIGH** |
| **Adaptive CodeLab Practice** | Recommends only 3 fixed problem slugs in sequence (`reverse-words` -> `two-sum` -> `valid-parentheses`). | Dynamic problem recommendations matching user's specific weak topics, recommended difficulty tiers, revision for failed attempts, and prerequisite unlocks from actual catalog. | **HIGH** |
| **Adaptive Interview Preparation** | Recommends 1 fixed technical interview and 1 SQL interview if unpracticed. | Context-aware interview recommendations based on candidate's target role, low-scoring rubric dimensions (e.g. communication vs system architecture), and revision needs. | **HIGH** |
| **AI Learning Coach** | Does not exist. No interactive or guided assistant for answering student progress questions. | Dedicated grounded AI Learning Coach answering the 5 core student questions, with bounded token limits, prompt injection protection, and deterministic offline fallbacks. | **CRITICAL** |
| **Personalized Study Plans** | Only static pre-defined learning paths exist. No customizable weekly/daily task scheduler based on student hours/week. | Interactive Study Plan Generator creating structured daily/weekly tasks with verified auto-completion tracking and deadline recalculations. | **CRITICAL** |
| **Recommendation Explanations & Deferrals** | Static reason strings; no capability to dismiss, defer, or complete recommendations. | Explainable rationale strings for every recommendation, with ability for students to dismiss or mark as completed. | **MEDIUM** |
| **Data Security & Firestore Rules** | Rules guard `/users/{userId}/notifications` and general profile data, but lack rules for `/users/{userId}/studyPlans`. | Add Firestore Security Rules for study plans and recommendation feedback to guarantee strict multi-tenant isolation. | **HIGH** |

---

### 3. Implementation Constraints & Guardrails
- **Single Unified Application**: Everything must reside within the existing single Vite + React codebase. No micro-frontends or separate databases.
- **Production Website Immunity**: Absolutely no changes to `https://nexoratechno.in`.
- **Zero Hallucinated Recommendations**: All recommended problems must map to existing IDs in `src/data/seedProblems.ts`, and all interview recommendations must map to `src/data/interviewQuestionBank.ts`.
- **No Direct Mastery Modification**: Student clients must NEVER be permitted to write directly to their trusted skill estimates or mastery scores.
- **Provider Outage & Cost Control**: AI Coach must operate with strict input/output bounds and provide an offline/development mode when external AI API keys are unconfigured.

---

### 4. Implementation Plan
1. **Data Types & Models**: Define `SkillAssessment`, `StudyPlan`, `StudyTask`, `CoachQuery`, `CoachResponse`, and recommendation models.
2. **Skill Assessment & Evidence Engine (`skillEngine.ts`)**: Implement deterministic evidence scoring, recency weighting, trend calculation, and prerequisite unlocking.
3. **Adaptive Recommendation Engine (`recommendationEngine.ts`)**: Implement rules-based CodeLab & InterviewAI recommendations with explainable rationales and deferral support.
4. **AI Learning Coach Service (`coachService.ts`)**: Implement student context compilation, prompt builder, safety filters, and grounded offline rule fallback.
5. **Study Plan Generator Service (`studyPlanService.ts`)**: Implement task scheduling based on student weekly availability, target role, and verified auto-completion checks.
6. **UI Components**:
   - Learning Coach Interface (accessible via Dashboard and Learning Paths).
   - Personalized Study Plan View with customizable generator and progress tracking.
   - Enhanced Dashboard integration showing active plan and dynamic recommendations.
7. **Security Rules & Testing**:
   - Update `firestore.rules` for `/studyPlans`.
   - Comprehensive automated test suite in `src/test/phase8LearningCoach.test.ts`.
   - Update all required documentation deliverables.

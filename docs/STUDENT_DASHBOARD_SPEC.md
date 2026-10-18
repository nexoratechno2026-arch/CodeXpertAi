# Student Dashboard Specification

## 1. Overview & Objective
The Unified Student Dashboard (`/dashboard`) serves as the central command center for individual students preparing for software engineering roles using **Nexora CodeLab + Nexora InterviewAI**. It unites algorithmic problem solving and AI mock interview assessment into one coherent, evidence-backed workspace.

## 2. Core Functional Requirements

### 2.1 Authenticated Profile & Welcome Section
- **Identity Display**: Shows the student's authenticated full name (`profile.fullName` or `user.displayName`) and avatar with capital initials.
- **Current Mastery Tier**: Real-time tier pill (`beginner`, `intermediate`, `advanced`, `expert`, `absolute_beginner`) derived from persistent evidence.
- **Language Affinity**: Displays the student's preferred programming language (e.g., `PYTHON`, `JAVASCRIPT`, `SQL`).
- **Target Role & Learning Goals**: Displays configured career target (e.g. `Target: Full Stack Engineer`) and focus areas (e.g. `Goals: Data Structures & Algorithms, System Design`).
- **Quick Settings Link**: Immediate navigation to `/profile` for account security and configuration.

### 2.2 Genuine Verified Metrics Grid
Metrics are strictly computed from persisted Firestore submissions and interview sessions. Simulated or fake statistics are prohibited.
- **Problems Solved**: Displays `totalCodeLabAccepted / totalCodeLabAttempted` (distinct problems solved vs attempted).
- **Interviews Completed**: Count of completed, evaluated mock interview sessions.
- **Active Consistency Days**: Count of distinct calendar days with verified learning activity.
- **Day Streak**: Persisted consecutive day streak calculated from `lastActiveDate`.
- **New Account On-Ramp**: When a student has 0 attempted problems and 0 interviews, a prominent "Get Started with Your First Challenge" action banner appears pointing to `/codelab/problems` and `/interview/setup`.

### 2.3 Adaptive Recommendations
- Displays evidence-grounded next steps computed by `computeStudentAnalytics`.
- Differentiates CodeLab algorithmic challenges from InterviewAI conceptual practice.
- Provides transparent explanations ("Why this was recommended") based on observed gaps or prerequisite skills.

### 2.4 Unified Skill Intelligence Map
- Groups demonstrated competencies into distinct, non-overlapping categories:
  - Programming Fundamentals (control flow, functions, loops)
  - Programming Languages (Python, JavaScript, TypeScript, SQL, etc.)
  - Databases & SQL (relational schemas, joins, indexing)
  - Interview Competencies (technical communication, architecture, STAR behavioral)
- Displays confidence indicators (`Demonstrated Consistently`, `Developing`, `Starting Out`, `Not Assessed`).
- Separates deterministic code execution results from subjective rubric interview evaluations.

### 2.5 Integrated Module Portals
- **Nexora CodeLab Card**: Direct catalog link, quick access to problem list and personal submission history.
- **Nexora InterviewAI Card**: Direct link to interview hub, session setup configuration, and structured learning paths.

### 2.6 Chronological Unified Activity Feed
- Lists recent actions across both CodeLab and InterviewAI in descending order.
- Displays source badges, problem/session titles, verdict or score badges, and localized timestamps.
- Deep links to the relevant problem or completed interview report.

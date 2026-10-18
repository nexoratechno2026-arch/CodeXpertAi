# UNIFIED SKILL INTELLIGENCE ARCHITECTURE & EVIDENCE MODEL

## 1. Executive Summary

Phase 8 implements the **Unified Skill Intelligence Architecture** across Nexora CodeLab and Nexora InterviewAI. The system answers the student's primary questions regarding demonstrated competency, improvement areas, and progression trajectory without fabricating scores, using ungrounded estimates, or conflating distinct technical disciplines.

All skill evaluations are derived strictly from genuine, persisted, verified evidence:
- **Nexora CodeLab**: Concrete execution verdicts (`Accepted`, `Wrong Answer`, `Runtime Error`, `Time Limit Exceeded`) with exact test case counts and runtime statistics.
- **Nexora InterviewAI**: Structured evaluation rubrics across Technical Accuracy, Problem Solving, Communication Clarity, and System Design, verified only when a complete scorecard is persisted.

---

## 2. Skill Taxonomy & Dimensions

Nexora enforces strict independence across skill dimensions. A student can demonstrate `Advanced` mastery in Python algorithmic problem solving while remaining at `Beginner` level in SQL database operations.

### 2.1 Programming Dimensions (`SkillDimension: 'programming'`)

| Dimension ID | Display Label | Primary Evidence Source | Difficulty Range |
| :--- | :--- | :--- | :--- |
| `lang-python` | Python Fundamentals & Idioms | CodeLab Python submissions | Beginner → Advanced |
| `lang-javascript` | JavaScript / TypeScript | CodeLab JS/TS submissions | Beginner → Advanced |
| `lang-java` | Java Core & Object-Oriented | CodeLab Java submissions | Beginner → Advanced |
| `db-sql` | SQL Querying & Joins | CodeLab SQL execution verdicts | Beginner → Advanced |
| `prog-data-structures` | Data Structures (Arrays, Trees, Graphs) | CodeLab tagged submissions | Beginner → Expert |
| `prog-algorithms` | Algorithms (DP, Greedy, Two Pointers) | CodeLab tagged submissions | Beginner → Expert |
| `prog-debugging` | Error Diagnostics & Edge-Case Handling | Multi-attempt problem resolution | Beginner → Advanced |

### 2.2 Interview Preparation Dimensions (`SkillDimension: 'interview'`)

| Dimension ID | Display Label | Primary Evidence Source | Difficulty Range |
| :--- | :--- | :--- | :--- |
| `int-technical-explanation` | Technical Concept Explanation | InterviewAI technical questions | Developing → Role-Ready |
| `int-sql-interview` | Database & Schema Query Design | InterviewAI SQL domain questions | Developing → Role-Ready |
| `int-programming-interview` | Live Algorithmic Walkthrough | InterviewAI coding sessions | Developing → Role-Ready |
| `int-behavioral-answers` | Behavioral Scenarios (STAR Method) | InterviewAI behavioral rubrics | Developing → Role-Ready |
| `int-communication-clarity` | Structured Articulation & Delivery | InterviewAI rubric clarity score | Developing → Role-Ready |

---

## 3. Evidence Processing & Scoring Formulation

### 3.1 Idempotency & Deduplication
To prevent students from artificially inflating mastery through duplicate submissions or network retries, evidence is deduplicated using an idempotent key:
$$\text{EventKey} = \text{problemId} + \text{"\_"} + \text{submittedAt} + \text{"\_"} + \text{verdict}$$
Duplicate events sharing the same key within a window are collapsed into a single valid evidence point.

### 3.2 Quantitative Mastery Formula
Each topic skill estimate $M \in [0.05, 1.00]$ is computed using an explainable deterministic formula:

$$M = \min\left(1.0, \max\left(0.05, \text{Base} + (\text{Ratio} \times 0.65) + (\text{Recency} \times 0.20) + (\text{DifficultyWeight} \times 0.10)\right)\right)$$

Where:
- $\text{Base} = 0.10$: Represents exploratory baseline prior to verified mastery.
- $\text{Ratio} = \frac{\text{SuccessfulAttempts}}{\text{TotalAttempts}}$: Ratio of accepted/passing attempts.
- $\text{Recency} = e^{-\lambda \cdot \Delta t}$: Exponential decay where $\Delta t$ is days since last verified attempt ($\lambda = 0.05$).
- $\text{DifficultyWeight}$: Weighted contribution of solved problem difficulty (Beginner: $0.2$, Intermediate: $0.6$, Advanced: $1.0$).

### 3.3 Confidence & Data Sufficiency Rules
Confidence is never overstated:
- **Insufficient Data (`hasSufficientData = false`)**: Assigned when $\text{EvidenceCount} < 2$. The UI displays *"Not enough activity yet"* rather than misleading numerical scores.
- **Low Confidence (`confidence = 'low'`)**: $\text{EvidenceCount} \in [2, 3]$.
- **Medium Confidence (`confidence = 'medium'`)**: $\text{EvidenceCount} \in [4, 6]$.
- **High Confidence (`confidence = 'high'`)**: $\text{EvidenceCount} \ge 7$ across multiple distinct challenges.

### 3.4 Trend Calculation
- `improving`: Recent 3 attempts have $\ge 66\%$ success rate and exceed historical baseline.
- `needs_revision`: Success rate $< 40\%$ over recent attempts, or consecutive failures on core topics.
- `stable`: Consistent performance within $\pm 10\%$ variance.
- `insufficient_data`: Fewer than 2 verified attempts.

---

## 4. Security & Trust Model

1. **Client Immutability**: Students cannot directly edit their skill values, mastery estimates, or attempt counts. Mastery values are strictly server-derived or computed from authentic submission entities.
2. **Execution Boundary**: CodeLab execution outcomes originate from sandboxed test harnesses; opening or previewing a problem produces zero evidence.
3. **AI Failure Isolation**: If an AI interview provider fails, times out, or returns incomplete data (`isEvaluationAvailable: false`), the attempt is recorded as *Pending Evaluation* and **never** counted as an unsuccessful or failed attempt.

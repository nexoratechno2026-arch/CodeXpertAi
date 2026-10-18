# SKILL ASSESSMENT ENGINE RULES & SCORING SPECIFICATION

## 1. Objectives

The Nexora Skill Assessment Engine computes objective, transparent, and explainable proficiency scores for every student across distinct topics in programming and interview preparation. 

The engine adheres to five foundational tenets:
1. **Evidence-Grounded**: Mastery cannot be earned merely by viewing questions or reading roadmaps. Only compiled execution results or verified interview evaluation reports generate evidence.
2. **Dimension Independence**: Proficiency in one language (e.g., Python) does not artificially lower or raise proficiency in another discipline (e.g., SQL).
3. **Transparent Precision**: No misleading scores are invented when data is sparse. If a student has fewer than 2 verified attempts in a topic, the state is reported as *"Not enough activity yet"*.
4. **Resistant to Inflation**: Duplicate attempts, network retries, and identical rapid submissions are deduplicated using composite keys.
5. **Deterministic Calibration**: Initial assessment uses an explainable mathematical formula rather than an opaque black-box model.

---

## 2. Five Difficulty Tiers

Every topic is calibrated across five discrete difficulty tiers:

| Tier Level | Level Name | Target Demographic | CodeLab Problem Criteria | Interview Category Criteria |
| :---: | :--- | :--- | :--- | :--- |
| **1** | `absolute_beginner` | Novice programmers | Syntax basics, arithmetic operations, basic conditional statements | Conceptual introductions, definition-level questions |
| **2** | `beginner` | Early learners | Iteration, arrays, basic string manipulations, simple queries | Foundational technical concepts, structured behavioral introductions |
| **3** | `intermediate` | Standard undergraduate / junior | Hash tables, two pointers, recursion, SQL `JOIN`s, group aggregation | Multi-step problem solving, system component interactions |
| **4** | `advanced` | Mid-level engineers | Dynamic programming, graphs, trees, subqueries, concurrency | System architecture, trade-off evaluations, in-depth debugging |
| **5** | `expert` | Senior / competitive | Hard graph algorithms, complex distributed systems design | Scalability, fault tolerance, low-level optimization |

Recommended difficulty adjusts progressively: when a student solves 3 or more unique problems with $\ge 75\%$ success, the recommended difficulty tier elevates by one level.

---

## 3. Quantitative Rules

### 3.1 CodeLab Evidence Ingestion
- `accepted`: $+1$ Solved Attempt, $+1$ Unique Problem Count (if not previously solved).
- `wrong_answer`, `runtime_error`, `time_limit_exceeded`: $+1$ Failed Attempt.
- Opening/viewing problem: $0$ evidence added.

### 3.2 InterviewAI Evidence Ingestion
- Completed session (`status: 'completed'`): Evaluates rubric metrics (Accuracy, Clarity, Depth, Completeness). Score contributes to average interview performance.
- In-progress or abandoned session (`status: 'in_progress' | 'abandoned'`): Zero penalty applied; does not count as failed evidence.

### 3.3 Mastery Computation
$$\text{SolveRatio} = \frac{\text{UniqueSolved}}{\max(1, \text{UniqueSolved} + \text{FailedAttempts})}$$
$$\text{CodeLabMastery} = \min(100, \text{UniqueSolved} \times 30 \times \text{SolveRatio} + \text{SolveRatio} \times 20)$$

When both coding and interview evidence exist for a cross-cutting topic:
$$\text{CombinedMastery} = \text{round}(0.60 \times \text{CodeLabMastery} + 0.40 \times \text{AverageInterviewScore})$$

### 3.4 Confidence & Status States
- **Starting Out / Insufficient Data**: $\text{EvidenceCount} < 2 \implies \text{hasSufficientData} = \text{false}$.
- **Developing Proficiency**: $\text{Mastery} \in [50, 74]$ with $\ge 1$ problem solved.
- **Demonstrated Consistently**: $\text{Mastery} \ge 75$ or $\ge 3$ unique problems solved.

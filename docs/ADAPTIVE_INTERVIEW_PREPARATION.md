# ADAPTIVE INTERVIEW PREPARATION ENGINE

## 1. Overview & Objectives

The Adaptive Interview Preparation Engine personalizes mock screening sessions for each student based on their verified interview evaluations, target career role, and programming telemetry.

The engine answers:
- *“Which interview categories should I practice for my target role?”*
- *“How do my rubric evaluations (technical accuracy, problem solving, communication clarity) direct my preparation?”*
- *“How can I practice articulating complex engineering trade-offs aloud?”*

---

## 2. Adaptation Strategies & Role Targeting

### 2.1 Role-Conditioned Diagnostic Screening
- **Backend / Full Stack Roles**: Prioritizes SQL query optimization, transaction semantics, API design, and schema normalization (`/interview/setup?category=sql` or `technical`).
- **Data Engineering Roles**: Recommends complex SQL filtering, distributed aggregations, and pipeline trade-offs.
- **Frontend / General SWE Roles**: Emphasizes system interaction, asynchronous logic flow, and algorithm justification.

### 2.2 Rubric-Driven Interventions
The engine monitors the four core rubric dimensions across completed scorecards:
1. **Technical Accuracy**: If accuracy $< 70\%$, recommends foundational technical review and concept explanation.
2. **Communication Clarity**: If clarity $< 70\%$, prompts behavioral scenarios with explicit structure (STAR method: Situation, Task, Action, Result).
3. **Problem-Solving Justification**: When code submissions succeed but verbal explanation is untested, the system recommends explaining coding solutions aloud.

---

## 3. Evidence Validity & Safety Boundaries

1. **Explicit Limitations & Disclaimers**: AI mock interviews provide structured feedback on verbal answers and technical explanations. Nexora explicitly clarifies to students that AI evaluations do **not** claim to measure every aspect of personality, emotional intelligence, or hiring outcomes.
2. **Handling Incomplete Sessions**: Sessions that are in progress, abandoned, or where the AI service timed out are assigned `isEvaluationAvailable: false` and are **never** recorded as failed interviews.
3. **Preventing Question Fatigue**: The question selector tracks question IDs attempted in the student's history to avoid repeating identical questions unless explicit revision is requested.

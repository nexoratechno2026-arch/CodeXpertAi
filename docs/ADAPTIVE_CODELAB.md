# ADAPTIVE CODELAB PRACTICE ENGINE

## 1. Overview & Objectives

Adaptive CodeLab practice intelligently guides students through programming problem sets using genuine, persisted execution telemetry. Rather than presenting a static list of questions or an arbitrary sequence, the engine matches problems to the student's demonstrated competence, recent failure patterns, and learning goals.

The system answers:
- *“What problem should I solve next?”*
- *“Why is this specific problem recommended?”*
- *“How do I progress from basic fundamentals to interview-grade algorithmic challenges?”*

---

## 2. Recommendation Strategies & Rules

### 2.1 Foundational Revision (Weak Topics)
- **Trigger**: $\ge 2$ consecutive unsuccessful attempts (`wrong_answer`, `runtime_error`, `time_limit_exceeded`) on a topic, or an estimated mastery below $50\%$ on an assessed skill.
- **Action**: Selects an available problem in the same topic at the current or lower difficulty tier (`beginner` or `absolute_beginner`).
- **Plain-Language Rationale**:
  > *“Recommended because your recent SQL JOIN submissions show difficulty (2 failed attempts). Reinforce foundational concepts before attempting harder challenges.”*

### 2.2 Progressive Difficulty Advancement
- **Trigger**: Demonstrated consistent mastery ($\ge 75\%$ solve ratio across $\ge 2$ unique problems in a foundational topic).
- **Action**: Recommends the next progressive challenge in sequence (e.g., from `prog-fundamentals` / `prog-strings-pointers` to `prog-hash-tables` or `prog-stacks-queues` at `intermediate` tier).
- **Plain-Language Rationale**:
  > *“Suggested because you completed the foundational programming milestone. Advance to optimal hash mapping and space-time trade-offs.”*

### 2.3 Starter Calibration (Cold Start)
- **Trigger**: $0$ prior submissions or insufficient activity.
- **Action**: Recommends an `absolute_beginner` starter challenge (e.g. *Reverse Words in a String*).
- **Plain-Language Rationale**:
  > *“Start with this beginner problem because there is not enough evidence to recommend a harder level yet.”*

---

## 3. Strict Content Availability Constraints

1. **Existence Guard**: Recommendations strictly map to registered, published problems in `SEED_PROBLEMS`. No dynamic, hallucinated, or unauthoritative problem IDs or links are ever rendered.
2. **Actionability**: Every recommendation includes a direct route: `/codelab/problems/${slug}`.
3. **No Infinite Loops**: The recommendation engine factors in solved problem IDs: once an accepted submission is recorded, the solved problem is retired from next-up recommendations and advanced to revision/spaced-repetition status.
4. **Dismissal & Deferral**: Students can dismiss recommendations via the dismiss button. Dismissed recommendations are stored in local storage and mirrored to Firestore (`/users/{userId}/recommendationFeedback/{recId}`) to prevent re-recommending unwanted items.

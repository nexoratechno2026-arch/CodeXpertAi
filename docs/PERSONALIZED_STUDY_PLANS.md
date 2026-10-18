# PERSONALIZED STUDY PLAN GENERATOR & PROGRESS TRACKER

## 1. Overview & Objectives

The **Personalized Study Plan Generator** translates platform recommendations into actionable, weekly structured milestones. Rather than overwhelming students with an exhaustive curriculum, the planner schedules targeted, bite-sized tasks tailored to the student's declared availability and target role.

---

## 2. Configuration & Inputs

Students can configure their study plan with the following parameters:
- **Target Career Role**: e.g., *Software Engineer*, *Backend Engineer*, *Full Stack Engineer*, *Data Engineer*.
- **Focus Topics**: e.g., *Algorithms*, *SQL*, *System Design*, *Data Structures*.
- **Weekly Time Commitment**: Recommended $3$–$15$ hours per week.
- **Preferred Practice Days**: Selected weekdays (e.g., Monday, Wednesday, Friday, Saturday).
- **Target Completion Date**: Optional milestone target.

---

## 3. Task Structure & Verification Rules

Every generated study task adheres to a strict schema:

```typescript
export interface StudyTask {
  id: string;
  planId: string;
  title: string;
  topic: string;
  taskType: 'solve_problem' | 'mock_interview' | 'review_failed_problem' | 'concept_review';
  targetId: string;          // Maps to actual problem slug or interview category
  difficulty: SkillLevel;
  estimatedMinutes: number;  // Clearly labeled estimate (e.g. 30 mins)
  reason: string;            // Evidence-based justification
  actionUrl: string;         // Direct link to authentic problem or interview
  isCompleted: boolean;
  completedAt?: string;
  verifiedVia?: 'codelab_submission' | 'interview_report' | 'manual';
  scheduledDayIndex: number;
  dayLabel: string;
}
```

### 3.1 Authentic Verification Standard
Tasks cannot be marked complete through arbitrary clicks when verifiable evidence is available:
- **Coding Tasks (`solve_problem`)**: Automatically marked complete (`verifiedVia: 'codelab_submission'`) when an `accepted` verdict is compiled in CodeLab for the target problem.
- **Mock Interview Tasks (`mock_interview`)**: Automatically marked complete (`verifiedVia: 'interview_report'`) when a structured scorecard is persisted in InterviewAI.
- **Review / Concept Tasks**: Permitted manual completion after the student reviews their prior feedback or code diagnostics.

### 3.2 Non-Destructive Progress Reconciliation
When `recomputePlanProgress` runs:
- Existing completed timestamps and verified badges are preserved.
- Historical completions are never erased or rewritten.
- Future tasks adapt if a topic is mastered ahead of schedule.

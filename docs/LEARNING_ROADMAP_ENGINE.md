# LEARNING ROADMAP & PROGRESSION ENGINE

## 1. Objectives

The **Learning Roadmap Engine** powers the structured learning paths in Nexora CodeLab and InterviewAI. It coordinates topic-based milestones, manages prerequisite relationships, and provides clear visibility into progress without creating rigid, monolithic barriers for students.

---

## 2. Roadmap Structure & Published Paths

Nexora provides six primary curricula published in `src/data/skillTaxonomy.ts`:
1. **Programming Fundamentals (`lp-prog-fundamentals`)**: Variables, condition logic, while/for loops, memory-efficient string manipulation.
2. **Data Structures & Algorithms Mastery (`lp-dsa-mastery`)**: Two-pointer techniques, monotonic stacks, hash tables, divide & conquer, and heaps.
3. **SQL & Relational Foundations (`lp-sql-fundamentals`)**: Data filtering, multi-table `JOIN` operations, group aggregation, indexing, and normalization.
4. **Technical Interview Screening Prep (`lp-tech-interview-prep`)**: Verbal technical articulation, STAR behavioral formulation, and algorithmic complexity justification.
5. **Python Foundations (`lp-python-foundations`)**: Pythonic idioms, collections, generator comprehensions, and OOP encapsulation.
6. **JavaScript & TypeScript Systems (`lp-js-foundations`)**: Event loops, asynchronous promises, typing patterns, and closures.

---

## 3. Milestone Completion Standard

A milestone is marked complete only when verifiable evidence is recorded:
- **CodeLab Milestones (`type: 'problem'`)**: Satisfied exclusively when an `accepted` execution verdict is stored for the milestone's target problem.
- **InterviewAI Milestones (`type: 'interview'`)**: Satisfied exclusively when an evaluation report is compiled for the target category.
- **Navigation**: Students can launch unresolved milestones directly via one-click links (`Solve` for CodeLab, `Practice` for InterviewAI).

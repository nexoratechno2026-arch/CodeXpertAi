# Nexora Structured Learning Paths & Milestones

## 1. Overview

Structured Learning Paths on Nexora combine hands-on coding challenges (`Nexora CodeLab`) and conversational mock interview checkpoints (`Nexora InterviewAI`) into cohesive, role-aligned curricula.

Students track their real progress toward target engineering roles on `/learning-paths`.

---

## 2. Published Starter Paths

The platform includes six starter paths defined in `src/data/skillTaxonomy.ts`:

### 1. Programming Foundations & Logic (`lp-prog-fundamentals`)
- **Target Role**: Junior Software Engineer
- **Difficulty**: Beginner | **Est. Time**: 15 hours
- **Target Skills**: `prog-fundamentals`, `prog-strings-pointers`, `lang-python`, `lang-javascript`
- **Milestones**:
  1. *Solve: Reverse Words in a String* (CodeLab problem: `reverse-words-sentence`)
  2. *Interview: Programming Basics Screening* (InterviewAI category: `programming`)

### 2. Python Foundations & Idiomatic Code (`lp-python-foundations`)
- **Target Role**: Python / Backend Developer
- **Difficulty**: Beginner | **Est. Time**: 18 hours
- **Target Skills**: `lang-python`, `prog-fundamentals`, `prog-complexity`
- **Milestones**:
  1. *Solve: Two Sum Target Indices (Python)* (CodeLab problem: `two-sum-indices`)
  2. *Interview: Python Memory Model & Data Types* (InterviewAI category: `programming`)

### 3. JavaScript Foundations & Async Runtimes (`lp-js-foundations`)
- **Target Role**: Frontend / Full Stack Engineer
- **Difficulty**: Beginner | **Est. Time**: 20 hours
- **Target Skills**: `lang-javascript`, `prog-fundamentals`, `prog-strings-pointers`
- **Milestones**:
  1. *Solve: Reverse Words in a String (JavaScript)* (CodeLab problem: `reverse-words-sentence`)
  2. *Interview: Event Loop & Asynchronous Architecture* (InterviewAI category: `technical`)

### 4. Data Structures & Algorithmic Problem Solving (`lp-dsa-mastery`)
- **Target Role**: Full Stack / Backend Engineer
- **Difficulty**: Intermediate | **Est. Time**: 35 hours
- **Target Skills**: `prog-hash-tables`, `prog-stacks-queues`, `prog-complexity`, `prog-advanced-heaps`
- **Milestones**:
  1. *Solve: Two Sum Target Indices* (CodeLab problem: `two-sum-indices`)
  2. *Solve: Balanced Parentheses Validation* (CodeLab problem: `valid-parentheses-depth`)
  3. *Interview: Algorithmic Efficiency & Edge Cases* (InterviewAI category: `programming`)
  4. *Solve: Merge K Sorted Array Streams* (CodeLab problem: `merge-k-sorted-streams`)

### 5. SQL, Relational Schema & Performance (`lp-sql-fundamentals`)
- **Target Role**: Data Engineer / Database Specialist
- **Difficulty**: Intermediate | **Est. Time**: 25 hours
- **Target Skills**: `lang-sql`, `db-filtering-aggregations`, `db-joins-relations`, `db-indexing-performance`
- **Milestones**:
  1. *Solve: High Earner Identification by Department* (CodeLab problem: `department-top-salaries`)
  2. *Interview: SQL Query Optimization & Indexing* (InterviewAI category: `sql`)

### 6. Comprehensive Technical & Behavioral Readiness (`lp-tech-interview-prep`)
- **Target Role**: Senior Software Engineer
- **Difficulty**: Advanced | **Est. Time**: 30 hours
- **Target Skills**: `int-concept-articulation`, `int-tradeoff-reasoning`, `int-star-communication`, `prog-linked-lists`
- **Milestones**:
  1. *Solve: LRU Eviction Buffer Implementation* (CodeLab problem: `lru-cache-capacity`)
  2. *Interview: Distributed Systems & Concurrency Screening* (InterviewAI category: `technical`)
  3. *Interview: Behavioral Leadership & Conflict Resolution* (InterviewAI category: `behavioral`)

---

## 3. Milestone Completion Criteria

Milestones are **never** awarded simply for opening a page or viewing content:
- **CodeLab Milestones (`type: 'problem'`)**: Completed if and only if the student has an `accepted` submission for the specified `targetSlugOrCategory`.
- **InterviewAI Milestones (`type: 'interview'`)**: Completed if and only if the student has finished a completed session in that category with an overall scorecard score >= 60%.

Progress percentages are calculated deterministically:
$$\text{Progress \%} = \text{round}\left(\frac{\text{Completed Milestones}}{\text{Total Milestones}} \times 100\right)$$
When all milestones in a path are satisfied, the path displays a celebratory completion badge.

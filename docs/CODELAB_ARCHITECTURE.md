# Nexora CodeLab Architecture Specification

## 1. Executive Summary & Purpose

**Nexora CodeLab** is an integrated coding practice and algorithmic assessment module within the unified Nexora developer platform. It provides students with an end-to-end learning environment featuring:

1. **A Structured 5-Tier Skill Progression:** Absolute Beginner, Beginner, Intermediate, Advanced, and Expert.
2. **14 Technical Topic Domains:** Spanning core fundamentals to dynamic programming, system OOP, and SQL relational algebra.
3. **Monaco Code Editor:** Professional syntax-highlighted IDE with custom dark tokens (`#111111` surface, `#3B82F6` accents), multi-language templates, and line numbers.
4. **Isolated Code Execution Engine:** Server-brokered execution via Judge0 sandboxes, preventing arbitrary student code from ever executing in the client browser or application API runtimes.
5. **Private Test Case Shielding:** Anti-cheating architecture that strictly segregates public example tests from private grading test suites.
6. **Measured Topic Mastery:** Independent domain mastery tracking derived strictly from verified submissions.

---

## 2. Multi-Tier Architecture Diagram

```
[ Browser Client / React 18 SPA ]
  │
  ├── Monaco Editor Workspace (/codelab/problems/:slug)
  ├── Problem Catalog & Filters (/codelab/problems)
  ├── Submission History (/codelab/submissions)
  └── Topic Domain Mastery Overview (/codelab)
         │
         │ Authenticated Callable / HTTPS (TLS 1.3 + Firebase App Check)
         ▼
[ Layer 2: Trusted Application Backend (Cloud Functions / Cloud Run) ]
  ├── 1. Auth Guard (JWT token verification, student UID)
  ├── 2. Rate Quota Check (Max 30 submissions/hour per user)
  ├── 3. Input Validation (Max 64KB code, validated language enum)
  ├── 4. Problem & Test Case Loader (Firebase Admin SDK)
  │      ├── 'run' operation    ──► Loads public examples
  │      └── 'submit' operation ──► Loads hidden private test suite
  │
  ├── 5. Execution Provider Adapter Interface
  │      ├── Judge0Adapter        ──► Isolated sandboxes (RapidAPI / CE)
  │      └── MockExecutionAdapter ──► Safe offline development simulation
  │
  └── 6. Result Sanitizer & Database Persistence
         ├── Redacts private test inputs & expected outputs
         ├── Writes submission record to Firestore
         └── Updates student profile stats & topic progress
         │
         ▼
[ Layer 3: Cloud Firestore Primary Database ]
  ├── problems/{problemId} (Public metadata & examples)
  ├── problems/{problemId}/testCases/{id} (Private tests, rules deny client queries)
  ├── submissions/{submissionId} (Client read-only for owner)
  └── users/{userId}/progress/{topicId} (Topic mastery records)
```

---

## 3. Five-Tier Difficulty Hierarchy

Nexora CodeLab enforces five distinct difficulty levels across all algorithmic challenges:

| Level Identifier | Display Label | Target Learning Objective | Complexity Expectations |
|---|---|---|---|
| `absolute_beginner` | Absolute Beginner | Syntax fundamentals, basic I/O, linear string parsing, simple arithmetic | O(N) time, O(1) space |
| `beginner` | Beginner | Array operations, hash map lookups, basic two-pointer techniques | O(N) time, O(N) space |
| `intermediate` | Intermediate | Stack/queue manipulation, binary search, tree traversals, relational joins | O(N log N) time, O(N) space |
| `advanced` | Advanced | Complex state-space modeling, LRU eviction caches, multi-pointer dynamic programming | O(N) or O(log N) amortized |
| `expert` | Expert / Hardest | Min-heap stream mergers, competition-grade constraints, optimal cache design | O(N log k) optimal |

---

## 4. 14 Curated Topic Domains

CodeLab organizes problems into 14 topic domains across 5 categories:

1. **Fundamentals:**
   - Programming Fundamentals
   - Variables & Data Types
   - Conditions & Loops
   - Functions & Modular Code
2. **Data Structures:**
   - Arrays & Strings
   - Hash Maps & Sets
   - Stacks & Queues
   - Linked Lists
   - Trees & Graphs
3. **Algorithms:**
   - Searching & Sorting
   - Recursion & Backtracking
   - Dynamic Programming
4. **Software Design:**
   - Object-Oriented Programming & Systems Design
5. **Databases:**
   - SQL & Relational Database Queries

---

## 5. Measured Topic Mastery Model

Rather than assigning students an arbitrary aggregate score, Nexora CodeLab measures proficiency **per topic independently**. A student can be **Advanced** in Hash Maps while being an **Absolute Beginner** in SQL.

Topic mastery is computed strictly from verified accepted submissions:

- **0 Solved:** `absolute_beginner`
- **1 Solved:** `beginner`
- **2 Solved:** `intermediate`
- **3–4 Solved:** `advanced`
- **5+ Solved:** `expert`

---

## 6. Supported Programming Languages

| Language ID | Display Name | Runtime Environment | Judge0 Language ID |
|---|---|---|---|
| `python` | Python | CPython 3.10+ | 71 |
| `javascript` | JavaScript | Node.js 18+ | 63 |
| `typescript` | TypeScript | Node.js 18+ with ts-node | 74 |
| `java` | Java | OpenJDK 17 | 62 |
| `cpp` | C++ | GCC 11.2 (C++17) | 54 |
| `sql` | SQL | SQLite 3.39 / PostgreSQL compatible | 82 |

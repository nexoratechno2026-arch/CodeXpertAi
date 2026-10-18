# Nexora Adaptive Difficulty Framework

## 1. Difficulty Spectrum

Nexora supports five distinct difficulty tiers:

1. **Absolute Beginner**: Introductory syntax, simple I/O, linear iterations without nested state.
2. **Beginner**: Single-pass loops, basic array indexing, simple dictionaries/hash maps, baseline string formatting.
3. **Intermediate**: Multi-pointer techniques, LIFO stacks, FIFO queues, relational joins, subqueries, recursion with memoization.
4. **Advanced**: Doubly-linked lists, LRU buffers, graph traversals (BFS/DFS), complex multi-table SQL aggregations, distributed architecture defenses.
5. **Expert / Hardest**: Min-Heap priority queues, divide-and-conquer merges, concurrent transactions, real-time distributed stream processing.

---

## 2. Topic-Specific Adaptation Rules

A student's level is **never a single monolithic label** applied across the entire curriculum. A student can simultaneously be:
- **Intermediate** in Python and Hash Maps.
- **Absolute Beginner** in SQL Joins and Query Optimization.
- **Developing** in Behavioral Interviewing.

### Advancement Heuristics

1. **Prerequisite Gating**:
   - Intermediate problems (e.g. `valid-parentheses-depth`) are only recommended when foundational prerequisites (`prog-fundamentals`) have reached at least `developing` (>= 1 accepted problem).
   - Advanced problems (e.g. `lru-cache-capacity`) require intermediate data structures (`prog-stacks-queues` or `prog-linked-lists`) to be `demonstrated_consistently`.

2. **No Knee-Jerk Demotions**:
   - A single failed attempt (`wrong_answer` or `runtime_error`) does **not** lower the student's recommended difficulty.
   - Demotion to foundational review is only triggered after 3+ consecutive unaccepted submissions on a single topic.

3. **Student Sovereignty**:
   - Recommended difficulty is purely advisory.
   - The student maintains complete autonomy in the UI to select and practice any difficulty level from the catalog.

---

## 3. Data Separation

The data model maintains strict separation between:
- `selectedDifficulty`: What the student chooses in filters or configuration.
- `recommendedDifficulty`: The deterministic difficulty computed by the analytics engine.
- `measuredEvidence`: Actual historical submission verdicts and scorecard results.

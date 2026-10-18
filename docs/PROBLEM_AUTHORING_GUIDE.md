# Nexora CodeLab — Problem Authoring & Curation Guide

## 1. Overview & Guidelines

This guide establishes the standardized procedure for authors, engineers, and administrators creating new algorithmic problems in Nexora CodeLab.

Every challenge must adhere to high pedagogical and technical standards:
- **Zero Ambiguity:** Inputs, outputs, and constraints must be formally defined.
- **Realistic Constraints:** Problems must have well-calibrated time limits (1–5 seconds) and memory limits (128–512 MB).
- **Comprehensive Test Coverage:** Must include both pedagogical public examples and robust private test suites covering boundary and scale conditions.

---

## 2. Problem Schema Specification

```typescript
interface ProblemDefinition {
  id: string;                     // e.g., 'prob-two-sum'
  slug: string;                   // URL slug: 'two-sum-indices'
  title: string;                  // Display title
  description: string;            // Markdown-formatted problem text
  topicId: string;                // One of 14 valid topic IDs
  topicName: string;              // Human-readable topic name
  difficulty: SkillLevel;         // 'absolute_beginner' | 'beginner' | 'intermediate' | 'advanced' | 'expert'
  tags: string[];                 // Searchable technical tags
  inputFormat: string;            // Formal specification of stdin format
  outputFormat: string;           // Formal specification of expected stdout
  constraints: string;            // Value ranges, length limits, time bounds
  supportedLanguages: string[];   // ['python', 'javascript', 'typescript', 'java', 'cpp', 'sql']
  examples: ProblemExample[];     // 2 to 3 public examples with explanations
  starterCode: StarterCodeMap;    // Working templates for each supported language
  expectedComplexity?: {
    time: string;                 // e.g., 'O(N)'
    space: string;                // e.g., 'O(N)'
  };
  hints?: string[];               // Progressive hints without immediate spoilers
  timeLimitSeconds: number;       // Execution timeout in seconds (default: 2)
  memoryLimitKB: number;          // Memory cap in KB (default: 256000)
  isPublished: boolean;           // Draft vs Public visibility
}
```

---

## 3. Test Suite Architecture

Each problem requires two distinct tiers of test cases:

### Tier 1: Public Examples (2 to 3 cases)
- Embedded directly in the problem document under `examples`.
- Displayed openly to students in the problem description workspace.
- Executed when students click **Run Code**.
- Purpose: Help students verify syntax, understand problem requirements, and debug early logic.

### Tier 2: Private Hidden Tests (4 to 8 cases)
- Stored exclusively in the subcollection `problems/{problemId}/testCases` with `isPublic: false`.
- Never exposed in frontend responses.
- Executed when students click **Submit Code**.
- **Required Edge Case Coverage:**
  1. **Minimal / Boundary Input:** Empty input, single-element arrays, length 1 strings.
  2. **Negative & Zero Values:** Sums crossing zero, all-negative sequences.
  3. **Duplicate & Tied Elements:** Repeated values testing hash collision or sorting stability.
  4. **Max Capacity Scale Test:** Maximum constraints (e.g., $N = 10^4$ or $N = 10^5$) testing time and memory complexity bounds.

---

## 4. Starter Code Conventions

Every supported programming language must provide a valid starter template containing:
1. The core function signature with clear type annotations.
2. Standard I/O parsing reading from `stdin` and printing to `stdout`.
3. Clear placeholder indicating where student code should be inserted.

### Python Example:
```python
import sys

def solve(input_data: str) -> str:
    # Student implements solution logic here
    return input_data

if __name__ == '__main__':
    raw = sys.stdin.read().strip()
    if raw:
        print(solve(raw))
```

---

## 5. Publishing & Quality Checklist

Before changing `isPublished: false` to `isPublished: true`:
- [ ] Problem verified to run in under 2 seconds across all supported languages.
- [ ] At least 4 private test cases populated in the `testCases` subcollection.
- [ ] Difficulty classification reviewed against the 5-tier standard.
- [ ] Hints reviewed to ensure they do not give away the complete solution.
- [ ] Constraints explicitly specify asymptotic limits.

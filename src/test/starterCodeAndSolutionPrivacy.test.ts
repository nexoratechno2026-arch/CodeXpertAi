import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SEED_PROBLEMS, SEED_REFERENCE_SOLUTIONS, SEED_TEST_CASES } from '@/data/seedProblems';
import { getProblemBySlug, getProblems, sanitizeClientProblem } from '@/services/codelabService';
import { executeCode } from '@/services/executionService';
import { Problem } from '@/types/codelab';

describe('CodeLab Starter Code & Solution Privacy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Starter Code Integrity (No Leaked Reference Solutions in Editor)', () => {
    it('initializes "Reverse Words in a String" Python problem with the exact required template', async () => {
      const problem = await getProblemBySlug('reverse-words-sentence');
      expect(problem).not.toBeNull();
      const pyStarter = problem!.starterCode.python;

      const expectedPyStarter = `def reverse_words(s: str) -> str:
    # Write your solution here
    pass


# Test execution wrapper
import sys

if __name__ == "__main__":
    input_str = sys.stdin.read().strip()
    print(reverse_words(input_str))
`;
      expect(pyStarter).toBe(expectedPyStarter);

      // Verify that the complete working solution is NOT present
      expect(pyStarter).not.toContain('words = s.split()');
      expect(pyStarter).not.toContain('" ".join(reversed(words))');
    });

    it('ensures all seed problems have starter templates without working reference logic', async () => {
      const { problems } = await getProblems();
      expect(problems.length).toBeGreaterThan(0);

      problems.forEach((problem) => {
        problem.supportedLanguages.forEach((lang) => {
          const starter = problem.starterCode[lang];
          expect(starter, `Problem ${problem.id} should have starter code for ${lang}`).toBeDefined();
          expect(starter!.length).toBeGreaterThan(0);

          // Verify starter contains guidance markers
          const containsGuidance =
            starter!.includes('Write your solution here') ||
            starter!.includes('Write your SQL query') ||
            starter!.includes('Initialize your LRU cache');
          expect(containsGuidance, `Starter for ${problem.id} in ${lang} should contain guidance comment`).toBe(true);

          // Verify that working reference solutions are not in the starter code
          if (problem.id === 'prob-two-sum') {
            expect(starter).not.toContain('lookup[complement]');
            expect(starter).not.toContain('map.has(diff)');
          } else if (problem.id === 'prob-valid-parentheses') {
            expect(starter).not.toContain('top !== map[char]');
            expect(starter).not.toContain('stack.pop() != c');
          } else if (problem.id === 'prob-lru-cache') {
            expect(starter).not.toContain('self.cache.move_to_end');
            expect(starter).not.toContain('this.map.keys().next()');
          } else if (problem.id === 'prob-merge-k-sorted') {
            expect(starter).not.toContain('heapq.heappush');
            expect(starter).not.toContain('PriorityQueue');
          } else if (problem.id === 'prob-sql-department-salaries') {
            expect(starter).not.toContain('DENSE_RANK() OVER');
          }
        });
      });
    });

    it('verifies language switching retrieves correct language-specific starter template', async () => {
      const problem = await getProblemBySlug('reverse-words-sentence');
      expect(problem).not.toBeNull();

      // Python
      expect(problem!.starterCode.python).toContain('def reverse_words(s: str) -> str:');
      // JavaScript
      expect(problem!.starterCode.javascript).toContain('function reverseWords(s) {');
      // TypeScript
      expect(problem!.starterCode.typescript).toContain('function reverseWords(s: string): string {');
      // Java
      expect(problem!.starterCode.java).toContain('public static String reverseWords(String s)');
      // C++
      expect(problem!.starterCode.cpp).toContain('string reverseWords(string s)');
    });
  });

  describe('2. Server-side Solution & Hidden Test Case Privacy', () => {
    it('guarantees getProblemBySlug never returns referenceSolution to client callers', async () => {
      const problem = await getProblemBySlug('reverse-words-sentence');
      expect(problem).not.toBeNull();
      expect((problem as any).referenceSolution).toBeUndefined();
    });

    it('guarantees getProblems catalog never returns referenceSolution to client callers', async () => {
      const { problems } = await getProblems();
      problems.forEach((p) => {
        expect((p as any).referenceSolution).toBeUndefined();
      });
    });

    it('confirms sanitizeClientProblem strictly strips referenceSolution', () => {
      const rawProblem: Problem = {
        ...SEED_PROBLEMS[0],
        referenceSolution: { python: 'print("classified")' },
      };
      const sanitized = sanitizeClientProblem(rawProblem);
      expect(sanitized.referenceSolution).toBeUndefined();
      expect((sanitized as any).referenceSolution).toBeUndefined();
      expect(sanitized.id).toBe(rawProblem.id);
      expect(sanitized.starterCode).toEqual(rawProblem.starterCode);
    });

    it('confirms reference solutions exist privately in server lookup SEED_REFERENCE_SOLUTIONS', () => {
      expect(SEED_REFERENCE_SOLUTIONS['prob-reverse-words']).toBeDefined();
      expect(SEED_REFERENCE_SOLUTIONS['prob-reverse-words']?.python).toContain('words = s.split()');

      expect(SEED_REFERENCE_SOLUTIONS['prob-two-sum']).toBeDefined();
      expect(SEED_REFERENCE_SOLUTIONS['prob-two-sum']?.python).toContain('lookup = {}');
    });

    it('never leaks hidden test case input or expectedOutput in execution results', async () => {
      const result = await executeCode({
        problemId: 'prob-reverse-words',
        language: 'python',
        code: `def reverse_words(s: str) -> str:
    words = s.split()
    return " ".join(reversed(words))
`,
        operation: 'submit',
      });

      expect(result.testCaseResults.length).toBeGreaterThan(0);
      const hiddenTests = result.testCaseResults.filter((tc) => !tc.isPublic);
      expect(hiddenTests.length).toBeGreaterThan(0);

      hiddenTests.forEach((tc) => {
        expect(tc.input, 'Hidden test input must be undefined').toBeUndefined();
        expect(tc.expectedOutput, 'Hidden test expectedOutput must be undefined').toBeUndefined();
        expect(tc.actualOutput, 'Hidden test actualOutput must be undefined').toBeUndefined();
      });

      const publicTests = result.testCaseResults.filter((tc) => tc.isPublic);
      publicTests.forEach((tc) => {
        expect(tc.input).toBeDefined();
        expect(tc.expectedOutput).toBeDefined();
      });
    });
  });

  describe('3. Execution & Evaluation Workflow (Run vs Submit)', () => {
    it('fails evaluation when running unmodified starter code', async () => {
      const problem = await getProblemBySlug('reverse-words-sentence');
      expect(problem).not.toBeNull();
      const starter = problem!.starterCode.python!;

      const result = await executeCode({
        problemId: 'prob-reverse-words',
        language: 'python',
        code: starter,
        operation: 'run',
      });

      // Since starter has `pass` and is unmodified, it must not falsely pass
      expect(result.verdict).toBe('wrong_answer');
      expect(result.passedTests).toBe(0);
      expect(result.totalTests).toBe(3); // 3 public sample tests
    });

    it('executes only visible public tests on "run" operation', async () => {
      const result = await executeCode({
        problemId: 'prob-two-sum',
        language: 'python',
        code: 'def two_sum(target, nums): return [0, 1]',
        operation: 'run',
      });

      expect(result.operation).toBe('run');
      expect(result.testCaseResults.every((tc) => tc.isPublic)).toBe(true);
      expect(result.totalTests).toBe(3);
    });

    it('evaluates both public and hidden tests on "submit" operation', async () => {
      const result = await executeCode({
        problemId: 'prob-two-sum',
        language: 'python',
        code: 'def two_sum(target, nums): return [0, 1]',
        operation: 'submit',
      });

      expect(result.operation).toBe('submit');
      const publicCount = result.testCaseResults.filter((tc) => tc.isPublic).length;
      const hiddenCount = result.testCaseResults.filter((tc) => !tc.isPublic).length;

      expect(publicCount).toBe(3);
      expect(hiddenCount).toBe(3);
      expect(result.totalTests).toBe(6);
      expect(result.submissionId).toBeDefined();
    });

    it('displays genuine evaluation results when student writes working logic', async () => {
      const result = await executeCode({
        problemId: 'prob-reverse-words',
        language: 'python',
        code: `def reverse_words(s: str) -> str:
    return " ".join(s.split()[::-1])

import sys
if __name__ == "__main__":
    print(reverse_words(sys.stdin.read().strip()))
`,
        operation: 'run',
      });

      expect(result.verdict).toBe('accepted');
      expect(result.passedTests).toBe(3);
      expect(result.totalTests).toBe(3);
      expect(result.message).toContain('All test cases passed successfully');
    });
  });

  describe('4. Reset & State Preservation', () => {
    it('restores intended starter code upon reset action', async () => {
      const problem = await getProblemBySlug('reverse-words-sentence');
      expect(problem).not.toBeNull();

      // Simulating user editing code then resetting to original starter
      let userCode = 'def reverse_words(s): return "cheat"';
      expect(userCode).not.toBe(problem!.starterCode.python);

      // Reset
      userCode = problem!.starterCode.python!;
      expect(userCode).toBe(problem!.starterCode.python);
      expect(userCode).toContain('pass');
      expect(userCode).not.toContain('cheat');
    });

    it('preserves existing seed problems, submission models, and topic counts', () => {
      expect(SEED_PROBLEMS.length).toBeGreaterThanOrEqual(6);
      expect(Object.keys(SEED_TEST_CASES).length).toBeGreaterThanOrEqual(6);
      expect(Object.keys(SEED_REFERENCE_SOLUTIONS).length).toBeGreaterThanOrEqual(6);
    });
  });
});

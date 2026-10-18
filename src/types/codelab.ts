import { SkillLevel } from './skill';
import { ProgrammingLanguage } from './user';

export interface Topic {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: 'Fundamentals' | 'Data Structures' | 'Algorithms' | 'Software Design' | 'Databases';
  problemCount: number;
  isActive: boolean;
  sortOrder: number;
}

export const CODELAB_TOPICS: Topic[] = [
  {
    id: 'programming-fundamentals',
    name: 'Programming Fundamentals',
    slug: 'programming-fundamentals',
    description: 'Core computation logic, I/O, operators, and basic procedural constructs.',
    category: 'Fundamentals',
    problemCount: 8,
    isActive: true,
    sortOrder: 1,
  },
  {
    id: 'variables-data-types',
    name: 'Variables & Data Types',
    slug: 'variables-data-types',
    description: 'Primitive types, scope, type conversion, and memory representation.',
    category: 'Fundamentals',
    problemCount: 6,
    isActive: true,
    sortOrder: 2,
  },
  {
    id: 'conditions-loops',
    name: 'Conditions & Loops',
    slug: 'conditions-loops',
    description: 'Control flow branching, nested iteration, break/continue paradigms.',
    category: 'Fundamentals',
    problemCount: 10,
    isActive: true,
    sortOrder: 3,
  },
  {
    id: 'functions-methods',
    name: 'Functions & Modular Code',
    slug: 'functions-methods',
    description: 'Parameter passing, pure functions, higher-order functions, and closures.',
    category: 'Fundamentals',
    problemCount: 8,
    isActive: true,
    sortOrder: 4,
  },
  {
    id: 'arrays-strings',
    name: 'Arrays & Strings',
    slug: 'arrays-strings',
    description: 'Contiguous memory indexing, string mutation, multi-pointers, sliding window.',
    category: 'Data Structures',
    problemCount: 16,
    isActive: true,
    sortOrder: 5,
  },
  {
    id: 'searching-sorting',
    name: 'Searching & Sorting',
    slug: 'searching-sorting',
    description: 'Binary search variants, merge sort, quicksort, partition algorithms.',
    category: 'Algorithms',
    problemCount: 12,
    isActive: true,
    sortOrder: 6,
  },
  {
    id: 'recursion-backtracking',
    name: 'Recursion & Backtracking',
    slug: 'recursion-backtracking',
    description: 'Recursive call stacks, permutations, subsets, and state-space pruning.',
    category: 'Algorithms',
    problemCount: 10,
    isActive: true,
    sortOrder: 7,
  },
  {
    id: 'hash-maps-sets',
    name: 'Hash Maps & Sets',
    slug: 'hash-maps-sets',
    description: 'O(1) lookups, collision resolution, frequency tracking, and deduping.',
    category: 'Data Structures',
    problemCount: 14,
    isActive: true,
    sortOrder: 8,
  },
  {
    id: 'stacks-queues',
    name: 'Stacks & Queues',
    slug: 'stacks-queues',
    description: 'LIFO & FIFO semantics, monotonic stacks, deque sliding max.',
    category: 'Data Structures',
    problemCount: 10,
    isActive: true,
    sortOrder: 9,
  },
  {
    id: 'linked-lists',
    name: 'Linked Lists',
    slug: 'linked-lists',
    description: 'Singly, doubly, and circular linked nodes, pointer manipulation, cycle detection.',
    category: 'Data Structures',
    problemCount: 9,
    isActive: true,
    sortOrder: 10,
  },
  {
    id: 'trees-graphs',
    name: 'Trees & Graphs',
    slug: 'trees-graphs',
    description: 'Binary search trees, BFS/DFS traversal, topological sort, shortest paths.',
    category: 'Data Structures',
    problemCount: 15,
    isActive: true,
    sortOrder: 11,
  },
  {
    id: 'dynamic-programming',
    name: 'Dynamic Programming',
    slug: 'dynamic-programming',
    description: 'Optimal substructure, overlapping subproblems, memoization, tabular state machines.',
    category: 'Algorithms',
    problemCount: 14,
    isActive: true,
    sortOrder: 12,
  },
  {
    id: 'oop-design',
    name: 'Object-Oriented Programming',
    slug: 'oop-design',
    description: 'Encapsulation, inheritance, polymorphism, abstract design patterns.',
    category: 'Software Design',
    problemCount: 7,
    isActive: true,
    sortOrder: 13,
  },
  {
    id: 'sql-databases',
    name: 'SQL & Database Queries',
    slug: 'sql-databases',
    description: 'Relational algebra, joins, window functions, aggregations, schema constraints.',
    category: 'Databases',
    problemCount: 8,
    isActive: true,
    sortOrder: 14,
  },
];

export interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface ExpectedComplexity {
  time: string;
  space: string;
}

export type StarterCodeMap = Partial<Record<ProgrammingLanguage, string>>;

export interface Problem {
  id: string;
  slug: string;
  title: string;
  description: string;
  topicId: string;
  topicName: string;
  difficulty: SkillLevel;
  tags: string[];
  companyPatterns?: string[];
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  supportedLanguages: ProgrammingLanguage[];
  examples: ProblemExample[];
  starterCode: StarterCodeMap;
  /**
   * Reference solution stored privately on the server.
   * Stripped before serving to student client browsers to maintain privacy.
   */
  referenceSolution?: StarterCodeMap;
  expectedComplexity?: ExpectedComplexity;
  hints?: string[];
  timeLimitSeconds: number;
  memoryLimitKB: number;
  isPublished: boolean;
  submissionCount: number;
  acceptedCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Public problem representation sent to student browsers.
 * Explicitly omits private reference solutions and hidden test cases.
 */
export type PublicProblem = Omit<Problem, 'referenceSolution'>;

export interface ProblemTestCase {
  id: string;
  problemId: string;
  input: string;
  expectedOutput: string;
  isPublic: boolean;
  order: number;
  explanation?: string;
}

export type SubmissionStatus = 'pending' | 'running' | 'completed' | 'error';

export type SubmissionVerdict =
  | 'accepted'
  | 'wrong_answer'
  | 'time_limit_exceeded'
  | 'memory_limit_exceeded'
  | 'runtime_error'
  | 'compilation_error'
  | 'internal_error';

export type ExecutionOperation = 'run' | 'submit';

export interface TestCaseResult {
  testCaseId: string;
  passed: boolean;
  isPublic: boolean;
  input?: string;          // Omitted for private test cases to prevent cheating
  expectedOutput?: string; // Omitted for private test cases
  actualOutput?: string;   // Sanitized preview for public tests
  runtimeMs?: number;
  memoryKB?: number;
  status: 'passed' | 'failed' | 'timeout' | 'error';
  errorMessage?: string;
}

export interface ExecutionResult {
  verdict: SubmissionVerdict;
  status: SubmissionStatus;
  operation: ExecutionOperation;
  runtimeMs: number | null;
  memoryKB: number | null;
  totalTests: number;
  passedTests: number;
  compileOutput?: string;
  testCaseResults: TestCaseResult[];
  isMockExecution: boolean;
  message?: string;
  submissionId?: string;
}

export interface Submission {
  id: string;
  userId: string;
  problemId: string;
  problemSlug: string;
  problemTitle: string;
  difficulty: SkillLevel;
  topicId: string;
  language: ProgrammingLanguage;
  code: string;
  status: SubmissionStatus;
  verdict: SubmissionVerdict | null;
  runtimeMs: number | null;
  memoryKB: number | null;
  passedCount: number;
  totalCount: number;
  errorMessage?: string;
  submittedAt: string;
}

export interface TopicMastery {
  topicId: string;
  topicName: string;
  solvedCount: number;
  totalAttempted: number;
  proficiency: SkillLevel;
  lastSolvedAt: string | null;
}

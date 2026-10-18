import { SkillDefinition, LearningPath } from '@/types/analytics';
import { Problem } from '@/types/codelab';
import { InterviewCategory } from '@/types/interview';

export const UNIFIED_SKILLS: SkillDefinition[] = [
  // ── 1. PROGRAMMING FUNDAMENTALS ──
  {
    id: 'prog-fundamentals',
    name: 'Variables, Types & Logic Flow',
    category: 'programming_fundamentals',
    description: 'Foundational syntax, variables, conditionals, while/for loops, and functional modularity.',
    prerequisites: [],
    suggestedLevel: 'absolute_beginner',
    relatedCodeLabTopics: ['programming-fundamentals'],
    relatedInterviewCategories: ['programming', 'technical'],
  },
  {
    id: 'prog-strings-pointers',
    name: 'Strings & In-Place Pointer Techniques',
    category: 'programming_fundamentals',
    description: 'String manipulation, array reversals, two pointers, and memory-conscious buffer operations.',
    prerequisites: ['prog-fundamentals'],
    suggestedLevel: 'beginner',
    relatedCodeLabTopics: ['programming-fundamentals', 'arrays-strings'],
    relatedInterviewCategories: ['programming'],
  },
  {
    id: 'prog-hash-tables',
    name: 'Hash Tables & O(1) Key-Value Access',
    category: 'programming_fundamentals',
    description: 'Collision handling, amortized O(1) lookups, dictionary mapping, and complement search.',
    prerequisites: ['prog-fundamentals'],
    suggestedLevel: 'beginner',
    relatedCodeLabTopics: ['hash-maps-sets'],
    relatedInterviewCategories: ['programming', 'technical'],
  },
  {
    id: 'prog-stacks-queues',
    name: 'Stacks, Queues & Monotonic Buffers',
    category: 'programming_fundamentals',
    description: 'LIFO stack semantics, FIFO queues, bracket matching, and monotonic ordering.',
    prerequisites: ['prog-fundamentals'],
    suggestedLevel: 'intermediate',
    relatedCodeLabTopics: ['stacks-queues'],
    relatedInterviewCategories: ['programming'],
  },
  {
    id: 'prog-linked-lists',
    name: 'Linked Lists & Pointer Mutation',
    category: 'programming_fundamentals',
    description: 'Singly and doubly linked lists, node insertion/deletion, fast & slow pointer cycle detection.',
    prerequisites: ['prog-fundamentals'],
    suggestedLevel: 'intermediate',
    relatedCodeLabTopics: ['linked-lists', 'oop-design'],
    relatedInterviewCategories: ['programming', 'technical'],
  },
  {
    id: 'prog-complexity',
    name: 'Computational Complexity & Big-O Derivation',
    category: 'programming_fundamentals',
    description: 'Asymptotic analysis, worst-case time complexity, auxiliary heap/stack space bounds.',
    prerequisites: ['prog-fundamentals'],
    suggestedLevel: 'intermediate',
    relatedCodeLabTopics: ['searching-sorting', 'algorithms'],
    relatedInterviewCategories: ['technical', 'programming'],
  },
  {
    id: 'prog-advanced-heaps',
    name: 'Priority Queues & Divide-and-Conquer',
    category: 'programming_fundamentals',
    description: 'Min/max binary heaps, k-way stream merging, and divide-and-conquer recurrences.',
    prerequisites: ['prog-stacks-queues', 'prog-complexity'],
    suggestedLevel: 'expert',
    relatedCodeLabTopics: ['searching-sorting', 'trees-graphs'],
    relatedInterviewCategories: ['programming'],
  },

  // ── 2. PROGRAMMING LANGUAGES ──
  {
    id: 'lang-python',
    name: 'Pythonic Idioms & Data Structures',
    category: 'programming_languages',
    description: 'Comprehensions, generators, slicing, dynamic typing, and standard library collections.',
    prerequisites: ['prog-fundamentals'],
    suggestedLevel: 'beginner',
    relatedCodeLabTopics: ['programming-fundamentals'],
    relatedInterviewCategories: ['programming'],
  },
  {
    id: 'lang-javascript',
    name: 'JavaScript / TypeScript Async & Objects',
    category: 'programming_languages',
    description: 'Event loop, promises, prototypes, ES6+ methods, and TypeScript static type interfaces.',
    prerequisites: ['prog-fundamentals'],
    suggestedLevel: 'beginner',
    relatedCodeLabTopics: ['programming-fundamentals'],
    relatedInterviewCategories: ['programming', 'technical'],
  },
  {
    id: 'lang-sql',
    name: 'Declarative SQL & Relational Queries',
    category: 'programming_languages',
    description: 'Structured query language, filtering, grouping, set operations, and subqueries.',
    prerequisites: ['prog-fundamentals'],
    suggestedLevel: 'beginner',
    relatedCodeLabTopics: ['databases'],
    relatedInterviewCategories: ['sql'],
  },

  // ── 3. DATABASES & SQL ──
  {
    id: 'db-filtering-aggregations',
    name: 'SQL Aggregations, Grouping & Windowing',
    category: 'databases_and_sql',
    description: 'GROUP BY, HAVING, aggregate functions, and window ranking functions (DENSE_RANK, ROW_NUMBER).',
    prerequisites: ['lang-sql'],
    suggestedLevel: 'intermediate',
    relatedCodeLabTopics: ['databases'],
    relatedInterviewCategories: ['sql'],
  },
  {
    id: 'db-joins-relations',
    name: 'Relational Joins & Schema Normalization',
    category: 'databases_and_sql',
    description: 'Inner/outer joins, foreign keys, 3NF normalization, and relational integrity constraints.',
    prerequisites: ['lang-sql'],
    suggestedLevel: 'intermediate',
    relatedCodeLabTopics: ['databases'],
    relatedInterviewCategories: ['sql'],
  },
  {
    id: 'db-indexing-performance',
    name: 'B-Tree Indexing & Query Execution Plans',
    category: 'databases_and_sql',
    description: 'Composite indexes, table scans vs index lookups, EXPLAIN output interpretation, and caching.',
    prerequisites: ['db-joins-relations'],
    suggestedLevel: 'advanced',
    relatedCodeLabTopics: ['databases'],
    relatedInterviewCategories: ['sql', 'technical'],
  },
  {
    id: 'db-transactions-acid',
    name: 'ACID Transactions & Concurrency Isolation',
    category: 'databases_and_sql',
    description: 'Atomicity, consistency, MVCC isolation levels, dirty/phantom reads, and distributed locking.',
    prerequisites: ['db-joins-relations'],
    suggestedLevel: 'advanced',
    relatedCodeLabTopics: ['databases'],
    relatedInterviewCategories: ['sql', 'technical'],
  },

  // ── 4. TECHNICAL & INTERVIEW SKILLS ──
  {
    id: 'int-concept-articulation',
    name: 'Core CS Concept & Architecture Articulation',
    category: 'interview_skills',
    description: 'Explaining operating systems, networking, caching, and distributed system concepts clearly.',
    prerequisites: ['prog-fundamentals'],
    suggestedLevel: 'intermediate',
    relatedCodeLabTopics: [],
    relatedInterviewCategories: ['technical'],
  },
  {
    id: 'int-tradeoff-reasoning',
    name: 'Architectural Trade-Offs & Edge Case Awareness',
    category: 'interview_skills',
    description: 'Balancing time vs space, latency vs throughput, consistency vs availability (CAP).',
    prerequisites: ['prog-complexity'],
    suggestedLevel: 'intermediate',
    relatedCodeLabTopics: [],
    relatedInterviewCategories: ['technical', 'programming'],
  },
  {
    id: 'int-star-communication',
    name: 'STAR Behavioral Response & Ownership',
    category: 'interview_skills',
    description: 'Structuring behavioral scenarios (Situation, Task, Action, Result) with tangible metrics.',
    prerequisites: [],
    suggestedLevel: 'beginner',
    relatedCodeLabTopics: [],
    relatedInterviewCategories: ['behavioral', 'hr'],
  },
];

/**
 * Maps a CodeLab problem to its target skill IDs
 */
export function getSkillsForProblem(problem: Problem): string[] {
  const matched: string[] = ['prog-fundamentals'];

  const tagSet = new Set(problem.tags.map((t) => t.toLowerCase()));
  const topic = problem.topicId.toLowerCase();

  if (tagSet.has('strings') || tagSet.has('two pointers')) {
    matched.push('prog-strings-pointers');
  }
  if (tagSet.has('hash table') || topic.includes('hash')) {
    matched.push('prog-hash-tables');
  }
  if (tagSet.has('stack') || topic.includes('stacks')) {
    matched.push('prog-stacks-queues');
  }
  if (tagSet.has('doubly-linked list') || tagSet.has('design')) {
    matched.push('prog-linked-lists');
  }
  if (tagSet.has('heap / priority queue') || tagSet.has('divide & conquer')) {
    matched.push('prog-advanced-heaps');
  }
  if (topic === 'databases' || tagSet.has('sql') || problem.id.includes('sql')) {
    matched.push('lang-sql', 'db-filtering-aggregations');
  }

  matched.push('prog-complexity');
  return Array.from(new Set(matched));
}

/**
 * Maps an Interview category and topic to target skill IDs
 */
export function getSkillsForInterview(category: InterviewCategory, topic?: string): string[] {
  const matched: string[] = [];

  switch (category) {
    case 'technical':
      matched.push('int-concept-articulation', 'int-tradeoff-reasoning', 'prog-complexity');
      if (topic?.toLowerCase().includes('database') || topic?.toLowerCase().includes('sql')) {
        matched.push('db-indexing-performance', 'db-transactions-acid');
      }
      break;
    case 'programming':
      matched.push('prog-fundamentals', 'prog-complexity', 'int-tradeoff-reasoning');
      break;
    case 'sql':
      matched.push('lang-sql', 'db-joins-relations', 'db-filtering-aggregations');
      if (topic?.toLowerCase().includes('index') || topic?.toLowerCase().includes('plan')) {
        matched.push('db-indexing-performance');
      }
      break;
    case 'hr':
    case 'behavioral':
      matched.push('int-star-communication');
      break;
  }

  return Array.from(new Set(matched));
}

/**
 * Structured starter learning paths combining real CodeLab problems & InterviewAI sessions
 */
export const PUBLISHED_LEARNING_PATHS: LearningPath[] = [
  {
    id: 'lp-prog-fundamentals',
    title: 'Programming Foundations & Logic',
    description: 'Master variables, loops, in-place string manipulation, and complexity fundamentals.',
    targetRole: 'Junior Software Engineer',
    difficulty: 'beginner',
    estimatedHours: 15,
    targetSkills: ['prog-fundamentals', 'prog-strings-pointers', 'lang-python', 'lang-javascript'],
    milestones: [
      {
        id: 'ms-pf-1',
        title: 'Solve: Reverse Words in a String',
        description: 'Implement in-place two-pointer string manipulation and formatting.',
        type: 'problem',
        targetSlugOrCategory: 'reverse-words-sentence',
        difficulty: 'absolute_beginner',
        isCompleted: false,
      },
      {
        id: 'ms-pf-2',
        title: 'Interview: Programming Basics Screening',
        description: 'Complete an entry-level mock interview on language syntax and variables.',
        type: 'interview',
        targetSlugOrCategory: 'programming',
        difficulty: 'beginner',
        isCompleted: false,
      },
    ],
    progressPercent: 0,
    isEnrolled: true,
  },
  {
    id: 'lp-dsa-mastery',
    title: 'Data Structures & Algorithmic Problem Solving',
    description: 'Progress from O(1) hash maps to LIFO stacks and priority queues under strict runtime bounds.',
    targetRole: 'Full Stack / Backend Engineer',
    difficulty: 'intermediate',
    estimatedHours: 35,
    targetSkills: ['prog-hash-tables', 'prog-stacks-queues', 'prog-complexity', 'prog-advanced-heaps'],
    milestones: [
      {
        id: 'ms-dsa-1',
        title: 'Solve: Two Sum Target Indices',
        description: 'Optimize brute force O(N^2) to single-pass O(N) using a Hash Map.',
        type: 'problem',
        targetSlugOrCategory: 'two-sum-indices',
        difficulty: 'beginner',
        isCompleted: false,
      },
      {
        id: 'ms-dsa-2',
        title: 'Solve: Balanced Parentheses Validation',
        description: 'Implement a LIFO stack parser to validate nested bracket closures.',
        type: 'problem',
        targetSlugOrCategory: 'valid-parentheses-depth',
        difficulty: 'intermediate',
        isCompleted: false,
      },
      {
        id: 'ms-dsa-3',
        title: 'Interview: Algorithmic Efficiency & Edge Cases',
        description: 'Explain trade-offs between memory allocation and time complexity in a mock interview.',
        type: 'interview',
        targetSlugOrCategory: 'programming',
        difficulty: 'intermediate',
        isCompleted: false,
      },
      {
        id: 'ms-dsa-4',
        title: 'Solve: Merge K Sorted Array Streams',
        description: 'Deploy a Min-Heap priority queue to merge streams in O(N log k).',
        type: 'problem',
        targetSlugOrCategory: 'merge-k-sorted-streams',
        difficulty: 'expert',
        isCompleted: false,
      },
    ],
    progressPercent: 0,
    isEnrolled: true,
  },
  {
    id: 'lp-sql-fundamentals',
    title: 'SQL, Relational Schema & Performance',
    description: 'From relational joins and grouping window functions to B-Tree indexing and ACID concurrency.',
    targetRole: 'Data Engineer / Database Specialist',
    difficulty: 'intermediate',
    estimatedHours: 25,
    targetSkills: ['lang-sql', 'db-filtering-aggregations', 'db-joins-relations', 'db-indexing-performance'],
    milestones: [
      {
        id: 'ms-sql-1',
        title: 'Solve: High Earner Identification by Department',
        description: 'Query top-3 earners across departments using grouping and subqueries.',
        type: 'problem',
        targetSlugOrCategory: 'department-top-salaries',
        difficulty: 'intermediate',
        isCompleted: false,
      },
      {
        id: 'ms-sql-2',
        title: 'Interview: SQL Query Optimization & Indexing',
        description: 'Explain execution plan scan behaviors and composite index design.',
        type: 'interview',
        targetSlugOrCategory: 'sql',
        difficulty: 'intermediate',
        isCompleted: false,
      },
    ],
    progressPercent: 0,
    isEnrolled: true,
  },
  {
    id: 'lp-tech-interview-prep',
    title: 'Comprehensive Technical & Behavioral Readiness',
    description: 'Bridge software engineering problem solving with structured STAR communication and architecture defense.',
    targetRole: 'Senior Software Engineer',
    difficulty: 'advanced',
    estimatedHours: 30,
    targetSkills: ['int-concept-articulation', 'int-tradeoff-reasoning', 'int-star-communication', 'prog-linked-lists'],
    milestones: [
      {
        id: 'ms-ti-1',
        title: 'Solve: LRU Eviction Buffer Implementation',
        description: 'Construct an O(1) eviction buffer combining Doubly-Linked Lists and Hash Maps.',
        type: 'problem',
        targetSlugOrCategory: 'lru-cache-capacity',
        difficulty: 'advanced',
        isCompleted: false,
      },
      {
        id: 'ms-ti-2',
        title: 'Interview: Distributed Systems & Concurrency Screening',
        description: 'Address real-world outage post-mortems and distributed cache stampede mitigation.',
        type: 'interview',
        targetSlugOrCategory: 'technical',
        difficulty: 'advanced',
        isCompleted: false,
      },
      {
        id: 'ms-ti-3',
        title: 'Interview: Behavioral Leadership & Conflict Resolution',
        description: 'Deliver structured STAR narratives on deadline negotiation and team ownership.',
        type: 'interview',
        targetSlugOrCategory: 'behavioral',
        difficulty: 'intermediate',
        isCompleted: false,
      },
    ],
    progressPercent: 0,
    isEnrolled: false,
  },
  {
    id: 'lp-python-foundations',
    title: 'Python Foundations & Idiomatic Code',
    description: 'Master Python syntax, list comprehensions, slicing, standard libraries, and time complexity.',
    targetRole: 'Python / Backend Developer',
    difficulty: 'beginner',
    estimatedHours: 18,
    targetSkills: ['lang-python', 'prog-fundamentals', 'prog-complexity'],
    milestones: [
      {
        id: 'ms-py-1',
        title: 'Solve: Two Sum Target Indices (Python)',
        description: 'Implement an optimal hash dictionary solution in Python 3.',
        type: 'problem',
        targetSlugOrCategory: 'two-sum-indices',
        difficulty: 'beginner',
        isCompleted: false,
      },
      {
        id: 'ms-py-2',
        title: 'Interview: Python Memory Model & Data Types',
        description: 'Demonstrate comprehension of mutable vs immutable types and GIL concepts.',
        type: 'interview',
        targetSlugOrCategory: 'programming',
        difficulty: 'beginner',
        isCompleted: false,
      },
    ],
    progressPercent: 0,
    isEnrolled: false,
  },
  {
    id: 'lp-js-foundations',
    title: 'JavaScript Foundations & Async Runtimes',
    description: 'Master ECMAScript syntax, event loop mechanics, prototype chains, and promise chains.',
    targetRole: 'Frontend / Full Stack Engineer',
    difficulty: 'beginner',
    estimatedHours: 20,
    targetSkills: ['lang-javascript', 'prog-fundamentals', 'prog-strings-pointers'],
    milestones: [
      {
        id: 'ms-js-1',
        title: 'Solve: Reverse Words in a String (JavaScript)',
        description: 'Manipulate string arrays and whitespace parsing in Node.js / V8.',
        type: 'problem',
        targetSlugOrCategory: 'reverse-words-sentence',
        difficulty: 'beginner',
        isCompleted: false,
      },
      {
        id: 'ms-js-2',
        title: 'Interview: Event Loop & Asynchronous Architecture',
        description: 'Explain call stack, microtask queues, and non-blocking I/O execution flow.',
        type: 'interview',
        targetSlugOrCategory: 'technical',
        difficulty: 'intermediate',
        isCompleted: false,
      },
    ],
    progressPercent: 0,
    isEnrolled: false,
  },
];

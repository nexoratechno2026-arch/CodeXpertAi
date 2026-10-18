import { InterviewCategory, InterviewQuestion } from '@/types/interview';
import { SkillLevel } from '@/types/skill';
import { CODEXPERT_900_QUESTIONS } from './interviewCatalog';

export interface QuestionTemplate {
  id?: string;
  topic: string;
  category: InterviewCategory;
  difficulty: SkillLevel;
  questionText: string;
  context?: string;
  expectedCriteria: string[];
  followUps?: string[];
  scoringRubric?: string[];
  starGuidance?: {
    situation?: string;
    task?: string;
    action?: string;
    result?: string;
  };
  tags?: string[];
}

export const QUESTION_BANK: QuestionTemplate[] = [
  // ── 1. TECHNICAL & CS CORE ──
  {
    category: 'technical',
    difficulty: 'absolute_beginner',
    topic: 'Web Fundamentals',
    questionText: 'What happens in the browser when you type a URL like https://google.com and press Enter?',
    context: 'Explain the high-level steps from DNS lookup to rendering the page.',
    expectedCriteria: [
      'Mention DNS resolution from domain name to IP address',
      'Explain TCP handshake and HTTPS TLS negotiation',
      'Mention HTTP GET request and server response',
      'Describe DOM and CSSOM parsing and rendering',
    ],
  },
  {
    category: 'technical',
    difficulty: 'beginner',
    topic: 'HTTP & APIs',
    questionText: 'Explain the difference between synchronous and asynchronous operations in programming, and why async is vital for web servers.',
    context: 'Think about event loops, non-blocking I/O, and user responsiveness.',
    expectedCriteria: [
      'Define blocking vs non-blocking thread behavior',
      'Explain how single-threaded runtimes (like Node.js or browser JS) manage concurrency',
      'Provide an example of an I/O operation (e.g., database query or file read)',
    ],
  },
  {
    category: 'technical',
    difficulty: 'intermediate',
    topic: 'Databases & Concurrency',
    questionText: 'Explain the ACID properties in relational database transactions. Give a concrete example of what happens if the "Isolation" property fails.',
    context: 'Consider an e-commerce checkout or bank balance transfer.',
    expectedCriteria: [
      'Accurately define Atomicity, Consistency, Isolation, and Durability',
      'Describe concurrency phenomena like dirty reads, non-repeatable reads, or phantom reads',
      'Explain how locking or MVCC resolves isolation anomalies',
    ],
  },
  {
    category: 'technical',
    difficulty: 'advanced',
    topic: 'Distributed Systems',
    questionText: 'How would you design a distributed cache invalidation strategy for a microservices architecture with high read-to-write ratios?',
    context: 'Consider cache-aside, write-through, TTLs, and stampede mitigation.',
    expectedCriteria: [
      'Compare write-through, write-behind, and cache-aside patterns',
      'Address cache stampede / thundering herd mitigation using probabilistic early expiration or mutex locks',
      'Explain event-driven invalidation via message brokers (e.g., Kafka / Redis PubSub)',
    ],
  },
  {
    category: 'technical',
    difficulty: 'expert',
    topic: 'High Scale & Reliability',
    questionText: 'Walk through how you would architect a globally distributed rate-limiting service capable of processing 500,000 requests per second across multiple cloud regions while maintaining strict SLA consistency.',
    context: 'Trade off latency, consistency (CAP theorem), sliding window counters, and regional failover.',
    expectedCriteria: [
      'Evaluate Token Bucket vs Sliding Window log algorithms at scale',
      'Address cross-region synchronization trade-offs (eventual consistency vs local Redis clusters with batch reconciliation)',
      'Explain handling partition tolerance during inter-region link failure',
    ],
  },

  // ── 2. PROGRAMMING & DATA STRUCTURES ──
  {
    category: 'programming',
    difficulty: 'absolute_beginner',
    topic: 'Variables & Scope',
    questionText: 'What is the difference between passing arguments by value versus passing by reference? Give an example.',
    expectedCriteria: [
      'Explain that pass-by-value copies the primitive data',
      'Explain that pass-by-reference shares the memory pointer/object reference',
      'Demonstrate how modifying an object inside a function affects the caller',
    ],
  },
  {
    category: 'programming',
    difficulty: 'beginner',
    topic: 'Arrays & Complexity',
    questionText: 'What is Big-O notation, and why is looking up a key in a Hash Map considered O(1) on average, but could degrade to O(N)?',
    expectedCriteria: [
      'Define Big-O as asymptotic worst-case or average-case scaling',
      'Explain hash functions and bucket indexing',
      'Describe hash collisions and chaining vs open addressing',
    ],
  },
  {
    category: 'programming',
    difficulty: 'intermediate',
    topic: 'Data Structures',
    questionText: 'When would you choose a Linked List over an Array, and vice-versa? Discuss memory layout, cache locality, and operations complexity.',
    expectedCriteria: [
      'Compare O(1) insertion/deletion at known nodes vs O(N) array element shifting',
      'Explain CPU cache locality and contiguous memory advantages of dynamic arrays',
      'Discuss pointer overhead in singly and doubly linked nodes',
    ],
  },
  {
    category: 'programming',
    difficulty: 'advanced',
    topic: 'Algorithms & Optimizations',
    questionText: 'Explain how you would detect a cycle in a directed graph, and how you would extract the topological ordering if no cycle exists.',
    expectedCriteria: [
      'Explain DFS with 3-color state tracking (unvisited, visiting, visited)',
      'Explain Kahn algorithm using in-degree array and queue',
      'Discuss time complexity O(V + E) and space complexity O(V)',
    ],
  },
  {
    category: 'programming',
    difficulty: 'expert',
    topic: 'Memory & Concurrency',
    questionText: 'Explain how memory management and garbage collection (such as mark-and-sweep or generational GC) work under heavy allocation pressure, and how you prevent memory leaks in production applications.',
    expectedCriteria: [
      'Explain root references, reachability graphs, and generational heaps (nursery vs tenured)',
      'Discuss stop-the-world pauses and concurrent GC algorithms',
      'Identify concrete memory leak sources (unbounded event listeners, closure retention, global caches)',
    ],
  },

  // ── 3. SQL & DATABASES ──
  {
    category: 'sql',
    difficulty: 'absolute_beginner',
    topic: 'Relational Queries',
    questionText: 'What is the difference between an INNER JOIN and a LEFT JOIN in SQL? Provide a practical scenario where you must use LEFT JOIN.',
    expectedCriteria: [
      'Explain that INNER JOIN returns rows matching both tables',
      'Explain that LEFT JOIN preserves all rows from left table, filling NULLs for non-matches',
      'Provide an example like finding customers who have not placed any orders',
    ],
  },
  {
    category: 'sql',
    difficulty: 'beginner',
    topic: 'Aggregation & Filtering',
    questionText: 'Explain the difference between WHERE and HAVING clauses in an SQL statement. Which executes first?',
    expectedCriteria: [
      'Explain WHERE filters individual rows before grouping',
      'Explain HAVING filters aggregated groups created by GROUP BY',
      'Confirm execution order: FROM -> WHERE -> GROUP BY -> HAVING -> SELECT',
    ],
  },
  {
    category: 'sql',
    difficulty: 'intermediate',
    topic: 'Indexes & Query Plans',
    questionText: 'How does a B-Tree index work in PostgreSQL or MySQL, and why would an index not be used if you apply a function like UPPER(email) in your WHERE clause?',
    expectedCriteria: [
      'Describe balanced B-Tree traversal and logarithmic lookup complexity',
      'Explain that functional transformations prevent index traversal unless functional/expression index is created',
      'Mention EXPLAIN ANALYZE for query execution plan inspection',
    ],
  },
  {
    category: 'sql',
    difficulty: 'advanced',
    topic: 'Window Functions & CTEs',
    questionText: 'Explain the difference between ROW_NUMBER(), RANK(), and DENSE_RANK() window functions. Give an example scenario for each.',
    expectedCriteria: [
      'Define ROW_NUMBER as strictly sequential unique integers',
      'Define RANK as assigning tied ranks and skipping subsequent rank numbers',
      'Define DENSE_RANK as assigning tied ranks without skipping subsequent rank numbers',
    ],
  },
  {
    category: 'sql',
    difficulty: 'expert',
    topic: 'Database Sharding & Partitioning',
    questionText: 'How would you design a database sharding and partitioning strategy for a multi-tenant SaaS application that processes 100 million transactions daily? Address re-sharding and cross-shard queries.',
    expectedCriteria: [
      'Compare range-based, hash-based, and tenant-id directory-based sharding',
      'Discuss table partitioning (declarative range/list partitions) within nodes',
      'Address mitigating cross-shard joins via read replicas, data duplication, or distributed query engines',
    ],
  },

  // ── 4. HR & CULTURAL FIT ──
  {
    category: 'hr',
    difficulty: 'absolute_beginner',
    topic: 'Introduction & Background',
    questionText: 'Tell me about yourself, your educational background, and why you are excited about building a career in software development.',
    expectedCriteria: [
      'Clear, concise narrative articulating motivation and interests',
      'Highlighting relevant projects, learning journey, or technical skills',
      'Professional communication and genuine enthusiasm for continuous growth',
    ],
  },
  {
    category: 'hr',
    difficulty: 'beginner',
    topic: 'Collaboration & Teamwork',
    questionText: 'How do you handle constructive criticism or code review comments on code you spent hours developing?',
    expectedCriteria: [
      'Distinguishing code feedback from personal criticism',
      'Appreciating peer review as a mechanism for code quality and shared learning',
      'Describing a calm, collaborative approach to discussing alternative solutions',
    ],
  },
  {
    category: 'hr',
    difficulty: 'intermediate',
    topic: 'Prioritization & Deadlines',
    questionText: 'Describe a situation where you had competing project deadlines and limited time. How did you prioritize your deliverables and communicate with stakeholders?',
    expectedCriteria: [
      'Framework for prioritizing based on business impact and urgency',
      'Proactive communication with leads or stakeholders regarding trade-offs',
      'Focus on delivering high-value working software over perfect uncompleted scope',
    ],
  },
  {
    category: 'hr',
    difficulty: 'advanced',
    topic: 'Mentorship & Conflict',
    questionText: 'How do you approach disagreements with a senior engineer or product manager regarding technical debt versus new feature development?',
    expectedCriteria: [
      'Framing technical debt in business terms (stability, velocity, cost of bugs)',
      'Active listening and seeking to understand product/business constraints',
      'Data-driven compromise (e.g., allocating 20% sprint capacity for debt)',
    ],
  },
  {
    category: 'hr',
    difficulty: 'expert',
    topic: 'Culture & Engineering Leadership',
    questionText: 'As an experienced engineer, how do you cultivate a blameless post-mortem culture and psychological safety within an engineering team following a major outage?',
    expectedCriteria: [
      'Focusing on process/systemic vulnerabilities rather than individual fault',
      'Structuring actionable retrospectives with tracked preventive measures',
      'Fostering open transparency and psychological safety across junior and senior peers',
    ],
  },

  // ── 5. BEHAVIOURAL & SCENARIO-BASED ──
  {
    category: 'behavioral',
    difficulty: 'absolute_beginner',
    topic: 'Overcoming Obstacles',
    questionText: 'Tell me about a time you encountered a difficult technical bug or concept while learning. How did you break down the problem and resolve it?',
    expectedCriteria: [
      'Using the STAR framework (Situation, Task, Action, Result)',
      'Demonstrating systematic debugging (reading logs, isolating inputs, documentation)',
      'Reflecting on what was learned to avoid similar bugs in the future',
    ],
  },
  {
    category: 'behavioral',
    difficulty: 'beginner',
    topic: 'Initiative & Curiosity',
    questionText: 'Describe a time when you went above and beyond the minimum requirements of a class project or assignment. What motivated you?',
    expectedCriteria: [
      'Identifying an opportunity to improve quality, UX, or test coverage',
      'Taking personal initiative without waiting for explicit instructions',
      'Clear tangible outcome and positive impact',
    ],
  },
  {
    category: 'behavioral',
    difficulty: 'intermediate',
    topic: 'Failure & Resilience',
    questionText: 'Tell me about a project that did not go as planned or failed to meet expectations. What was your role, and what key lesson did you carry forward?',
    expectedCriteria: [
      'Honest accountability without deflecting blame onto others',
      'Clear analysis of the root cause (e.g., communication gap, assumption, underestimation)',
      'Tangible behavioral change implemented in subsequent projects',
    ],
  },
  {
    category: 'behavioral',
    difficulty: 'advanced',
    topic: 'Influence Without Authority',
    questionText: 'Describe a time when you had to convince teammates or leadership to adopt a new architectural pattern, tool, or testing standard. How did you build consensus?',
    expectedCriteria: [
      'Building a prototype or benchmarking data to substantiate the recommendation',
      'Addressing peer concerns and migration overhead collaboratively',
      'Measurable improvement in developer velocity or system stability',
    ],
  },
  {
    category: 'behavioral',
    difficulty: 'expert',
    topic: 'Crisis Management & Ownership',
    questionText: 'Give an example of a high-pressure production incident or critical delivery crunch where you took ownership. How did you lead the team through resolution while keeping stakeholders informed?',
    expectedCriteria: [
      'Decisive triage and containment actions under ambiguity',
      'Clear, periodic status communication to non-technical stakeholders',
      'Post-incident root cause remediation to structurally prevent recurrence',
    ],
  },
  ...CODEXPERT_900_QUESTIONS,
];

/**
 * Generates tailored interview questions based on requested category, role, difficulty, and count.
 */
export function generateQuestionList(
  category: InterviewCategory,
  targetRole: string,
  difficulty: SkillLevel,
  count: number = 5
): InterviewQuestion[] {
  // Filter by matching category
  const categoryPool = QUESTION_BANK.filter((q) => q.category === category);

  // Exact difficulty matches first
  const exactMatches = categoryPool.filter((q) => q.difficulty === difficulty);
  const otherMatches = categoryPool.filter((q) => q.difficulty !== difficulty);

  // Combine exact matches first, followed by other category questions
  const candidatePool = [...exactMatches, ...otherMatches];

  // Select up to count
  const selected = candidatePool.slice(0, count);

  // If pool was smaller than requested count, fill with synthesized templates
  while (selected.length < count) {
    selected.push({
      category,
      difficulty,
      topic: `${category.toUpperCase()} Assessment`,
      questionText: `Discuss key architectural, design, or behavioral considerations for a ${targetRole} working at ${difficulty.replace('_', ' ')} level.`,
      context: 'Structure your response with clear technical principles, trade-offs, and examples.',
      expectedCriteria: [
        'Clear problem formulation and structural reasoning',
        'Identification of core trade-offs and edge cases',
        'Practical real-world application examples',
      ],
    });
  }

  return selected.map((q, idx) => ({
    id: q.id || `q-${category}-${idx + 1}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
    order: idx + 1,
    category: q.category,
    targetRole,
    difficulty: difficulty, // Align to validated session difficulty tier
    topic: q.topic,
    questionText: q.questionText,
    context: q.context,
    scenario: q.context,
    expectedCriteria: q.expectedCriteria,
    evaluationCriteria: q.expectedCriteria,
    followUps: q.followUps,
    scoringRubric: q.scoringRubric,
    starGuidance: q.starGuidance,
    tags: q.tags,
    maxScore: 100,
  }));
}

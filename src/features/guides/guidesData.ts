export interface GuideArticle {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  datePublished: string;
  dateModified: string;
  author: string;
  content: {
    lead: string;
    sections: Array<{
      heading: string;
      subsections?: Array<{
        title: string;
        text: string;
      }>;
      paragraphs: string[];
      keyTakeaway?: string;
    }>;
  };
}

export const GUIDES: GuideArticle[] = [
  {
    slug: 'technical-interview-prep',
    title: 'How to Prepare for Technical Coding Interviews: A Structured Framework',
    excerpt:
      'A practical, step-by-step methodology for mastering algorithmic problem solving, time complexity trade-offs, and live technical communication.',
    category: 'Interview Preparation',
    readTime: '8 min read',
    datePublished: '2026-10-18',
    dateModified: '2026-10-18',
    author: 'CodeXpertAI Technical Curriculum Team',
    content: {
      lead:
        'Preparing for software engineering technical interviews requires more than memorizing algorithmic solutions. True interview readiness is built upon structured problem decomposition, consistent pattern recognition, and the ability to articulate trade-offs under real-time constraints.',
      sections: [
        {
          heading: '1. Understand the Real Objective of Technical Interviews',
          paragraphs: [
            'Many candidates view technical coding interviews as an adversarial test of arcane algorithmic trivia. In reality, modern engineering interviews are designed to assess how you think, communicate, and handle ambiguity.',
            'Interviewers evaluate four distinct dimensions: problem decomposition, algorithmic correctness, code quality, and technical communication. Producing a working solution in silence is rarely sufficient; you must explain your mental model, identify edge cases upfront, and validate your hypotheses before writing code.',
          ],
          keyTakeaway:
            'A working brute-force solution with clear communication and complexity analysis often scores higher than a silent, unverified optimal implementation.',
        },
        {
          heading: '2. Focus on Core Algorithmic Patterns Over Volume',
          paragraphs: [
            'Solving 500 random problems without structure yields diminishing returns. A more effective strategy is mastering the recurring structural patterns that underpin most interview problems.',
            'The highest-yield patterns include: Two Pointers and Sliding Window (for sequential data), Fast & Slow Pointers (for cyclic linked structures), Breadth-First & Depth-First Search (for graph and tree traversals), Binary Search on Answer Spaces, and State-Transition Dynamic Programming.',
          ],
        },
        {
          heading: '3. The 5-Step Live Interview Protocol',
          paragraphs: [
            'When presented with an interview challenge, follow this disciplined sequence to prevent panic and demonstrate senior engineering maturity:',
            'Step 1: Clarify constraints. Ask about input sizes, data types, memory constraints, and edge case handling (e.g., empty arrays, negative integers).',
            'Step 2: Walk through an explicit example manually. Trace inputs to outputs by hand to confirm your understanding.',
            'Step 3: State the brute force approach and analyze its Big-O time and space complexity. This establishes a baseline.',
            'Step 4: Propose an optimized strategy, explaining which data structures reduce time or space overhead.',
            'Step 5: Implement clean, modular code with descriptive variable names, and dry-run with your test cases before saying you are done.',
          ],
          keyTakeaway:
            'Never start typing code into the editor until you and your interviewer agree on the algorithmic approach and Big-O trade-offs.',
        },
        {
          heading: '4. Rehearse Under Realistic Pressure with Mock Interviews',
          paragraphs: [
            'Practicing in isolation does not prepare you for the cognitive load of speaking while typing, answering unexpected follow-up questions, or debugging under observation.',
            'Incorporate interactive mock interview sessions—such as AI-guided interview simulations or peer rehearsals—into your weekly schedule. Rehearsing out loud trains your brain to remain calm, articulate trade-offs, and pivot when an initial approach encounters an unforeseen edge case.',
          ],
        },
      ],
    },
  },
  {
    slug: 'effective-coding-practice',
    title: 'How to Practise Programming Problems Effectively & Interpret Test Results',
    excerpt:
      'Learn how to break down complex challenges, diagnose failed test assertions, and use execution feedback to systematically eliminate knowledge gaps.',
    category: 'Coding Practice',
    readTime: '7 min read',
    datePublished: '2026-10-18',
    dateModified: '2026-10-18',
    author: 'CodeXpertAI Technical Curriculum Team',
    content: {
      lead:
        'Solving coding problems is an active feedback loop. When candidates submit code that fails assertions, times out, or exhausts memory, the ability to interpret sandbox results systematically distinguishes progressing engineers from frustrated ones.',
      sections: [
        {
          heading: '1. Active Problem Analysis vs. Passive Guesswork',
          paragraphs: [
            'Passive practice—jumping immediately to implementation and modifying random lines until tests turn green—creates an illusion of competence. In real technical assessments, hidden test cases penalize trial-and-error.',
            'Active practice requires writing down problem invariants before coding. Identify: What guarantees does the input provide? Is the input sorted? Can elements be negative or duplicate? What is the upper bound on N? If N = 10^5, an O(N^2) solution will definitely trigger a Time Limit Exceeded (TLE) error.',
          ],
          keyTakeaway:
            'Calculate the expected operations count before writing a single line of code. Most online execution sandboxes cap operations at ~10^7 per second.',
        },
        {
          heading: '2. Decoding Execution Sandboxes: TLE, MLE, and Assertion Failures',
          paragraphs: [
            'When an execution sandbox returns an error, treat it as precise diagnostic evidence rather than a generic failure:',
            'Time Limit Exceeded (TLE): Your algorithm exceeds the sandbox runtime cap (typically 1–2 seconds). Look for redundant nested loops, repeated computations that can be cached with memoization, or unnecessary deep object copies inside inner loops.',
            'Memory Limit Exceeded (MLE): Your program allocated more RAM than permitted. Check for infinite recursion call stacks, unbounded arrays, or deep recursion that should be converted to an iterative stack.',
            'Wrong Answer (WA): Your logic works for sample cases but fails on boundary conditions. Consider: N = 0 (empty input), N = 1 (single element), extreme duplicate values, or integer overflow with 32-bit arithmetic.',
          ],
        },
        {
          heading: '3. Using Two-Tier Evaluation (Run vs. Submit) Strategically',
          paragraphs: [
            'Modern platforms like CodeLab separate public sample test verification ("Run Code") from exhaustive evaluation ("Submit").',
            'Use the "Run" phase to print intermediate variables, verify input parsing, and confirm base case recursion. Once the foundation is verified, remove verbose print statements (as stdout writing incurs significant I/O overhead) and execute your "Submit" against private test suites.',
          ],
          keyTakeaway:
            'Excessive debug print statements inside tight loops can inflate execution time by over 300%, turning an optimal solution into a false TLE.',
        },
        {
          heading: '4. The Error Journal: Systematic Knowledge Gap Elimination',
          paragraphs: [
            'Whenever you fail a problem or require a hint, record three facts in an engineering error log: (1) The pattern that was missed, (2) The specific edge case that broke your solution, and (3) The Big-O difference between your initial idea and the optimal solution.',
            'Revisiting past mistakes on spaced repetition cycles produces faster algorithmic intuition than solving unrelated new problems continuously.',
          ],
        },
      ],
    },
  },
  {
    slug: 'ai-mock-interview-guide',
    title: 'Mastering AI-Guided Technical & Behavioral Mock Interviews',
    excerpt:
      'How AI interview engines evaluate candidates, how to structure STAR responses, and how to turn diagnostic session reports into career progress.',
    category: 'AI Interview Insights',
    readTime: '9 min read',
    datePublished: '2026-10-18',
    dateModified: '2026-10-18',
    author: 'CodeXpertAI Technical Curriculum Team',
    content: {
      lead:
        'Generative AI is revolutionizing interview preparation. Modern AI interviewers evaluate conversational cadence, technical vocabulary, problem structuring, and behavioral narratives against standard industry rubrics.',
      sections: [
        {
          heading: '1. How AI Interview Simulators Evaluate Candidates',
          paragraphs: [
            'Unlike static questionnaires, adaptive AI interview engines analyze multi-turn dialogue. They parse your spoken or typed response, detect whether you answered the underlying question, identify missing constraints, and generate contextual follow-up prompts.',
            'In technical sessions, the AI monitors your ability to explain time complexity, compare alternative data structures, and handle system trade-offs. In behavioral sessions, it checks for concrete impact metrics, active ownership, and resolution mechanisms.',
          ],
          keyTakeaway:
            'AI evaluators prioritize specificity over buzzwords. Grounding your response in concrete tools, architectural metrics, and verifiable results scores significantly higher than vague generalizations.',
        },
        {
          heading: '2. The STAR Framework for Behavioral & Engineering Leadership',
          paragraphs: [
            'Behavioral questions—such as "Tell me about a time you resolved a major production outage" or "Describe a disagreement with a team member"—should strictly adhere to the STAR framework:',
            'Situation: Concisely establish the project context, scale, and timeline (1–2 sentences).',
            'Task: Define your specific responsibility and the core conflict or engineering hurdle (1 sentence).',
            'Action: Detail the exact technical decisions, debugging steps, or consensus-building actions you personally took (3–4 sentences). Focus on "I", not "we".',
            'Result: Quantify the outcome using engineering or business metrics—e.g., "reduced latency by 42%", "prevented $50k in SLA penalties", or "shipped ahead of the Sprint deadline".',
          ],
        },
        {
          heading: '3. Technical Concept & System Architecture Best Practices',
          paragraphs: [
            'When asked conceptual or architectural questions (such as "Explain how database indexing works" or "How would you design a distributed rate limiter?"), structure your response top-down:',
            'Begin with a crisp definition or one-sentence architectural summary.',
            'State the primary trade-offs (e.g., read performance vs. write amplification in B-Trees vs. LSM-Trees, or memory consumption vs. distributed consensus in token bucket algorithms).',
            'Provide a concrete scenario illustrating when this technology is ideal versus when an alternative should be selected.',
          ],
          keyTakeaway:
            'Senior engineering communication is defined by trade-offs. Acknowledge that no architecture is universally optimal for every workload.',
        },
        {
          heading: '4. Translating Diagnostic Feedback into Deliberate Practice',
          paragraphs: [
            'The true value of an AI interview lies in post-session diagnostic reports. CodeXpertAI\'s InterviewAI provides structured feedback separating technical correctness from communication fluency.',
            'Review the diagnostic feedback immediately while the conversation is fresh. If the report highlights that you skipped edge-case validation or spoke too vaguely in the Action phase of STAR, configure a targeted follow-up session focusing solely on that dimension.',
          ],
        },
      ],
    },
  },
];

export function getGuideBySlug(slug: string): GuideArticle | undefined {
  return GUIDES.find((g) => g.slug === slug);
}

/**
 * Nexora CodeLab + InterviewAI
 * Voice Chatbot Service - Speech Recognition, Text-to-Speech & Multi-Turn Conversational Guidance Engine
 */

export type VoiceChatbotState =
  | 'idle'
  | 'listening'
  | 'processing'
  | 'speaking'
  | 'error'
  | 'voice_unavailable';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  wasSpoken?: boolean;
}

export interface VoiceCapabilities {
  hasSpeechRecognition: boolean;
  hasSpeechSynthesis: boolean;
}

/**
 * Check browser native speech capabilities
 */
export function checkVoiceCapabilities(): VoiceCapabilities {
  if (typeof window === 'undefined') {
    return { hasSpeechRecognition: false, hasSpeechSynthesis: false };
  }

  const hasSpeechRecognition =
    Boolean((window as any).SpeechRecognition) ||
    Boolean((window as any).webkitSpeechRecognition);

  const hasSpeechSynthesis =
    'speechSynthesis' in window && typeof window.speechSynthesis.speak === 'function';

  return { hasSpeechRecognition, hasSpeechSynthesis };
}

/**
 * Stop active speech synthesis playback immediately
 */
export function stopSpeechSynthesis(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      console.warn('[VoiceChat] Failed to cancel speech synthesis:', e);
    }
  }
}

export interface SpeakOptions {
  pitch?: number;
  rate?: number;
  preferredVoice?: 'female' | 'male';
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: string) => void;
}

/**
 * Enhance technical terms and acronyms for natural spoken pronunciation
 */
export function prepareTechnicalSpeechText(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, 'Code block omitted from spoken audio. Please refer to the text transcript.')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/#+\s/g, '')
    // Technical Acronyms and Pronunciations
    .replace(/\bSQL\b/g, 'S-Q-L')
    .replace(/\bAPIs\b/g, 'A-P-Is')
    .replace(/\bAPI\b/g, 'A-P-I')
    .replace(/\bRESTful\b/gi, 'Restful')
    .replace(/\bJSON\b/g, 'Jason')
    .replace(/\bUUID\b/g, 'U-U-I-D')
    .replace(/\bCLI\b/g, 'C-L-I')
    .replace(/\bCI\/CD\b/g, 'C-I C-D')
    .replace(/\bBig-O\b/gi, 'Big Oh')
    .replace(/\bBig O\b/gi, 'Big Oh')
    .replace(/O\(1\)/g, 'O of 1')
    .replace(/O\(N\)/g, 'O of N')
    .replace(/O\(N\s*log\s*N\)/gi, 'O of N log N')
    .replace(/O\(log\s*N\)/gi, 'O of log N')
    .replace(/O\(N\^2\)/g, 'O of N squared')
    // Conversational pacing: add clean punctuation pause spacing
    .replace(/([.?!])\s+/g, '$1  ')
    .trim();
}

/**
 * Cache voices on load to avoid async voice delay in Chromium browsers
 */
let cachedVoices: SpeechSynthesisVoice[] = [];
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  cachedVoices = window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
}

/**
 * Retrieves best-matching natural English voice
 */
export function getBestEnglishVoice(preference: 'female' | 'male' = 'female'): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  const englishVoices = voices.filter((v) => v.lang.startsWith('en'));

  if (preference === 'female') {
    // 1. Premium Neural / Natural voices (Edge / Chrome)
    const naturalFemale = englishVoices.find(
      (v) =>
        (v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Online')) &&
        (v.name.includes('Jenny') || v.name.includes('Aria') || v.name.includes('Female'))
    );
    if (naturalFemale) return naturalFemale;

    // 2. High-tier Google voices
    const googleFemale = englishVoices.find((v) => v.name.includes('Google') && v.name.includes('US English'));
    if (googleFemale) return googleFemale;

    // 3. Platform standard female voices
    const standardFemale = englishVoices.find(
      (v) =>
        v.name.includes('Jenny') ||
        v.name.includes('Aria') ||
        v.name.includes('Zira') ||
        v.name.includes('Samantha') ||
        v.name.includes('Victoria') ||
        v.name.includes('Karen') ||
        v.name.toLowerCase().includes('female')
    );
    if (standardFemale) return standardFemale;
  }

  // Fallback to any natural English voice
  const naturalFallback = englishVoices.find((v) => v.name.includes('Natural') || v.name.includes('Google'));
  if (naturalFallback) return naturalFallback;

  return englishVoices[0] || voices[0] || null;
}

/**
 * Play text via browser Web Speech Synthesis
 */
export function speakText(
  text: string,
  optionsOrOnStart?: SpeakOptions | (() => void),
  onEndParam?: () => void,
  onErrorParam?: (err: string) => void
): SpeechSynthesisUtterance | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (typeof optionsOrOnStart === 'object' && optionsOrOnStart?.onError) {
      optionsOrOnStart.onError('Speech synthesis is not supported on this platform.');
    } else if (onErrorParam) {
      onErrorParam('Speech synthesis is not supported on this platform.');
    }
    return null;
  }

  const options: SpeakOptions =
    typeof optionsOrOnStart === 'object' && optionsOrOnStart !== null
      ? optionsOrOnStart
      : {
          onStart: typeof optionsOrOnStart === 'function' ? optionsOrOnStart : undefined,
          onEnd: onEndParam,
          onError: onErrorParam,
        };

  // Cancel any ongoing utterance before speaking new text
  stopSpeechSynthesis();

  const cleanSpeechText = prepareTechnicalSpeechText(text);

  if (!cleanSpeechText) {
    if (options.onEnd) options.onEnd();
    return null;
  }

  try {
    const utterance = new SpeechSynthesisUtterance(cleanSpeechText);
    utterance.lang = 'en-US';
    utterance.rate = options.rate ?? 0.98;
    utterance.pitch = options.pitch ?? 1.02;

    const selectedVoice = getBestEnglishVoice(options.preferredVoice ?? 'female');
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
      if (options.onStart) options.onStart();
    };

    utterance.onend = () => {
      if (options.onEnd) options.onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('[VoiceChat] Speech synthesis error:', e);
      if (options.onError) options.onError('Speech playback encountered an error.');
      if (options.onEnd) options.onEnd();
    };

    window.speechSynthesis.speak(utterance);
    return utterance;
  } catch (err) {
    console.warn('[VoiceChat] speakText exception:', err);
    if (options.onError) options.onError('Unable to speak text.');
    return null;
  }
}

/**
 * Safety and integrity boundary keywords:
 * Guard against requests attempting to extract hidden evaluation tests,
 * private reference solutions, or administrative credentials.
 */
const SENSITIVE_PROMPTS = [
  'reference solution',
  'hidden test',
  'private test',
  'test case output',
  'show solution',
  'give me the answer',
  'give me the full code',
  'bypass tests',
  'admin password',
  'all submissions of',
  'firebase key',
  'hack',
  'cheat',
];

type TopicKey =
  | 'dynamic_programming'
  | 'two_pointers'
  | 'sliding_window'
  | 'binary_search'
  | 'kadane'
  | 'graph_tree'
  | 'linked_list'
  | 'lru_cache'
  | 'sql_database'
  | 'system_design'
  | 'star_behavioral'
  | 'python_programming'
  | 'javascript_programming'
  | 'interview_strategy'
  | 'navigation'
  | 'general';

export interface ConversationTopicMeta {
  key: TopicKey;
  label: string;
}

/**
 * Extract active topic from current query or prior message turns
 */
function detectActiveTopic(text: string): TopicKey | null {
  const t = text.toLowerCase();
  if (t.includes('dynamic programming') || t.includes(' dp ') || t.includes('memoization') || t.includes('tabulation')) {
    return 'dynamic_programming';
  }
  if (t.includes('two pointer') || t.includes('two pointers') || t.includes('fast and slow')) {
    return 'two_pointers';
  }
  if (t.includes('sliding window')) {
    return 'sliding_window';
  }
  if (t.includes('binary search') || t.includes('bsearch') || t.includes('log n')) {
    return 'binary_search';
  }
  if (t.includes('kadane') || t.includes('maximum subarray')) {
    return 'kadane';
  }
  if (t.includes('tree') || t.includes('graph') || t.includes('bfs') || t.includes('dfs') || t.includes('topological')) {
    return 'graph_tree';
  }
  if (t.includes('linked list') || t.includes('node') || t.includes('reverse list')) {
    return 'linked_list';
  }
  if (t.includes('lru') || t.includes('cache') || t.includes('least recently used')) {
    return 'lru_cache';
  }
  if (t.includes('sql') || t.includes('query') || t.includes('join') || t.includes('group by') || t.includes('indexing')) {
    return 'sql_database';
  }
  if (t.includes('system design') || t.includes('sharding') || t.includes('load balance') || t.includes('rate limit')) {
    return 'system_design';
  }
  if (t.includes('star') || t.includes('behavioral') || t.includes('conflict') || t.includes('weakness') || t.includes('strength')) {
    return 'star_behavioral';
  }
  if (t.includes('python') || t.includes('list comprehension') || t.includes('gil')) {
    return 'python_programming';
  }
  if (t.includes('javascript') || t.includes('react') || t.includes('closure') || t.includes('promise') || t.includes('event loop')) {
    return 'javascript_programming';
  }
  if (t.includes('interview') || t.includes('mock') || t.includes('nervous') || t.includes('practice tips') || t.includes('advice')) {
    return 'interview_strategy';
  }
  if (t.includes('where') || t.includes('navigate') || t.includes('how to find') || t.includes('page') || t.includes('codelab')) {
    return 'navigation';
  }
  return null;
}

/**
 * Scan recent history to find the most recent active topic discussed
 */
function findTopicFromHistory(history: ChatMessage[]): TopicKey | null {
  if (!history || history.length === 0) return null;
  // Look backwards from the most recent messages
  for (let i = history.length - 1; i >= 0; i--) {
    const msg = history[i];
    const detected = detectActiveTopic(msg.text);
    if (detected && detected !== 'navigation') {
      return detected;
    }
  }
  return null;
}

/**
 * Generate AI Assistant response for voice and text chat.
 * Multi-turn context-aware engine that tracks conversation history, resolves follow-ups,
 * and eliminates repetitive boilerplate while safeguarding academic integrity.
 */
export async function generateChatbotResponse(
  query: string,
  history: ChatMessage[] = []
): Promise<string> {
  const normalized = query.toLowerCase().trim();

  if (!normalized) {
    return "I'm listening! You can ask me about algorithmic patterns, system design, mock interview strategies, or how to navigate CodeXpertai.";
  }

  // 1. Academic Integrity Guardrail
  if (SENSITIVE_PROMPTS.some((kw) => normalized.includes(kw))) {
    return (
      "To uphold academic integrity and guide your learning, I cannot disclose private reference solutions or hidden evaluation test cases. " +
      "Instead, let's break down the algorithm step-by-step! Which data structure or edge case would you like to explore?"
    );
  }

  // 2. Identify Current Query Intent and Prior Conversation Context
  const isFollowUp =
    normalized.includes('example') ||
    normalized.includes('sample') ||
    normalized.includes('code') ||
    normalized.includes('python') ||
    normalized.includes('javascript') ||
    normalized.includes('how does that work') ||
    normalized.includes('how to code') ||
    normalized.includes('explain more') ||
    normalized.includes('elaborate') ||
    normalized.includes('tell me more') ||
    normalized.includes('why') ||
    normalized.includes('what is the time complexity') ||
    normalized.includes('complexity') ||
    normalized.includes('edge case') ||
    normalized.includes('what about') ||
    normalized.includes('can you clarify');

  const explicitTopic = detectActiveTopic(normalized);
  const historyTopic = findTopicFromHistory(history);
  // Prioritize prior algorithm context over generic language qualifiers on follow-up turns
  const activeTopic = (isFollowUp && historyTopic) ? historyTopic : (explicitTopic || historyTopic || 'general');

  // Handle follow-up queries using conversational memory of activeTopic
  if (isFollowUp && activeTopic !== 'general') {
    switch (activeTopic) {
      case 'dynamic_programming':
        if (normalized.includes('code') || normalized.includes('python') || normalized.includes('example')) {
          return (
            "Here is a classic Python example for Dynamic Programming using the Coin Change problem: " +
            "We define `dp[a]` as the minimum coins needed to make amount `a`. " +
            "Initialize `dp = [float('inf')] * (amount + 1)` with base case `dp[0] = 0`. " +
            "Then iterate for each coin and each amount from coin to `amount`: `dp[a] = min(dp[a], 1 + dp[a - coin])`. " +
            "This converts an exponential O(S^N) recursive branching tree into an optimal O(Amount × Coins) solution!"
          );
        }
        if (normalized.includes('complexity') || normalized.includes('runtime')) {
          return (
            "In Dynamic Programming, time complexity is calculated as: (Number of distinct subproblems) × (Time spent per subproblem). " +
            "Space complexity corresponds to the size of your memoization cache or DP table. You can often optimize space from O(N) to O(1) " +
            "if each step only requires the previous one or two states (like in Fibonacci or House Robber)!"
          );
        }
        return (
          "When approaching Dynamic Programming, follow the 4-step framework: " +
          "1. Define the state subproblem clearly (e.g. dp[i] is the optimal solution ending at index i). " +
          "2. Establish the transition relation connecting dp[i] to earlier subproblems. " +
          "3. Define boundary base cases. " +
          "4. Determine evaluation order (forward iteration or backward recursion with memoization)."
        );

      case 'two_pointers':
        if (normalized.includes('code') || normalized.includes('example')) {
          return (
            "A standard Two Pointers example in Python for checking a Palindrome: " +
            "`left, right = 0, len(s) - 1`. While `left < right`: if `s[left] != s[right]`, return False, otherwise `left += 1` and `right -= 1`. Return True. " +
            "Notice how both pointers move inwards, inspecting each character at most once for an optimal O(N) runtime and O(1) space!"
          );
        }
        if (normalized.includes('complexity')) {
          return (
            "The Two Pointers pattern strictly runs in O(N) linear time because each pointer advances monotonically without backtracking. " +
            "Its primary advantage over nested loops is cutting O(N²) quadratic brute-force operations down to O(N) with zero extra memory allocation (O(1) space)."
          );
        }
        return (
          "Two Pointers has three primary variations: " +
          "1. Inward-converging pointers: starting at both boundaries of a sorted collection (like 2Sum in sorted array). " +
          "2. Fast & Slow pointers: moving at different speeds (Floyd's Cycle Detection in linked lists). " +
          "3. Co-directional window pointers: maintaining a dynamic boundary for substring or subarray checks."
        );

      case 'sliding_window':
        return (
          "For Sliding Window, the key invariant is: expand the right pointer to find valid windows, and shrink the left pointer as soon as a constraint is broken. " +
          "For example, in 'Longest Substring Without Repeating Characters', we expand `right`, add characters to a hash set, and if a duplicate appears, we increment `left` " +
          "and remove elements from the set until the substring is unique again. Every element is visited at most twice, guaranteeing O(N) execution."
        );

      case 'binary_search':
        return (
          "In Binary Search, common edge cases include: " +
          "1. Preventing 32-bit integer overflow by using `mid = left + (right - left) // 2`. " +
          "2. Avoiding infinite loops: if using `while left <= right`, update with `left = mid + 1` or `right = mid - 1`. " +
          "3. Handling duplicate elements when searching for first or last insertion indices."
        );

      case 'sql_database':
        return (
          "In SQL optimization, remember: " +
          "1. Place filtering criteria in `WHERE` clauses rather than filtering after aggregation in `HAVING`. " +
          "2. Prefer `EXISTS` over `IN` when evaluating subqueries on large datasets. " +
          "3. Check indexes on columns frequently used in `JOIN` conditions and `ORDER BY` clauses to eliminate costly table scans."
        );

      case 'star_behavioral':
        return (
          "In the STAR behavioral framework, the Action step should take ~60% of your response time: " +
          "Focus on what YOU specifically engineered, decided, or influenced. Use active verbs ('I refactored the database schema', 'I initiated a team retrospective', 'I benchmarked three caching solutions'). " +
          "Avoid passive group language like 'we did this' when the interviewer is evaluating your personal technical ownership."
        );

      default:
        break;
    }
  }

  // 3. Navigation Assistance
  if (normalized.includes('where') || normalized.includes('how to find') || normalized.includes('navigate') || normalized.includes('go to')) {
    if (normalized.includes('codelab') || normalized.includes('problem') || normalized.includes('coding')) {
      return (
        "You can explore coding challenges by clicking 'CodeLab' in the main navigation or visiting /codelab/problems. " +
        "There you will find 120+ curated challenges categorized by Easy, Medium, and Hard, covering Arrays, Graphs, Dynamic Programming, and SQL."
      );
    }
    if (normalized.includes('live') || normalized.includes('interview') || normalized.includes('mock')) {
      return (
        "To start a mock interview, navigate to 'InterviewAI' in the header. " +
        "You can select your focus area (Technical, System Design, or Behavioral) and launch either a standard session or a Live One-on-One Video Interview with Elena Vance or Dr. Sophia Chen at /interview/live!"
      );
    }
    if (normalized.includes('profile') || normalized.includes('progress') || normalized.includes('settings')) {
      return (
        "You can inspect your measured topic proficiencies, streaks, badges, and account preferences in your Student Profile at /profile."
      );
    }
  }

  // 4. Algorithmic Tutoring & Direct Technical Explanations
  if (normalized.includes('kadane')) {
    return (
      "Kadane's algorithm finds the maximum contiguous subarray sum in linear O(N) time. " +
      "At each element, you decide whether to extend the current subarray sum or start fresh from the current number: " +
      "`current_sum = max(num, current_sum + num)`, keeping track of `max_sum = max(max_sum, current_sum)` across the traversal."
    );
  }

  if (normalized.includes('two pointer') || normalized.includes('two pointers')) {
    return (
      "The Two Pointers pattern involves traversing an array or linked list using two indices. " +
      "Common variants include opposite-end pointers (used for sorted pair sums or palindrome checks) and fast/slow pointers (used for cycle detection). " +
      "It typically cuts quadratic O(N²) brute-force approaches down to linear O(N) time with O(1) space."
    );
  }

  if (normalized.includes('sliding window')) {
    return (
      "The Sliding Window technique is ideal for contiguous subsegments. " +
      "You expand a right pointer to absorb elements into the window, and contract a left pointer whenever problem constraints are violated. " +
      "Because each element enters and leaves the window at most once, the algorithm achieves optimal O(N) runtime."
    );
  }

  if (normalized.includes('dynamic programming') || normalized.includes(' dp ')) {
    return (
      "Dynamic Programming solves problems with overlapping subproblems and optimal substructure. " +
      "The standard recipe is: 1) Identify state variables, 2) Write the recurrence relation, 3) Set base cases, and 4) Choose memoization (top-down) or tabulation (bottom-up)."
    );
  }

  if (normalized.includes('binary search')) {
    return (
      "Binary Search is a divide-and-conquer strategy that runs in O(log N) time on monotonic search spaces. " +
      "Always compute the midpoint as `left + Math.floor((right - left) / 2)` to prevent integer overflow, and ensure loop boundaries align with inclusive or exclusive intervals."
    );
  }

  if (normalized.includes('reverse words') || normalized.includes('reverse string')) {
    return (
      "To reverse words in a sentence: trim leading/trailing spaces, split tokens by consecutive whitespace, reverse the token array, and join with single spaces. " +
      "In Python, ` ' '.join(s.split()[::-1]) ` handles irregular multi-space intervals cleanly in O(N) time."
    );
  }

  if (normalized.includes('lru cache') || normalized.includes('lru')) {
    return (
      "A Least Recently Used (LRU) Cache provides O(1) average time for both get and put operations. " +
      "The standard architecture pairs a Hash Map with a Doubly Linked List: the Hash Map maps keys directly to list nodes, while the Doubly Linked List allows O(1) node removal and insertion at the head upon access."
    );
  }

  if (normalized.includes('bfs') || normalized.includes('dfs') || normalized.includes('graph') || normalized.includes('tree')) {
    return (
      "Breadth-First Search (BFS) explores level-by-level using a Queue (ideal for shortest paths in unweighted graphs). " +
      "Depth-First Search (DFS) explores as deep as possible using a Stack or recursion (ideal for cycle detection, topological sorting, and path existence). " +
      "Always maintain a `visited` set to avoid infinite cycles in general graphs!"
    );
  }

  if (normalized.includes('sharding') || normalized.includes('system design') || normalized.includes('load balance') || normalized.includes('rate limit')) {
    return (
      "Database sharding horizontally partitions rows across multiple autonomous database nodes. " +
      "The primary trade-offs include: immense write scalability and reduced blast radius versus complex cross-shard joins, data rebalancing overhead, and distributed transaction management."
    );
  }

  if (normalized.includes('sql') || normalized.includes('database') || normalized.includes('join')) {
    return (
      "In SQL, an INNER JOIN returns matching rows between both tables, a LEFT JOIN preserves all rows from the left table even if right table matches are null, " +
      "and window functions like `ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC)` allow ranking within groups without collapsing row granularity like `GROUP BY` does."
    );
  }

  if (normalized.includes('star method') || normalized.includes('behavioral')) {
    return (
      "The STAR framework is the industry gold standard for behavioral interviews: " +
      "Situation (set the engineering context in 1-2 sentences), Task (clarify the exact challenge or goal), " +
      "Action (detail what you specifically engineered, solved, or communicated), and Result (share measurable business or technical outcomes, like 'reduced latency by 35%')."
    );
  }

  if (normalized.includes('interview tip') || normalized.includes('prep') || normalized.includes('advice')) {
    return (
      "Here are three critical interview habits: " +
      "1. Clarify constraints and input bounds before writing code. " +
      "2. Think out loud to let the interviewer follow your reasoning before committing to an approach. " +
      "3. Walk through a test case manually to catch off-by-one errors and edge conditions."
    );
  }

  if (normalized.includes('hello') || normalized.includes('hi') || normalized.includes('hey')) {
    return (
      "Hello! I am your CodeXpertai AI study coach. " +
      "What algorithmic pattern, programming language, or interview scenario would you like to practice today?"
    );
  }

  // 5. Intelligent Dynamic Fallback (Tailored to query keywords rather than static single template)
  const STOP_WORDS = new Set([
    'how', 'what', 'why', 'when', 'where', 'which', 'who', 'whom',
    'can', 'could', 'would', 'should', 'will', 'does', 'did', 'are', 'was', 'were',
    'the', 'and', 'for', 'with', 'about', 'handle', 'explain', 'tell', 'show', 'give'
  ]);
  const meaningfulTokens = normalized
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
  const primaryTopicWord = meaningfulTokens[0] || 'this topic';

  return (
    `When addressing ${primaryTopicWord}: start by clarifying input constraints, identifying edge cases (like empty collections or boundary values), and evaluating if an existing pattern like two pointers, hashing, or a greedy choice applies. ` +
    `Would you like to walk through a concrete example or explore related problems in CodeLab?`
  );
}

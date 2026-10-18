import { Problem, ProblemTestCase, StarterCodeMap } from '@/types/codelab';
import {
  EXPANDED_REFERENCE_SOLUTIONS,
  EXPANDED_PROBLEMS,
  EXPANDED_TEST_CASES,
} from './expandedProblems';
import {
  CURATED_120_PROBLEMS,
  CURATED_120_TEST_CASES,
  CURATED_120_REFERENCE_SOLUTIONS,
} from './curatedProblems';

// ─────────────────────────────────────────────────────────────────────────────
// REFERENCE SOLUTIONS (PRIVATE SERVER STORE)
// Kept strictly isolated on server/backend. Never exposed in public student DTOs.
// ─────────────────────────────────────────────────────────────────────────────
export const SEED_REFERENCE_SOLUTIONS: Record<string, StarterCodeMap> = {
  'prob-reverse-words': {
    python: `def reverse_words(s: str) -> str:
    # Write your solution here
    words = s.split()
    return " ".join(reversed(words))

# Test execution wrapper
import sys
if __name__ == '__main__':
    input_str = sys.stdin.read().strip()
    print(reverse_words(input_str))
`,
    javascript: `/**
 * @param {string} s
 * @return {string}
 */
function reverseWords(s) {
  // Write your solution here
  return s.trim().split(/\\s+/).reverse().join(' ');
}

const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim();
console.log(reverseWords(input));
`,
    typescript: `function reverseWords(s: string): string {
  // Write your solution here
  return s.trim().split(/\\s+/).reverse().join(' ');
}

import * as fs from 'fs';
const input = fs.readFileSync(0, 'utf-8').trim();
console.log(reverseWords(input));
`,
    java: `import java.util.*;

public class Solution {
    public static String reverseWords(String s) {
        String[] parts = s.trim().split("\\\\s+");
        StringBuilder sb = new StringBuilder();
        for (int i = parts.length - 1; i >= 0; i--) {
            sb.append(parts[i]);
            if (i > 0) sb.append(" ");
        }
        return sb.toString();
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        if (scanner.hasNextLine()) {
            String line = scanner.nextLine();
            System.out.println(reverseWords(line));
        }
    }
}
`,
    cpp: `#include <iostream>
#include <string>
#include <vector>
#include <sstream>
#include <algorithm>

using namespace std;

string reverseWords(string s) {
    stringstream ss(s);
    string word;
    vector<string> words;
    while (ss >> word) {
        words.push_back(word);
    }
    reverse(words.begin(), words.end());
    string res = "";
    for (size_t i = 0; i < words.size(); ++i) {
        if (i > 0) res += " ";
        res += words[i];
    }
    return res;
}

int main() {
    string line;
    if (getline(cin, line)) {
        cout << reverseWords(line) << endl;
    }
    return 0;
}
`,
  },
  'prob-two-sum': {
    python: `import sys

def two_sum(target: int, nums: list[int]) -> list[int]:
    lookup = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in lookup:
            return [lookup[complement], i]
        lookup[num] = i
    return []

if __name__ == '__main__':
    lines = sys.stdin.read().strip().splitlines()
    if len(lines) >= 2:
        target = int(lines[0].strip())
        nums = list(map(int, lines[1].strip().split()))
        res = two_sum(target, nums)
        print(f"{res[0]} {res[1]}")
`,
    javascript: `const fs = require('fs');

function twoSum(target, nums) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) {
      return [map.get(diff), i];
    }
    map.set(nums[i], i);
  }
  return [];
}

const input = fs.readFileSync(0, 'utf-8').trim().split('\\n');
if (input.length >= 2) {
  const target = parseInt(input[0].trim(), 10);
  const nums = input[1].trim().split(/\\s+/).map(Number);
  const res = twoSum(target, nums);
  console.log(res.join(' '));
}
`,
    typescript: `import * as fs from 'fs';

function twoSum(target: number, nums: number[]): number[] {
  const map = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) {
      return [map.get(diff)!, i];
    }
    map.set(nums[i], i);
  }
  return [];
}

const lines = fs.readFileSync(0, 'utf-8').trim().split('\\n');
if (lines.length >= 2) {
  const target = parseInt(lines[0].trim(), 10);
  const nums = lines[1].trim().split(/\\s+/).map(Number);
  const res = twoSum(target, nums);
  console.log(res.join(' '));
}
`,
    java: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int target = sc.nextInt();
            List<Integer> nums = new ArrayList<>();
            while (sc.hasNextInt()) {
                nums.add(sc.nextInt());
            }
            Map<Integer, Integer> map = new HashMap<>();
            for (int i = 0; i < nums.size(); i++) {
                int diff = target - nums.get(i);
                if (map.containsKey(diff)) {
                    System.out.println(map.get(diff) + " " + i);
                    return;
                }
                map.put(nums.get(i), i);
            }
        }
    }
}
`,
    cpp: `#include <iostream>
#include <vector>
#include <unordered_map>

using namespace std;

int main() {
    int target;
    if (cin >> target) {
        vector<int> nums;
        int val;
        while (cin >> val) {
            nums.push_back(val);
        }
        unordered_map<int, int> lookup;
        for (int i = 0; i < nums.size(); ++i) {
            int diff = target - nums[i];
            if (lookup.count(diff)) {
                cout << lookup[diff] << " " << i << endl;
                return 0;
            }
            lookup[nums[i]] = i;
        }
    }
    return 0;
}
`,
  },
  'prob-valid-parentheses': {
    python: `import sys

def is_valid(s: str) -> bool:
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    for char in s:
        if char in mapping:
            top = stack.pop() if stack else '#'
            if mapping[char] != top:
                return False
        else:
            stack.append(char)
    return not stack

if __name__ == '__main__':
    line = sys.stdin.read().strip()
    print("true" if is_valid(line) else "false")
`,
    javascript: `const fs = require('fs');

function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (const char of s) {
    if (map[char]) {
      const top = stack.length ? stack.pop() : '#';
      if (top !== map[char]) return false;
    } else {
      stack.push(char);
    }
  }
  return stack.length === 0;
}

const input = fs.readFileSync(0, 'utf-8').trim();
console.log(isValid(input) ? 'true' : 'false');
`,
    typescript: `import * as fs from 'fs';

function isValid(s: string): boolean {
  const stack: string[] = [];
  const map: Record<string, string> = { ')': '(', '}': '{', ']': '[' };
  for (const char of s) {
    if (map[char]) {
      const top = stack.pop() ?? '#';
      if (top !== map[char]) return false;
    } else {
      stack.push(char);
    }
  }
  return stack.length === 0;
}

const input = fs.readFileSync(0, 'utf-8').trim();
console.log(isValid(input) ? 'true' : 'false');
`,
    java: `import java.util.*;

public class Solution {
    public static boolean isValid(String s) {
        Deque<Character> stack = new ArrayDeque<>();
        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');
            else if (c == '{') stack.push('}');
            else if (c == '[') stack.push(']');
            else if (stack.isEmpty() || stack.pop() != c) return false;
        }
        return stack.isEmpty();
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            String s = sc.nextLine().trim();
            System.out.println(isValid(s) ? "true" : "false");
        }
    }
}
`,
    cpp: `#include <iostream>
#include <string>
#include <stack>

using namespace std;

bool isValid(const string& s) {
    stack<char> st;
    for (char c : s) {
        if (c == '(') st.push(')');
        else if (c == '{') st.push('}');
        else if (c == '[') st.push(']');
        else {
            if (st.empty() || st.top() != c) return false;
            st.pop();
        }
    }
    return st.empty();
}

int main() {
    string line;
    if (getline(cin, line)) {
        cout << (isValid(line) ? "true" : "false") << endl;
    }
    return 0;
}
`,
  },
  'prob-lru-cache': {
    python: `import sys
from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = OrderedDict()

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key)
        return self.cache[key]

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.capacity:
            self.cache.popitem(last=False)

if __name__ == '__main__':
    lines = sys.stdin.read().strip().splitlines()
    if not lines:
        sys.exit(0)
    cap = int(lines[0].strip())
    lru = LRUCache(cap)
    for line in lines[1:]:
        parts = line.strip().split()
        if not parts or parts[0] == 'exit':
            break
        if parts[0] == 'get':
            print(lru.get(int(parts[1])))
        elif parts[0] == 'put':
            lru.put(int(parts[1]), int(parts[2]))
`,
    javascript: `const fs = require('fs');

class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
  }

  get(key) {
    if (!this.map.has(key)) return -1;
    const val = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, val);
    return val;
  }

  put(key, value) {
    if (this.map.has(key)) {
      this.map.delete(key);
    }
    this.map.set(key, value);
    if (this.map.size > this.capacity) {
      const oldestKey = this.map.keys().next().value;
      this.map.delete(oldestKey);
    }
  }
}

const lines = fs.readFileSync(0, 'utf-8').trim().split('\\n');
if (lines.length > 0 && lines[0].trim()) {
  const cap = parseInt(lines[0].trim(), 10);
  const lru = new LRUCache(cap);
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].trim().split(/\\s+/);
    if (!parts[0] || parts[0] === 'exit') break;
    if (parts[0] === 'get') {
      console.log(lru.get(parseInt(parts[1], 10)));
    } else if (parts[0] === 'put') {
      lru.put(parseInt(parts[1], 10), parseInt(parts[2], 10));
    }
  }
}
`,
    typescript: `import * as fs from 'fs';

class LRUCache {
  private capacity: number;
  private map: Map<number, number>;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.map = new Map();
  }

  get(key: number): number {
    if (!this.map.has(key)) return -1;
    const val = this.map.get(key)!;
    this.map.delete(key);
    this.map.set(key, val);
    return val;
  }

  put(key: number, value: number): void {
    if (this.map.has(key)) {
      this.map.delete(key);
    }
    this.map.set(key, value);
    if (this.map.size > this.capacity) {
      const oldestKey = this.map.keys().next().value;
      if (oldestKey !== undefined) this.map.delete(oldestKey);
    }
  }
}

const lines = fs.readFileSync(0, 'utf-8').trim().split('\\n');
if (lines.length > 0 && lines[0].trim()) {
  const cap = parseInt(lines[0].trim(), 10);
  const lru = new LRUCache(cap);
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].trim().split(/\\s+/);
    if (!parts[0] || parts[0] === 'exit') break;
    if (parts[0] === 'get') {
      console.log(lru.get(parseInt(parts[1], 10)));
    } else if (parts[0] === 'put') {
      lru.put(parseInt(parts[1], 10), parseInt(parts[2], 10));
    }
  }
}
`,
    java: `import java.util.*;

public class Solution {
    static class LRUCache extends LinkedHashMap<Integer, Integer> {
        private final int capacity;

        public LRUCache(int capacity) {
            super(capacity, 0.75f, true);
            this.capacity = capacity;
        }

        public int get(int key) {
            return super.getOrDefault(key, -1);
        }

        public void put(int key, int value) {
            super.put(key, value);
        }

        @Override
        protected boolean removeEldestEntry(Map.Entry<Integer, Integer> eldest) {
            return size() > capacity;
        }
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int cap = sc.nextInt();
            LRUCache lru = new LRUCache(cap);
            while (sc.hasNext()) {
                String cmd = sc.next();
                if (cmd.equals("exit")) break;
                if (cmd.equals("get")) {
                    int k = sc.nextInt();
                    System.out.println(lru.get(k));
                } else if (cmd.equals("put")) {
                    int k = sc.nextInt();
                    int v = sc.nextInt();
                    lru.put(k, v);
                }
            }
        }
    }
}
`,
    cpp: `#include <iostream>
#include <unordered_map>
#include <list>
#include <string>

using namespace std;

class LRUCache {
    int cap;
    list<pair<int, int>> order;
    unordered_map<int, list<pair<int, int>>::iterator> lookup;

public:
    LRUCache(int capacity) : cap(capacity) {}

    int get(int key) {
        if (!lookup.count(key)) return -1;
        order.splice(order.begin(), order, lookup[key]);
        return lookup[key]->second;
    }

    void put(int key, int value) {
        if (lookup.count(key)) {
            order.splice(order.begin(), order, lookup[key]);
            lookup[key]->second = value;
            return;
        }
        if (order.size() >= cap) {
            int oldKey = order.back().first;
            order.pop_back();
            lookup.erase(oldKey);
        }
        order.emplace_front(key, value);
        lookup[key] = order.begin();
    }
};

int main() {
    int cap;
    if (cin >> cap) {
        LRUCache lru(cap);
        string cmd;
        while (cin >> cmd && cmd != "exit") {
            if (cmd == "get") {
                int k; cin >> k;
                cout << lru.get(k) << endl;
            } else if (cmd == "put") {
                int k, v; cin >> k >> v;
                lru.put(k, v);
            }
        }
    }
    return 0;
}
`,
  },
  'prob-merge-k-sorted': {
    python: `import sys
import heapq

def merge_k_sorted(arrays: list[list[int]]) -> list[int]:
    heap = []
    # (val, array_idx, element_idx)
    for i, arr in enumerate(arrays):
        if arr:
            heapq.heappush(heap, (arr[0], i, 0))
    
    result = []
    while heap:
        val, arr_i, elem_i = heapq.heappop(heap)
        result.append(val)
        if elem_i + 1 < len(arrays[arr_i]):
            heapq.heappush(heap, (arrays[arr_i][elem_i + 1], arr_i, elem_i + 1))
    return result

if __name__ == '__main__':
    lines = sys.stdin.read().strip().splitlines()
    if lines:
        k = int(lines[0].strip())
        arrays = []
        for i in range(1, k + 1):
            if i < len(lines):
                tokens = list(map(int, lines[i].strip().split()))
                if tokens:
                    length = tokens[0]
                    arrays.append(tokens[1:length + 1])
        merged = merge_k_sorted(arrays)
        print(" ".join(map(str, merged)))
`,
    javascript: `const fs = require('fs');

function mergeKSorted(arrays) {
  const merged = [];
  for (const arr of arrays) {
    for (const val of arr) merged.push(val);
  }
  merged.sort((a, b) => a - b);
  return merged;
}

const lines = fs.readFileSync(0, 'utf-8').trim().split('\\n');
if (lines.length > 0 && lines[0].trim()) {
  const k = parseInt(lines[0].trim(), 10);
  const arrays = [];
  for (let i = 1; i <= k && i < lines.length; i++) {
    const tokens = lines[i].trim().split(/\\s+/).map(Number);
    if (tokens.length > 0) {
      const len = tokens[0];
      arrays.push(tokens.slice(1, len + 1));
    }
  }
  console.log(mergeKSorted(arrays).join(' '));
}
`,
    typescript: `import * as fs from 'fs';

function mergeKSorted(arrays: number[][]): number[] {
  const merged: number[] = [];
  for (const arr of arrays) {
    for (const val of arr) merged.push(val);
  }
  merged.sort((a, b) => a - b);
  return merged;
}

const lines = fs.readFileSync(0, 'utf-8').trim().split('\\n');
if (lines.length > 0 && lines[0].trim()) {
  const k = parseInt(lines[0].trim(), 10);
  const arrays: number[][] = [];
  for (let i = 1; i <= k && i < lines.length; i++) {
    const tokens = lines[i].trim().split(/\\s+/).map(Number);
    if (tokens.length > 0) {
      const len = tokens[0];
      arrays.push(tokens.slice(1, len + 1));
    }
  }
  console.log(mergeKSorted(arrays).join(' '));
}
`,
    java: `import java.util.*;

public class Solution {
    static class Node implements Comparable<Node> {
        int val;
        int arrayIdx;
        int elemIdx;

        Node(int val, int arrayIdx, int elemIdx) {
            this.val = val;
            this.arrayIdx = arrayIdx;
            this.elemIdx = elemIdx;
        }

        public int compareTo(Node o) {
            return Integer.compare(this.val, o.val);
        }
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int k = sc.nextInt();
            List<int[]> arrays = new ArrayList<>();
            for (int i = 0; i < k; i++) {
                int m = sc.nextInt();
                int[] arr = new int[m];
                for (int j = 0; j < m; j++) arr[j] = sc.nextInt();
                arrays.add(arr);
            }

            PriorityQueue<Node> pq = new PriorityQueue<>();
            for (int i = 0; i < k; i++) {
                if (arrays.get(i).length > 0) {
                    pq.offer(new Node(arrays.get(i)[0], i, 0));
                }
            }

            StringBuilder sb = new StringBuilder();
            boolean first = true;
            while (!pq.isEmpty()) {
                Node node = pq.poll();
                if (!first) sb.append(" ");
                sb.append(node.val);
                first = false;

                if (node.elemIdx + 1 < arrays.get(node.arrayIdx).length) {
                    pq.offer(new Node(arrays.get(node.arrayIdx)[node.elemIdx + 1], node.arrayIdx, node.elemIdx + 1));
                }
            }
            System.out.println(sb.toString());
        }
    }
}
`,
    cpp: `#include <iostream>
#include <vector>
#include <queue>
#include <tuple>

using namespace std;

int main() {
    int k;
    if (cin >> k) {
        vector<vector<int>> arrays(k);
        for (int i = 0; i < k; ++i) {
            int m; cin >> m;
            arrays[i].resize(m);
            for (int j = 0; j < m; ++j) cin >> arrays[i][j];
        }

        using Element = tuple<int, int, int>;
        priority_queue<Element, vector<Element>, greater<Element>> pq;

        for (int i = 0; i < k; ++i) {
            if (!arrays[i].empty()) {
                pq.emplace(arrays[i][0], i, 0);
            }
        }

        bool first = true;
        while (!pq.empty()) {
            auto [val, arr_i, elem_i] = pq.top();
            pq.pop();
            if (!first) cout << " ";
            cout << val;
            first = false;

            if (elem_i + 1 < arrays[arr_i].size()) {
                pq.emplace(arrays[arr_i][elem_i + 1], arr_i, elem_i + 1);
            }
        }
        cout << endl;
    }
    return 0;
}
`,
  },
  'prob-sql-department-salaries': {
    sql: `-- Write your SQL query statement below
WITH RankedSalaries AS (
    SELECT 
        d.name AS Department,
        e.name AS Employee,
        e.salary AS Salary,
        DENSE_RANK() OVER (
            PARTITION BY e.departmentId 
            ORDER BY e.salary DESC
        ) AS salary_rank
    FROM Employee e
    JOIN Department d ON e.departmentId = d.id
)
SELECT Department, Employee, Salary
FROM RankedSalaries
WHERE salary_rank <= 3;
`,
  },
  ...EXPANDED_REFERENCE_SOLUTIONS,
  ...CURATED_120_REFERENCE_SOLUTIONS,
};

// ─────────────────────────────────────────────────────────────────────────────
// SEED PROBLEMS (PUBLIC STUDENT CATALOG)
// starterCode provides function signatures and execution wrappers ONLY.
// Working solutions are completely removed from starterCode.
// ─────────────────────────────────────────────────────────────────────────────
export const SEED_PROBLEMS: Problem[] = [
  {
    id: 'prob-reverse-words',
    slug: 'reverse-words-sentence',
    title: 'Reverse Words in a String',
    description: `Given an input string \`s\`, reverse the order of the words.

A **word** is defined as a sequence of non-space characters. The words in \`s\` will be separated by at least one space.

Return a string of the words in reverse order concatenated by a single space. Note that \`s\` may contain leading or trailing spaces or multiple spaces between two words. The returned string should only have a single space separating the words and no extraneous whitespace.`,
    topicId: 'programming-fundamentals',
    topicName: 'Programming Fundamentals',
    difficulty: 'absolute_beginner',
    tags: ['Strings', 'Two Pointers', 'Formatting'],
    inputFormat: 'A string s containing English letters, digits, and spaces.',
    outputFormat: 'A string with reversed word sequence, separated by single spaces.',
    constraints: `1 <= s.length <= 10^4
s contains English letters (upper-case and lower-case), digits, and spaces ' '.
There is at least one word in s.`,
    supportedLanguages: ['python', 'javascript', 'typescript', 'java', 'cpp'],
    examples: [
      {
        input: 'the sky is blue',
        output: 'blue is sky the',
        explanation: 'Each word is reversed in position while preserving internal spelling.',
      },
      {
        input: '  hello world  ',
        output: 'world hello',
        explanation: 'Reversed string must not contain leading or trailing spaces.',
      },
      {
        input: 'a good   example',
        output: 'example good a',
        explanation: 'Multiple spaces between words are reduced to a single space.',
      },
    ],
    starterCode: {
      python: `def reverse_words(s: str) -> str:
    # Write your solution here
    pass


# Test execution wrapper
import sys

if __name__ == "__main__":
    input_str = sys.stdin.read().strip()
    print(reverse_words(input_str))
`,
      javascript: `/**
 * @param {string} s
 * @return {string}
 */
function reverseWords(s) {
  // Write your solution here
  return "";
}

// Test execution wrapper
const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim();
console.log(reverseWords(input));
`,
      typescript: `function reverseWords(s: string): string {
  // Write your solution here
  return "";
}

// Test execution wrapper
import * as fs from 'fs';
const input = fs.readFileSync(0, 'utf-8').trim();
console.log(reverseWords(input));
`,
      java: `import java.util.*;

public class Solution {
    public static String reverseWords(String s) {
        // Write your solution here
        return "";
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        if (scanner.hasNextLine()) {
            String line = scanner.nextLine();
            System.out.println(reverseWords(line));
        }
    }
}
`,
      cpp: `#include <iostream>
#include <string>

using namespace std;

string reverseWords(string s) {
    // Write your solution here
    return "";
}

int main() {
    string line;
    if (getline(cin, line)) {
        cout << reverseWords(line) << endl;
    }
    return 0;
}
`,
    },
    referenceSolution: SEED_REFERENCE_SOLUTIONS['prob-reverse-words'],
    expectedComplexity: {
      time: 'O(N)',
      space: 'O(N)',
    },
    hints: [
      'Split the string into tokens using whitespace as the delimiter.',
      'Discard any empty string entries caused by consecutive spaces.',
      'Reverse the sequence and join using single space.',
    ],
    timeLimitSeconds: 2,
    memoryLimitKB: 256000,
    isPublished: true,
    submissionCount: 42,
    acceptedCount: 31,
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-03-15T00:00:00.000Z',
  },
  {
    id: 'prob-two-sum',
    slug: 'two-sum-indices',
    title: 'Two Sum Target Indices',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer with indices separated by space in ascending order.`,
    topicId: 'hash-maps-sets',
    topicName: 'Hash Maps & Sets',
    difficulty: 'beginner',
    tags: ['Arrays', 'Hash Table', 'O(N) Complexity'],
    inputFormat: 'First line contains integer target. Second line contains space-separated integers for nums.',
    outputFormat: 'Two space-separated indices in ascending order: i j',
    constraints: `2 <= nums.length <= 10^4
-10^9 <= nums[i] <= 10^9
-10^9 <= target <= 10^9
Only one valid answer exists.`,
    supportedLanguages: ['python', 'javascript', 'typescript', 'java', 'cpp'],
    examples: [
      {
        input: '9\n2 7 11 15',
        output: '0 1',
        explanation: 'Because nums[0] + nums[1] == 2 + 7 == 9, we return 0 1.',
      },
      {
        input: '6\n3 2 4',
        output: '1 2',
        explanation: 'Because nums[1] + nums[2] == 2 + 4 == 6, we return 1 2.',
      },
      {
        input: '6\n3 3',
        output: '0 1',
        explanation: 'nums[0] + nums[1] == 3 + 3 == 6, indices are 0 1.',
      },
    ],
    starterCode: {
      python: `def two_sum(target: int, nums: list[int]) -> list[int]:
    # Write your solution here
    pass


# Test execution wrapper
import sys

if __name__ == "__main__":
    lines = sys.stdin.read().strip().splitlines()
    if len(lines) >= 2:
        target = int(lines[0].strip())
        nums = list(map(int, lines[1].strip().split()))
        res = two_sum(target, nums)
        if res:
            print(f"{res[0]} {res[1]}")
`,
      javascript: `/**
 * @param {number} target
 * @param {number[]} nums
 * @return {number[]}
 */
function twoSum(target, nums) {
  // Write your solution here
  return [];
}

// Test execution wrapper
const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim().split('\\n');
if (input.length >= 2) {
  const target = parseInt(input[0].trim(), 10);
  const nums = input[1].trim().split(/\\s+/).map(Number);
  const res = twoSum(target, nums);
  console.log(res.join(' '));
}
`,
      typescript: `function twoSum(target: number, nums: number[]): number[] {
  // Write your solution here
  return [];
}

// Test execution wrapper
import * as fs from 'fs';
const lines = fs.readFileSync(0, 'utf-8').trim().split('\\n');
if (lines.length >= 2) {
  const target = parseInt(lines[0].trim(), 10);
  const nums = lines[1].trim().split(/\\s+/).map(Number);
  const res = twoSum(target, nums);
  console.log(res.join(' '));
}
`,
      java: `import java.util.*;

public class Solution {
    public static int[] twoSum(int target, int[] nums) {
        // Write your solution here
        return new int[]{};
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int target = sc.nextInt();
            List<Integer> numsList = new ArrayList<>();
            while (sc.hasNextInt()) {
                numsList.add(sc.nextInt());
            }
            int[] nums = numsList.stream().mapToInt(i -> i).toArray();
            int[] res = twoSum(target, nums);
            if (res.length >= 2) {
                System.out.println(res[0] + " " + res[1]);
            }
        }
    }
}
`,
      cpp: `#include <iostream>
#include <vector>

using namespace std;

vector<int> twoSum(int target, vector<int>& nums) {
    // Write your solution here
    return {};
}

int main() {
    int target;
    if (cin >> target) {
        vector<int> nums;
        int val;
        while (cin >> val) {
            nums.push_back(val);
        }
        vector<int> res = twoSum(target, nums);
        if (res.size() >= 2) {
            cout << res[0] << " " << res[1] << endl;
        }
    }
    return 0;
}
`,
    },
    referenceSolution: SEED_REFERENCE_SOLUTIONS['prob-two-sum'],
    expectedComplexity: {
      time: 'O(N)',
      space: 'O(N)',
    },
    hints: [
      'A brute force solution takes O(N^2). Can you do it in a single pass?',
      'Use a Hash Map to store the index of elements visited so far.',
      'Check if complement (target - current) is already in the map.',
    ],
    timeLimitSeconds: 2,
    memoryLimitKB: 256000,
    isPublished: true,
    submissionCount: 154,
    acceptedCount: 98,
    createdAt: '2026-03-02T00:00:00.000Z',
    updatedAt: '2026-03-20T00:00:00.000Z',
  },
  {
    id: 'prob-valid-parentheses',
    slug: 'valid-parentheses-depth',
    title: 'Balanced Parentheses & Bracket Validation',
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

Print \`true\` if the string is valid, or \`false\` otherwise.`,
    topicId: 'stacks-queues',
    topicName: 'Stacks & Queues',
    difficulty: 'intermediate',
    tags: ['Stack', 'Parsing', 'String Matching'],
    inputFormat: 'A single line containing the bracket string s.',
    outputFormat: 'true or false',
    constraints: `1 <= s.length <= 10^4
s consists of parentheses only '()[]{}'.`,
    supportedLanguages: ['python', 'javascript', 'typescript', 'java', 'cpp'],
    examples: [
      {
        input: '()[]{}',
        output: 'true',
        explanation: 'All open brackets are closed with matching types in valid sequence.',
      },
      {
        input: '(]',
        output: 'false',
        explanation: 'Opening parenthesis cannot be closed with a square bracket.',
      },
      {
        input: '([)]',
        output: 'false',
        explanation: 'Brackets must close in innermost-first order.',
      },
    ],
    starterCode: {
      python: `def is_valid(s: str) -> bool:
    # Write your solution here
    pass


# Test execution wrapper
import sys

if __name__ == "__main__":
    line = sys.stdin.read().strip()
    print("true" if is_valid(line) else "false")
`,
      javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
  // Write your solution here
  return false;
}

// Test execution wrapper
const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim();
console.log(isValid(input) ? 'true' : 'false');
`,
      typescript: `function isValid(s: string): boolean {
  // Write your solution here
  return false;
}

// Test execution wrapper
import * as fs from 'fs';
const input = fs.readFileSync(0, 'utf-8').trim();
console.log(isValid(input) ? 'true' : 'false');
`,
      java: `import java.util.*;

public class Solution {
    public static boolean isValid(String s) {
        // Write your solution here
        return false;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            String line = sc.nextLine().trim();
            System.out.println(isValid(line) ? "true" : "false");
        }
    }
}
`,
      cpp: `#include <iostream>
#include <string>

using namespace std;

bool isValid(string s) {
    // Write your solution here
    return false;
}

int main() {
    string line;
    if (getline(cin, line)) {
        cout << (isValid(line) ? "true" : "false") << endl;
    }
    return 0;
}
`,
    },
    referenceSolution: SEED_REFERENCE_SOLUTIONS['prob-valid-parentheses'],
    expectedComplexity: {
      time: 'O(N)',
      space: 'O(N)',
    },
    hints: [
      'Use a stack to keep track of opening brackets as you iterate through the string.',
      'When encounter closing bracket, pop top of stack and check if matching pair.',
      'String is valid only if all brackets paired properly and stack empty at end.',
    ],
    timeLimitSeconds: 2,
    memoryLimitKB: 256000,
    isPublished: true,
    submissionCount: 88,
    acceptedCount: 52,
    createdAt: '2026-03-04T00:00:00.000Z',
    updatedAt: '2026-03-22T00:00:00.000Z',
  },
  {
    id: 'prob-lru-cache',
    slug: 'lru-cache-implementation',
    title: 'LRU Cache Design & Eviction Strategy',
    description: `Design a data structure that follows the constraints of a **Least Recently Used (LRU) Cache**.

Implement the \`LRUCache\` class:
- \`LRUCache(int capacity)\`: Initialize the LRU cache with positive size \`capacity\`.
- \`int get(int key)\`: Return the value of \`key\` if exists, otherwise return \`-1\`.
- \`void put(int key, int value)\`: Update value if key exists; otherwise add key-value pair. If keys exceed capacity, evict the least recently used key.

Both \`get\` and \`put\` must run in **O(1)** average time complexity.`,
    topicId: 'oop-design',
    topicName: 'Object-Oriented Programming',
    difficulty: 'advanced',
    tags: ['Design', 'Hash Table', 'Linked List', 'Doubly Linked List'],
    inputFormat: 'Line 1 has capacity. Subsequent lines contain operations: put key val, get key, or exit.',
    outputFormat: 'Print result of each get operation on a new line.',
    constraints: `1 <= capacity <= 3000
0 <= key <= 10^4
0 <= value <= 10^5
At most 2 * 10^5 calls will be made to get and put.`,
    supportedLanguages: ['python', 'javascript', 'typescript', 'java', 'cpp'],
    examples: [
      {
        input: '2\nput 1 1\nput 2 2\nget 1\nput 3 3\nget 2\nput 4 4\nget 1\nget 3\nget 4\nexit',
        output: '1\n-1\n-1\n3\n4',
        explanation: 'Key 2 is evicted when 3 is put because 1 was read recently. Key 1 is evicted when 4 is put.',
      },
    ],
    starterCode: {
      python: `class LRUCache:
    def __init__(self, capacity: int):
        # Initialize your LRU cache data structures here
        pass

    def get(self, key: int) -> int:
        # Write your solution here
        return -1

    def put(self, key: int, value: int) -> None:
        # Write your solution here
        pass


# Test execution wrapper
import sys

if __name__ == "__main__":
    lines = sys.stdin.read().strip().splitlines()
    if lines:
        cap = int(lines[0].strip())
        lru = LRUCache(cap)
        for line in lines[1:]:
            parts = line.strip().split()
            if not parts or parts[0] == 'exit':
                break
            if parts[0] == 'get':
                print(lru.get(int(parts[1])))
            elif parts[0] == 'put':
                lru.put(int(parts[1]), int(parts[2]))
`,
      javascript: `class LRUCache {
  /**
   * @param {number} capacity
   */
  constructor(capacity) {
    // Initialize your LRU cache data structures here
  }

  /**
   * @param {number} key
   * @return {number}
   */
  get(key) {
    // Write your solution here
    return -1;
  }

  /**
   * @param {number} key
   * @param {number} value
   * @return {void}
   */
  put(key, value) {
    // Write your solution here
  }
}

// Test execution wrapper
const fs = require('fs');
const lines = fs.readFileSync(0, 'utf-8').trim().split('\\n');
if (lines.length > 0 && lines[0].trim()) {
  const cap = parseInt(lines[0].trim(), 10);
  const lru = new LRUCache(cap);
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].trim().split(/\\s+/);
    if (!parts[0] || parts[0] === 'exit') break;
    if (parts[0] === 'get') {
      console.log(lru.get(parseInt(parts[1], 10)));
    } else if (parts[0] === 'put') {
      lru.put(parseInt(parts[1], 10), parseInt(parts[2], 10));
    }
  }
}
`,
      typescript: `class LRUCache {
  constructor(capacity: number) {
    // Initialize your LRU cache data structures here
  }

  get(key: number): number {
    // Write your solution here
    return -1;
  }

  put(key: number, value: number): void {
    // Write your solution here
  }
}

// Test execution wrapper
import * as fs from 'fs';
const lines = fs.readFileSync(0, 'utf-8').trim().split('\\n');
if (lines.length > 0 && lines[0].trim()) {
  const cap = parseInt(lines[0].trim(), 10);
  const lru = new LRUCache(cap);
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].trim().split(/\\s+/);
    if (!parts[0] || parts[0] === 'exit') break;
    if (parts[0] === 'get') {
      console.log(lru.get(parseInt(parts[1], 10)));
    } else if (parts[0] === 'put') {
      lru.put(parseInt(parts[1], 10), parseInt(parts[2], 10));
    }
  }
}
`,
      java: `import java.util.*;

public class Solution {
    static class LRUCache {
        public LRUCache(int capacity) {
            // Initialize your LRU cache data structures here
        }

        public int get(int key) {
            // Write your solution here
            return -1;
        }

        public void put(int key, int value) {
            // Write your solution here
        }
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int cap = sc.nextInt();
            LRUCache lru = new LRUCache(cap);
            while (sc.hasNext()) {
                String cmd = sc.next();
                if (cmd.equals("exit")) break;
                if (cmd.equals("get")) {
                    int k = sc.nextInt();
                    System.out.println(lru.get(k));
                } else if (cmd.equals("put")) {
                    int k = sc.nextInt();
                    int v = sc.nextInt();
                    lru.put(k, v);
                }
            }
        }
    }
}
`,
      cpp: `#include <iostream>
#include <string>

using namespace std;

class LRUCache {
public:
    LRUCache(int capacity) {
        // Initialize your LRU cache data structures here
    }

    int get(int key) {
        // Write your solution here
        return -1;
    }

    void put(int key, int value) {
        // Write your solution here
    }
};

int main() {
    int cap;
    if (cin >> cap) {
        LRUCache lru(cap);
        string cmd;
        while (cin >> cmd) {
            if (cmd == "exit") break;
            if (cmd == "get") {
                int k; cin >> k;
                cout << lru.get(k) << endl;
            } else if (cmd == "put") {
                int k, v; cin >> k >> v;
                lru.put(k, v);
            }
        }
    }
    return 0;
}
`,
    },
    referenceSolution: SEED_REFERENCE_SOLUTIONS['prob-lru-cache'],
    expectedComplexity: {
      time: 'O(1) amortized get & put',
      space: 'O(capacity)',
    },
    hints: [
      'To achieve O(1) for both operations, combine a Hash Map with a Doubly Linked List.',
      'The Hash Map provides O(1) key lookups to nodes.',
      'The Doubly Linked List enables O(1) node removals and head/tail insertions.',
    ],
    timeLimitSeconds: 3,
    memoryLimitKB: 256000,
    isPublished: true,
    submissionCount: 45,
    acceptedCount: 22,
    createdAt: '2026-03-05T00:00:00.000Z',
    updatedAt: '2026-03-25T00:00:00.000Z',
  },
  {
    id: 'prob-merge-k-sorted',
    slug: 'merge-k-sorted-linked-lists',
    title: 'Merge K Sorted Streams & Lists',
    description: `You are given an array of \`k\` integer arrays/lists, each sorted in ascending order.

Merge all the streams into one sorted list and return it.

The input provides \`k\` on the first line. Each following line starts with length \`N\`, followed by \`N\` space-separated integers. Output all integers in merged ascending sequence separated by single spaces.`,
    topicId: 'searching-sorting',
    topicName: 'Searching & Sorting',
    difficulty: 'expert',
    tags: ['Divide and Conquer', 'Heap', 'Priority Queue', 'Merge Sort'],
    inputFormat: 'Line 1: k. Lines 2..k+1: length N followed by N space-separated integers.',
    outputFormat: 'Single space-separated line containing all sorted elements.',
    constraints: `k == arrays.length
0 <= k <= 10^4
0 <= total elements across all arrays <= 10^5
-10^4 <= arrays[i][j] <= 10^4
arrays[i] is sorted in ascending order.`,
    supportedLanguages: ['python', 'javascript', 'typescript', 'java', 'cpp'],
    examples: [
      {
        input: '3\n3 1 4 5\n3 1 3 4\n2 2 6',
        output: '1 1 2 3 4 4 5 6',
        explanation: 'Three streams merged in globally ascending order.',
      },
      {
        input: '1\n3 1 2 3',
        output: '1 2 3',
        explanation: 'Single sorted stream outputs as-is.',
      },
    ],
    starterCode: {
      python: `def merge_k_sorted(arrays: list[list[int]]) -> list[int]:
    # Write your solution here
    pass


# Test execution wrapper
import sys

if __name__ == "__main__":
    lines = sys.stdin.read().strip().splitlines()
    if lines:
        k = int(lines[0].strip())
        arrays = []
        for i in range(1, k + 1):
            if i < len(lines):
                tokens = list(map(int, lines[i].strip().split()))
                if tokens:
                    length = tokens[0]
                    arrays.append(tokens[1:length + 1])
        merged = merge_k_sorted(arrays)
        if merged is not None:
            print(" ".join(map(str, merged)))
`,
      javascript: `/**
 * @param {number[][]} arrays
 * @return {number[]}
 */
function mergeKSorted(arrays) {
  // Write your solution here
  return [];
}

// Test execution wrapper
const fs = require('fs');
const lines = fs.readFileSync(0, 'utf-8').trim().split('\\n');
if (lines.length > 0 && lines[0].trim()) {
  const k = parseInt(lines[0].trim(), 10);
  const arrays = [];
  for (let i = 1; i <= k && i < lines.length; i++) {
    const tokens = lines[i].trim().split(/\\s+/).map(Number);
    if (tokens.length > 0) {
      const len = tokens[0];
      arrays.push(tokens.slice(1, len + 1));
    }
  }
  console.log(mergeKSorted(arrays).join(' '));
}
`,
      typescript: `function mergeKSorted(arrays: number[][]): number[] {
  // Write your solution here
  return [];
}

// Test execution wrapper
import * as fs from 'fs';
const lines = fs.readFileSync(0, 'utf-8').trim().split('\\n');
if (lines.length > 0 && lines[0].trim()) {
  const k = parseInt(lines[0].trim(), 10);
  const arrays: number[][] = [];
  for (let i = 1; i <= k && i < lines.length; i++) {
    const tokens = lines[i].trim().split(/\\s+/).map(Number);
    if (tokens.length > 0) {
      const len = tokens[0];
      arrays.push(tokens.slice(1, len + 1));
    }
  }
  console.log(mergeKSorted(arrays).join(' '));
}
`,
      java: `import java.util.*;

public class Solution {
    public static List<Integer> mergeKSorted(List<List<Integer>> arrays) {
        // Write your solution here
        return new ArrayList<>();
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int k = sc.nextInt();
            List<List<Integer>> arrays = new ArrayList<>();
            for (int i = 0; i < k; i++) {
                if (sc.hasNextInt()) {
                    int len = sc.nextInt();
                    List<Integer> arr = new ArrayList<>();
                    for (int j = 0; j < len; j++) {
                        arr.add(sc.nextInt());
                    }
                    arrays.add(arr);
                }
            }
            List<Integer> merged = mergeKSorted(arrays);
            for (int i = 0; i < merged.size(); i++) {
                System.out.print(merged.get(i) + (i == merged.size() - 1 ? "" : " "));
            }
            System.out.println();
        }
    }
}
`,
      cpp: `#include <iostream>
#include <vector>

using namespace std;

vector<int> mergeKSorted(vector<vector<int>>& arrays) {
    // Write your solution here
    return {};
}

int main() {
    int k;
    if (cin >> k) {
        vector<vector<int>> arrays(k);
        for (int i = 0; i < k; ++i) {
            int len;
            if (cin >> len) {
                arrays[i].resize(len);
                for (int j = 0; j < len; ++j) {
                    cin >> arrays[i][j];
                }
            }
        }
        vector<int> res = mergeKSorted(arrays);
        for (size_t i = 0; i < res.size(); ++i) {
            cout << res[i] << (i + 1 == res.size() ? "" : " ");
        }
        cout << endl;
    }
    return 0;
}
`,
    },
    referenceSolution: SEED_REFERENCE_SOLUTIONS['prob-merge-k-sorted'],
    expectedComplexity: {
      time: 'O(N log k) where N is total element count',
      space: 'O(k) min-heap buffer',
    },
    hints: [
      'Pairwise merging or sorting everything at the end is suboptimal.',
      'Maintain a min-heap of size k containing the head of each stream.',
      'Pop min element, append to output, and push next element from that stream.',
    ],
    timeLimitSeconds: 4,
    memoryLimitKB: 256000,
    isPublished: true,
    submissionCount: 33,
    acceptedCount: 14,
    createdAt: '2026-03-06T00:00:00.000Z',
    updatedAt: '2026-03-28T00:00:00.000Z',
  },
  {
    id: 'prob-sql-department-salaries',
    slug: 'sql-top-department-salaries',
    title: 'Department Top Three Salaries',
    description: `A company's executives are interested in seeing who earns the most money in each of the company's departments.

A **high earner** in a department is an employee who has a salary in the **top three unique salaries** for that department.

Write a solution to find the employees who are high earners in each of the departments. Return the result table in any order.`,
    topicId: 'sql-databases',
    topicName: 'SQL & Database Queries',
    difficulty: 'advanced',
    tags: ['SQL', 'Window Functions', 'DENSE_RANK', 'Aggregation'],
    inputFormat: 'Employee table (id, name, salary, departmentId) and Department table (id, name)',
    outputFormat: 'Table columns: Department, Employee, Salary',
    constraints: `Employee id is primary key.
Department id is primary key.
departmentId is a foreign key to id in the Department table.`,
    supportedLanguages: ['sql'],
    examples: [
      {
        input: `Employee table:
| id | name  | salary | departmentId |
| 1  | Joe   | 85000  | 1            |
| 2  | Henry | 80000  | 2            |
| 3  | Sam   | 60000  | 2            |
| 4  | Max   | 90000  | 1            |
| 5  | Janet | 69000  | 1            |
| 6  | Randy | 85000  | 1            |
| 7  | Will  | 70000  | 1            |`,
        output: `| Department | Employee | Salary |
| IT         | Max      | 90000  |
| IT         | Joe      | 85000  |
| IT         | Randy    | 85000  |
| IT         | Will     | 70000  |
| Sales      | Henry    | 80000  |
| Sales      | Sam      | 60000  |`,
        explanation: 'In the IT department, Max earns the highest (90k), Joe & Randy share second (85k), and Will earns third (70k). Janet earns 69k which is 4th rank.',
      },
    ],
    starterCode: {
      sql: `-- Write your SQL query statement below
-- Schema: Employee (id, name, salary, departmentId), Department (id, name)
SELECT 
    d.name AS Department,
    e.name AS Employee,
    e.salary AS Salary
FROM Employee e
JOIN Department d ON e.departmentId = d.id
WHERE 1 = 0; -- Replace with your solution
`,
    },
    referenceSolution: SEED_REFERENCE_SOLUTIONS['prob-sql-department-salaries'],
    expectedComplexity: {
      time: 'O(N log N) index scan',
      space: 'O(N) window buffer',
    },
    hints: [
      'Use DENSE_RANK() instead of RANK() so tied salaries do not skip the subsequent rank numbers.',
      'Partition by departmentId and order by salary DESC.',
      'Filter where the dense rank <= 3.',
    ],
    timeLimitSeconds: 5,
    memoryLimitKB: 256000,
    isPublished: true,
    submissionCount: 65,
    acceptedCount: 38,
    createdAt: '2026-03-08T00:00:00.000Z',
    updatedAt: '2026-03-29T00:00:00.000Z',
  },
  ...EXPANDED_PROBLEMS,
  ...CURATED_120_PROBLEMS,
];

// ─────────────────────────────────────────────────────────────────────────────
// PRIVATE & PUBLIC TEST CASES (PROTECTED STORE)
// In production Firestore, records with isPublic: false reside in the backend-only
// subcollection 'problems/{id}/testCases' which is blocked from client queries.
// ─────────────────────────────────────────────────────────────────────────────
export const SEED_TEST_CASES: Record<string, ProblemTestCase[]> = {
  'prob-reverse-words': [
    // Public example tests
    {
      id: 'tc-rw-pub-1',
      problemId: 'prob-reverse-words',
      input: 'the sky is blue',
      expectedOutput: 'blue is sky the',
      isPublic: true,
      order: 1,
    },
    {
      id: 'tc-rw-pub-2',
      problemId: 'prob-reverse-words',
      input: '  hello world  ',
      expectedOutput: 'world hello',
      isPublic: true,
      order: 2,
    },
    {
      id: 'tc-rw-pub-3',
      problemId: 'prob-reverse-words',
      input: 'a good   example',
      expectedOutput: 'example good a',
      isPublic: true,
      order: 3,
    },
    // Private hidden test cases
    {
      id: 'tc-rw-priv-1',
      problemId: 'prob-reverse-words',
      input: 'singleword',
      expectedOutput: 'singleword',
      isPublic: false,
      order: 4,
      explanation: 'Single word without spaces must remain identical.',
    },
    {
      id: 'tc-rw-priv-2',
      problemId: 'prob-reverse-words',
      input: '    tab  separated    multiple     spaces    everywhere   ',
      expectedOutput: 'everywhere spaces multiple separated tab',
      isPublic: false,
      order: 5,
      explanation: 'Heavy extraneous whitespace padding test.',
    },
    {
      id: 'tc-rw-priv-3',
      problemId: 'prob-reverse-words',
      input: '123 456 7890 alpha beta gamma',
      expectedOutput: 'gamma beta alpha 7890 456 123',
      isPublic: false,
      order: 6,
      explanation: 'Alphanumeric mix with multiple tokens.',
    },
  ],
  'prob-two-sum': [
    {
      id: 'tc-ts-pub-1',
      problemId: 'prob-two-sum',
      input: '9\\n2 7 11 15',
      expectedOutput: '0 1',
      isPublic: true,
      order: 1,
    },
    {
      id: 'tc-ts-pub-2',
      problemId: 'prob-two-sum',
      input: '6\\n3 2 4',
      expectedOutput: '1 2',
      isPublic: true,
      order: 2,
    },
    {
      id: 'tc-ts-pub-3',
      problemId: 'prob-two-sum',
      input: '6\\n3 3',
      expectedOutput: '0 1',
      isPublic: true,
      order: 3,
    },
    // Private hidden test cases
    {
      id: 'tc-ts-priv-1',
      problemId: 'prob-two-sum',
      input: '0\\n-3 4 3 90',
      expectedOutput: '0 2',
      isPublic: false,
      order: 4,
      explanation: 'Negative numbers summing to zero target.',
    },
    {
      id: 'tc-ts-priv-2',
      problemId: 'prob-two-sum',
      input: '-8\\n-1 -2 -3 -4 -5',
      expectedOutput: '2 4',
      isPublic: false,
      order: 5,
      explanation: 'All negative numbers with negative target.',
    },
    {
      id: 'tc-ts-priv-3',
      problemId: 'prob-two-sum',
      input: '1000000000\\n500000000 1 2 500000000',
      expectedOutput: '0 3',
      isPublic: false,
      order: 6,
      explanation: 'Large 32-bit bound values with duplicate elements.',
    },
  ],
  'prob-valid-parentheses': [
    {
      id: 'tc-vp-pub-1',
      problemId: 'prob-valid-parentheses',
      input: '()[]{}',
      expectedOutput: 'true',
      isPublic: true,
      order: 1,
    },
    {
      id: 'tc-vp-pub-2',
      problemId: 'prob-valid-parentheses',
      input: '(]',
      expectedOutput: 'false',
      isPublic: true,
      order: 2,
    },
    {
      id: 'tc-vp-pub-3',
      problemId: 'prob-valid-parentheses',
      input: '([)]',
      expectedOutput: 'false',
      isPublic: true,
      order: 3,
    },
    // Private hidden test cases
    {
      id: 'tc-vp-priv-1',
      problemId: 'prob-valid-parentheses',
      input: '{[()]}',
      expectedOutput: 'true',
      isPublic: false,
      order: 4,
      explanation: 'Deep symmetrical nesting.',
    },
    {
      id: 'tc-vp-priv-2',
      problemId: 'prob-valid-parentheses',
      input: '((((((((((',
      expectedOutput: 'false',
      isPublic: false,
      order: 5,
      explanation: 'Unclosed multiple opening brackets.',
    },
    {
      id: 'tc-vp-priv-3',
      problemId: 'prob-valid-parentheses',
      input: '))))',
      expectedOutput: 'false',
      isPublic: false,
      order: 6,
      explanation: 'Leading closing brackets without prior opening.',
    },
    {
      id: 'tc-vp-priv-4',
      problemId: 'prob-valid-parentheses',
      input: '(){}}{',
      expectedOutput: 'false',
      isPublic: false,
      order: 7,
      explanation: 'Valid prefix followed by mismatched balance.',
    },
  ],
  'prob-lru-cache': [
    {
      id: 'tc-lru-pub-1',
      problemId: 'prob-lru-cache',
      input: '2\\nput 1 1\\nput 2 2\\nget 1\\nput 3 3\\nget 2\\nput 4 4\\nget 1\\nget 3\\nget 4\\nexit',
      expectedOutput: '1\\n-1\\n-1\\n3\\n4',
      isPublic: true,
      order: 1,
    },
    // Private hidden test cases
    {
      id: 'tc-lru-priv-1',
      problemId: 'prob-lru-cache',
      input: '1\\nput 2 1\\nget 2\\nput 3 2\\nget 2\\nget 3\\nexit',
      expectedOutput: '1\\n-1\\n2',
      isPublic: false,
      order: 2,
      explanation: 'Capacity 1 immediate eviction.',
    },
    {
      id: 'tc-lru-priv-2',
      problemId: 'prob-lru-cache',
      input: '2\\nput 2 1\\nput 1 1\\nput 2 3\\nput 4 1\\nget 1\\nget 2\\nexit',
      expectedOutput: '-1\\n3',
      isPublic: false,
      order: 3,
      explanation: 'Updating existing key 2 should refresh its recency without eviction.',
    },
  ],
  'prob-merge-k-sorted': [
    {
      id: 'tc-mk-pub-1',
      problemId: 'prob-merge-k-sorted',
      input: '3\\n3 1 4 5\\n3 1 3 4\\n2 2 6',
      expectedOutput: '1 1 2 3 4 4 5 6',
      isPublic: true,
      order: 1,
    },
    {
      id: 'tc-mk-pub-2',
      problemId: 'prob-merge-k-sorted',
      input: '1\\n3 1 2 3',
      expectedOutput: '1 2 3',
      isPublic: true,
      order: 2,
    },
    // Private hidden test cases
    {
      id: 'tc-mk-priv-1',
      problemId: 'prob-merge-k-sorted',
      input: '4\\n0\\n1 5\\n0\\n2 -1 3',
      expectedOutput: '-1 3 5',
      isPublic: false,
      order: 3,
      explanation: 'Sparse empty streams mixed with negative values.',
    },
    {
      id: 'tc-mk-priv-2',
      problemId: 'prob-merge-k-sorted',
      input: '2\\n4 -10 -5 0 5\\n4 -8 -2 1 10',
      expectedOutput: '-10 -8 -5 -2 0 1 5 10',
      isPublic: false,
      order: 4,
      explanation: 'Negative integers spanning zero with alternate interleaving.',
    },
  ],
  'prob-sql-department-salaries': [
    {
      id: 'tc-sql-pub-1',
      problemId: 'prob-sql-department-salaries',
      input: 'Department high earner check baseline',
      expectedOutput: 'IT|Max|90000\\nIT|Joe|85000\\nIT|Randy|85000\\nIT|Will|70000\\nSales|Henry|80000\\nSales|Sam|60000',
      isPublic: true,
      order: 1,
    },
    // Private hidden test cases
    {
      id: 'tc-sql-priv-1',
      problemId: 'prob-sql-department-salaries',
      input: 'Department with all tied top salaries',
      expectedOutput: 'HR|Alice|50000\\nHR|Bob|50000\\nHR|Charlie|50000\\nHR|David|50000',
      isPublic: false,
      order: 2,
      explanation: 'Dense rank handling when multiple employees share rank 1.',
    },
  ],
  ...EXPANDED_TEST_CASES,
  ...CURATED_120_TEST_CASES,
};

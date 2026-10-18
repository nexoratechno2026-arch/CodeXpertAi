import { Problem, ProblemTestCase, StarterCodeMap } from '@/types/codelab';

// ─────────────────────────────────────────────────────────────────────────────
// EXPANDED REFERENCE SOLUTIONS (PRIVATE SERVER STORE)
// Kept strictly isolated on server/backend. Never exposed in public student DTOs.
// ─────────────────────────────────────────────────────────────────────────────
export const EXPANDED_REFERENCE_SOLUTIONS: Record<string, StarterCodeMap> = {
  'prob-is-palindrome': {
    python: `import sys

def is_palindrome(s: str) -> bool:
    filtered = [ch.lower() for ch in s if ch.isalnum()]
    return filtered == filtered[::-1]

if __name__ == "__main__":
    line = sys.stdin.read().strip()
    print("true" if is_palindrome(line) else "false")
`,
    javascript: `const fs = require('fs');

function isPalindrome(s) {
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  return clean === clean.split('').reverse().join('');
}

const input = fs.readFileSync(0, 'utf-8').trim();
console.log(isPalindrome(input) ? "true" : "false");
`,
    typescript: `import * as fs from 'fs';

function isPalindrome(s: string): boolean {
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  return clean === clean.split('').reverse().join('');
}

const input = fs.readFileSync(0, 'utf-8').trim();
console.log(isPalindrome(input) ? "true" : "false");
`,
    java: `import java.util.*;

public class Solution {
    public static boolean isPalindrome(String s) {
        StringBuilder sb = new StringBuilder();
        for (char c : s.toCharArray()) {
            if (Character.isLetterOrDigit(c)) {
                sb.append(Character.toLowerCase(c));
            }
        }
        String clean = sb.toString();
        String rev = sb.reverse().toString();
        return clean.equals(rev);
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.hasNextLine() ? sc.nextLine() : "";
        System.out.println(isPalindrome(s) ? "true" : "false");
    }
}
`,
    cpp: `#include <iostream>
#include <string>
#include <cctype>
#include <algorithm>

using namespace std;

bool isPalindrome(string s) {
    string clean = "";
    for (char c : s) {
        if (isalnum(c)) clean += tolower(c);
    }
    string rev = clean;
    reverse(rev.begin(), rev.end());
    return clean == rev;
}

int main() {
    string s;
    if (getline(cin, s)) {
        cout << (isPalindrome(s) ? "true" : "false") << endl;
    }
    return 0;
}
`,
  },

  'prob-max-subarray': {
    python: `import sys

def max_sub_array(nums: list[int]) -> int:
    max_sum = current_sum = nums[0]
    for x in nums[1:]:
        current_sum = max(x, current_sum + x)
        max_sum = max(max_sum, current_sum)
    return max_sum

if __name__ == "__main__":
    nums = list(map(int, sys.stdin.read().strip().split()))
    if nums:
        print(max_sub_array(nums))
`,
    javascript: `const fs = require('fs');

function maxSubArray(nums) {
  let maxSum = nums[0];
  let cur = nums[0];
  for (let i = 1; i < nums.length; i++) {
    cur = Math.max(nums[i], cur + nums[i]);
    maxSum = Math.max(maxSum, cur);
  }
  return maxSum;
}

const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/).map(Number);
console.log(maxSubArray(input));
`,
    typescript: `import * as fs from 'fs';

function maxSubArray(nums: number[]): number {
  let maxSum = nums[0];
  let cur = nums[0];
  for (let i = 1; i < nums.length; i++) {
    cur = Math.max(nums[i], cur + nums[i]);
    maxSum = Math.max(maxSum, cur);
  }
  return maxSum;
}

const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/).map(Number);
console.log(maxSubArray(input));
`,
    java: `import java.util.*;

public class Solution {
    public static int maxSubArray(int[] nums) {
        int max = nums[0];
        int cur = nums[0];
        for (int i = 1; i < nums.length; i++) {
            cur = Math.max(nums[i], cur + nums[i]);
            max = Math.max(max, cur);
        }
        return max;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        List<Integer> list = new ArrayList<>();
        while (sc.hasNextInt()) list.add(sc.nextInt());
        int[] arr = list.stream().mapToInt(i -> i).toArray();
        System.out.println(maxSubArray(arr));
    }
}
`,
    cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int maxSubArray(vector<int>& nums) {
    int maxSum = nums[0], cur = nums[0];
    for (size_t i = 1; i < nums.size(); ++i) {
        cur = max(nums[i], cur + nums[i]);
        maxSum = max(maxSum, cur);
    }
    return maxSum;
}

int main() {
    vector<int> nums;
    int x;
    while (cin >> x) nums.push_back(x);
    if (!nums.empty()) cout << maxSubArray(nums) << endl;
    return 0;
}
`,
  },

  'prob-search-rotated-array': {
    python: `import sys

def search_rotated(target: int, nums: list[int]) -> int:
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return mid
        if nums[left] <= nums[mid]:
            if nums[left] <= target < nums[mid]:
                right = mid - 1
            else:
                left = mid + 1
        else:
            if nums[mid] < target <= nums[right]:
                left = mid + 1
            else:
                right = mid - 1
    return -1

if __name__ == "__main__":
    lines = sys.stdin.read().strip().splitlines()
    if len(lines) >= 2:
        target = int(lines[0].strip())
        nums = list(map(int, lines[1].strip().split()))
        print(search_rotated(target, nums))
`,
    javascript: `const fs = require('fs');

function searchRotated(target, nums) {
  let left = 0, right = nums.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) return mid;
    if (nums[left] <= nums[mid]) {
      if (nums[left] <= target && target < nums[mid]) right = mid - 1;
      else left = mid + 1;
    } else {
      if (nums[mid] < target && target <= nums[right]) left = mid + 1;
      else right = mid - 1;
    }
  }
  return -1;
}

const lines = fs.readFileSync(0, 'utf-8').trim().split('\\n');
if (lines.length >= 2) {
  const target = parseInt(lines[0].trim(), 10);
  const nums = lines[1].trim().split(/\\s+/).map(Number);
  console.log(searchRotated(target, nums));
}
`,
    typescript: `import * as fs from 'fs';

function searchRotated(target: number, nums: number[]): number {
  let left = 0, right = nums.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) return mid;
    if (nums[left] <= nums[mid]) {
      if (nums[left] <= target && target < nums[mid]) right = mid - 1;
      else left = mid + 1;
    } else {
      if (nums[mid] < target && target <= nums[right]) left = mid + 1;
      else right = mid - 1;
    }
  }
  return -1;
}

const lines = fs.readFileSync(0, 'utf-8').trim().split('\\n');
if (lines.length >= 2) {
  const target = parseInt(lines[0].trim(), 10);
  const nums = lines[1].trim().split(/\\s+/).map(Number);
  console.log(searchRotated(target, nums));
}
`,
    java: `import java.util.*;

public class Solution {
    public static int searchRotated(int target, int[] nums) {
        int left = 0, right = nums.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;
            if (nums[left] <= nums[mid]) {
                if (nums[left] <= target && target < nums[mid]) right = mid - 1;
                else left = mid + 1;
            } else {
                if (nums[mid] < target && target <= nums[right]) left = mid + 1;
                else right = mid - 1;
            }
        }
        return -1;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int target = sc.nextInt();
            List<Integer> list = new ArrayList<>();
            while (sc.hasNextInt()) list.add(sc.nextInt());
            int[] arr = list.stream().mapToInt(i -> i).toArray();
            System.out.println(searchRotated(target, arr));
        }
    }
}
`,
    cpp: `#include <iostream>
#include <vector>

using namespace std;

int searchRotated(int target, vector<int>& nums) {
    int left = 0, right = (int)nums.size() - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] == target) return mid;
        if (nums[left] <= nums[mid]) {
            if (nums[left] <= target && target < nums[mid]) right = mid - 1;
            else left = mid + 1;
        } else {
            if (nums[mid] < target && target <= nums[right]) left = mid + 1;
            else right = mid - 1;
        }
    }
    return -1;
}

int main() {
    int target;
    if (cin >> target) {
        vector<int> nums;
        int x;
        while (cin >> x) nums.push_back(x);
        cout << searchRotated(target, nums) << endl;
    }
    return 0;
}
`,
  },

  'prob-longest-non-repeating-substr': {
    python: `import sys

def length_of_longest_substring(s: str) -> int:
    char_index = {}
    max_len = 0
    start = 0
    for end, ch in enumerate(s):
        if ch in char_index and char_index[ch] >= start:
            start = char_index[ch] + 1
        char_index[ch] = end
        max_len = max(max_len, end - start + 1)
    return max_len

if __name__ == "__main__":
    line = sys.stdin.read().rstrip('\\r\\n')
    print(length_of_longest_substring(line))
`,
    javascript: `const fs = require('fs');

function lengthOfLongestSubstring(s) {
  const map = new Map();
  let maxLen = 0, start = 0;
  for (let end = 0; end < s.length; end++) {
    const ch = s[end];
    if (map.has(ch) && map.get(ch) >= start) {
      start = map.get(ch) + 1;
    }
    map.set(ch, end);
    maxLen = Math.max(maxLen, end - start + 1);
  }
  return maxLen;
}

const input = fs.readFileSync(0, 'utf-8').replace(/[\\r\\n]+$/, '');
console.log(lengthOfLongestSubstring(input));
`,
    typescript: `import * as fs from 'fs';

function lengthOfLongestSubstring(s: string): number {
  const map = new Map<string, number>();
  let maxLen = 0, start = 0;
  for (let end = 0; end < s.length; end++) {
    const ch = s[end];
    if (map.has(ch) && (map.get(ch) as number) >= start) {
      start = (map.get(ch) as number) + 1;
    }
    map.set(ch, end);
    maxLen = Math.max(maxLen, end - start + 1);
  }
  return maxLen;
}

const input = fs.readFileSync(0, 'utf-8').replace(/[\\r\\n]+$/, '');
console.log(lengthOfLongestSubstring(input));
`,
    java: `import java.util.*;

public class Solution {
    public static int lengthOfLongestSubstring(String s) {
        Map<Character, Integer> map = new HashMap<>();
        int maxLen = 0, start = 0;
        for (int end = 0; end < s.length(); end++) {
            char ch = s.charAt(end);
            if (map.containsKey(ch) && map.get(ch) >= start) {
                start = map.get(ch) + 1;
            }
            map.put(ch, end);
            maxLen = Math.max(maxLen, end - start + 1);
        }
        return maxLen;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.hasNextLine() ? sc.nextLine() : "";
        System.out.println(lengthOfLongestSubstring(s));
    }
}
`,
    cpp: `#include <iostream>
#include <string>
#include <unordered_map>
#include <algorithm>

using namespace std;

int lengthOfLongestSubstring(string s) {
    unordered_map<char, int> map;
    int maxLen = 0, start = 0;
    for (int end = 0; end < (int)s.length(); ++end) {
        char ch = s[end];
        if (map.count(ch) && map[ch] >= start) {
            start = map[ch] + 1;
        }
        map[ch] = end;
        maxLen = max(maxLen, end - start + 1);
    }
    return maxLen;
}

int main() {
    string s;
    if (getline(cin, s)) {
        cout << lengthOfLongestSubstring(s) << endl;
    }
    return 0;
}
`,
  },

  'prob-climbing-stairs': {
    python: `import sys

def climb_stairs(n: int) -> int:
    if n <= 2:
        return n
    first, second = 1, 2
    for _ in range(3, n + 1):
        first, second = second, first + second
    return second

if __name__ == "__main__":
    val = int(sys.stdin.read().strip())
    print(climb_stairs(val))
`,
    javascript: `const fs = require('fs');

function climbStairs(n) {
  if (n <= 2) return n;
  let a = 1, b = 2;
  for (let i = 3; i <= n; i++) {
    const c = a + b;
    a = b;
    b = c;
  }
  return b;
}

const input = parseInt(fs.readFileSync(0, 'utf-8').trim(), 10);
console.log(climbStairs(input));
`,
    typescript: `import * as fs from 'fs';

function climbStairs(n: number): number {
  if (n <= 2) return n;
  let a = 1, b = 2;
  for (let i = 3; i <= n; i++) {
    const c = a + b;
    a = b;
    b = c;
  }
  return b;
}

const input = parseInt(fs.readFileSync(0, 'utf-8').trim(), 10);
console.log(climbStairs(input));
`,
    java: `import java.util.*;

public class Solution {
    public static int climbStairs(int n) {
        if (n <= 2) return n;
        int a = 1, b = 2;
        for (int i = 3; i <= n; i++) {
            int c = a + b;
            a = b;
            b = c;
        }
        return b;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            System.out.println(climbStairs(sc.nextInt()));
        }
    }
}
`,
    cpp: `#include <iostream>

using namespace std;

int climbStairs(int n) {
    if (n <= 2) return n;
    int a = 1, b = 2;
    for (int i = 3; i <= n; ++i) {
        int c = a + b;
        a = b;
        b = c;
    }
    return b;
}

int main() {
    int n;
    if (cin >> n) {
        cout << climbStairs(n) << endl;
    }
    return 0;
}
`,
  },

  'prob-coin-change': {
    python: `import sys

def coin_change(amount: int, coins: list[int]) -> int:
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for coin in coins:
        for x in range(coin, amount + 1):
            dp[x] = min(dp[x], dp[x - coin] + 1)
    return dp[amount] if dp[amount] != float('inf') else -1

if __name__ == "__main__":
    lines = sys.stdin.read().strip().splitlines()
    if len(lines) >= 2:
        amount = int(lines[0].strip())
        coins = list(map(int, lines[1].strip().split()))
        print(coin_change(amount, coins))
`,
    javascript: `const fs = require('fs');

function coinChange(amount, coins) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (const c of coins) {
    for (let x = c; x <= amount; x++) {
      dp[x] = Math.min(dp[x], dp[x - c] + 1);
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}

const lines = fs.readFileSync(0, 'utf-8').trim().split('\\n');
if (lines.length >= 2) {
  const amount = parseInt(lines[0].trim(), 10);
  const coins = lines[1].trim().split(/\\s+/).map(Number);
  console.log(coinChange(amount, coins));
}
`,
    typescript: `import * as fs from 'fs';

function coinChange(amount: number, coins: number[]): number {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (const c of coins) {
    for (let x = c; x <= amount; x++) {
      dp[x] = Math.min(dp[x], dp[x - c] + 1);
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}

const lines = fs.readFileSync(0, 'utf-8').trim().split('\\n');
if (lines.length >= 2) {
  const amount = parseInt(lines[0].trim(), 10);
  const coins = lines[1].trim().split(/\\s+/).map(Number);
  console.log(coinChange(amount, coins));
}
`,
    java: `import java.util.*;

public class Solution {
    public static int coinChange(int amount, int[] coins) {
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, amount + 1);
        dp[0] = 0;
        for (int c : coins) {
            for (int x = c; x <= amount; x++) {
                dp[x] = Math.min(dp[x], dp[x - c] + 1);
            }
        }
        return dp[amount] > amount ? -1 : dp[amount];
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int amount = sc.nextInt();
            List<Integer> list = new ArrayList<>();
            while (sc.hasNextInt()) list.add(sc.nextInt());
            int[] coins = list.stream().mapToInt(i -> i).toArray();
            System.out.println(coinChange(amount, coins));
        }
    }
}
`,
    cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int coinChange(int amount, vector<int>& coins) {
    vector<int> dp(amount + 1, amount + 1);
    dp[0] = 0;
    for (int c : coins) {
        for (int x = c; x <= amount; ++x) {
            dp[x] = min(dp[x], dp[x - c] + 1);
        }
    }
    return dp[amount] > amount ? -1 : dp[amount];
}

int main() {
    int amount;
    if (cin >> amount) {
        vector<int> coins;
        int c;
        while (cin >> c) coins.push_back(c);
        cout << coinChange(amount, coins) << endl;
    }
    return 0;
}
`,
  },

  'prob-hamming-weight': {
    python: `import sys

def hamming_weight(n: int) -> int:
    count = 0
    while n:
        n &= n - 1
        count += 1
    return count

if __name__ == "__main__":
    val = int(sys.stdin.read().strip())
    print(hamming_weight(val))
`,
    javascript: `const fs = require('fs');

function hammingWeight(n) {
  let count = 0;
  while (n > 0) {
    n = n & (n - 1);
    count++;
  }
  return count;
}

const input = parseInt(fs.readFileSync(0, 'utf-8').trim(), 10);
console.log(hammingWeight(input));
`,
    typescript: `import * as fs from 'fs';

function hammingWeight(n: number): number {
  let count = 0;
  while (n > 0) {
    n = n & (n - 1);
    count++;
  }
  return count;
}

const input = parseInt(fs.readFileSync(0, 'utf-8').trim(), 10);
console.log(hammingWeight(input));
`,
    java: `import java.util.*;

public class Solution {
    public static int hammingWeight(int n) {
        int count = 0;
        while (n != 0) {
            n &= (n - 1);
            count++;
        }
        return count;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            System.out.println(hammingWeight(sc.nextInt()));
        }
    }
}
`,
    cpp: `#include <iostream>

using namespace std;

int hammingWeight(int n) {
    int count = 0;
    while (n) {
        n &= (n - 1);
        count++;
    }
    return count;
}

int main() {
    int n;
    if (cin >> n) {
        cout << hammingWeight(n) << endl;
    }
    return 0;
}
`,
  },

  'prob-sql-manager-salaries': {
    sql: `-- Write your SQL query statement below
SELECT e.name AS Employee
FROM Employee e
JOIN Employee m ON e.managerId = m.id
WHERE e.salary > m.salary
ORDER BY e.name ASC;
`,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPANDED PROBLEMS (PUBLIC STUDENT CATALOG)
// starterCode provides function signatures and execution wrappers ONLY.
// Solutions are strictly omitted and kept on the server.
// ─────────────────────────────────────────────────────────────────────────────
export const EXPANDED_PROBLEMS: Problem[] = [
  {
    id: 'prob-is-palindrome',
    slug: 'valid-palindrome-string',
    title: 'Valid Palindrome',
    description: `A phrase is a **palindrome** if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.

Given a string \`s\`, return \`true\` if it is a palindrome, or \`false\` otherwise.`,
    topicId: 'arrays-strings',
    topicName: 'Arrays & Strings',
    difficulty: 'absolute_beginner',
    tags: ['Strings', 'Two Pointers', 'Formatting'],
    companyPatterns: ['Microsoft-Style', 'Two Pointers Pattern'],
    inputFormat: 'A single string s on standard input.',
    outputFormat: 'Print "true" or "false".',
    constraints: `1 <= s.length <= 2 * 10^5
s consists only of printable ASCII characters.`,
    supportedLanguages: ['python', 'javascript', 'typescript', 'java', 'cpp'],
    examples: [
      {
        input: 'A man, a plan, a canal: Panama',
        output: 'true',
        explanation: '"amanaplanacanalpanama" is a palindrome.',
      },
      {
        input: 'race a car',
        output: 'false',
        explanation: '"raceacar" is not a palindrome.',
      },
      {
        input: ' ',
        output: 'true',
        explanation: 's is an empty string "" after removing non-alphanumeric characters, which is a palindrome.',
      },
    ],
    starterCode: {
      python: `def is_palindrome(s: str) -> bool:
    # Write your solution here
    pass


# Test execution wrapper
import sys

if __name__ == "__main__":
    line = sys.stdin.read().strip()
    print("true" if is_palindrome(line) else "false")
`,
      javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isPalindrome(s) {
  // Write your solution here
  return false;
}

// Test execution wrapper
const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim();
console.log(isPalindrome(input) ? "true" : "false");
`,
      typescript: `function isPalindrome(s: string): boolean {
  // Write your solution here
  return false;
}

// Test execution wrapper
import * as fs from 'fs';
const input = fs.readFileSync(0, 'utf-8').trim();
console.log(isPalindrome(input) ? "true" : "false");
`,
      java: `import java.util.*;

public class Solution {
    public static boolean isPalindrome(String s) {
        // Write your solution here
        return false;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.hasNextLine() ? sc.nextLine() : "";
        System.out.println(isPalindrome(s) ? "true" : "false");
    }
}
`,
      cpp: `#include <iostream>
#include <string>

using namespace std;

bool isPalindrome(string s) {
    // Write your solution here
    return false;
}

int main() {
    string s;
    if (getline(cin, s)) {
        cout << (isPalindrome(s) ? "true" : "false") << endl;
    }
    return 0;
}
`,
    },
    hints: [
      'Filter out non-alphanumeric characters and convert uppercase letters to lowercase.',
      'Consider using two pointers: one at the start and one at the end moving inward.',
    ],
    expectedComplexity: {
      time: 'O(n)',
      space: 'O(1) auxiliary pointer memory',
    },
    timeLimitSeconds: 2,
    memoryLimitKB: 128000,
    isPublished: true,
    submissionCount: 420,
    acceptedCount: 310,
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-04-01T00:00:00.000Z',
  },

  {
    id: 'prob-max-subarray',
    slug: 'maximum-subarray-sum',
    title: 'Maximum Subarray Sum (Kadane)',
    description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return *its sum*.

A **subarray** is a contiguous non-empty sequence of elements within an array.`,
    topicId: 'arrays-strings',
    topicName: 'Arrays & Strings',
    difficulty: 'beginner',
    tags: ['Arrays', 'Dynamic Programming', 'Divide and Conquer'],
    companyPatterns: ['Amazon-Style', 'Dynamic Programming Pattern'],
    inputFormat: 'A single line containing whitespace-separated integers.',
    outputFormat: 'Print the maximum subarray sum.',
    constraints: `1 <= nums.length <= 10^5
-10^4 <= nums[i] <= 10^4`,
    supportedLanguages: ['python', 'javascript', 'typescript', 'java', 'cpp'],
    examples: [
      {
        input: '-2 1 -3 4 -1 2 1 -5 4',
        output: '6',
        explanation: 'The subarray [4, -1, 2, 1] has the largest sum 6.',
      },
      {
        input: '1',
        output: '1',
        explanation: 'The subarray [1] has the largest sum 1.',
      },
      {
        input: '5 4 -1 7 8',
        output: '23',
        explanation: 'The subarray [5, 4, -1, 7, 8] has the largest sum 23.',
      },
    ],
    starterCode: {
      python: `def max_sub_array(nums: list[int]) -> int:
    # Write your solution here
    pass


# Test execution wrapper
import sys

if __name__ == "__main__":
    nums = list(map(int, sys.stdin.read().strip().split()))
    if nums:
        print(max_sub_array(nums))
`,
      javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
function maxSubArray(nums) {
  // Write your solution here
  return 0;
}

// Test execution wrapper
const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/).map(Number);
console.log(maxSubArray(input));
`,
      typescript: `function maxSubArray(nums: number[]): number {
  // Write your solution here
  return 0;
}

// Test execution wrapper
import * as fs from 'fs';
const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/).map(Number);
console.log(maxSubArray(input));
`,
      java: `import java.util.*;

public class Solution {
    public static int maxSubArray(int[] nums) {
        // Write your solution here
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        List<Integer> list = new ArrayList<>();
        while (sc.hasNextInt()) list.add(sc.nextInt());
        int[] arr = list.stream().mapToInt(i -> i).toArray();
        System.out.println(maxSubArray(arr));
    }
}
`,
      cpp: `#include <iostream>
#include <vector>

using namespace std;

int maxSubArray(vector<int>& nums) {
    // Write your solution here
    return 0;
}

int main() {
    vector<int> nums;
    int x;
    while (cin >> x) nums.push_back(x);
    if (!nums.empty()) cout << maxSubArray(nums) << endl;
    return 0;
}
`,
    },
    hints: [
      'Think about Kadane\'s algorithm: at each index i, what is the maximum sum of a subarray ending at i?',
      'If the running sum becomes negative, starting fresh at the next element is optimal.',
    ],
    expectedComplexity: {
      time: 'O(n)',
      space: 'O(1)',
    },
    timeLimitSeconds: 2,
    memoryLimitKB: 128000,
    isPublished: true,
    submissionCount: 560,
    acceptedCount: 380,
    createdAt: '2026-03-02T00:00:00.000Z',
    updatedAt: '2026-04-01T00:00:00.000Z',
  },

  {
    id: 'prob-search-rotated-array',
    slug: 'search-in-rotated-sorted-array',
    title: 'Search in Rotated Sorted Array',
    description: `There is an integer array \`nums\` sorted in ascending order (with **distinct** values).

Prior to being passed to your function, \`nums\` is possibly rotated at an unknown pivot index \`k\` (1 <= k < nums.length) such that the resulting array is \`[nums[k], nums[k+1], ..., nums[n-1], nums[0], nums[1], ..., nums[k-1]]\`.

Given the array \`nums\` after the possible rotation and an integer \`target\`, return *the 0-based index of \`target\` if it is in \`nums\`, or \`-1\` if it is not in \`nums\`*.

You must write an algorithm with \`O(log n)\` runtime complexity.`,
    topicId: 'searching-sorting',
    topicName: 'Searching & Sorting',
    difficulty: 'intermediate',
    tags: ['Binary Search', 'Arrays'],
    companyPatterns: ['Google-Style', 'Binary Search Pattern'],
    inputFormat: 'Line 1: Target integer.\\nLine 2: Space-separated integers representing the rotated array.',
    outputFormat: 'Print the index of target or -1.',
    constraints: `1 <= nums.length <= 5000
-10^4 <= nums[i] <= 10^4
All values of nums are unique.
nums is an ascending array that is possibly rotated.`,
    supportedLanguages: ['python', 'javascript', 'typescript', 'java', 'cpp'],
    examples: [
      {
        input: '0\\n4 5 6 7 0 1 2',
        output: '4',
        explanation: '0 is located at index 4 in the rotated array.',
      },
      {
        input: '3\\n4 5 6 7 0 1 2',
        output: '-1',
        explanation: '3 is not present in the array, so -1 is returned.',
      },
      {
        input: '0\\n1',
        output: '-1',
      },
    ],
    starterCode: {
      python: `def search_rotated(target: int, nums: list[int]) -> int:
    # Write your solution here
    pass


# Test execution wrapper
import sys

if __name__ == "__main__":
    lines = sys.stdin.read().strip().splitlines()
    if len(lines) >= 2:
        target = int(lines[0].strip())
        nums = list(map(int, lines[1].strip().split()))
        print(search_rotated(target, nums))
`,
      javascript: `/**
 * @param {number} target
 * @param {number[]} nums
 * @return {number}
 */
function searchRotated(target, nums) {
  // Write your solution here
  return -1;
}

// Test execution wrapper
const fs = require('fs');
const lines = fs.readFileSync(0, 'utf-8').trim().split('\\n');
if (lines.length >= 2) {
  const target = parseInt(lines[0].trim(), 10);
  const nums = lines[1].trim().split(/\\s+/).map(Number);
  console.log(searchRotated(target, nums));
}
`,
      typescript: `function searchRotated(target: number, nums: number[]): number {
  // Write your solution here
  return -1;
}

// Test execution wrapper
import * as fs from 'fs';
const lines = fs.readFileSync(0, 'utf-8').trim().split('\\n');
if (lines.length >= 2) {
  const target = parseInt(lines[0].trim(), 10);
  const nums = lines[1].trim().split(/\\s+/).map(Number);
  console.log(searchRotated(target, nums));
}
`,
      java: `import java.util.*;

public class Solution {
    public static int searchRotated(int target, int[] nums) {
        // Write your solution here
        return -1;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int target = sc.nextInt();
            List<Integer> list = new ArrayList<>();
            while (sc.hasNextInt()) list.add(sc.nextInt());
            int[] arr = list.stream().mapToInt(i -> i).toArray();
            System.out.println(searchRotated(target, arr));
        }
    }
}
`,
      cpp: `#include <iostream>
#include <vector>

using namespace std;

int searchRotated(int target, vector<int>& nums) {
    // Write your solution here
    return -1;
}

int main() {
    int target;
    if (cin >> target) {
        vector<int> nums;
        int x;
        while (cin >> x) nums.push_back(x);
        cout << searchRotated(target, nums) << endl;
    }
    return 0;
}
`,
    },
    hints: [
      'In any rotated sorted array, one half (either left or right of mid) is always strictly sorted.',
      'Check if target falls within the bounds of the sorted half; if it does, narrow search to that half, otherwise search the other half.',
    ],
    expectedComplexity: {
      time: 'O(log n)',
      space: 'O(1)',
    },
    timeLimitSeconds: 2,
    memoryLimitKB: 128000,
    isPublished: true,
    submissionCount: 380,
    acceptedCount: 220,
    createdAt: '2026-03-03T00:00:00.000Z',
    updatedAt: '2026-04-01T00:00:00.000Z',
  },

  {
    id: 'prob-longest-non-repeating-substr',
    slug: 'longest-substring-without-repeating-characters',
    title: 'Longest Substring Without Repeating Characters',
    description: `Given a string \`s\`, find the length of the **longest substring** without duplicate characters.`,
    topicId: 'arrays-strings',
    topicName: 'Arrays & Strings',
    difficulty: 'intermediate',
    tags: ['Hash Table', 'String', 'Sliding Window'],
    companyPatterns: ['Amazon-Style', 'Meta-Style', 'Sliding Window Pattern'],
    inputFormat: 'A single string s on standard input.',
    outputFormat: 'Print the integer length of the longest substring with unique characters.',
    constraints: `0 <= s.length <= 5 * 10^4
s consists of English letters, digits, symbols and spaces.`,
    supportedLanguages: ['python', 'javascript', 'typescript', 'java', 'cpp'],
    examples: [
      {
        input: 'abcabcbb',
        output: '3',
        explanation: 'The answer is "abc", with the length of 3.',
      },
      {
        input: 'bbbbb',
        output: '1',
        explanation: 'The answer is "b", with the length of 1.',
      },
      {
        input: 'pwwkew',
        output: '3',
        explanation: 'The answer is "wke", with the length of 3. Notice "pwke" is a subsequence and not a substring.',
      },
    ],
    starterCode: {
      python: `def length_of_longest_substring(s: str) -> int:
    # Write your solution here
    pass


# Test execution wrapper
import sys

if __name__ == "__main__":
    line = sys.stdin.read().rstrip('\\r\\n')
    print(length_of_longest_substring(line))
`,
      javascript: `/**
 * @param {string} s
 * @return {number}
 */
function lengthOfLongestSubstring(s) {
  // Write your solution here
  return 0;
}

// Test execution wrapper
const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').replace(/[\\r\\n]+$/, '');
console.log(lengthOfLongestSubstring(input));
`,
      typescript: `function lengthOfLongestSubstring(s: string): number {
  // Write your solution here
  return 0;
}

// Test execution wrapper
import * as fs from 'fs';
const input = fs.readFileSync(0, 'utf-8').replace(/[\\r\\n]+$/, '');
console.log(lengthOfLongestSubstring(input));
`,
      java: `import java.util.*;

public class Solution {
    public static int lengthOfLongestSubstring(String s) {
        // Write your solution here
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.hasNextLine() ? sc.nextLine() : "";
        System.out.println(lengthOfLongestSubstring(s));
    }
}
`,
      cpp: `#include <iostream>
#include <string>

using namespace std;

int lengthOfLongestSubstring(string s) {
    // Write your solution here
    return 0;
}

int main() {
    string s;
    if (getline(cin, s)) {
        cout << lengthOfLongestSubstring(s) << endl;
    }
    return 0;
}
`,
    },
    hints: [
      'Use a sliding window [start, end] and a hash map recording the last seen index of each character.',
      'When a duplicate is encountered within the current window, move the left window boundary past the previous occurrence.',
    ],
    expectedComplexity: {
      time: 'O(n)',
      space: 'O(min(m, n)) where m is charset size',
    },
    timeLimitSeconds: 2,
    memoryLimitKB: 128000,
    isPublished: true,
    submissionCount: 490,
    acceptedCount: 310,
    createdAt: '2026-03-04T00:00:00.000Z',
    updatedAt: '2026-04-01T00:00:00.000Z',
  },

  {
    id: 'prob-climbing-stairs',
    slug: 'climbing-stairs-fibonacci',
    title: 'Climbing Stairs',
    description: `You are climbing a staircase. It takes \`n\` steps to reach the top.

Each time you can either climb \`1\` or \`2\` steps. In how many distinct ways can you climb to the top?`,
    topicId: 'dynamic-programming',
    topicName: 'Dynamic Programming',
    difficulty: 'absolute_beginner',
    tags: ['Math', 'Dynamic Programming', 'Memoization'],
    companyPatterns: ['Apple-Style', 'Dynamic Programming Pattern'],
    inputFormat: 'A single integer n on standard input.',
    outputFormat: 'Print the number of distinct ways to climb to the top.',
    constraints: `1 <= n <= 45`,
    supportedLanguages: ['python', 'javascript', 'typescript', 'java', 'cpp'],
    examples: [
      {
        input: '2',
        output: '2',
        explanation: 'There are two ways: 1 step + 1 step, or 2 steps.',
      },
      {
        input: '3',
        output: '3',
        explanation: 'There are three ways: 1+1+1, 1+2, or 2+1.',
      },
      {
        input: '5',
        output: '8',
        explanation: 'Ways to reach 5 steps follow the Fibonacci recurrence.',
      },
    ],
    starterCode: {
      python: `def climb_stairs(n: int) -> int:
    # Write your solution here
    pass


# Test execution wrapper
import sys

if __name__ == "__main__":
    val = int(sys.stdin.read().strip())
    print(climb_stairs(val))
`,
      javascript: `/**
 * @param {number} n
 * @return {number}
 */
function climbStairs(n) {
  // Write your solution here
  return 0;
}

// Test execution wrapper
const fs = require('fs');
const input = parseInt(fs.readFileSync(0, 'utf-8').trim(), 10);
console.log(climbStairs(input));
`,
      typescript: `function climbStairs(n: number): number {
  // Write your solution here
  return 0;
}

// Test execution wrapper
import * as fs from 'fs';
const input = parseInt(fs.readFileSync(0, 'utf-8').trim(), 10);
console.log(climbStairs(input));
`,
      java: `import java.util.*;

public class Solution {
    public static int climbStairs(int n) {
        // Write your solution here
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            System.out.println(climbStairs(sc.nextInt()));
        }
    }
}
`,
      cpp: `#include <iostream>

using namespace std;

int climbStairs(int n) {
    // Write your solution here
    return 0;
}

int main() {
    int n;
    if (cin >> n) {
        cout << climbStairs(n) << endl;
    }
    return 0;
}
`,
    },
    hints: [
      'To reach step n, you can either step from (n - 1) or from (n - 2).',
      'The recurrence relation is f(n) = f(n - 1) + f(n - 2).',
    ],
    expectedComplexity: {
      time: 'O(n)',
      space: 'O(1)',
    },
    timeLimitSeconds: 2,
    memoryLimitKB: 128000,
    isPublished: true,
    submissionCount: 620,
    acceptedCount: 450,
    createdAt: '2026-03-05T00:00:00.000Z',
    updatedAt: '2026-04-01T00:00:00.000Z',
  },

  {
    id: 'prob-coin-change',
    slug: 'coin-change-unbounded-knapsack',
    title: 'Coin Change',
    description: `You are given an integer array \`coins\` representing coins of different denominations and an integer \`amount\` representing a total amount of money.

Return *the fewest number of coins that you need to make up that amount*. If that amount of money cannot be made up by any combination of the coins, return \`-1\`.

You may assume that you have an infinite number of each kind of coin.`,
    topicId: 'dynamic-programming',
    topicName: 'Dynamic Programming',
    difficulty: 'intermediate',
    tags: ['Dynamic Programming', 'Breadth-First Search'],
    companyPatterns: ['Amazon-Style', 'Knapsack Pattern'],
    inputFormat: 'Line 1: Target integer amount.\\nLine 2: Space-separated coin denominations.',
    outputFormat: 'Print the minimum coin count or -1.',
    constraints: `1 <= coins.length <= 12
1 <= coins[i] <= 2^31 - 1
0 <= amount <= 10^4`,
    supportedLanguages: ['python', 'javascript', 'typescript', 'java', 'cpp'],
    examples: [
      {
        input: '11\\n1 2 5',
        output: '3',
        explanation: '11 = 5 + 5 + 1 (3 coins)',
      },
      {
        input: '3\\n2',
        output: '-1',
        explanation: 'Amount 3 cannot be formed with coin 2.',
      },
      {
        input: '0\\n1',
        output: '0',
        explanation: 'Amount 0 requires 0 coins.',
      },
    ],
    starterCode: {
      python: `def coin_change(amount: int, coins: list[int]) -> int:
    # Write your solution here
    pass


# Test execution wrapper
import sys

if __name__ == "__main__":
    lines = sys.stdin.read().strip().splitlines()
    if len(lines) >= 2:
        amount = int(lines[0].strip())
        coins = list(map(int, lines[1].strip().split()))
        print(coin_change(amount, coins))
`,
      javascript: `/**
 * @param {number} amount
 * @param {number[]} coins
 * @return {number}
 */
function coinChange(amount, coins) {
  // Write your solution here
  return -1;
}

// Test execution wrapper
const fs = require('fs');
const lines = fs.readFileSync(0, 'utf-8').trim().split('\\n');
if (lines.length >= 2) {
  const amount = parseInt(lines[0].trim(), 10);
  const coins = lines[1].trim().split(/\\s+/).map(Number);
  console.log(coinChange(amount, coins));
}
`,
      typescript: `function coinChange(amount: number, coins: number[]): number {
  // Write your solution here
  return -1;
}

// Test execution wrapper
import * as fs from 'fs';
const lines = fs.readFileSync(0, 'utf-8').trim().split('\\n');
if (lines.length >= 2) {
  const amount = parseInt(lines[0].trim(), 10);
  const coins = lines[1].trim().split(/\\s+/).map(Number);
  console.log(coinChange(amount, coins));
}
`,
      java: `import java.util.*;

public class Solution {
    public static int coinChange(int amount, int[] coins) {
        // Write your solution here
        return -1;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int amount = sc.nextInt();
            List<Integer> list = new ArrayList<>();
            while (sc.hasNextInt()) list.add(sc.nextInt());
            int[] coins = list.stream().mapToInt(i -> i).toArray();
            System.out.println(coinChange(amount, coins));
        }
    }
}
`,
      cpp: `#include <iostream>
#include <vector>

using namespace std;

int coinChange(int amount, vector<int>& coins) {
    // Write your solution here
    return -1;
}

int main() {
    int amount;
    if (cin >> amount) {
        vector<int> coins;
        int c;
        while (cin >> c) coins.push_back(c);
        cout << coinChange(amount, coins) << endl;
    }
    return 0;
}
`,
    },
    hints: [
      'Initialize an array dp of size amount + 1 filled with infinity, with dp[0] = 0.',
      'For each coin, iterate through amount x from coin to amount and update dp[x] = min(dp[x], dp[x - coin] + 1).',
    ],
    expectedComplexity: {
      time: 'O(amount * coins.length)',
      space: 'O(amount)',
    },
    timeLimitSeconds: 2,
    memoryLimitKB: 128000,
    isPublished: true,
    submissionCount: 410,
    acceptedCount: 260,
    createdAt: '2026-03-06T00:00:00.000Z',
    updatedAt: '2026-04-01T00:00:00.000Z',
  },

  {
    id: 'prob-hamming-weight',
    slug: 'number-of-one-bits',
    title: 'Number of 1 Bits (Hamming Weight)',
    description: `Given a positive integer \`n\`, write a function that returns the number of set bits (1s) in its binary representation (also known as the **Hamming weight**).`,
    topicId: 'programming-fundamentals',
    topicName: 'Programming Fundamentals',
    difficulty: 'absolute_beginner',
    tags: ['Divide and Conquer', 'Bit Manipulation'],
    companyPatterns: ['Microsoft-Style', 'Bit Manipulation Pattern'],
    inputFormat: 'A single positive integer n on standard input.',
    outputFormat: 'Print the count of 1 bits in the binary representation of n.',
    constraints: `1 <= n <= 2^31 - 1`,
    supportedLanguages: ['python', 'javascript', 'typescript', 'java', 'cpp'],
    examples: [
      {
        input: '11',
        output: '3',
        explanation: 'The input binary is 1011, which has three 1 bits.',
      },
      {
        input: '128',
        output: '1',
        explanation: 'The input binary is 10000000, which has one 1 bit.',
      },
      {
        input: '2147483645',
        output: '30',
        explanation: 'All bits are 1 except bit position 1.',
      },
    ],
    starterCode: {
      python: `def hamming_weight(n: int) -> int:
    # Write your solution here
    pass


# Test execution wrapper
import sys

if __name__ == "__main__":
    val = int(sys.stdin.read().strip())
    print(hamming_weight(val))
`,
      javascript: `/**
 * @param {number} n
 * @return {number}
 */
function hammingWeight(n) {
  // Write your solution here
  return 0;
}

// Test execution wrapper
const fs = require('fs');
const input = parseInt(fs.readFileSync(0, 'utf-8').trim(), 10);
console.log(hammingWeight(input));
`,
      typescript: `function hammingWeight(n: number): number {
  // Write your solution here
  return 0;
}

// Test execution wrapper
import * as fs from 'fs';
const input = parseInt(fs.readFileSync(0, 'utf-8').trim(), 10);
console.log(hammingWeight(input));
`,
      java: `import java.util.*;

public class Solution {
    public static int hammingWeight(int n) {
        // Write your solution here
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            System.out.println(hammingWeight(sc.nextInt()));
        }
    }
}
`,
      cpp: `#include <iostream>

using namespace std;

int hammingWeight(int n) {
    // Write your solution here
    return 0;
}

int main() {
    int n;
    if (cin >> n) {
        cout << hammingWeight(n) << endl;
    }
    return 0;
}
`,
    },
    hints: [
      'Repeatedly check the least significant bit with (n & 1) and shift right with (n >>= 1).',
      'Alternatively, use the bit trick n = n & (n - 1) which clears the lowest set bit in O(number of 1s).',
    ],
    expectedComplexity: {
      time: 'O(k) where k is the number of 1-bits',
      space: 'O(1)',
    },
    timeLimitSeconds: 2,
    memoryLimitKB: 128000,
    isPublished: true,
    submissionCount: 520,
    acceptedCount: 420,
    createdAt: '2026-03-07T00:00:00.000Z',
    updatedAt: '2026-04-01T00:00:00.000Z',
  },

  {
    id: 'prob-sql-manager-salaries',
    slug: 'employees-earning-more-than-managers',
    title: 'Employees Earning More Than Their Managers',
    description: `Table: \`Employee\`
\`\`\`
+-------------+---------+
| Column Name | Type    |
+-------------+---------+
| id          | int     |
| name        | varchar |
| salary      | int     |
| managerId   | int     |
+-------------+---------+
\`\`\`
\`id\` is the primary key column for this table.
Each row indicates the ID of an employee, their name, their salary, and the ID of their manager.

Write an SQL query to find the employees who earn more than their managers. Return the employee names sorted in ascending alphabetical order.`,
    topicId: 'sql-databases',
    topicName: 'SQL & Database Queries',
    difficulty: 'beginner',
    tags: ['Database', 'SQL', 'Self Join'],
    companyPatterns: ['Amazon-Style', 'Self-Join Pattern'],
    inputFormat: 'Employee database schema with salary records.',
    outputFormat: 'List of Employee names who earn more than their manager.',
    constraints: `1 <= Employee.length <= 10^4
1 <= salary <= 10^6`,
    supportedLanguages: ['sql'],
    examples: [
      {
        input: `Employee table:
id | name  | salary | managerId
1  | Joe   | 70000  | 3
2  | Henry | 80000  | 4
3  | Sam   | 60000  | Null
4  | Max   | 90000  | Null`,
        output: `Employee
Joe`,
        explanation: 'Joe is the only employee who earns more than his manager (Joe 70k > Sam 60k).',
      },
    ],
    starterCode: {
      sql: `-- Write your SQL query statement below
`,
    },
    hints: [
      'Perform a self-join on the Employee table: JOIN Employee m ON e.managerId = m.id.',
      'Filter where e.salary > m.salary.',
    ],
    expectedComplexity: {
      time: 'O(n) with relational index lookup',
      space: 'O(n)',
    },
    timeLimitSeconds: 3,
    memoryLimitKB: 256000,
    isPublished: true,
    submissionCount: 450,
    acceptedCount: 360,
    createdAt: '2026-03-08T00:00:00.000Z',
    updatedAt: '2026-04-01T00:00:00.000Z',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// EXPANDED TEST CASES (PROTECTED STORE)
// Contains public visible examples and private hidden test suites.
// ─────────────────────────────────────────────────────────────────────────────
export const EXPANDED_TEST_CASES: Record<string, ProblemTestCase[]> = {
  'prob-is-palindrome': [
    {
      id: 'tc-pal-pub-1',
      problemId: 'prob-is-palindrome',
      input: 'A man, a plan, a canal: Panama',
      expectedOutput: 'true',
      isPublic: true,
      order: 1,
    },
    {
      id: 'tc-pal-pub-2',
      problemId: 'prob-is-palindrome',
      input: 'race a car',
      expectedOutput: 'false',
      isPublic: true,
      order: 2,
    },
    {
      id: 'tc-pal-pub-3',
      problemId: 'prob-is-palindrome',
      input: ' ',
      expectedOutput: 'true',
      isPublic: true,
      order: 3,
    },
    // Private hidden tests
    {
      id: 'tc-pal-priv-1',
      problemId: 'prob-is-palindrome',
      input: '0P',
      expectedOutput: 'false',
      isPublic: false,
      order: 4,
      explanation: 'Punctuation vs alphanumeric digit character mismatch.',
    },
    {
      id: 'tc-pal-priv-2',
      problemId: 'prob-is-palindrome',
      input: 'ab_a',
      expectedOutput: 'true',
      isPublic: false,
      order: 5,
      explanation: 'Underscore is non-alphanumeric and must be stripped.',
    },
    {
      id: 'tc-pal-priv-3',
      problemId: 'prob-is-palindrome',
      input: 'Was it a car or a cat I saw?',
      expectedOutput: 'true',
      isPublic: false,
      order: 6,
      explanation: 'Longer sentence palindrome with mixed punctuation.',
    },
  ],

  'prob-max-subarray': [
    {
      id: 'tc-ms-pub-1',
      problemId: 'prob-max-subarray',
      input: '-2 1 -3 4 -1 2 1 -5 4',
      expectedOutput: '6',
      isPublic: true,
      order: 1,
    },
    {
      id: 'tc-ms-pub-2',
      problemId: 'prob-max-subarray',
      input: '1',
      expectedOutput: '1',
      isPublic: true,
      order: 2,
    },
    {
      id: 'tc-ms-pub-3',
      problemId: 'prob-max-subarray',
      input: '5 4 -1 7 8',
      expectedOutput: '23',
      isPublic: true,
      order: 3,
    },
    // Private hidden tests
    {
      id: 'tc-ms-priv-1',
      problemId: 'prob-max-subarray',
      input: '-5 -3 -2 -1 -4',
      expectedOutput: '-1',
      isPublic: false,
      order: 4,
      explanation: 'All negative values must return least negative element.',
    },
    {
      id: 'tc-ms-priv-2',
      problemId: 'prob-max-subarray',
      input: '-10 20 -5 15 -30',
      expectedOutput: '30',
      isPublic: false,
      order: 5,
      explanation: 'Local dip inside optimal positive window.',
    },
  ],

  'prob-search-rotated-array': [
    {
      id: 'tc-sra-pub-1',
      problemId: 'prob-search-rotated-array',
      input: '0\\n4 5 6 7 0 1 2',
      expectedOutput: '4',
      isPublic: true,
      order: 1,
    },
    {
      id: 'tc-sra-pub-2',
      problemId: 'prob-search-rotated-array',
      input: '3\\n4 5 6 7 0 1 2',
      expectedOutput: '-1',
      isPublic: true,
      order: 2,
    },
    {
      id: 'tc-sra-pub-3',
      problemId: 'prob-search-rotated-array',
      input: '0\\n1',
      expectedOutput: '-1',
      isPublic: true,
      order: 3,
    },
    // Private hidden tests
    {
      id: 'tc-sra-priv-1',
      problemId: 'prob-search-rotated-array',
      input: '1\\n1 3',
      expectedOutput: '0',
      isPublic: false,
      order: 4,
    },
    {
      id: 'tc-sra-priv-2',
      problemId: 'prob-search-rotated-array',
      input: '3\\n3 1',
      expectedOutput: '0',
      isPublic: false,
      order: 5,
    },
    {
      id: 'tc-sra-priv-3',
      problemId: 'prob-search-rotated-array',
      input: '5\\n5 1 2 3 4',
      expectedOutput: '0',
      isPublic: false,
      order: 6,
    },
  ],

  'prob-longest-non-repeating-substr': [
    {
      id: 'tc-lnr-pub-1',
      problemId: 'prob-longest-non-repeating-substr',
      input: 'abcabcbb',
      expectedOutput: '3',
      isPublic: true,
      order: 1,
    },
    {
      id: 'tc-lnr-pub-2',
      problemId: 'prob-longest-non-repeating-substr',
      input: 'bbbbb',
      expectedOutput: '1',
      isPublic: true,
      order: 2,
    },
    {
      id: 'tc-lnr-pub-3',
      problemId: 'prob-longest-non-repeating-substr',
      input: 'pwwkew',
      expectedOutput: '3',
      isPublic: true,
      order: 3,
    },
    // Private hidden tests
    {
      id: 'tc-lnr-priv-1',
      problemId: 'prob-longest-non-repeating-substr',
      input: '',
      expectedOutput: '0',
      isPublic: false,
      order: 4,
    },
    {
      id: 'tc-lnr-priv-2',
      problemId: 'prob-longest-non-repeating-substr',
      input: 'au',
      expectedOutput: '2',
      isPublic: false,
      order: 5,
    },
    {
      id: 'tc-lnr-priv-3',
      problemId: 'prob-longest-non-repeating-substr',
      input: 'dvdf',
      expectedOutput: '3',
      isPublic: false,
      order: 6,
    },
  ],

  'prob-climbing-stairs': [
    {
      id: 'tc-cs-pub-1',
      problemId: 'prob-climbing-stairs',
      input: '2',
      expectedOutput: '2',
      isPublic: true,
      order: 1,
    },
    {
      id: 'tc-cs-pub-2',
      problemId: 'prob-climbing-stairs',
      input: '3',
      expectedOutput: '3',
      isPublic: true,
      order: 2,
    },
    {
      id: 'tc-cs-pub-3',
      problemId: 'prob-climbing-stairs',
      input: '5',
      expectedOutput: '8',
      isPublic: true,
      order: 3,
    },
    // Private hidden tests
    {
      id: 'tc-cs-priv-1',
      problemId: 'prob-climbing-stairs',
      input: '1',
      expectedOutput: '1',
      isPublic: false,
      order: 4,
    },
    {
      id: 'tc-cs-priv-2',
      problemId: 'prob-climbing-stairs',
      input: '10',
      expectedOutput: '89',
      isPublic: false,
      order: 5,
    },
  ],

  'prob-coin-change': [
    {
      id: 'tc-cc-pub-1',
      problemId: 'prob-coin-change',
      input: '11\\n1 2 5',
      expectedOutput: '3',
      isPublic: true,
      order: 1,
    },
    {
      id: 'tc-cc-pub-2',
      problemId: 'prob-coin-change',
      input: '3\\n2',
      expectedOutput: '-1',
      isPublic: true,
      order: 2,
    },
    {
      id: 'tc-cc-pub-3',
      problemId: 'prob-coin-change',
      input: '0\\n1',
      expectedOutput: '0',
      isPublic: true,
      order: 3,
    },
    // Private hidden tests
    {
      id: 'tc-cc-priv-1',
      problemId: 'prob-coin-change',
      input: '6249\\n186 419 83 408',
      expectedOutput: '20',
      isPublic: false,
      order: 4,
    },
  ],

  'prob-hamming-weight': [
    {
      id: 'tc-hw-pub-1',
      problemId: 'prob-hamming-weight',
      input: '11',
      expectedOutput: '3',
      isPublic: true,
      order: 1,
    },
    {
      id: 'tc-hw-pub-2',
      problemId: 'prob-hamming-weight',
      input: '128',
      expectedOutput: '1',
      isPublic: true,
      order: 2,
    },
    {
      id: 'tc-hw-pub-3',
      problemId: 'prob-hamming-weight',
      input: '2147483645',
      expectedOutput: '30',
      isPublic: true,
      order: 3,
    },
    // Private hidden tests
    {
      id: 'tc-hw-priv-1',
      problemId: 'prob-hamming-weight',
      input: '1',
      expectedOutput: '1',
      isPublic: false,
      order: 4,
    },
    {
      id: 'tc-hw-priv-2',
      problemId: 'prob-hamming-weight',
      input: '2147483647',
      expectedOutput: '31',
      isPublic: false,
      order: 5,
    },
  ],

  'prob-sql-manager-salaries': [
    {
      id: 'tc-sqm-pub-1',
      problemId: 'prob-sql-manager-salaries',
      input: 'Default manager salary hierarchy',
      expectedOutput: 'Joe',
      isPublic: true,
      order: 1,
    },
    // Private hidden tests
    {
      id: 'tc-sqm-priv-1',
      problemId: 'prob-sql-manager-salaries',
      input: 'Multiple subordinates out-earning manager',
      expectedOutput: 'Alice\\nCharlie',
      isPublic: false,
      order: 2,
    },
  ],
};

# Nexora CodeLab & InterviewAI — Database Schema (Cloud Firestore)

> **Status:** Phase 1 — Architecture & Planning  
> **Last Updated:** 2026-10-16

---

## 1. Design Principles

1. **Firestore-native design** — Structure data for query patterns, not relational normalization
2. **Minimal document size** — Keep documents lean; avoid embedding large arrays that grow unbounded
3. **Subcollections for owned lists** — Use subcollections when a list belongs to a parent and is queried independently
4. **Server-side authority** — Private test cases, admin data, and computed scores are never directly writable by clients
5. **Denormalize strategically** — Duplicate small, stable data (topic name, problem title) to avoid joins; accept controlled update propagation
6. **Security Rules alignment** — Every collection path maps to clear ownership and access rules

---

## 2. Collection Map

```
firestore-root/
│
├── users/{userId}                          # User profile and settings
│   ├── skillRecords/{topicId}              # Per-topic mastery (subcollection)
│   └── submissions/{submissionId}          # Code submissions (subcollection)
│
├── topics/{topicId}                        # Coding topics / subject areas
│
├── problems/{problemId}                    # Coding problems (public metadata)
│   └── testCases/{testCaseId}              # Test cases (subcollection, mixed visibility)
│
├── interviewTemplates/{templateId}         # Admin-defined interview templates
│
├── interviewSessions/{sessionId}           # Interview sessions
│   ├── messages/{messageId}                # Interview conversation messages (subcollection)
│   └── evaluationReport (single doc ID)    # Evaluation report (subcollection doc)
│
├── learningPaths/{pathId}                  # Curated learning paths
│   └── items/{itemId}                      # Path items in order (subcollection)
│
├── platformConfig/{configId}               # Admin-only platform configuration
│
└── adminAuditLog/{logId}                   # Administrative audit trail
```

---

## 3. Collection Schemas

### 3.1 `users/{userId}`

The user profile document. Document ID matches Firebase Auth UID.

```typescript
interface UserDocument {
  // Identity
  uid: string;                     // Firebase Auth UID (same as document ID)
  email: string;                   // From Firebase Auth
  displayName: string;             // User-chosen display name
  photoURL: string | null;         // Profile photo URL (future)
  
  // Role
  role: "student" | "admin";       // READ-ONLY from client perspective
                                   // Set via Admin SDK custom claims + Firestore
                                   // Security Rules: clients cannot write this field
  
  // Skill Level (global preference)
  selectedLevel: SkillLevel;       // User-selected preferred level
  recommendedLevel: SkillLevel | null;  // System-recommended (from diagnostic)
  
  // Profile
  bio: string;                     // Short biography (max 500 chars)
  preferredLanguage: ProgrammingLanguage;  // Default coding language
  
  // Statistics (denormalized, updated by Cloud Functions triggers)
  stats: {
    totalSubmissions: number;
    acceptedSubmissions: number;
    totalInterviews: number;
    completedInterviews: number;
    currentStreak: number;          // Consecutive days with activity
    longestStreak: number;
    lastActiveDate: string;         // ISO date string "2026-10-16"
  };
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

type SkillLevel = 
  | "absolute_beginner"
  | "beginner"
  | "intermediate"
  | "advanced"
  | "expert";

type ProgrammingLanguage = 
  | "python"
  | "javascript"
  | "java"
  | "cpp"
  | "c"
  | "go"
  | "sql";
```

**Access Rules:**
- Owner can read their own document
- Owner can update: `displayName`, `bio`, `selectedLevel`, `preferredLanguage`, `photoURL`
- Owner **cannot** update: `role`, `stats`, `recommendedLevel`, `email`, `uid`
- Admins can read any user document
- `stats` and `recommendedLevel` are updated only by Cloud Functions

**Query Patterns:**
- Get user by UID: `users/{uid}` (document get)
- Admin list users: `users` ordered by `createdAt` (paginated, admin-only)

---

### 3.2 `users/{userId}/skillRecords/{topicId}`

Per-topic mastery tracking. Document ID is the topic ID for direct access.

```typescript
interface SkillRecordDocument {
  topicId: string;                 // References topics/{topicId}
  topicName: string;               // Denormalized for display
  
  // Mastery
  currentLevel: SkillLevel;        // Current mastery in this topic
  problemsSolved: number;          // Accepted submissions in this topic
  problemsAttempted: number;       // Total attempts in this topic
  interviewsCompleted: number;     // Interviews involving this topic
  
  // Scoring
  averageScore: number;            // 0-100, rolling average
  lastScore: number | null;        // Most recent score
  
  // Recommendations
  recommendedLevel: SkillLevel | null;  // AI/system recommended level
  strengths: string[];             // Identified strength areas
  weaknesses: string[];            // Areas for improvement
  
  // Timestamps
  lastPracticedAt: Timestamp | null;
  updatedAt: Timestamp;
}
```

**Access Rules:**
- Owner can read their own skill records
- Owner **cannot** write directly — updated by Cloud Functions on submission/interview completion
- Admins can read any user's skill records

**Query Patterns:**
- Get all skill records for a user: `users/{uid}/skillRecords` (subcollection list)
- Get specific topic mastery: `users/{uid}/skillRecords/{topicId}` (document get)

---

### 3.3 `topics/{topicId}`

Subject areas for coding problems and interviews.

```typescript
interface TopicDocument {
  id: string;                      // Document ID
  name: string;                    // Display name (e.g., "Arrays", "Dynamic Programming")
  slug: string;                    // URL-safe slug
  description: string;             // Topic description
  category: string;                // Grouping (e.g., "Data Structures", "Algorithms", "Databases")
  icon: string;                    // Icon identifier or emoji
  
  // Metadata
  problemCount: number;            // Denormalized count of problems in this topic
  isActive: boolean;               // Whether topic is visible to students
  sortOrder: number;               // Display ordering
  
  // Prerequisites
  prerequisiteTopicIds: string[];   // Topic IDs that should be completed first
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Access Rules:**
- All authenticated users can read active topics
- Only admins can create/update/delete topics

**Query Patterns:**
- List active topics: `topics` where `isActive == true` ordered by `sortOrder`
- Topics by category: `topics` where `category == X` ordered by `sortOrder`
- **Index:** `(isActive ASC, sortOrder ASC)`

---

### 3.4 `problems/{problemId}`

Coding problems. Public metadata is readable by authenticated users; private test cases are in a subcollection.

```typescript
interface ProblemDocument {
  id: string;
  slug: string;                    // URL-safe unique slug for routing
  title: string;
  description: string;             // Markdown content
  
  // Classification
  topicId: string;                 // References topics/{topicId}
  topicName: string;               // Denormalized
  difficulty: SkillLevel;          // Problem difficulty level
  tags: string[];                  // Additional tags (e.g., "sorting", "recursion")
  
  // Constraints
  constraints: string;             // Markdown: time/space complexity, input ranges
  supportedLanguages: ProgrammingLanguage[];
  
  // Examples (public, shown to students)
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  
  // Execution limits (passed to Judge0)
  timeLimitSeconds: number;        // Per test case
  memoryLimitKB: number;           // Per test case
  
  // Metadata
  authorId: string;                // Admin who created it
  isPublished: boolean;            // Visible to students when true
  submissionCount: number;         // Denormalized total submissions
  acceptedCount: number;           // Denormalized accepted submissions
  
  // Starter code templates (optional, per language)
  starterCode: Record<ProgrammingLanguage, string>;
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Access Rules:**
- Authenticated users can read problems where `isPublished == true`
- Admins can read all problems, create, update, and manage publication status

**Query Patterns:**
- List published problems: `problems` where `isPublished == true` ordered by `difficulty`, `title`
- Filter by topic: `problems` where `topicId == X && isPublished == true`
- Get by slug: `problems` where `slug == X` (limit 1)
- **Indexes:**
  - `(isPublished ASC, difficulty ASC, title ASC)`
  - `(isPublished ASC, topicId ASC, difficulty ASC)`
  - `(slug ASC)` — unique, used for lookups

---

### 3.5 `problems/{problemId}/testCases/{testCaseId}`

Test cases for coding problems. Separated into a subcollection so Security Rules can control visibility.

```typescript
interface TestCaseDocument {
  id: string;
  problemId: string;               // Parent problem reference
  
  input: string;                   // Stdin input
  expectedOutput: string;          // Expected stdout output
  
  isPublic: boolean;               // If true, visible to students as an example
                                   // If false, only accessible by Cloud Functions
  
  sortOrder: number;               // Execution order
  description: string;             // Optional: "Edge case - empty array"
  
  // Timestamps
  createdAt: Timestamp;
}
```

**Access Rules:**
- Authenticated users can read test cases where `isPublic == true`
- **Private test cases (`isPublic == false`) are NEVER readable by clients**
- Cloud Functions access private test cases using Admin SDK (bypasses rules)
- Only admins can create/update/delete test cases

**Query Patterns:**
- Public test cases for a problem: `problems/{pid}/testCases` where `isPublic == true` ordered by `sortOrder`
- All test cases (Cloud Functions only): `problems/{pid}/testCases` ordered by `sortOrder`

> [!IMPORTANT]
> Private test cases are the core anti-cheating mechanism for CodeLab. Security Rules must deny client reads of documents where `isPublic == false`. Cloud Functions use the Admin SDK which bypasses Security Rules.

---

### 3.6 `users/{userId}/submissions/{submissionId}`

Code submissions stored under the submitting user.

```typescript
interface SubmissionDocument {
  id: string;
  userId: string;                  // Owning user (same as parent path)
  
  // Problem reference
  problemId: string;
  problemSlug: string;             // Denormalized for display
  problemTitle: string;            // Denormalized for display
  
  // Submission content
  language: ProgrammingLanguage;
  code: string;                    // Submitted source code
  
  // Result (written by Cloud Functions only)
  status: SubmissionStatus;
  verdict: SubmissionVerdict | null;
  
  // Execution details
  testResults: Array<{
    testCaseId: string;
    passed: boolean;
    actualOutput: string | null;   // Only for public test cases
    runtimeMs: number | null;
    memoryKB: number | null;
    error: string | null;          // Compilation/runtime error
  }> | null;
  
  // Aggregate stats
  passedCount: number;
  totalCount: number;
  totalRuntimeMs: number | null;
  totalMemoryKB: number | null;
  
  // Error info
  compileError: string | null;
  runtimeError: string | null;
  
  // Context
  source: "codelab" | "interview"; // Where this submission originated
  interviewSessionId: string | null; // If from an interview
  
  // Timestamps
  submittedAt: Timestamp;
  evaluatedAt: Timestamp | null;
}

type SubmissionStatus = 
  | "pending"        // Queued for execution
  | "running"        // Currently executing
  | "completed"      // Execution finished
  | "error";         // System error (not code error)

type SubmissionVerdict = 
  | "accepted"               // All test cases passed
  | "wrong_answer"           // Output mismatch
  | "time_limit_exceeded"    // Execution too slow
  | "memory_limit_exceeded"  // Too much memory
  | "runtime_error"          // Code crashed
  | "compilation_error";     // Code didn't compile
```

**Access Rules:**
- Owner can read their own submissions
- Owner can **create** a submission (with `status: "pending"`, Cloud Functions processes it)
- Owner **cannot** update submissions after creation — results written by Cloud Functions
- Admins can read any submission

**Query Patterns:**
- User's submissions: `users/{uid}/submissions` ordered by `submittedAt DESC` (paginated)
- User's submissions for a problem: `users/{uid}/submissions` where `problemId == X` ordered by `submittedAt DESC`
- **Index:** `(problemId ASC, submittedAt DESC)`

> [!NOTE]
> Submissions are stored under `users/{userId}/submissions` rather than a top-level collection. This aligns with Firestore Security Rules (owner access by path) and avoids queries that filter by userId on a top-level collection (which would require a composite index and careful rule design).

---

### 3.7 `interviewTemplates/{templateId}`

Admin-created templates that define interview structure.

```typescript
interface InterviewTemplateDocument {
  id: string;
  name: string;                    // e.g., "Frontend Developer - Intermediate"
  description: string;
  
  // Configuration
  targetRole: string;              // e.g., "Frontend Developer", "Data Analyst"
  difficulty: SkillLevel;
  topicIds: string[];              // Topics covered in this interview
  topicNames: string[];            // Denormalized
  
  // Structure
  questionCount: number;           // Target number of questions
  durationMinutes: number;         // Suggested duration
  includesCoding: boolean;         // Whether to include coding challenges
  
  // AI Prompt Configuration (admin-only, not exposed to clients)
  systemPrompt: string;            // System prompt for AI model
  questionGenerationPrompt: string;
  evaluationPrompt: string;
  
  // Metadata
  isPublished: boolean;
  createdBy: string;               // Admin UID
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Access Rules:**
- Authenticated users can read templates where `isPublished == true`
- **Clients cannot read:** `systemPrompt`, `questionGenerationPrompt`, `evaluationPrompt`
  - These fields are accessed only by Cloud Functions via Admin SDK
  - Security Rules deny reads of these fields (or these fields are stored in a separate admin-only subcollection)
- Only admins can create/update/delete templates

> [!WARNING]
> AI prompt templates contain instructions that shape interview behavior. Exposing them to clients would allow students to game the system. Store prompt fields in a separate `interviewTemplates/{templateId}/adminConfig/prompts` document that Security Rules deny to non-admin users, or use field-level security if supported.

**Prompt Field Isolation Strategy:**

Because Firestore Security Rules operate at the document level (not field level), the recommended approach is:

```
interviewTemplates/{templateId}        ← Public metadata (readable by authenticated users)
interviewTemplates/{templateId}/adminConfig/prompts  ← AI prompts (admin-only)
```

---

### 3.8 `interviewSessions/{sessionId}`

Active and completed interview sessions.

```typescript
interface InterviewSessionDocument {
  id: string;
  userId: string;                  // Student taking the interview
  
  // Template reference
  templateId: string;
  templateName: string;            // Denormalized
  
  // Configuration (snapshot from template + user overrides)
  targetRole: string;
  difficulty: SkillLevel;
  topicIds: string[];
  topicNames: string[];
  questionCount: number;
  durationMinutes: number;
  includesCoding: boolean;
  
  // State
  status: InterviewStatus;
  currentQuestionIndex: number;    // 0-based
  
  // Timing
  startedAt: Timestamp;
  endedAt: Timestamp | null;
  
  // Summary (populated on completion)
  overallScore: number | null;     // 0-100
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

type InterviewStatus = 
  | "in_progress"
  | "completed"
  | "abandoned"
  | "evaluating";   // AI is generating the report
```

**Access Rules:**
- Owner can read their own sessions
- Owner can create a session (via Cloud Function — not direct write)
- Owner **cannot** update sessions directly — state changes via Cloud Functions
- Admins can read any session

**Query Patterns:**
- User's sessions: `interviewSessions` where `userId == X` ordered by `createdAt DESC`
- User's active session: `interviewSessions` where `userId == X && status == "in_progress"`
- **Indexes:**
  - `(userId ASC, createdAt DESC)`
  - `(userId ASC, status ASC)`

> [!NOTE]
> Interview sessions are a top-level collection (not under `users/{userId}`) because Cloud Functions need efficient access by session ID during the interview flow. Security Rules use `resource.data.userId == request.auth.uid` for ownership checks.

---

### 3.9 `interviewSessions/{sessionId}/messages/{messageId}`

Conversation messages within an interview session.

```typescript
interface InterviewMessageDocument {
  id: string;
  sessionId: string;               // Parent session reference
  
  // Message content
  role: "system" | "interviewer" | "candidate";
  content: string;                 // Message text (Markdown)
  
  // Question metadata (for interviewer messages that are questions)
  questionType: "conceptual" | "coding" | "followup" | "behavioral" | null;
  questionIndex: number | null;    // Which question number (0-based)
  topicId: string | null;          // Topic this question relates to
  
  // Coding challenge (if questionType == "coding")
  codingChallenge: {
    problemDescription: string;
    expectedLanguages: ProgrammingLanguage[];
    starterCode: Record<ProgrammingLanguage, string>;
    testCases: Array<{             // Public test cases for the candidate
      input: string;
      output: string;
    }>;
  } | null;
  
  // Candidate's code submission (for candidate messages answering coding challenges)
  codeSubmission: {
    language: ProgrammingLanguage;
    code: string;
    submissionId: string | null;   // References the submission document if executed
  } | null;
  
  // Per-message AI evaluation (optional, populated during report generation)
  evaluation: {
    score: number;                 // 0-100
    feedback: string;
  } | null;
  
  // Ordering
  sequence: number;                // Monotonically increasing for ordering
  
  // Timestamps
  createdAt: Timestamp;
}
```

**Access Rules:**
- Owner of the parent session can read messages
- Messages are created by Cloud Functions (interviewer messages) or validated client writes (candidate messages)
- Evaluation field is written only by Cloud Functions

**Query Patterns:**
- Messages in a session: `interviewSessions/{sid}/messages` ordered by `sequence ASC`

---

### 3.10 `interviewSessions/{sessionId}/evaluationReport` (Single Document)

Structured evaluation report for a completed interview. Uses a fixed document ID `report` within the subcollection for direct access.

**Path:** `interviewSessions/{sessionId}/evaluationReport/report`

```typescript
interface EvaluationReportDocument {
  sessionId: string;
  userId: string;
  
  // Overall assessment
  overallScore: number;            // 0-100
  overallFeedback: string;         // Markdown summary
  
  // Per-question breakdown
  questionEvaluations: Array<{
    questionIndex: number;
    questionType: "conceptual" | "coding" | "followup" | "behavioral";
    questionSummary: string;       // Brief question text
    answerSummary: string;         // Brief answer text
    score: number;                 // 0-100
    feedback: string;              // Detailed feedback
    topicId: string | null;
  }>;
  
  // Aggregated analysis
  strengths: string[];             // Key strengths identified
  areasForImprovement: string[];   // Areas to improve
  topicScores: Record<string, number>;  // topicId → score
  
  // Recommendations
  recommendedLevel: SkillLevel;
  recommendedTopics: string[];     // Topic IDs for further practice
  recommendedProblems: string[];   // Problem IDs for practice
  
  // Metadata
  aiModelUsed: string;             // e.g., "gemini-2.0-flash"
  generatedAt: Timestamp;
  
  // Distinction flag
  isAIGenerated: boolean;          // Always true — marks this as AI-produced content
}
```

**Access Rules:**
- Owner of the parent session can read the report
- Only Cloud Functions can write the report
- Admins can read any report

> [!IMPORTANT]
> Evaluation reports are explicitly marked as AI-generated content (`isAIGenerated: true`). The platform does not claim these are objectively verified assessments. Coding execution results (pass/fail) are objective; interview evaluations are AI opinions. This distinction is displayed in the UI.

---

### 3.11 `learningPaths/{pathId}`

Curated learning paths combining CodeLab problems and InterviewAI sessions.

```typescript
interface LearningPathDocument {
  id: string;
  title: string;
  description: string;            // Markdown
  
  // Classification
  difficulty: SkillLevel;
  topicIds: string[];
  topicNames: string[];           // Denormalized
  targetRole: string | null;      // e.g., "Backend Developer"
  
  // Metadata
  itemCount: number;              // Denormalized count of items
  estimatedHours: number;
  isPublished: boolean;
  createdBy: string;              // Admin UID
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### 3.12 `learningPaths/{pathId}/items/{itemId}`

Ordered items within a learning path.

```typescript
interface LearningPathItemDocument {
  id: string;
  pathId: string;
  
  // Item reference
  type: "problem" | "interview_template" | "reading";
  referenceId: string;            // problemId or templateId
  referenceTitle: string;         // Denormalized title
  
  // Ordering
  sortOrder: number;
  section: string;                // Grouping label (e.g., "Week 1", "Fundamentals")
  
  // Optional context
  notes: string;                  // Why this item is in the path
}
```

**Access Rules:**
- Authenticated users can read items of published paths
- Only admins can create/update/delete

---

### 3.13 `platformConfig/{configId}`

Platform-wide configuration managed by admins.

```typescript
// Document: platformConfig/general
interface PlatformConfigGeneral {
  // Rate limits
  maxSubmissionsPerHour: number;       // Per user
  maxInterviewsPerDay: number;         // Per user
  maxActiveInterviews: number;         // Per user concurrent
  
  // Feature flags
  interviewModuleEnabled: boolean;
  codelabModuleEnabled: boolean;
  diagnosticAssessmentEnabled: boolean;
  
  // Supported languages
  supportedLanguages: ProgrammingLanguage[];
  
  // Timestamps
  updatedAt: Timestamp;
  updatedBy: string;                   // Admin UID
}

// Document: platformConfig/execution
interface PlatformConfigExecution {
  defaultTimeLimitSeconds: number;
  defaultMemoryLimitKB: number;
  maxOutputSizeBytes: number;
  
  updatedAt: Timestamp;
  updatedBy: string;
}
```

**Access Rules:**
- Feature flags and supported languages: readable by authenticated users
- Rate limits and execution config: readable only by admins and Cloud Functions
- Only admins can write

---

### 3.14 `adminAuditLog/{logId}`

Audit trail for administrative actions.

```typescript
interface AdminAuditLogDocument {
  id: string;
  adminUid: string;
  adminEmail: string;              // Denormalized
  
  action: string;                  // e.g., "problem.create", "user.ban", "template.update"
  targetCollection: string;        // e.g., "problems"
  targetDocumentId: string;
  
  details: Record<string, unknown>;  // Action-specific data
  
  timestamp: Timestamp;
}
```

**Access Rules:**
- Only admins can read
- Only Cloud Functions can write (admins don't write directly)

---

## 4. Security Rules Summary

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
  
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    function isAdmin() {
      return request.auth.token.role == "admin";
    }
    
    // Users
    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow create: if isOwner(userId);
      allow update: if isOwner(userId) 
        && !request.resource.data.diff(resource.data).affectedKeys()
            .hasAny(["role", "stats", "recommendedLevel", "uid", "email"]);
      
      // Skill Records (subcollection)
      match /skillRecords/{topicId} {
        allow read: if isOwner(userId) || isAdmin();
        allow write: if false; // Cloud Functions only (Admin SDK)
      }
      
      // Submissions (subcollection)
      match /submissions/{submissionId} {
        allow read: if isOwner(userId) || isAdmin();
        allow create: if isOwner(userId)
          && request.resource.data.status == "pending";
        allow update: if false; // Cloud Functions only
      }
    }
    
    // Topics
    match /topics/{topicId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // Problems
    match /problems/{problemId} {
      allow read: if isAuthenticated() && resource.data.isPublished == true;
      allow read: if isAdmin();
      allow write: if isAdmin();
      
      // Test Cases
      match /testCases/{testCaseId} {
        allow read: if isAuthenticated() && resource.data.isPublic == true;
        allow read: if isAdmin();
        allow write: if isAdmin();
      }
    }
    
    // Interview Templates (public metadata)
    match /interviewTemplates/{templateId} {
      allow read: if isAuthenticated() && resource.data.isPublished == true;
      allow read: if isAdmin();
      allow write: if isAdmin();
      
      // Admin-only prompt configuration
      match /adminConfig/{configId} {
        allow read: if isAdmin();
        allow write: if isAdmin();
      }
    }
    
    // Interview Sessions
    match /interviewSessions/{sessionId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow read: if isAdmin();
      allow write: if false; // Cloud Functions only
      
      match /messages/{messageId} {
        allow read: if isAuthenticated() 
          && get(/databases/$(database)/documents/interviewSessions/$(sessionId)).data.userId == request.auth.uid;
        allow read: if isAdmin();
        allow create: if isAuthenticated()
          && get(/databases/$(database)/documents/interviewSessions/$(sessionId)).data.userId == request.auth.uid
          && request.resource.data.role == "candidate";
        allow update: if false;
      }
      
      match /evaluationReport/{reportId} {
        allow read: if isAuthenticated()
          && get(/databases/$(database)/documents/interviewSessions/$(sessionId)).data.userId == request.auth.uid;
        allow read: if isAdmin();
        allow write: if false; // Cloud Functions only
      }
    }
    
    // Learning Paths
    match /learningPaths/{pathId} {
      allow read: if isAuthenticated() && resource.data.isPublished == true;
      allow read: if isAdmin();
      allow write: if isAdmin();
      
      match /items/{itemId} {
        allow read: if isAuthenticated();
        allow write: if isAdmin();
      }
    }
    
    // Platform Config
    match /platformConfig/{configId} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }
    
    // Admin Audit Log
    match /adminAuditLog/{logId} {
      allow read: if isAdmin();
      allow write: if false; // Cloud Functions only
    }
  }
}
```

> [!CAUTION]
> These rules are a **starting specification**. They must be tested against the Security Rules emulator and refined during implementation. Pay particular attention to:
> - The `get()` calls in interview session rules incur additional reads and have billing implications
> - Field-level validation (data types, string lengths, enum values) should be added
> - Rate limiting at the rules level is limited; primary rate limiting is in Cloud Functions

---

## 5. Required Composite Indexes

Define in `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "problems",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "isPublished", "order": "ASCENDING" },
        { "fieldPath": "difficulty", "order": "ASCENDING" },
        { "fieldPath": "title", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "problems",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "isPublished", "order": "ASCENDING" },
        { "fieldPath": "topicId", "order": "ASCENDING" },
        { "fieldPath": "difficulty", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "submissions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "problemId", "order": "ASCENDING" },
        { "fieldPath": "submittedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "interviewSessions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "interviewSessions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "topics",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "isActive", "order": "ASCENDING" },
        { "fieldPath": "sortOrder", "order": "ASCENDING" }
      ]
    }
  ]
}
```

---

## 6. Data Retention Guidelines

| Collection | Retention | Rationale |
|---|---|---|
| `users` | Indefinite (until account deletion) | Core identity |
| `skillRecords` | Indefinite | Progress tracking |
| `submissions` | 1 year for code content; metadata indefinite | Storage management; code can be large |
| `interviewSessions` | Indefinite | Historical record |
| `messages` | 1 year | Storage management |
| `evaluationReport` | Indefinite | Key deliverable for students |
| `adminAuditLog` | 2 years | Compliance |
| `platformConfig` | Indefinite | Configuration |

> [!NOTE]
> Retention policies are planning guidelines. Automated cleanup is deferred to Phase 3+. GDPR/data-deletion compliance requires a user data export and account deletion feature, which should be implemented in Phase 2 or 3.

---

## 7. Entity Relationship Summary

```
Firebase Auth (managed)
    │ 1:1
    ▼
users ─────────┬──1:N──► skillRecords (per topic mastery)
               │
               ├──1:N──► submissions ──N:1──► problems ──1:N──► testCases
               │                                  │
               │                                  N:1
               │                                  │
               │                               topics
               │
               ├──1:N──► interviewSessions ──N:1──► interviewTemplates
               │              │                          │
               │              ├──1:N──► messages         └──► adminConfig/prompts
               │              │
               │              └──1:1──► evaluationReport/report
               │
               └──(admins)──► adminAuditLog

learningPaths ──1:N──► items
platformConfig (standalone)
```

---

## 8. Firestore Trade-Offs and Limitations

| Concern | Impact | Mitigation |
|---|---|---|
| **No server-side joins** | Related data requires multiple reads or denormalization | Denormalize stable fields (names, titles); use Cloud Functions for complex aggregations |
| **1 MiB document size limit** | Code submissions and interview messages with large content could approach limits | Store one submission/message per document; limit code size at input validation |
| **No full-text search** | Cannot efficiently search problem descriptions or code content | Consider Algolia or Typesense integration if search becomes a requirement |
| **Billing on reads** | Each document read is billed; `get()` calls in Security Rules count as reads | Minimize rule-level `get()` calls; consider restructuring if interview message rules become expensive |
| **Eventual consistency in triggers** | Firestore triggers may have slight delays | Acceptable for stats updates; not suitable for real-time submission verdicts (use synchronous Cloud Functions) |
| **Limited aggregation** | No built-in GROUP BY or SUM | Use Cloud Functions to compute and denormalize aggregates (submission counts, average scores) |

> [!IMPORTANT]
> If full-text search across problems becomes a core requirement, Firestore alone is insufficient. Evaluate Algolia, Typesense, or a Cloud SQL sidecar during Phase 2. For Phase 1, keyword filtering by tags and topics is sufficient.

---

## 9. Phase 5 Schema Additions: Unified Skill Intelligence & Analytics

### 9.1 `student_analytics/{userId}` Collection

Stores precomputed skill mastery estimates, confidence states, adaptive recommendations, and path progression for a student:

```typescript
interface StudentUnifiedAnalytics {
  userId: string;
  calculatedAt: string;
  totalCodeLabAttempted: number;
  totalCodeLabAccepted: number;
  totalInterviewsCompleted: number;
  averageInterviewScore: number | null;
  skills: Record<string, SkillEvidenceSummary>;
  recommendations: AdaptiveRecommendation[];
  learningPaths: LearningPath[];
  recentActivity: ActivityFeedItem[];
}
```

- **Read Access**: Only `request.auth.uid == userId` or admin.
- **Write Access**: Restricted to Firebase Admin SDK / trusted backend jobs. Untrusted client writes are denied (`allow write: if false`).

### 9.2 `skills/{skillId}` Collection

Stores canonical definitions of the 17 platform skills across Fundamentals, Languages, Databases, and Interview Skills:

```typescript
interface SkillDefinition {
  id: string;
  name: string;
  category: 'programming_fundamentals' | 'programming_languages' | 'databases_and_sql' | 'interview_skills';
  description: string;
  prerequisites: string[];
  suggestedLevel: 'absolute_beginner' | 'beginner' | 'intermediate' | 'advanced' | 'expert';
  relatedCodeLabTopics: string[];
  relatedInterviewCategories: string[];
}
```

### 9.3 `recommendations/{recommendationId}` Collection

Persists explainable, deterministic next steps:

```typescript
interface AdaptiveRecommendation {
  id: string;
  userId: string;
  type: 'codelab_problem' | 'interview_session' | 'learning_path_milestone';
  targetSkillId: string;
  targetSkillName: string;
  title: string;
  difficulty: SkillLevel;
  reason: string;
  actionUrl: string;
  actionLabel: string;
  createdAt: string;
}
```

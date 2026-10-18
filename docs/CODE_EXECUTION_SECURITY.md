# Code Execution Security & Isolation Architecture

## 1. Threat Landscape & Critical Security Boundary

Executing untrusted user-submitted source code is one of the highest-risk operations in modern web applications. Potential threats include:

- **Host Environment Takeover:** Malicious code attempting to execute root-level commands (`rm -rf`, fork bombs, system privilege escalations).
- **Service Credential Exfiltration:** Reading environment variables, Cloud Secret Manager credentials, service account tokens, or Firestore database references.
- **Resource Denial of Service:** Infinite CPU loops, unbounded memory allocations, and network socket exhaustion.
- **Academic Cheating / Information Disclosure:** Probing test suites, printing hidden inputs, extracting reference solutions.

---

## 2. Inviolable Security Principles

1. **Zero Browser Execution:** Student code is NEVER executed inside the client browser context or WebAssembly sandbox where internal state or hidden tests could be inspected.
2. **Zero Cloud Functions Execution:** Student code is NEVER evaluated inside Google Cloud Functions or the primary application server process.
3. **Dedicated Sandboxed Runners:** Execution occurs exclusively inside isolated sandbox containers (such as Judge0 CE on isolated VMs or Docker containers).
4. **Network & Filesystem Isolation:** Sandboxes operate with restricted network access (no external internet egress from the runner) and read-only ephemeral root filesystems.
5. **No Credential Colocation:** The execution sandbox possesses zero GCP service account tokens or database credentials.

---

## 3. Execution Pipeline & Data Flow

```
[Student in Browser]
       │
       │ 1. Submits { problemId, language, code, operation: 'run' | 'submit' }
       ▼
[Cloud Functions API Gateway]
       │
       ├── 2. Verify Firebase Auth JWT & App Check attestation
       ├── 3. Enforce rate limit (max 30 submissions/hour per UID)
       ├── 4. Validate payload size (strictly capped at 64 KB)
       ├── 5. Query Firestore via Admin SDK for authorized test cases
       │
       │ 6. Dispatch execution request via HTTPS with base64 payload
       ▼
[Judge0 Isolated Sandbox Environment]
       │
       ├── 7. Mount ephemeral cgroup sandbox with resource caps:
       │      ├── CPU Time Limit: 5.0 seconds
       │      ├── Wall Time Limit: 10.0 seconds
       │      ├── Memory Limit: 256 MB
       │      └── Max Output Limit: 128 KB
       ├── 8. Compile and run user code inside container
       ├── 9. Capture stdout, stderr, execution time, and memory
       │
       │ 10. Return raw execution status
       ▼
[Cloud Functions Execution Broker]
       │
       ├── 11. Compare actual output against expected output
       ├── 12. Normalize verdict (Accepted, Wrong Answer, TLE, etc.)
       ├── 13. REDACT all private test case inputs and expected outputs
       ├── 14. Persist official submission record in Firestore
       ├── 15. Update user problem stats and topic mastery
       │
       │ 16. Return sanitized result object
       ▼
[Student in Browser]
Displays verdict badge, runtime (ms), memory (MB), and public test comparisons.
```

---

## 4. Anti-Cheating & Private Test Shielding

To guarantee competition integrity and prevent students from reverse-engineering hidden test suites:

- **Storage Separation:** Private test cases reside in the Firestore subcollection `problems/{problemId}/testCases/{testCaseId}` with field `isPublic: false`.
- **Firestore Security Rules:** Direct client reads are explicitly denied:
  ```javascript
  match /testCases/{testCaseId} {
    allow read: if isAuthenticated() && (resource.data.isPublic == true || isAdmin());
    allow write: if isAdmin();
  }
  ```
- **Response Redaction:** The backend execution broker iterates through all test cases, evaluates them against the sandbox, and strictly scrubs private fields before responding:
  ```typescript
  testCaseResults.push({
    testCaseId: tc.id,
    passed: isPassed,
    isPublic: tc.isPublic,
    input: tc.isPublic ? tc.input : undefined,
    expectedOutput: tc.isPublic ? tc.expectedOutput : undefined,
    actualOutput: tc.isPublic ? res.stdout : undefined,
    runtimeMs: timeMs,
    memoryKB: res.memoryKB,
    status: res.status,
  });
  ```

---

## 5. Development & Fallback Modes

When upstream Judge0 API credentials (`JUDGE0_API_KEY`) are not configured:
- The system activates the **Development Sandbox Adapter** (`MockExecutionAdapter`).
- Every response includes `isMockExecution: true`.
- The user interface prominently displays:
  > *"Development Sandbox Notice: Local simulation mode active. Upstream Judge0 isolated sandbox credentials can be configured in Cloud Secret Manager."*
- **No fabricated metrics:** Execution times and memory consumption are clearly flagged as simulated to avoid misrepresentation.

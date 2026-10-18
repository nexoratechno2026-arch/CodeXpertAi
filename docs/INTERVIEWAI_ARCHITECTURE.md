# Nexora InterviewAI — Architecture & Technical Specification

## 1. Executive Summary

Nexora InterviewAI is an integrated module within the unified Nexora Techno engineering platform (`Nexora CodeLab` + `Nexora InterviewAI`). It provides structured, AI-assisted mock interview practice across five core categories:
1. **Technical & CS Core** (OS, networking, distributed systems, memory management)
2. **Programming & Algorithms** (Data structures, state transitions, computational complexity)
3. **SQL & Database Architecture** (Indexing, query cost, transactions, sharding)
4. **HR & Cultural Leadership** (Collaboration, scope negotiation, mentorship, ownership)
5. **Behavioral & Scenario-Based** (STAR methodology, incident post-mortems, conflict resolution)

The system adheres strictly to the single-project, three-tier security architecture established in Phases 1, 2, and 3:
- **Zero Frontend AI Secrets**: No model API keys or raw prompts ever reach client browsers.
- **Trusted Cloud Execution**: Question generation, session initialization, and rubric evaluation are orchestrated via Cloud Functions for Firebase (`generateInterviewQuestions`, `evaluateInterviewSession`).
- **Resilient Fallback Mode**: When commercial AI provider keys (`GOOGLE_GENAI_API_KEY`) are not provisioned in the environment, the system executes in a deterministic, fully simulated rubric evaluation mode with transparent UI badges and zero hallucinated claims.
- **Direct CodeLab Feedback Loop**: Final evaluation reports connect candidate gaps to real coding problems in Nexora CodeLab.

---

## 2. Component Topology & Data Flow

```mermaid
graph TD
    Client[Web Client: React 18 + Vite] -->|HTTPS / WSS| CDN[Edge & Hosting]
    Client -->|Protected Auth Tokens| Auth[Firebase Authentication]
    Client -->|Direct Read / Batch Write| Firestore[(Cloud Firestore)]
    Client -->|Authenticated onCall| CF[Cloud Functions Broker]

    subgraph "Server-Side AI Broker (Layer 2)"
        CF --> Quota[Rate Limit & Daily Quota Manager]
        Quota --> ProviderRouting{API Key Configured?}
        ProviderRouting -->|Yes| Gemini[Gemini Live AI Adapter]
        ProviderRouting -->|No / Timeout / Error| MockAI[Deterministic Rubric Adapter]
    end

    subgraph "Database & Storage (Layer 3)"
        Firestore --> Coll1[interviewSessions]
        Firestore --> Coll2[interviewSessions/{id}/evaluationReport]
        Firestore --> Coll3[users/{uid}/usageLimits]
    end
```

---

## 3. Session Lifecycle State Machine

An interview session progresses through seven explicit, immutable states:

| State | Initiator | Description | Allowed Operations |
|---|---|---|---|
| `configured` | Client / Broker | Configuration validated (role, category, difficulty, duration). | Parameter review. |
| `generating` | Cloud Functions | AI provider generating tailored, structured questions. | Display loading spinner. |
| `in_progress` | Candidate | Active interview session. Questions revealed sequentially. | Save draft, submit answer. |
| `evaluating` | Cloud Functions | Candidate submitted all answers; multi-dimensional rubric evaluation running. | Display progress indicator. |
| `completed` | Cloud Functions | Scorecard, rubric marks, strengths, and CodeLab learning steps finalized. | Read-only report view. |
| `failed` | System | Catastrophic model failure or network disconnect. Answers preserved in local buffer. | Retry evaluation / recover draft. |
| `abandoned` | Candidate | Candidate explicitly exits session before completing all questions. | Partial review, history log. |

---

## 4. Anti-Cheating & Integrity Protections

1. **Client Score Prohibition**: Firestore Security Rules strictly prohibit clients from writing or updating the `report` field or `evaluationReport` subcollection.
2. **Hidden Rubric Criteria**: Granular evaluation rubrics and weighting formulas are processed server-side to prevent prompt extraction attacks.
3. **Sequential Progression**: Questions are answered in sequence; past answers cannot be modified once evaluated without creating a distinct session attempt.
4. **Draft Resilience**: In-progress textarea answers are continuously buffered in encrypted local storage (`localStorage`) to prevent data loss upon accidental browser reload or transient network dropouts.

# PHASE 12 — COMPREHENSIVE AUTOMATED & MANUAL TEST PLAN

**Product:** CodeXpertai (Nexora CodeLab + Nexora InterviewAI)  
**Scope:** Voice Chatbot Repetition Fix, Multi-turn Context Engine, Live AI Interviewer (`/interview/live`), Media Lifecycle, Avatar Provider  
**Status:** DRAFTED FOR EXECUTION

---

## 1. Test Suite Architecture

The test plan spans unit tests, integration tests, and live end-to-end browser verification:

```
src/test/
├── phase12VoiceChatbot.test.ts      # Unit & integration tests for multi-turn chatbot & repetition fix
├── phase12LiveInterview.test.ts     # Media pre-flight, FSM transitions, follow-up generation & avatar adapter
└── (existing 14 test suites)        # Maintained at 100% pass rate
```

---

## 2. Test Cases Specification

### Suite A: Voice Chatbot Repair & Context Engine (`phase12VoiceChatbot.test.ts`)

| Test ID | Test Title | Expected Behavior |
| :--- | :--- | :--- |
| `TC-VC-01` | **Dynamic Response Generation** | Questions with distinct inputs produce distinct, contextually targeted responses. |
| `TC-VC-02` | **Repetitive Template Elimination** | Sequential follow-up questions (e.g. *"Can you explain more?"*, *"How does it work?"*) generate contextual answers based on history, not the static fallback string. |
| `TC-VC-03` | **Multi-Turn Pronoun Resolution** | When discussing dynamic programming, a follow-up *"Can you give a Python example?"* references DP in Python rather than defaulting. |
| `TC-VC-04` | **Single Spoken Vocalization** | Generated assistant messages are flagged as spoken once; speech synthesis is not triggered repeatedly without explicit replay. |
| `TC-VC-05` | **Explicit Audio Replay** | Replay button allows the user to deliberately re-listen to an assistant message on demand. |
| `TC-VC-06` | **Duplicate Submission Guard** | Simultaneous calls to message dispatch while in `processing` state are safely de-duplicated. |
| `TC-VC-07` | **Audio Interruption** | Calling `stopSpeechSynthesis()` immediately clears ongoing utterance playback. |
| `TC-VC-08` | **Academic Integrity Guardrail** | Explicit queries asking for private test cases or reference solutions are politely refused with pedagogical pivots. |
| `TC-VC-09` | **Graceful Degradation** | Missing Web Speech API gracefully falls back to text-only mode with clear user notices. |

---

### Suite B: Live AI Interview Room & Media Lifecycle (`phase12LiveInterview.test.ts`)

| Test ID | Test Title | Expected Behavior |
| :--- | :--- | :--- |
| `TC-LI-01` | **Pre-flight Device Gating** | Session cannot start until camera and microphone both pass readiness verification. |
| `TC-LI-02` | **Permission Denial Handling** | `NotAllowedError` displays actionable browser permission instructions and retry button without false active states. |
| `TC-LI-03` | **Missing Hardware Handling** | `NotFoundError` surfaces clear hardware missing notification. |
| `TC-LI-04` | **Avatar Provider Adapter** | Instantiates native real-time female canvas avatar; correctly reports cloud avatar status when credentials are missing. |
| `TC-LI-05` | **Initial Question Delivery** | Interview session vocalizes first question matching category, difficulty, and persona. |
| `TC-LI-06` | **Adaptive Follow-Up Generation** | Student answer triggers contextual follow-up question referencing specific answer elements. |
| `TC-LI-07` | **Turn-Taking State Invariants** | Finite State Machine transitions cleanly (`idle` -> `interviewer_speaking` -> `listening_to_student` -> `processing_answer` -> `generating_follow_up`). |
| `TC-LI-08` | **Media Release on Exit** | Ending or exiting interview immediately stops all `MediaStreamTrack` hardware instances. |
| `TC-LI-09` | **Evidence-Based Evaluation Report** | Final scorecard accurately reflects real transcript questions and answers without fabricated metrics. |
| `TC-LI-10` | **Authentication & Route Guard** | Unauthenticated users navigating to `/interview/live` are redirected to `/login`. |

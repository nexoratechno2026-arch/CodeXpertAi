# PHASE 12 — AI INTERVIEW & VOICE CHATBOT AUDIT REPORT

**Date:** 18 October 2026  
**Auditor:** Senior Full-Stack & Conversational AI Systems Architect  
**Workspace:** `e:\Codebase Nexoratechno`  
**Application:** CodeXpertai (Nexora CodeLab + Nexora InterviewAI)  
**Status:** AUDIT COMPLETE

---

## 1. Executive Summary

A comprehensive architectural and code-level audit was conducted across the existing conversational AI, speech synthesis, speech recognition, and mock interview session workflows.

The audit verified two critical findings:
1. **Voice Chatbot Repetition Defect:** The chatbot was previously observed repeating identical spoken answers across sequential turns. Inspection of [`src/services/voiceChatService.ts`](file:///e:/Codebase%20Nexoratechno/src/services/voiceChatService.ts) and [`src/components/voice/VoiceChatbotModal.tsx`](file:///e:/Codebase%20Nexoratechno/src/components/voice/VoiceChatbotModal.tsx) uncovered that `generateChatbotResponse` operated statelessly without conversation history, relying on a small set of static keyword branches and falling back to an identical template string for all follow-up queries. Additionally, speech synthesis lacked utterance de-duplication and interrupt guarantees.
2. **Interview Experience Missing Live Video Stream:** While [`src/features/interview/InterviewSessionPage.tsx`](file:///e:/Codebase%20Nexoratechno/src/features/interview/InterviewSessionPage.tsx) supported text and dictation input alongside persona metadata (e.g. Elena Vance, Dr. Sophia Chen), it lacked a real-time one-on-one live video room layout, camera and microphone pre-flight permission gating, an interactive female visual avatar adapter, live transcript synchronization, and conversational turn-taking with follow-up questioning.

---

## 2. Existing Components Audit

| Component / File | Current Role | Audit Assessment | Needed Enhancements |
| :--- | :--- | :--- | :--- |
| [`voiceChatService.ts`](file:///e:/Codebase%20Nexoratechno/src/services/voiceChatService.ts) | Speech synthesis, speech recognition check, AI guidance response generation. | **Defective:** Single-string input, zero memory of previous turns, static keyword matches, repetitive fallback. | Add multi-turn context memory, conversational entity extraction, dynamic answer generator, pronoun resolution, and robust speech synthesis queue management. |
| [`VoiceChatbotModal.tsx`](file:///e:/Codebase%20Nexoratechno/src/components/voice/VoiceChatbotModal.tsx) | Voice chatbot overlay modal with microphone and text inputs. | **Partial:** Lacks request de-duplication; can trigger double submissions if recognition `onend` races with user clicks. | Add submission lock, speech replay tracking, interruption handlers, and conversation history forwarding. |
| [`InterviewSessionPage.tsx`](file:///e:/Codebase%20Nexoratechno/src/features/interview/InterviewSessionPage.tsx) | Current question-by-question interview screen. | **Text/Dictation Only:** Good draft autosaving, but uses static initials badge for avatar and lacks camera video. | Preserve for text-based mode; build dedicated `/interview/live` for live one-on-one video experience. |
| [`InterviewSetupPage.tsx`](file:///e:/Codebase%20Nexoratechno/src/features/interview/InterviewSetupPage.tsx) | Interview setup and configuration wizard. | **Complete:** Configures category, difficulty, duration, question count, and interviewer persona. | Add direct entry point for **Start Live Video Interview** with pre-flight media checks. |
| [`interviewService.ts`](file:///e:/Codebase%20Nexoratechno/src/services/interviewService.ts) | Session management, question retrieval, draft persistence, scoring rubrics. | **Robust:** 900+ curated question bank, Firestore + local persistence. | Add support for live dynamic follow-up question generation and conversational transcript tracking. |
| [`router.tsx`](file:///e:/Codebase%20Nexoratechno/src/app/router.tsx) | Application routing table. | **Missing Route:** No dedicated live interview route (`/interview/live`). | Register `/interview/live` with protected access. |

---

## 3. Root Cause Analysis: Repeated Voice Chatbot Answers

The reported issue of the voice chatbot repeating the same spoken answer again and again was traced to four interconnected factors:

### Root Cause 1: Stateless Single-Turn Query Signature
In `src/services/voiceChatService.ts`:
```typescript
// Legacy defective signature:
export async function generateChatbotResponse(query: string): Promise<string>
```
The generator only received the raw string of the current user message. It received zero context regarding previous messages, the user's active topic, or what the assistant had just said.

### Root Cause 2: Repetitive Static Fallback Template
The legacy engine checked for exact keyword strings (`kadane`, `two pointer`, `sliding window`, `dp`, `binary search`, `star method`). If a student asked follow-up questions such as:
- *"Can you explain that in more detail?"*
- *"How would you write that in Python?"*
- *"What is the time complexity?"*
- *"What about edge cases?"*

None of those queries matched the static keywords. As a result, the function entered the default fallback:
```typescript
return (
  `Regarding "${query}": A structured way to tackle this is to break the problem into input constraints, optimal data structures, and edge cases. ` +
  "Would you like to analyze time complexity, walk through a pattern example, or practice a related question in CodeXpertai CodeLab?"
);
```
Across turns 2, 3, 4, and 5, the student heard the identical sentences repeated verbatim.

### Root Cause 3: Speech Synthesis Queue & Race Conditions
In Chromium/WebKit on desktop and mobile:
- `window.speechSynthesis.cancel()` is asynchronous. Calling `speak()` immediately after `cancel()` without resetting internal state or waiting for engine clearance causes speech synthesis to freeze or repeat queued audio buffers.
- Missing message-level playback tracking meant that re-renders or recognition `onend` events could trigger `speakText()` on the same message twice.

### Root Cause 4: Duplicate Submission Events
When speech recognition concluded, `recognition.onend` triggered `handleSendMessage(finalTranscript, true)`. If the user simultaneously tapped the send button or pressed Enter, two parallel calls to `generateChatbotResponse` were initiated with the same text, causing back-to-back duplicate assistant messages and overlapping speech synthesis.

---

## 4. Live One-on-One Video AI Interviewer Requirements

To transition from a static text questionnaire to a live, human-like video interview:
1. **Pre-flight Device Permission & Health Check:**
   - Require camera and microphone access before entering the interview room.
   - Display real-time video preview and microphone volume meter.
   - Transparently surface permission denials, device disconnection, or hardware absence.
2. **Female Human-Like AI Interviewer Presentation:**
   - Persona: Elena Vance (Lead Systems Architect) and Dr. Sophia Chen (Principal AI Researcher).
   - Real-time animated canvas/WebRTC video feed featuring natural blinking, lip-sync animation synchronized with vocal output, and responsive listening cues.
   - Clean provider abstraction (`AvatarProviderAdapter`) supporting browser-native animated visual rendering as well as cloud streaming APIs (HeyGen, Simli, D-ID).
3. **Turn-Taking Conversational Loop:**
   - State machine: `idle` -> `checking_permissions` -> `connecting` -> `interviewer_speaking` -> `listening_to_student` -> `processing_answer` -> `generating_follow_up` -> `completed`.
   - Adaptive follow-up questions generated dynamically based on the student's actual response.
   - Live real-time transcript displaying questions and student answers.
4. **Media Resource Lifecycle:**
   - Explicit "End Interview" control that cleanly stops all media stream tracks (`track.stop()`), cancels speech synthesis, and aborts speech recognition.
   - Generation of comprehensive, tamper-evident evaluation report based on the actual recorded conversation transcript.

---

## 5. Integration & Environment Status

- **Firebase Authentication & Firestore:** Configured and active.
- **Web Speech Synthesis & Recognition:** Browser-native, verified functional across modern Chromium/Firefox/Safari.
- **External Video Avatar Cloud Providers:** No third-party API keys (HeyGen, Simli, Tavus) are configured in `.env`.
- **Architectural Decision:** Implement an extensible `AvatarProvider` architecture with a high-fidelity, real-time Canvas/Audio-synchronized female interviewer avatar as the primary zero-cost local provider, alongside modular cloud adapter stubs ready for API key injection.

# Nexora InterviewAI — Interviewer Voice Quality & Audio Pipeline Report

## 1. Executive Summary

A natural conversational interviewer must sound human, speak with appropriate pacing, pronounce engineering acronyms accurately, and avoid robotic, monotone cadences or double-playback glitches.

This document details the voice architecture overhaul in [`src/services/voiceChatService.ts`](file:///E:/Codebase%20Nexoratechno/src/services/voiceChatService.ts), covering:
1. Priority-ranked selection of neural and natural English female voices across operating systems.
2. Technical phonetic substitution engine (`prepareTechnicalSpeechText`) for software engineering terminology.
3. Conversational prosody tuning, pause insertion, and punctuation spacing.
4. Duplicate playback suppression and utterance lifecycle management.
5. Cloud speech provider evaluation and credential gating.

---

## 2. Voice Selection Architecture

### Chromium Asynchronous Voice Ingestion
In Chromium browsers, `window.speechSynthesis.getVoices()` executes asynchronously and initially returns an empty array `[]`. If voices are requested before the event fires, the browser silently falls back to the default robotic system voice.

**Resolution:**
The service registers an event listener:
```ts
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  cachedVoices = window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
}
```

### Curated Female Voice Hierarchy
When synthesizing speech, `getBestEnglishVoice()` scans available voices using a priority hierarchy tailored to natural female voices:

| Rank | Voice Signature | Platform / Vendor | Tone Characteristics |
| :--- | :--- | :--- | :--- |
| **1** | Microsoft Jenny / Aria / Natasha Online (Natural) | Windows 11 / Edge | Human-like neural prosody, warm, professional interviewer cadence. |
| **2** | Google US English Female (en-US-Neural2) | Chrome OS / Chrome Desktop | High-fidelity conversational pacing with minimal artifacting. |
| **3** | Samantha / Victoria / Karen | macOS / iOS Safari | Warm, articulate, balanced resonance. |
| **4** | Microsoft Zira Desktop | Windows 10 | Articulate standard corporate technical cadence. |
| **5** | Generic `en-*` Female Voice | Cross-Platform Fallback | Filtered by `voice.name.includes('female')`. |

---

## 3. Technical Engineering Pronunciation Engine

Standard speech synthesis engines mangle programming terms (e.g. pronouncing "SQL" as "squeal" or "sqll", "RESTful" as "rest-full", "JSON" as individual letters, and "O(N log N)" as "zero n log n").

The `prepareTechnicalSpeechText()` function cleans and phonetically transforms software engineering jargon prior to speech synthesis:

```ts
export function prepareTechnicalSpeechText(text: string): string {
  let cleaned = text;

  // Technical Acronyms
  cleaned = cleaned.replace(/\bSQL\b/gi, 'S-Q-L');
  cleaned = cleaned.replace(/\bNoSQL\b/gi, 'No S-Q-L');
  cleaned = cleaned.replace(/\bPostgreSQL\b/gi, 'Postgres Q-L');
  cleaned = cleaned.replace(/\bGraphQL\b/gi, 'Graph Q-L');
  cleaned = cleaned.replace(/\bAPIs?\b/g, (m) => m.endsWith('s') ? 'A-P-Eyes' : 'A-P-I');
  cleaned = cleaned.replace(/\bRESTful\b/gi, 'Restful');
  cleaned = cleaned.replace(/\bJSON\b/gi, 'Jason');
  cleaned = cleaned.replace(/\bCI\/CD\b/gi, 'C-I C-D');
  cleaned = cleaned.replace(/\bCSS\b/gi, 'C-S-S');
  cleaned = cleaned.replace(/\bHTML\b/gi, 'H-T-M-L');
  cleaned = cleaned.replace(/\bDOM\b/gi, 'D-O-M');

  // Complexity Notations
  cleaned = cleaned.replace(/\bO\(1\)/g, 'O of 1');
  cleaned = cleaned.replace(/\bO\(log\s*n\)/gi, 'O of log N');
  cleaned = cleaned.replace(/\bO\(n\)/gi, 'O of N');
  cleaned = cleaned.replace(/\bO\(n\s*\*\s*log\s*n\)/gi, 'O of N log N');
  cleaned = cleaned.replace(/\bO\(n\s*log\s*n\)/gi, 'O of N log N');
  cleaned = cleaned.replace(/\bO\(n\^2\)/gi, 'O of N squared');
  cleaned = cleaned.replace(/\bBig-O\b/gi, 'Big Oh');

  // Conversational Pacing & Micro-Pauses
  cleaned = cleaned.replace(/\.\s+/g, '. ... ');
  cleaned = cleaned.replace(/\?\s+/g, '? ... ');

  return cleaned;
}
```

---

## 4. Prosody & Cadence Parameters

To deliver a conversational rather than robotic interview pace:
- **Speech Rate**: `0.94` (slightly deliberate to ensure candidates clearly absorb technical questions under interview pressure).
- **Pitch**: `1.02` (clear, warm, engaging register).
- **Volume**: `1.0` (normalized to master output).
- **Sentence Spacing**: Triple-dot micro-pauses (`. ... `) prevent sentences from rushing into one another.

---

## 5. Duplicate Playback & Overlap Prevention

```ts
// Cancel previous pending speech before initiating new utterance
window.speechSynthesis.cancel();
activeUtterance = utterance;
```
1. Active utterances are uniquely reference-tracked.
2. If the student presses "Repeat Question" or a new follow-up is generated while audio is playing, `speechSynthesis.cancel()` terminates previous audio immediately.
3. Microphone listening is temporarily muted or ignored during active interviewer speech, preventing candidate audio feedback loops.

---

## 6. Cloud Speech Providers (Production Cloud Architecture)

| Provider | Model | Latency | Cost | Status in Nexora |
| :--- | :--- | :--- | :--- | :--- |
| **Browser Native Web Speech API** | OS Neural / Natural | 0ms | $0.00 / free | **ACTIVE & VERIFIED** |
| **ElevenLabs Conversational TTS** | `eleven_turbo_v2` ("Rachel" / "Charlotte") | ~250ms | $0.24 / 1000 characters | **BLOCKED_ON_CREDENTIALS** (Awaiting paid API key) |
| **OpenAI Realtime Audio** | `gpt-4o-realtime-preview` ("alloy" / "shimmer") | ~300ms | $0.06 / min input, $0.24 / min output | **BLOCKED_ON_CREDENTIALS** (Awaiting paid API key) |
| **Cartesia Sonic** | Sonic English Female | ~130ms | $0.08 / 1000 characters | **BLOCKED_ON_CREDENTIALS** |

*Policy Enforcement*: As mandated, no paid external cloud accounts were activated without explicit user authorization. The browser neural engine provides high-quality speech today at zero cost.

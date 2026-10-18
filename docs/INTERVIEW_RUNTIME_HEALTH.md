# Nexora InterviewAI — Interview Runtime Health & Resilience

## 1. Overview & Purpose

Hardware failures, accidental cable disconnects, network drops, and browser background throttling can occur during a 20-minute live technical interview. The application must not silently freeze, crash, or discard candidate progress.

This document describes the active runtime health monitoring subsystem in [`src/features/interview/LiveInterviewPage.tsx`](file:///E:/Codebase%20Nexoratechno/src/features/interview/LiveInterviewPage.tsx).

---

## 2. Monitored Vectors

During an active session, the interview engine actively monitors:
1. **Camera Track State**: Tracks `videoTrack.onended` and `videoTrack.readyState === 'ended'`.
2. **Microphone Track State**: Tracks `audioTrack.onended` and `audioTrack.readyState === 'ended'`.
3. **Network Connectivity**: Listens to `window.addEventListener('offline')` and `window.addEventListener('online')`.
4. **Speech Synthesis Heartbeat**: Detects audio output stalls or silent cancellation.
5. **Session Inactivity / Excessive Silence**: Monitors answer duration to prompt the candidate gently if silence persists beyond 45 seconds.

---

## 3. Safe Pause & Interruption Protocol

If any critical vector fails while the interview is in progress:
```
[Hardware or Network Failure Detected]
                    ↓
[1. Immediately Pause Interview State Machine]
                    ↓
[2. Silence AI Interviewer Speech Synthesis]
                    ↓
[3. Mount Safe Paused Modal (`.pausedModalBackdrop`)]
                    ↓
[4. Display Concrete Cause to Candidate]
  ("Camera stream disconnected", "Network offline", etc.)
                    ↓
[5. Candidate Reconnects Device / Network]
                    ↓
[6. Candidate Clicks "Resume Interview"]
                    ↓
[7. Verify Stream Health → Resume Previous Question]
```

### Safety Guarantees:
- **No Lost Answers**: Completed questions, transcripts, and scores are safely retained in memory and local storage.
- **No Spoken Overlaps**: Speech synthesis is cancelled instantly upon interruption.
- **Fair Time Preservation**: The interview question countdown timer is frozen while the session is paused.

---

## 4. Candidate Gaze & Performance Ethics

In compliance with Nexora AI Ethics standards:
- **No Unsupported Biometrics**: The platform does **not** claim to measure candidate honesty, stress, deception, or attention span from camera video.
- **No Hidden Recording**: Video preview frames are strictly rendered locally to `<canvas>` and `<video>` elements without streaming candidate face data to third-party ad networks or AI scrapers.
- **Clear Status Disclosures**: All AI avatar states (`Listening`, `Speaking`, `Thinking`) are visually reflected in the HUD.

# Nexora InterviewAI — Strict Pre-Interview Readiness Validation

## 1. Executive Summary

To deliver a reliable, enterprise-grade video interview experience, candidates must never be allowed to start an interview while experiencing broken hardware, missing permissions, black preview frames, or disconnected AI personas.

The **Strict Readiness Validation Engine** ([`src/services/interviewReadinessService.ts`](file:///E:/Codebase%20Nexoratechno/src/services/interviewReadinessService.ts)) implements a multi-domain verification gate that evaluates every technical prerequisite and displays a live, transparent checklist to the student before the "Start Full-Screen Interview" action is enabled.

---

## 2. Five Verification Domains

```
┌────────────────────────────────────────────────────────┐
│               Readiness Verification Gate              │
├──────────────────┬──────────────────┬──────────────────┤
│ 1. Environment   │ 2. Camera Stream │ 3. Microphone    │
│    - HTTPS / Host│    - Track Live  │    - Track Live  │
│    - WebRTC API  │    - 1280x720 Dim│    - RMS Volume  │
│    - Web Audio   │    - No Freeze   │    - No Auto-Rec │
├──────────────────┴──────────────────┴──────────────────┤
│ 4. AI Voice & Avatar Persona                           │
│    - Verified Female Interviewer (Elena / Sophia)      │
│    - Speech Synthesis Engine Initialized               │
├────────────────────────────────────────────────────────┤
│ 5. Session & Candidate Privacy                         │
│    - Authenticated Candidate Token                     │
│    - Privacy Policy & AI Disclosure Accepted           │
└────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Check Specifications

### Domain 1: Browser & Environment
- **`env_secure_context`** (Critical): Evaluates `window.isSecureContext`. WebRTC camera capture will fail on insecure HTTP origins.
- **`env_media_support`** (Critical): Evaluates `navigator.mediaDevices && navigator.mediaDevices.getUserMedia`.
- **`env_audio_dsp`** (Advisory): Verifies `AudioContext` availability for real-time RMS microphone metering.
- **`env_speech_synth`** (Advisory): Verifies `window.speechSynthesis` for vocal question playback.

### Domain 2: Camera Hardware & Frame Rendering
- **`cam_track_live`** (Critical): Inspects `stream.getVideoTracks()[0].readyState === 'live'` and `track.enabled === true`.
- **`cam_frame_rendering`** (Critical): Inspects candidate's preview `<video>` element for `videoWidth > 0` and `videoHeight > 0`. If dimensions remain 0x0, the camera is categorized as frozen or blocked by hardware shutters.

### Domain 3: Microphone Hardware & Audio Activity
- **`mic_track_live`** (Critical): Inspects `stream.getAudioTracks()[0].readyState === 'live'` and `track.enabled === true`.
- **`mic_activity_detection`** (Critical): Measures live RMS decibel level from candidate microphone. Displays volume meter bar (0–100%). Confirms the candidate is not muted without recording long-term audio.

### Domain 4: Female AI Persona & Vocal Pipeline
- **`ai_persona_configured`** (Critical): Validates persona identity (Elena Vance or Dr. Sophia Chen), confirming female avatar profile, expertise domain, and rendering textures.
- **`ai_voice_synthesis`** (Advisory): Validates natural female TTS voice binding and software engineering phonetic mapping.

### Domain 5: Session Integrity & Privacy
- **`session_auth`** (Critical): Validates candidate account ID to prevent unauthenticated session sprawl or score hijacking.
- **`session_privacy`** (Critical): Requires candidate to explicitly tick the Privacy and AI Interviewer disclosure checkbox.

---

## 4. Gating Logic

A candidate is **strictly blocked** from entering full-screen live interview mode until all critical checks evaluate to `PASS`:

$$\text{canStartFullScreen} = \forall c \in \text{checks} \quad (c.\text{isCritical} \implies c.\text{status} == \text{'PASS'})$$

| Status | Badge | Button Action | Description |
| :--- | :--- | :--- | :--- |
| **`PASS`** | Green | Unlocks button when all critical checks pass | Verified functioning hardware / state. |
| **`FAIL`** | Red | Disables start button; displays remedy | Hardware failed, permission denied, or camera track ended. |
| **`BLOCKED`** | Amber | Disables start button; prompts candidate | Action required (e.g., check privacy checkbox, accept permission). |

---

## 5. Remediation Flows

If camera permission is denied:
- The UI displays explicit instructions: *"Camera permission is currently blocked. Click the lock/tune icon in your browser URL bar, enable Camera and Microphone, and click Verify Camera & Mic again."*
- Auto-polling prevents candidates from remaining stranded after resetting permissions.

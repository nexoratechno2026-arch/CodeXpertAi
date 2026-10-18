# Phase 11 — Female AI Interviewer Integration

## 1. Overview & Objective
Nexora InterviewAI provides simulated mock interview experiences designed to prepare students for real-world software engineering, systems design, algorithm evaluation, and behavioral hiring rounds. Phase 11 introduces a selectable **Female AI Interviewer Experience** with natural English speech synthesis, selectable persona configurations, voice question narration, speech-to-text dictation, and fallback to accessible text input.

---

## 2. Personas & Interview Profiles

| Persona | Role / Specialty | Voice Pitch / Rate | Focus Areas | Gender |
| :--- | :--- | :--- | :--- | :--- |
| **Elena Vance** | Lead Systems Architect & Technical Director | Pitch 1.15, Rate 1.0 | Distributed systems, clean software architecture, structured problem-solving, concurrency tradeoffs | Female |
| **Dr. Sophia Chen** | Principal AI Researcher & Algorithms Lead | Pitch 1.20, Rate 1.05 | Algorithmic rigor, data structures, complexity trade-offs, and behavioral leadership | Female |
| **Marcus Sterling** | Senior Engineering Manager | Pitch 0.95, Rate 1.0 | Behavioral scenarios (STAR), cross-functional communication, and pragmatic delivery | Male |

---

## 3. Transparency & Academic Ethics Safeguards

1. **Explicit AI Simulation Disclaimer:**
   Every session display clearly states:
   > *"AI simulation for student practice — not a real human interviewer."*
   The system never misleads students into believing they are speaking with a human or that platform evaluations constitute verified employment offers.

2. **Zero Audio Recording or Cloud Audio Storage:**
   - Speech synthesis is generated locally via the browser's native `window.speechSynthesis`.
   - Voice dictation operates via the browser's `SpeechRecognition` API, emitting text directly into the student's text response input.
   - Raw audio waveforms are never transmitted or stored on remote Nexora servers.

3. **Text-First Fallback:**
   - Microphone input is strictly opt-in and requires explicit user consent via browser permissions.
   - Text entry via the keyboard is always enabled, fully supported, and independent of microphone availability.
   - In unsupported browsers or noisy environments, students have full functionality without audio.

4. **Speech Playback Controls:**
   - **Listen to Question:** Reads the current question and scenario context aloud.
   - **Stop Voice:** Instantly interrupts and halts speech synthesis.
   - **Repeat Question:** Restarts the spoken question narration from the beginning.
   - **Speaking Pulse:** Visual indicator reveals when the interviewer is speaking.

---

## 4. Multi-Category Interview Support
The female AI interviewer personas support all 5 core interview tracks:
- **Technical & Algorithms:** In-depth algorithmic questions, data structure tradeoffs, and edge cases.
- **System Design:** Scalability, caching, horizontal partitioning, consistency, and network topology.
- **Behavioral (STAR):** Conflict resolution, project ownership, technical failures, and collaboration.
- **HR & Culture Fit:** Growth mindset, communication style, and career goals.
- **Specialized Roles:** Frontend, Backend, DevOps, and Data Engineering tracks.

---

## 5. Architectural Verification & Storage
- **Persona Persistence:** `interviewerPersonaId` is saved in `InterviewSetupConfig`, `InterviewSession`, and `InterviewSessionSummary` records in Firestore / LocalStorage.
- **Session Reports:** Evaluation reports clearly attribute feedback and grading rubrics to the selected persona without altering objective evaluation standards.

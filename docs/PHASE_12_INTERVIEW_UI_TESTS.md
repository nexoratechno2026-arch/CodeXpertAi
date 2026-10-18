# PHASE 12 — INTERVIEW ROOM UI & RESPONSIVE DESIGN SPECIFICATION

**Product:** CodeXpertai (Nexora CodeLab + Nexora InterviewAI)  
**Modules:** Live AI Interview Room (`/interview/live`) & Voice Chatbot  
**Design Tokens:** Dark Developer-Tool Palette (`#090909`, `#111111`, `#171717`, `#292929`, `#F5F5F5`, `#A1A1AA`, `#3B82F6`)  
**Status:** SPECIFIED & TESTED

---

## 1. Professional Interview Room Architecture

Rather than a static chat panel with an unmoving thumbnail, the Live Interview room adopts an immersive studio layout mirroring industry video interview environments (e.g. Google Meet, Zoom Interview, HireVue):

```
+-------------------------------------------------------------------------------+
| CodeXpertai  [LIVE SESSION]  Role: Full Stack Engineer  Timer: 24:18  [END SESSION] |
+------------------------------------------------------+------------------------+
|                                                      |  QUESTION & STATUS     |
|   +----------------------------------------------+   |  Question 2 of 5       |
|   |                                              |   |  Topic: System Design  |
|   |         LIVE FEMALE AI INTERVIEWER           |   |                        |
|   |         (ELENA VANCE / DR. CHEN)             |   |  "How would you design |
|   |     - Procedural Audio-Synced Lip Sync       |   |   a distributed cache  |
|   |     - Natural Blinking & Attention Gaze      |   |   with LRU eviction?"  |
|   |     - Real-Time Speaking Waveform Visualizer |   |                        |
|   +----------------------------------------------+   |  [Interviewer Speaking]|
|                                                      +------------------------+
|   STUDENT WEBCAM PREVIEW (Picture-in-Picture)        |  LIVE TRANSCRIPT       |
|   +----------------------+  +---------------------+  |  Interviewer: ...      |
|   |  [LIVE CAM FEED]     |  | Mic: Active (RMS)   |  |  Student: [Real-time   |
|   |  Mirrored Video      |  | [||||||||||       ] |  |  speech text...]       |
|   +----------------------+  +---------------------+  |                        |
|   CONTROLS: [Mute Mic] [Pause Video] [Done Speaking] |  [Type Answer Fallback]|
+------------------------------------------------------+------------------------+
```

---

## 2. Responsive Viewport Matrix

| Viewport | Dimensions | Layout Adjustments |
| :--- | :--- | :--- |
| **Desktop Ultra-wide & 1080p** | >= 1280px | Full two-column studio layout. Interviewer stage takes 65% width; transcript and question card take 35% sidebar. |
| **Laptop / Small Desktop** | 1024px – 1279px | Balanced side-by-side grid with compact picture-in-picture student cam. |
| **Tablet Landscape & Portrait** | 768px – 1023px | Stacked layout: Interviewer video stage on top (40vh); student controls, question, and transcript in scrollable bottom container. |
| **Mobile Smartphone** | 360px – 767px | Single-column view with collapsible transcript tab, full-width avatar container, sticky bottom controls for mic and "Done Speaking". |

---

## 3. Accessibility & Keyboard Navigation

1. **Focus States:** Every button and control provides visible `#3B82F6` focus rings complying with WCAG 2.1 AA.
2. **Keyboard Shortcuts:**
   - `Space` / `Enter`: Toggle microphone input / finish speaking answer.
   - `Escape`: Interrupt active AI vocalization immediately.
   - `Tab`: Sequential navigation across all actions.
3. **Screen Reader ARIA Live Regions:**
   - Status updates (`aria-live="polite"`) broadcast changes in session state (e.g. *"Elena Vance is now speaking"*, *"Listening to your response"*).
   - Audio indicators have text equivalents (`aria-label="Microphone active, input level 45 percent"`).

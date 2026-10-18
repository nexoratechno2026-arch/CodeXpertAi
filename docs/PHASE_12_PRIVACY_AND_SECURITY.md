# PHASE 12 — PRIVACY, SECURITY & DATA PROTECTION SPECIFICATION

**Product:** CodeXpertai (Nexora CodeLab + Nexora InterviewAI)  
**Modules:** Voice Chatbot & Live AI Interviewer (`/interview/live`)  
**Compliance Standards:** OWASP Top 10, WebRTC Privacy Guidelines, Indian Digital Personal Data Protection (DPDP) Act, Children's Online Privacy Protection  
**Status:** IMPLEMENTED & AUDITED

---

## 1. Authentication & Session Ownership

1. **Mandatory Authenticated Sessions:**
   - Both `/interview/session/:id` and `/interview/live` are gated behind `<ProtectedRoute>`. Unauthenticated visitors are redirected to `/login` with clean redirect path restoration.
2. **Session Ownership Gating:**
   - Every interview record in Firestore is strictly indexed by `userId`.
   - Firestore security rules enforce:
     ```
     match /interviewSessions/{sessionId} {
       allow read, update: if request.auth != null && (resource.data.userId == request.auth.uid || request.auth.token.role == 'admin');
       allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
     }
     ```
   - Students cannot read, modify, or list another candidate's interview session or report.

---

## 2. Media Privacy & Hardware Security

1. **Zero Secret Surveillance:**
   - The application never prompts for media permissions in the background.
   - Permissions are requested exclusively when the user deliberately clicks **Start Live Interview**.
2. **Local Video Stream Processing:**
   - Video frames captured by the student's webcam are rendered exclusively inside the local browser DOM (`<video playsInline autoPlay muted />`).
   - The camera stream is **never transmitted to external video hosting, third-party analytics, or cloud databases**.
3. **Hardware Track Deactivation:**
   - On page unmount, exit, or completion, all tracks are explicitly terminated (`track.stop()`), guaranteeing that the device hardware LED indicators extinguish.

---

## 3. Data Processing & External Provider Disclosures

| Service Provider / Protocol | Data Transmitted | Data Retained | Purpose |
| :--- | :--- | :--- | :--- |
| **Web Speech Recognition** | Transient spoken audio converted to text via local/browser API. | Local browser audio cache (not retained by CodeXpertai). | Real-time transcription of candidate verbal responses. |
| **Web Speech Synthesis** | Plain text of interview questions and chatbot guidance. | None (transient audio rendered locally by OS audio synthesizer). | Spoken vocalization of female interviewer questions. |
| **Firebase Firestore** | Session metadata, question records, verbatim text transcripts, and evaluation scorecards. | Retained under user account until account deletion is requested. | Progress tracking, score history, and student dashboard analytics. |
| **Cloud Avatar Providers (When Configured)** | Audio buffer or text prompt for lip-sync rendering. | Governed by provider enterprise DPA (transient WebRTC session stream). | Optional neural cloud avatar streaming. |

---

## 4. Prompt Injection & Academic Integrity Defenses

1. **Input Normalization & Boundary Checks:**
   - User queries and student verbal responses are sanitized before processing.
   - Guardrails detect attempts to extract hidden evaluation test cases, bypass interview scoring rubrics, or access administrative credentials.
2. **Server-Side API Key Protection:**
   - Any external AI provider credentials remain server-side or injected via secure build-time environment variables. Secret API keys are never exposed in client bundles or public repositories.
3. **Educational Non-Guarantee Disclaimer:**
   - All evaluation reports and live interview rooms prominently feature the mandatory disclaimer:
     > *"This interview is an AI-powered educational simulation. Evaluator scores and feedback are practice guidance and do not constitute professional certification or guaranteed hiring outcomes."*

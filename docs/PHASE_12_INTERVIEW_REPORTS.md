# PHASE 12 — INTERVIEW EVALUATION & REPORT GENERATION SPECIFICATION

**Product:** CodeXpertai (Nexora CodeLab + Nexora InterviewAI)  
**Module:** Live AI Interview Evaluation & Scorecard (`/interview/report/:id`)  
**Standard:** Multi-Dimensional Rubric Assessment & Evidence-Based Feedback  
**Status:** IMPLEMENTED & DOCUMENTED

---

## 1. Objective Evaluation Philosophy

CodeXpertai evaluation reports serve as formative practice scorecards for college students and freshers. Reports adhere to four core ethical and technical guidelines:
1. **Evidence-Based Scoring:** Every score, strength, and improvement recommendation is tied directly to the student's actual transcribed words. Scores and feedback are never fabricated or randomly generated.
2. **Clear Demarcation:**
   - **Verbatim Transcripts:** Actual questions vocalized by the female AI interviewer and transcribed student responses.
   - **AI Qualitative Feedback:** Constructive coaching feedback, algorithmic observations, and communication clarity evaluations.
   - **Quantitative Rubric Metrics:** Objective dimensional scores (e.g. Technical Correctness, Communication Clarity, Edge-Case Awareness, Architectural Trade-offs).
3. **No Automated Hiring Decisions:** Reports explicitly display an educational disclaimer clarifying that the scorecard is an AI practice aid and not an official hiring assessment or employment guarantee.
4. **Access Control:** Reports are restricted via Firestore Security Rules and route guards exclusively to the session owner (`request.auth.uid == resource.data.userId`) and authorized administrators.

---

## 2. Evaluation Rubric Dimensions

Each completed live interview is evaluated across four standardized dimensions:

| Rubric Dimension | Weight | Description | Scoring Criteria |
| :--- | :--- | :--- | :--- |
| **Technical Correctness** | 35% | Accuracy of computational explanations, syntax validity, algorithmic complexity (Big-O runtime & memory). | Accurate algorithmic approach with optimal time/space complexity: 85–100%. Suboptimal but functional: 65–84%. Major conceptual errors: < 65%. |
| **Problem-Solving & Reasoning** | 25% | Systematic decomposition of problems, edge-case identification, validation of assumptions. | Identifies constraints and edge cases out loud: 85–100%. Considers constraints only when prompted: 65–84%. Ignores boundary conditions: < 65%. |
| **Communication Clarity** | 20% | Structured delivery (STAR method for behavioral, clear step-by-step narration for technical), conciseness. | Articulate, structured, and easy to follow: 85–100%. Comprehensible but disorganized: 65–84%. Extremely fragmented: < 65%. |
| **Trade-off Awareness** | 20% | Understanding architectural alternatives, memory vs CPU compromises, maintainability. | Proactively contrasts multiple approaches: 85–100%. Discusses trade-offs only when asked: 65–84%. Single-minded brute force: < 65%. |

---

## 3. Performance Tiers

| Overall Score Range | Performance Tier | Meaning |
| :--- | :--- | :--- |
| **90 – 100** | Exceptional | Candidate demonstrates mastery, proactive communication, and edge-case rigor. |
| **75 – 89** | Strong | Solid engineering foundation with minor gaps in trade-off analysis or optimization. |
| **60 – 74** | Developing | Baseline competency demonstrated; needs structured practice in complexity analysis and depth. |
| **Below 60** | Needs Practice | Substantive gaps in conceptual fundamentals; recommended CodeLab practice paths. |

---

## 4. Report Contents & Actionable Next Steps

Each report rendered on `/interview/report/:id` includes:
- **Session Metadata:** Category (Technical, Behavioral, Programming, etc.), difficulty tier, target role, date, duration, and interviewer persona (Elena Vance / Dr. Sophia Chen).
- **Executive Summary:** Overall composite score (0–100) and Performance Tier badge.
- **Dimensional Scorecard:** Progress bars and percentage scores across Technical Correctness, Problem Solving, Communication, and Trade-offs.
- **Turn-by-Turn Transcript Review:**
  - Question vocalized by AI interviewer.
  - Follow-up prompts asked during the live session.
  - Exact student verbal response.
  - Specific strengths identified in the answer.
  - Concrete areas for improvement with model answer guidance.
- **Personalized Recommendations:** Clickable links to relevant CodeLab practice challenges and learning paths in CodeXpertai to address identified weaknesses.

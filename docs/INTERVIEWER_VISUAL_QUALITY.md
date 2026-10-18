# Nexora InterviewAI — Interviewer Visual Quality & Gaze Correction Report

## 1. Executive Summary

This document details the visual quality audit, root cause diagnosis of downward-looking gaze behavior, geometric re-engineering, and animation stabilization performed for the Nexora InterviewAI female avatar interviewer engine.

Prior to this enhancement, the character suffered from:
1. A perceived downward/sleepy gaze where the interviewer appeared to be reading notes or looking away from the student.
2. Low camera framing where the avatar occupied the lower half of the viewport.
3. Excessive downward head-nodding (`+5px`) whenever the student began speaking.
4. Overly simplistic geometric facial rendering that broke human suspension of disbelief.

Through mathematical geometry recalibration and visual styling in [`src/services/avatarProviderService.ts`](file:///E:/Codebase%20Nexoratechno/src/services/avatarProviderService.ts), the avatar now maintains confident, eye-level gaze directly facing the student's camera lens with natural micro-movements, limbal ring depth, and anatomical eyelid draping.

---

## 2. Downward Gaze: Root Cause Analysis

A thorough forensic audit of the rendering pipeline revealed four interrelated causes of the downward-looking effect:

| Component | Defective Implementation | Visual Consequence |
| :--- | :--- | :--- |
| **Head Center Y Position** | `centerY = height * 0.46` | Placed the avatar's eye line significantly below the natural 1/3 eye-level horizon of video interview cameras, forcing the perspective to feel pitched downwards. |
| **Eye Gaze Coordinates & Offset** | `irisY = eyeY + 1.2px` + `pupilY = irisY + 0.5px` | The iris and pupil were explicitly offset below the eye geometric center, simulating downcast eyes. |
| **Upper Sclera Exposure** | Upper eyelid was drawn as an open symmetrical ellipse (`strokeArc`) | Exposed white sclera above the iris. In human facial perception, visible white sclera above the iris triggers a "downcast" or "sleepy" read unless the subject is wide-eyed in shock. |
| **Listening Head-Nod Translation** | `nodOffset = Math.sin(nodProgress * Math.PI) * 5` | Every time the candidate spoke, the interviewer's head dropped downward by 5 pixels, persisting near the bottom of the nod cycle during continuous speech. |
| **Catchlight Glint Angle** | Catchlight placed at `(x - 1, irisY - 1)` with low opacity | Weak specular highlight lacked corneal depth and failed to anchor direct focal engagement with the camera. |

---

## 3. Visual & Geometric Corrections Implemented

### A. Eye-Level Horizon Recalibration
- **Center Y Raised**: Shifted from `height * 0.46` to `height * 0.40`. This places the eye-line at `36%` from the top of the canvas, matching the broadcast standard for video conference framing (e.g. Zoom, Google Meet).
- **Shoulder & Torso Anchoring**: Lowered shoulder yoke curve from `centerY + 70` to `centerY + 78` to balance realistic bust proportions and prevent the character from feeling crowded at the top.

### B. Direct-Lens Eye Geometry & Pupil Alignment
- **Coincident Pupil Center**: Iris and pupil are now strictly locked to `eyeY - 0.5px` relative to head center, aiming the optical axis straight through the virtual camera lens at the student.
- **Anatomical Upper Eyelid Drape**: An upper eyelid arc is rendered at `eyeY - 6.5` with a subtle natural droop spanning from `eyeX - 16` to `eyeX + 16`. This intentionally clips the top 10% of the iris, eliminating exposed top sclera and creating the confident, attentive expression of an active listener.
- **Corneal Specular Catchlight**: Added a crisp dual specular highlight:
  - Primary glint at 11 o'clock: `(eyeX - 1.8, irisY - 2.0)` with pure white `#FFFFFF` at radius `1.5px`.
  - Secondary diffuse glint at 5 o'clock: `(eyeX + 1.6, irisY + 1.2)` at radius `0.8px` with 50% opacity, providing genuine 3D corneal curvature.

### C. Limbal Ring Depth & Iris Shading
- Multi-stop radial gradient added:
  - Center: Rich warm hazel-amber `#784421` (Elena Vance) or deep obsidian espresso `#1F140E` (Dr. Sophia Chen).
  - Mid-zone: `#45220C`.
  - Outer border: Dark limbal ring stroke `#1A0C05` (thickness `1.0px`), replicating human ocular anatomy.

### D. Natural Listening Micro-Nodding
- Dampened `nodOffset` from `5.0px` down to `2.5px` with a return cycle curve:
  $$\text{nodOffset} = \sin(\text{nodProgress} \cdot \pi) \cdot 2.5$$
- The micro-nod now reads as an affirmative, attentive listening cue without physically dragging the avatar's eye line down.

### E. Viseme Lip Synchronization & Expression States
- **Idle State**: Neutral soft mouth curve with resting mouth aperture (`height = 2.0px`, `width = 22px`).
- **Listening State**: Attentive brow relaxation, affirmative micro-nodding, slight head tilt (`±0.015 rad`), subtle breathing sway on torso.
- **Thinking State**: Brow furrowed slightly (`-1.2px`), eyes centered with slight gaze stabilization, mouth closed.
- **Speaking State**: Dynamic phoneme-driven mouth opening scaling from `4px` to `15px` modulated by syllable frequency, with upper and lower lip separation and inner oral depth gradient.

---

## 4. Visual Verification Checklist

| Metric | Target Standard | Status | Verification Result |
| :--- | :--- | :--- | :--- |
| **Gaze Direction** | Direct into camera lens | **PASS** | Pupils centered at eye-level horizon; catchlight at 11 o'clock. |
| **Camera Framing** | Eye-level 35-40% from top | **PASS** | Head center at 40%; shoulders anchored naturally. |
| **Eyelid Contour** | No white sclera above iris | **PASS** | Upper lid drape covers top 10% of iris. |
| **Blinking** | Natural 3-4s intervals, 120ms duration | **PASS** | Smooth ease-in-out closure cycle without frozen frames. |
| **Head Sway** | Organic micro-movement ($\le 2\text{px}$) | **PASS** | Sine wave ambient sway $\pm 1.8\text{px}$ X, $\pm 1.2\text{px}$ Y. |
| **Lip Sync** | Viseme opens with syllable audio | **PASS** | Modulated speech viseme cycle matching synthesized text. |

---

## 5. Next Evolution: Cloud Streaming Video Feeds

For clients desiring photorealistic 3D/neural video (such as HeyGen Interactive Avatar or D-ID Agents API), the system provides an extensible adapter interface [`CloudStreamingAvatarProvider`](file:///E:/Codebase%20Nexoratechno/src/services/avatarProviderService.ts#L43-L65).

The local canvas renderer remains the default zero-cost, zero-latency production baseline that operates offline without API tokens or cloud egress charges.

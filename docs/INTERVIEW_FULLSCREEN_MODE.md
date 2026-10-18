# Nexora InterviewAI — Full-Screen Interview Mode Specification

## 1. Overview & Purpose

Live technical interviews demand focused immersion. Extraneous navigation headers, promotional cards, sidebars, and desktop notifications distract the candidate and detract from the authenticity of the assessment.

Nexora InterviewAI provides an **Immersive Full-Screen Experience** triggered strictly via explicit candidate interaction, complying fully with W3C Fullscreen API security mandates while providing an elegant fallback for unsupported environments.

---

## 2. Fullscreen Lifecycle & User Gesture Compliance

Browser security standards (`Element.requestFullscreen()`) prohibit programmatic full-screen transitions without a direct user activation event (click, keypress, or tap). Calling `requestFullscreen()` asynchronously or from a timer produces a `TypeError: Permissions check failed`.

### The Transition Sequence
```
[Candidate Configuration]
         ↓
[Click "Verify Camera & Mic"]
         ↓
[Hardware Preflight Checks Pass]
         ↓
[Candidate Checks Privacy Acknowledgment]
         ↓
[Candidate Clicks "Start Full-Screen Interview"] (DIRECT USER GESTURE)
         ↓
[requestInterviewFullScreen() Invoked Immediately]
         ↓
[Browser Enters Native Fullscreen (`document.fullscreenElement`)]
         ↓
[Live Interview UI Mounts with Immersive Layout]
```

---

## 3. Implementation in `src/services/interviewReadinessService.ts`

```ts
export async function requestInterviewFullScreen(
  containerElement?: HTMLElement | null
): Promise<{ success: boolean; error?: string; isFallback: boolean }> {
  if (typeof document === 'undefined') {
    return { success: false, isFallback: true, error: 'Document not defined.' };
  }

  const target = containerElement || document.documentElement;

  try {
    if (target.requestFullscreen) {
      await target.requestFullscreen();
      return { success: true, isFallback: false };
    } else if ((target as any).webkitRequestFullscreen) {
      await (target as any).webkitRequestFullscreen();
      return { success: true, isFallback: false };
    } else if ((target as any).msRequestFullscreen) {
      await (target as any).msRequestFullscreen();
      return { success: true, isFallback: false };
    } else {
      return {
        success: false,
        isFallback: true,
        error: 'Fullscreen API is not supported on this browser or platform.',
      };
    }
  } catch (err: any) {
    return {
      success: false,
      isFallback: true,
      error: err?.message || 'Fullscreen request was declined or blocked by browser policy.',
    };
  }
}
```

---

## 4. Fullscreen UI Controls & Persistent HUD

When in full-screen mode, all non-essential navigation is hidden. The following HUD controls remain accessible at all times:

| Control | Position | Function |
| :--- | :--- | :--- |
| **Progress Indicator** | Top Left | Question counter (`Question X of Y`), difficulty badge, and timer. |
| **Interviewer Status** | Top Center | Avatar visual state (`Listening`, `Speaking`, `Thinking`). |
| **Connection & Track Health** | Top Center-Right | Live ping and media track health indicator (`Live`). |
| **Fullscreen Toggle** | Top Right | `Maximize2` / `Minimize2` button to expand or collapse. |
| **Microphone & Camera Mute** | Bottom Action Bar | Candidate hardware toggles. |
| **Repeat Question** | Bottom Action Bar | Asks the interviewer to vocalize the question again. |
| **End Interview** | Bottom Right | Safe termination button with confirmation dialog. |

---

## 5. Fallback Behavior & Graceful Degradation

If the candidate or browser blocks fullscreen access:
1. `isFallback: true` is flagged.
2. The UI enters **Immersive Viewport Mode** (`position: fixed; inset: 0; z-index: 9999;`).
3. An informative banner alerts the candidate: *"Operating in immersive browser fallback mode. Press F11 for native full-screen."*
4. The interview proceeds without interruption or data loss.

---

## 6. Exit & Teardown Handlers

- **`Escape` Key Handling**: Standard browser `Escape` key exits native full-screen. A `fullscreenchange` listener synchronizes local state:
  ```ts
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);
  ```
- **Interview Completion / End Session**: Exiting full-screen automatically releases the media stream, cancels speech synthesis, and transitions smoothly to the post-interview scoring report.

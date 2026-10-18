# Nexora Voice Interview Mode & Web Speech API Architecture

## 1. Overview & Privacy Architecture

The Nexora Voice Interview component (`VoiceAnswerInput.tsx`) enables candidates to practice spoken verbal communication during mock interviews.
Rather than piping raw audio streams to costly third-party speech-to-text cloud providers (which introduce latency, high operational costs, and privacy exposure), Nexora uses the **W3C Standard Web Speech API** directly within the candidate's browser.

---

## 2. Key Architecture Principles

1. **Zero External Voice Cloud Spend**: Speech recognition is processed natively by the user's browser engine (`webkitSpeechRecognition` / `SpeechRecognition`). Nexora incurs zero per-minute audio transcription charges.
2. **Explicit User Consent**: Microphone access is requested only when the candidate explicitly clicks "Start Dictation". The browser's native permissions modal guarantees transparency.
3. **Candidate Review & Editing**: Spoken text streams in real-time into the input buffer. The candidate can review, correct speech-to-text misinterpretations, edit punctuation, or add code snippets before final submission.
4. **Universal Text Fallback**: If the candidate's browser does not support the Web Speech API (or if microphone permission is denied), the interface automatically degrades to a standard textarea without broken layout or error dialogs.

---

## 3. Implementation Details

```tsx
// Feature detection
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  // Gracefully fallback to text input
  setIsSupported(false);
} else {
  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onresult = (event) => {
    // Collect interim and final speech transcripts
    let interimTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        onTranscriptChange(finalTranscript + event.results[i][0].transcript);
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }
  };
}
```

---

## 4. Accessibility & Candidate Comfort

- **Visual Recording Indicator**: A glowing badge clearly indicates when the microphone is listening.
- **Mute / Stop Anytime**: A single click immediately stops speech recognition and releases the audio hardware.
- **Audio Privacy**: Audio streams are never stored on Nexora servers; only the resulting plain-text answer submitted by the candidate is evaluated by the interview engine.

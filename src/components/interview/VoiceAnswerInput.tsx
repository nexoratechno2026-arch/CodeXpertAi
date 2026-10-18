import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import styles from './VoiceAnswerInput.module.css';

interface VoiceAnswerInputProps {
  value: string;
  onChange: (val: string) => void;
  onAudioUsed?: (used: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const VoiceAnswerInput: React.FC<VoiceAnswerInputProps> = ({
  value,
  onChange,
  onAudioUsed,
  placeholder = 'Type your answer or click the microphone to speak...',
  disabled = false,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check for native browser SpeechRecognition support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          onChange(transcript);
          if (onAudioUsed) onAudioUsed(true);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('[VoiceAnswerInput] Recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone access denied. You can still type your answer.');
        } else {
          setErrorMessage(`Speech recognition error: ${event.error}`);
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    } catch (err) {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore
        }
      }
    };
  }, [onChange, onAudioUsed]);

  const toggleRecording = () => {
    if (!recognitionRef.current) return;
    setErrorMessage(null);

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.warn('[VoiceAnswerInput] Failed to start recognition:', err);
        setIsRecording(false);
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.controlsBar}>
        <div className={styles.leftControls}>
          {isSupported ? (
            <Button
              type="button"
              variant={isRecording ? 'danger' : 'secondary'}
              size="sm"
              onClick={toggleRecording}
              disabled={disabled}
              leftIcon={isRecording ? <MicOff size={14} /> : <Mic size={14} />}
            >
              {isRecording ? 'Stop Recording' : 'Dictate with Voice'}
            </Button>
          ) : (
            <span className={styles.hint}>
              Voice input unsupported in this browser. Text input active.
            </span>
          )}

          {isRecording && (
            <span className={styles.recordingPulse}>
              <span className={styles.pulseDot} />
              Listening... Speak clearly into your microphone
            </span>
          )}
        </div>

        <span className={styles.hint}>
          {value.length} characters • Markdown allowed
        </span>
      </div>

      {errorMessage && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: '#f87171' }}>
          <AlertCircle size={14} />
          <span>{errorMessage}</span>
        </div>
      )}

      <textarea
        className={styles.textarea}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  );
};

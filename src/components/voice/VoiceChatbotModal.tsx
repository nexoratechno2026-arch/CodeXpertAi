import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  X,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  StopCircle,
} from 'lucide-react';
import {
  ChatMessage,
  VoiceChatbotState,
  checkVoiceCapabilities,
  speakText,
  stopSpeechSynthesis,
  generateChatbotResponse,
} from '@/services/voiceChatService';
import styles from './VoiceChatbotModal.module.css';

interface VoiceChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_WELCOME_MESSAGE: ChatMessage = {
  id: 'msg-welcome',
  sender: 'assistant',
  text: "Hello! I am your CodeXpertai AI study coach. Ask me anything about algorithmic patterns, system design, or interview preparation. You can speak with your microphone or type below.",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

const SUGGESTED_PROMPTS = [
  'Explain the Two Pointers pattern and when to use it',
  'How do I answer behavioral questions using STAR?',
  'What are common edge cases for binary search?',
  'How do I prepare for a technical coding interview?',
];

export const VoiceChatbotModal: React.FC<VoiceChatbotModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([DEFAULT_WELCOME_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [state, setState] = useState<VoiceChatbotState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeSpeakingMsgId, setActiveSpeakingMsgId] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const isSubmittingRef = useRef<boolean>(false);
  const spokenMessageIdsRef = useRef<Set<string>>(new Set());

  const capabilities = checkVoiceCapabilities();

  // Scroll to bottom whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, state]);

  // Clean up recognition and speech synthesis on unmount or close
  useEffect(() => {
    if (!isOpen) {
      stopSpeechSynthesis();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignore
        }
      }
      setState('idle');
      setActiveSpeakingMsgId(null);
      isSubmittingRef.current = false;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend: string, wasSpoken = false) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isSubmittingRef.current) return;

    isSubmittingRef.current = true;

    const userMessage: ChatMessage = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      wasSpoken,
    };

    const currentHistory = [...messages, userMessage];
    setMessages(currentHistory);
    setInputText('');
    setState('processing');
    setErrorMessage(null);

    try {
      // Pass full message history to ensure multi-turn context awareness
      const responseText = await generateChatbotResponse(trimmed, currentHistory);
      const assistantMessage: ChatMessage = {
        id: `ast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        sender: 'assistant',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // If user spoke or voice synthesis is active, speak this new response once
      if (wasSpoken && capabilities.hasSpeechSynthesis && !spokenMessageIdsRef.current.has(assistantMessage.id)) {
        spokenMessageIdsRef.current.add(assistantMessage.id);
        setState('speaking');
        setActiveSpeakingMsgId(assistantMessage.id);
        speakText(
          responseText,
          {
            preferredVoice: 'female',
            onStart: () => {
              setState('speaking');
              setActiveSpeakingMsgId(assistantMessage.id);
            },
            onEnd: () => {
              setState('idle');
              setActiveSpeakingMsgId(null);
            },
            onError: () => {
              setState('idle');
              setActiveSpeakingMsgId(null);
            },
          }
        );
      } else {
        setState('idle');
      }
    } catch (err: unknown) {
      console.error('[VoiceChatbotModal] Error responding:', err);
      setState('error');
      setErrorMessage('Failed to generate response. Please try again.');
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const startListening = () => {
    stopSpeechSynthesis();
    setActiveSpeakingMsgId(null);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setState('voice_unavailable');
      setErrorMessage('Speech recognition is not supported in this browser. Please type your message below.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      let finalTranscript = '';

      recognition.onstart = () => {
        setState('listening');
        setErrorMessage(null);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        setInputText(finalTranscript || interim);
      };

      recognition.onerror = (event: any) => {
        console.warn('[VoiceChatbotModal] Recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone access denied. You can continue typing in English.');
        } else if (event.error === 'no-speech') {
          setErrorMessage('No speech detected. Please click the mic and speak clearly.');
        } else {
          setErrorMessage(`Speech recognition error: ${event.error}`);
        }
        setState('error');
      };

      recognition.onend = () => {
        if (finalTranscript.trim()) {
          handleSendMessage(finalTranscript, true);
        } else {
          setState('idle');
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('[VoiceChatbotModal] Failed to start recognition:', err);
      setState('error');
      setErrorMessage('Could not access microphone.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
    }
    setState('idle');
  };

  const handleToggleSpeak = (msg: ChatMessage) => {
    if (activeSpeakingMsgId === msg.id) {
      stopSpeechSynthesis();
      setActiveSpeakingMsgId(null);
      setState('idle');
    } else {
      stopSpeechSynthesis();
      setState('speaking');
      setActiveSpeakingMsgId(msg.id);
      spokenMessageIdsRef.current.add(msg.id);
      speakText(msg.text, {
        preferredVoice: 'female',
        onStart: () => {
          setState('speaking');
          setActiveSpeakingMsgId(msg.id);
        },
        onEnd: () => {
          setState('idle');
          setActiveSpeakingMsgId(null);
        },
        onError: () => {
          setState('idle');
          setActiveSpeakingMsgId(null);
        },
      });
    }
  };

  const handleInterruptSpeaking = () => {
    stopSpeechSynthesis();
    setActiveSpeakingMsgId(null);
    setState('idle');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || state === 'processing') return;
    handleSendMessage(inputText, false);
  };

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-label="AI Voice Assistant">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.botIconCircle}>
              <Sparkles size={16} />
            </div>
            <div className={styles.titleBox}>
              <span className={styles.title}>CodeXpertai Voice Assistant</span>
              <span className={styles.statusText}>
                <span
                  className={`${styles.statusDot} ${
                    state === 'listening'
                      ? styles.statusDotListening
                      : state === 'speaking'
                      ? styles.statusDotSpeaking
                      : state === 'processing'
                      ? styles.statusDotProcessing
                      : ''
                  }`}
                />
                {state === 'listening' && 'Listening...'}
                {state === 'processing' && 'Thinking...'}
                {state === 'speaking' && 'Speaking answer...'}
                {state === 'voice_unavailable' && 'Voice unavailable (Text only)'}
                {state === 'error' && 'Error'}
                {state === 'idle' && 'Ready to assist'}
              </span>
            </div>
          </div>

          <div className={styles.headerRight}>
            <button
              className={styles.iconBtn}
              onClick={() => {
                stopSpeechSynthesis();
                setMessages([DEFAULT_WELCOME_MESSAGE]);
                setState('idle');
                setErrorMessage(null);
              }}
              title="Reset conversation"
              aria-label="Reset conversation"
            >
              <RotateCcw size={14} />
            </button>
            <button className={styles.iconBtn} onClick={onClose} title="Close Assistant" aria-label="Close Assistant">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Privacy & Safeguard Banner */}
        <div className={styles.privacyBanner}>
          <ShieldCheck size={12} style={{ color: 'var(--color-accent)' }} />
          <span>Microphone active only when recording. Zero audio persisted to disk.</span>
        </div>

        {/* Warning or Error Banner */}
        {errorMessage && (
          <div className={styles.warningBanner} role="alert">
            <AlertTriangle size={14} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Conversation Transcript */}
        <div className={styles.messagesContainer}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`${styles.messageRow} ${
                msg.sender === 'user' ? styles.userRow : styles.assistantRow
              }`}
            >
              <div
                className={`${styles.bubble} ${
                  msg.sender === 'user' ? styles.userBubble : styles.assistantBubble
                }`}
              >
                {msg.text}
              </div>
              <div className={styles.metaRow}>
                <span>{msg.timestamp}</span>
                {msg.sender === 'assistant' && capabilities.hasSpeechSynthesis && (
                  <button
                    className={styles.speakBtn}
                    onClick={() => handleToggleSpeak(msg)}
                    title={activeSpeakingMsgId === msg.id ? 'Stop speaking' : 'Read out loud'}
                    aria-label={activeSpeakingMsgId === msg.id ? 'Stop speaking' : 'Read out loud'}
                  >
                    {activeSpeakingMsgId === msg.id ? (
                      <>
                        <VolumeX size={12} />
                        <span>Stop</span>
                      </>
                    ) : (
                      <>
                        <Volume2 size={12} />
                        <span>Read</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Quick prompt suggestions when only welcome message is present */}
          {messages.length === 1 && (
            <div className={styles.emptyPromptList}>
              {SUGGESTED_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  className={styles.promptChip}
                  onClick={() => handleSendMessage(prompt, false)}
                >
                  &ldquo;{prompt}&rdquo;
                </button>
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Active Speech Waveform Indicator */}
        {state === 'speaking' && (
          <div className={styles.audioWaveBar}>
            <div className={styles.audioWaveAnimation}>
              <span className={styles.waveBar} />
              <span className={styles.waveBar} />
              <span className={styles.waveBar} />
              <span className={styles.waveBar} />
              <span style={{ marginLeft: 6, fontSize: '0.6875rem' }}>Assistant is speaking...</span>
            </div>
            <button className={styles.stopPlaybackBtn} onClick={handleInterruptSpeaking} aria-label="Stop speech playback">
              <StopCircle size={12} />
              <span>Stop Audio</span>
            </button>
          </div>
        )}

        {/* Input Bar */}
        <form onSubmit={handleFormSubmit} className={styles.footer}>
          <div className={styles.inputRow}>
            {/* Microphone Toggle Button */}
            <button
              type="button"
              className={`${styles.micBtn} ${state === 'listening' ? styles.micBtnActive : ''}`}
              onClick={state === 'listening' ? stopListening : startListening}
              disabled={!capabilities.hasSpeechRecognition || state === 'processing'}
              title={
                !capabilities.hasSpeechRecognition
                  ? 'Voice recognition unavailable in this browser'
                  : state === 'listening'
                  ? 'Click to stop listening'
                  : 'Click to speak'
              }
              aria-label={state === 'listening' ? 'Stop listening' : 'Start microphone speech input'}
            >
              {state === 'listening' ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            {/* Text input fallback */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                state === 'listening'
                  ? 'Listening to speech...'
                  : 'Ask a coding concept or interview tip...'
              }
              className={styles.textInput}
              disabled={state === 'processing'}
              aria-label="Ask assistant a question"
            />

            {/* Send Button */}
            <button
              type="submit"
              className={styles.sendBtn}
              disabled={!inputText.trim() || state === 'processing'}
              title="Send message"
              aria-label="Send message"
            >
              <Send size={15} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

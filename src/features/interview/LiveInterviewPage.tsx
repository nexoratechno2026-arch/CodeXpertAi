import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Clock,
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Radio,
  Send,
  Subtitles,
  FileText,
  X,
  Square,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  PhoneOff,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/contexts/AuthContext';
import {
  InterviewCategory,
  InterviewSession,
  InterviewerPersona,
  getInterviewerPersona,
  INTERVIEWER_PERSONAS,
} from '@/types/interview';
import {
  createInterviewSession,
  submitInterviewAnswer,
} from '@/services/interviewService';
import {
  requestMediaStream,
  monitorAudioVolume,
  stopMediaStream,
  DeviceReadiness,
} from '@/services/mediaService';
import {
  LocalCanvasAvatarProvider,
  AvatarState,
} from '@/services/avatarProviderService';
import {
  generateAdaptiveFollowUp,
  getConversationalTransition,
} from '@/services/adaptiveFollowUpService';
import { stopSpeechSynthesis } from '@/services/voiceChatService';
import {
  compileReadinessReport,
  ReadinessReport,
} from '@/services/interviewReadinessService';
import styles from './LiveInterview.module.css';

interface TranscriptItem {
  id: string;
  sender: 'interviewer' | 'student';
  text: string;
  timestamp: string;
  isFollowUp?: boolean;
}

export const LiveInterviewPage: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Configuration params from URL or defaults
  const categoryParam = (searchParams.get('category') as InterviewCategory) || 'technical';
  const roleParam = searchParams.get('role') || 'Full Stack Engineer';
  const difficultyParam = (searchParams.get('difficulty') as any) || profile?.selectedLevel || 'intermediate';
  const personaParam = searchParams.get('persona') || 'elena';

  const [selectedPersona, setSelectedPersona] = useState<InterviewerPersona>(
    getInterviewerPersona(personaParam)
  );

  // High-Level Stage
  const [stage, setStage] = useState<'preflight' | 'in_session' | 'evaluating'>('preflight');

  // Media & Diagnostics State
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [deviceReadiness, setDeviceReadiness] = useState<DeviceReadiness>({
    hasCamera: false,
    hasMicrophone: false,
    cameraActive: false,
    microphoneActive: false,
  });
  const [isVerifyingMedia, setIsVerifyingMedia] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isCameraPaused, setIsCameraPaused] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);

  // Strict Pre-Interview Readiness & Full-Screen State
  const [readinessReport, setReadinessReport] = useState<ReadinessReport | null>(null);
  const [privacyAcknowledged, setPrivacyAcknowledged] = useState(true);
  const [isHealthPaused, setIsHealthPaused] = useState(false);
  const [healthError, setHealthError] = useState<string | null>(null);

  // Session State
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [followUpCount, setFollowUpCount] = useState(0);
  const [isFollowUpActive, setIsFollowUpActive] = useState(false);
  const [activeQuestionText, setActiveQuestionText] = useState('');
  const [sessionSeconds, setSessionSeconds] = useState(0);

  // Turn-Taking & Transcript State
  const [interviewerState, setInterviewerState] = useState<AvatarState>('idle');
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [interimSpeech, setInterimSpeech] = useState('');
  const [currentTypedAnswer, setCurrentTypedAnswer] = useState('');
  const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  // Studio Accessibility & Display State
  const [showCaptions, setShowCaptions] = useState(true);
  const [showTranscriptDrawer, setShowTranscriptDrawer] = useState(false);

  // DOM & Provider References
  const liveRoomRef = useRef<HTMLDivElement | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const pipVideoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const avatarProviderRef = useRef<LocalCanvasAvatarProvider | null>(null);
  const recognitionRef = useRef<any>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);
  const audioCleanupRef = useRef<(() => void) | null>(null);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript, interimSpeech]);

  // Session Clock
  useEffect(() => {
    if (stage !== 'in_session' || isHealthPaused) return;
    const timer = setInterval(() => {
      setSessionSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [stage, isHealthPaused]);


  // Initial and reactive readiness report compilation
  useEffect(() => {
    compileReadinessReport({
      stream,
      videoElement: previewVideoRef.current,
      currentAudioLevel: audioLevel,
      personaId: selectedPersona.id,
      userId: user?.uid,
      privacyAcknowledged,
    }).then((rep) => setReadinessReport(rep));
  }, [stream, audioLevel, selectedPersona, user, privacyAcknowledged]);

  // Runtime health monitor during in_session
  useEffect(() => {
    if (stage !== 'in_session') return;

    const interval = setInterval(() => {
      // 1. Check network connectivity
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setIsHealthPaused(true);
        setHealthError('Network connection lost. The interview has been paused to protect your session progress.');
        return;
      }

      // 2. Check camera and mic track health
      if (stream) {
        const vTracks = stream.getVideoTracks();
        if (vTracks.length > 0 && vTracks[0].readyState !== 'live') {
          setIsHealthPaused(true);
          setHealthError('Camera hardware track was disconnected or interrupted.');
          return;
        }

        const aTracks = stream.getAudioTracks();
        if (aTracks.length > 0 && aTracks[0].readyState !== 'live') {
          setIsHealthPaused(true);
          setHealthError('Microphone hardware track was disconnected or interrupted.');
          return;
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [stage, stream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpeechSynthesis();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
      if (audioCleanupRef.current) {
        audioCleanupRef.current();
      }
      if (stream) {
        stopMediaStream(stream);
      }
      if (avatarProviderRef.current) {
        avatarProviderRef.current.disconnect();
      }
    };
  }, [stream]);

  // Handle Video Element Stream Attachments
  useEffect(() => {
    if (stage === 'preflight' && previewVideoRef.current && stream) {
      previewVideoRef.current.srcObject = stream;
    } else if (stage === 'in_session' && pipVideoRef.current && stream) {
      pipVideoRef.current.srcObject = stream;
    }
  }, [stage, stream]);

  // Initialize Avatar Provider when entering room
  useEffect(() => {
    if (stage === 'in_session' && canvasRef.current) {
      const avatar = new LocalCanvasAvatarProvider();
      avatarProviderRef.current = avatar;
      avatar.connect({
        persona: selectedPersona,
        canvasElement: canvasRef.current,
        onStateChange: (st) => setInterviewerState(st),
      });

      // Start initial question
      if (session && session.questions.length > 0) {
        const firstQ = session.questions[0];
        setActiveQuestionText(firstQ.questionText);
        speakInterviewerPrompt(firstQ.questionText);
      }
    }
  }, [stage, session, selectedPersona]);

  // ─────────────────────────────────────────────────────────────
  // Media Verification Handlers
  // ─────────────────────────────────────────────────────────────
  const handleVerifyMedia = async () => {
    setIsVerifyingMedia(true);
    setSessionError(null);

    // Stop existing stream if retrying
    if (stream) {
      stopMediaStream(stream);
      setStream(null);
    }
    if (audioCleanupRef.current) {
      audioCleanupRef.current();
      audioCleanupRef.current = null;
    }

    const res = await requestMediaStream();
    setDeviceReadiness(res.readiness);

    if (res.stream) {
      setStream(res.stream);
      // Start audio volume monitor
      const cleanup = monitorAudioVolume(res.stream, (lvl) => {
        setAudioLevel(lvl);
      });
      audioCleanupRef.current = cleanup;
    }

    const report = await compileReadinessReport({
      stream: res.stream,
      videoElement: previewVideoRef.current,
      currentAudioLevel: audioLevel,
      personaId: selectedPersona.id,
      userId: user?.uid,
      privacyAcknowledged,
    });
    setReadinessReport(report);

    setIsVerifyingMedia(false);
  };

  const handleResumeAfterHealthCheck = async () => {
    setHealthError(null);
    setIsHealthPaused(false);
  };

  const handleStartInterviewSession = async () => {
    // 1. Validate readiness
    const report = await compileReadinessReport({
      stream,
      videoElement: previewVideoRef.current,
      currentAudioLevel: audioLevel,
      personaId: selectedPersona.id,
      userId: user?.uid,
      privacyAcknowledged,
    });
    setReadinessReport(report);

    if (!report.canStartFullScreen) {
      setSessionError('Critical readiness checks must report PASS before entering the live session.');
      return;
    }

    if (!user) {
      setSessionError('You must be signed in to start an authenticated interview.');
      return;
    }

    try {
      setIsVerifyingMedia(true);
      const newSession = await createInterviewSession(
        {
          category: categoryParam,
          targetRole: roleParam,
          difficulty: difficultyParam,
          durationMinutes: 30,
          questionCount: 4,
          interviewerPersonaId: selectedPersona.id,
        },
        user.uid
      );

      setSession(newSession);
      setCurrentQuestionIndex(0);
      setFollowUpCount(0);
      setIsFollowUpActive(false);
      setStage('in_session');
    } catch (err: any) {
      setSessionError(err.message || 'Failed to initialize live interview session.');
    } finally {
      setIsVerifyingMedia(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Vocalization & Speech Recognition Handlers
  // ─────────────────────────────────────────────────────────────
  const speakInterviewerPrompt = (text: string, isFollowUp = false) => {
    stopSpeechSynthesis();
    if (avatarProviderRef.current) {
      avatarProviderRef.current.setExpressionState('speaking');
    }
    setInterviewerState('speaking');

    // Add to transcript
    const item: TranscriptItem = {
      id: `q_${Date.now()}`,
      sender: 'interviewer',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isFollowUp,
    };
    setTranscript((prev) => [...prev, item]);

    if (avatarProviderRef.current) {
      avatarProviderRef.current.speakQuestion(
        text,
        () => {
          setInterviewerState('speaking');
        },
        () => {
          setInterviewerState('listening');
          startListeningToCandidate();
        }
      );
    }
  };

  const startListeningToCandidate = () => {
    if (isMicMuted) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setInterimSpeech('');
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let finalChunk = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalChunk += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        if (finalChunk) {
          setCurrentTypedAnswer((prev) => (prev ? `${prev} ${finalChunk.trim()}` : finalChunk.trim()));
        }
        setInterimSpeech(interim);
      };

      recognition.onerror = (e: any) => {
        console.warn('[LiveInterview] Speech recognition notice:', e.error);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('[LiveInterview] Speech recognition init failed:', err);
    }
  };

  const stopListeningToCandidate = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setInterimSpeech('');
  };

  // ─────────────────────────────────────────────────────────────
  // Turn Submission & Adaptive Follow-Up Loop
  // ─────────────────────────────────────────────────────────────
  const handleSubmitCandidateAnswer = async () => {
    if (isProcessingAnswer || !session) return;

    stopListeningToCandidate();
    const answerText = `${currentTypedAnswer} ${interimSpeech}`.trim();

    if (answerText.length < 5) {
      setSessionError('Please provide a verbal or typed response before advancing.');
      return;
    }

    setIsProcessingAnswer(true);
    setSessionError(null);

    // Record student answer to transcript
    const studentItem: TranscriptItem = {
      id: `ans_${Date.now()}`,
      sender: 'student',
      text: answerText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setTranscript((prev) => [...prev, studentItem]);
    setCurrentTypedAnswer('');
    setInterimSpeech('');

    if (avatarProviderRef.current) {
      avatarProviderRef.current.setExpressionState('thinking');
    }
    setInterviewerState('thinking');

    try {
      const currentQ = session.questions[currentQuestionIndex];

      // 1. Check if we should trigger an adaptive follow-up
      if (!isFollowUpActive && followUpCount === 0) {
        const followUp = generateAdaptiveFollowUp(
          currentQ,
          answerText,
          session.category,
          followUpCount
        );

        if (followUp.hasFollowUp) {
          setFollowUpCount((prev) => prev + 1);
          setIsFollowUpActive(true);
          const transition = getConversationalTransition('follow_up', session.category);
          const fullFollowUpPrompt = `${transition} ${followUp.followUpText}`;
          setActiveQuestionText(followUp.followUpText);
          setIsProcessingAnswer(false);
          speakInterviewerPrompt(fullFollowUpPrompt, true);
          return;
        }
      }

      // 2. Submit answer to session store
      await submitInterviewAnswer(session.id, currentQ.id, answerText);

      // 3. Move to Next Question or Conclude
      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < session.questions.length) {
        setCurrentQuestionIndex(nextIndex);
        setFollowUpCount(0);
        setIsFollowUpActive(false);
        const nextQ = session.questions[nextIndex];
        const transition = getConversationalTransition('next_question', session.category);
        const fullNextPrompt = `${transition} ${nextQ.questionText}`;
        setActiveQuestionText(nextQ.questionText);
        setIsProcessingAnswer(false);
        speakInterviewerPrompt(fullNextPrompt, false);
      } else {
        // Session Complete!
        await concludeInterviewSession();
      }
    } catch (err: any) {
      console.error('[LiveInterview] Turn progression error:', err);
      setSessionError(err.message || 'Error processing response.');
      setIsProcessingAnswer(false);
    }
  };

  const handleInterruptInterviewer = () => {
    stopSpeechSynthesis();
    if (avatarProviderRef.current) {
      avatarProviderRef.current.setExpressionState('listening');
    }
    setInterviewerState('listening');
    startListeningToCandidate();
  };

  const concludeInterviewSession = async () => {
    setStage('evaluating');
    stopSpeechSynthesis();
    stopListeningToCandidate();
    if (stream) {
      stopMediaStream(stream);
      setStream(null);
    }
    if (avatarProviderRef.current) {
      avatarProviderRef.current.disconnect();
    }

    // Brief timeout for final scorecard generation animation
    setTimeout(() => {
      if (session) {
        navigate(`/interview/report/${session.id}`, { replace: true });
      } else {
        navigate('/interview', { replace: true });
      }
    }, 1800);
  };

  // Toggle Camera Track
  const handleToggleCamera = () => {
    if (!stream) return;
    const vTracks = stream.getVideoTracks();
    if (vTracks.length > 0) {
      const currentEnabled = vTracks[0].enabled;
      vTracks[0].enabled = !currentEnabled;
      setIsCameraPaused(currentEnabled);
    }
  };

  // Toggle Mic Track
  const handleToggleMic = () => {
    if (!stream) return;
    const aTracks = stream.getAudioTracks();
    if (aTracks.length > 0) {
      const currentEnabled = aTracks[0].enabled;
      aTracks[0].enabled = !currentEnabled;
      setIsMicMuted(currentEnabled);
      if (currentEnabled) {
        stopListeningToCandidate();
      } else if (interviewerState === 'listening') {
        startListeningToCandidate();
      }
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // ─────────────────────────────────────────────────────────────
  // RENDER: Evaluating Screen
  // ─────────────────────────────────────────────────────────────
  if (stage === 'evaluating') {
    return (
      <div className={styles.container} style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Card padding="lg" style={{ maxWidth: '480px', textAlign: 'center', backgroundColor: '#141418' }}>
          <Spinner size="lg" />
          <h2 style={{ fontSize: '1.25rem', color: '#FFFFFF', marginTop: '16px' }}>
            Compiling Official Evaluation Scorecard...
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#A1A1AA', lineHeight: 1.6 }}>
            Analyzing candidate responses against technical correctness, problem-solving structure, and communication clarity.
          </p>
        </Card>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER: Pre-flight Verification Screen
  // ─────────────────────────────────────────────────────────────
  if (stage === 'preflight') {
    return (
      <div className={styles.container}>
        <div className={styles.preflightWrap}>
          <div className={styles.preflightHeader}>
            <div>
              <h1 className={styles.title}>Live One-on-One Interview Setup</h1>
              <p className={styles.subtitle}>
                Pre-flight hardware verification for your live session with {selectedPersona.name}.
              </p>
            </div>
            <Link to="/interview/setup">
              <Button variant="secondary" size="sm" leftIcon={<ArrowLeft size={14} />}>
                Back to Setup
              </Button>
            </Link>
          </div>

          <Card className={styles.diagnosticCard} padding="lg">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <ShieldCheck size={18} color="#3B82F6" />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#FFFFFF' }}>
                Hardware Readiness & Privacy Guarantee
              </span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: '#A1A1AA', margin: 0, lineHeight: 1.5 }}>
              Live technical mock interviews require active camera and microphone participation. Video frames are processed locally inside your browser and are never streamed to third parties.
            </p>

            <div className={styles.stageGrid}>
              {/* Left Column: Live Camera Box */}
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#A1A1AA', textTransform: 'uppercase' }}>
                  Camera Preview
                </span>
                <div className={styles.previewBox} style={{ marginTop: '8px' }}>
                  {deviceReadiness.cameraActive && stream ? (
                    <video
                      ref={previewVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className={styles.previewVideo}
                    />
                  ) : (
                    <div className={styles.noVideoPlaceholder}>
                      <VideoOff size={32} />
                      <span>Camera preview inactive. Click 'Verify Devices' below.</span>
                    </div>
                  )}
                </div>

                {/* Live Microphone Audio Level Meter */}
                <div style={{ marginTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#A1A1AA' }}>
                    <span>Microphone Input Level</span>
                    <span>{audioLevel}%</span>
                  </div>
                  <div className={styles.audioMeter}>
                    <div className={styles.audioMeterFill} style={{ width: `${audioLevel}%` }} />
                  </div>
                </div>
              </div>

              {/* Right Column: Device Status & Persona Selection */}
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#A1A1AA', textTransform: 'uppercase' }}>
                  Device Diagnostics
                </span>
                <div className={styles.deviceStatusRow}>
                  <div className={styles.deviceItem}>
                    <div className={styles.deviceMeta}>
                      <Video size={16} color={deviceReadiness.hasCamera ? '#10B981' : '#A1A1AA'} />
                      <span>{deviceReadiness.cameraLabel || 'Webcam Camera'}</span>
                    </div>
                    <Badge variant={deviceReadiness.hasCamera ? 'success' : 'default'} size="sm">
                      {deviceReadiness.hasCamera ? 'Ready' : 'Not Connected'}
                    </Badge>
                  </div>

                  <div className={styles.deviceItem}>
                    <div className={styles.deviceMeta}>
                      <Mic size={16} color={deviceReadiness.hasMicrophone ? '#10B981' : '#A1A1AA'} />
                      <span>{deviceReadiness.microphoneLabel || 'Microphone Audio Input'}</span>
                    </div>
                    <Badge variant={deviceReadiness.hasMicrophone ? 'success' : 'default'} size="sm">
                      {deviceReadiness.hasMicrophone ? 'Ready' : 'Not Connected'}
                    </Badge>
                  </div>
                </div>

                <div style={{ marginTop: '16px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#A1A1AA', textTransform: 'uppercase' }}>
                    Select Female AI Interviewer Persona
                  </span>
                  <div className={styles.personaSelectRow}>
                    {INTERVIEWER_PERSONAS.filter((p) => p.gender === 'female').map((persona) => (
                      <div
                        key={persona.id}
                        className={`${styles.personaCard} ${
                          selectedPersona.id === persona.id ? styles.personaCardActive : ''
                        }`}
                        onClick={() => setSelectedPersona(persona)}
                      >
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: '#2563EB',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}
                        >
                          {persona.avatarInitials}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#FFFFFF' }}>
                            {persona.name}
                          </div>
                          <div style={{ fontSize: '0.6875rem', color: '#A1A1AA' }}>
                            {persona.id === 'elena' ? 'Systems Architect' : 'Algorithms Lead'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Strict Pre-Interview Readiness Gate Checklist */}
            <div className={styles.readinessSection}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Strict Pre-Interview Readiness Gate
                </span>
                <Badge variant={readinessReport?.canStartFullScreen ? 'success' : 'warning'} size="sm">
                  {readinessReport?.canStartFullScreen ? 'ALL CRITICAL CHECKS PASSED' : 'VERIFICATION REQUIRED'}
                </Badge>
              </div>

              <div className={styles.readinessGrid}>
                {readinessReport?.checks.map((item) => (
                  <div key={item.id} className={styles.checkItem}>
                    <div className={styles.checkItemMeta}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {item.status === 'PASS' ? (
                          <CheckCircle2 size={14} color="#10B981" />
                        ) : item.status === 'FAIL' ? (
                          <XCircle size={14} color="#EF4444" />
                        ) : (
                          <AlertCircle size={14} color="#F59E0B" />
                        )}
                        <span className={styles.checkLabel}>{item.label}</span>
                      </div>
                      <span className={styles.checkDetail}>{item.detail || item.description}</span>
                    </div>
                    <Badge
                      variant={item.status === 'PASS' ? 'success' : item.status === 'FAIL' ? 'error' : 'warning'}
                      size="sm"
                    >
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </div>

              {/* Privacy Notice & Local Frame Processing Acknowledgment */}
              <div style={{ marginTop: '16px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="privacyAgreement"
                  checked={privacyAcknowledged}
                  onChange={(e) => setPrivacyAcknowledged(e.target.checked)}
                  style={{ accentColor: '#2563EB', marginTop: '2px', cursor: 'pointer' }}
                />
                <label htmlFor="privacyAgreement" style={{ fontSize: '0.75rem', color: '#D4D4D8', lineHeight: 1.4, cursor: 'pointer' }}>
                  <strong>Local Media Privacy Guarantee:</strong> I understand that video frames and microphone signals are processed locally inside my browser for live visual preview. Video is not transmitted to third-party AI cloud storage.
                </label>
              </div>
            </div>

            {/* Error Banner with Troubleshooting Tips */}
            {(deviceReadiness.error || sessionError) && (
              <div className={styles.errorBanner} role="alert" style={{ marginTop: '16px' }}>
                <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Readiness Requirement:</strong> {deviceReadiness.error || sessionError}
                  <ul className={styles.troubleList}>
                    <li>Click the camera or lock icon on the left side of your browser URL bar.</li>
                    <li>Set 'Camera' and 'Microphone' permissions to 'Allow'.</li>
                    <li>Verify no background meeting app (Zoom, Teams, Meet) is locking the webcam.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className={styles.actionRow}>
              <Button
                variant="secondary"
                onClick={handleVerifyMedia}
                isLoading={isVerifyingMedia}
                leftIcon={<Video size={14} />}
              >
                {deviceReadiness.hasCamera && deviceReadiness.hasMicrophone ? 'Re-verify Devices' : 'Verify Camera & Mic'}
              </Button>
              <Button
                variant="primary"
                onClick={handleStartInterviewSession}
                disabled={!readinessReport?.canStartFullScreen || isVerifyingMedia}
                leftIcon={<Play size={15} />}
                style={{ fontWeight: 700 }}
              >
                Start Interview
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER: Live Video Interview Room
  // ─────────────────────────────────────────────────────────────
  const currentQ = session?.questions[currentQuestionIndex];

  return (
    <div
      ref={liveRoomRef}
      className={styles.liveRoom}
    >

      {/* Runtime Media Interruption Modal */}
      {isHealthPaused && (
        <div className={styles.pausedModalBackdrop} role="dialog" aria-modal="true">
          <div className={styles.pausedCard}>
            <AlertTriangle size={36} color="#EF4444" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#FFFFFF', margin: '0 0 8px' }}>
              Interview Paused: Hardware Interrupted
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#A1A1AA', lineHeight: 1.5, margin: '0 0 20px' }}>
              {healthError || 'A media stream track was disconnected. Your interview progress has been safely saved.'}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleVerifyMedia}
                leftIcon={<RefreshCw size={14} />}
              >
                Re-test Hardware
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleResumeAfterHealthCheck}
                leftIcon={<Play size={14} />}
              >
                Resume Interview
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header Bar */}
      <header className={styles.roomTopBar}>
        <div className={styles.roomTopLeft}>
          <div className={styles.liveBadge}>
            <span className={styles.liveDot} />
            <span className={styles.liveBadgeText}>LIVE</span>
          </div>
          <span className={styles.roomRoleText}>
            {roleParam}
          </span>
          <div className={styles.headerBadges}>
            <Badge variant="accent" size="sm">
              {categoryParam.toUpperCase()}
            </Badge>
            <Badge variant={difficultyParam} size="sm">
              {difficultyParam}
            </Badge>
          </div>
        </div>

        <div className={styles.roomTopRight}>
          <div className={styles.sessionTimerBox}>
            <Clock size={13} />
            <span>{formatTimer(sessionSeconds)}</span>
          </div>


          <Button
            variant={showTranscriptDrawer ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setShowTranscriptDrawer(!showTranscriptDrawer)}
            leftIcon={<FileText size={13} />}
            className={styles.headerActionBtn}
            title="Toggle Transcript Drawer"
          >
            <span className={styles.headerBtnLabel}>Transcript</span>
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={concludeInterviewSession}
            className={styles.endCallBtn}
            leftIcon={<PhoneOff size={13} />}
          >
            <span>End</span>
          </Button>
        </div>
      </header>

      {/* Main Studio Grid */}
      <div className={styles.roomGrid}>
        {/* Full-Stage Immersive Video Call Studio */}
        <div className={styles.stageArea}>
          <div className={styles.canvasContainer}>
            <canvas
              ref={canvasRef}
              width={1280}
              height={720}
              className={styles.avatarCanvas}
            />

            {/* Floating Question & Turn Status Banner */}
            <div className={styles.stageQuestionBanner}>
              <div className={styles.stageQuestionMeta}>
                <span>Q{currentQuestionIndex + 1} of {session?.questions.length || 4}</span>
                <span>•</span>
                <span>{currentQ?.topic || 'Technical Assessment'}</span>
                {isFollowUpActive && (
                  <>
                    <span>•</span>
                    <span style={{ color: '#FACC15', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Sparkles size={11} /> Adaptive Follow-up
                    </span>
                  </>
                )}
                <span>•</span>
                {interviewerState === 'speaking' ? (
                  <span className={`${styles.statusIndicatorPill} ${styles.statusSpeaking}`}>
                    <Radio size={11} /> Speaking
                  </span>
                ) : interviewerState === 'listening' ? (
                  <span className={`${styles.statusIndicatorPill} ${styles.statusListening}`}>
                    <Mic size={11} /> Listening
                  </span>
                ) : (
                  <span className={`${styles.statusIndicatorPill} ${styles.statusThinking}`}>
                    <Spinner size="sm" /> Evaluating
                  </span>
                )}
              </div>
              <h2 className={styles.stageQuestionText}>{activeQuestionText}</h2>
            </div>

            {/* Interviewer Persona Tag */}
            <div className={styles.interviewerOverlayTag}>
              <div className={styles.interviewerAvatarCircle}>
                {selectedPersona.avatarInitials}
              </div>
              <div>
                <div className={styles.interviewerNameText}>{selectedPersona.name}</div>
                <div className={styles.interviewerSubtext}>
                  {selectedPersona.title} • AI
                </div>
              </div>
            </div>

            {/* Candidate Webcam Preview (Picture-in-Picture) */}
            <div className={styles.pipStudentCam}>
              {stream && !isCameraPaused ? (
                <video
                  ref={pipVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={styles.pipVideo}
                />
              ) : (
                <div className={styles.pipPausedPlaceholder}>
                  Camera Paused
                </div>
              )}
              <div className={styles.pipOverlay}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Mic size={10} color={isMicMuted ? '#EF4444' : '#10B981'} />
                  <span className={styles.pipUserName}>{user?.displayName || 'You'}</span>
                </div>
                <div className={styles.pipAudioMeterBar}>
                  <div
                    style={{
                      width: `${audioLevel}%`,
                      height: '100%',
                      background: '#10B981',
                      transition: 'width 0.1s ease',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Floating Closed Captions Overlay [CC] */}
            {showCaptions && (
              <div className={styles.closedCaptionsBox} role="region" aria-label="Closed Captions">
                {interviewerState === 'speaking' ? (
                  <>
                    <span className={styles.captionSpeakerName}>{selectedPersona.name}:</span>
                    <span>"{activeQuestionText}"</span>
                  </>
                ) : interimSpeech || currentTypedAnswer ? (
                  <>
                    <span className={styles.captionSpeakerName} style={{ color: '#34D399' }}>You:</span>
                    <span className={styles.interimCaptionText}>"{interimSpeech || currentTypedAnswer}"</span>
                  </>
                ) : interviewerState === 'listening' ? (
                  <span style={{ color: '#A1A1AA', fontStyle: 'italic' }}>
                    Listening for your spoken response... (Speak naturally into your microphone)
                  </span>
                ) : (
                  <span style={{ color: '#C084FC', fontStyle: 'italic' }}>
                    Elena Vance is analyzing your answer and formulating technical evaluation...
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Floating Call Controls Bar */}
          <div className={styles.controlBar}>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleToggleMic}
              leftIcon={isMicMuted ? <MicOff size={14} color="#EF4444" /> : <Mic size={14} />}
              className={styles.controlIconBtn}
              title={isMicMuted ? 'Unmute Microphone' : 'Mute Microphone'}
            >
              <span className={styles.controlBtnText}>{isMicMuted ? 'Unmute' : 'Mute'}</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleToggleCamera}
              leftIcon={isCameraPaused ? <VideoOff size={14} color="#EF4444" /> : <Video size={14} />}
              className={styles.controlIconBtn}
              title={isCameraPaused ? 'Resume Camera' : 'Pause Camera'}
            >
              <span className={styles.controlBtnText}>{isCameraPaused ? 'Resume' : 'Pause'}</span>
            </Button>

            {interviewerState === 'speaking' && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleInterruptInterviewer}
                leftIcon={<Square size={13} color="#F59E0B" />}
                className={styles.controlIconBtn}
                title="Interrupt interviewer to start speaking"
                style={{ borderColor: 'rgba(245, 158, 11, 0.4)' }}
              >
                <span className={styles.controlBtnText}>Interrupt</span>
              </Button>
            )}

            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                if (activeQuestionText) {
                  speakInterviewerPrompt(activeQuestionText, isFollowUpActive);
                }
              }}
              leftIcon={<RotateCcw size={14} />}
              className={styles.controlIconBtn}
              title="Repeat Question"
            >
              <span className={styles.controlBtnText}>Repeat</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmitCandidateAnswer}
              isLoading={isProcessingAnswer}
              leftIcon={<Send size={14} />}
              className={`${styles.doneSpeakingBtn} ${
                interviewerState === 'listening' ? styles.doneSpeakingBtnActive : ''
              }`}
            >
              <span className={styles.doneBtnDesktop}>
                {isProcessingAnswer ? 'Evaluating...' : 'Done Speaking / Next'}
              </span>
              <span className={styles.doneBtnMobile}>
                {isProcessingAnswer ? 'Evaluating...' : 'Done / Next'}
              </span>
            </Button>

            <Button
              variant={showCaptions ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setShowCaptions(!showCaptions)}
              leftIcon={<Subtitles size={14} />}
              className={styles.controlIconBtn}
              title="Toggle Closed Captions"
            >
              <span className={styles.controlBtnText}>[CC] {showCaptions ? 'On' : 'Off'}</span>
            </Button>
          </div>
        </div>

        {/* Optional Slide-out Transcript & Notes Drawer */}
        {showTranscriptDrawer && (
          <div className={styles.transcriptDrawer} role="complementary" aria-label="Session Transcript">
            <div className={styles.drawerHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={16} color="#3B82F6" />
                <span className={styles.drawerTitle}>Session Transcript</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTranscriptDrawer(false)}
                style={{ padding: '4px', height: 'auto' }}
                title="Close Drawer"
              >
                <X size={16} />
              </Button>
            </div>

            {/* Chronological Transcript Items */}
            <div className={styles.transcriptPanel}>
              {transcript.map((item) => (
                <div
                  key={item.id}
                  className={`${styles.transcriptMsg} ${
                    item.sender === 'interviewer'
                      ? styles.transcriptInterviewer
                      : styles.transcriptStudent
                  }`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', opacity: 0.7, marginBottom: '2px' }}>
                    <span>{item.sender === 'interviewer' ? selectedPersona.name : 'You'}</span>
                    <span>{item.timestamp}</span>
                  </div>
                  <div>{item.text}</div>
                </div>
              ))}

              {interimSpeech && (
                <div className={styles.liveInterimBox}>
                  <Radio size={14} style={{ flexShrink: 0 }} />
                  <span>"{interimSpeech}..."</span>
                </div>
              )}

              <div ref={transcriptEndRef} />
            </div>

            {/* Accessibility fallback: Optional keyboard typing */}
            <div className={styles.inputFallbackArea}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmitCandidateAnswer();
                }}
                className={styles.typingForm}
              >
                <input
                  type="text"
                  value={currentTypedAnswer}
                  onChange={(e) => setCurrentTypedAnswer(e.target.value)}
                  placeholder="Accessibility: Type response..."
                  className={styles.textInput}
                />
                <Button
                  type="submit"
                  variant="secondary"
                  size="sm"
                  disabled={isProcessingAnswer || !currentTypedAnswer.trim()}
                >
                  Send
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

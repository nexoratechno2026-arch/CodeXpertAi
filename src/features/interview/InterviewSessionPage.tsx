import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Clock,
  Send,
  AlertCircle,
  HelpCircle,
  ArrowLeft,
  CheckCircle,
  Sparkles,
  Volume2,
  VolumeX,
  RotateCcw,
  Mic,
  MicOff,
  Radio,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import {
  InterviewSession,
  InterviewQuestion,
  getInterviewerPersona,
} from '@/types/interview';
import { getSkillLevelLabel } from '@/types/skill';
import {
  getInterviewSession,
  submitInterviewAnswer,
  saveAnswerDraft,
  getAnswerDraft,
} from '@/services/interviewService';
import { speakText, stopSpeechSynthesis } from '@/services/voiceChatService';
import styles from './InterviewSession.module.css';

export const InterviewSessionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [draftSavedTime, setDraftSavedTime] = useState<string | null>(null);

  // Speech and dictation states
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const [dictateError, setDictateError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // Remaining simulated time display
  const [secondsRemaining, setSecondsRemaining] = useState<number>(1800);

  const draftTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Stop any active speech on unmount
  useEffect(() => {
    return () => {
      stopSpeechSynthesis();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  useEffect(() => {
    async function loadSession() {
      if (!id) return;
      try {
        setLoading(true);
        const data = await getInterviewSession(id);
        if (!data) {
          setError('Interview session not found or access expired.');
          return;
        }

        setSession(data);
        setSecondsRemaining(data.durationMinutes * 60);

        if (data.status === 'completed') {
          navigate(`/interview/report/${data.id}`, { replace: true });
          return;
        }

        // Load existing draft or answer
        const currentQ = data.questions[data.currentQuestionIndex];
        if (currentQ) {
          const draft = getAnswerDraft(data.id, currentQ.id);
          const savedAns = data.answers[currentQ.id]?.answerText || '';
          setCurrentAnswer(draft || savedAns);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load session.');
      } finally {
        setLoading(false);
      }
    }

    loadSession();
  }, [id, navigate]);

  // Handle countdown display (purely advisory display)
  useEffect(() => {
    if (loading || !session || session.status !== 'in_progress') return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [loading, session]);

  // Handle draft autosave
  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCurrentAnswer(val);

    if (!session) return;
    const currentQ = session.questions[session.currentQuestionIndex];
    if (!currentQ) return;

    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    draftTimerRef.current = setTimeout(() => {
      saveAnswerDraft(session.id, currentQ.id, val);
      setDraftSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 500);
  };

  const handleSubmit = async () => {
    if (!session) return;
    const currentQ = session.questions[session.currentQuestionIndex];
    if (!currentQ) return;

    const trimmed = currentAnswer.trim();
    if (trimmed.length < 5) {
      setSubmitError('Please provide a substantive answer (at least 5 characters).');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const result = await submitInterviewAnswer(session.id, currentQ.id, trimmed);

      if (result.isComplete) {
        // Session complete, navigate to report
        navigate(`/interview/report/${session.id}`);
      } else {
        // Advance to next question
        setSession(result.session);
        const nextQ = result.session.questions[result.session.currentQuestionIndex];
        const draft = getAnswerDraft(result.session.id, nextQ.id);
        setCurrentAnswer(draft || '');
        setDraftSavedTime(null);
      }
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const persona = getInterviewerPersona(session?.interviewerPersonaId);

  const handleSpeakQuestion = () => {
    const currentQ = session?.questions[session?.currentQuestionIndex || 0];
    if (!currentQ) return;
    if (isSpeaking) {
      stopSpeechSynthesis();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    const spokenText = `${currentQ.topic}. ${currentQ.questionText}${currentQ.scenario ? `. Scenario: ${currentQ.scenario}` : ''}`;
    speakText(spokenText, {
      pitch: persona.gender === 'female' ? 1.15 : 0.95,
      rate: 1.0,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleStopSpeech = () => {
    stopSpeechSynthesis();
    setIsSpeaking(false);
  };

  const handleToggleDictation = () => {
    setDictateError(null);
    if (isDictating) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsDictating(false);
      return;
    }

    const SpeechRecognition =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setDictateError('Speech recognition is not supported in this browser. Please type your response directly in the text editor.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = true;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsDictating(true);
        setDictateError(null);
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          setCurrentAnswer((prev) => (prev ? `${prev} ${transcript.trim()}` : transcript.trim()));
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onerror = (e: any) => {
        if (e.error === 'not-allowed') {
          setDictateError('Microphone permission was denied. Please allow microphone access or type your response directly.');
        } else {
          setDictateError(`Speech recognition error (${e.error || 'unknown'}).`);
        }
        setIsDictating(false);
      };

      recognition.onend = () => {
        setIsDictating(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: unknown) {
      setDictateError(err instanceof Error ? err.message : 'Could not initialize microphone input.');
      setIsDictating(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Card padding="lg" className={styles.evaluatingScreen}>
          <Spinner size="lg" />
          <h2 className={styles.evaluatingTitle}>Loading Interview Session...</h2>
          <p className={styles.evaluatingDesc}>
            Connecting to session storage and preparing your adaptive interview environment.
          </p>
        </Card>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className={styles.container}>
        <Card padding="lg" className={styles.evaluatingScreen}>
          <AlertCircle size={36} color="#ef4444" />
          <h2 className={styles.evaluatingTitle}>Session Unavailable</h2>
          <p className={styles.evaluatingDesc}>
            {error || 'Unable to retrieve the requested interview session.'}
          </p>
          <Link to="/interview">
            <Button variant="primary">Return to Interview Overview</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (session.status === 'evaluating') {
    return (
      <div className={styles.container}>
        <Card padding="lg" className={styles.evaluatingScreen}>
          <Spinner size="lg" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="#3b82f6" />
            <h2 className={styles.evaluatingTitle}>AI Evaluation Engine in Progress</h2>
          </div>
          <p className={styles.evaluatingDesc}>
            Your responses are being analyzed against multi-dimensional technical, reasoning, and clarity rubrics.
            Generating your comprehensive evaluation scorecard now...
          </p>
        </Card>
      </div>
    );
  }

  const currentQIndex = session.currentQuestionIndex;
  const currentQ: InterviewQuestion | undefined = session.questions[currentQIndex];
  const totalQuestions = session.questions.length;
  const progressPercent = Math.round(((currentQIndex) / totalQuestions) * 100);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const wordCount = currentAnswer.trim() ? currentAnswer.trim().split(/\s+/).length : 0;
  const charCount = currentAnswer.length;
  const isLastQuestion = currentQIndex === totalQuestions - 1;

  return (
    <div className={styles.container}>
      {/* Top Header Bar */}
      <div className={styles.topBar}>
        <div className={styles.metaGroup}>
          <Link to="/interview">
            <Button variant="secondary" size="sm" leftIcon={<ArrowLeft size={14} />}>
              Exit
            </Button>
          </Link>
          <span className={styles.roleTitle}>{session.targetRole}</span>
          <Badge variant="accent" size="sm">
            {session.category.toUpperCase()}
          </Badge>
          <Badge variant={session.difficulty} size="sm">
            {getSkillLevelLabel(session.difficulty)}
          </Badge>
        </div>

        <div className={styles.timerCard}>
          <Clock size={15} color="#3b82f6" />
          <span>Session Timer: {formatTimer(secondsRemaining)}</span>
          <span className={styles.timerNotice}>(Advisory)</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className={styles.progressBarContainer}>
        <div className={styles.progressLabels}>
          <span>
            Question {currentQIndex + 1} of {totalQuestions}
          </span>
          <span>{progressPercent}% Completed</span>
        </div>
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* Active AI Interviewer Banner */}
      <div className={styles.interviewerBanner}>
        <div className={styles.interviewerInfo}>
          <div
            className={`${styles.interviewerAvatar} ${
              persona.gender === 'female' ? styles.interviewerAvatarFemale : styles.interviewerAvatarMale
            }`}
          >
            {persona.avatarInitials}
          </div>
          <div className={styles.interviewerDetails}>
            <div className={styles.interviewerName}>
              <span>{persona.name}</span>
              <Badge variant={persona.gender === 'female' ? 'accent' : 'default'} size="sm">
                {persona.gender === 'female' ? 'Female AI Interviewer' : 'AI Interviewer'}
              </Badge>
              {isSpeaking && (
                <span className={styles.speakingIndicator}>
                  <Radio size={12} /> Speaking question...
                </span>
              )}
            </div>
            <span className={styles.interviewerTitle}>{persona.title}</span>
            <span className={styles.simNotice}>AI simulation for student practice — not a real human interviewer.</span>
          </div>
        </div>

        <div className={styles.interviewerVoiceControls}>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleSpeakQuestion}
            leftIcon={isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
          >
            {isSpeaking ? 'Stop Voice' : 'Listen to Question'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              handleStopSpeech();
              setTimeout(handleSpeakQuestion, 150);
            }}
            leftIcon={<RotateCcw size={14} />}
            title="Repeat Question from Start"
          >
            Repeat
          </Button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      {currentQ && (
        <div className={styles.sessionGrid}>
          {/* Left Column: Question Details */}
          <Card padding="md" className={styles.questionCard}>
            <div className={styles.qHeader}>
              <span className={styles.qTopic}>Topic: {currentQ.topic}</span>
              <Badge variant="default" size="sm">
                Score Cap: {currentQ.maxScore || 100} pts
              </Badge>
            </div>

            <h2 className={styles.qText}>{currentQ.questionText}</h2>

            {currentQ.scenario && (
              <div className={styles.scenarioBox}>
                <strong>Scenario Context:</strong>
                <div>{currentQ.scenario}</div>
              </div>
            )}

            <div className={styles.rubricTip}>
              <HelpCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Evaluation Guidance:</strong> Provide a structured, reasoned explanation.
                For technical scenarios, address architecture, edge cases, and computational trade-offs.
              </div>
            </div>

            {currentQ.evaluationCriteria && currentQ.evaluationCriteria.length > 0 && (
              <div className={styles.criteriaList}>
                <span className={styles.criteriaTitle}>Key Assessment Dimensions</span>
                {currentQ.evaluationCriteria.map((c, i) => (
                  <div key={i} className={styles.criteriaItem}>
                    <div className={styles.criteriaDot} />
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Right Column: Answer Area */}
          <Card padding="md" className={styles.answerCard}>
            <div className={styles.answerHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span className={styles.answerLabel}>Your Response</span>
                <button
                  type="button"
                  className={`${styles.micDictateBtn} ${isDictating ? styles.micDictateActive : ''}`}
                  onClick={handleToggleDictation}
                  title="Dictate response with microphone (local processing, text fallback always active)"
                >
                  {isDictating ? <MicOff size={13} /> : <Mic size={13} />}
                  <span>{isDictating ? 'Stop Recording' : 'Dictate with Mic'}</span>
                </button>
              </div>

              {draftSavedTime && (
                <span className={styles.draftStatus}>
                  <CheckCircle size={12} color="#22c55e" />
                  Draft buffered ({draftSavedTime})
                </span>
              )}
            </div>

            {dictateError && (
              <div className={styles.errorBanner} style={{ marginBottom: '8px' }}>
                <AlertCircle size={14} />
                <span>{dictateError}</span>
              </div>
            )}

            <textarea
              className={styles.textarea}
              placeholder="Structure your answer clearly. Break down your reasoning, mention alternatives or trade-offs, and cite relevant industry practices..."
              value={currentAnswer}
              onChange={handleAnswerChange}
              disabled={isSubmitting}
            />

            {submitError && (
              <div className={styles.errorBanner}>
                <AlertCircle size={14} />
                <span>{submitError}</span>
              </div>
            )}

            <div className={styles.textareaFooter}>
              <div className={styles.counts}>
                <span>{wordCount} words</span>
                <span>•</span>
                <span>{charCount} / 8000 chars</span>
              </div>

              <div className={styles.actions}>
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={isSubmitting || currentAnswer.trim().length < 5}
                  rightIcon={
                    isSubmitting ? (
                      <Spinner size="sm" />
                    ) : (
                      <Send size={14} />
                    )
                  }
                >
                  {isSubmitting
                    ? 'Submitting & Evaluating...'
                    : isLastQuestion
                    ? 'Submit & Generate Final Evaluation'
                    : 'Submit & Next Question'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

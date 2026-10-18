import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  ArrowRight,
  BrainCircuit,
  MessageSquare,
  RotateCcw,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { VoiceAnswerInput } from '@/components/interview/VoiceAnswerInput';
import { useAuth } from '@/contexts/AuthContext';
import {
  createSimulatorSession,
  submitSimulatorAnswer,
  submitFollowUpAnswer,
  completeSimulatorSession,
  getActiveLocalSimulatorSession,
} from '@/services/simulatorService';
import { SimulatorConfig, SimulatorSession } from '@/types/simulator';
import { InterviewCategory } from '@/types/interview';
import { SkillLevel } from '@/types/skill';
import styles from './Simulator.module.css';

export const InterviewSimulatorPage: React.FC = () => {
  const { user, profile } = useAuth();

  const [session, setSession] = useState<SimulatorSession | null>(() =>
    user ? getActiveLocalSimulatorSession(user.uid) : null
  );

  // Setup form states
  const [targetRole, setTargetRole] = useState(profile?.targetRole || 'Software Engineer');
  const [category, setCategory] = useState<InterviewCategory>('technical');
  const [difficulty, setDifficulty] = useState<SkillLevel>('intermediate');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [questionCount, setQuestionCount] = useState(3);
  const [isTimed, setIsTimed] = useState(true);
  const [allowVoice, setAllowVoice] = useState(true);

  // Answering states
  const [currentAnswerText, setCurrentAnswerText] = useState('');
  const [audioTranscriptUsed, setAudioTranscriptUsed] = useState(false);
  const [followUpAnswerText, setFollowUpAnswerText] = useState('');
  const [timeLeftSecs, setTimeLeftSecs] = useState<number | null>(null);

  // Timer countdown
  useEffect(() => {
    if (!session || session.status !== 'in_progress' || !session.config.isTimed) {
      return;
    }

    const interval = setInterval(() => {
      const remainingMs = new Date(session.expiresAt).getTime() - Date.now();
      if (remainingMs <= 0) {
        setTimeLeftSecs(0);
        // Automatically mark complete when time expires
        completeSimulatorSession(session).then((s) => setSession({ ...s, status: 'timed_out' }));
        clearInterval(interval);
      } else {
        setTimeLeftSecs(Math.floor(remainingMs / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session]);

  const handleStartSession = () => {
    if (!user) return;
    const config: SimulatorConfig = {
      targetRole,
      category,
      difficulty,
      durationMinutes,
      questionCount,
      isTimed,
      allowVoice,
    };
    const newSession = createSimulatorSession(user.uid, config);
    setSession(newSession);
    setCurrentAnswerText('');
    setAudioTranscriptUsed(false);
  };

  const currentQuestion = session?.questions[session.currentQuestionIndex];
  const currentAnswerRecord = currentQuestion ? session?.answers[currentQuestion.id] : undefined;

  const handleSubmitMainAnswer = () => {
    if (!session || !currentQuestion || !currentAnswerText.trim()) return;
    const { session: updated } = submitSimulatorAnswer(
      session,
      currentQuestion.id,
      currentAnswerText,
      audioTranscriptUsed
    );
    setSession(updated);
  };

  const handleSubmitFollowUp = () => {
    if (!session || !followUpAnswerText.trim()) return;
    const updated = submitFollowUpAnswer(session, followUpAnswerText);
    setSession(updated);
    setFollowUpAnswerText('');
  };

  const handleNextQuestion = () => {
    if (!session) return;
    const nextIdx = session.currentQuestionIndex + 1;
    if (nextIdx < session.questions.length) {
      setSession({
        ...session,
        currentQuestionIndex: nextIdx,
        activeFollowUp: undefined,
      });
      setCurrentAnswerText('');
      setAudioTranscriptUsed(false);
      setFollowUpAnswerText('');
    } else {
      completeSimulatorSession(session).then(setSession);
    }
  };

  const formatTime = (totalSecs: number | null) => {
    if (totalSecs === null || totalSecs <= 0) return '00:00';
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // ── VIEW 1: CONFIGURATION ──
  if (!session || session.status === 'created') {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <BrainCircuit size={22} color="#3b82f6" />
              <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#f5f5f5' }}>
                Advanced Interview Simulator
              </h1>
            </div>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#a1a1aa' }}>
              Configure a realistic mock technical screening. Practice articulating problem-solving under
              timed conditions with interactive follow-up questions.
            </p>
          </div>
          <Badge variant="accent" size="md">
            Simulation Engine Active
          </Badge>
        </div>

        <Card padding="lg">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', color: '#a1a1aa', marginBottom: '6px' }}>
                Target Career Role
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: '#111',
                  border: '1px solid #292929',
                  borderRadius: '6px',
                  color: '#f5f5f5',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', color: '#a1a1aa', marginBottom: '6px' }}>
                  Interview Domain
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as InterviewCategory)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: '#111',
                    border: '1px solid #292929',
                    borderRadius: '6px',
                    color: '#f5f5f5',
                  }}
                >
                  <option value="technical">Technical Core & Architecture</option>
                  <option value="programming">Algorithms & Live Coding</option>
                  <option value="sql">SQL & Database Design</option>
                  <option value="behavioral">Behavioral (STAR Method)</option>
                  <option value="hr">HR & Cultural Fit</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', color: '#a1a1aa', marginBottom: '6px' }}>
                  Difficulty Tier
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as SkillLevel)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: '#111',
                    border: '1px solid #292929',
                    borderRadius: '6px',
                    color: '#f5f5f5',
                  }}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate (Standard)</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', color: '#a1a1aa', marginBottom: '6px' }}>
                  Duration (Minutes)
                </label>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: '#111',
                    border: '1px solid #292929',
                    borderRadius: '6px',
                    color: '#f5f5f5',
                  }}
                >
                  <option value={15}>15 Minutes (Express)</option>
                  <option value={30}>30 Minutes (Standard)</option>
                  <option value={45}>45 Minutes (Full)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', color: '#a1a1aa', marginBottom: '6px' }}>
                  Question Count
                </label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: '#111',
                    border: '1px solid #292929',
                    borderRadius: '6px',
                    color: '#f5f5f5',
                  }}
                >
                  <option value={3}>3 Questions</option>
                  <option value={5}>5 Questions</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', paddingTop: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: '#f5f5f5', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isTimed}
                  onChange={(e) => setIsTimed(e.target.checked)}
                />
                Enforce Timed Session (Server Deadline)
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: '#f5f5f5', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={allowVoice}
                  onChange={(e) => setAllowVoice(e.target.checked)}
                />
                Enable Voice Dictation (Microphone)
              </label>
            </div>

            <div style={{ paddingTop: '1rem' }}>
              <Button variant="primary" style={{ width: '100%' }} size="lg" onClick={handleStartSession}>
                Launch Mock Simulation
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // ── VIEW 2: COMPLETED SCORECARD ──
  if (session.status === 'completed' || session.status === 'timed_out') {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={24} color="#22c55e" />
              <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#f5f5f5' }}>
                Simulation Scorecard: {session.config.targetRole}
              </h1>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: '#a1a1aa' }}>
              {session.overallSummary}
            </p>
          </div>

          <Badge variant={session.overallScore && session.overallScore >= 75 ? 'success' : 'warning'} size="md">
            {session.overallScore}% Overall Score
          </Badge>
        </div>

        <div className={styles.scorecardGrid}>
          <div className={styles.metricCard}>
            <span style={{ fontSize: '0.75rem', color: '#71717a' }}>COMPLETION STATUS</span>
            <div className={styles.metricVal}>
              {session.status === 'timed_out' ? 'Timed Out' : 'Verified'}
            </div>
          </div>
          <div className={styles.metricCard}>
            <span style={{ fontSize: '0.75rem', color: '#71717a' }}>QUESTIONS EVALUATED</span>
            <div className={styles.metricVal}>
              {Object.keys(session.answers).length} / {session.questions.length}
            </div>
          </div>
          <div className={styles.metricCard}>
            <span style={{ fontSize: '0.75rem', color: '#71717a' }}>ROLE ALIGNMENT</span>
            <div className={styles.metricVal} style={{ fontSize: '1.125rem' }}>
              {session.config.targetRole}
            </div>
          </div>
        </div>

        {/* Detailed Question Answers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {session.questions.map((q, idx) => {
            const ans = session.answers[q.id];
            return (
              <Card key={q.id} padding="lg">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.8125rem', color: '#3b82f6', fontWeight: 600 }}>
                    Question {idx + 1}
                  </span>
                  {ans?.score !== undefined && (
                    <Badge variant={ans.score >= 75 ? 'success' : 'warning'} size="sm">
                      {ans.score}/100
                    </Badge>
                  )}
                </div>

                <h3 style={{ fontSize: '1rem', color: '#f5f5f5', margin: '0 0 10px 0' }}>{q.text}</h3>

                {ans ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ padding: '10px', backgroundColor: '#111', borderRadius: '6px', fontSize: '0.875rem', color: '#d4d4d8' }}>
                      <strong>Your Answer:</strong> {ans.studentAnswer}
                    </div>

                    {ans.feedback && (
                      <div style={{ fontSize: '0.8125rem', color: '#a1a1aa' }}>
                        <strong>Feedback:</strong> {ans.feedback}
                      </div>
                    )}

                    {ans.followUpAnswer && (
                      <div style={{ padding: '8px 12px', backgroundColor: 'rgba(59, 130, 246, 0.05)', borderLeft: '3px solid #3b82f6', borderRadius: '4px', fontSize: '0.8125rem' }}>
                        <div style={{ color: '#93c5fd', fontWeight: 600 }}>Follow-Up Answered:</div>
                        <div style={{ color: '#d4d4d8' }}>{ans.followUpAnswer.studentAnswer}</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <span style={{ fontSize: '0.8125rem', color: '#71717a' }}>No answer submitted.</span>
                )}
              </Card>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <Button
            variant="primary"
            onClick={() => setSession(null)}
            leftIcon={<RotateCcw size={14} />}
          >
            Start Another Simulation
          </Button>
          <Link to="/interview">
            <Button variant="secondary">
              Return to Interview Hub
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // ── VIEW 3: IN-PROGRESS SESSION ──
  return (
    <div className={styles.container}>
      {/* Session Header */}
      <div className={styles.header}>
        <div>
          <span style={{ fontSize: '0.75rem', color: '#71717a', textTransform: 'uppercase' }}>
            Question {session.currentQuestionIndex + 1} of {session.questions.length} • {session.config.targetRole}
          </span>
          <h1 style={{ margin: '4px 0 0 0', fontSize: '1.25rem', color: '#f5f5f5' }}>
            Live Mock Screening
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {session.config.isTimed && (
            <div className={styles.timerBadge}>
              <Clock size={14} />
              <span>{formatTime(timeLeftSecs)}</span>
            </div>
          )}
          <Badge variant="accent" size="sm">
            {session.config.category}
          </Badge>
        </div>
      </div>

      {/* Main Question Card */}
      {currentQuestion && (
        <Card padding="lg" className={styles.questionCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h2 style={{ fontSize: '1.125rem', color: '#f5f5f5', margin: 0, lineHeight: 1.5 }}>
              {currentQuestion.text}
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.6875rem', color: '#71717a' }}>Expected Concepts:</span>
            {currentQuestion.expectedConcepts.map((concept) => (
              <span
                key={concept}
                style={{
                  fontSize: '0.6875rem',
                  color: '#9ca3af',
                  backgroundColor: '#1f2937',
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}
              >
                {concept}
              </span>
            ))}
          </div>

          {/* Answer Input */}
          {!currentAnswerRecord ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <VoiceAnswerInput
                value={currentAnswerText}
                onChange={setCurrentAnswerText}
                onAudioUsed={setAudioTranscriptUsed}
                placeholder="Formulate your response with clear trade-offs, edge-cases, and reasoning..."
              />
              <div>
                <Button
                  variant="primary"
                  onClick={handleSubmitMainAnswer}
                  disabled={currentAnswerText.trim().length === 0}
                >
                  Submit Answer for Evaluation
                </Button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '12px', backgroundColor: '#111', borderRadius: '6px', fontSize: '0.875rem', color: '#f5f5f5', border: '1px solid #292929' }}>
                <div style={{ fontSize: '0.75rem', color: '#71717a', marginBottom: '4px' }}>SUBMITTED RESPONSE</div>
                {currentAnswerRecord.studentAnswer}
              </div>

              {currentAnswerRecord.feedback && (
                <div style={{ padding: '12px', backgroundColor: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: '#22c55e', fontWeight: 600, marginBottom: '4px' }}>
                    <CheckCircle2 size={16} /> Evaluation Score: {currentAnswerRecord.score}/100
                  </div>
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: '#d4d4d8' }}>
                    {currentAnswerRecord.feedback}
                  </p>
                </div>
              )}

              {/* Follow-Up Card if active */}
              {session.activeFollowUp && !currentAnswerRecord.followUpAnswer && (
                <div className={styles.followUpBox}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#93c5fd', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                    <MessageSquare size={16} /> Interviewer Follow-Up Question
                  </div>
                  <p style={{ margin: '0 0 10px 0', fontSize: '0.875rem', color: '#f5f5f5' }}>
                    {session.activeFollowUp.questionText}
                  </p>
                  <VoiceAnswerInput
                    value={followUpAnswerText}
                    onChange={setFollowUpAnswerText}
                    placeholder="Address the follow-up question..."
                  />
                  <div style={{ marginTop: '8px' }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleSubmitFollowUp}
                      disabled={followUpAnswerText.trim().length === 0}
                    >
                      Submit Follow-Up Response
                    </Button>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
                <Button
                  variant="primary"
                  onClick={handleNextQuestion}
                  rightIcon={<ArrowRight size={14} />}
                >
                  {session.currentQuestionIndex + 1 < session.questions.length ? 'Next Question' : 'Complete Simulation'}
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

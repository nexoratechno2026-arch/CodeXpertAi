import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  Code2,
  AlertCircle,
  Printer,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { InterviewSession, EvaluationReport } from '@/types/interview';
import { getSkillLevelLabel } from '@/types/skill';
import { getInterviewSession } from '@/services/interviewService';
import { useAuth } from '@/contexts/AuthContext';
import styles from './InterviewReport.module.css';

export const InterviewReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const candidateName = profile?.fullName || user?.displayName || 'Student Candidate';

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadReport() {
      if (!id) return;
      try {
        setLoading(true);
        const data = await getInterviewSession(id);
        if (!data) {
          setError('Interview report not found.');
          return;
        }

        setSession(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load report.');
      } finally {
        setLoading(false);
      }
    }

    loadReport();
  }, [id]);

  if (loading) {
    return (
      <div className={styles.container}>
        <Card padding="lg" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <Spinner size="lg" />
          <h2 style={{ marginTop: '1rem', color: '#f3f4f6' }}>Loading Evaluation Report...</h2>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
            Compiling rubric criteria, candidate responses, and CodeLab learning trajectories...
          </p>
        </Card>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className={styles.container}>
        <Card padding="lg" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <AlertCircle size={36} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ color: '#f3f4f6' }}>Report Not Available</h2>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            {error || 'Unable to locate an evaluation report for this session.'}
          </p>
          <Link to="/interview">
            <Button variant="primary">Return to Interview Overview</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const report: EvaluationReport | undefined = session.report;

  if (!report) {
    return (
      <div className={styles.container}>
        <Card padding="lg" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <AlertCircle size={36} color="#f59e0b" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ color: '#f3f4f6' }}>Evaluation Incomplete</h2>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            This interview session is marked as &quot;{session.status}&quot; and does not have a finalized report yet.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            {session.status === 'in_progress' && (
              <Link to={`/interview/session/${session.id}`}>
                <Button variant="primary">Resume Session</Button>
              </Link>
            )}
            <Link to="/interview">
              <Button variant="secondary">Back to Overview</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const getTierVariant = (tier: string) => {
    switch (tier) {
      case 'Exceptional':
        return 'success';
      case 'Strong':
        return 'accent';
      case 'Developing':
        return 'warning';
      default:
        return 'error';
    }
  };

  return (
    <div className={styles.container}>
      {/* Header Bar */}
      <div className={styles.headerBar}>
        <div className={styles.headerLeft}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link to="/interview">
              <Button variant="secondary" size="sm" leftIcon={<ArrowLeft size={14} />}>
                Interview Hub
              </Button>
            </Link>
            <Badge variant="accent" size="sm">
              {report.category.toUpperCase()}
            </Badge>
            <Badge variant={report.difficulty} size="sm">
              {getSkillLevelLabel(report.difficulty)}
            </Badge>
          </div>
          <h1 className={styles.title}>Interview Performance Assessment</h1>
          <p className={styles.subtitle}>
            Comprehensive diagnostic scorecard for <strong>{report.targetRole}</strong>.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} className={styles.noPrint}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.print()}
            leftIcon={<Printer size={14} />}
            title="Open browser print dialog or save as clean PDF"
          >
            Print / Export Report
          </Button>

          {report.isMockAI ? (
            <Badge variant="warning" size="sm">
              Development AI Mode (Simulated Rubric)
            </Badge>
          ) : (
            <Badge variant="success" size="sm">
              Live AI Provider Evaluated
            </Badge>
          )}
        </div>
      </div>

      {/* Main Scorecard Banner */}
      <Card padding="md" className={styles.scoreCard}>
        <div className={styles.scoreVisual}>
          <div className={styles.scoreNumber}>{report.overallScore}</div>
          <span className={styles.scoreMax}>Overall Score (0–100)</span>
          <Badge variant={getTierVariant(report.performanceTier)} size="md">
            {report.performanceTier}
          </Badge>
        </div>

        <div className={styles.scoreMeta}>
          <div className={styles.tierRow}>
            <span className={styles.tierLabel}>Assessment Tier: {report.performanceTier}</span>
          </div>

          <div className={styles.metaGrid}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Candidate</span>
              <span className={styles.metaValue}>{candidateName}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Target Role</span>
              <span className={styles.metaValue}>{report.targetRole}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Questions</span>
              <span className={styles.metaValue}>{report.questionEvaluations.length} Answered</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Evaluation Date</span>
              <span className={styles.metaValue}>
                {new Date(report.completedAt).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Duration</span>
              <span className={styles.metaValue}>{session.durationMinutes} Minutes</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Strengths & Improvements */}
      <div className={styles.insightsGrid}>
        <Card padding="md" className={styles.insightCard}>
          <div className={styles.insightHeader}>
            <CheckCircle2 size={18} className={styles.strengthIcon} />
            <span>Key Demonstrated Strengths</span>
          </div>
          <ul className={styles.bulletList}>
            {report.topStrengths.map((str, idx) => (
              <li key={idx}>{str}</li>
            ))}
          </ul>
        </Card>

        <Card padding="md" className={styles.insightCard}>
          <div className={styles.insightHeader}>
            <AlertTriangle size={18} className={styles.improvementIcon} />
            <span>Areas for Targeted Growth</span>
          </div>
          <ul className={styles.bulletList}>
            {report.criticalImprovements.map((imp, idx) => (
              <li key={idx}>{imp}</li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Category Criteria Breakdown */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Rubric Criteria Breakdown</h2>
        <div className={styles.criteriaGrid}>
          {report.criteriaBreakdown.map((crit, idx) => (
            <Card key={idx} padding="md" className={styles.criteriaCard}>
              <div className={styles.criteriaTop}>
                <span>{crit.name}</span>
                <span>{crit.score} / {crit.maxScore}</span>
              </div>
              <div className={styles.criteriaBar}>
                <div
                  className={styles.criteriaFill}
                  style={{ width: `${Math.min(100, (crit.score / crit.maxScore) * 100)}%` }}
                />
              </div>
              <p className={styles.criteriaFeedback}>{crit.feedback}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Detailed Question Review */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Per-Question Diagnostic Review</h2>
        <div className={styles.reviewList}>
          {report.questionEvaluations.map((qEval, idx) => {
            const questionData = session.questions[idx];
            return (
              <Card key={idx} padding="md" className={styles.questionReviewCard}>
                <div className={styles.qReviewHeader}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase' }}>
                      Question {idx + 1} • {questionData?.topic || 'General'}
                    </span>
                    <h3 className={styles.qReviewTitle}>
                      {questionData?.questionText || `Question ${idx + 1}`}
                    </h3>
                  </div>
                  <Badge variant="accent" size="sm">
                    Score: {qEval.overallScore} / 100
                  </Badge>
                </div>

                {/* Candidate Answer */}
                <div className={styles.candidateAnswerBox}>
                  <span className={styles.boxLabel}>Your Response ({qEval.wordCount} words)</span>
                  <div className={styles.answerContent}>{qEval.candidateAnswer}</div>
                </div>

                {/* Evaluator Notes */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                  {qEval.strengths.length > 0 && (
                    <div style={{ fontSize: '0.8125rem', color: '#86efac' }}>
                      <strong>Strength:</strong> {qEval.strengths[0]}
                    </div>
                  )}
                  {qEval.improvements.length > 0 && (
                    <div style={{ fontSize: '0.8125rem', color: '#fde047' }}>
                      <strong>Improvement:</strong> {qEval.improvements[0]}
                    </div>
                  )}
                </div>

                {/* Exemplar Approach */}
                {qEval.modelExemplar && (
                  <div className={styles.exemplarBox}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Lightbulb size={14} color="#60a5fa" />
                      <span className={styles.boxLabel} style={{ color: '#93c5fd' }}>
                        Recommended Approach / Exemplar Model
                      </span>
                    </div>
                    <div className={styles.exemplarText}>{qEval.modelExemplar}</div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      {/* CodeLab Next Steps / Actionable Learning */}
      <Card padding="md" className={styles.nextStepsCard}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Code2 size={20} color="#3b82f6" />
          <h2 className={styles.sectionTitle} style={{ margin: 0 }}>
            Unified Next Steps: Targeted Practice in Nexora CodeLab
          </h2>
        </div>
        <p style={{ fontSize: '0.8125rem', color: '#9ca3af', margin: 0 }}>
          Bridge conceptual knowledge into verified coding execution using CodeLab problems.
        </p>

        <div className={styles.stepsGrid}>
          {report.actionableNextSteps.map((step, idx) => (
            <div key={idx} className={styles.stepItem}>
              <span className={styles.stepText}>{step}</span>
              <Link to="/codelab/problems" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#60a5fa', fontWeight: 600 }}>
                <span>Practice in CodeLab</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          ))}
        </div>
      </Card>

      {/* Transparency Disclaimer */}
      <div className={styles.disclaimerCard}>
        <ShieldCheck size={20} style={{ flexShrink: 0, marginTop: '2px', color: '#9ca3af' }} />
        <div>
          <strong>AI Scoring Transparency Notice:</strong> {report.disclaimer}
        </div>
      </div>
    </div>
  );
};

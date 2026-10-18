import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Settings2,
  ShieldAlert,
  BrainCircuit,
  MessageSquare,
  FileCheck,
  History,
  Calendar,
  Video,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { INTERVIEW_CATEGORIES, InterviewSessionSummary } from '@/types/interview';
import { getSkillLevelLabel } from '@/types/skill';
import { useAuth } from '@/contexts/AuthContext';
import { getUserInterviewHistory } from '@/services/interviewService';
import styles from './Interview.module.css';

export const InterviewOverviewPage: React.FC = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<InterviewSessionSummary[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    async function fetchHistory() {
      if (!user) return;
      try {
        setLoadingHistory(true);
        const data = await getUserInterviewHistory(user.uid);
        setHistory(data);
      } catch (err) {
        console.warn('Failed to load interview history:', err);
      } finally {
        setLoadingHistory(false);
      }
    }

    fetchHistory();
  }, [user]);

  // Genuine metrics computed ONLY from actual persisted records
  const completedSessions = history.filter((s) => s.status === 'completed' && typeof s.score === 'number');
  const avgScore =
    completedSessions.length > 0
      ? Math.round(
          completedSessions.reduce((acc, curr) => acc + (curr.score || 0), 0) /
            completedSessions.length
        )
      : null;

  return (
    <div className={styles.container}>
      {/* Hero Header */}
      <div className={styles.heroBanner}>
        <div className={styles.heroLeft}>
          <div className={styles.tagGroup}>
            <Badge variant="success" size="md">Nexora InterviewAI</Badge>
            <span className={styles.statusPill}>Phase 4 Practice Engine Active</span>
          </div>
          <h1 className={styles.title}>AI-Powered Mock Technical Interviews</h1>
          <p className={styles.desc}>
            Prepare for authentic technical and behavioral interview screenings. Experience
            structured, category-tailored questions accompanied by multi-dimensional rubric
            evaluations and targeted learning pathways in Nexora CodeLab.
          </p>

          <div className={styles.actionButtons}>
            <Link to="/interview/live">
              <Button variant="primary" size="md" leftIcon={<Video size={16} />} style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)', border: 'none' }}>
                Live 1-on-1 AI Interview
              </Button>
            </Link>
            <Link to="/interview/setup">
              <Button variant="secondary" size="md" leftIcon={<Settings2 size={16} />}>
                Configure Parameters
              </Button>
            </Link>
            <Link to="/interview/simulator">
              <Button variant="secondary" size="md" leftIcon={<BrainCircuit size={16} />}>
                Advanced Simulator
              </Button>
            </Link>
          </div>
        </div>

        <Card className={styles.infoCard} padding="md">
          <div className={styles.infoTitle}>
            <ShieldAlert size={18} className={styles.shieldIcon} />
            <span>AI Architecture & Scoring Standard</span>
          </div>
          <p className={styles.infoText}>
            All AI model operations execute server-side via trusted Cloud Functions.
            Credentials never reach the client. In development or when external API keys are
            unconfigured, the system operates in a deterministic simulated evaluation mode.
          </p>
          <div className={styles.engineNotice}>
            <span>Diagnostic feedback represents rubric guidance, not employment guarantees.</span>
          </div>
        </Card>
      </div>

      {/* Genuine Progress Metrics (Only shown when real data exists) */}
      {completedSessions.length > 0 && (
        <section className={styles.historySection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Your Verified Interview Statistics</h2>
            <p className={styles.sectionSub}>Derived strictly from your persisted session evaluation records.</p>
          </div>
          <div className={styles.metricsRow}>
            <Card padding="md" className={styles.metricCard}>
              <span className={styles.metricLabel}>Total Sessions Started</span>
              <span className={styles.metricVal}>{history.length}</span>
            </Card>
            <Card padding="md" className={styles.metricCard}>
              <span className={styles.metricLabel}>Completed Evaluations</span>
              <span className={styles.metricVal}>{completedSessions.length}</span>
            </Card>
            <Card padding="md" className={styles.metricCard}>
              <span className={styles.metricLabel}>Average Diagnostic Score</span>
              <span className={styles.metricVal}>{avgScore} / 100</span>
            </Card>
          </div>
        </section>
      )}

      {/* Previous Interview Sessions History */}
      <section className={styles.historySection}>
        <div className={styles.sectionHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={18} color="#3b82f6" />
            <h2 className={styles.sectionTitle} style={{ margin: 0 }}>
              Interview Session History
            </h2>
          </div>
          <p className={styles.sectionSub}>Review your past interview responses, scorecards, and progress.</p>
        </div>

        <Card padding="none" style={{ overflow: 'hidden' }}>
          {loadingHistory ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <Spinner size="md" />
              <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#9ca3af' }}>
                Loading session records...
              </p>
            </div>
          ) : history.length === 0 ? (
            <div className={styles.historyEmpty}>
              <Calendar size={32} />
              <p>No interview sessions recorded yet.</p>
              <Link to="/interview/setup">
                <Button variant="secondary" size="sm">
                  Launch Your First Interview
                </Button>
              </Link>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className={styles.historyTable}>
                <thead>
                  <tr>
                    <th>Target Role</th>
                    <th>Category</th>
                    <th>Difficulty</th>
                    <th>Status</th>
                    <th>Score</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600, color: '#f3f4f6' }}>{s.targetRole}</td>
                      <td>
                        <Badge variant="accent" size="sm">
                          {s.category.toUpperCase()}
                        </Badge>
                      </td>
                      <td>
                        <Badge variant={s.difficulty} size="sm">
                          {getSkillLevelLabel(s.difficulty)}
                        </Badge>
                      </td>
                      <td>
                        <Badge
                          variant={
                            s.status === 'completed'
                              ? 'success'
                              : s.status === 'in_progress'
                              ? 'warning'
                              : 'default'
                          }
                          size="sm"
                        >
                          {s.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>
                        {typeof s.score === 'number' ? `${s.score} / 100` : '—'}
                      </td>
                      <td>
                        {new Date(s.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td>
                        {s.status === 'completed' ? (
                          <Link to={`/interview/report/${s.id}`} style={{ color: '#60a5fa', fontWeight: 600 }}>
                            View Report →
                          </Link>
                        ) : s.status === 'in_progress' ? (
                          <Link to={`/interview/session/${s.id}`} style={{ color: '#fbbf24', fontWeight: 600 }}>
                            Resume →
                          </Link>
                        ) : (
                          <span>Closed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </section>

      {/* 5 Interview Categories */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Five Interview Categories</h2>
          <p className={styles.sectionSub}>Target specific interview formats based on your career goals.</p>
        </div>

        <div className={styles.categoryGrid}>
          {INTERVIEW_CATEGORIES.map((cat) => (
            <Card key={cat.id} className={styles.catCard} padding="md">
              <div className={styles.catHeader}>
                <Badge variant="accent" size="sm">{cat.id.toUpperCase()}</Badge>
              </div>
              <h3 className={styles.catTitle}>{cat.label}</h3>
              <p className={styles.catDesc}>{cat.description}</p>
              <div className={styles.catFooter}>
                <Link to="/interview/setup" className={styles.catLink}>
                  <span>Select Category</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Structured Evaluation Methodology */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Evaluation & Feedback Pipeline</h2>
        <p className={styles.sectionSub}>How your mock interview performance is evaluated.</p>

        <div className={styles.pipelineGrid}>
          <Card className={styles.pipelineCard} padding="md">
            <div className={styles.pipelineIcon}>
              <BrainCircuit size={20} />
            </div>
            <h4 className={styles.pipelineTitle}>Adaptive Questioning</h4>
            <p className={styles.pipelineDesc}>
              Questions span technical definitions, architecture trade-offs, edge cases, and role scenarios.
            </p>
          </Card>

          <Card className={styles.pipelineCard} padding="md">
            <div className={styles.pipelineIcon}>
              <MessageSquare size={20} />
            </div>
            <h4 className={styles.pipelineTitle}>Structured Responses</h4>
            <p className={styles.pipelineDesc}>
              Submit conceptual reasoning, algorithmic complexity analysis, and STAR structured responses.
            </p>
          </Card>

          <Card className={styles.pipelineCard} padding="md">
            <div className={styles.pipelineIcon}>
              <FileCheck size={20} />
            </div>
            <h4 className={styles.pipelineTitle}>Evidence-Based Scorecards</h4>
            <p className={styles.pipelineDesc}>
              Receive rubric-based evaluations with concrete strengths, improvement points, and CodeLab learning links.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
};

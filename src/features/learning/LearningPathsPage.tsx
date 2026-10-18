import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  Compass,
  ShieldCheck,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/contexts/AuthContext';
import { getSkillLevelLabel } from '@/types/skill';
import { LearningPath } from '@/types/analytics';
import { computeStudentAnalytics, getCachedAnalytics } from '@/services/analyticsService';
import { PUBLISHED_LEARNING_PATHS } from '@/data/skillTaxonomy';
import { StudyPlanCard } from '@/components/study/StudyPlanCard';
import { getLocalStudyPlan, createPersonalizedStudyPlan, recomputePlanProgress } from '@/services/studyPlanService';
import { StudyPlan } from '@/types/studyPlan';
import { getSubmissionsForUser } from '@/services/codelabService';
import { getUserInterviewHistory } from '@/services/interviewService';
import styles from './Learning.module.css';

export const LearningPathsPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [paths, setPaths] = useState<LearningPath[]>(() => {
    const cached = user ? getCachedAnalytics(user.uid) : null;
    return cached?.learningPaths || PUBLISHED_LEARNING_PATHS;
  });
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(() =>
    user ? getLocalStudyPlan(user.uid) : null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProgress() {
      if (!user) return;
      try {
        setLoading(true);
        const [data, subs, ints] = await Promise.all([
          computeStudentAnalytics(user.uid),
          getSubmissionsForUser(user.uid),
          getUserInterviewHistory(user.uid),
        ]);

        if (data.learningPaths && data.learningPaths.length > 0) {
          setPaths(data.learningPaths);
        }

        let plan = getLocalStudyPlan(user.uid);
        if (plan) {
          plan = recomputePlanProgress(plan, subs, ints);
          setStudyPlan(plan);
        } else {
          const newPlan = await createPersonalizedStudyPlan(
            user.uid,
            {
              targetRole: profile?.targetRole || 'Software Engineer',
              focusTopics: profile?.learningGoals ? profile.learningGoals.split(',').map((s) => s.trim()) : ['Algorithms', 'System Design'],
              weeklyHours: 5,
              preferredDays: [1, 3, 5],
            },
            subs,
            ints
          );
          setStudyPlan(newPlan);
        }
      } catch (err) {
        console.warn('[LearningPathsPage] Failed to compute path progress:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProgress();
  }, [user, profile]);

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Compass size={22} color="#3b82f6" />
            <h1 className={styles.title} style={{ margin: 0 }}>
              Guided Learning Paths & Milestones
            </h1>
          </div>
          <p className={styles.desc}>
            Structured curricula synthesizing CodeLab programming assessments and InterviewAI
            mock screening into verified competency milestones.
          </p>
        </div>
        <Badge variant="success" size="sm">
          Unified Analytics Active
        </Badge>
      </div>

      {/* Verification Notice */}
      <Card padding="md" style={{ backgroundColor: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: '#93c5fd' }}>
          <ShieldCheck size={18} style={{ flexShrink: 0 }} />
          <span>
            <strong>Authentic Completion Standard:</strong> Milestones are marked complete only
            when an accepted test verdict is compiled in CodeLab or a structured scorecard is
            persisted in InterviewAI. No progress is fabricated.
          </span>
        </div>
      </Card>

      {/* Active Personalized Study Plan */}
      <div style={{ margin: '0.5rem 0 1.5rem 0' }}>
        <StudyPlanCard plan={studyPlan} onPlanUpdated={setStudyPlan} />
      </div>

      {loading && paths.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <Spinner size="lg" />
          <p style={{ fontSize: '0.8125rem', color: '#9ca3af', marginTop: '1rem' }}>
            Compiling verified milestone completions across your submissions...
          </p>
        </div>
      )}

      {/* Learning Paths List */}
      <div className={styles.pathsList}>
        {paths.map((path) => (
          <Card key={path.id} padding="lg" className={styles.pathCard}>
            {/* Header */}
            <div className={styles.pathHeader}>
              <div className={styles.pathBadgeGroup}>
                <Badge variant={path.difficulty} size="sm">
                  {getSkillLevelLabel(path.difficulty)}
                </Badge>
                <span className={styles.metaRole}>{path.targetRole}</span>
              </div>
              <span className={styles.metaHours}>
                ~{path.estimatedHours} hrs • {path.milestones.length} milestones
              </span>
            </div>

            <h2 className={styles.pathTitle}>{path.title}</h2>
            <p className={styles.pathDesc}>{path.description}</p>

            {/* Target Skills Tags */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.6875rem', color: '#6b7280', textTransform: 'uppercase' }}>
                Skills:
              </span>
              {path.targetSkills.map((sId) => (
                <span
                  key={sId}
                  style={{
                    fontSize: '0.6875rem',
                    color: '#9ca3af',
                    backgroundColor: '#1f2937',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}
                >
                  {sId.replace(/^(prog|lang|db|int)-/, '').replace(/-/g, ' ')}
                </span>
              ))}
            </div>

            {/* Progress Bar */}
            <div className={styles.progressContainer}>
              <div className={styles.progressLabelRow}>
                <span>Curriculum Progress</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{path.progressPercent}%</span>
              </div>
              <div className={styles.progressBarTrack}>
                <div className={styles.progressBarFill} style={{ width: `${path.progressPercent}%` }} />
              </div>
            </div>

            {/* Milestones List */}
            <div className={styles.milestonesList}>
              {path.milestones.map((ms) => {
                const actionUrl =
                  ms.type === 'problem'
                    ? `/codelab/problems/${ms.targetSlugOrCategory}`
                    : `/interview/setup`;

                return (
                  <div
                    key={ms.id}
                    className={`${styles.milestoneItem} ${ms.isCompleted ? styles.milestoneDone : ''}`}
                  >
                    <div className={styles.milestoneLeft}>
                      {ms.isCompleted ? (
                        <CheckCircle2 size={18} color="#22c55e" style={{ flexShrink: 0 }} />
                      ) : (
                        <Circle size={18} color="#4b5563" style={{ flexShrink: 0 }} />
                      )}
                      <div className={styles.milestoneInfo}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className={styles.milestoneTitle}>{ms.title}</span>
                          <Badge variant={ms.type === 'problem' ? 'accent' : 'success'} size="sm">
                            {ms.type === 'problem' ? 'CodeLab' : 'InterviewAI'}
                          </Badge>
                        </div>
                        <span className={styles.milestoneDesc}>{ms.description}</span>
                      </div>
                    </div>

                    <div className={styles.milestoneMeta}>
                      {ms.isCompleted ? (
                        <span style={{ fontSize: '0.6875rem', color: '#22c55e', fontWeight: 600 }}>
                          Completed ✓
                        </span>
                      ) : (
                        <Link to={actionUrl}>
                          <Button variant="secondary" size="sm" rightIcon={<ArrowRight size={12} />}>
                            {ms.type === 'problem' ? 'Solve' : 'Practice'}
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

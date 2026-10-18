import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  ArrowRight,
  Sliders,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StudyPlan, StudyPlanInput } from '@/types/studyPlan';
import {
  createPersonalizedStudyPlan,
  toggleTaskCompletion,
} from '@/services/studyPlanService';
import { useAuth } from '@/contexts/AuthContext';
import styles from './StudyPlanCard.module.css';

interface StudyPlanCardProps {
  plan: StudyPlan | null;
  onPlanUpdated: (updatedPlan: StudyPlan) => void;
}

export const StudyPlanCard: React.FC<StudyPlanCardProps> = ({ plan, onPlanUpdated }) => {
  const { user, profile } = useAuth();
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [weeklyHours, setWeeklyHours] = useState(plan?.weeklyHours || 5);
  const [targetRole, setTargetRole] = useState(plan?.targetRole || profile?.targetRole || 'Software Engineer');
  const [selectedDays, setSelectedDays] = useState<number[]>(plan?.preferredDays || [1, 3, 5]); // Mon, Wed, Fri
  const [isSaving, setIsSaving] = useState(false);

  const handleToggleTask = async (taskId: string) => {
    if (!user || !plan) return;
    const updated = await toggleTaskCompletion(user.uid, plan, taskId);
    onPlanUpdated(updated);
  };

  const handleDayToggle = (day: number) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter((d) => d !== day));
      }
    } else {
      setSelectedDays([...selectedDays, day].sort());
    }
  };

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      const input: StudyPlanInput = {
        targetRole: targetRole.trim(),
        focusTopics: profile?.learningGoals ? profile.learningGoals.split(',').map((s) => s.trim()) : ['Algorithms', 'System Design'],
        weeklyHours,
        preferredDays: selectedDays,
      };
      const newPlan = await createPersonalizedStudyPlan(user.uid, input);
      onPlanUpdated(newPlan);
      setShowConfigModal(false);
    } catch (err) {
      console.warn('[StudyPlanCard] Plan creation error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={styles.planCard}>
      {/* Header */}
      <div className={styles.planHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.planIconCircle}>
            <Calendar size={20} />
          </div>
          <div>
            <h3 className={styles.planTitle}>
              {plan?.title || `${profile?.targetRole || 'Software Engineer'} Study Plan`}
            </h3>
            <p className={styles.planSub}>
              Paced for {plan?.weeklyHours || 5} hours/week across {plan?.preferredDays.length || 3} scheduled days
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowConfigModal(true)}
          leftIcon={<Sliders size={13} />}
        >
          Configure Plan
        </Button>
      </div>

      {/* Progress */}
      {plan && (
        <div className={styles.progressSection}>
          <div className={styles.progressLabelRow}>
            <span>Weekly Progress ({plan.tasks.filter((t) => t.isCompleted).length} / {plan.tasks.length} tasks)</span>
            <span className={styles.progressPercent}>{plan.progressPercent}%</span>
          </div>
          <div className={styles.progressBarBg}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${Math.min(100, plan.progressPercent)}%` }}
            />
          </div>
        </div>
      )}

      {/* Task List */}
      {plan && plan.tasks.length > 0 ? (
        <div className={styles.tasksList}>
          {plan.tasks.map((task) => {
            const isDone = task.isCompleted;
            return (
              <div
                key={task.id}
                className={`${styles.taskItem} ${isDone ? styles.taskItemCompleted : ''}`}
              >
                <div className={styles.taskLeft}>
                  <button
                    className={`${styles.checkBtn} ${isDone ? styles.checkBtnCompleted : ''}`}
                    onClick={() => handleToggleTask(task.id)}
                    title={isDone ? 'Mark task incomplete' : 'Mark task complete'}
                  >
                    {isDone ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                  </button>

                  <div className={styles.taskContent}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <Badge variant="default" size="sm">{task.dayLabel}</Badge>
                      <span className={`${styles.taskTitle} ${isDone ? styles.taskTitleDone : ''}`}>
                        {task.title}
                      </span>
                    </div>
                    <span className={styles.taskReason}>{task.reason}</span>
                    <div className={styles.taskMeta}>
                      <span className={styles.durationPill}>
                        <Clock size={11} style={{ display: 'inline', marginRight: '3px' }} />
                        ~{task.estimatedMinutes} mins
                      </span>
                      {task.verifiedVia && (
                        <Badge variant="success" size="sm">
                          Verified via {task.verifiedVia === 'codelab_submission' ? 'CodeLab' : 'Interview'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <Link to={task.actionUrl} style={{ textDecoration: 'none' }}>
                    <Button variant={isDone ? 'ghost' : 'primary'} size="sm" rightIcon={<ArrowRight size={12} />}>
                      {isDone ? 'Review' : 'Start'}
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--color-text-secondary)', fontSize: '0.8125rem' }}>
          No study plan active yet. Click &quot;Configure Plan&quot; to build a personalized schedule.
        </div>
      )}

      {/* Configuration Modal */}
      {showConfigModal && (
        <div className={styles.modalOverlay} onClick={() => setShowConfigModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--color-text-primary)' }}>
                Configure Personalized Study Plan
              </h3>
              <button
                style={{ background: 'none', border: 'none', color: 'var(--color-text-tertiary)', cursor: 'pointer' }}
                onClick={() => setShowConfigModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleGeneratePlan} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  Target Role
                </label>
                <input
                  type="text"
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--color-bg-tertiary)',
                    border: '1px solid var(--color-border-default)',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    color: 'var(--color-text-primary)',
                    fontSize: '0.8125rem',
                  }}
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Backend Systems Engineer"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  Weekly Available Hours: <strong>{weeklyHours} hrs/week</strong>
                </label>
                <input
                  type="range"
                  min="2"
                  max="20"
                  step="1"
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                  Preferred Study Days
                </label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {dayNames.map((name, idx) => {
                    const isSelected = selectedDays.includes(idx);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleDayToggle(idx)}
                        style={{
                          backgroundColor: isSelected ? 'var(--color-accent)' : 'var(--color-bg-tertiary)',
                          color: isSelected ? '#ffffff' : 'var(--color-text-secondary)',
                          border: '1px solid',
                          borderColor: isSelected ? 'var(--color-accent)' : 'var(--color-border-default)',
                          borderRadius: '4px',
                          padding: '6px 10px',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                        }}
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <Button variant="ghost" size="sm" type="button" onClick={() => setShowConfigModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={isSaving}>
                  {isSaving ? 'Generating...' : 'Save & Build Plan'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

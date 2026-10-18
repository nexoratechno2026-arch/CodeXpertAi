import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Play,
  Video,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import {
  INTERVIEW_CATEGORIES,
  InterviewCategory,
  InterviewSetupConfig,
  INTERVIEWER_PERSONAS,
  InterviewerPersonaId,
  getInterviewerPersona,
} from '@/types/interview';
import { SKILL_LEVELS, SkillLevel, getSkillLevelLabel } from '@/types/skill';
import { useAuth } from '@/contexts/AuthContext';
import { createInterviewSession } from '@/services/interviewService';
import styles from './Interview.module.css';

const SUGGESTED_ROLES = [
  'Full Stack Engineer',
  'Frontend Developer (React)',
  'Backend Engineer (Python / Node)',
  'Data Analyst & SQL Specialist',
  'Systems & DevOps Engineer',
];

export const InterviewSetupPage: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [category, setCategory] = useState<InterviewCategory>('technical');
  const [targetRole, setTargetRole] = useState(SUGGESTED_ROLES[0]);
  const [difficulty, setDifficulty] = useState<SkillLevel>(profile?.selectedLevel || 'beginner');
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [interviewerPersonaId, setInterviewerPersonaId] = useState<InterviewerPersonaId>('elena');

  const [isSaved, setIsSaved] = useState(false);
  const [savedConfig, setSavedConfig] = useState<InterviewSetupConfig | null>(null);
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchError, setLaunchError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const config: InterviewSetupConfig = {
      category,
      targetRole: targetRole.trim() || 'Software Engineer',
      difficulty,
      durationMinutes,
      questionCount,
      interviewerPersonaId,
    };

    setSavedConfig(config);
    setIsSaved(true);
    setLaunchError(null);
  };

  const handleLaunchSession = async () => {
    if (!savedConfig || !user) return;
    try {
      setIsLaunching(true);
      setLaunchError(null);
      const session = await createInterviewSession(savedConfig, user.uid);
      navigate(`/interview/session/${session.id}`);
    } catch (err: unknown) {
      setLaunchError(err instanceof Error ? err.message : 'Failed to launch interview session.');
    } finally {
      setIsLaunching(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Configure Mock Interview Session</h1>
          <p className={styles.desc}>
            Set your interview focus, target position, duration, and difficulty level.
          </p>
        </div>
        <Link to="/interview">
          <Button variant="secondary" size="sm" leftIcon={<ArrowLeft size={14} />}>
            Back to Overview
          </Button>
        </Link>
      </div>

      {isSaved && savedConfig ? (
        <Card className={styles.confirmationCard} padding="lg">
          <div className={styles.confirmHeader}>
            <div className={styles.confirmIcon}>
              <CheckCircle2 size={32} />
            </div>
            <h2 className={styles.confirmTitle}>Interview Session Configuration Ready</h2>
            <p className={styles.confirmDesc}>
              Your parameters have been validated and the adaptive interview engine is prepared.
            </p>
          </div>

          <div className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Category</span>
              <span className={styles.summaryValue}>{savedConfig.category.toUpperCase()}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Target Role</span>
              <span className={styles.summaryValue}>{savedConfig.targetRole}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Difficulty Tier</span>
              <Badge variant={savedConfig.difficulty} size="sm">
                {getSkillLevelLabel(savedConfig.difficulty)}
              </Badge>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Allocated Time</span>
              <span className={styles.summaryValue}>{savedConfig.durationMinutes} Minutes</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Questions</span>
              <span className={styles.summaryValue}>{savedConfig.questionCount} Questions</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Interviewer Persona</span>
              <span className={styles.summaryValue}>
                {getInterviewerPersona(savedConfig.interviewerPersonaId).name} (
                {getInterviewerPersona(savedConfig.interviewerPersonaId).gender === 'female' ? 'Female' : 'Male'})
              </span>
            </div>
          </div>

          {launchError && (
            <div style={{ color: '#fca5a5', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={14} />
              <span>{launchError}</span>
            </div>
          )}

          <div className={styles.confirmActions}>
            <Button variant="secondary" onClick={() => setIsSaved(false)} disabled={isLaunching}>
              Edit Configuration
            </Button>
            <Button
              variant="secondary"
              onClick={handleLaunchSession}
              disabled={isLaunching}
              leftIcon={isLaunching ? <Spinner size="sm" /> : <Play size={14} />}
            >
              {isLaunching ? 'Preparing Session...' : 'Standard Text Mode'}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                navigate(
                  `/interview/live?category=${savedConfig.category}&role=${encodeURIComponent(
                    savedConfig.targetRole
                  )}&difficulty=${savedConfig.difficulty}&persona=${savedConfig.interviewerPersonaId}`
                );
              }}
              leftIcon={<Video size={14} />}
              style={{ fontWeight: 600 }}
            >
              Start Live Video Interview
            </Button>
          </div>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className={styles.setupForm}>
          {/* 1. Category Selection */}
          <Card padding="md" className={styles.formSection}>
            <span className={styles.formSectionTitle}>1. Select Interview Category</span>
            <div className={styles.categoryRadioGrid}>
              {INTERVIEW_CATEGORIES.map((cat) => (
                <label
                  key={cat.id}
                  className={`${styles.categoryRadio} ${category === cat.id ? styles.categoryRadioActive : ''}`}
                >
                  <input
                    type="radio"
                    name="category"
                    value={cat.id}
                    checked={category === cat.id}
                    onChange={() => setCategory(cat.id)}
                    className={styles.radioInput}
                  />
                  <div className={styles.catRadioContent}>
                    <span className={styles.catRadioLabel}>{cat.label}</span>
                    <span className={styles.catRadioDesc}>{cat.description}</span>
                  </div>
                </label>
              ))}
            </div>
          </Card>

          {/* 2. Target Role */}
          <Card padding="md" className={styles.formSection}>
            <span className={styles.formSectionTitle}>2. Target Role & Industry Specialty</span>
            <Input
              label="Role Title"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Senior Frontend Engineer"
              required
            />
            <div className={styles.rolePills}>
              <span className={styles.pillsLabel}>Suggestions:</span>
              {SUGGESTED_ROLES.map((role) => (
                <button
                  key={role}
                  type="button"
                  className={`${styles.rolePill} ${targetRole === role ? styles.rolePillActive : ''}`}
                  onClick={() => setTargetRole(role)}
                >
                  {role}
                </button>
              ))}
            </div>
          </Card>

          {/* 3. Difficulty Level (5 Tiers) */}
          <Card padding="md" className={styles.formSection}>
            <span className={styles.formSectionTitle}>3. Select Difficulty Level</span>
            <div className={styles.difficultyGrid}>
              {SKILL_LEVELS.map((lvl) => (
                <label
                  key={lvl.id}
                  className={`${styles.diffRadio} ${difficulty === lvl.id ? styles.diffRadioActive : ''}`}
                >
                  <input
                    type="radio"
                    name="difficulty"
                    value={lvl.id}
                    checked={difficulty === lvl.id}
                    onChange={() => setDifficulty(lvl.id)}
                    className={styles.radioInput}
                  />
                  <div className={styles.diffContent}>
                    <Badge variant={lvl.id} size="sm">{lvl.label}</Badge>
                    <span className={styles.diffDesc}>{lvl.description}</span>
                  </div>
                </label>
              ))}
            </div>
          </Card>

          {/* 4. Session Length & Question Count */}
          <Card padding="md" className={styles.formSection}>
            <span className={styles.formSectionTitle}>4. Session Duration & Question Count</span>
            <div className={styles.durationRow}>
              <div className={styles.durationGroup}>
                <label className={styles.subLabel}>Target Duration</label>
                <div className={styles.pillSelector}>
                  {[15, 30, 45, 60].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      className={`${styles.selectorPill} ${durationMinutes === mins ? styles.selectorPillActive : ''}`}
                      onClick={() => setDurationMinutes(mins)}
                    >
                      {mins} mins
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.durationGroup}>
                <label className={styles.subLabel}>Total Questions</label>
                <div className={styles.pillSelector}>
                  {[3, 5, 8].map((count) => (
                    <button
                      key={count}
                      type="button"
                      className={`${styles.selectorPill} ${questionCount === count ? styles.selectorPillActive : ''}`}
                      onClick={() => setQuestionCount(count)}
                    >
                      {count} questions
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* 5. Interviewer Persona & Voice Experience */}
          <Card padding="md" className={styles.formSection}>
            <span className={styles.formSectionTitle}>5. Select Interviewer Persona & Voice Presentation</span>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', margin: '-4px 0 8px 0' }}>
              Choose your interviewer simulation persona. Professional female interviewer personas with synthesized English speech are supported. (Text responses remain fully enabled at all times).
            </p>
            <div className={styles.personaGrid}>
              {INTERVIEWER_PERSONAS.map((persona) => {
                const isSelected = interviewerPersonaId === persona.id;
                return (
                  <div
                    key={persona.id}
                    className={`${styles.personaCard} ${isSelected ? styles.personaCardActive : ''}`}
                    onClick={() => setInterviewerPersonaId(persona.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setInterviewerPersonaId(persona.id);
                      }
                    }}
                  >
                    <div className={styles.personaHeader}>
                      <div
                        className={`${styles.personaAvatar} ${
                          persona.gender === 'female' ? styles.personaAvatarFemale : styles.personaAvatarMale
                        }`}
                      >
                        {persona.avatarInitials}
                      </div>
                      <div className={styles.personaMeta}>
                        <div className={styles.personaName}>
                          <span>{persona.name}</span>
                          {persona.gender === 'female' && (
                            <Badge variant="accent" size="sm">
                              Female AI
                            </Badge>
                          )}
                        </div>
                        <span className={styles.personaRole}>{persona.title}</span>
                      </div>
                    </div>

                    <p className={styles.personaBio}>{persona.bio}</p>
                  </div>
                );
              })}
            </div>
          </Card>

          <div className={styles.submitRow}>
            <Button type="submit" variant="primary" size="lg" rightIcon={<ArrowRight size={16} />}>
              Save & Prepare Session
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};


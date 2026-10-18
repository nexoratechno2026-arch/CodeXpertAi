import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowRight,
  ListFilter,
  History,
  CheckCircle2,
  Trophy,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SKILL_LEVELS, SkillLevel, getSkillLevelLabel } from '@/types/skill';
import { CODELAB_TOPICS, TopicMastery } from '@/types/codelab';
import { getTopicMasteryForUser } from '@/services/codelabService';
import { useAuth } from '@/contexts/AuthContext';
import styles from './Codelab.module.css';

export const CodelabOverviewPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [activeFilterLevel, setActiveFilterLevel] = useState<SkillLevel | 'all'>('all');
  const [topicMasteries, setTopicMasteries] = useState<Record<string, TopicMastery>>({});

  useEffect(() => {
    async function loadMastery() {
      if (user) {
        const masteries = await getTopicMasteryForUser(user.uid);
        const map: Record<string, TopicMastery> = {};
        for (const tm of masteries) {
          map[tm.topicId] = tm;
        }
        setTopicMasteries(map);
      }
    }
    loadMastery();
  }, [user]);

  return (
    <div className={styles.container}>
      {/* Overview Banner */}
      <div className={styles.heroBanner}>
        <div className={styles.heroLeft}>
          <div className={styles.tagGroup}>
            <Badge variant="accent" size="md">Nexora CodeLab</Badge>
            <span className={styles.statusPill}>Phase 3 Coding Engine Active</span>
          </div>
          <h1 className={styles.title}>Algorithmic Practice & Assessment</h1>
          <p className={styles.desc}>
            Refine technical problem-solving through curated algorithmic challenges. Solutions are verified
            against private automated test cases using a secure, sandboxed execution architecture.
          </p>

          <div className={styles.actionButtons}>
            <Link to="/codelab/problems">
              <Button variant="primary" size="md" leftIcon={<ListFilter size={16} />}>
                Explore Problem Library
              </Button>
            </Link>
            <Link to="/codelab/challenges">
              <Button variant="secondary" size="md" leftIcon={<Trophy size={16} />}>
                Daily Challenges
              </Button>
            </Link>
            <Link to="/codelab/submissions">
              <Button variant="secondary" size="md" leftIcon={<History size={16} />}>
                Submission History
              </Button>
            </Link>
          </div>
        </div>

        <Card className={styles.infoCard} padding="md">
          <div className={styles.infoTitle}>
            <ShieldCheck size={18} className={styles.shieldIcon} />
            <span>Execution Sandbox Architecture</span>
          </div>
          <p className={styles.infoText}>
            Code execution is isolated inside dedicated Judge0 containers with strict memory and time caps.
            Cloud Functions act strictly as trusted brokers and never execute arbitrary student code directly.
          </p>
          <div className={styles.engineNotice} style={{ color: '#4ade80', borderColor: 'rgba(34, 197, 94, 0.3)' }}>
            <span>Monaco Editor & Secure Execution Engine active in Phase 3.</span>
          </div>
        </Card>
      </div>

      {/* 5-Tier Skill Level Filters */}
      <section className={styles.section}>
        <div className={styles.sectionTitleRow}>
          <div>
            <h2 className={styles.sectionTitle}>Filter by Skill Level</h2>
            <p className={styles.sectionSub}>Select a tier to target problems matching your current domain mastery.</p>
          </div>
          <span className={styles.currentPref}>
            Profile level: <strong>{getSkillLevelLabel(profile?.selectedLevel || 'beginner')}</strong>
          </span>
        </div>

        <div className={styles.levelFilterRow}>
          <button
            className={`${styles.filterChip} ${activeFilterLevel === 'all' ? styles.filterChipActive : ''}`}
            onClick={() => setActiveFilterLevel('all')}
          >
            All Levels
          </button>
          {SKILL_LEVELS.map((level) => (
            <button
              key={level.id}
              className={`${styles.filterChip} ${activeFilterLevel === level.id ? styles.filterChipActive : ''}`}
              onClick={() => setActiveFilterLevel(level.id)}
            >
              {level.label}
            </button>
          ))}
        </div>
      </section>

      {/* 14 Curated Topic Domains */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Curated Topic Domains</h2>
        <p className={styles.sectionSub}>Master one subject area at a time with independent, measured proficiency.</p>

        <div className={styles.topicGrid}>
          {CODELAB_TOPICS.map((t) => {
            const mastery = topicMasteries[t.id];
            const solved = mastery?.solvedCount || 0;
            const proficiency = mastery?.proficiency || 'absolute_beginner';

            return (
              <Card key={t.id} className={styles.topicCard} padding="md">
                <div className={styles.topicHeader}>
                  <span className={styles.topicCategory}>{t.category}</span>
                  <span className={styles.problemCountBadge}>{t.problemCount} problems</span>
                </div>
                <h3 className={styles.topicName}>{t.name}</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>
                  {t.description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.6875rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: solved > 0 ? '#4ade80' : 'var(--color-text-tertiary)' }}>
                    <CheckCircle2 size={13} />
                    <span>{solved} Solved</span>
                  </div>
                  <Badge variant={proficiency} size="sm">
                    {getSkillLevelLabel(proficiency)}
                  </Badge>
                </div>

                <div className={styles.topicFooter}>
                  <Link to="/codelab/problems" className={styles.topicLink}>
                    <span>Browse Topic</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
};

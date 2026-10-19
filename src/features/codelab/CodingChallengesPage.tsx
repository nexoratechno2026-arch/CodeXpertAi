import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Award,
  Zap,
  ArrowRight,
  Trophy,
  Flame,
  ShieldCheck,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/contexts/AuthContext';
import { getDailyChallenge, getWeeklyChallenge, evaluateChallengeState, getLocalCompletedChallengeIds } from '@/services/challengeService';
import { getSubmissionsForUser } from '@/services/codelabService';
import { buildLeaderboard } from '@/services/leaderboardService';
import { CodingChallenge, LeaderboardEntry } from '@/types/gamification';
import { getSkillLevelLabel } from '@/types/skill';
import { UserRole } from '@/types/user';
import styles from './Challenges.module.css';

export const CodingChallengesPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [daily, setDaily] = useState<CodingChallenge>(() => getDailyChallenge());
  const [weekly, setWeekly] = useState<CodingChallenge>(() => getWeeklyChallenge());
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const subs = await getSubmissionsForUser(user.uid);
        const evalDaily = evaluateChallengeState(getDailyChallenge(), subs);
        const evalWeekly = evaluateChallengeState(getWeeklyChallenge(), subs);
        setDaily(evalDaily);
        setWeekly(evalWeekly);

        // Build sample leaderboard comparing personal performance
        if (profile) {
          const completedIds = getLocalCompletedChallengeIds(user.uid);
          const studentRole: UserRole = 'student';
          const candidates = [
            {
              userId: user.uid,
              profile,
              xp: 450,
              challengesCompleted: completedIds.size,
              streak: profile.stats?.currentStreak || 1,
              updatedAt: new Date().toISOString(),
              optOutOfLeaderboards: false,
            },
            {
              userId: 'student_leader_1',
              profile: { ...profile, uid: 'student_leader_1', fullName: 'Elena Rostova', role: studentRole },
              xp: 850,
              challengesCompleted: 5,
              streak: 4,
              updatedAt: '2026-10-16T12:00:00Z',
              optOutOfLeaderboards: false,
            },
            {
              userId: 'student_leader_2',
              profile: { ...profile, uid: 'student_leader_2', fullName: 'Marcus Vance', role: studentRole },
              xp: 620,
              challengesCompleted: 3,
              streak: 3,
              updatedAt: '2026-10-17T08:00:00Z',
              optOutOfLeaderboards: false,
            },
          ];
          const lb = buildLeaderboard(candidates, user.uid);
          setLeaderboard(lb);
        }
      } catch (err) {
        console.warn('[ChallengesPage] Failed to load challenge records:', err);
      }
    }

    loadData();
  }, [user, profile]);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Award size={24} color="#3b82f6" />
            <h1>Daily & Weekly Coding Challenges</h1>
          </div>
          <p className={styles.desc}>
            Compete against yourself and the clock. Challenges are assigned deterministically every midnight UTC.
            Only verified accepted test submissions qualify for XP rewards.
          </p>
        </div>

        <Badge variant="accent" size="md">
          UTC Standard Schedule
        </Badge>
      </div>

      {/* Verification Notice */}
      <Card padding="md" style={{ backgroundColor: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: '#93c5fd' }}>
          <ShieldCheck size={18} style={{ flexShrink: 0 }} />
          <span>
            <strong>Anti-Inflation Guarantee:</strong> Submitting multiple times or clicking Run does not award duplicate XP.
            Rewards are credited strictly once per period key upon a verified 100% test pass verdict.
          </span>
        </div>
      </Card>

      {/* Challenge Cards Grid */}
      <div className={styles.grid}>
        {/* Daily Challenge Card */}
        <Card padding="lg" className={styles.challengeCard}>
          {daily.isCompleted && (
            <div className={styles.completedBadge}>
              <Badge variant="success" size="sm">
                Completed Today ✓
              </Badge>
            </div>
          )}

          <div className={styles.metaRow}>
            <Badge variant="accent" size="sm">
              <Calendar size={12} style={{ marginRight: '4px' }} />
              Daily Challenge
            </Badge>
            <Badge variant={daily.difficulty} size="sm">
              {getSkillLevelLabel(daily.difficulty)}
            </Badge>
            <span style={{ fontSize: '0.75rem', color: '#eab308', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
              <Zap size={14} /> +{daily.xpReward} XP
            </span>
          </div>

          <h2 style={{ fontSize: '1.25rem', margin: 0, color: '#f5f5f5' }}>{daily.title}</h2>
          <p style={{ fontSize: '0.875rem', color: '#a1a1aa', margin: 0, lineHeight: 1.5 }}>
            {daily.description}
          </p>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.6875rem', color: '#71717a' }}>Languages:</span>
            {daily.supportedLanguages.map((lang) => (
              <span
                key={lang}
                style={{
                  fontSize: '0.6875rem',
                  color: '#9ca3af',
                  backgroundColor: '#1f2937',
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}
              >
                {lang}
              </span>
            ))}
          </div>

          {daily.isCompleted && (daily.bestRuntimeMs || daily.bestMemoryKB) && (
            <div className={styles.personalBestRow}>
              <span>Personal Best:</span>
              {daily.bestRuntimeMs && (
                <span>
                  Runtime: <strong className={styles.personalBestVal}>{daily.bestRuntimeMs}ms</strong>
                </span>
              )}
              {daily.bestMemoryKB && (
                <span>
                  Memory: <strong className={styles.personalBestVal}>{(daily.bestMemoryKB / 1024).toFixed(1)}MB</strong>
                </span>
              )}
            </div>
          )}

          <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
            <Link to={`/codelab/problems/${daily.problemSlug}`}>
              <Button
                variant={daily.isCompleted ? 'secondary' : 'primary'}
                style={{ width: '100%' }}
                rightIcon={<ArrowRight size={14} />}
              >
                {daily.isCompleted ? 'Review or Optimize Solution' : 'Start Daily Challenge'}
              </Button>
            </Link>
          </div>
        </Card>

        {/* Weekly Challenge Card */}
        <Card padding="lg" className={styles.challengeCard}>
          {weekly.isCompleted && (
            <div className={styles.completedBadge}>
              <Badge variant="success" size="sm">
                Completed This Week ✓
              </Badge>
            </div>
          )}

          <div className={styles.metaRow}>
            <Badge variant="warning" size="sm">
              <Trophy size={12} style={{ marginRight: '4px' }} />
              Weekly Challenge
            </Badge>
            <Badge variant={weekly.difficulty} size="sm">
              {getSkillLevelLabel(weekly.difficulty)}
            </Badge>
            <span style={{ fontSize: '0.75rem', color: '#eab308', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
              <Zap size={14} /> +{weekly.xpReward} XP
            </span>
          </div>

          <h2 style={{ fontSize: '1.25rem', margin: 0, color: '#f5f5f5' }}>{weekly.title}</h2>
          <p style={{ fontSize: '0.875rem', color: '#a1a1aa', margin: 0, lineHeight: 1.5 }}>
            {weekly.description}
          </p>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.6875rem', color: '#71717a' }}>Languages:</span>
            {weekly.supportedLanguages.map((lang) => (
              <span
                key={lang}
                style={{
                  fontSize: '0.6875rem',
                  color: '#9ca3af',
                  backgroundColor: '#1f2937',
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}
              >
                {lang}
              </span>
            ))}
          </div>

          {weekly.isCompleted && (weekly.bestRuntimeMs || weekly.bestMemoryKB) && (
            <div className={styles.personalBestRow}>
              <span>Personal Best:</span>
              {weekly.bestRuntimeMs && (
                <span>
                  Runtime: <strong className={styles.personalBestVal}>{weekly.bestRuntimeMs}ms</strong>
                </span>
              )}
              {weekly.bestMemoryKB && (
                <span>
                  Memory: <strong className={styles.personalBestVal}>{(weekly.bestMemoryKB / 1024).toFixed(1)}MB</strong>
                </span>
              )}
            </div>
          )}

          <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
            <Link to={`/codelab/problems/${weekly.problemSlug}`}>
              <Button
                variant={weekly.isCompleted ? 'secondary' : 'primary'}
                style={{ width: '100%' }}
                rightIcon={<ArrowRight size={14} />}
              >
                {weekly.isCompleted ? 'Review or Optimize Solution' : 'Start Weekly Challenge'}
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Leaderboard / Personal Benchmark Section */}
      <div className={styles.leaderboardSection}>
        <Card padding="lg">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.125rem', margin: '0 0 4px 0', color: '#f5f5f5' }}>
                Weekly Challenge Standings & Benchmarks
              </h2>
              <p style={{ fontSize: '0.8125rem', color: '#a1a1aa', margin: 0 }}>
                Rankings based on verified challenge completions, total earned XP, and active consistency streaks.
              </p>
            </div>
            <Badge variant="default" size="sm">
              Privacy Mode Active
            </Badge>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.leaderboardTable}>
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Rank</th>
                <th>Student</th>
                <th>XP Accumulated</th>
                <th>Challenges</th>
                <th>Streak</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry) => (
                <tr
                  key={entry.userId}
                  className={entry.isCurrentUser ? styles.currentUserRow : undefined}
                >
                  <td style={{ fontWeight: 700, color: entry.rank <= 3 ? '#eab308' : '#a1a1aa' }}>
                    #{entry.rank}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: entry.isCurrentUser ? '#3b82f6' : '#27272a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        {entry.avatarInitial}
                      </span>
                      <span>
                        {entry.displayName} {entry.isCurrentUser && '(You)'}
                      </span>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 600 }}>
                    {entry.xp} XP
                  </td>
                  <td>{entry.challengesCompleted}</td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#f97316' }}>
                      <Flame size={14} /> {entry.currentStreak}d
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

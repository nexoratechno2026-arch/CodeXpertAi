import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Code2,
  Sparkles,
  ArrowRight,
  Compass,
  CheckCircle,
  Inbox,
  Lightbulb,
  Database,
  Terminal,
  Activity,
  Layers,
  Calendar,
  Flame,
  Settings,
  Target,
  PlayCircle,
  Trophy,
  Award,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { getSkillLevelLabel } from '@/types/skill';
import { SKILL_CATEGORIES, StudentUnifiedAnalytics, ConfidenceState, AdaptiveRecommendation } from '@/types/analytics';
import { computeStudentAnalytics, getCachedAnalytics } from '@/services/analyticsService';
import { evaluateStudentSkills, UnifiedSkillAssessmentReport } from '@/services/skillEngine';
import { generateAdaptiveRecommendations, saveDismissedRecommendation } from '@/services/recommendationEngine';
import { getLocalStudyPlan, createPersonalizedStudyPlan, recomputePlanProgress } from '@/services/studyPlanService';
import { StudyPlan } from '@/types/studyPlan';
import { LearningCoachPanel } from '@/components/coach/LearningCoachPanel';
import { StudyPlanCard } from '@/components/study/StudyPlanCard';
import { getSubmissionsForUser, getProblems } from '@/services/codelabService';
import { getUserInterviewHistory } from '@/services/interviewService';
import {
  computeGamificationState,
  GamificationState,
  getLocalGamificationState,
  saveLocalGamificationState,
} from '@/services/gamificationService';
import { calculateLearningStreak } from '@/services/streakService';
import {
  getDailyChallenge,
  evaluateChallengeState,
  getLocalCompletedChallengeIds,
} from '@/services/challengeService';
import { CodingChallenge, StreakInfo } from '@/types/gamification';
import styles from './DashboardPage.module.css';

export const DashboardPage: React.FC = () => {
  const { user, profile } = useAuth();

  const studentName = profile?.fullName || user?.displayName || 'Student';
  const selectedLevel = profile?.selectedLevel || 'beginner';
  const preferredLang = profile?.preferredLanguage || 'python';
  const targetRole = profile?.targetRole || 'Software Engineer';
  const learningGoals = profile?.learningGoals || '';
  const currentStreak = profile?.stats?.currentStreak ?? 0;

  const initials = studentName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'ST';

  const [analytics, setAnalytics] = useState<StudentUnifiedAnalytics | null>(() =>
    user ? getCachedAnalytics(user.uid) : null
  );
  const [assessment, setAssessment] = useState<UnifiedSkillAssessmentReport | null>(null);
  const [adaptiveRecs, setAdaptiveRecs] = useState<AdaptiveRecommendation[]>([]);
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(() =>
    user ? getLocalStudyPlan(user.uid) : null
  );
  const [gamification, setGamification] = useState<GamificationState | null>(() =>
    user ? getLocalGamificationState(user.uid) : null
  );
  const [streakInfo, setStreakInfo] = useState<StreakInfo | null>(null);
  const [dailyChallenge, setDailyChallenge] = useState<CodingChallenge | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      if (!user) return;
      try {
        setLoading(true);
        const [data, subs, ints, probsData] = await Promise.all([
          computeStudentAnalytics(user.uid),
          getSubmissionsForUser(user.uid),
          getUserInterviewHistory(user.uid),
          getProblems({ pageSize: 100 }),
        ]);

        setAnalytics(data);

        // Compute deep skill assessment
        const evalReport = evaluateStudentSkills(user.uid, subs, ints, probsData.problems);
        setAssessment(evalReport);

        // Compute validated adaptive recommendations
        const recs = generateAdaptiveRecommendations(user.uid, evalReport, targetRole);
        setAdaptiveRecs(recs);

        // Load or auto-initialize personalized study plan
        let plan = getLocalStudyPlan(user.uid);
        if (plan) {
          plan = recomputePlanProgress(plan, subs, ints);
          setStudyPlan(plan);
        } else {
          const newPlan = await createPersonalizedStudyPlan(
            user.uid,
            {
              targetRole,
              focusTopics: learningGoals ? learningGoals.split(',').map((s) => s.trim()) : ['Algorithms', 'System Design'],
              weeklyHours: 5,
              preferredDays: [1, 3, 5],
            },
            subs,
            ints
          );
          setStudyPlan(newPlan);
          plan = newPlan;
        }

        // Phase 9: Compute Gamification, Streak & Challenges
        const streak = calculateLearningStreak(subs, ints);
        setStreakInfo(streak);

        const completedChallengeIds = getLocalCompletedChallengeIds(user.uid);
        const evalDaily = evaluateChallengeState(getDailyChallenge(), subs);
        setDailyChallenge(evalDaily);

        const gam = computeGamificationState(
          user.uid,
          subs,
          ints,
          completedChallengeIds,
          plan,
          streak
        );
        setGamification(gam);
        saveLocalGamificationState(gam);
      } catch (err) {
        console.warn('[DashboardPage] Dashboard loading failed:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [user, targetRole, learningGoals]);

  const handleDismissRecommendation = (recId: string) => {
    if (!user) return;
    saveDismissedRecommendation(user.uid, recId);
    setAdaptiveRecs((prev) => prev.filter((r) => r.id !== recId));
  };

  const getConfidenceBadge = (state: ConfidenceState) => {
    switch (state) {
      case 'demonstrated_consistently':
        return <Badge variant="success" size="sm">Demonstrated Consistently</Badge>;
      case 'developing':
        return <Badge variant="accent" size="sm">Developing</Badge>;
      case 'starting_out':
        return <Badge variant="warning" size="sm">Starting Out</Badge>;
      default:
        return <Badge variant="default" size="sm">Not Assessed</Badge>;
    }
  };

  const isBrandNewAccount =
    (analytics?.totalCodeLabAttempted ?? 0) === 0 &&
    (analytics?.totalInterviewsCompleted ?? 0) === 0;

  return (
    <div className={styles.dashboard}>
      {/* 1. Welcome & Learning Overview Header */}
      <section className={styles.welcomeSection}>
        <div className={styles.welcomeText}>
          <div className={styles.userHeaderRow}>
            <div className={styles.avatarCircle} title={studentName}>
              {initials}
            </div>
            <div className={styles.userMeta}>
              <div className={styles.levelBadgeRow}>
                <Badge variant={selectedLevel} size="sm">
                  {getSkillLevelLabel(selectedLevel)}
                </Badge>
                <span className={styles.langPill}>{preferredLang.toUpperCase()}</span>
                <Link to="/profile" className={styles.settingsLinkBtn} title="Account & Preferences">
                  <Settings size={12} />
                  Settings
                </Link>
              </div>
              <h1 className={styles.welcomeTitle} style={{ margin: 0 }}>
                Welcome back, {studentName}
              </h1>
            </div>
          </div>

          <div className={styles.goalsPillRow}>
            <span className={styles.goalPill}>
              <Target size={12} />
              Target: {targetRole}
            </span>
            {learningGoals && (
              <span className={styles.goalPill} style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.25)', color: '#6ee7b7' }}>
                Goals: {learningGoals}
              </span>
            )}
          </div>

          <p className={styles.welcomeDesc} style={{ marginTop: '0.75rem' }}>
            Your unified command center for technical mastery. Track objective coding submissions,
            rehearse mock interviews, and follow evidence-grounded skill recommendations.
          </p>

          {/* Phase 9: XP & Level Banner */}
          <div className={styles.xpLevelBanner}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ backgroundColor: 'rgba(234, 179, 8, 0.15)', padding: '6px', borderRadius: '6px', color: '#eab308' }}>
                  <Zap size={16} />
                </div>
                <div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    Level {gamification?.levelInfo.level ?? 1}: {gamification?.levelInfo.title ?? 'Apprentice'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginLeft: '8px' }}>
                    ({gamification?.levelInfo.currentXP ?? 0} Total XP)
                  </span>
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span>
                  {gamification?.levelInfo.xpInCurrentLevel ?? 0} / {gamification?.levelInfo.xpRequiredForNextLevel ?? 100} XP to Lvl {(gamification?.levelInfo.level ?? 1) + 1}
                </span>
                <Link to="/codelab/challenges" style={{ color: 'var(--color-accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                  <Trophy size={13} />
                  Leaderboard
                </Link>
              </div>
            </div>
            <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--color-bg-tertiary)', borderRadius: '9999px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${gamification?.levelInfo.progressPercent ?? 0}%`,
                  backgroundColor: '#eab308',
                  borderRadius: '9999px',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>
        </div>

        {/* Genuine Verified Metrics */}
        <div className={styles.statsRow}>
          <div className={styles.statBox}>
            <div className={styles.statIconCode}>
              <CheckCircle size={16} />
            </div>
            <div className={styles.statData}>
              <span className={styles.statVal}>
                {analytics?.totalCodeLabAccepted ?? 0}
                <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 'normal' }}>
                  /{analytics?.totalCodeLabAttempted ?? 0}
                </span>
              </span>
              <span className={styles.statLabel}>Problems Solved</span>
            </div>
          </div>

          <div className={styles.statBox}>
            <div className={styles.statIconInterview}>
              <Sparkles size={16} />
            </div>
            <div className={styles.statData}>
              <span className={styles.statVal}>{analytics?.totalInterviewsCompleted ?? 0}</span>
              <span className={styles.statLabel}>Interviews Taken</span>
            </div>
          </div>

          <div className={styles.statBox}>
            <div className={styles.statIconStreak}>
              <Flame size={16} />
            </div>
            <div className={styles.statData}>
              <span className={styles.statVal}>{streakInfo?.currentStreak ?? currentStreak}</span>
              <span className={styles.statLabel}>Day Streak</span>
            </div>
          </div>

          <div className={styles.statBox}>
            <div style={{ color: '#60a5fa', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '8px', borderRadius: '6px', display: 'flex' }}>
              <Calendar size={16} />
            </div>
            <div className={styles.statData}>
              <span className={styles.statVal}>{analytics?.overallConsistencyDays ?? 0}</span>
              <span className={styles.statLabel}>Active Days</span>
            </div>
          </div>
        </div>
      </section>

      {/* Brand New Student Quick-Start Prompt */}
      {isBrandNewAccount && !loading && (
        <Card padding="md" style={{ border: '1px solid var(--color-accent)', backgroundColor: 'rgba(59, 130, 246, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PlayCircle size={18} color="var(--color-accent)" />
              Get Started with Your First Challenge
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
              Complete an algorithmic problem in CodeLab or run a mock interview to calibrate your personal skill profile.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link to="/codelab/problems">
              <Button variant="primary" size="sm">Start Coding</Button>
            </Link>
            <Link to="/interview/setup">
              <Button variant="secondary" size="sm">Mock Interview</Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Phase 9: Daily Challenge & Achievements Showcase */}
      <section className={styles.gamificationGridSection}>
        {/* Daily Challenge Card */}
        <Card padding="md" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ backgroundColor: 'rgba(234, 179, 8, 0.15)', color: '#eab308', padding: '6px', borderRadius: '6px' }}>
                  <Trophy size={16} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--color-text-primary)' }}>
                    Daily Coding Challenge
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                    Deterministic daily UTC challenge • +{dailyChallenge?.xpReward ?? 100} XP
                  </span>
                </div>
              </div>
              {dailyChallenge?.isCompleted ? (
                <Badge variant="success" size="sm">
                  Completed
                </Badge>
              ) : (
                <Badge variant={dailyChallenge?.difficulty ?? 'beginner'} size="sm">
                  {dailyChallenge?.difficulty ?? 'beginner'}
                </Badge>
              )}
            </div>

            <p style={{ margin: '0 0 12px 0', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {dailyChallenge?.title ?? 'Daily Algorithm Challenge'}
            </p>

            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              {dailyChallenge?.isCompleted
                ? `You conquered today's challenge! Best runtime: ${dailyChallenge.bestRuntimeMs ?? '—'} ms. Great job maintaining your streak!`
                : 'Solve with all test cases accepted to claim your bonus XP and advance your daily learning streak.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link to={dailyChallenge ? `/codelab/problems/${dailyChallenge.problemSlug || dailyChallenge.problemId}` : '/codelab/challenges'}>
              <Button variant={dailyChallenge?.isCompleted ? 'secondary' : 'primary'} size="sm">
                {dailyChallenge?.isCompleted ? 'Review Solution' : 'Solve Daily Challenge'}
              </Button>
            </Link>
            <Link to="/codelab/challenges" style={{ fontSize: '0.8125rem', color: 'var(--color-accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Weekly & Leaderboard
              <ArrowRight size={13} />
            </Link>
          </div>
        </Card>

        {/* Badges & Achievements Card */}
        <Card padding="md" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', padding: '6px', borderRadius: '6px' }}>
                  <Award size={16} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--color-text-primary)' }}>
                    Verified Achievements
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                    Evidence-backed unlocks • {gamification?.badges.filter((b) => b.isUnlocked).length ?? 0} of {gamification?.badges.length ?? 10} unlocked
                  </span>
                </div>
              </div>
              <Badge variant="accent" size="sm">
                {(gamification?.badges.filter((b) => b.isUnlocked).length ?? 0)} / {(gamification?.badges.length ?? 10)}
              </Badge>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '12px 0' }}>
              {gamification?.badges.slice(0, 6).map((badge) => (
                <div
                  key={badge.id}
                  className={`${styles.badgePill} ${badge.isUnlocked ? styles.badgePillUnlocked : ''}`}
                  title={badge.description}
                >
                  <span>{badge.icon}</span>
                  <span style={{ fontWeight: badge.isUnlocked ? 600 : 400 }}>{badge.title}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link to="/interview/simulator">
              <Button variant="secondary" size="sm">
                Mock Simulator
              </Button>
            </Link>
            <Link to="/codelab/challenges" style={{ fontSize: '0.8125rem', color: 'var(--color-accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All Badges
              <ArrowRight size={13} />
            </Link>
          </div>
        </Card>
      </section>

      {/* Phase 8: AI Learning Coach & Active Study Plan Grid */}
      <section className={styles.coachGridSection}>
        <LearningCoachPanel assessment={assessment} />
        <StudyPlanCard plan={studyPlan} onPlanUpdated={setStudyPlan} />
      </section>

      {/* 2. Adaptive Recommendations */}
      <section className={styles.skillSection}>
        <div className={styles.sectionHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lightbulb size={18} color="#3b82f6" />
            <h2 className={styles.sectionTitle} style={{ margin: 0 }}>
              Adaptive Recommendations
            </h2>
          </div>
          <p className={styles.sectionSub}>
            Deterministic next steps derived directly from your CodeLab and InterviewAI activity.
          </p>
        </div>

        {loading && !analytics ? (
          <Card padding="md" style={{ textAlign: 'center', padding: '2rem' }}>
            <Spinner size="md" />
            <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>
              Evaluating skill evidence and compiling recommendations...
            </p>
          </Card>
        ) : (adaptiveRecs.length > 0 || (analytics?.recommendations && analytics.recommendations.length > 0)) ? (
          <div className={styles.recommendationsGrid}>
            {(adaptiveRecs.length > 0 ? adaptiveRecs : (analytics?.recommendations || [])).map((rec) => (
              <Card key={rec.id} padding="md" className={styles.recCard}>
                <div className={styles.recHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Badge variant="accent" size="sm">
                      {rec.type === 'codelab_problem' ? 'CodeLab Practice' : rec.type === 'foundation_review' ? 'Revision' : 'Interview Prep'}
                    </Badge>
                    <Badge variant={rec.difficulty} size="sm">
                      {getSkillLevelLabel(rec.difficulty)}
                    </Badge>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.6875rem', color: '#6b7280', textTransform: 'uppercase' }}>
                      Target: {rec.targetSkillName}
                    </span>
                    <button
                      className={styles.dismissBtn}
                      onClick={() => handleDismissRecommendation(rec.id)}
                      title="Dismiss this recommendation"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>

                <h3 className={styles.recTitle}>{rec.title}</h3>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>{rec.description}</p>

                <div className={styles.recReason}>
                  <strong>Why this was recommended:</strong> {rec.reason}
                </div>

                <div className={styles.recFooter}>
                  <Link to={rec.actionUrl}>
                    <Button variant="primary" size="sm" rightIcon={<ArrowRight size={13} />}>
                      {rec.actionLabel}
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card padding="md">
            <p style={{ fontSize: '0.8125rem', color: '#9ca3af', margin: 0 }}>
              Complete an initial CodeLab problem or mock interview to unlock personalized practice recommendations.
            </p>
          </Card>
        )}
      </section>

      {/* 3. Unified Skill Intelligence Map */}
      <section className={styles.skillSection}>
        <div className={styles.sectionHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} color="#3b82f6" />
            <h2 className={styles.sectionTitle} style={{ margin: 0 }}>
              Unified Skill Intelligence Map
            </h2>
          </div>
          <p className={styles.sectionSub}>
            Transparent multi-dimensional mastery tracking. Objective code execution and subjective interview evaluations remain distinct.
          </p>
        </div>

        {analytics && (
          <div className={styles.skillCategoriesLayout}>
            {SKILL_CATEGORIES.map((cat) => {
              const categorySkills = Object.values(analytics.skills).filter(
                (s) => s.category === cat.id
              );
              if (categorySkills.length === 0) return null;

              return (
                <div key={cat.id} className={styles.skillCategoryBlock}>
                  <div className={styles.categoryBlockTitle}>
                    {cat.id === 'programming_fundamentals' && <Terminal size={14} />}
                    {cat.id === 'programming_languages' && <Code2 size={14} />}
                    {cat.id === 'databases_and_sql' && <Database size={14} />}
                    {cat.id === 'interview_skills' && <Sparkles size={14} />}
                    <span>{cat.title}</span>
                  </div>

                  <div className={styles.skillsGrid}>
                    {categorySkills.map((s) => (
                      <Card key={s.skillId} padding="md" className={styles.skillCard}>
                        <div className={styles.skillCardHeader}>
                          <h4 className={styles.skillTitle}>{s.skillName}</h4>
                          {getConfidenceBadge(s.confidenceState)}
                        </div>

                        <div className={styles.evidenceGrid}>
                          <div className={styles.evidenceItem}>
                            <span className={styles.evidenceLabel}>CodeLab Solved</span>
                            <span className={styles.evidenceVal}>
                              {s.codeLabProblemsSolved} / {s.codeLabProblemsAttempted}
                            </span>
                          </div>
                          <div className={styles.evidenceItem}>
                            <span className={styles.evidenceLabel}>Interview Score</span>
                            <span className={styles.evidenceVal}>
                              {typeof s.averageInterviewScore === 'number'
                                ? `${s.averageInterviewScore}/100`
                                : '—'}
                            </span>
                          </div>
                          <div className={styles.evidenceItem} style={{ gridColumn: 'span 2' }}>
                            <span className={styles.evidenceLabel}>Recommended Level</span>
                            <span className={styles.evidenceVal}>
                              {getSkillLevelLabel(s.recommendedDifficulty)}
                            </span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Two Core Modules Overview Grid */}
      <div className={styles.modulesGrid}>
        {/* CodeLab Summary Card */}
        <Card className={styles.moduleCard} padding="lg">
          <div className={styles.moduleHeader}>
            <div className={styles.moduleHeaderLeft}>
              <div className={styles.moduleIconCode}>
                <Code2 size={20} />
              </div>
              <div>
                <h2 className={styles.moduleTitle}>Nexora CodeLab</h2>
                <span className={styles.moduleSubtitle}>Structured Programming Assessment</span>
              </div>
            </div>
            <Link to="/codelab">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight size={14} />}>
                Catalog
              </Button>
            </Link>
          </div>

          <p className={styles.moduleDesc}>
            Practice algorithmic problem solving in Monaco Editor across 14 topic domains with real sandboxed compiler feedback.
          </p>

          <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', gap: '8px' }}>
            <Link to="/codelab/problems">
              <Button variant="secondary" size="sm">Browse Problems</Button>
            </Link>
            <Link to="/codelab/submissions">
              <Button variant="ghost" size="sm">Submission History</Button>
            </Link>
          </div>
        </Card>

        {/* InterviewAI Summary Card */}
        <Card className={styles.moduleCard} padding="lg">
          <div className={styles.moduleHeader}>
            <div className={styles.moduleHeaderLeft}>
              <div className={styles.moduleIconInterview}>
                <Sparkles size={20} />
              </div>
              <div>
                <h2 className={styles.moduleTitle}>Nexora InterviewAI</h2>
                <span className={styles.moduleSubtitle}>AI-Powered Mock Practice Engine</span>
              </div>
            </div>
            <Link to="/interview">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight size={14} />}>
                Hub
              </Button>
            </Link>
          </div>

          <p className={styles.moduleDesc}>
            Rehearse technical concept explanation, SQL architecture, and STAR behavioral scenarios with comprehensive rubric evaluations.
          </p>

          <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', gap: '8px' }}>
            <Link to="/interview/setup">
              <Button variant="primary" size="sm">Configure Interview</Button>
            </Link>
            <Link to="/learning-paths">
              <Button variant="secondary" size="sm" leftIcon={<Compass size={14} />}>
                Learning Paths
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* 5. Unified Chronological Activity Feed */}
      <section className={styles.recentSection}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={18} color="#3b82f6" />
          <h2 className={styles.recentTitle}>Unified Recent Activity Feed</h2>
        </div>

        {analytics && analytics.recentActivity.length > 0 ? (
          <div className={styles.feedList}>
            {analytics.recentActivity.map((item) => (
              <Link key={item.id} to={item.linkUrl} className={styles.feedItem}>
                <div className={styles.feedLeft}>
                  <Badge variant={item.badgeVariant} size="sm">
                    {item.source === 'codelab' ? 'CodeLab' : 'InterviewAI'}
                  </Badge>
                  <div>
                    <span className={styles.feedTitle}>{item.title}</span>
                    <span style={{ margin: '0 6px', color: '#4b5563' }}>•</span>
                    <span className={styles.feedDetail}>{item.detail}</span>
                  </div>
                </div>
                <span className={styles.feedTime}>
                  {new Date(item.timestamp).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <Card padding="md" className={styles.recentEmpty}>
            <Inbox size={28} className={styles.recentEmptyIcon} />
            <span className={styles.recentEmptyText}>No recorded learning activity yet</span>
            <span className={styles.recentEmptySub}>
              Solve a CodeLab challenge or launch an InterviewAI session to begin building your activity record.
            </span>
          </Card>
        )}
      </section>
    </div>
  );
};

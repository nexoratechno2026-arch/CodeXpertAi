import React from 'react';
import { Link } from 'react-router-dom';
import {
  Code2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Terminal,
  Cpu,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SKILL_LEVELS } from '@/types/skill';
import styles from './LandingPage.module.css';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className={styles.landing}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            <div className={styles.badgeWrapper}>
              <Badge variant="accent" size="md">
                Official CodeXpertai Platform
              </Badge>
            </div>
            <h1 className={styles.heroTitle}>
              Master Coding Practice & AI Technical Interviews.
              <span className={styles.heroAccent}> One Unified Workspace.</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Engineered for serious software students and career preparation.
              Solve algorithmic challenges in a dedicated Monaco-powered editor and undergo
              adaptive technical mock interviews with structured AI evaluations.
            </p>

            <div className={styles.heroCtas}>
              {user ? (
                <Link to="/dashboard">
                  <Button variant="primary" size="lg" rightIcon={<ArrowRight size={16} />}>
                    Go to Student Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/signup">
                    <Button variant="primary" size="lg" rightIcon={<ArrowRight size={16} />}>
                      Create Student Account
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="secondary" size="lg">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>

            <div className={styles.metaRow}>
              <div className={styles.metaItem}>
                <CheckCircle2 size={15} className={styles.metaIcon} />
                <span>Single Shared Profile</span>
              </div>
              <div className={styles.metaItem}>
                <CheckCircle2 size={15} className={styles.metaIcon} />
                <span>5-Tier Topic Progression</span>
              </div>
              <div className={styles.metaItem}>
                <CheckCircle2 size={15} className={styles.metaIcon} />
                <span>Sandboxed Execution Security</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Two Modules Section */}
      <section className={styles.modulesSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>Integrated Architecture</span>
            <h2 className={styles.sectionTitle}>Two Core Modules. One Seamless Ecosystem.</h2>
            <p className={styles.sectionDesc}>
              No separate websites, fragmented logins, or mismatched profiles. CodeLab and InterviewAI share your progress, analytics, and skill records.
            </p>
          </div>

          <div className={styles.moduleGrid}>
            {/* CodeLab Card */}
            <Card className={styles.moduleCard} padding="lg">
              <div className={styles.cardIconHeader}>
                <div className={styles.cardIconBlue}>
                  <Code2 size={24} />
                </div>
                <Badge variant="accent" size="sm">Assessment & Practice</Badge>
              </div>

              <h3 className={styles.moduleCardTitle}>Nexora CodeLab</h3>
              <p className={styles.moduleCardDesc}>
                Structured coding practice across topics including Data Structures, Algorithms, SQL, and System Design.
                Integrated with Monaco Editor and an isolated execution sandbox.
              </p>

              <ul className={styles.featureList}>
                <li>
                  <Terminal size={15} />
                  <span>Monaco Editor with multi-language syntax highlighting</span>
                </li>
                <li>
                  <Cpu size={15} />
                  <span>Sandboxed execution with isolated time & memory limits</span>
                </li>
                <li>
                  <Layers size={15} />
                  <span>Private automated test cases with anti-cheat security</span>
                </li>
              </ul>

              <div className={styles.moduleAction}>
                <Link to="/codelab">
                  <Button variant="secondary" rightIcon={<ArrowRight size={15} />}>
                    Explore CodeLab
                  </Button>
                </Link>
              </div>
            </Card>

            {/* InterviewAI Card */}
            <Card className={styles.moduleCard} padding="lg">
              <div className={styles.cardIconHeader}>
                <div className={styles.cardIconPurple}>
                  <Sparkles size={24} />
                </div>
                <Badge variant="success" size="sm">Technical Mock Interviews</Badge>
              </div>

              <h3 className={styles.moduleCardTitle}>Nexora InterviewAI</h3>
              <p className={styles.moduleCardDesc}>
                Simulate authentic technical, programming, SQL, HR, and behavioral interview sessions.
                Dynamic question generation adapts in real-time to your responses with objective scoring.
              </p>

              <ul className={styles.featureList}>
                <li>
                  <Terminal size={15} />
                  <span>5 interview categories: Technical, Coding, SQL, HR & Behavioral</span>
                </li>
                <li>
                  <ShieldCheck size={15} />
                  <span>Server-side AI orchestration with validated schema reports</span>
                </li>
                <li>
                  <Layers size={15} />
                  <span>Detailed breakdown: strengths, weaknesses, and improvement paths</span>
                </li>
              </ul>

              <div className={styles.moduleAction}>
                <Link to="/interview">
                  <Button variant="secondary" rightIcon={<ArrowRight size={15} />}>
                    Explore InterviewAI
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* 5 Skill Levels Section */}
      <section className={styles.levelsSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>Multi-Dimensional Mastery</span>
            <h2 className={styles.sectionTitle}>Five Product-Wide Skill Levels</h2>
            <p className={styles.sectionDesc}>
              Progress independently across domains. Be intermediate in Python while building foundations in SQL.
            </p>
          </div>

          <div className={styles.levelsGrid}>
            {SKILL_LEVELS.map((level, idx) => (
              <Card key={level.id} className={styles.levelCard} padding="md">
                <div className={styles.levelHeader}>
                  <span className={styles.levelNum}>0{idx + 1}</span>
                  <Badge variant={level.id} size="sm">
                    {level.label}
                  </Badge>
                </div>
                <p className={styles.levelDesc}>{level.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className={styles.ctaSection}>
        <div className="container">
          <Card className={styles.ctaCard} padding="lg">
            <h2 className={styles.ctaTitle}>Ready to begin your preparation?</h2>
            <p className={styles.ctaDesc}>
              Create your unified student profile to access coding problems and configure your first mock interview.
            </p>
            <div className={styles.ctaButtons}>
              <Link to="/signup">
                <Button variant="primary" size="lg" rightIcon={<ArrowRight size={16} />}>
                  Register as Student
                </Button>
              </Link>
              <Link to="/codelab">
                <Button variant="secondary" size="lg">
                  Browse Problem Sets
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

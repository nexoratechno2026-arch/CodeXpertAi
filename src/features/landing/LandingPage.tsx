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
  BookOpen,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SEOHead } from '@/components/seo/SEOHead';
import { getOrganizationSchema, getWebSiteSchema, getSoftwareApplicationSchema, getFAQPageSchema } from '@/lib/seo';
import { SKILL_LEVELS } from '@/types/skill';
import styles from './LandingPage.module.css';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();

  const orgSchema = getOrganizationSchema();
  const siteSchema = getWebSiteSchema();
  const softwareSchema = getSoftwareApplicationSchema();

  const homepageFaqs = [
    {
      question: 'What is CodeXpertAI?',
      answer: 'CodeXpertAI is a unified developer platform combining structured coding practice with AI-guided mock interviews, created and published by Nexora Techno.',
    },
    {
      question: 'Can users execute code and review test results on CodeXpertAI?',
      answer: 'Yes. CodeLab features an in-browser Monaco editor and isolated sandboxed execution across Python, JavaScript, TypeScript, Java, C++, and Go with granular test results.',
    },
    {
      question: 'How do AI-guided mock interviews work on InterviewAI?',
      answer: 'InterviewAI simulates realistic hiring loops across Technical Concepts, Live Coding, System Architecture, SQL, and STAR Behavioral categories with real-time feedback and diagnostic scoring.',
    },
  ];

  const faqSchema = getFAQPageSchema(homepageFaqs);

  return (
    <div className={styles.landing}>
      <SEOHead
        title="CodeXpertAI — Coding Practice &amp; AI Mock Interviews"
        description="Practice coding problems, execute code, review test results, track your submissions, and prepare for technical interviews with AI-guided mock interviews on CodeXpertAI, a product of Nexora Techno."
        canonicalPath="/"
        jsonLd={[orgSchema, siteSchema, softwareSchema, faqSchema]}
      />

      {/* Hero Section */}
      <section className={styles.hero} aria-labelledby="hero-heading">
        <div className="container">
          <div className={styles.heroContent}>
            <div className={styles.badgeWrapper}>
              <Badge variant="accent" size="md">
                CodeXpertAI • A Product of{' '}
                <a
                  href="https://nexoratechno.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#93C5FD', textDecoration: 'underline', marginLeft: '4px' }}
                >
                  Nexora Techno
                </a>
              </Badge>
            </div>
            <h1 id="hero-heading" className={styles.heroTitle}>
              Structured Coding Practice &amp; AI Mock Interviews.
              <span className={styles.heroAccent}> One Unified Platform.</span>
            </h1>
            <p className={styles.heroSubtitle}>
              <strong>CodeXpertAI is a unified developer platform combining structured coding practice with AI-guided mock interviews.</strong> Practice programming problems, execute code, review test results, track your submissions, and prepare for technical interviews with AI-guided interview sessions—all in one platform.
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
                <span>Unified Skill Intelligence</span>
              </div>
              <div className={styles.metaItem}>
                <CheckCircle2 size={15} className={styles.metaIcon} />
                <span>Monaco Editor &amp; Containerized Sandboxes</span>
              </div>
              <div className={styles.metaItem}>
                <CheckCircle2 size={15} className={styles.metaIcon} />
                <span>Created by Nexora Techno</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Two Modules Section */}
      <section className={styles.modulesSection} aria-labelledby="modules-heading">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>Integrated Architecture</span>
            <h2 id="modules-heading" className={styles.sectionTitle}>Two Core Modules. One Seamless Ecosystem.</h2>
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
                <Badge variant="accent" size="sm">Assessment &amp; Practice</Badge>
              </div>

              <h3 className={styles.moduleCardTitle}>CodeXpertAI CodeLab</h3>
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
                  <span>Sandboxed execution with isolated time &amp; memory limits</span>
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

              <h3 className={styles.moduleCardTitle}>CodeXpertAI InterviewAI</h3>
              <p className={styles.moduleCardDesc}>
                Simulate authentic technical, programming, SQL, HR, and behavioral interview sessions.
                Dynamic question generation adapts in real-time to your responses with objective scoring.
              </p>

              <ul className={styles.featureList}>
                <li>
                  <Terminal size={15} />
                  <span>5 interview categories: Technical, Coding, SQL, HR &amp; Behavioral</span>
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
      <section className={styles.levelsSection} aria-labelledby="levels-heading">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>Multi-Dimensional Mastery</span>
            <h2 id="levels-heading" className={styles.sectionTitle}>Five Product-Wide Skill Levels</h2>
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

      {/* Educational Guides Highlight Section */}
      <section className={styles.modulesSection} aria-labelledby="guides-heading">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>Curriculum &amp; Strategy</span>
            <h2 id="guides-heading" className={styles.sectionTitle}>Engineering Preparation Guides</h2>
            <p className={styles.sectionDesc}>
              In-depth articles written to help developers practice algorithmic challenges methodically and excel in technical interviews.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <Card padding="md" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <Badge variant="default" size="sm" style={{ marginBottom: '8px' }}>Interview Preparation</Badge>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: '4px 0 8px 0' }}>
                  How to Prepare for Technical Coding Interviews
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  A structured framework for decomposing algorithms, analyzing Big-O time complexity, and communicating effectively under observation.
                </p>
              </div>
              <Link to="/guides/technical-interview-prep" style={{ marginTop: '16px', color: 'var(--color-accent)', textDecoration: 'none', fontSize: '0.8125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                Read Guide <ArrowRight size={13} />
              </Link>
            </Card>

            <Card padding="md" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <Badge variant="default" size="sm" style={{ marginBottom: '8px' }}>Coding Practice</Badge>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: '4px 0 8px 0' }}>
                  How to Practise Programming Problems Effectively
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  Master active problem analysis, decode sandbox error codes (TLE, MLE, WA), and eliminate knowledge gaps with disciplined reviews.
                </p>
              </div>
              <Link to="/guides/effective-coding-practice" style={{ marginTop: '16px', color: 'var(--color-accent)', textDecoration: 'none', fontSize: '0.8125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                Read Guide <ArrowRight size={13} />
              </Link>
            </Card>

            <Card padding="md" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <Badge variant="default" size="sm" style={{ marginBottom: '8px' }}>AI Interview Insights</Badge>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: '4px 0 8px 0' }}>
                  Mastering AI-Guided Technical &amp; Mock Interviews
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  Understand multi-turn AI interview mechanics, structure STAR behavioral narratives, and turn diagnostic reports into career growth.
                </p>
              </div>
              <Link to="/guides/ai-mock-interview-guide" style={{ marginTop: '16px', color: 'var(--color-accent)', textDecoration: 'none', fontSize: '0.8125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                Read Guide <ArrowRight size={13} />
              </Link>
            </Card>
          </div>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Link to="/guides">
              <Button variant="ghost" size="sm" rightIcon={<BookOpen size={14} />}>
                Browse All Engineering Guides
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions Section (AEO) */}
      <section className={styles.modulesSection} aria-labelledby="faq-heading">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>Direct Answers</span>
            <h2 id="faq-heading" className={styles.sectionTitle}>Frequently Asked Questions</h2>
            <p className={styles.sectionDesc}>
              Clear, factual answers to essential questions about CodeXpertAI, CodeLab, and InterviewAI.
            </p>
          </div>

          <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {homepageFaqs.map((faq, idx) => (
              <Card key={idx} padding="md">
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <HelpCircle size={16} color="var(--color-accent)" />
                  {faq.question}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  {faq.answer}
                </p>
              </Card>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Link to="/faq">
              <Button variant="secondary" size="sm" rightIcon={<ArrowRight size={14} />}>
                View All Frequently Asked Questions
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className={styles.ctaSection}>
        <div className="container">
          <Card className={styles.ctaCard} padding="lg">
            <h2 className={styles.ctaTitle}>Ready to begin your preparation?</h2>
            <p className={styles.ctaDesc}>
              Create your unified student profile to access coding problems and configure your first mock interview on CodeXpertAI, a product of Nexora Techno.
            </p>
            <div className={styles.ctaButtons}>
              <Link to="/signup">
                <Button variant="primary" size="lg" rightIcon={<ArrowRight size={16} />}>
                  Register as Student
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="secondary" size="lg">
                  About CodeXpertAI
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

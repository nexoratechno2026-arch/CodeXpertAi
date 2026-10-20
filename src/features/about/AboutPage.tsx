import React from 'react';
import { Link } from 'react-router-dom';
import {
  Code2,
  Sparkles,
  Building2,
  Users,
  Terminal,
  CheckCircle2,
  ExternalLink,
  Layers,
  ArrowRight,
  ShieldCheck,
  Mail,
  Instagram,
} from 'lucide-react';
import { SEOHead } from '@/components/seo/SEOHead';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getBreadcrumbSchema, getSoftwareApplicationSchema } from '@/lib/seo';
import styles from './About.module.css';

export const AboutPage: React.FC = () => {
  const breadcrumbData = getBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'About', item: '/about' },
  ]);

  const softwareData = getSoftwareApplicationSchema();

  return (
    <div className={styles.aboutPage}>
      <SEOHead
        title="About CodeXpertAI – Developer Practice Platform by Nexora Techno"
        description="Discover CodeXpertAI, an engineering practice and AI mock interview platform developed by Nexora Techno for students, developers, and job seekers."
        canonicalPath="/about"
        jsonLd={[breadcrumbData, softwareData]}
      />

      <div className="container">
        {/* Breadcrumb Navigation */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span style={{ color: 'var(--color-text-primary)' }}>About</span>
        </nav>

        {/* Header Banner */}
        <header className={styles.headerCard}>
          <div className={styles.badgeRow}>
            <Badge variant="accent" size="sm">Product Overview</Badge>
            <Badge variant="default" size="sm">Created by Nexora Techno</Badge>
          </div>
          <h1 className={styles.title}>
            About <span className={styles.titleAccent}>CodeXpertAI</span>
          </h1>
          <p className={styles.subtitle}>
            CodeXpertAI is a unified developer platform combining structured coding practice with AI-guided mock interviews, engineered by Nexora Techno for serious software engineering preparation.
          </p>
        </header>

        {/* Main Content Layout */}
        <div className={styles.contentGrid}>
          {/* Main Column */}
          <div className={styles.mainColumn}>
            {/* 1. What is CodeXpertAI */}
            <section className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>
                <Layers size={20} color="#3B82F6" />
                What is CodeXpertAI?
              </h2>
              <div className={styles.prose}>
                <p>
                  <strong>CodeXpertAI</strong> is a browser-based developer platform built to bridge the gap between algorithmic problem-solving practice and authentic technical mock interviews. Instead of forcing developers to juggle disconnected coding sites, spreadsheets, and arbitrary AI chatbots, CodeXpertAI integrates hands-on coding execution and interactive mock interview evaluations into a unified student record.
                </p>
                <p>
                  The platform consists of two synchronized core experiences:
                </p>
                <ul className={styles.featureList}>
                  <li className={styles.featureItem}>
                    <Code2 size={16} className={styles.featureIcon} />
                    <span><strong>CodeLab:</strong> Structured algorithmic problem sets, Monaco-powered code editor, isolated compilation sandbox, and automated test evaluations.</span>
                  </li>
                  <li className={styles.featureItem}>
                    <Sparkles size={16} className={styles.featureIcon} />
                    <span><strong>InterviewAI:</strong> Realistic, AI-guided technical mock interviews across five disciplines with objective scoring, audio conversation, and diagnostic feedback reports.</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* 2. Publisher Relationship */}
            <section className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>
                <Building2 size={20} color="#3B82F6" />
                Who Created CodeXpertAI?
              </h2>
              <div className={styles.prose}>
                <p>
                  CodeXpertAI was designed, engineered, and published by <strong>Nexora Techno</strong>.
                </p>
                <p>
                  <strong>Official brand relationship:</strong> CodeXpertAI is a software product of Nexora Techno. Nexora Techno is a technology solutions and software engineering company committed to building modern educational and developer tooling.
                </p>
                <p>
                  To explore the parent organization or discover additional technological initiatives, visit the official Nexora Techno website at{' '}
                  <a
                    href="https://nexoratechno.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.corpLink}
                  >
                    https://nexoratechno.in
                    <ExternalLink size={12} />
                  </a>.
                </p>
              </div>
            </section>

            {/* 3. Who is the Product Designed For */}
            <section className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>
                <Users size={20} color="#3B82F6" />
                Who is CodeXpertAI Designed For?
              </h2>
              <div className={styles.prose}>
                <p>
                  CodeXpertAI is engineered specifically for:
                </p>
                <ul className={styles.featureList}>
                  <li className={styles.featureItem}>
                    <CheckCircle2 size={16} className={styles.featureIcon} />
                    <span><strong>Computer Science Students &amp; Self-Taught Learners:</strong> Building foundations in data structures, algorithms, and SQL syntax.</span>
                  </li>
                  <li className={styles.featureItem}>
                    <CheckCircle2 size={16} className={styles.featureIcon} />
                    <span><strong>Aspiring Software Engineers:</strong> Rehearsing live coding, architecture design, and STAR behavioral interview scenarios for internship and full-time hiring loops.</span>
                  </li>
                  <li className={styles.featureItem}>
                    <CheckCircle2 size={16} className={styles.featureIcon} />
                    <span><strong>Experienced Software Developers:</strong> Sharpening core algorithmic efficiency, reviewing system design fundamentals, and maintaining problem-solving velocity.</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* 4. Supported Technologies & Languages */}
            <section className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>
                <Terminal size={20} color="#3B82F6" />
                Supported Programming Languages &amp; Environments
              </h2>
              <div className={styles.prose}>
                <p>
                  CodeLab provides first-class support for multiple standard programming languages through sandboxed compiler containers:
                </p>
                <div className={styles.tagGroup}>
                  <span className={styles.techTag}>Python 3.10+</span>
                  <span className={styles.techTag}>JavaScript (Node.js 20+)</span>
                  <span className={styles.techTag}>TypeScript 5.x</span>
                  <span className={styles.techTag}>Java (OpenJDK 17+)</span>
                  <span className={styles.techTag}>C++ (GCC 12 / C++20)</span>
                  <span className={styles.techTag}>Go 1.21+</span>
                  <span className={styles.techTag}>ANSI SQL (PostgreSQL Syntax)</span>
                </div>
                <p style={{ marginTop: '1rem' }}>
                  All execution runs in secure, containerized runtimes with strict per-problem CPU time and memory caps, ensuring isolated execution and fair evaluation.
                </p>
              </div>
            </section>

            {/* 5. Features Currently Available */}
            <section className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>
                <ShieldCheck size={20} color="#3B82F6" />
                Features Currently Available
              </h2>
              <div className={styles.prose}>
                <p>
                  The active CodeXpertAI release provides the following production-tested capabilities:
                </p>
                <ul className={styles.featureList}>
                  <li className={styles.featureItem}>
                    <CheckCircle2 size={16} className={styles.featureIcon} />
                    <span><strong>Monaco Code Editor:</strong> Syntax highlighting, bracket matching, line numbers, and tab indentation identical to professional desktop IDEs.</span>
                  </li>
                  <li className={styles.featureItem}>
                    <CheckCircle2 size={16} className={styles.featureIcon} />
                    <span><strong>Two-Tier Run &amp; Submit Evaluation:</strong> Run code against visible sample tests for debugging, and submit against private test cases with runtime metrics.</span>
                  </li>
                  <li className={styles.featureItem}>
                    <CheckCircle2 size={16} className={styles.featureIcon} />
                    <span><strong>Adaptive 5-Tier Skill Assessment:</strong> Beginner, Easy, Medium, Hard, and Advanced progression tracked across 14 computer science domains.</span>
                  </li>
                  <li className={styles.featureItem}>
                    <CheckCircle2 size={16} className={styles.featureIcon} />
                    <span><strong>Multi-Category AI Mock Interviews:</strong> Technical Concepts, Live Coding, System Architecture, SQL Queries, and STAR Behavioral evaluation.</span>
                  </li>
                  <li className={styles.featureItem}>
                    <CheckCircle2 size={16} className={styles.featureIcon} />
                    <span><strong>Evidence-Grounded Reports:</strong> Structured performance diagnostics identifying specific strengths, actionable weaknesses, and revision suggestions.</span>
                  </li>
                  <li className={styles.featureItem}>
                    <CheckCircle2 size={16} className={styles.featureIcon} />
                    <span><strong>Study Plans &amp; Learning Streaks:</strong> Deterministic daily challenge targets and calendar tracking to encourage consistent preparation.</span>
                  </li>
                </ul>
              </div>
            </section>
          </div>

          {/* Sidebar Column */}
          <div className={styles.sideColumn}>
            {/* Quick Facts */}
            <div className={styles.sideBox}>
              <h3 className={styles.sideBoxTitle}>Quick Facts</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.8125rem' }}>
                <div>
                  <span style={{ color: '#9CA3AF', display: 'block' }}>Product Name</span>
                  <strong style={{ color: '#F5F5F5' }}>CodeXpertAI</strong>
                </div>
                <div>
                  <span style={{ color: '#9CA3AF', display: 'block' }}>Creator &amp; Publisher</span>
                  <strong style={{ color: '#F5F5F5' }}>Nexora Techno</strong>
                </div>
                <div>
                  <span style={{ color: '#9CA3AF', display: 'block' }}>Brand Attribution</span>
                  <span style={{ color: '#D1D5DB' }}>A product of Nexora Techno</span>
                </div>
                <div>
                  <span style={{ color: '#9CA3AF', display: 'block' }}>Corporate Website</span>
                  <a
                    href="https://nexoratechno.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.corpLink}
                  >
                    nexoratechno.in <ExternalLink size={11} />
                  </a>
                </div>
                <div>
                  <span style={{ color: '#9CA3AF', display: 'block' }}>Platform Access</span>
                  <span style={{ color: '#D1D5DB' }}>Web Application (Free student tier available)</span>
                </div>
              </div>
            </div>

            {/* Contact & Support */}
            <div className={styles.sideBox}>
              <h3 className={styles.sideBoxTitle}>Contact &amp; Support</h3>
              <p style={{ fontSize: '0.8125rem', color: '#9CA3AF', lineHeight: 1.6, margin: '0 0 12px 0' }}>
                Questions regarding platform access, bug reports, feature feedback, or institutional inquiries:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                <a
                  href="mailto:support@codexpertai.in"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#60A5FA',
                    fontSize: '0.8125rem',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  <Mail size={14} />
                  <span>support@codexpertai.in</span>
                </a>
                <a
                  href="https://www.instagram.com/codexpertai_nt/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#F472B6',
                    fontSize: '0.8125rem',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  <Instagram size={14} />
                  <span>@codexpertai_nt</span>
                </a>
              </div>
              <a
                href="https://nexoratechno.in"
                target="_blank"
                rel="noopener noreferrer"
                style={{ width: '100%', display: 'inline-block' }}
              >
                <Button variant="secondary" size="sm" style={{ width: '100%' }} rightIcon={<ExternalLink size={13} />}>
                  Nexora Techno Corporate
                </Button>
              </a>
            </div>

            {/* Call to Action */}
            <div className={styles.sideBox} style={{ border: '1px solid rgba(59, 130, 246, 0.4)', backgroundColor: 'rgba(59, 130, 246, 0.05)' }}>
              <h3 className={styles.sideBoxTitle} style={{ color: '#60A5FA' }}>Start Practicing</h3>
              <p style={{ fontSize: '0.8125rem', color: '#D1D5DB', lineHeight: 1.5, margin: '0 0 14px 0' }}>
                Create your student account or explore algorithmic problems and mock interviews today.
              </p>
              <Link to="/signup" style={{ textDecoration: 'none', display: 'block', marginBottom: '8px' }}>
                <Button variant="primary" size="sm" style={{ width: '100%' }} rightIcon={<ArrowRight size={13} />}>
                  Create Free Account
                </Button>
              </Link>
              <Link to="/codelab" style={{ textDecoration: 'none', display: 'block' }}>
                <Button variant="ghost" size="sm" style={{ width: '100%' }}>
                  Explore CodeLab
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

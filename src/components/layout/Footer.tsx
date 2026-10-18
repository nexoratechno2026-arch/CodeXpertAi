import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.brandBlock}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <img
                src="/codexpertai-logo.png"
                alt="CodeXpertAI"
                style={{ height: '28px', width: '28px', objectFit: 'contain' }}
              />
              <span style={{ fontSize: '1.15rem', fontWeight: 700, color: '#F5F5F5' }}>
                CodeXpert<span style={{ color: '#3B82F6' }}>AI</span>
              </span>
            </div>
            <p className={styles.brandDesc} style={{ marginBottom: '8px' }}>
              A unified developer platform combining structured coding practice with AI-guided mock interviews.
            </p>
            <div style={{ fontSize: '0.8125rem', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>A product of</span>
              <a
                href="https://nexoratechno.in"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#60A5FA', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}
              >
                Nexora Techno
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

          <div className={styles.linksBlock}>
            <div className={styles.column}>
              <span className={styles.colTitle}>Modules</span>
              <Link to="/codelab" className={styles.link}>CodeLab Practice</Link>
              <Link to="/interview" className={styles.link}>InterviewAI Hub</Link>
              <Link to="/learning-paths" className={styles.link}>Learning Paths</Link>
            </div>

            <div className={styles.column}>
              <span className={styles.colTitle}>Resources</span>
              <Link to="/about" className={styles.link}>About CodeXpertAI</Link>
              <Link to="/faq" className={styles.link}>Frequently Asked Questions</Link>
              <Link to="/guides" className={styles.link}>Engineering Guides</Link>
            </div>

            <div className={styles.column}>
              <span className={styles.colTitle}>Platform</span>
              <Link to="/dashboard" className={styles.link}>Student Dashboard</Link>
              <Link to="/profile" className={styles.link}>Skill Profiles</Link>
              <Link to="/login" className={styles.link}>Sign In</Link>
            </div>

            <div className={styles.column}>
              <span className={styles.colTitle}>Legal & Company</span>
              <Link to="/privacy" className={styles.link}>Privacy Policy</Link>
              <Link to="/terms" className={styles.link}>Terms &amp; Conditions</Link>
              <a
                href="https://nexoratechno.in"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                Nexora Techno Corporate <ExternalLink size={11} />
              </a>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <div className={styles.copy}>
            © {new Date().getFullYear()} CodeXpertAI. A product of{' '}
            <a
              href="https://nexoratechno.in"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#9CA3AF', textDecoration: 'underline' }}
            >
              Nexora Techno
            </a>
            . All rights reserved.
          </div>
          <div className={styles.disclaimer}>
            Engineered for software developers, algorithmic practice, and technical interview readiness.
          </div>
        </div>
      </div>
    </footer>
  );
};

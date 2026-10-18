import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.brandBlock}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <img src="/codexpertai-logo.png" alt="CodeXpertai" style={{ height: '28px', width: '28px', objectFit: 'contain' }} />
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#F5F5F5' }}>CodeXpert<span style={{ color: '#3B82F6' }}>ai</span></span>
            </div>
            <p className={styles.brandDesc}>
              An all-in-one developer platform for structured coding practice and AI-powered mock interviews.
            </p>
          </div>

          <div className={styles.linksBlock}>
            <div className={styles.column}>
              <span className={styles.colTitle}>Modules</span>
              <Link to="/codelab" className={styles.link}>CodeXpert CodeLab</Link>
              <Link to="/interview" className={styles.link}>CodeXpert InterviewAI</Link>
              <Link to="/learning-paths" className={styles.link}>Learning Paths</Link>
            </div>
            <div className={styles.column}>
              <span className={styles.colTitle}>Platform</span>
              <Link to="/dashboard" className={styles.link}>Student Dashboard</Link>
              <Link to="/profile" className={styles.link}>Skill Profiles</Link>
              <Link to="/admin" className={styles.link}>Admin Control</Link>
            </div>
            <div className={styles.column}>
              <span className={styles.colTitle}>Legal</span>
              <Link to="/privacy" className={styles.link}>Privacy Policy</Link>
              <Link to="/terms" className={styles.link}>Terms &amp; Conditions</Link>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <div className={styles.copy}>
            © {new Date().getFullYear()} CodeXpertai. All rights reserved.
          </div>
          <div className={styles.disclaimer}>
            An all-in-one developer platform for structured coding practice and AI-powered mock interviews.
          </div>
        </div>
      </div>
    </footer>
  );
};

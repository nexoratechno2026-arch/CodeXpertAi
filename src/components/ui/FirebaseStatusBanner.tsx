import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Terminal } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import styles from './FirebaseStatusBanner.module.css';

export const FirebaseStatusBanner: React.FC = () => {
  const { firebaseStatus } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  // If live configured, only show subtle indicator if emulators are active
  if (firebaseStatus.isConfigured) {
    if (!firebaseStatus.usingEmulators) return null;

    return (
      <div className={styles.emulatorBanner} role="status">
        <div className={styles.inner}>
          <CheckCircle2 size={15} className={styles.emulatorIcon} />
          <span>Connected to local Firebase Emulators (Auth: 9099, Firestore: 8080)</span>
          <button
            onClick={() => setDismissed(true)}
            className={styles.closeBtn}
            aria-label="Dismiss banner"
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  return (
    <aside className={styles.banner} aria-label="Firebase Configuration Notice">
      <div className={styles.inner}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <AlertCircle size={16} className={styles.alertIcon} />
            <span className={styles.title}>
              Firebase Not Connected — Running in Scaffolding Mode
            </span>
          </div>
          <div className={styles.actions}>
            <button
              onClick={() => setExpanded((prev) => !prev)}
              className={styles.toggleBtn}
              aria-expanded={expanded}
            >
              {expanded ? (
                <>
                  <span>Hide Details</span>
                  <ChevronUp size={14} />
                </>
              ) : (
                <>
                  <span>Setup Guide</span>
                  <ChevronDown size={14} />
                </>
              )}
            </button>
            <button
              onClick={() => setDismissed(true)}
              className={styles.closeBtn}
              aria-label="Dismiss notice"
            >
              ×
            </button>
          </div>
        </div>

        {expanded && (
          <div className={styles.details}>
            <p className={styles.desc}>
              The application UI, forms, validation, and route guards are fully operational.
              To connect live Firebase Authentication and Firestore:
            </p>
            <div className={styles.steps}>
              <div className={styles.step}>
                <span className={styles.stepNum}>1</span>
                <span>Copy <code>.env.example</code> to <code>.env</code> in the project root.</span>
              </div>
              <div className={styles.step}>
                <span className={styles.stepNum}>2</span>
                <span>Enter your approved Firebase project credentials (never commit real secrets).</span>
              </div>
              <div className={styles.step}>
                <span className={styles.stepNum}>3</span>
                <span>
                  For local emulator testing, run:
                  <div className={styles.commandBox}>
                    <Terminal size={13} />
                    <code>firebase emulators:start</code>
                  </div>
                </span>
              </div>
            </div>
            {firebaseStatus.missingKeys.length > 0 && (
              <div className={styles.missingList}>
                <span className={styles.missingTitle}>Missing configuration variables:</span>
                <ul>
                  {firebaseStatus.missingKeys.map((key) => (
                    <li key={key}><code>{key}</code></li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};

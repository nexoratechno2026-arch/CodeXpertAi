import React from 'react';
import styles from './Spinner.module.css';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  label = 'Loading...',
  className = '',
}) => {
  return (
    <div className={`${styles.wrapper} ${className}`} role="status">
      <span className={`${styles.spinner} ${styles[size]}`} aria-hidden="true" />
      <span className={styles.srOnly}>{label}</span>
      {label && size === 'lg' && <span className={styles.label}>{label}</span>}
    </div>
  );
};

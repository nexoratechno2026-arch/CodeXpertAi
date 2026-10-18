import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Code2,
  ListTodo,
  History,
  Sparkles,
  Settings2,
  Compass,
  UserCheck,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import styles from './Sidebar.module.css';

export const Sidebar: React.FC = () => {
  const { isAdmin } = useAuth();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `${styles.item} ${isActive ? styles.itemActive : ''}`;

  return (
    <aside className={styles.sidebar} aria-label="Sidebar Navigation">
      <div className={styles.section}>
        <span className={styles.sectionHeader}>Overview</span>
        <NavLink to="/dashboard" className={linkClass} end>
          <LayoutDashboard size={16} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/learning-paths" className={linkClass}>
          <Compass size={16} />
          <span>Learning Paths</span>
        </NavLink>
      </div>

      <div className={styles.section}>
        <span className={styles.sectionHeader}>Nexora CodeLab</span>
        <NavLink to="/codelab" className={linkClass} end>
          <Code2 size={16} />
          <span>CodeLab Overview</span>
        </NavLink>
        <NavLink to="/codelab/problems" className={linkClass}>
          <ListTodo size={16} />
          <span>Problem Library</span>
        </NavLink>
        <NavLink to="/codelab/submissions" className={linkClass}>
          <History size={16} />
          <span>My Submissions</span>
        </NavLink>
      </div>

      <div className={styles.section}>
        <span className={styles.sectionHeader}>Nexora InterviewAI</span>
        <NavLink to="/interview" className={linkClass} end>
          <Sparkles size={16} />
          <span>Interview Overview</span>
        </NavLink>
        <NavLink to="/interview/setup" className={linkClass}>
          <Settings2 size={16} />
          <span>Setup Mock Session</span>
        </NavLink>
      </div>

      <div className={styles.section}>
        <span className={styles.sectionHeader}>Account</span>
        <NavLink to="/profile" className={linkClass}>
          <UserCheck size={16} />
          <span>Student Profile</span>
        </NavLink>
        {isAdmin && (
          <NavLink to="/admin" className={linkClass}>
            <ShieldCheck size={16} />
            <span>Admin Portal</span>
          </NavLink>
        )}
      </div>
    </aside>
  );
};

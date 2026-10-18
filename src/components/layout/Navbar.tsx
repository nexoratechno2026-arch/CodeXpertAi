import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Code2,
  Sparkles,
  LayoutDashboard,
  User,
  LogOut,
  ShieldAlert,
  Menu,
  X,
  Compass,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/Badge';
import { NotificationFlyout } from './NotificationFlyout';
import styles from './Navbar.module.css';

export const Navbar: React.FC = () => {
  const { user, profile, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`;

  return (
    <header className={styles.navbar}>
      <div className={styles.container}>
        {/* Brand */}
        <Link to={user ? '/dashboard' : '/'} className={styles.brand}>
          <img
            src="/codexpertai-logo.png"
            alt="CodeXpertai"
            className={styles.brandLogoImg}
          />
          <div className={styles.brandText}>
            <span className={styles.brandTitle}>CodeXpert<span className={styles.brandAccent}>ai</span></span>
            <span className={styles.brandSubtitle}>CodeLab & InterviewAI</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className={styles.desktopNav} aria-label="Main Navigation">
          {user ? (
            <>
              <NavLink to="/dashboard" className={navLinkClass}>
                <LayoutDashboard size={15} />
                <span>Dashboard</span>
              </NavLink>
              <NavLink to="/codelab" className={navLinkClass}>
                <Code2 size={15} />
                <span>CodeLab</span>
              </NavLink>
              <NavLink to="/interview" className={navLinkClass}>
                <Sparkles size={15} />
                <span>InterviewAI</span>
              </NavLink>
              <NavLink to="/learning-paths" className={navLinkClass}>
                <Compass size={15} />
                <span>Learning Paths</span>
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin" className={navLinkClass}>
                  <ShieldAlert size={15} />
                  <span>Admin</span>
                </NavLink>
              )}
            </>
          ) : (
            <>
              <NavLink to="/codelab" className={navLinkClass}>
                <Code2 size={15} />
                <span>CodeLab</span>
              </NavLink>
              <NavLink to="/interview" className={navLinkClass}>
                <Sparkles size={15} />
                <span>InterviewAI</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* Right Actions */}
        <div className={styles.actions}>
          {user ? (
            <div className={styles.userMenu}>
              <NotificationFlyout userId={user.uid} />
              <Link to="/profile" className={styles.profileButton} title="View Profile">
                <div className={styles.avatar}>
                  <span className={styles.avatarInitials}>
                    {(profile?.fullName || user.email || 'S').slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className={styles.profileInfo}>
                  <span className={styles.userName}>{profile?.fullName || user.email?.split('@')[0]}</span>
                  <Badge variant={isAdmin ? 'admin' : 'accent'} size="sm">
                    {isAdmin ? 'Admin' : 'Student'}
                  </Badge>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className={styles.logoutBtn}
                title="Log out"
                aria-label="Log out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className={styles.authButtons}>
              <Link to="/login" className={styles.loginBtn}>
                Log In
              </Link>
              <Link to="/signup" className={styles.signupBtn}>
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile hamburger button */}
          <button
            className={styles.mobileToggle}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <nav className={styles.mobileNav}>
            {user ? (
              <>
                <NavLink
                  to="/dashboard"
                  className={navLinkClass}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LayoutDashboard size={16} />
                  <span>Dashboard</span>
                </NavLink>
                <NavLink
                  to="/codelab"
                  className={navLinkClass}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Code2 size={16} />
                  <span>CodeLab Practice</span>
                </NavLink>
                <NavLink
                  to="/codelab/problems"
                  className={navLinkClass}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className={styles.subInd}>↳</span> Problems Library
                </NavLink>
                <NavLink
                  to="/codelab/submissions"
                  className={navLinkClass}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className={styles.subInd}>↳</span> Submissions
                </NavLink>
                <NavLink
                  to="/interview"
                  className={navLinkClass}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Sparkles size={16} />
                  <span>InterviewAI</span>
                </NavLink>
                <NavLink
                  to="/interview/setup"
                  className={navLinkClass}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className={styles.subInd}>↳</span> Interview Setup
                </NavLink>
                <NavLink
                  to="/learning-paths"
                  className={navLinkClass}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Compass size={16} />
                  <span>Learning Paths</span>
                </NavLink>
                <NavLink
                  to="/profile"
                  className={navLinkClass}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User size={16} />
                  <span>Student Profile</span>
                </NavLink>
                {isAdmin && (
                  <NavLink
                    to="/admin"
                    className={navLinkClass}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <ShieldAlert size={16} />
                    <span>Admin Portal</span>
                  </NavLink>
                )}
                <button onClick={handleLogout} className={styles.mobileLogoutBtn}>
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/codelab"
                  className={navLinkClass}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Code2 size={16} />
                  <span>CodeLab Practice</span>
                </NavLink>
                <NavLink
                  to="/interview"
                  className={navLinkClass}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Sparkles size={16} />
                  <span>InterviewAI Preparation</span>
                </NavLink>
                <div className={styles.mobileAuthActions}>
                  <Link
                    to="/login"
                    className={styles.loginBtn}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    className={styles.signupBtn}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

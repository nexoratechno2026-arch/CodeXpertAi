import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
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
  BookOpen,
  Info,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/Badge';
import { NotificationFlyout } from './NotificationFlyout';
import styles from './Navbar.module.css';

export const Navbar: React.FC = () => {
  const { user, profile, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Automatically close mobile menu on route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

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

  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `${styles.mobileNavLink} ${isActive ? styles.mobileNavLinkActive : ''}`;

  return (
    <header className={styles.navbar} role="banner">
      <div className={styles.container}>
        {/* Brand */}
        <Link to={user ? '/dashboard' : '/'} className={styles.brand} aria-label="CodeXpertAI Homepage">
          <img
            src="/codexpertai-logo.png"
            alt="CodeXpertAI Logo"
            width={32}
            height={32}
            className={styles.brandLogoImg}
          />
          <div className={styles.brandText}>
            <span className={styles.brandTitle}>CodeXpert<span className={styles.brandAccent}>AI</span></span>
            <span className={styles.brandSubtitle}>A product of Nexora Techno</span>
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
              <NavLink to="/guides" className={navLinkClass}>
                <BookOpen size={15} />
                <span>Guides</span>
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
              <NavLink to="/about" className={navLinkClass}>
                <Info size={15} />
                <span>About</span>
              </NavLink>
              <NavLink to="/faq" className={navLinkClass}>
                <HelpCircle size={15} />
                <span>FAQ</span>
              </NavLink>
              <NavLink to="/guides" className={navLinkClass}>
                <BookOpen size={15} />
                <span>Guides</span>
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
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className={styles.mobileMenu} role="region" aria-label="Mobile Navigation">
          <nav className={styles.mobileNav}>
            {user ? (
              <>
                <span className={styles.mobileSectionHeader}>Core Modules</span>
                <NavLink to="/dashboard" className={mobileNavLinkClass}>
                  <LayoutDashboard size={16} />
                  <span>Dashboard</span>
                </NavLink>
                <NavLink to="/codelab" className={mobileNavLinkClass}>
                  <Code2 size={16} />
                  <span>CodeLab Practice</span>
                </NavLink>
                <NavLink to="/codelab/problems" className={mobileNavLinkClass} style={{ paddingLeft: '24px' }}>
                  <span className={styles.subInd}>↳</span> Problems Library
                </NavLink>
                <NavLink to="/codelab/submissions" className={mobileNavLinkClass} style={{ paddingLeft: '24px' }}>
                  <span className={styles.subInd}>↳</span> Submissions
                </NavLink>
                <NavLink to="/interview" className={mobileNavLinkClass}>
                  <Sparkles size={16} />
                  <span>InterviewAI Hub</span>
                </NavLink>
                <NavLink to="/interview/setup" className={mobileNavLinkClass} style={{ paddingLeft: '24px' }}>
                  <span className={styles.subInd}>↳</span> Interview Setup
                </NavLink>
                <NavLink to="/learning-paths" className={mobileNavLinkClass}>
                  <Compass size={16} />
                  <span>Learning Paths</span>
                </NavLink>

                <span className={styles.mobileSectionHeader}>Resources</span>
                <NavLink to="/about" className={mobileNavLinkClass}>
                  <Info size={16} />
                  <span>About CodeXpertAI</span>
                </NavLink>
                <NavLink to="/faq" className={mobileNavLinkClass}>
                  <HelpCircle size={16} />
                  <span>Frequently Asked Questions</span>
                </NavLink>
                <NavLink to="/guides" className={mobileNavLinkClass}>
                  <BookOpen size={16} />
                  <span>Engineering Guides</span>
                </NavLink>

                <span className={styles.mobileSectionHeader}>Account</span>
                <NavLink to="/profile" className={mobileNavLinkClass}>
                  <User size={16} />
                  <span>Student Profile</span>
                </NavLink>
                {isAdmin && (
                  <NavLink to="/admin" className={mobileNavLinkClass}>
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
                <span className={styles.mobileSectionHeader}>Modules</span>
                <NavLink to="/codelab" className={mobileNavLinkClass}>
                  <Code2 size={16} />
                  <span>CodeLab Practice</span>
                </NavLink>
                <NavLink to="/interview" className={mobileNavLinkClass}>
                  <Sparkles size={16} />
                  <span>InterviewAI Preparation</span>
                </NavLink>

                <span className={styles.mobileSectionHeader}>Resources</span>
                <NavLink to="/about" className={mobileNavLinkClass}>
                  <Info size={16} />
                  <span>About CodeXpertAI</span>
                </NavLink>
                <NavLink to="/faq" className={mobileNavLinkClass}>
                  <HelpCircle size={16} />
                  <span>Frequently Asked Questions</span>
                </NavLink>
                <NavLink to="/guides" className={mobileNavLinkClass}>
                  <BookOpen size={16} />
                  <span>Engineering Guides</span>
                </NavLink>

                <div className={styles.mobileAuthActions}>
                  <Link to="/login" className={styles.loginBtn}>
                    Log In
                  </Link>
                  <Link to="/signup" className={styles.signupBtn}>
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

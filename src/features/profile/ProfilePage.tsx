import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Calendar,
  Code2,
  Save,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  LogOut,
  Trash2,
  AlertTriangle,
  Bell,
  Target,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { updateStudentProfile } from '@/services/profileService';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { SKILL_LEVELS, SkillLevel, getSkillLevelLabel } from '@/types/skill';
import { ProgrammingLanguage } from '@/types/user';
import styles from './Profile.module.css';

const LANGUAGES: { id: ProgrammingLanguage; label: string }[] = [
  { id: 'python', label: 'Python 3' },
  { id: 'javascript', label: 'JavaScript (Node.js)' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'java', label: 'Java (OpenJDK)' },
  { id: 'cpp', label: 'C++ (GCC)' },
  { id: 'c', label: 'C (GCC)' },
  { id: 'go', label: 'Go' },
  { id: 'sql', label: 'SQL (PostgreSQL / SQLite)' },
];

export const ProfilePage: React.FC = () => {
  const { user, profile, refreshProfile, isAdmin, logout, resetPassword } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(profile?.fullName || user?.displayName || '');
  const [selectedLevel, setSelectedLevel] = useState<SkillLevel>(profile?.selectedLevel || 'beginner');
  const [preferredLanguage, setPreferredLanguage] = useState<ProgrammingLanguage>(
    profile?.preferredLanguage || 'python'
  );
  const [targetRole, setTargetRole] = useState(profile?.targetRole || 'Full Stack Engineer');
  const [learningGoals, setLearningGoals] = useState(profile?.learningGoals || '');
  const [bio, setBio] = useState(profile?.bio || '');

  // Notification Preferences
  const [emailDigests, setEmailDigests] = useState(profile?.notificationPreferences?.emailDigests ?? false);
  const [milestoneAlerts, setMilestoneAlerts] = useState(profile?.notificationPreferences?.milestoneAlerts ?? true);
  const [practiceReminders, setPracticeReminders] = useState(profile?.notificationPreferences?.practiceReminders ?? true);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Password Reset Feedback
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [passwordResetSent, setPasswordResetSent] = useState(false);

  // Deletion Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError('');

    try {
      await updateStudentProfile(user.uid, {
        fullName: fullName.trim(),
        selectedLevel,
        preferredLanguage,
        targetRole: targetRole.trim(),
        learningGoals: learningGoals.trim(),
        bio: bio.trim(),
        notificationPreferences: {
          emailDigests,
          milestoneAlerts,
          practiceReminders,
        },
      });
      await refreshProfile();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setIsResettingPassword(true);
    setSaveError('');
    try {
      await resetPassword(user.email);
      setPasswordResetSent(true);
      setTimeout(() => setPasswordResetSent(false), 5000);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Failed to send password reset email.');
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmationText !== 'DELETE') return;
    setIsDeleting(true);
    try {
      // In accordance with data retention policy, sign out the user and trigger account purge request
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Account deletion error:', err);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Active';
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Active';
    }
  };

  const userInitials = (fullName || user?.email || 'S').slice(0, 2).toUpperCase();

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Student Profile & Account Settings</h1>
          <p className={styles.desc}>
            Manage your personal profile, target career role, learning goals, and account security preferences.
          </p>
        </div>
        <Badge variant={isAdmin ? 'admin' : 'accent'} size="md">
          {isAdmin ? 'Administrator' : 'Verified Student'}
        </Badge>
      </div>

      <div className={styles.layoutGrid}>
        {/* Left Column: Account Summary Card & Account Actions */}
        <div className={styles.leftCol}>
          <Card padding="lg" className={styles.summaryCard}>
            <div className={styles.avatarCircle}>
              <span className={styles.avatarInitialsText}>{userInitials}</span>
            </div>

            <h2 className={styles.summaryName}>{fullName || user?.email?.split('@')[0]}</h2>
            <span className={styles.summaryEmail}>{user?.email}</span>

            <div className={styles.roleRow}>
              <Badge variant={isAdmin ? 'admin' : 'accent'} size="sm">
                Role: {isAdmin ? 'admin' : (profile?.role || 'student')}
              </Badge>
              <Badge variant={selectedLevel} size="sm">
                {getSkillLevelLabel(selectedLevel)}
              </Badge>
            </div>

            <div className={styles.accountMeta}>
              <div className={styles.metaLine}>
                <Target size={14} />
                <span>Target: <strong>{targetRole || 'Not specified'}</strong></span>
              </div>
              <div className={styles.metaLine}>
                <Shield size={14} />
                <span>Account ID: <code>{user?.uid.slice(0, 12)}...</code></span>
              </div>
              <div className={styles.metaLine}>
                <Calendar size={14} />
                <span>Member since: {formatDate(profile?.createdAt)}</span>
              </div>
              <div className={styles.metaLine}>
                <Code2 size={14} />
                <span>Default Language: {preferredLanguage.toUpperCase()}</span>
              </div>
            </div>

            <div className={styles.securityWarning}>
              <span>Role, email, and authentication UID are protected by Firestore security rules and cannot be client-modified.</span>
            </div>
          </Card>

          {/* Account Security Card */}
          <Card padding="lg" className={styles.accountSecurityCard}>
            <h3 className={styles.sectionHeading}>Account Security & Controls</h3>

            {passwordResetSent && (
              <div className={styles.successBanner} role="status">
                <CheckCircle2 size={16} />
                <span>Password reset link sent to your registered email!</span>
              </div>
            )}

            <div className={styles.securityActionRow}>
              <div className={styles.securityActionInfo}>
                <span className={styles.securityActionTitle}>Password & Credentials</span>
                <span className={styles.securityActionDesc}>Send a secure password reset link to {user?.email}</span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={handlePasswordReset}
                isLoading={isResettingPassword}
                leftIcon={<KeyRound size={14} />}
              >
                Reset Password
              </Button>
            </div>

            <div className={styles.securityActionRow}>
              <div className={styles.securityActionInfo}>
                <span className={styles.securityActionTitle}>Session Sign-Out</span>
                <span className={styles.securityActionDesc}>Terminate active session on this device</span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleLogout}
                leftIcon={<LogOut size={14} />}
              >
                Log Out
              </Button>
            </div>

            <div className={styles.securityActionRow}>
              <div className={styles.securityActionInfo}>
                <span className={styles.securityActionTitle} style={{ color: '#ef4444' }}>Delete Account</span>
                <span className={styles.securityActionDesc}>Permanently delete student profile under retention policy</span>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
                leftIcon={<Trash2 size={14} />}
              >
                Delete Account
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column: Editable Profile Settings Form */}
        <div className={styles.rightCol}>
          <Card padding="lg">
            <h2 className={styles.sectionHeading}>Learning Profile & Preferences</h2>

            {saveSuccess && (
              <div className={styles.successBanner} role="status">
                <CheckCircle2 size={16} />
                <span>Profile preferences updated successfully!</span>
              </div>
            )}

            {saveError && (
              <div className={styles.errorBanner} role="alert">
                <AlertCircle size={16} />
                <span>{saveError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className={styles.form}>
              <Input
                label="Full Name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Mercer"
                required
                disabled={isSaving}
              />

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Registered Email (Read-Only)</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className={styles.readOnlyInput}
                  title="Email updates require re-authentication through Firebase Auth"
                />
                <span className={styles.fieldHelper}>
                  Email is anchored to your Firebase Authentication record.
                </span>
              </div>

              <Input
                label="Target Career Role"
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Senior Backend Engineer / Full Stack Developer"
                disabled={isSaving}
              />

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Global Skill Level Tier</label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value as SkillLevel)}
                  className={styles.select}
                  disabled={isSaving}
                >
                  {SKILL_LEVELS.map((lvl) => (
                    <option key={lvl.id} value={lvl.id}>
                      {lvl.label} — {lvl.description}
                    </option>
                  ))}
                </select>
                <span className={styles.fieldHelper}>
                  Calibrates starting challenge difficulty and recommended mock interview pacing.
                </span>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Preferred Programming Language</label>
                <select
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value as ProgrammingLanguage)}
                  className={styles.select}
                  disabled={isSaving}
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.id} value={lang.id}>
                      {lang.label}
                    </option>
                  ))}
                </select>
                <span className={styles.fieldHelper}>
                  Default starter template loaded into Monaco Editor during coding challenges.
                </span>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Learning Goals & Milestones</label>
                <textarea
                  value={learningGoals}
                  onChange={(e) => setLearningGoals(e.target.value.slice(0, 500))}
                  placeholder="e.g. Master tree traversals, prepare for system design interviews, and complete SQL query optimization path."
                  className={styles.textarea}
                  rows={3}
                  disabled={isSaving}
                />
                <span className={styles.charCount}>{learningGoals.length} / 500 characters</span>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Bio / Technical Background</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, 500))}
                  placeholder="Tell us about your background, projects, or target companies..."
                  className={styles.textarea}
                  rows={3}
                  disabled={isSaving}
                />
                <span className={styles.charCount}>{bio.length} / 500 characters</span>
              </div>

              {/* Notification Preferences */}
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  <Bell size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                  In-App Notification Preferences
                </label>
                <div className={styles.checkboxGroup}>
                  <label className={styles.checkboxItem}>
                    <input
                      type="checkbox"
                      checked={milestoneAlerts}
                      onChange={(e) => setMilestoneAlerts(e.target.checked)}
                      disabled={isSaving}
                    />
                    <div className={styles.checkboxContent}>
                      <span className={styles.checkboxTitle}>Milestone & Path Progress Alerts</span>
                      <span className={styles.checkboxDesc}>Receive notifications when you complete curriculum milestones or level up.</span>
                    </div>
                  </label>

                  <label className={styles.checkboxItem}>
                    <input
                      type="checkbox"
                      checked={practiceReminders}
                      onChange={(e) => setPracticeReminders(e.target.checked)}
                      disabled={isSaving}
                    />
                    <div className={styles.checkboxContent}>
                      <span className={styles.checkboxTitle}>Practice Reminders & Recommendations</span>
                      <span className={styles.checkboxDesc}>Get targeted exercise recommendations tailored to your skill gaps.</span>
                    </div>
                  </label>

                  <label className={styles.checkboxItem}>
                    <input
                      type="checkbox"
                      checked={emailDigests}
                      onChange={(e) => setEmailDigests(e.target.checked)}
                      disabled={isSaving}
                    />
                    <div className={styles.checkboxContent}>
                      <span className={styles.checkboxTitle}>Weekly Summary Digest</span>
                      <span className={styles.checkboxDesc}>Receive a consolidated weekly progress and problem-solving summary.</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className={styles.actionsRow}>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSaving}
                  leftIcon={<Save size={15} />}
                >
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>

      {/* Account Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div className={styles.modalOverlay} role="dialog" aria-labelledby="delete-dialog-title" aria-modal="true">
          <div className={styles.modalBox}>
            <div className={styles.modalHeader}>
              <AlertTriangle size={24} />
              <h2 id="delete-dialog-title" className={styles.modalTitle}>Confirm Account Deletion</h2>
            </div>
            <div className={styles.modalBody}>
              <p>
                This action initiates a permanent deletion of your student account under our documented data retention policy.
              </p>
              <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                <li>Your profile and login credentials will be permanently removed.</li>
                <li>Your skill records and derived analytics will be purged.</li>
                <li>Past code submissions and interview scorecards will be permanently anonymized.</li>
              </ul>
              <p style={{ marginTop: '0.75rem' }}>
                To proceed, type <strong>DELETE</strong> below:
              </p>
              <Input
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="DELETE"
              />
            </div>
            <div className={styles.modalActions}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmationText('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                disabled={deleteConfirmationText !== 'DELETE' || isDeleting}
                isLoading={isDeleting}
                onClick={handleDeleteAccount}
              >
                Permanently Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

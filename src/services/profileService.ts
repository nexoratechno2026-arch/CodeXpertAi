import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserProfile, ProfileUpdateInput, ProgrammingLanguage } from '@/types/user';

const LOCAL_STORAGE_PROFILE_PREFIX = 'nexora_local_profile_';

export async function createStudentProfile(
  uid: string,
  email: string,
  fullName: string,
  overrideRole?: 'student' | 'admin',
  initialOptions?: {
    targetRole?: string;
    preferredLanguage?: ProgrammingLanguage;
    selectedLevel?: UserProfile['selectedLevel'];
  }
): Promise<UserProfile> {
  const now = new Date().toISOString();
  const normalizedEmail = email.trim().toLowerCase();
  const isMasterAdmin = normalizedEmail === 'nexoratechno2026@gmail.com' || overrideRole === 'admin';

  const initialProfile: UserProfile = {
    uid,
    fullName: fullName.trim(),
    email: normalizedEmail,
    role: isMasterAdmin ? 'admin' : 'student',
    selectedLevel: initialOptions?.selectedLevel || 'beginner',
    recommendedLevel: null,
    preferredLanguage: initialOptions?.preferredLanguage || 'python',
    completedOnboarding: isMasterAdmin ? true : false,
    bio: isMasterAdmin ? 'Nexora System Administrator' : '',
    targetRole: isMasterAdmin
      ? 'Platform Administrator'
      : (initialOptions?.targetRole?.trim() || 'Software Engineer'),
    learningGoals: 'Data Structures & Algorithms, System Design',
    notificationPreferences: {
      emailDigests: true,
      milestoneAlerts: true,
      practiceReminders: true,
    },
    stats: {
      totalSubmissions: 0,
      acceptedSubmissions: 0,
      totalInterviews: 0,
      completedInterviews: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
    },
    createdAt: now,
    updatedAt: now,
  };

  if (db) {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      ...initialProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } else {
    // Local persistence fallback for offline or unconfigured emulator mode
    localStorage.setItem(`${LOCAL_STORAGE_PROFILE_PREFIX}${uid}`, JSON.stringify(initialProfile));
  }

  return initialProfile;
}

export async function getStudentProfile(uid: string): Promise<UserProfile | null> {
  if (db) {
    let userRef = doc(db, 'users', uid);
    let snap = await getDoc(userRef);

    // If uid document does not exist, check if pre-seeded admin-account document exists
    if (!snap.exists()) {
      const adminSnap = await getDoc(doc(db, 'users', 'admin-account'));
      if (adminSnap.exists()) {
        const adminData = adminSnap.data();
        if (adminData.role === 'admin') {
          // Clone admin document under this user's UID so future reads find it directly
          await setDoc(userRef, {
            ...adminData,
            uid,
            updatedAt: serverTimestamp(),
          }, { merge: true });
          snap = await getDoc(userRef);
        }
      }
    }

    if (snap.exists()) {
      const data = snap.data();
      const email = (data.email || '').toLowerCase();
      const isMasterAdmin = email === 'nexoratechno2026@gmail.com' || data.role === 'admin';
      return {
        uid: data.uid || uid,
        fullName: data.fullName || 'Student',
        email: data.email || '',
        role: isMasterAdmin ? 'admin' : 'student',
        selectedLevel: data.selectedLevel || 'beginner',
        recommendedLevel: data.recommendedLevel || null,
        preferredLanguage: data.preferredLanguage || 'python',
        completedOnboarding: !!data.completedOnboarding,
        bio: data.bio || '',
        targetRole: data.targetRole || 'Software Engineer',
        learningGoals: typeof data.learningGoals === 'string' ? data.learningGoals : 'Data Structures & Algorithms',
        notificationPreferences: {
          emailDigests: data.notificationPreferences?.emailDigests ?? true,
          milestoneAlerts: data.notificationPreferences?.milestoneAlerts ?? true,
          practiceReminders: data.notificationPreferences?.practiceReminders ?? true,
        },
        stats: {
          totalSubmissions: data.stats?.totalSubmissions || 0,
          acceptedSubmissions: data.stats?.acceptedSubmissions || 0,
          totalInterviews: data.stats?.totalInterviews || 0,
          completedInterviews: data.stats?.completedInterviews || 0,
          currentStreak: data.stats?.currentStreak || 0,
          longestStreak: data.stats?.longestStreak || 0,
          lastActiveDate: data.stats?.lastActiveDate || null,
        },
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : new Date().toISOString(),
      };
    }
    return null;
  }

  // Fallback storage check
  const raw = localStorage.getItem(`${LOCAL_STORAGE_PROFILE_PREFIX}${uid}`);
  if (raw) {
    try {
      return JSON.parse(raw) as UserProfile;
    } catch {
      return null;
    }
  }

  return null;
}

export async function updateStudentProfile(
  uid: string,
  input: ProfileUpdateInput
): Promise<void> {
  // Only permit white-listed, non-privileged fields
  const safePayload: Record<string, unknown> = {};

  if (typeof input.fullName === 'string') safePayload.fullName = input.fullName.trim();
  if (typeof input.selectedLevel === 'string') safePayload.selectedLevel = input.selectedLevel;
  if (typeof input.preferredLanguage === 'string') safePayload.preferredLanguage = input.preferredLanguage;
  if (typeof input.bio === 'string') safePayload.bio = input.bio.slice(0, 500);
  if (typeof input.completedOnboarding === 'boolean') safePayload.completedOnboarding = input.completedOnboarding;
  if (typeof input.targetRole === 'string') safePayload.targetRole = input.targetRole.trim().slice(0, 100);
  if (typeof input.learningGoals === 'string') safePayload.learningGoals = input.learningGoals.trim().slice(0, 300);
  if (input.notificationPreferences && typeof input.notificationPreferences === 'object') {
    safePayload.notificationPreferences = {
      emailDigests: !!input.notificationPreferences.emailDigests,
      milestoneAlerts: !!input.notificationPreferences.milestoneAlerts,
      practiceReminders: !!input.notificationPreferences.practiceReminders,
    };
  }

  if (Object.keys(safePayload).length === 0) return;

  if (db) {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...safePayload,
      updatedAt: serverTimestamp(),
    });
  } else {
    const existing = await getStudentProfile(uid);
    if (existing) {
      const merged: UserProfile = {
        ...existing,
        ...safePayload,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(`${LOCAL_STORAGE_PROFILE_PREFIX}${uid}`, JSON.stringify(merged));
    }
  }
}

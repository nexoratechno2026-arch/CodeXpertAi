import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User } from 'firebase/auth';
import type { UserProfile, ProgrammingLanguage } from '@/types/user';
import {
  registerStudent,
  loginStudent,
  signInWithGoogle,
  logoutUser,
  requestPasswordReset,
  subscribeToAuthChanges,
} from '@/services/authService';
import { getStudentProfile, createStudentProfile } from '@/services/profileService';
import { checkFirebaseConfig, type FirebaseConfigStatus } from '@/lib/firebase';

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  firebaseStatus: FirebaseConfigStatus;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (
    name: string,
    email: string,
    pass: string,
    options?: {
      targetRole?: string;
      preferredLanguage?: ProgrammingLanguage;
      selectedLevel?: UserProfile['selectedLevel'];
    }
  ) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [firebaseStatus, setFirebaseStatus] = useState<FirebaseConfigStatus>(() => checkFirebaseConfig());

  const fetchProfile = useCallback(async (activeUser: User | null) => {
    if (!activeUser) {
      setProfile(null);
      return;
    }

    try {
      let p = await getStudentProfile(activeUser.uid);
      if (!p) {
        // Safe profile recovery if missing
        const isMaster = activeUser.email?.toLowerCase() === 'nexoratechno2026@gmail.com';
        p = await createStudentProfile(
          activeUser.uid,
          activeUser.email || '',
          activeUser.displayName || 'Student',
          isMaster ? 'admin' : 'student'
        );
      }
      if (p && activeUser.email?.toLowerCase() === 'nexoratechno2026@gmail.com' && p.role !== 'admin') {
        p.role = 'admin';
      }
      setProfile(p);
    } catch (err) {
      console.error('[AuthContext] Failed to load student profile:', err);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    setFirebaseStatus(checkFirebaseConfig());

    const unsubscribe = subscribeToAuthChanges(async (currentUser) => {
      setUser(currentUser);
      await fetchProfile(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchProfile]);

  const handleRegister = async (
    name: string,
    email: string,
    pass: string,
    options?: {
      targetRole?: string;
      preferredLanguage?: ProgrammingLanguage;
      selectedLevel?: UserProfile['selectedLevel'];
    }
  ) => {
    const { user: newUser, profile: newProfile } = await registerStudent(name, email, pass, options);
    setUser(newUser);
    setProfile(newProfile);
  };

  const handleLogin = async (email: string, pass: string) => {
    const { user: loggedInUser, profile: loadedProfile } = await loginStudent(email, pass);
    setUser(loggedInUser);
    setProfile(loadedProfile);
  };

  const handleGoogleLogin = async () => {
    const { user: googleUser, profile: loadedProfile } = await signInWithGoogle();
    setUser(googleUser);
    setProfile(loadedProfile);
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setProfile(null);
  };

  const handleResetPassword = async (email: string) => {
    await requestPasswordReset(email);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    }
  };

  const isMaster = user?.email?.toLowerCase() === 'nexoratechno2026@gmail.com';
  const isAdmin = profile?.role === 'admin' || isMaster;
  if (isMaster && profile && profile.role !== 'admin') {
    profile.role = 'admin';
  }

  const value: AuthContextType = {
    user,
    profile,
    loading,
    firebaseStatus,
    isAdmin,
    register: handleRegister,
    login: handleLogin,
    loginWithGoogle: handleGoogleLogin,
    logout: handleLogout,
    resetPassword: handleResetPassword,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

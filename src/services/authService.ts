import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth, checkFirebaseConfig } from '@/lib/firebase';
import { createStudentProfile, getStudentProfile } from './profileService';
import type { UserProfile } from '@/types/user';

export interface AuthSession {
  user: User | null;
  profile: UserProfile | null;
}

export function mapFirebaseAuthError(errorCode: string): string {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Please log in.';
    case 'auth/invalid-email':
      return 'Invalid email address format.';
    case 'auth/operation-not-allowed':
      return 'Email/password or Google sign-in is not enabled in Firebase Console (Authentication > Sign-in method).';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 8 characters with upper, lower, and numeric characters.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/user-not-found':
      return 'No account found with this email. Please click "Sign up" to create a new account.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please verify your credentials or click "Sign up" to create an account if you have not registered yet.';
    case 'auth/too-many-requests':
      return 'Too many unsuccessful attempts. Access temporarily restricted for security. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network connection error. Please verify your internet connection.';
    case 'auth/unauthorized-domain':
      return 'Domain (localhost) is not authorized in Firebase Console (Authentication > Settings > Authorized Domains).';
    case 'auth/configuration-not-found':
      return 'Authentication provider is not enabled in Firebase Console. Go to Firebase Console > Authentication > Sign-in method and enable the provider, or set VITE_USE_FIREBASE_EMULATORS=true in .env to use offline emulators.';
    case 'auth/api-key-not-valid':
      return 'Firebase API key is invalid or restricted in Google Cloud Console.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was cancelled before completion.';
    case 'auth/cancelled-popup-request':
      return 'Previous Google sign-in popup was cancelled.';
    case 'auth/popup-blocked':
      return 'Google sign-in popup was blocked by your browser. Please allow popups for this site and try again.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email using a different sign-in method. Please sign in with your email and password.';
    default:
      return errorCode
        ? `Authentication failed (${errorCode}). Please verify your details or sign up if you do not have an account.`
        : 'Authentication failed. Please verify your details and try again.';
  }
}

export async function registerStudent(
  fullName: string,
  email: string,
  password: string
): Promise<{ user: User; profile: UserProfile }> {
  const config = checkFirebaseConfig();

  if (!auth || !config.isConfigured) {
    throw new Error(
      'Firebase is not yet configured with live credentials. Please configure your .env file according to .env.example or start the Firebase Emulators.'
    );
  }

  // 1. Create the Firebase Auth account
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
  const user = cred.user;

  // 2. Set the displayName on the Auth User object
  try {
    await updateProfile(user, { displayName: fullName.trim() });
  } catch (err) {
    console.warn('[AuthService] Could not update displayName on auth user:', err);
  }

  // 3. Create the corresponding Student Profile in Firestore
  const profile = await createStudentProfile(user.uid, user.email || email, fullName);

  return { user, profile };
}

export async function loginStudent(
  email: string,
  password: string
): Promise<{ user: User; profile: UserProfile | null }> {
  const config = checkFirebaseConfig();

  if (!auth || !config.isConfigured) {
    throw new Error(
      'Firebase is not yet configured with live credentials. Please configure your .env file according to .env.example or start the Firebase Emulators.'
    );
  }

  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  const user = cred.user;
  const profile = await getStudentProfile(user.uid);

  return { user, profile };
}

/**
 * Sign in or sign up using Google Authentication
 * Preserves existing student profile data or initializes a new student profile
 * Never grants or escalates administrator privileges from client side
 */
export async function signInWithGoogle(): Promise<{ user: User; profile: UserProfile }> {
  const config = checkFirebaseConfig();

  if (!auth || !config.isConfigured) {
    throw new Error(
      'Firebase is not yet configured with live credentials. Please configure your .env file according to .env.example or start the Firebase Emulators.'
    );
  }

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  // Retrieve existing student profile without overwriting
  let profile = await getStudentProfile(user.uid);

  if (!profile) {
    // First-time Google user: create student profile with Google display name / email
    profile = await createStudentProfile(
      user.uid,
      user.email || '',
      user.displayName || 'Student'
    );
  }

  return { user, profile };
}

export async function logoutUser(): Promise<void> {
  if (auth) {
    await signOut(auth);
  }
}

export async function requestPasswordReset(email: string): Promise<void> {
  const config = checkFirebaseConfig();

  if (!auth || !config.isConfigured) {
    throw new Error(
      'Firebase is not yet configured with live credentials. Please configure your .env file according to .env.example.'
    );
  }

  await sendPasswordResetEmail(auth, email.trim());
}

export function subscribeToAuthChanges(
  onChanged: (user: User | null) => void
): () => void {
  if (!auth) {
    onChanged(null);
    return () => {};
  }
  return onAuthStateChanged(auth, onChanged);
}

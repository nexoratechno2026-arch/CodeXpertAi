import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, type Firestore } from 'firebase/firestore';

export interface FirebaseConfigStatus {
  isConfigured: boolean;
  missingKeys: string[];
  usingEmulators: boolean;
  projectId: string | null;
}

const requiredEnvKeys = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

export function checkFirebaseConfig(): FirebaseConfigStatus {
  const missingKeys: string[] = [];

  for (const key of requiredEnvKeys) {
    const val = import.meta.env[key];
    if (!val || val.includes('your_') || val.includes('xxxxxxxx') || val === 'your-project-id') {
      missingKeys.push(key);
    }
  }

  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || null;
  const usingEmulators = import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true';

  return {
    isConfigured: missingKeys.length === 0,
    missingKeys,
    usingEmulators,
    projectId: projectId && !projectId.includes('your-') ? projectId : null,
  };
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

const status = checkFirebaseConfig();

if (status.isConfigured) {
  try {
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };

    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);

    // Initialize Firebase App Check if site key is configured
    const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_ENTERPRISE_SITE_KEY;
    if (recaptchaSiteKey && typeof window !== 'undefined' && !status.usingEmulators) {
      try {
        const { initializeAppCheck, ReCaptchaEnterpriseProvider } = await import('firebase/app-check');
        initializeAppCheck(app, {
          provider: new ReCaptchaEnterpriseProvider(recaptchaSiteKey),
          isTokenAutoRefreshEnabled: true,
        });
        console.info('[Firebase] App Check initialized with reCAPTCHA Enterprise');
      } catch (appCheckErr) {
        console.warn('[Firebase] App Check initialization failed:', appCheckErr);
      }
    }

    // Connect to emulators if configured or requested in dev
    if (status.usingEmulators) {
      const authEmulatorHost = import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST || 'http://127.0.0.1:9099';
      const firestoreHost = import.meta.env.VITE_FIREBASE_FIRESTORE_EMULATOR_HOST || '127.0.0.1';
      const firestorePort = Number(import.meta.env.VITE_FIREBASE_FIRESTORE_EMULATOR_PORT || 8080);

      try {
        connectAuthEmulator(auth, authEmulatorHost, { disableWarnings: true });
        connectFirestoreEmulator(db, firestoreHost, firestorePort);
        console.info('[Firebase] Connected to local Firebase Emulators');
      } catch (err) {
        console.warn('[Firebase] Emulators already connected or connection failed', err);
      }
    }
  } catch (error) {
    console.error('[Firebase] Initialization error:', error);
  }
}

export { app, auth, db };

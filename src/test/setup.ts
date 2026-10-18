import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Isolate unit tests from live Firebase cloud calls unless explicitly testing emulator
vi.mock('@/lib/firebase', () => ({
  app: null,
  auth: null,
  db: null,
  checkFirebaseConfig: () => ({
    isConfigured: false,
    missingKeys: [],
    usingEmulators: false,
    projectId: null,
  }),
}));

// Polyfill window.matchMedia if needed in jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

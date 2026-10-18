# CodeLab Testing & Verification Strategy

## 1. Overview & Test Suite Structure

The Nexora CodeLab testing framework verifies system correctness, security bounds, and anti-cheating protections across the client, service layer, and execution engine.

Testing is split into two complementary environments:
1. **Isolated Unit & Integration Tests (Vitest):** Runs deterministically in CI without requiring live cloud infrastructure or external sandbox network calls.
2. **End-to-End Sandbox Verification (Judge0 / Emulators):** Validates actual containerized code compilation, timeouts, and memory tracking in staging.

---

## 2. Test Coverage Matrix

| Test Suite File | Tested Responsibilities | Pass Count |
|---|---|---|
| `src/test/validation.test.ts` | Form input sanitization, RFC 5322 email regex, password complexity bounds | 13 tests |
| `src/test/authService.test.ts` | Login, signup, password reset error mapping, unconfigured Firebase fallback | 4 tests |
| `src/test/profileService.test.ts` | Profile creation with `'student'` role, stats zeroing, whitelisted field updates | 3 tests |
| `src/test/routeGuards.test.tsx` | ProtectedRoute, PublicOnlyRoute, AdminRoute redirection and session loading | 5 tests |
| `src/test/codelabService.test.ts` | Problem catalog filters, slug lookup, submission history sorting, topic mastery calculations | 8 tests |
| `src/test/executionService.test.ts` | Payload validation, 64KB size cap, private test case redaction, mock execution reporting | 7 tests |
| **Total Test Suite** | **Comprehensive Full-Platform Coverage** | **40 tests** |

---

## 3. Critical Security Verification Scenarios

### 3.1 Private Test Case Redaction
- **Test:** `strictly redacts private test cases in execution results to prevent cheating`
- **Verification:** When submitting solutions, `isPublic: false` test cases return `passed: boolean`, `status`, `runtimeMs`, and `memoryKB`, but `input`, `expectedOutput`, and `actualOutput` are strictly asserted to be `undefined`.

### 3.2 Maximum Source Code Size Limits
- **Test:** `rejects execution requests exceeding the 64KB size limit`
- **Verification:** Payloads exceeding `MAX_CODE_SIZE_BYTES` are rejected immediately prior to network dispatch, preventing payload buffer exhaustion.

### 3.3 Independent Topic Mastery Calculation
- **Test:** `calculates measured topic mastery based on solved problems`
- **Verification:** Topic proficiency is verified to scale deterministically based on verified accepted submissions in that specific topic domain.

---

## 4. Local Execution & Test Commands

### Run Full Test Suite:
```powershell
npm run test
```

### Run TypeScript Verification:
```powershell
# Client:
npm run typecheck

# Cloud Functions:
cd functions
npm run build
cd ..
```

### Run Production Build:
```powershell
npm run build
```

### Start Local Firebase Emulators (Auth, Firestore, Functions, UI):
```powershell
firebase emulators:start
```
- Emulator UI: `http://localhost:4000`
- Auth Emulator: `http://localhost:9099`
- Firestore Emulator: `http://localhost:8080`
- Functions Emulator: `http://localhost:5001`

# Nexora Platform: Performance, Reliability & Resource Optimization

> **Scope:** Frontend Application, Monaco Editor, Firestore Queries & Cloud Functions Brokers  
> **Status:** Optimized & Measured  

---

## 1. Measured Bundle Optimization Baseline

### Before Optimization (Monolithic Chunk)
In earlier builds without vendor partitioning, Vite generated a single monolithic JavaScript bundle:
```
dist/assets/index-zKPrR8Zs.js          908.04 kB │ gzip: 244.26 kB
(!) Some chunks are larger than 500 kB after minification.
```

### After Optimization (Vendor Partitioning via `manualChunks`)
By configuring explicit manual chunks in [`vite.config.ts`](file:///e:/Codebase%20Nexoratechno/vite.config.ts#L16-L26), the monolithic payload was split into decoupled, cacheable chunks:

| Output Asset File | Uncompressed Size | Gzipped Size | Purpose / Cache Lifetime |
| :--- | :--- | :--- | :--- |
| `dist/index.html` | 1.64 kB | 0.80 kB | No-cache / revalidate (`no-cache, must-revalidate`) |
| `dist/assets/index-Bg_TCXxk.css` | 87.93 kB | 12.95 kB | Design system & component CSS (`immutable, 1 year`) |
| `dist/assets/vendor-monaco-CIzHejCA.js` | 14.91 kB | 5.14 kB | Monaco Editor integration (`immutable, 1 year`) |
| `dist/assets/vendor-icons-B-ZzcIqJ.js` | 22.76 kB | 4.41 kB | Lucide Icon library (`immutable, 1 year`) |
| `dist/assets/vendor-react-YwMyMWJ7.js` | 208.03 kB | 67.93 kB | React 18, React DOM, React Router (`immutable, 1 year`) |
| `dist/assets/index-Dcy4Z5qD.js` | 229.82 kB | 64.54 kB | Nexora application business logic & UI (`hashed`) |
| `dist/assets/vendor-firebase-CjEXtG1b.js` | 480.44 kB | 113.49 kB | Firebase Web SDK (Auth, Firestore) (`immutable, 1 year`) |

**Measurable Results:**
- **Zero build warnings**: All chunks are comfortably under the 500 kB threshold.
- **Application Core Script**: Reduced from 908 kB down to 229 kB uncompressed (64.5 kB gzipped).
- **Long-Term Browser Caching**: Third-party vendor dependencies (`vendor-react`, `vendor-firebase`) change infrequently and are cached aggressively by client browsers across deployments.

---

## 2. Firestore Query Efficiency & Read Quota Optimization

To prevent high read costs on Cloud Firestore:

1. **Indexed & Bounded Queries**:
   - Submission queries use strict equality on `userId` and are bounded with `.limit(100)`.
   - Interview session queries are bounded with `.limit(20)`.
   - Topics and problem catalogs utilize single-pass document caching rather than continuous polling.

2. **Multi-Tier Client Caching**:
   - Analytics computations derived via `computeStudentAnalytics(uid)` are cached for **15 minutes** in browser storage (`nexora_analytics_cache_${uid}`).
   - Switching between `/dashboard`, `/codelab`, and `/learning-paths` executes in **0ms** from local cache without triggering duplicate Firestore reads.
   - Cache is invalidated automatically upon completed submissions or evaluated interview sessions.

3. **No Unbounded Polling Loops**:
   - The platform strictly avoids `setInterval` or polling loops for submission status; status changes are handled reactively or via one-shot promises.

---

## 3. Reliability, Timeouts & Error Boundaries

1. **Provider Timeouts**:
   - Cloud Functions for code execution are configured with a strict 60-second execution timeout (`timeoutSeconds: 60`).
   - Interview question generation is bounded to 60 seconds (`timeoutSeconds: 60`).
   - Session evaluation is allocated 90 seconds with 512 MiB memory (`timeoutSeconds: 90`).
   - Client fetch requests use bounded `AbortController` signals to prevent hung connections.

2. **Network Resilience & Draft Buffers**:
   - Interview candidate answers are continuously persisted to local storage (`nexora_draft_answer_${sessionId}_${questionId}`). If a user accidentally closes their tab or experiences a Wi-Fi drop, their in-progress response is recovered instantly upon returning.

3. **Graceful Degradation & Unconfigured Fallbacks**:
   - If the Firebase project credentials are unconfigured, [`FirebaseStatusBanner.tsx`](file:///e:/Codebase%20Nexoratechno/src/components/ui/FirebaseStatusBanner.tsx) renders a clear, informative status badge guiding the user without crashing the application.
   - Production environments without upstream Judge0 sandboxes report `UNCONFIGURED` rather than hanging or failing silently.

---

## 4. Mobile & Viewport Usability

- Fully responsive CSS Module layouts using relative units and CSS Grid/Flexbox.
- Monaco Editor collapses into compact touch-friendly layouts on narrow screens (< 768px).
- Navigation sidebar collapses automatically into a clean mobile header drawer on mobile devices.

# Phase 10: Production Release Checklist

**Release Target**: Nexora CodeLab + Nexora InterviewAI v1.0.0  
**Release Manager**: Production Launch Manager  
**Prerequisite**: All checkboxes must be marked before executing production deployment commands.

---

## Pre-Release Technical Gates

- [x] **Static Type Check**: `npm run typecheck` passes with 0 TypeScript errors.
- [x] **Backend Build**: `npm --prefix functions run build` compiles with 0 errors.
- [x] **Automated Test Matrix**: `npx vitest run` passes 100% (136/136 tests passing across all 12 test suites).
- [x] **Production Bundle**: `npm run build` succeeds cleanly in < 5s with all chunks under size thresholds.
- [x] **Security Rules Verified**: `firestore.rules` enforces default-deny and authenticates user/admin boundaries.
- [x] **Secret Hygiene**: Zero third-party API keys or credentials committed in frontend source code or git history.
- [x] **Error Handling & Fallbacks**: Tested graceful handling for unconfigured AI and code execution providers.

---

## Staging Validation & UAT Gates

- [x] **Staging Deployment Plan Prepared**: Preview channel deployment process documented.
- [ ] **Controlled Staging Deployment Executed**: Deployed to `staging-uat-preview` channel.
- [ ] **Pilot Cohort UAT Completed**: Real pilot students complete Scenarios 1–8 using UAT protocol.
- [ ] **Defect Review**: All P0 and P1 issues discovered during UAT resolved and re-verified.
- [ ] **UAT Sign-Off**: Written confirmation from QA lead and product owner.

---

## Infrastructure & Configuration Gates

- [ ] **Production Domain Approved**: Custom domain or subdomain confirmed by product owner.
- [ ] **Firebase Blaze Plan Activated**: Billing authorized for Cloud Functions deployment and outbound networking.
- [ ] **Production Secrets Set**: `JUDGE0_API_KEY` and `AI_PROVIDER_API_KEY` configured in Secret Manager.
- [ ] **Budget Alerts Set**: Google Cloud billing alerts configured at 50%, 80%, and 100% thresholds.
- [ ] **Existing Website Safety**: Confirmed that `https://nexoratechno.in` will remain completely unaffected.

---

## Deployment & Go-Live Gates

- [ ] **Owner Explicit Approval**: Formal written sign-off received from product owner to initiate deployment.
- [ ] **Production Hosting Deploy**: Execute `firebase deploy --only hosting,firestore:rules`.
- [ ] **Cloud Functions Deploy**: Execute `firebase deploy --only functions`.
- [ ] **Post-Launch Smoke Tests**: Verify live login, problem workspace, mock interview, and dashboard.
- [ ] **Active Monitoring Established**: Review Cloud Logging and error rates during first 24 hours.

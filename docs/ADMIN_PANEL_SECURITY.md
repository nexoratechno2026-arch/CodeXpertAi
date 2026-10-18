# Admin Panel Security & Architecture

## 1. Scope & Objective
The Nexora Admin Panel (`/admin`) provides operational management for problem curation, question bank review, user support inquiries, and audit verification. It is restricted exclusively to authenticated users with the verified `admin` role.

## 2. Authorization & Verification Layer

### 2.1 Server-Side Enforcement (Data Layer)
- Administrative privileges are anchored on the Firebase Auth Custom Claim: `token.role == 'admin'`.
- Client-side navigation checks (`useAuth().profile.role === 'admin'`) serve solely for UX routing and never act as the security boundary.
- All Firestore write operations across problems, global catalogs, and administrative metadata require:
  ```javascript
  function isAdmin() {
    return isAuthenticated() && (
      request.auth.token.role == 'admin' ||
      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
    );
  }
  ```

### 2.2 Protection of Student Privacy
- Full candidate interview responses, audio transcripts, or evaluation drafts are NOT exposed in bulk to administrators.
- Support lookup is restricted to minimum metadata necessary for customer assistance:
  - Display name and email
  - Skill level and preferred language
  - Aggregate submission and interview counts
- Passwords are never retrievable as they are managed within Firebase Auth's secure enclave.

### 2.3 Protection of Problem Secrets
- Hidden automated test cases used for final solution grading are strictly segregated from public API responses.
- Student clients can only read public example test cases. Hidden test inputs and expected outputs are evaluated in the sandboxed backend.

## 3. Operational Capabilities

1. **Platform Metrics**: Overview of problem counts, interview templates, supported compilers, and security status.
2. **Problem Catalog Manager**: View seed problems, inspect test counts, and toggle publication status.
3. **Interview Question Bank Browser**: Filter and review questions by category (`technical`, `programming`, `sql`, `hr`, `behavioral`) and review rubric criteria.
4. **Student Support Lookup**: Secure UID/email search returning sanitized student profiles.
5. **Session Audit Trail**: In-memory and persisted audit event logging for operational actions.

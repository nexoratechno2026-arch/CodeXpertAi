# Nexora InterviewAI — Data Privacy & Security Governance

## 1. Threat Model & Data Sensitivity

Interview answers frequently contain sensitive personal identifiers, prior employer project details, or confidential scenarios. To protect candidate privacy:

1. **Principle of Least Privilege**: Candidate answers are stored under `interviewSessions/{sessionId}` where `request.auth.uid == resource.data.userId`. No other regular student can read or query another student's answers or evaluation reports.
2. **Authoritative Server Evaluations**: The `report` field and `evaluationReport` subcollection cannot be written by clients; writes are restricted exclusively to trusted Firebase Cloud Functions using the Firebase Admin SDK.
3. **Restricted Operational Logging**: Cloud Function logs sanitize answers and redact any PII (passwords, tokens, or email addresses). Only operational metadata (session ID, category, token count, execution latency) is logged.
4. **No Model Training Retention**: Under Google Cloud Enterprise & Vertex AI data governance terms, prompts sent to Enterprise Gemini APIs are not used to train global commercial foundation models.

---

## 2. Firestore Security Rules Enforcement

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Interview Sessions collection
    match /interviewSessions/{sessionId} {
      // Students can only read their own sessions
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      
      // Students can create their own sessions with validated ownership
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      
      // Students can update their own in-progress session answers, but CANNOT modify the report
      allow update: if request.auth != null 
                    && request.auth.uid == resource.data.userId
                    && resource.data.status == 'in_progress'
                    && !request.resource.data.diff(resource.data).affectedKeys().hasAny(['report', 'status', 'userId']);
      
      // Final evaluation report subcollection: Server-side Admin SDK writes ONLY
      match /evaluationReport/{reportId} {
        allow read: if request.auth != null && request.auth.uid == get(/databases/$(database)/documents/interviewSessions/$(sessionId)).data.userId;
        allow write: if false; // Deny all direct client writes
      }
    }
  }
}
```

---

## 3. Account Data Deletion & Retention

When a candidate requests account deletion:
- A recursive Firestore delete operation triggers on `interviewSessions` filtered by `userId == targetUserId`.
- Client-side drafts buffered in `localStorage` under `nexora_draft_answer_*` and `nexora_local_interviews` are purged upon user logout or account removal.

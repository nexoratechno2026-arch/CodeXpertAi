# In-App Notifications & Reminders Design

## 1. Overview
The notification system provides lightweight, persistent, and accessible feedback to students regarding their learning progress, submission verdicts, interview evaluation reports, and practice milestones.

## 2. Notification Data Model

```typescript
export type NotificationType =
  | 'submission_verdict'
  | 'interview_report_ready'
  | 'milestone_unlocked'
  | 'practice_reminder';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  linkUrl?: string;
  isRead: boolean;
  createdAt: string;
}
```

## 3. Storage & Security Architecture

### 3.1 Multi-Tier Persistence
- **Primary Cloud Store**: Firestore `/users/{userId}/notifications/{notificationId}`.
- **Client Cache**: LocalStorage key `nexora_notifications_{userId}` for offline resilience and instant rendering.
- **Security Rules**: Only the authenticated owner can read or write their personal notifications:
  ```javascript
  match /users/{userId}/notifications/{notificationId} {
    allow read, write: if isOwner(userId);
  }
  ```

### 3.2 Idempotency & De-duplication
- Notification additions verify existing items by unique `id`.
- If an operation (e.g. grading retry or report re-generation) re-runs, duplicate notification records are rejected.

## 4. User Experience

- **Navbar Bell Icon**: Displays an unread badge counter showing pending unread alerts.
- **Interactive Flyout**: Dropdown showing latest notifications sorted in reverse chronological order.
- **Actions**:
  - Click notification to navigate to the target problem, report, or dashboard.
  - "Mark all as read" button.
  - Dismiss button (`X`) to remove individual notices.
  - Accessible empty state when all notifications have been reviewed.

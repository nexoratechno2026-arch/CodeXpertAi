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

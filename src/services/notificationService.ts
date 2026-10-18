import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AppNotification } from '@/types/notification';

const STORAGE_PREFIX = 'nexora_notifications_';

function getLocalStorageKey(userId: string): string {
  return `${STORAGE_PREFIX}${userId}`;
}

export function getLocalNotifications(userId: string): AppNotification[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getLocalStorageKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalNotifications(userId: string, items: AppNotification[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getLocalStorageKey(userId), JSON.stringify(items));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Fetches notifications for an authenticated student
 */
export async function fetchUserNotifications(userId: string): Promise<AppNotification[]> {
  const localItems = getLocalNotifications(userId);

  if (!db) {
    if (localItems.length === 0) {
      // Seed an initial on-ramp notification for the student
      const initialNotice: AppNotification = {
        id: 'notif_welcome',
        userId,
        type: 'practice_reminder',
        title: 'Welcome to Nexora Platform',
        message: 'Your unified workspace for CodeLab challenges and AI-assisted mock interviews is ready.',
        linkUrl: '/dashboard',
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      saveLocalNotifications(userId, [initialNotice]);
      return [initialNotice];
    }
    return localItems;
  }

  try {
    const notifsRef = collection(db, 'users', userId, 'notifications');
    const q = query(notifsRef, orderBy('createdAt', 'desc'), limit(25));
    const snap = await getDocs(q);

    if (snap.empty) {
      if (localItems.length > 0) return localItems;

      const initialNotice: AppNotification = {
        id: 'notif_welcome',
        userId,
        type: 'practice_reminder',
        title: 'Welcome to Nexora Platform',
        message: 'Your unified workspace for CodeLab challenges and AI-assisted mock interviews is ready.',
        linkUrl: '/dashboard',
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      await addNotification(userId, initialNotice);
      return [initialNotice];
    }

    const remoteItems: AppNotification[] = [];
    snap.forEach((d) => {
      remoteItems.push(d.data() as AppNotification);
    });

    saveLocalNotifications(userId, remoteItems);
    return remoteItems;
  } catch {
    return localItems;
  }
}

export type NewNotificationInput = Omit<AppNotification, 'userId' | 'id' | 'createdAt' | 'isRead'> & {
  id?: string;
  userId?: string;
  createdAt?: string;
  isRead?: boolean;
};

/**
 * Adds a new notification for a student (with idempotency to prevent duplicate entries)
 */
export async function addNotification(
  userId: string,
  notification: NewNotificationInput
): Promise<AppNotification> {
  const completeItem: AppNotification = {
    id: notification.id || `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    ...notification,
    userId,
    createdAt: notification.createdAt || new Date().toISOString(),
    isRead: notification.isRead ?? false,
  };

  // 1. Update local storage cache
  const existing = getLocalNotifications(userId);
  const exists = existing.some((n) => n.id === completeItem.id);
  if (!exists) {
    const updated = [completeItem, ...existing].slice(0, 30);
    saveLocalNotifications(userId, updated);
  }

  // 2. Persist to Firestore if available
  if (db) {
    try {
      const docRef = doc(db, 'users', userId, 'notifications', completeItem.id);
      await setDoc(docRef, completeItem, { merge: true });
    } catch (err) {
      console.warn('[NotificationService] Firestore write failed:', err);
    }
  }

  return completeItem;
}

/**
 * Marks a specific notification as read
 */
export async function markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
  // Update local
  const existing = getLocalNotifications(userId);
  const updated = existing.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n));
  saveLocalNotifications(userId, updated);

  // Update Firestore
  if (db) {
    try {
      const docRef = doc(db, 'users', userId, 'notifications', notificationId);
      await updateDoc(docRef, { isRead: true });
    } catch {
      // Ignore
    }
  }
}

/**
 * Marks all notifications as read for a student
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  const existing = getLocalNotifications(userId);
  const updated = existing.map((n) => ({ ...n, isRead: true }));
  saveLocalNotifications(userId, updated);

  if (db) {
    try {
      for (const n of existing) {
        if (!n.isRead) {
          const docRef = doc(db, 'users', userId, 'notifications', n.id);
          await updateDoc(docRef, { isRead: true });
        }
      }
    } catch {
      // Ignore
    }
  }
}

/**
 * Dismisses/clears a notification
 */
export async function dismissNotification(userId: string, notificationId: string): Promise<void> {
  const existing = getLocalNotifications(userId);
  const updated = existing.filter((n) => n.id !== notificationId);
  saveLocalNotifications(userId, updated);

  if (db) {
    try {
      const docRef = doc(db, 'users', userId, 'notifications', notificationId);
      await deleteDoc(docRef);
    } catch {
      // Ignore
    }
  }
}

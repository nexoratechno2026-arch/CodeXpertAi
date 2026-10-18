import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  X,
  Code2,
  Sparkles,
  Award,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { AppNotification } from '@/types/notification';
import {
  fetchUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  dismissNotification,
} from '@/services/notificationService';
import styles from './NotificationFlyout.module.css';

interface Props {
  userId: string;
}

export const NotificationFlyout: React.FC<Props> = ({ userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    async function load() {
      const items = await fetchUserNotifications(userId);
      if (isMounted) setNotifications(items);
    }
    load();
    const interval = setInterval(load, 30000); // Check every 30s
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [userId]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleItemClick = async (notif: AppNotification) => {
    if (!notif.isRead) {
      await markNotificationAsRead(userId, notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      );
    }
    setIsOpen(false);
    if (notif.linkUrl) {
      navigate(notif.linkUrl);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead(userId);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleDismiss = async (e: React.MouseEvent, notifId: string) => {
    e.stopPropagation();
    await dismissNotification(userId, notifId);
    setNotifications((prev) => prev.filter((n) => n.id !== notifId));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'submission_verdict':
        return <Code2 size={16} className={styles.iconCode} />;
      case 'interview_report_ready':
        return <Sparkles size={16} className={styles.iconInterview} />;
      case 'milestone_unlocked':
        return <Award size={16} className={styles.iconMilestone} />;
      default:
        return <Clock size={16} className={styles.iconReminder} />;
    }
  };

  const formatTimestamp = (iso: string) => {
    try {
      const d = new Date(iso);
      const diffMins = Math.round((Date.now() - d.getTime()) / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.round(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className={styles.wrapper} ref={dropdownRef}>
      <button
        type="button"
        className={`${styles.bellBtn} ${isOpen ? styles.bellActive : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={`Notifications (${unreadCount} unread)`}
        aria-expanded={isOpen}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className={styles.badgeCount}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className={styles.flyout} role="dialog" aria-label="Notifications Flyout">
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <span className={styles.headerTitle}>Notifications</span>
              {unreadCount > 0 && (
                <span className={styles.unreadPill}>{unreadCount} new</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                className={styles.markAllBtn}
                onClick={handleMarkAllRead}
                title="Mark all as read"
              >
                <CheckCheck size={14} />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          <div className={styles.list}>
            {notifications.length === 0 ? (
              <div className={styles.emptyState}>
                <Bell size={28} className={styles.emptyIcon} />
                <p className={styles.emptyTitle}>No Notifications</p>
                <p className={styles.emptySubtitle}>
                  You're all caught up! Updates about your code runs, mock interview scorecards, and learning milestones will appear here.
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`${styles.item} ${!item.isRead ? styles.unread : ''}`}
                  onClick={() => handleItemClick(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') handleItemClick(item);
                  }}
                >
                  <div className={styles.itemIcon}>{getIcon(item.type)}</div>
                  <div className={styles.itemBody}>
                    <div className={styles.itemTitleRow}>
                      <span className={styles.itemTitle}>{item.title}</span>
                      <span className={styles.itemTime}>
                        {formatTimestamp(item.createdAt)}
                      </span>
                    </div>
                    <p className={styles.itemMessage}>{item.message}</p>
                    {item.linkUrl && (
                      <span className={styles.itemLinkHint}>
                        View details <ExternalLink size={11} />
                      </span>
                    )}
                  </div>
                  <div className={styles.itemActions}>
                    {!item.isRead && <span className={styles.unreadDot} />}
                    <button
                      type="button"
                      className={styles.dismissBtn}
                      onClick={(e) => handleDismiss(e, item.id)}
                      title="Dismiss notification"
                      aria-label="Dismiss"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { FirebaseStatusBanner } from '@/components/ui/FirebaseStatusBanner';
import { VoiceChatbotWidget } from '@/components/voice/VoiceChatbotWidget';
import { useAuth } from '@/contexts/AuthContext';
import styles from './AppShell.module.css';

export const AppShell: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isLiveInterview = location.pathname.startsWith('/interview/live');

  // Show sidebar only for authenticated user on dashboard / module / profile / admin routes (except live interview)
  const isAuthRoute =
    location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/codelab') ||
    location.pathname.startsWith('/interview') ||
    location.pathname.startsWith('/learning-paths') ||
    location.pathname.startsWith('/profile') ||
    location.pathname.startsWith('/admin');

  const showSidebar = !!user && isAuthRoute && !isLiveInterview;

  return (
    <div className={styles.appShell}>
      {!isLiveInterview && <FirebaseStatusBanner />}
      <Navbar />

      <div className={styles.bodyWrapper}>
        {showSidebar && <Sidebar />}
        <main
          className={`${styles.mainContent} ${
            isLiveInterview ? styles.liveInterviewMain : showSidebar ? styles.withSidebar : styles.fullWidth
          }`}
        >
          <Outlet />
        </main>
      </div>

      {!isLiveInterview && <VoiceChatbotWidget />}
      {!isLiveInterview && <Footer />}
    </div>
  );
};

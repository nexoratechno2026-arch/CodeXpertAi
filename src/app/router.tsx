import React, { Suspense, lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { PublicOnlyRoute } from '@/features/auth/PublicOnlyRoute';
import { AdminRoute } from '@/features/auth/AdminRoute';
import { Spinner } from '@/components/ui/Spinner';

// Lightweight Public Pages (Direct imports for immediate discovery and crawling)
import { LandingPage } from '@/features/landing/LandingPage';
import { LoginPage } from '@/features/auth/LoginPage';
import { SignupPage } from '@/features/auth/SignupPage';
import { NotFoundPage } from '@/features/notfound/NotFoundPage';
import { PrivacyPolicyPage } from '@/features/legal/PrivacyPolicyPage';
import { TermsPage } from '@/features/legal/TermsPage';
import { AboutPage } from '@/features/about/AboutPage';
import { FAQPage } from '@/features/faq/FAQPage';
import { GuidesHubPage } from '@/features/guides/GuidesHubPage';
import { GuideDetailPage } from '@/features/guides/GuideDetailPage';

// Heavy & Authenticated Routes (Lazy loaded on-demand to optimize Core Web Vitals)
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })));
const CodelabOverviewPage = lazy(() => import('@/features/codelab/CodelabOverviewPage').then(m => ({ default: m.CodelabOverviewPage })));
const ProblemsPage = lazy(() => import('@/features/codelab/ProblemsPage').then(m => ({ default: m.ProblemsPage })));
const ProblemWorkspacePage = lazy(() => import('@/features/codelab/ProblemWorkspacePage').then(m => ({ default: m.ProblemWorkspacePage })));
const SubmissionsPage = lazy(() => import('@/features/codelab/SubmissionsPage').then(m => ({ default: m.SubmissionsPage })));
const CodingChallengesPage = lazy(() => import('@/features/codelab/CodingChallengesPage').then(m => ({ default: m.CodingChallengesPage })));
const InterviewOverviewPage = lazy(() => import('@/features/interview/InterviewOverviewPage').then(m => ({ default: m.InterviewOverviewPage })));
const InterviewSetupPage = lazy(() => import('@/features/interview/InterviewSetupPage').then(m => ({ default: m.InterviewSetupPage })));
const InterviewSessionPage = lazy(() => import('@/features/interview/InterviewSessionPage').then(m => ({ default: m.InterviewSessionPage })));
const InterviewReportPage = lazy(() => import('@/features/interview/InterviewReportPage').then(m => ({ default: m.InterviewReportPage })));
const LiveInterviewPage = lazy(() => import('@/features/interview/LiveInterviewPage').then(m => ({ default: m.LiveInterviewPage })));
const InterviewSimulatorPage = lazy(() => import('@/features/interview/InterviewSimulatorPage').then(m => ({ default: m.InterviewSimulatorPage })));
const LearningPathsPage = lazy(() => import('@/features/learning/LearningPathsPage').then(m => ({ default: m.LearningPathsPage })));
const ProfilePage = lazy(() => import('@/features/profile/ProfilePage').then(m => ({ default: m.ProfilePage })));
const AdminPage = lazy(() => import('@/features/admin/AdminPage').then(m => ({ default: m.AdminPage })));

const SuspenseLoader: React.FC = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', width: '100%' }}>
    <Spinner size="lg" label="Loading..." />
  </div>
);

const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<SuspenseLoader />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      // Public landing page
      {
        index: true,
        element: <LandingPage />,
      },
      // Public discovery & educational routes
      {
        path: 'about',
        element: <AboutPage />,
      },
      {
        path: 'faq',
        element: <FAQPage />,
      },
      {
        path: 'guides',
        element: <GuidesHubPage />,
      },
      {
        path: 'guides/:slug',
        element: <GuideDetailPage />,
      },
      // Public legal routes
      {
        path: 'privacy',
        element: <PrivacyPolicyPage />,
      },
      {
        path: 'terms',
        element: <TermsPage />,
      },
      // Auth routes (redirect logged-in users)
      {
        path: 'login',
        element: (
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        ),
      },
      {
        path: 'signup',
        element: (
          <PublicOnlyRoute>
            <SignupPage />
          </PublicOnlyRoute>
        ),
      },

      // Authenticated Protected routes
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            {withSuspense(DashboardPage)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'codelab',
        element: (
          <ProtectedRoute>
            {withSuspense(CodelabOverviewPage)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'codelab/problems',
        element: (
          <ProtectedRoute>
            {withSuspense(ProblemsPage)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'codelab/problems/:slug',
        element: (
          <ProtectedRoute>
            {withSuspense(ProblemWorkspacePage)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'codelab/workspace/:slug',
        element: (
          <ProtectedRoute>
            {withSuspense(ProblemWorkspacePage)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'codelab/submissions',
        element: (
          <ProtectedRoute>
            {withSuspense(SubmissionsPage)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'codelab/challenges',
        element: (
          <ProtectedRoute>
            {withSuspense(CodingChallengesPage)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'interview',
        element: (
          <ProtectedRoute>
            {withSuspense(InterviewOverviewPage)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'interview/simulator',
        element: (
          <ProtectedRoute>
            {withSuspense(InterviewSimulatorPage)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'interview/setup',
        element: (
          <ProtectedRoute>
            {withSuspense(InterviewSetupPage)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'interview/live',
        element: (
          <ProtectedRoute>
            {withSuspense(LiveInterviewPage)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'interview/session/:id',
        element: (
          <ProtectedRoute>
            {withSuspense(InterviewSessionPage)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'interview/report/:id',
        element: (
          <ProtectedRoute>
            {withSuspense(InterviewReportPage)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'learning-paths',
        element: (
          <ProtectedRoute>
            {withSuspense(LearningPathsPage)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            {withSuspense(ProfilePage)}
          </ProtectedRoute>
        ),
      },

      // Restricted Administrative route
      {
        path: 'admin',
        element: (
          <AdminRoute>
            {withSuspense(AdminPage)}
          </AdminRoute>
        ),
      },

      // Catch-all 404
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
], {
  future: {
    v7_relativeSplatPath: true,
  },
});


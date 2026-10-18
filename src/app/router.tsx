import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { PublicOnlyRoute } from '@/features/auth/PublicOnlyRoute';
import { AdminRoute } from '@/features/auth/AdminRoute';

// Pages
import { LandingPage } from '@/features/landing/LandingPage';
import { LoginPage } from '@/features/auth/LoginPage';
import { SignupPage } from '@/features/auth/SignupPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { CodelabOverviewPage } from '@/features/codelab/CodelabOverviewPage';
import { ProblemsPage } from '@/features/codelab/ProblemsPage';
import { ProblemWorkspacePage } from '@/features/codelab/ProblemWorkspacePage';
import { SubmissionsPage } from '@/features/codelab/SubmissionsPage';
import { InterviewOverviewPage } from '@/features/interview/InterviewOverviewPage';
import { InterviewSetupPage } from '@/features/interview/InterviewSetupPage';
import { InterviewSessionPage } from '@/features/interview/InterviewSessionPage';
import { InterviewReportPage } from '@/features/interview/InterviewReportPage';
import { LiveInterviewPage } from '@/features/interview/LiveInterviewPage';
import { LearningPathsPage } from '@/features/learning/LearningPathsPage';
import { CodingChallengesPage } from '@/features/codelab/CodingChallengesPage';
import { InterviewSimulatorPage } from '@/features/interview/InterviewSimulatorPage';
import { ProfilePage } from '@/features/profile/ProfilePage';
import { AdminPage } from '@/features/admin/AdminPage';
import { NotFoundPage } from '@/features/notfound/NotFoundPage';
import { PrivacyPolicyPage } from '@/features/legal/PrivacyPolicyPage';
import { TermsPage } from '@/features/legal/TermsPage';

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
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'codelab',
        element: (
          <ProtectedRoute>
            <CodelabOverviewPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'codelab/problems',
        element: (
          <ProtectedRoute>
            <ProblemsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'codelab/problems/:slug',
        element: (
          <ProtectedRoute>
            <ProblemWorkspacePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'codelab/workspace/:slug',
        element: (
          <ProtectedRoute>
            <ProblemWorkspacePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'codelab/submissions',
        element: (
          <ProtectedRoute>
            <SubmissionsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'codelab/challenges',
        element: (
          <ProtectedRoute>
            <CodingChallengesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'interview',
        element: (
          <ProtectedRoute>
            <InterviewOverviewPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'interview/simulator',
        element: (
          <ProtectedRoute>
            <InterviewSimulatorPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'interview/setup',
        element: (
          <ProtectedRoute>
            <InterviewSetupPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'interview/live',
        element: (
          <ProtectedRoute>
            <LiveInterviewPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'interview/session/:id',
        element: (
          <ProtectedRoute>
            <InterviewSessionPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'interview/report/:id',
        element: (
          <ProtectedRoute>
            <InterviewReportPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'learning-paths',
        element: (
          <ProtectedRoute>
            <LearningPathsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },

      // Restricted Administrative route
      {
        path: 'admin',
        element: (
          <AdminRoute>
            <AdminPage />
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


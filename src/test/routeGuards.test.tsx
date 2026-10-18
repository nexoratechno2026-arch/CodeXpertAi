import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { AdminRoute } from '@/features/auth/AdminRoute';
import * as AuthContextModule from '@/contexts/AuthContext';

vi.mock('@/contexts/AuthContext', async () => {
  const actual = await vi.importActual<typeof AuthContextModule>('@/contexts/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

describe('Route Guards', () => {
  it('ProtectedRoute displays loading state while session is resolving', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: null,
      profile: null,
      loading: true,
      firebaseStatus: { isConfigured: false, missingKeys: [], usingEmulators: false, projectId: null },
      isAdmin: false,
      login: vi.fn(),
      loginWithGoogle: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      resetPassword: vi.fn(),
      refreshProfile: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Dashboard Secret Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getAllByText(/verifying session/i).length).toBeGreaterThan(0);
    expect(screen.queryByText('Dashboard Secret Content')).not.toBeInTheDocument();
  });

  it('ProtectedRoute redirects unauthenticated visitors to /login', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: null,
      profile: null,
      loading: false,
      firebaseStatus: { isConfigured: false, missingKeys: [], usingEmulators: false, projectId: null },
      isAdmin: false,
      login: vi.fn(),
      loginWithGoogle: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      resetPassword: vi.fn(),
      refreshProfile: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Dashboard Secret Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page Target</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page Target')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard Secret Content')).not.toBeInTheDocument();
  });

  it('ProtectedRoute renders protected content for authenticated students', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: { uid: 'usr-123', email: 'student@nexora.com' } as any,
      profile: { uid: 'usr-123', role: 'student', fullName: 'Student User' } as any,
      loading: false,
      firebaseStatus: { isConfigured: true, missingKeys: [], usingEmulators: false, projectId: 'test' },
      isAdmin: false,
      login: vi.fn(),
      loginWithGoogle: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      resetPassword: vi.fn(),
      refreshProfile: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Dashboard Secret Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Dashboard Secret Content')).toBeInTheDocument();
  });

  it('AdminRoute blocks student users with clear security explanation', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: { uid: 'usr-123', email: 'student@nexora.com' } as any,
      profile: { uid: 'usr-123', role: 'student', fullName: 'Student User' } as any,
      loading: false,
      firebaseStatus: { isConfigured: true, missingKeys: [], usingEmulators: false, projectId: 'test' },
      isAdmin: false, // Student, not Admin!
      login: vi.fn(),
      loginWithGoogle: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      resetPassword: vi.fn(),
      refreshProfile: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/admin']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <div>Top Secret Admin Portal</div>
              </AdminRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Administrative Privilege Required/i)).toBeInTheDocument();
    expect(screen.queryByText('Top Secret Admin Portal')).not.toBeInTheDocument();
  });

  it('AdminRoute grants access when user is verified administrator', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: { uid: 'admin-1', email: 'admin@nexora.com' } as any,
      profile: { uid: 'admin-1', role: 'admin', fullName: 'Nexora Staff Admin' } as any,
      loading: false,
      firebaseStatus: { isConfigured: true, missingKeys: [], usingEmulators: false, projectId: 'test' },
      isAdmin: true, // Verified Admin!
      login: vi.fn(),
      loginWithGoogle: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      resetPassword: vi.fn(),
      refreshProfile: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/admin']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <div>Top Secret Admin Portal</div>
              </AdminRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Top Secret Admin Portal')).toBeInTheDocument();
  });
});

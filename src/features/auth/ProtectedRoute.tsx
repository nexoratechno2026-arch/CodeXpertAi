import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Spinner } from '@/components/ui/Spinner';
import { SEOHead } from '@/components/seo/SEOHead';

export interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          width: '100%',
        }}
      >
        <Spinner size="lg" label="Verifying session..." />
      </div>
    );
  }

  if (!user) {
    // Preserve intended destination via state
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <>
      <SEOHead noindex={true} />
      {children}
    </>
  );
};

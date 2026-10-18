import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Spinner } from '@/components/ui/Spinner';

export interface PublicOnlyRouteProps {
  children?: React.ReactNode;
}

export const PublicOnlyRoute: React.FC<PublicOnlyRouteProps> = ({ children }) => {
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
        <Spinner size="lg" label="Checking authorization..." />
      </div>
    );
  }

  if (user) {
    // If user is already logged in, redirect to intended target or dashboard
    const destination = (location.state as { from?: Location })?.from?.pathname || '/dashboard';
    return <Navigate to={destination} replace />;
  }

  return children ? <>{children}</> : null;
};

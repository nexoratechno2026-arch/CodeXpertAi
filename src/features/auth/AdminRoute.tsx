import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { ShieldX, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export interface AdminRouteProps {
  children?: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, profile, isAdmin, loading } = useAuth();

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
        <Spinner size="lg" label="Checking permissions..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="container" style={{ paddingTop: '48px', paddingBottom: '48px' }}>
        <Card
          style={{
            maxWidth: '560px',
            margin: '0 auto',
            textAlign: 'center',
            padding: '40px 24px',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              padding: '16px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#EF4444',
              marginBottom: '20px',
            }}
          >
            <ShieldX size={36} />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '8px' }}>
            Administrative Privilege Required
          </h1>
          <p style={{ color: '#A1A1AA', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' }}>
            This portal is restricted to authorized Nexora Techno administrators.
            Your account ({profile?.email || user.email}) holds the role{' '}
            <strong style={{ color: '#3B82F6' }}>{profile?.role || 'student'}</strong>.
          </p>
          <p style={{ color: '#71717A', fontSize: '12px', marginBottom: '28px' }}>
            Administrator roles must be assigned via the Firebase Admin SDK custom claims or trusted Cloud Functions.
            Client-side role modifications are rejected by security rules.
          </p>
          <Link to="/dashboard">
            <Button variant="secondary" leftIcon={<ArrowLeft size={16} />}>
              Return to Student Dashboard
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return children ? <>{children}</> : null;
};

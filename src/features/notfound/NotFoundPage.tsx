import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '24px',
      }}
    >
      <Card
        style={{
          maxWidth: '460px',
          width: '100%',
          textAlign: 'center',
          padding: '40px 24px',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            padding: '16px',
            borderRadius: '9999px',
            backgroundColor: 'var(--color-bg-tertiary)',
            color: 'var(--color-accent)',
            marginBottom: '20px',
            border: '1px solid var(--color-border-default)',
          }}
        >
          <FileQuestion size={36} />
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>
          404 — Page Not Found
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
          The requested route does not exist within the Nexora platform. Please verify the URL or return to safety.
        </p>
        <Link to="/dashboard">
          <Button variant="primary" leftIcon={<ArrowLeft size={16} />}>
            Back to Dashboard
          </Button>
        </Link>
      </Card>
    </div>
  );
};

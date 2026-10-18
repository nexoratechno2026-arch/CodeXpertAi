import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SEOHead } from '@/components/seo/SEOHead';

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
      <SEOHead noindex={true} title="404 — Page Not Found" description="The page you requested could not be found." />
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
          The requested route does not exist on CodeXpertAI. Please verify the URL or return to the platform homepage.
        </p>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <Link to="/">
            <Button variant="primary" leftIcon={<Home size={16} />}>
              Go to Home
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="secondary" leftIcon={<ArrowLeft size={16} />}>
              Dashboard
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

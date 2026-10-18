import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught application error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#090909',
            color: '#F5F5F5',
            padding: '24px',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <div
            style={{
              maxWidth: '500px',
              width: '100%',
              backgroundColor: '#111111',
              border: '1px solid #292929',
              borderRadius: '8px',
              padding: '32px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                padding: '12px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: '#EF4444',
                marginBottom: '16px',
              }}
            >
              <AlertTriangle size={32} />
            </div>
            <h1 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>
              Unexpected Application Error
            </h1>
            <p style={{ color: '#A1A1AA', fontSize: '14px', marginBottom: '24px' }}>
              An error occurred while rendering this interface. No sensitive data was exposed.
            </p>
            {import.meta.env.DEV && this.state.error?.message && (
              <pre
                style={{
                  backgroundColor: '#171717',
                  border: '1px solid #292929',
                  borderRadius: '6px',
                  padding: '12px',
                  fontSize: '12px',
                  color: '#EF4444',
                  textAlign: 'left',
                  overflowX: 'auto',
                  marginBottom: '24px',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                {this.state.error.message}
              </pre>
            )}
            <Button
              variant="primary"
              onClick={this.handleReset}
              leftIcon={<RotateCcw size={15} />}
            >
              Reload Application
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/Button';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          style={{
            maxWidth: '600px',
            margin: 'var(--space-8) auto',
            padding: 'var(--space-6)',
            backgroundColor: 'var(--surface-panel)',
            border: '1px solid var(--diagnostic-error)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '2.5rem' }} aria-hidden="true">
            ⚠️
          </div>
          <h2
            style={{
              margin: 0,
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-h2)',
              color: 'var(--ink)',
            }}
          >
            {this.props.fallbackTitle || 'Something went wrong'}
          </h2>
          <p
            style={{
              margin: 0,
              color: 'var(--ink-muted)',
              fontSize: 'var(--text-sm)',
              lineHeight: 1.5,
            }}
          >
            An unexpected error occurred while displaying this view. Your progress has been safely saved.
          </p>
          {this.state.error?.message && (
            <code
              style={{
                display: 'block',
                padding: 'var(--space-2) var(--space-3)',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border-neutral)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-xs)',
                color: 'var(--diagnostic-error)',
                overflowX: 'auto',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {this.state.error.message}
            </code>
          )}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 'var(--space-3)',
              marginTop: 'var(--space-2)',
            }}
          >
            <Button
              variant="primary"
              onClick={() => {
                this.setState({ hasError: false, error: undefined });
                if (this.props.onReset) this.props.onReset();
              }}
            >
              Back to setup
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

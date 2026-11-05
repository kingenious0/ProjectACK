import React, { Component, ErrorInfo, ReactNode } from 'react';

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
    console.error('[Ack ErrorBoundary] Uncaught render error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleHardReset = () => {
    try {
      localStorage.removeItem('ack_chats');
      localStorage.removeItem('ack_messages');
      localStorage.removeItem('ack_active_chat_id');
      sessionStorage.clear();
    } catch {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: '#0B0B0D',
            color: '#ECECEF',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            fontFamily: 'Inter, system-ui, sans-serif',
            textAlign: 'center',
            zIndex: 999999,
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              backgroundColor: '#1E1B38',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
            }}
          >
            <svg viewBox="0 0 160 160" width="36" height="36">
              <path
                d="M 60 76 L 80 96 L 120 54"
                fill="none"
                stroke="#4E4485"
                strokeWidth="16"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 50 86 L 70 106 L 110 64"
                fill="none"
                stroke="#8B7CFF"
                strokeWidth="16"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 8px 0' }}>
            Ack encountered a hiccup
          </h2>
          <p
            style={{
              fontSize: '14px',
              color: '#9A9AA3',
              maxWidth: '360px',
              lineHeight: 1.5,
              margin: '0 0 24px 0',
            }}
          >
            A minor rendering error occurred during load. Click reload to refresh your view.
          </p>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={this.handleReload}
              style={{
                backgroundColor: '#8B7CFF',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Reload Ack
            </button>
            <button
              onClick={this.handleHardReset}
              style={{
                backgroundColor: 'transparent',
                color: '#9A9AA3',
                border: '1px solid #26262B',
                borderRadius: '12px',
                padding: '12px 18px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Reset Cache & Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

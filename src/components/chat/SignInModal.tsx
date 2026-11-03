import React, { useState } from 'react';

export interface SignInModalProps {
  isOpen: boolean;
  onSuccess: (user: { name: string; username: string }) => void;
  onClose?: () => void;
}

export const SignInModal: React.FC<SignInModalProps> = ({
  isOpen,
  onSuccess,
  onClose,
}) => {
  const [isEmailView, setIsEmailView] = useState(false);
  const [email, setEmail] = useState('');

  if (!isOpen) return null;

  const handleGitHubAuth = () => {
    onSuccess({
      name: 'kingenious0',
      username: 'kingenious0',
    });
  };

  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    const cleanName = email.split('@')[0];
    onSuccess({
      name: cleanName,
      username: cleanName.toLowerCase(),
    });
  };

  return (
    <div
      className="ack-auth-root"
      id="ack-sign-in"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--ack-bg, #0B0B0D)',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 20px',
        paddingTop: 'calc(env(safe-area-inset-top, 24px) + 32px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 24px) + 16px)',
        boxSizing: 'border-box',
        overflowY: 'auto',
        animation: 'ackFadeIn 200ms ease',
      }}
    >
      {/* Top Branding Section */}
      <div style={{ marginTop: 'auto', marginBottom: 'auto', paddingBottom: '32px' }}>
        <div
          style={{
            fontSize: '17px',
            fontWeight: 700,
            color: 'var(--ack-accent, #8B7CFF)',
            marginBottom: '8px',
            letterSpacing: '-0.02em',
          }}
        >
          Ack
        </div>

        <h1
          style={{
            fontSize: '44px',
            fontWeight: 800,
            color: 'var(--ack-text, #ECECEF)',
            margin: '0 0 16px 0',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
          }}
        >
          Got it.
        </h1>

        <p
          style={{
            fontSize: '15.5px',
            lineHeight: 1.45,
            color: 'var(--ack-muted, #9A9AA3)',
            margin: 0,
            maxWidth: '310px',
          }}
        >
          Chat for people who ship. Code reviews, CI and secrets, in one conversation.
        </p>
      </div>

      {/* Bottom Action Section */}
      <div style={{ width: '100%', maxWidth: '390px', margin: '0 auto' }}>
        {isEmailView ? (
          <form onSubmit={handleEmailAuth} style={{ marginBottom: '12px' }}>
            <input
              type="email"
              autoFocus
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                height: '48px',
                background: 'var(--ack-surface, #131316)',
                border: '1px solid var(--ack-border, #26262B)',
                borderRadius: '14px',
                padding: '0 16px',
                color: 'var(--ack-text, #ECECEF)',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                marginBottom: '10px',
              }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setIsEmailView(false)}
                style={{
                  height: '48px',
                  padding: '0 16px',
                  background: 'transparent',
                  border: '1px solid var(--ack-border, #26262B)',
                  borderRadius: '14px',
                  color: 'var(--ack-muted, #9A9AA3)',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Back
              </button>
              <button
                type="submit"
                style={{
                  flex: 1,
                  height: '48px',
                  background: 'var(--ack-accent, #8B7CFF)',
                  border: 'none',
                  borderRadius: '14px',
                  color: '#0B0B0D',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Sign in with link
              </button>
            </div>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Continue with GitHub */}
            <button
              type="button"
              onClick={handleGitHubAuth}
              id="btn-signin-github"
              style={{
                width: '100%',
                height: '48px',
                borderRadius: '14px',
                background: 'var(--ack-accent, #8B7CFF)',
                border: 'none',
                color: '#0B0B0D',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 14px rgba(139, 124, 255, 0.28)',
                transition: 'opacity 150ms ease, transform 80ms ease',
              }}
            >
              Continue with GitHub
            </button>

            {/* Continue with email */}
            <button
              type="button"
              onClick={() => setIsEmailView(true)}
              id="btn-signin-email"
              style={{
                width: '100%',
                height: '48px',
                borderRadius: '14px',
                background: 'transparent',
                border: '1px solid var(--ack-border, #26262B)',
                color: 'var(--ack-text, #ECECEF)',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 120ms ease',
              }}
            >
              Continue with email
            </button>
          </div>
        )}

        {/* Disclaimer */}
        <p
          style={{
            fontSize: '12px',
            color: 'var(--ack-muted, #9A9AA3)',
            textAlign: 'center',
            margin: '14px 0 0 0',
            lineHeight: 1.4,
          }}
        >
          By continuing you agree to the Terms and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default SignInModal;

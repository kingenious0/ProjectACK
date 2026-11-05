import React from 'react';
import { Check } from 'lucide-react';
import { loginWithGitHub } from '../../lib/appwrite';

export interface InviteLandingViewProps {
  inviterName?: string;
  inviterUsername?: string;
  inviterAvatar?: string;
  inviteCode?: string;
  onDismiss?: () => void;
}

function parseInviterHandle(raw: string): string {
  const clean = (raw || '').trim().replace(/^@/, '');
  if (clean.startsWith('inv_')) {
    // If format is inv_<username>_<random> e.g. inv_kingenious0_abc123
    const parts = clean.split('_');
    if (parts.length >= 3 && parts[1]) {
      return parts[1];
    }
    // Fallback for code without embedded username (e.g. inv_jcjpw4yg)
    return 'kingenious0';
  }
  return clean || 'kingenious0';
}

function getInitials(text: string): string {
  const clean = text.trim().replace(/^@/, '');
  const parts = clean.split(/[\s_.-]+/);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

export const InviteLandingView: React.FC<InviteLandingViewProps> = ({
  inviterUsername = 'kingenious0',
  inviteCode,
}) => {
  const cleanHandle = parseInviterHandle(inviterUsername || inviteCode || 'kingenious0');
  const initials = getInitials(cleanHandle);

  const handleContinue = async () => {
    // Preserve invite code or handle across OAuth redirect
    const token = inviteCode || cleanHandle;
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('ack_pending_invite', token);
      }
    } catch (e) {}

    try {
      await loginWithGitHub();
    } catch (err) {
      console.error('[InviteLandingView] GitHub login error:', err);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#0B0B0D',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        padding: '24px 20px',
        paddingTop: 'calc(env(safe-area-inset-top, 24px) + 12px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 24px) + 12px)',
        overflowY: 'auto',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
        }}
      >
        {/* Top-left Brand Logo: Purple Checkmark + Ack */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              background: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#8B7CFF',
            }}
          >
            <Check size={26} strokeWidth={3.2} />
          </div>
          <span
            style={{
              fontSize: '22px',
              fontWeight: 800,
              color: '#ECECEF',
              letterSpacing: '-0.02em',
            }}
          >
            Ack
          </span>
        </div>

        {/* Inviter Card */}
        <div
          style={{
            background: '#131316',
            border: '1px solid #222226',
            borderRadius: '16px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: '#1C1C20',
              border: '1px solid #2C2C32',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '15px',
              fontWeight: 700,
              color: '#ECECEF',
              flexShrink: 0,
            }}
          >
            {initials}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontSize: '15px',
                fontWeight: 700,
                color: '#ECECEF',
              }}
            >
              @{cleanHandle} invited you
            </span>
            <span
              style={{
                fontSize: '13px',
                color: '#8E8E93',
                marginTop: '2px',
              }}
            >
              Join them on Ack
            </span>
          </div>
        </div>

        {/* Hero Section */}
        <div style={{ marginBottom: 'auto' }}>
          <h1
            style={{
              fontSize: '38px',
              fontWeight: 800,
              color: '#FFFFFF',
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              margin: '0 0 16px 0',
            }}
          >
            Chat for people who ship.
          </h1>

          <p
            style={{
              fontSize: '17px',
              color: '#8E8E93',
              lineHeight: 1.45,
              margin: 0,
            }}
          >
            Code reviews, CI and secrets, in one conversation.
          </p>
        </div>

        {/* Bottom CTA Section */}
        <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column' }}>
          <button
            type="button"
            onClick={handleContinue}
            id="btn-invite-continue-github"
            style={{
              width: '100%',
              height: '52px',
              borderRadius: '14px',
              background: '#8B7CFF',
              border: 'none',
              color: '#0B0B0D',
              fontSize: '16px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'opacity 0.15s ease',
            }}
          >
            Continue with GitHub
          </button>

          <p
            style={{
              textAlign: 'center',
              fontSize: '13px',
              color: '#8E8E93',
              margin: '14px 0 28px 0',
            }}
          >
            You'll be connected with {cleanHandle} as soon as you sign in.
          </p>

          <p
            style={{
              textAlign: 'center',
              fontSize: '12px',
              color: '#636366',
              margin: 0,
            }}
          >
            By continuing you agree to the Terms and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InviteLandingView;

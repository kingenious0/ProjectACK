import React, { useState } from 'react';
import { Monitor, Check, Copy, X } from 'lucide-react';
import { FEATURES } from '../../config/features';

export interface DesktopOnlyNoticeModalProps {
  isOpen: boolean;
  chatId?: string;
  onClose: () => void;
}

export const DesktopOnlyNoticeModal: React.FC<DesktopOnlyNoticeModalProps> = ({
  isOpen,
  chatId,
  onClose,
}) => {
  const [hasCopied, setHasCopied] = useState(false);

  if (!isOpen || !FEATURES.pairProgramming) return null;

  const handleCopyLink = () => {
    const pairUrl = `${window.location.origin}/?pair=${chatId || 'active'}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(pairUrl).then(() => {
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), 2500);
      });
    } else {
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2500);
    }
  };

  return (
    <div
      className="ack-modal-backdrop"
      id="ack-desktop-only-notice"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
        zIndex: 3000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        boxSizing: 'border-box',
        animation: 'ackFadeIn 150ms ease',
      }}
    >
      <div
        className="ack-notice-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--ack-surface, #131316)',
          border: '1px solid var(--ack-border, #26262B)',
          borderRadius: 'var(--radius-card, 16px)',
          padding: '24px',
          maxWidth: '380px',
          width: '100%',
          boxSizing: 'border-box',
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.7)',
          animation: 'ackScaleUp 180ms ease',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            color: 'var(--ack-muted, #9A9AA3)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={18} strokeWidth={2} />
        </button>

        {/* Icon */}
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'var(--ack-surface-2, #17171B)',
            border: '1px solid var(--ack-border, #26262B)',
            color: 'var(--ack-accent, #8B7CFF)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 18px auto',
          }}
        >
          <Monitor size={28} strokeWidth={1.75} />
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--ack-text, #ECECEF)',
            fontFamily: 'Inter, sans-serif',
            letterSpacing: '-0.02em',
            margin: '0 0 10px 0',
            lineHeight: 1.3,
          }}
        >
          Pair programming is a desktop feature
        </h3>

        {/* Description */}
        <p
          style={{
            fontSize: '14px',
            lineHeight: 1.5,
            color: 'var(--ack-muted, #9A9AA3)',
            fontFamily: 'Inter, sans-serif',
            margin: '0 0 24px 0',
          }}
        >
          Pair programming requires a larger screen and a physical keyboard. Open Ack on your laptop or workstation to start a session.
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Primary Action: Copy link */}
          <button
            type="button"
            id="btn-copy-desktop-link"
            onClick={handleCopyLink}
            style={{
              width: '100%',
              minHeight: '44px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-button, 10px)',
              background: 'var(--ack-accent, #8B7CFF)',
              color: '#0B0B0D',
              border: 'none',
              fontSize: '14px',
              fontWeight: 600,
              fontFamily: 'Inter, sans-serif',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'opacity 150ms ease, transform 150ms ease',
            }}
          >
            {hasCopied ? (
              <>
                <Check size={16} strokeWidth={2.5} />
                <span>Link copied to clipboard!</span>
              </>
            ) : (
              <>
                <Copy size={16} strokeWidth={2} />
                <span>Copy link to open on desktop</span>
              </>
            )}
          </button>

          {/* Secondary Action: Got it */}
          <button
            type="button"
            id="btn-got-it-notice"
            onClick={onClose}
            style={{
              width: '100%',
              minHeight: '44px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-button, 10px)',
              background: 'transparent',
              color: 'var(--ack-text, #ECECEF)',
              border: '1px solid var(--ack-border, #26262B)',
              fontSize: '14px',
              fontWeight: 500,
              fontFamily: 'Inter, sans-serif',
              cursor: 'pointer',
              transition: 'background 150ms ease, border-color 150ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--ack-surface-2, #17171B)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

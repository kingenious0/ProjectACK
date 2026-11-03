import React, { useState, useEffect } from 'react';
import { ChevronLeft, Flame, Check, Copy } from 'lucide-react';
import { webStore } from '../../web-db/store';

export interface RevealSecretModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatId: string;
  messageId: string;
  secretTitle?: string;
  senderName?: string;
  senderAvatar?: string;
  timestamp?: string;
  secretPayload?: string;
  ttlSeconds?: number;
  isBurned?: boolean;
}

export const RevealSecretModal: React.FC<RevealSecretModalProps> = ({
  isOpen,
  onClose,
  chatId,
  messageId,
  secretTitle = 'Production keys',
  senderName = 'Sarah Connor',
  timestamp = '1h ago',
  secretPayload = `DATABASE_URL="postgres://user:••••@host:5432/db"\nSTRIPE_SECRET_KEY="sk_live_••••"\nJWT_SECRET="••••"`,
  ttlSeconds = 60,
  isBurned = false,
}) => {
  const [timeLeft, setTimeLeft] = useState(ttlSeconds);
  const [isCopied, setIsCopied] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [locallyBurned, setLocallyBurned] = useState(isBurned);

  // Sync if externally burned
  useEffect(() => {
    if (isBurned) setLocallyBurned(true);
  }, [isBurned]);

  // Countdown timer while secret is open
  useEffect(() => {
    let timer: any;
    if (isOpen && !locallyBurned && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleBurnNow();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, locallyBurned, timeLeft]);

  if (!isOpen) return null;

  const handleBurnNow = () => {
    setIsPurging(true);
    setTimeout(() => {
      setLocallyBurned(true);
      setIsPurging(false);
      webStore.burnSecret(chatId, messageId);
    }, 450);
  };

  const handleCopyAndBurn = async () => {
    try {
      await navigator.clipboard.writeText(secretPayload);
      setIsCopied(true);
      setTimeout(() => {
        handleBurnNow();
      }, 700);
    } catch {
      handleBurnNow();
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const totalTimeFormatted = formatTimer(ttlSeconds);
  const percentRemaining = ttlSeconds > 0 ? (timeLeft / ttlSeconds) * 100 : 0;

  // Extract initials for avatar
  const initials = senderName
    ? senderName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'SC';

  return (
    <div
      className="ack-modal-backdrop"
      onClick={onClose}
      id="reveal-secret-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
      }}
    >
      <div
        className="ack-reveal-card"
        onClick={(e) => e.stopPropagation()}
        id="reveal-secret-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reveal-secret-header"
        style={{
          width: '100%',
          maxWidth: '420px',
          height: '100%',
          maxHeight: '100%',
          background: 'var(--ack-bg, #0B0B0D)',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          padding: '16px 20px 24px 20px',
          paddingTop: 'calc(env(safe-area-inset-top, 16px) + 8px)',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 20px) + 12px)',
          overflowY: 'auto',
          animation: 'ackFadeIn 180ms ease',
        }}
      >
        {/* Top Bar: Back Chevron + "Secret" */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            height: '44px',
            marginBottom: '20px',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            id="btn-back-secret"
            aria-label="Back to chat"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--ack-text, #ECECEF)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 8px 6px 0',
              marginLeft: '-4px',
              fontSize: '17px',
              fontWeight: 700,
            }}
          >
            <ChevronLeft size={22} strokeWidth={2} />
            <span id="reveal-secret-header">Secret</span>
          </button>
        </div>

        {/* Sender & Metadata Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '18px',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'var(--ack-avatar-bg, #1A1A1F)',
              border: '1px solid var(--ack-border, #26262B)',
              color: 'var(--ack-text, #ECECEF)',
              fontSize: '15px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: 'var(--ack-text, #ECECEF)',
              }}
            >
              {secretTitle}
            </span>
            <span
              style={{
                fontSize: '13px',
                color: 'var(--ack-muted, #9A9AA3)',
                marginTop: '1px',
              }}
            >
              From {senderName} · {timestamp}
            </span>
          </div>
        </div>

        {/* Secret Box / Burned State */}
        <div
          style={{
            position: 'relative',
            background: 'var(--ack-surface-2, #17171B)',
            border: locallyBurned ? '1px dashed var(--ack-danger, #F87171)' : '1px solid var(--ack-border, #26262B)',
            borderRadius: '14px',
            padding: '16px',
            minHeight: '120px',
            boxSizing: 'border-box',
            marginBottom: '20px',
            opacity: isPurging ? 0.3 : 1,
            transition: 'opacity 250ms ease, border-color 250ms ease',
          }}
        >
          {locallyBurned ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '16px 8px',
                color: 'var(--ack-danger, #F87171)',
                gap: '8px',
              }}
            >
              <Flame size={24} strokeWidth={1.75} />
              <span style={{ fontSize: '14px', fontWeight: 600 }}>This secret was permanently burned</span>
              <span style={{ fontSize: '12px', color: 'var(--ack-muted, #9A9AA3)', lineHeight: 1.4 }}>
                Purged from your browser's encrypted vault. Cannot be recovered.
              </span>
            </div>
          ) : (
            <pre
              style={{
                margin: 0,
                fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
                fontSize: '13px',
                lineHeight: 1.6,
                color: 'var(--ack-text, #ECECEF)',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                userSelect: 'all',
              }}
            >
              {secretPayload}
            </pre>
          )}
        </div>

        {!locallyBurned && (
          <>
            {/* Countdown Bar & Timer Header */}
            <div style={{ marginBottom: '16px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px',
                  fontSize: '13.5px',
                }}
              >
                <span
                  style={{
                    color: 'var(--ack-warning, #F5B544)',
                    fontWeight: 700,
                  }}
                >
                  Burns in {formatTimer(timeLeft)}
                </span>
                <span
                  style={{
                    color: 'var(--ack-muted, #9A9AA3)',
                  }}
                >
                  of {totalTimeFormatted}
                </span>
              </div>

              {/* Progress Track */}
              <div
                style={{
                  width: '100%',
                  height: '6px',
                  borderRadius: '3px',
                  background: 'var(--ack-border, #26262B)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${percentRemaining}%`,
                    background: 'var(--ack-warning, #F5B544)',
                    transition: 'width 1s linear',
                    borderRadius: '3px',
                  }}
                />
              </div>
            </div>

            {/* Warning Note */}
            <p
              style={{
                fontSize: '13px',
                lineHeight: 1.45,
                color: 'var(--ack-muted, #9A9AA3)',
                margin: '0 0 auto 0',
              }}
            >
              Copying removes this secret for everyone. It cannot be recovered afterwards.
            </p>

            {/* Action Buttons */}
            <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                onClick={handleCopyAndBurn}
                id="btn-copy-and-burn"
                style={{
                  width: '100%',
                  height: '48px',
                  borderRadius: '14px',
                  background: 'var(--ack-accent, #8B7CFF)',
                  color: '#0B0B0D',
                  border: 'none',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 14px rgba(139, 124, 255, 0.28)',
                  transition: 'transform 80ms ease, opacity 150ms ease',
                }}
              >
                {isCopied ? (
                  <>
                    <Check size={18} strokeWidth={2.2} />
                    <span>Copied! Burning...</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} strokeWidth={1.75} />
                    <span>Copy and burn</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleBurnNow}
                id="btn-burn-now"
                style={{
                  width: '100%',
                  height: '48px',
                  borderRadius: '14px',
                  background: 'transparent',
                  border: '1px solid var(--ack-border, #26262B)',
                  color: 'var(--ack-text, #ECECEF)',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'background 120ms ease',
                }}
              >
                <Flame size={15} strokeWidth={1.75} />
                <span>Burn now</span>
              </button>
            </div>
          </>
        )}

        {locallyBurned && (
          <div style={{ marginTop: 'auto', paddingTop: '24px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                width: '100%',
                height: '48px',
                borderRadius: '14px',
                background: 'var(--ack-surface-2, #17171B)',
                border: '1px solid var(--ack-border, #26262B)',
                color: 'var(--ack-text, #ECECEF)',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RevealSecretModal;

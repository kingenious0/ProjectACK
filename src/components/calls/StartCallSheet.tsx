import React from 'react';
import { Video, Phone, Code, X } from 'lucide-react';
import { Chat } from '../../web-db/store';

export type CallChoice = 'video' | 'voice' | 'pair';

export interface StartCallSheetProps {
  isOpen: boolean;
  chat: Chat | null;
  onClose: () => void;
  onSelectOption: (choice: CallChoice) => void;
}

export const StartCallSheet: React.FC<StartCallSheetProps> = ({
  isOpen,
  chat,
  onClose,
  onSelectOption,
}) => {
  if (!isOpen || !chat) return null;

  return (
    <div
      className="ack-call-sheet-backdrop"
      id="ack-start-call-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 2500,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        animation: 'ackFadeIn 150ms ease',
      }}
    >
      <div
        className="ack-call-sheet-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--ack-surface, #131316)',
          borderTop: '1px solid var(--ack-border, #26262B)',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          padding: '16px 20px',
          paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
          maxWidth: '540px',
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box',
          boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.6)',
          animation: 'ackSlideUp 200ms ease',
        }}
      >
        {/* Grab Handle */}
        <div
          style={{
            width: '36px',
            height: '4px',
            borderRadius: '2px',
            background: 'var(--ack-border, #26262B)',
            margin: '0 auto 16px auto',
          }}
        />

        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}
        >
          <div>
            <h2
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: 'var(--ack-text, #ECECEF)',
                fontFamily: 'Inter, sans-serif',
                letterSpacing: '-0.02em',
                margin: 0,
              }}
            >
              Start a call
            </h2>
            <p
              style={{
                fontSize: '13px',
                color: 'var(--ack-muted, #9A9AA3)',
                margin: '2px 0 0 0',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              with {chat.name}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--ack-muted, #9A9AA3)',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Options List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Option 1: Video Call */}
          <button
            type="button"
            id="btn-call-opt-video"
            onClick={() => onSelectOption('video')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '14px 16px',
              background: 'var(--ack-surface-2, #17171B)',
              border: '1px solid var(--ack-border, #26262B)',
              borderRadius: 'var(--radius-card, 12px)',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'border-color 150ms ease, background 150ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--ack-accent, #8B7CFF)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--ack-border, #26262B)';
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'var(--ack-avatar-bg, #1A1A1F)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ack-accent, #8B7CFF)',
                flexShrink: 0,
              }}
            >
              <Video size={20} strokeWidth={1.75} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  color: 'var(--ack-text, #ECECEF)',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Video call
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: 'var(--ack-muted, #9A9AA3)',
                  fontFamily: 'Inter, sans-serif',
                  marginTop: '2px',
                }}
              >
                Face-to-face with screen share
              </div>
            </div>
          </button>

          {/* Option 2: Voice Session */}
          <button
            type="button"
            id="btn-call-opt-voice"
            onClick={() => onSelectOption('voice')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '14px 16px',
              background: 'var(--ack-surface-2, #17171B)',
              border: '1px solid var(--ack-border, #26262B)',
              borderRadius: 'var(--radius-card, 12px)',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'border-color 150ms ease, background 150ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--ack-accent, #8B7CFF)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--ack-border, #26262B)';
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'var(--ack-avatar-bg, #1A1A1F)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ack-accent, #8B7CFF)',
                flexShrink: 0,
              }}
            >
              <Phone size={19} strokeWidth={1.75} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  color: 'var(--ack-text, #ECECEF)',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Voice session
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: 'var(--ack-muted, #9A9AA3)',
                  fontFamily: 'Inter, sans-serif',
                  marginTop: '2px',
                }}
              >
                Lightweight audio, works on bad WiFi
              </div>
            </div>
          </button>

          {/* Option 3: Pair Programming (Desktop Only) */}
          <button
            type="button"
            id="btn-call-opt-pair"
            onClick={() => onSelectOption('pair')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '14px 16px',
              background: 'var(--ack-surface-2, #17171B)',
              border: '1px solid var(--ack-border, #26262B)',
              borderRadius: 'var(--radius-card, 12px)',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'border-color 150ms ease, background 150ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--ack-accent, #8B7CFF)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--ack-border, #26262B)';
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'var(--ack-avatar-bg, #1A1A1F)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ack-accent, #8B7CFF)',
                flexShrink: 0,
              }}
            >
              <Code size={20} strokeWidth={1.75} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span
                  style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: 'var(--ack-text, #ECECEF)',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  Pair programming
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: 'var(--ack-accent-tint, #272250)',
                    color: 'var(--ack-accent-text, #A99DFF)',
                    border: '1px solid rgba(139, 124, 255, 0.3)',
                  }}
                >
                  Desktop only
                </span>
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: 'var(--ack-muted, #9A9AA3)',
                  fontFamily: 'Inter, sans-serif',
                  marginTop: '2px',
                }}
              >
                Shared editor, terminals, low latency
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

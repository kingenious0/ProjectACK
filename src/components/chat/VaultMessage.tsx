import React, { useState } from 'react';
import { Eye, Flame, Lock } from 'lucide-react';
import { webStore } from '../../web-db/store';
import { RevealSecretModal } from './RevealSecretModal';

export interface VaultMessageProps {
  chatId: string;
  messageId: string;
  secretTitle?: string;
  senderName?: string;
  senderAvatar?: string;
  timestamp?: string;
  secretMasked?: string;
  ttlSeconds?: number;
  isBurned?: boolean;
}

export const VaultMessage: React.FC<VaultMessageProps> = ({
  chatId,
  messageId,
  secretTitle = 'Production keys',
  senderName = 'Sarah Connor',
  senderAvatar,
  timestamp = '1h ago',
  secretMasked = `DATABASE_URL="postgres://user:••••@host:5432/db"\nSTRIPE_SECRET_KEY="sk_live_••••"\nJWT_SECRET="••••"`,
  ttlSeconds = 60,
  isBurned = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (isBurned) {
    return (
      <div
        className="ack-vault-burned"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 14px',
          background: 'rgba(248, 113, 113, 0.08)',
          borderRadius: '12px',
          border: '1px solid rgba(248, 113, 113, 0.3)',
          color: 'var(--ack-danger, #F87171)',
          fontSize: '12.5px',
          fontStyle: 'italic',
          margin: '4px 0',
        }}
      >
        <Flame size={15} strokeWidth={1.75} />
        <span>This secret was permanently burned and purged.</span>
      </div>
    );
  }

  return (
    <>
      <div
        className="ack-vault-card"
        onClick={() => setIsModalOpen(true)}
        role="button"
        tabIndex={0}
        aria-label={`Open secret: ${secretTitle}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setIsModalOpen(true);
          }
        }}
        style={{
          background: 'var(--ack-surface, #131316)',
          borderRadius: '14px',
          border: '1px solid var(--ack-border, #26262B)',
          padding: '12px 14px',
          margin: '4px 0 6px 0',
          minWidth: '240px',
          maxWidth: '320px',
          cursor: 'pointer',
          transition: 'border-color 150ms ease, transform 80ms ease',
        }}
      >
        {/* Top Header: Lock + Title */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '6px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <Lock
              size={15}
              strokeWidth={1.75}
              style={{ color: 'var(--ack-warning, #F5B544)' }}
            />
            <span
              style={{
                fontSize: '14px',
                fontWeight: 700,
                color: 'var(--ack-text, #ECECEF)',
              }}
            >
              {secretTitle}
            </span>
          </div>
          <span
            style={{
              fontSize: '11px',
              color: 'var(--ack-warning, #F5B544)',
              fontWeight: 600,
              fontFamily: 'var(--font-mono, monospace)',
            }}
          >
            {ttlSeconds >= 60 ? `${Math.floor(ttlSeconds / 60)}m` : `${ttlSeconds}s`}
          </span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '12px',
            color: 'var(--ack-muted, #9A9AA3)',
            marginBottom: '10px',
            lineHeight: 1.4,
          }}
        >
          Burns after reading · End-to-end encrypted
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsModalOpen(true);
          }}
          style={{
            width: '100%',
            height: '36px',
            background: 'rgba(245, 181, 68, 0.1)',
            border: '1px dashed var(--ack-warning, #F5B544)',
            borderRadius: '10px',
            color: 'var(--ack-warning, #F5B544)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'background 120ms ease',
          }}
        >
          <Eye size={14} strokeWidth={1.75} />
          <span>Reveal secret</span>
        </button>
      </div>

      {/* Reveal Secret Modal */}
      <RevealSecretModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        chatId={chatId}
        messageId={messageId}
        secretTitle={secretTitle}
        senderName={senderName}
        senderAvatar={senderAvatar}
        timestamp={timestamp}
        secretPayload={secretMasked}
        ttlSeconds={ttlSeconds}
        isBurned={isBurned}
      />
    </>
  );
};

// Backward-compatibility export
export const WhatsAppVaultBubble = VaultMessage;
export default VaultMessage;

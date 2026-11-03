import React from 'react';
import { Flame, ShieldAlert, ArrowLeft } from 'lucide-react';

interface BurnedSecretModalProps {
  isOpen: boolean;
  onClose: () => void;
  senderName: string;
  secretTitle?: string;
  copiedAt?: string;
  onAskNewSecret?: (senderName: string) => void;
}

export const BurnedSecretModal: React.FC<BurnedSecretModalProps> = ({
  isOpen,
  onClose,
  senderName,
  secretTitle = 'Production keys',
  copiedAt = '1h ago',
  onAskNewSecret,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(11, 11, 13, 0.88)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '380px',
          backgroundColor: '#131316',
          border: '1px solid #26262B',
          borderRadius: '20px',
          padding: '28px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Flame Tile in Warning Color */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            backgroundColor: 'rgba(245, 181, 68, 0.12)',
            border: '1px solid rgba(245, 181, 68, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
          }}
        >
          <Flame size={32} color="#F5B544" />
        </div>

        <h2
          style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#F4F4F5',
            margin: '0 0 8px 0',
            letterSpacing: '-0.01em',
          }}
        >
          This secret has been burned
        </h2>

        <div
          style={{
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#A1A1AA',
            backgroundColor: '#18181C',
            border: '1px solid #26262B',
            borderRadius: '6px',
            padding: '4px 10px',
            marginBottom: '16px',
          }}
        >
          {secretTitle} · Copied {copiedAt}
        </div>

        <p
          style={{
            fontSize: '13px',
            lineHeight: '1.5',
            color: '#71717A',
            margin: '0 0 24px 0',
          }}
        >
          It can't be recovered. As soon as the TTL elapsed, the AES-GCM ciphertext and decryption keys were purged permanently from local memory.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
          <button
            onClick={() => {
              if (onAskNewSecret) {
                onAskNewSecret(senderName);
              }
              onClose();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: '#8B7CFF',
              color: '#0B0B0D',
              border: 'none',
              borderRadius: '10px',
              padding: '12px 18px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'transform 0.15s ease',
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <ShieldAlert size={16} />
            <span>Ask {senderName} for a new secret</span>
          </button>

          <button
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: 'transparent',
              color: '#A1A1AA',
              border: '1px solid #26262B',
              borderRadius: '10px',
              padding: '12px 18px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to chat</span>
          </button>
        </div>
      </div>
    </div>
  );
};

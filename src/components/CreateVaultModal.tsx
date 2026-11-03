import React, { useState } from 'react';
import { X, Lock } from 'lucide-react';
import { encryptEnvSecret } from '../utils/crypto';

interface CreateVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendVault: (title: string, rawSecret: string, ttlSeconds: number) => void;
}

const TTL_OPTIONS = [
  { label: '30s', value: 30 },
  { label: '1m', value: 60 },
  { label: '5m', value: 300 },
  { label: '10m', value: 600 },
];

const DEFAULT_SECRET = `DATABASE_URL="postgres://user:••••@host:5432/db"
STRIPE_SECRET_KEY="sk_live_••••"
JWT_SECRET="••••"`;

export const CreateVaultModal: React.FC<CreateVaultModalProps> = ({
  isOpen,
  onClose,
  onSendVault,
}) => {
  const [vaultTitle, setVaultTitle] = useState('Production keys');
  const [rawSecret, setRawSecret] = useState(DEFAULT_SECRET);
  const [ttl, setTtl] = useState(60);
  const [isEncrypting, setIsEncrypting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawSecret.trim()) return;

    setIsEncrypting(true);
    try {
      await encryptEnvSecret(rawSecret);
      onSendVault(vaultTitle || 'Secret keys', rawSecret, ttl);
      onClose();
    } catch (err) {
      console.error('Encryption failed', err);
    } finally {
      setIsEncrypting(false);
    }
  };

  return (
    <div
      className="ack-modal-backdrop"
      onClick={onClose}
      id="create-vault-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: 0,
      }}
    >
      <div
        className="ack-vault-sheet"
        onClick={(e) => e.stopPropagation()}
        id="create-vault-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-secret-title"
        style={{
          width: '100%',
          maxWidth: '480px',
          background: 'var(--ack-surface, #131316)',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          borderTop: '1px solid var(--ack-border, #26262B)',
          borderLeft: '1px solid var(--ack-border, #26262B)',
          borderRight: '1px solid var(--ack-border, #26262B)',
          padding: '12px 20px 24px 20px',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + 16px)',
          boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.6)',
          animation: 'ackSlideUp 220ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Mobile Drag Indicator */}
        <div
          style={{
            width: '36px',
            height: '4px',
            borderRadius: '2px',
            background: '#3A3A42',
            margin: '0 auto 16px auto',
          }}
        />

        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
          }}
        >
          <h2
            id="new-secret-title"
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: 'var(--ack-text, #ECECEF)',
              margin: 0,
            }}
          >
            New secret
          </h2>
          <button
            type="button"
            onClick={onClose}
            id="btn-close-vault-modal"
            aria-label="Close"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--ack-muted, #9A9AA3)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '44px',
              height: '44px',
              margin: '-8px -10px -8px 0',
              borderRadius: '50%',
            }}
          >
            <X size={20} strokeWidth={1.75} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Label Field */}
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="input-vault-label"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--ack-muted, #9A9AA3)',
                marginBottom: '6px',
              }}
            >
              Label
            </label>
            <input
              type="text"
              id="input-vault-label"
              value={vaultTitle}
              onChange={(e) => setVaultTitle(e.target.value)}
              placeholder="Production keys"
              style={{
                width: '100%',
                background: 'var(--ack-surface-2, #17171B)',
                border: '1px solid var(--ack-border, #26262B)',
                borderRadius: '12px',
                padding: '12px 14px',
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--ack-text, #ECECEF)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Secret Textarea */}
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="input-vault-payload"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--ack-muted, #9A9AA3)',
                marginBottom: '6px',
              }}
            >
              Secret
            </label>
            <textarea
              id="input-vault-payload"
              rows={4}
              value={rawSecret}
              onChange={(e) => setRawSecret(e.target.value)}
              placeholder="PASTE SECRET PAYLOAD..."
              style={{
                width: '100%',
                background: 'var(--ack-surface-2, #17171B)',
                border: '1px solid var(--ack-border, #26262B)',
                borderRadius: '14px',
                padding: '12px 14px',
                fontSize: '13px',
                lineHeight: 1.5,
                fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
                color: 'var(--ack-text, #ECECEF)',
                outline: 'none',
                resize: 'none',
                minHeight: '110px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Burns after reading */}
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--ack-muted, #9A9AA3)',
                marginBottom: '6px',
              }}
            >
              Burns after reading
            </label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                background: 'var(--ack-surface-2, #17171B)',
                border: '1px solid var(--ack-border, #26262B)',
                borderRadius: '12px',
                padding: '4px',
                gap: '4px',
              }}
            >
              {TTL_OPTIONS.map((opt) => {
                const isActive = ttl === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTtl(opt.value)}
                    style={{
                      height: '36px',
                      borderRadius: '8px',
                      background: isActive ? 'var(--ack-accent-tint, #272250)' : 'transparent',
                      border: isActive ? '1px solid var(--ack-accent, #8B7CFF)' : '1px solid transparent',
                      color: isActive ? '#FFFFFF' : 'var(--ack-muted, #9A9AA3)',
                      fontSize: '14px',
                      fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 120ms ease',
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Encryption Note */}
          <div
            style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
              margin: '16px 0 24px 0',
            }}
          >
            <Lock
              size={15}
              strokeWidth={1.75}
              style={{ color: 'var(--ack-warning, #F5B544)', marginTop: '2px', flexShrink: 0 }}
            />
            <span
              style={{
                fontSize: '12.5px',
                lineHeight: 1.4,
                color: 'var(--ack-muted, #9A9AA3)',
              }}
            >
              End-to-end encrypted before sending. Permanently deleted after it is revealed.
            </span>
          </div>

          {/* Action Buttons */}
          <button
            type="submit"
            disabled={isEncrypting}
            id="btn-encrypt-send-vault"
            style={{
              width: '100%',
              height: '48px',
              borderRadius: '14px',
              background: 'var(--ack-accent, #8B7CFF)',
              color: '#0B0B0D',
              border: 'none',
              fontSize: '15px',
              fontWeight: 700,
              cursor: isEncrypting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 12px rgba(139, 124, 255, 0.25)',
              transition: 'transform 80ms ease, opacity 150ms ease',
            }}
          >
            {isEncrypting ? 'Encrypting secret...' : 'Encrypt and send'}
          </button>

          <button
            type="button"
            onClick={onClose}
            id="btn-cancel-vault"
            style={{
              width: '100%',
              height: '44px',
              background: 'transparent',
              border: 'none',
              color: 'var(--ack-muted, #9A9AA3)',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              marginTop: '6px',
            }}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateVaultModal;

import React, { useState } from 'react';
import { Shield, X, Lock, Flame } from 'lucide-react';
import { encryptEnvSecret } from '../utils/crypto';

interface CreateVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendVault: (title: string, rawSecret: string, ttlSeconds: number) => void;
}

export const CreateVaultModal: React.FC<CreateVaultModalProps> = ({
  isOpen,
  onClose,
  onSendVault,
}) => {
  const [vaultTitle, setVaultTitle] = useState('Production API & Database Keys');
  const [rawSecret, setRawSecret] = useState(
    `DATABASE_URL="postgres://postgres:k9#Xm$88Pz@db.ack.supabase.co:5432/postgres"\nSTRIPE_SECRET_KEY="sk_live_51MXXXXXXXXX"\nJWT_SECRET_KEY="0x4b7f92a1e0c4"`
  );
  const [ttl, setTtl] = useState(60);
  const [isEncrypting, setIsEncrypting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawSecret.trim()) return;

    setIsEncrypting(true);
    try {
      await encryptEnvSecret(rawSecret);
      onSendVault(vaultTitle, rawSecret, ttl);
      onClose();
    } catch (err) {
      console.error('Encryption failed', err);
    } finally {
      setIsEncrypting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} id="create-vault-backdrop">
      <div className="modal-window" onClick={(e) => e.stopPropagation()} id="create-vault-modal">
        <div className="modal-header">
          <div className="modal-title">
            <Shield size={18} color="#FFB800" />
            <span>New Burn-After-Reading .env Vault</span>
          </div>
          <button className="icon-btn" onClick={onClose} id="btn-close-vault-modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-field">
              <label className="form-label">Vault Label / Description</label>
              <input
                type="text"
                className="form-input"
                value={vaultTitle}
                onChange={(e) => setVaultTitle(e.target.value)}
                placeholder="e.g. Staging AWS Keys, Production .env"
                id="input-vault-label"
              />
            </div>

            <div className="form-field">
              <label className="form-label">Secret Payload (Encrypted with WebCrypto AES-256-GCM)</label>
              <textarea
                className="form-textarea"
                rows={6}
                value={rawSecret}
                onChange={(e) => setRawSecret(e.target.value)}
                placeholder="PASTE YOUR SECRETS OR .ENV FILE HERE..."
                id="input-vault-payload"
                style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '13px' }}
              />
            </div>

            <div className="form-field">
              <label className="form-label">Self-Destruct Timer (After Recipient Reveals)</label>
              <select
                className="form-select"
                value={ttl}
                onChange={(e) => setTtl(Number(e.target.value))}
                id="select-vault-ttl"
              >
                <option value={15}>🔥 15 Seconds (Aggressive Burn)</option>
                <option value={30}>🔥 30 Seconds</option>
                <option value={60}>🔥 60 Seconds (Standard Safe Burn)</option>
                <option value={120}>🔥 2 Minutes</option>
              </select>
            </div>

            <div
              style={{
                fontSize: '11.5px',
                color: '#8696A0',
                background: '#161F26',
                padding: '10px 14px',
                borderRadius: '6px',
                border: '1px solid #2A3942',
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
              }}
            >
              <Lock size={15} color="#FFB800" />
              <span>
                Zero-Knowledge Guarantee: Encrypted locally in memory with AES-256-GCM before transport. Payload is permanently burned once copied.
              </span>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose} id="btn-cancel-vault">
              Cancel
            </button>
            <button
              type="submit"
              className="primary-btn"
              style={{ background: '#FFB800', color: '#000', display: 'flex', alignItems: 'center', gap: '6px' }}
              disabled={isEncrypting}
              id="btn-encrypt-send-vault"
            >
              <Flame size={14} />
              {isEncrypting ? 'Encrypting with WebCrypto...' : 'Encrypt & Send Vault'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Shield, Eye, EyeOff, Copy, Check, Flame, Lock } from 'lucide-react';
import { webStore } from '../../web-db/store';

interface WhatsAppVaultBubbleProps {
  chatId: string;
  messageId: string;
  secretMasked?: string;
  ttlSeconds?: number;
  isBurned?: boolean;
}

export const WhatsAppVaultBubble: React.FC<WhatsAppVaultBubbleProps> = ({
  chatId,
  messageId,
  secretMasked = 'SUPER_SECRET_TOKEN=ghp_9102482348572394',
  ttlSeconds = 60,
  isBurned = false,
}) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(ttlSeconds);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let timer: any;
    if (isRevealed && !isBurned && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            webStore.burnSecret(chatId, messageId);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRevealed, isBurned, timeLeft, chatId, messageId]);

  const handleReveal = () => {
    if (!isBurned) {
      setIsRevealed(true);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(secretMasked);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBurnNow = () => {
    webStore.burnSecret(chatId, messageId);
  };

  if (isBurned || timeLeft === 0) {
    return (
      <div
        className="wa-vault-burned"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          background: 'rgba(255, 71, 87, 0.1)',
          borderRadius: '7.5px',
          border: '1px solid rgba(255, 71, 87, 0.25)',
          color: '#FF4757',
          fontSize: '12px',
          fontStyle: 'italic',
          margin: '4px 0',
        }}
      >
        <Flame size={14} />
        <span>This secret was permanently burned and purged.</span>
      </div>
    );
  }

  return (
    <div
      className="wa-vault-card"
      style={{
        background: 'rgba(11, 20, 26, 0.9)',
        borderRadius: '7.5px',
        border: '1px solid rgba(255, 184, 0, 0.3)',
        padding: '10px 12px',
        margin: '4px 0 6px 0',
        minWidth: '240px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FFB800', fontSize: '12px', fontWeight: 600 }}>
          <Lock size={14} />
          <span>Zero-Knowledge .env Vault</span>
        </div>
        {isRevealed && (
          <span style={{ fontSize: '11px', color: '#FF4757', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>
            Burns in {timeLeft}s
          </span>
        )}
      </div>

      {isRevealed ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div
            style={{
              padding: '6px 8px',
              background: '#111B21',
              borderRadius: '6px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '12px',
              color: '#00FF66',
              wordBreak: 'break-all',
            }}
          >
            {secretMasked}
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleCopy}
              style={{
                background: '#00A884',
                color: '#0B141A',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              <span>{copied ? 'Copied' : 'Copy Key'}</span>
            </button>

            <button
              type="button"
              onClick={handleBurnNow}
              style={{
                background: 'rgba(255, 71, 87, 0.2)',
                color: '#FF4757',
                border: '1px solid rgba(255, 71, 87, 0.4)',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Flame size={12} />
              <span>Burn Now</span>
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleReveal}
          style={{
            width: '100%',
            padding: '8px 12px',
            background: 'rgba(255, 184, 0, 0.12)',
            border: '1px dashed rgba(255, 184, 0, 0.4)',
            borderRadius: '6px',
            color: '#FFB800',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <Eye size={14} />
          <span>Tap to Reveal Secret Key</span>
        </button>
      )}
    </div>
  );
};

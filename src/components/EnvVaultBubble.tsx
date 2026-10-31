import React, { useState, useEffect } from 'react';
import { Shield, Eye, EyeOff, Flame, Copy, Check } from 'lucide-react';
import { webStore } from '../web-db/store';

interface EnvVaultBubbleProps {
  chatId: string;
  messageId: string;
  secretMasked?: string;
  ttlSeconds?: number;
  isBurned?: boolean;
}

export const EnvVaultBubble: React.FC<EnvVaultBubbleProps> = ({
  chatId,
  messageId,
  secretMasked = '',
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
            clearInterval(timer);
            webStore.burnSecret(chatId, messageId);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRevealed, isBurned, timeLeft, chatId, messageId]);

  const handleCopyAndBurn = () => {
    if (isBurned) return;
    navigator.clipboard.writeText(secretMasked);
    setCopied(true);
    setTimeout(() => {
      webStore.burnSecret(chatId, messageId);
    }, 400);
  };

  if (isBurned) {
    return (
      <div
        className="vault-bubble-card"
        style={{
          border: '1px solid #F15C6D',
          background: 'linear-gradient(145deg, #1C1012 0%, #110B0C 100%)',
          boxShadow: 'none',
        }}
        id={`vault-${messageId}`}
      >
        <div className="vault-bubble-top" style={{ color: '#F15C6D' }}>
          <Flame size={16} color="#F15C6D" />
          <span>Burned .env Secret (Purged)</span>
        </div>
        <div
          className="vault-secret-box"
          style={{
            borderColor: '#F15C6D',
            color: '#8696A0',
            textAlign: 'center',
            padding: '12px',
          }}
        >
          💥 This .env payload was burned and permanently erased from local storage &amp; relay buffers.
        </div>
      </div>
    );
  }

  return (
    <div className="vault-bubble-card" id={`vault-${messageId}`}>
      <div className="vault-bubble-top">
        <Shield size={16} />
        <span>Burn-After-Reading .env Vault</span>
        {isRevealed && (
          <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#FFB800' }}>
            Auto-destruct in: <strong>{timeLeft}s</strong>
          </span>
        )}
      </div>

      <div className="vault-secret-box">
        {isRevealed ? (
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', color: '#00FF66' }}>{secretMasked}</pre>
        ) : (
          <div style={{ letterSpacing: '3px', color: '#8696A0' }}>
            ••••••••••••••••••••••••••••••••••••••••••••
            <br />
            ••••••••••••••••••••••••••••••••••••••••••••
          </div>
        )}
      </div>

      <div className="vault-actions">
        <button
          className="reveal-btn"
          onClick={() => setIsRevealed(!isRevealed)}
          id={`btn-reveal-${messageId}`}
        >
          {isRevealed ? (
            <>
              <EyeOff size={13} style={{ display: 'inline', marginRight: 4 }} /> Hide
            </>
          ) : (
            <>
              <Eye size={13} style={{ display: 'inline', marginRight: 4 }} /> Reveal Secret
            </>
          )}
        </button>

        <button
          className="burn-btn"
          onClick={handleCopyAndBurn}
          id={`btn-burn-${messageId}`}
          title="Copies secret to clipboard and wipes it permanently"
        >
          {copied ? (
            <>
              <Check size={14} /> Copied &amp; Purged!
            </>
          ) : (
            <>
              <Copy size={13} />
              <Flame size={13} />
              Copy &amp; Burn
            </>
          )}
        </button>
      </div>
    </div>
  );
};

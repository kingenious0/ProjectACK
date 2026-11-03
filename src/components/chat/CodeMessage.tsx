import React, { useState } from 'react';
import { Copy, Check, Terminal, Columns } from 'lucide-react';

export interface CodeMessageProps {
  language?: string;
  code: string;
  title?: string;
  onOpenReview?: () => void;
}

export const CodeMessage: React.FC<CodeMessageProps> = ({
  language = 'typescript',
  code,
  title,
  onOpenReview,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="ack-code-card"
      onClick={onOpenReview}
      style={{
        background: 'var(--ack-surface)',
        borderRadius: 'var(--radius-card)',
        border: '1px solid var(--ack-border)',
        overflow: 'hidden',
        margin: '4px 0 6px 0',
        fontFamily: 'var(--font-mono)',
        cursor: onOpenReview ? 'pointer' : 'default',
        transition: 'border-color var(--transition-fast)',
      }}
      title={onOpenReview ? 'Click to open code review diff' : undefined}
    >
      {/* Code Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          background: 'var(--ack-surface-2)',
          borderBottom: '1px solid var(--ack-border)',
          fontSize: '11.5px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--ack-accent-text)', fontWeight: 600 }}>
          <Terminal size={13} strokeWidth={1.75} />
          <span>{language.toUpperCase()}</span>
          {title && <span style={{ color: 'var(--ack-muted)', fontWeight: 400 }}>· {title}</span>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onOpenReview && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenReview();
              }}
              aria-label="Review diff"
              style={{
                background: 'var(--ack-accent-tint)',
                border: '1px solid var(--ack-border)',
                color: 'var(--ack-accent-text)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                padding: '3px 8px',
                borderRadius: 'var(--radius-button)',
                fontWeight: 600,
              }}
            >
              <Columns size={12} strokeWidth={1.75} />
              <span>Review diff</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy snippet"
            style={{
              background: 'transparent',
              border: 'none',
              color: copied ? 'var(--ack-success)' : 'var(--ack-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              padding: '2px 6px',
              borderRadius: '4px',
            }}
          >
            {copied ? (
              <>
                <Check size={12} strokeWidth={1.75} color="var(--ack-success)" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy size={12} strokeWidth={1.75} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Body */}
      <div
        style={{
          padding: '10px 12px',
          overflowX: 'auto',
          fontSize: '12px',
          lineHeight: '1.5',
          color: 'var(--ack-text)',
          maxHeight: '260px',
        }}
      >
        <pre style={{ margin: 0, fontFamily: 'inherit' }}>
          <code>{code.trim()}</code>
        </pre>
      </div>
    </div>
  );
};

// Backward-compatibility export
export const WhatsAppCodeBubble = CodeMessage;

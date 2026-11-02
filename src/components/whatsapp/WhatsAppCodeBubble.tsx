import React, { useState } from 'react';
import { Copy, Check, Terminal, Columns, ExternalLink } from 'lucide-react';

interface WhatsAppCodeBubbleProps {
  language?: string;
  code: string;
  title?: string;
  onOpenReview?: () => void;
}

export const WhatsAppCodeBubble: React.FC<WhatsAppCodeBubbleProps> = ({
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
      className="wa-code-card"
      onClick={onOpenReview}
      style={{
        background: 'rgba(9, 13, 22, 0.95)',
        borderRadius: '8px',
        border: '1px solid rgba(0, 255, 204, 0.25)',
        overflow: 'hidden',
        margin: '4px 0 6px 0',
        fontFamily: 'JetBrains Mono, monospace',
        cursor: onOpenReview ? 'pointer' : 'default',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
      }}
      title={onOpenReview ? 'Click to open Split-Screen Code Review' : undefined}
    >
      {/* Code Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 10px',
          background: 'rgba(26, 35, 51, 0.95)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          fontSize: '11px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--wa-accent-green)', fontWeight: 700 }}>
          <Terminal size={13} />
          <span>{language.toUpperCase()}</span>
          {title && <span style={{ color: 'var(--wa-text-secondary)', fontWeight: 400 }}>&bull; {title}</span>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onOpenReview && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenReview();
              }}
              style={{
                background: 'rgba(0, 255, 204, 0.1)',
                border: '1px solid rgba(0, 255, 204, 0.3)',
                color: 'var(--wa-accent-green)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '10.5px',
                padding: '2px 7px',
                borderRadius: '4px',
                fontWeight: 600,
              }}
              title="Open Split Review Canvas"
            >
              <Columns size={12} />
              <span>Split Review</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopy}
            style={{
              background: 'transparent',
              border: 'none',
              color: copied ? 'var(--wa-accent-green)' : 'var(--wa-text-secondary)',
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
                <Check size={12} color="var(--wa-accent-green)" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy size={12} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Body */}
      <div
        style={{
          padding: '8px 10px',
          overflowX: 'auto',
          fontSize: '12px',
          lineHeight: '1.5',
          color: 'var(--wa-text-primary)',
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

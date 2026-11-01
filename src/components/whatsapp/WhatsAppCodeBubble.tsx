import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

interface WhatsAppCodeBubbleProps {
  language?: string;
  code: string;
  title?: string;
}

export const WhatsAppCodeBubble: React.FC<WhatsAppCodeBubbleProps> = ({
  language = 'typescript',
  code,
  title,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="wa-code-card"
      style={{
        background: 'rgba(11, 20, 26, 0.85)',
        borderRadius: '7.5px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        overflow: 'hidden',
        margin: '4px 0 6px 0',
        fontFamily: 'JetBrains Mono, monospace',
      }}
    >
      {/* Code Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 10px',
          background: 'rgba(32, 44, 51, 0.9)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          fontSize: '11px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#00A884', fontWeight: 600 }}>
          <Terminal size={13} />
          <span>{language.toUpperCase()}</span>
          {title && <span style={{ color: '#8696A0', fontWeight: 400 }}>&bull; {title}</span>}
        </div>

        <button
          type="button"
          onClick={handleCopy}
          style={{
            background: 'transparent',
            border: 'none',
            color: copied ? '#00A884' : '#8696A0',
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
              <Check size={12} color="#00A884" />
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

      {/* Code Body */}
      <div
        style={{
          padding: '8px 10px',
          overflowX: 'auto',
          fontSize: '12px',
          lineHeight: '1.5',
          color: '#E9EDEF',
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

import React, { useState } from 'react';
import { Code, X, Send, ChevronDown } from 'lucide-react';

export interface CreateCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendCode: (code: string, language: string, title: string) => void;
}

export const CreateCodeModal: React.FC<CreateCodeModalProps> = ({
  isOpen,
  onClose,
  onSendCode,
}) => {
  const [code, setCode] = useState(
    `async function syncDatabase(): Promise<void> {\n  console.log('[ACK] Establishing zero-trust WebSocket link...');\n  const conn = await db.connect();\n  await conn.execute('PRAGMA synchronous = NORMAL;');\n}`
  );
  const [language, setLanguage] = useState('typescript');
  const [title, setTitle] = useState('Database Sync Hook');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    onSendCode(code, language, title);
    onClose();
  };

  return (
    <div
      className="ack-modal-backdrop"
      onClick={onClose}
      id="create-code-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.76)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: 0,
      }}
    >
      <div
        className="ack-vault-sheet"
        onClick={(e) => e.stopPropagation()}
        id="create-code-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-code-title"
        style={{
          width: '100%',
          maxWidth: '520px',
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
          boxSizing: 'border-box',
          color: 'var(--ack-text, #ECECEF)',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'var(--ack-accent-tint, #272250)',
                border: '1px solid rgba(139, 124, 255, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ack-accent, #8B7CFF)',
              }}
            >
              <Code size={18} strokeWidth={2} />
            </div>
            <div>
              <h2
                id="share-code-title"
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: 'var(--ack-text, #ECECEF)',
                  margin: 0,
                  letterSpacing: '-0.01em',
                }}
              >
                Share Code Snippet
              </h2>
              <span
                style={{
                  fontSize: '12px',
                  color: 'var(--ack-muted, #9A9AA3)',
                }}
              >
                Syntax highlighted with inline diff actions
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            id="btn-close-code-modal"
            aria-label="Close"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--ack-surface-2, #17171B)',
              border: '1px solid var(--ack-border, #26262B)',
              color: 'var(--ack-muted, #9A9AA3)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 150ms ease',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Title & Language Row */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 240px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--ack-muted, #9A9AA3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: '6px',
                }}
              >
                Snippet Title / Description
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Auth middleware, Zero-copy buffer"
                id="input-code-title"
                style={{
                  width: '100%',
                  height: '40px',
                  background: 'var(--ack-surface-2, #17171B)',
                  border: '1px solid var(--ack-border, #26262B)',
                  borderRadius: '10px',
                  padding: '0 12px',
                  fontSize: '14px',
                  color: 'var(--ack-text, #ECECEF)',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 150ms ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--ack-accent, #8B7CFF)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--ack-border, #26262B)';
                }}
              />
            </div>

            <div style={{ flex: '0 0 130px', position: 'relative' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--ack-muted, #9A9AA3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: '6px',
                }}
              >
                Language
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  id="select-code-lang"
                  style={{
                    width: '100%',
                    height: '40px',
                    background: 'var(--ack-surface-2, #17171B)',
                    border: '1px solid var(--ack-border, #26262B)',
                    borderRadius: '10px',
                    padding: '0 28px 0 12px',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: 'var(--ack-text, #ECECEF)',
                    outline: 'none',
                    boxSizing: 'border-box',
                    cursor: 'pointer',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                  }}
                >
                  <option value="typescript" style={{ background: '#17171B', color: '#ECECEF' }}>TypeScript</option>
                  <option value="javascript" style={{ background: '#17171B', color: '#ECECEF' }}>JavaScript</option>
                  <option value="rust" style={{ background: '#17171B', color: '#ECECEF' }}>Rust</option>
                  <option value="python" style={{ background: '#17171B', color: '#ECECEF' }}>Python</option>
                  <option value="go" style={{ background: '#17171B', color: '#ECECEF' }}>Go</option>
                  <option value="sql" style={{ background: '#17171B', color: '#ECECEF' }}>SQL</option>
                  <option value="bash" style={{ background: '#17171B', color: '#ECECEF' }}>Bash / Shell</option>
                  <option value="json" style={{ background: '#17171B', color: '#ECECEF' }}>JSON</option>
                </select>
                <ChevronDown
                  size={14}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    color: 'var(--ack-muted, #9A9AA3)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Code Textarea */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '6px',
              }}
            >
              <label
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--ack-muted, #9A9AA3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Code Content
              </label>
              <span
                style={{
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  fontSize: '11px',
                  color: 'var(--ack-accent-text, #A99DFF)',
                  background: 'var(--ack-accent-tint, #272250)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}
              >
                {language}
              </span>
            </div>

            <textarea
              rows={9}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste code snippet here..."
              id="input-code-content"
              spellCheck={false}
              style={{
                width: '100%',
                background: '#0B0B0D',
                border: '1px solid var(--ack-border, #26262B)',
                borderRadius: '12px',
                padding: '12px 14px',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                fontSize: '13px',
                lineHeight: '1.5',
                color: '#E4E4E7',
                outline: 'none',
                boxSizing: 'border-box',
                resize: 'vertical',
                transition: 'border-color 150ms ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--ack-accent, #8B7CFF)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--ack-border, #26262B)';
              }}
            />
          </div>

          {/* Footer Actions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '10px',
              marginTop: '8px',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              id="btn-cancel-code"
              style={{
                padding: '10px 16px',
                borderRadius: '10px',
                background: 'transparent',
                border: '1px solid var(--ack-border, #26262B)',
                color: 'var(--ack-muted, #9A9AA3)',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 150ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--ack-surface-2, #17171B)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              id="btn-send-code"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '10px',
                background: 'var(--ack-accent, #8B7CFF)',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(139, 124, 255, 0.35)',
                transition: 'transform 100ms ease, opacity 150ms ease',
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.97)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <Send size={15} />
              <span>Send Code Snippet</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

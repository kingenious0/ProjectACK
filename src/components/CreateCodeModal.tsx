import React, { useState } from 'react';
import { Code, X, Send } from 'lucide-react';

interface CreateCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendCode: (code: string, language: string, title: string) => void;
}

export const CreateCodeModal: React.FC<CreateCodeModalProps> = ({
  isOpen,
  onClose,
  onSendCode,
}) => {
  const [code, setCode] = useState(`async function syncDatabase(): Promise<void> {\n  console.log('[ACK] Establishing zero-trust WebSocket link...');\n  const conn = await db.connect();\n  await conn.execute('PRAGMA synchronous = NORMAL;');\n}`);
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
    <div className="modal-backdrop" onClick={onClose} id="create-code-backdrop">
      <div className="modal-window" onClick={(e) => e.stopPropagation()} id="create-code-modal">
        <div className="modal-header">
          <div className="modal-title">
            <Code size={18} color="#00FF66" />
            <span>Share Code Snippet</span>
          </div>
          <button className="icon-btn" onClick={onClose} id="btn-close-code-modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: '12px' }}>
              <div className="form-field">
                <label className="form-label">Snippet Title / Description</label>
                <input
                  type="text"
                  className="form-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Auth middleware, Zero-copy buffer"
                  id="input-code-title"
                />
              </div>

              <div className="form-field">
                <label className="form-label">Language</label>
                <select
                  className="form-select"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  id="select-code-lang"
                >
                  <option value="typescript">TypeScript</option>
                  <option value="javascript">JavaScript</option>
                  <option value="rust">Rust</option>
                  <option value="python">Python</option>
                  <option value="go">Go</option>
                  <option value="sql">SQL</option>
                  <option value="bash">Bash / Shell</option>
                  <option value="json">JSON</option>
                </select>
              </div>
            </div>

            <div className="form-field">
              <label className="form-label">Code Content</label>
              <textarea
                className="form-textarea"
                rows={8}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste code snippet here..."
                id="input-code-content"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose} id="btn-cancel-code">
              Cancel
            </button>
            <button
              type="submit"
              className="primary-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              id="btn-send-code"
            >
              <Send size={14} /> Send Code Snippet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

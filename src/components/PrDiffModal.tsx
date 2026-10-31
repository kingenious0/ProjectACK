import React, { useState } from 'react';
import { GitPullRequest, X, Check, MessageSquare, Send } from 'lucide-react';
import { DiffFile } from '../web-db/store';

interface PrDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  prNumber?: number;
  prTitle?: string;
  prBranch?: string;
  diffFiles?: DiffFile[];
  onCommentSubmit?: (comment: string, filename: string, lineNo?: number) => void;
}

export const PrDiffModal: React.FC<PrDiffModalProps> = ({
  isOpen,
  onClose,
  prNumber = 142,
  prTitle = 'net: Introduce Zero-Copy Socket Ring Buffer',
  prBranch = 'feat/ring-buffer-v2',
  diffFiles = [],
  onCommentSubmit,
}) => {
  const [selectedLine, setSelectedLine] = useState<{ file: string; lineNo?: number; content: string } | null>(null);
  const [commentText, setCommentText] = useState('');
  const [submittedComment, setSubmittedComment] = useState(false);

  if (!isOpen) return null;

  const handleLineClick = (file: string, lineNo?: number, content?: string) => {
    setSelectedLine({ file, lineNo, content: content || '' });
    setCommentText('');
    setSubmittedComment(false);
  };

  const handleSendComment = () => {
    if (!commentText.trim() || !selectedLine) return;
    const formatted = `💬 Line Review on \`${selectedLine.file}${selectedLine.lineNo ? `:${selectedLine.lineNo}` : ''}\`:\n> "${selectedLine.content.trim()}"\n\n${commentText}`;
    if (onCommentSubmit) {
      onCommentSubmit(formatted, selectedLine.file, selectedLine.lineNo);
    }
    setSubmittedComment(true);
    setTimeout(() => {
      setSelectedLine(null);
      setCommentText('');
      setSubmittedComment(false);
    }, 1200);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} id="pr-diff-modal-backdrop">
      <div
        className="modal-window"
        style={{ maxWidth: '850px' }}
        onClick={(e) => e.stopPropagation()}
        id="pr-diff-modal"
      >
        <div className="modal-header">
          <div className="modal-title">
            <GitPullRequest size={18} color="#A371F7" />
            <span>PR #{prNumber}: {prTitle}</span>
            <span className="repo-badge" style={{ marginLeft: 8 }}>
              {prBranch}
            </span>
          </div>
          <button className="icon-btn" onClick={onClose} id="btn-close-diff">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: 0 }}>
          {diffFiles.map((file, fIdx) => (
            <div key={fIdx} style={{ borderBottom: '1px solid #2A3942' }}>
              <div
                style={{
                  padding: '8px 16px',
                  background: '#161F26',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #2A3942',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12.5px',
                }}
              >
                <span style={{ color: '#E9EDEF', fontWeight: 600 }}>{file.filename}</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span className="diff-add">+{file.additions}</span>
                  <span className="diff-del">-{file.deletions}</span>
                </div>
              </div>

              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  lineHeight: '1.6',
                  background: '#090D10',
                }}
              >
                {file.lines.map((line, lIdx) => {
                  const isAdd = line.type === 'add';
                  const isDel = line.type === 'del';
                  const bg = isAdd ? 'rgba(0, 255, 102, 0.12)' : isDel ? 'rgba(241, 92, 109, 0.12)' : 'transparent';
                  const textColor = isAdd ? '#7EE787' : isDel ? '#FF7B72' : '#C9D1D9';

                  return (
                    <div
                      key={lIdx}
                      onClick={() => handleLineClick(file.filename, line.newNo || line.oldNo, line.content)}
                      style={{
                        display: 'flex',
                        background: bg,
                        padding: '2px 12px',
                        cursor: 'pointer',
                        borderLeft: isAdd ? '3px solid #00FF66' : isDel ? '3px solid #F15C6D' : '3px solid transparent',
                      }}
                      className="diff-line-row"
                      title="Click line to leave an inline review comment"
                    >
                      <span style={{ width: '40px', color: '#667781', userSelect: 'none', textAlign: 'right', paddingRight: '10px' }}>
                        {line.oldNo || ''}
                      </span>
                      <span style={{ width: '40px', color: '#667781', userSelect: 'none', textAlign: 'right', paddingRight: '12px' }}>
                        {line.newNo || ''}
                      </span>
                      <span style={{ color: textColor, whiteSpace: 'pre-wrap', flex: 1 }}>
                        {line.content}
                      </span>
                      <span style={{ opacity: 0.3, color: '#8696A0' }}>
                        <MessageSquare size={12} />
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Inline Comment Form on selected line */}
          {selectedLine && (
            <div
              style={{
                margin: '16px',
                padding: '14px',
                background: '#1A232A',
                border: '1px solid #00A884',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-md)',
              }}
              id="inline-comment-box"
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: '12px', color: '#00FF66', fontFamily: 'var(--font-mono)' }}>
                  Reviewing Line {selectedLine.lineNo} ({selectedLine.file}):
                </span>
                <button
                  onClick={() => setSelectedLine(null)}
                  style={{ background: 'transparent', border: 'none', color: '#8696A0', cursor: 'pointer' }}
                >
                  <X size={14} />
                </button>
              </div>

              <div
                style={{
                  fontSize: '11.5px',
                  fontFamily: 'var(--font-mono)',
                  background: '#0D1117',
                  padding: '6px 10px',
                  borderRadius: '4px',
                  color: '#8B949E',
                  marginBottom: '10px',
                }}
              >
                {selectedLine.content}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Add your review feedback or suggestion..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                  style={{
                    flex: 1,
                    background: '#0B141A',
                    border: '1px solid #2A3942',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    color: '#FFF',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                  id="input-inline-review"
                />
                <button
                  className="primary-btn"
                  onClick={handleSendComment}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  id="btn-submit-inline-review"
                >
                  {submittedComment ? (
                    <>
                      <Check size={14} /> Sent to Chat!
                    </>
                  ) : (
                    <>
                      <Send size={14} /> Post Comment
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <span style={{ marginRight: 'auto', fontSize: '11px', color: '#8696A0', fontFamily: 'var(--font-mono)' }}>
            💡 Tip: Click any git diff line to leave an inline review comment in the chat.
          </span>
          <button className="primary-btn" onClick={onClose} id="btn-done-review">
            Done Reviewing
          </button>
        </div>
      </div>
    </div>
  );
};

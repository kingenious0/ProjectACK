import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  GitPullRequest,
  CheckCircle2,
  FileCode,
  Terminal,
  ExternalLink,
  Send,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { DiffFile } from '../../web-db/store';

export interface CodeReviewPayload {
  title: string;
  codeSnippet?: string;
  language?: string;
  prNumber?: number;
  prBranch?: string;
  diffFiles?: DiffFile[];
  repoName?: string;
}

interface CodeReviewDrawerProps {
  payload: CodeReviewPayload | null;
  isOpen: boolean;
  onClose: () => void;
  onSendReviewComment?: (comment: string) => void;
  isMobile?: boolean;
}

export const CodeReviewDrawer: React.FC<CodeReviewDrawerProps> = ({
  payload,
  isOpen,
  onClose,
  onSendReviewComment,
  isMobile = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [commentText, setCommentText] = useState('');

  if (!isOpen || !payload) return null;

  const handleCopy = () => {
    const textToCopy = payload.codeSnippet || (payload.diffFiles ? JSON.stringify(payload.diffFiles, null, 2) : '');
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !onSendReviewComment) return;
    onSendReviewComment(`[Review Note on ${payload.title}]: ${commentText.trim()}`);
    setCommentText('');
  };

  return (
    <aside
      className={`wa-code-review-drawer ${isMobile ? 'wa-code-review-mobile-sheet' : 'wa-code-review-desktop-split'} ${
        isExpanded ? 'wa-review-expanded' : ''
      }`}
      id="code-review-split-panel"
      style={{
        background: 'var(--wa-bg-sidebar)',
        borderLeft: isMobile ? 'none' : '1px solid var(--wa-border-subtle)',
        borderTop: isMobile ? '2px solid var(--wa-accent-green)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 40,
        boxShadow: isMobile ? '0 -8px 24px rgba(0,0,0,0.6)' : 'none',
      }}
    >
      {/* Mobile Drag Indicator Handle */}
      {isMobile && (
        <div
          style={{
            width: '100%',
            height: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--wa-bg-header)',
            cursor: 'grab',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '4px',
              borderRadius: '2px',
              background: 'rgba(255, 255, 255, 0.25)',
            }}
          />
        </div>
      )}

      {/* Top Header Bar */}
      <div
        style={{
          height: '52px',
          background: 'var(--wa-bg-header)',
          padding: '0 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--wa-border-subtle)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          {payload.prNumber ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: 'var(--wa-accent-green)',
                background: 'rgba(0, 255, 204, 0.12)',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              <GitPullRequest size={14} />
              <span>PR #{payload.prNumber}</span>
            </span>
          ) : (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: 'var(--wa-ticks-blue)',
                background: 'rgba(0, 229, 255, 0.12)',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              <Terminal size={14} />
              <span>{(payload.language || 'CODE').toUpperCase()}</span>
            </span>
          )}

          <span
            style={{
              color: 'var(--wa-text-primary)',
              fontSize: '13px',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontFamily: 'JetBrains Mono, monospace',
            }}
            title={payload.title}
          >
            {payload.title}
          </span>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <button
            type="button"
            onClick={handleCopy}
            title="Copy snippet"
            style={{
              background: 'transparent',
              border: 'none',
              color: copied ? 'var(--wa-accent-green)' : 'var(--wa-text-secondary)',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
            }}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>

          {!isMobile && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? 'Collapse split width' : 'Expand split width'}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--wa-text-secondary)',
                cursor: 'pointer',
                padding: '6px',
              }}
            >
              {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            title="Close code panel"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--wa-text-secondary)',
              cursor: 'pointer',
              padding: '6px',
            }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Branch & Status Meta Subheader */}
      <div
        style={{
          padding: '6px 14px',
          background: 'rgba(9, 13, 22, 0.8)',
          borderBottom: '1px solid var(--wa-border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '11px',
          color: 'var(--wa-text-secondary)',
          fontFamily: 'JetBrains Mono, monospace',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {payload.prBranch && (
            <span style={{ color: 'var(--wa-ticks-blue)' }}>branch: {payload.prBranch}</span>
          )}
          {payload.repoName && <span>repo: {payload.repoName}</span>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--wa-accent-green)' }}>
          <CheckCircle2 size={13} />
          <span>CI Build Passing</span>
        </div>
      </div>

      {/* Code Body / Diff Viewer */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'auto',
          padding: '12px',
          background: 'var(--wa-bg-deep)',
          fontFamily: 'JetBrains Mono, Menlo, Consolas, monospace',
          fontSize: '12.5px',
          lineHeight: '1.6',
        }}
      >
        {payload.diffFiles && payload.diffFiles.length > 0 ? (
          <div>
            {payload.diffFiles.map((file, fileIdx) => (
              <div
                key={fileIdx}
                style={{
                  marginBottom: '16px',
                  borderRadius: '6px',
                  border: '1px solid var(--wa-border-subtle)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    padding: '6px 10px',
                    background: 'var(--wa-bg-header)',
                    borderBottom: '1px solid var(--wa-border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '11.5px',
                    color: 'var(--wa-text-primary)',
                  }}
                >
                  <span>{file.filename}</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ color: 'var(--wa-accent-green)' }}>+{file.additions}</span>
                    <span style={{ color: '#F85149' }}>-{file.deletions}</span>
                  </div>
                </div>

                <div style={{ padding: '4px 0' }}>
                  {file.lines.map((line, lineIdx) => {
                    let lineBg = 'transparent';
                    let linePrefix = ' ';
                    let textColor = 'var(--wa-text-primary)';

                    if (line.type === 'add') {
                      lineBg = 'rgba(0, 255, 204, 0.12)';
                      linePrefix = '+';
                      textColor = 'var(--wa-accent-green)';
                    } else if (line.type === 'del') {
                      lineBg = 'rgba(248, 81, 73, 0.15)';
                      linePrefix = '-';
                      textColor = '#FFA198';
                    }

                    return (
                      <div
                        key={lineIdx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '1px 8px',
                          background: lineBg,
                          whiteSpace: 'pre',
                        }}
                      >
                        <span
                          style={{
                            width: '28px',
                            color: 'rgba(255, 255, 255, 0.25)',
                            fontSize: '11px',
                            userSelect: 'none',
                            textAlign: 'right',
                            marginRight: '12px',
                          }}
                        >
                          {line.newNo || line.oldNo || ''}
                        </span>
                        <span
                          style={{
                            width: '12px',
                            color: textColor,
                            userSelect: 'none',
                            fontWeight: 700,
                          }}
                        >
                          {linePrefix}
                        </span>
                        <span style={{ color: textColor }}>{line.content}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <pre
            style={{
              margin: 0,
              color: 'var(--wa-text-primary)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            <code>{payload.codeSnippet}</code>
          </pre>
        )}
      </div>

      {/* Review Quick Action Bar */}
      {onSendReviewComment && (
        <form
          onSubmit={handleSubmitComment}
          style={{
            padding: '8px 12px',
            background: 'var(--wa-bg-header)',
            borderTop: '1px solid var(--wa-border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <input
            type="text"
            placeholder="Send inline review feedback..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            style={{
              flex: 1,
              height: '34px',
              background: 'var(--wa-bg-input)',
              border: '1px solid var(--wa-border-subtle)',
              borderRadius: '6px',
              padding: '0 10px',
              color: 'var(--wa-text-primary)',
              fontSize: '12.5px',
              outline: 'none',
              fontFamily: 'Inter, sans-serif',
            }}
          />
          <button
            type="submit"
            disabled={!commentText.trim()}
            style={{
              height: '34px',
              padding: '0 12px',
              background: commentText.trim() ? 'var(--wa-accent-green)' : 'rgba(255, 255, 255, 0.08)',
              color: commentText.trim() ? 'var(--wa-bg-deep)' : 'var(--wa-text-secondary)',
              border: 'none',
              borderRadius: '6px',
              cursor: commentText.trim() ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            <Send size={14} />
            <span>Post</span>
          </button>
        </form>
      )}
    </aside>
  );
};

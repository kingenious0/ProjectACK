import React, { useState } from 'react';
import {
  ChevronLeft,
  Check,
  Send,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { DiffFile, ReviewComment } from '../../web-db/store';

export interface CodeReviewPayload {
  title: string;
  codeSnippet?: string;
  language?: string;
  prNumber?: number;
  prBranch?: string;
  diffFiles?: DiffFile[];
  repoName?: string;
  ciStatus?: string;
  additions?: number;
  deletions?: number;
  filesChanged?: number;
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
  // Local state for interactive inline replies
  const [activeReplyLineIndex, setActiveReplyLineIndex] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [localReplies, setLocalReplies] = useState<Record<string, ReviewComment[]>>({});
  const [reviewStatus, setReviewStatus] = useState<'pending' | 'approved' | 'changes_requested'>('pending');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen || !payload) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleApprove = () => {
    setReviewStatus('approved');
    showToast('Pull request approved! ✅');
    if (onSendReviewComment) {
      onSendReviewComment(`Approved PR #${payload.prNumber || 28}: "${payload.title}"`);
    }
  };

  const handleRequestChanges = () => {
    setReviewStatus('changes_requested');
    showToast('Changes requested 📝');
    if (onSendReviewComment) {
      onSendReviewComment(`Requested changes on PR #${payload.prNumber || 28}: "${payload.title}"`);
    }
  };

  const handlePostReply = (lineKey: string) => {
    if (!replyText.trim()) return;
    const newComment: ReviewComment = {
      id: `reply_${Date.now()}`,
      authorName: 'You',
      timestamp: 'Just now',
      content: replyText.trim(),
    };

    setLocalReplies((prev) => ({
      ...prev,
      [lineKey]: [...(prev[lineKey] || []), newComment],
    }));

    if (onSendReviewComment) {
      onSendReviewComment(`[PR #${payload.prNumber || 28} Comment]: ${replyText.trim()}`);
    }

    setReplyText('');
    setActiveReplyLineIndex(null);
    showToast('Comment posted');
  };

  const prNumber = payload.prNumber || 28;
  const repoName = payload.repoName || 'kingenious0/ACK';
  const prTitle = payload.title || 'Dev control center: mobile-first layout architecture';
  const totalFiles = payload.filesChanged || (payload.diffFiles ? payload.diffFiles.length : 3);
  const additions = payload.additions || 340;
  const deletions = payload.deletions || 48;

  return (
    <aside
      className={`ack-code-review-drawer ${isMobile ? 'ack-code-review-mobile-sheet' : 'ack-code-review-desktop-split'}`}
      id="code-review-split-panel"
      role="region"
      aria-label="Code Review Diff Panel"
      style={{
        position: isMobile ? 'fixed' : 'relative',
        inset: isMobile ? 0 : undefined,
        width: isMobile ? '100%' : '520px',
        height: '100%',
        background: 'var(--ack-bg, #0B0B0D)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        overflow: 'hidden',
        boxSizing: 'border-box',
        animation: 'ackFadeIn 160ms ease',
      }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'absolute',
            top: '72px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--ack-surface-2, #17171B)',
            border: '1px solid var(--ack-accent, #8B7CFF)',
            color: 'var(--ack-text, #ECECEF)',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: 600,
            zIndex: 110,
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
            animation: 'ackFadeIn 150ms ease',
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* Top Navigation Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          paddingTop: 'calc(env(safe-area-inset-top, 12px) + 6px)',
          borderBottom: '1px solid var(--ack-divider, #1C1C21)',
          background: 'var(--ack-bg, #0B0B0D)',
          flexShrink: 0,
        }}
      >
        {/* Back Chevron + PR #28 & Repo Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <button
            type="button"
            onClick={onClose}
            id="btn-back-diff-review"
            aria-label="Back to chat"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--ack-text, #ECECEF)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              marginLeft: '-8px',
              borderRadius: '50%',
            }}
          >
            <ChevronLeft size={24} strokeWidth={2} />
          </button>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'var(--ack-accent, #8B7CFF)',
                }}
              >
                PR #{prNumber}
              </span>
            </div>
            <span
              style={{
                fontSize: '12.5px',
                color: 'var(--ack-muted, #9A9AA3)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {repoName}
            </span>
          </div>
        </div>

        {/* Right CI Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(74, 222, 128, 0.1)',
            border: '1px solid rgba(74, 222, 128, 0.25)',
            borderRadius: '20px',
            padding: '4px 10px',
            color: 'var(--ack-success, #4ADE80)',
            fontSize: '12px',
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'var(--ack-success, #4ADE80)',
            }}
          />
          <span>CI passing</span>
        </div>
      </div>

      {/* Main Scrollable Diff Content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          paddingBottom: '24px',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Title & Metadata Section */}
        <div style={{ padding: '18px 16px 14px 16px' }}>
          <h1
            style={{
              fontSize: '19px',
              fontWeight: 700,
              lineHeight: 1.35,
              color: 'var(--ack-text, #ECECEF)',
              margin: '0 0 8px 0',
            }}
          >
            {prTitle}
          </h1>
          <div
            style={{
              fontSize: '13px',
              color: 'var(--ack-muted, #9A9AA3)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>{totalFiles} files changed</span>
            <span>·</span>
            <span style={{ color: 'var(--ack-success, #4ADE80)', fontWeight: 600 }}>+{additions}</span>
            <span style={{ color: 'var(--ack-danger, #F87171)', fontWeight: 600 }}>-{deletions}</span>
          </div>
        </div>

        {/* Diff Files List */}
        {payload.diffFiles && payload.diffFiles.length > 0 ? (
          <div>
            {payload.diffFiles.map((file, fileIdx) => (
              <div
                key={file.filename}
                style={{
                  marginBottom: '20px',
                  borderTop: '1px solid var(--ack-divider, #1C1C21)',
                }}
              >
                {/* File Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 16px',
                    background: 'var(--ack-bg, #0B0B0D)',
                    borderBottom: '1px solid var(--ack-border, #26262B)',
                    fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
                    fontSize: '13px',
                    fontWeight: 700,
                  }}
                >
                  <span style={{ color: 'var(--ack-text, #ECECEF)' }}>{file.filename}</span>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
                    <span style={{ color: 'var(--ack-success, #4ADE80)' }}>+{file.additions}</span>
                    <span style={{ color: file.deletions > 0 ? 'var(--ack-danger, #F87171)' : 'var(--ack-muted, #9A9AA3)' }}>
                      -{file.deletions}
                    </span>
                  </div>
                </div>

                {/* Diff Lines Table */}
                <div
                  style={{
                    fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
                    fontSize: '13px',
                    lineHeight: 1.7,
                  }}
                >
                  {file.lines.map((line, lIdx) => {
                    const lineKey = `${file.filename}_${lIdx}`;
                    const isAdd = line.type === 'add';
                    const isDel = line.type === 'del';
                    const lineNumber = line.newNo ?? line.oldNo ?? (lIdx + 1);
                    const lineComments = [...(line.comments || []), ...(localReplies[lineKey] || [])];
                    const isReplyOpen = activeReplyLineIndex === lIdx;

                    return (
                      <React.Fragment key={lIdx}>
                        {/* Line Row */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            padding: '1px 16px',
                            background: isAdd
                              ? 'rgba(74, 222, 128, 0.08)'
                              : isDel
                              ? 'rgba(248, 113, 113, 0.08)'
                              : 'transparent',
                            color: isAdd
                              ? 'var(--ack-success, #4ADE80)'
                              : isDel
                              ? 'var(--ack-danger, #F87171)'
                              : 'var(--ack-text, #ECECEF)',
                          }}
                        >
                          {/* Line Number */}
                          <span
                            style={{
                              width: '28px',
                              color: 'var(--ack-muted, #9A9AA3)',
                              userSelect: 'none',
                              textAlign: 'left',
                              paddingRight: '12px',
                              flexShrink: 0,
                              opacity: 0.7,
                            }}
                          >
                            {lineNumber}
                          </span>

                          {/* Code Content */}
                          <span
                            style={{
                              whiteSpace: 'pre',
                              flex: 1,
                              overflowX: 'auto',
                            }}
                          >
                            {line.content}
                          </span>
                        </div>

                        {/* Inline Comments Thread (Rendered directly under the line) */}
                        {lineComments.length > 0 && (
                          <div
                            style={{
                              margin: '10px 16px',
                              background: 'var(--ack-surface, #131316)',
                              border: '1px solid var(--ack-border, #26262B)',
                              borderRadius: '14px',
                              padding: '14px',
                              boxSizing: 'border-box',
                            }}
                          >
                            {lineComments.map((comm) => (
                              <div key={comm.id} style={{ marginBottom: '10px' }}>
                                {/* Author Row */}
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginBottom: '6px',
                                  }}
                                >
                                  <div
                                    style={{
                                      width: '28px',
                                      height: '28px',
                                      borderRadius: '50%',
                                      background: 'var(--ack-avatar-bg, #1A1A1F)',
                                      border: '1px solid var(--ack-border, #26262B)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '11px',
                                      fontWeight: 700,
                                      color: 'var(--ack-text, #ECECEF)',
                                      flexShrink: 0,
                                    }}
                                  >
                                    {comm.authorName
                                      .split(' ')
                                      .map((n) => n[0])
                                      .join('')
                                      .toUpperCase()
                                      .slice(0, 2)}
                                  </div>
                                  <span
                                    style={{
                                      fontSize: '14px',
                                      fontWeight: 700,
                                      color: 'var(--ack-text, #ECECEF)',
                                    }}
                                  >
                                    {comm.authorName}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: '12px',
                                      color: 'var(--ack-muted, #9A9AA3)',
                                    }}
                                  >
                                    {comm.timestamp}
                                  </span>
                                </div>

                                {/* Comment Content */}
                                <div
                                  style={{
                                    fontSize: '13.5px',
                                    lineHeight: 1.45,
                                    color: 'var(--ack-text, #ECECEF)',
                                    margin: '0 0 8px 0',
                                    fontFamily: 'system-ui, -apple-system, sans-serif',
                                  }}
                                >
                                  {comm.content}
                                </div>
                              </div>
                            ))}

                            {/* Reply Action */}
                            {!isReplyOpen ? (
                              <button
                                type="button"
                                onClick={() => setActiveReplyLineIndex(lIdx)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: 'var(--ack-accent, #8B7CFF)',
                                  fontSize: '13px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  padding: 0,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <span>Reply</span>
                              </button>
                            ) : (
                              <div style={{ marginTop: '10px' }}>
                                <input
                                  type="text"
                                  autoFocus
                                  placeholder="Write a reply..."
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handlePostReply(lineKey);
                                  }}
                                  style={{
                                    width: '100%',
                                    height: '36px',
                                    background: 'var(--ack-surface-2, #17171B)',
                                    border: '1px solid var(--ack-border, #26262B)',
                                    borderRadius: '10px',
                                    padding: '0 12px',
                                    color: 'var(--ack-text, #ECECEF)',
                                    fontSize: '13px',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    marginBottom: '8px',
                                    fontFamily: 'system-ui, sans-serif',
                                  }}
                                />
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveReplyLineIndex(null);
                                      setReplyText('');
                                    }}
                                    style={{
                                      background: 'transparent',
                                      border: 'none',
                                      color: 'var(--ack-muted, #9A9AA3)',
                                      fontSize: '12px',
                                      cursor: 'pointer',
                                      padding: '4px 8px',
                                    }}
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handlePostReply(lineKey)}
                                    style={{
                                      background: 'var(--ack-accent, #8B7CFF)',
                                      border: 'none',
                                      borderRadius: '8px',
                                      color: '#0B0B0D',
                                      fontSize: '12px',
                                      fontWeight: 700,
                                      padding: '6px 14px',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    Send
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '16px' }}>
            <pre
              style={{
                background: 'var(--ack-surface, #131316)',
                borderRadius: '12px',
                padding: '14px',
                border: '1px solid var(--ack-border, #26262B)',
                color: 'var(--ack-text, #ECECEF)',
                fontSize: '12.5px',
                fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
                overflowX: 'auto',
              }}
            >
              <code>{(payload.codeSnippet || '').trim()}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Sticky Bottom Action Bar */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          padding: '12px 16px',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + 12px)',
          background: 'var(--ack-bg, #0B0B0D)',
          borderTop: '1px solid var(--ack-divider, #1C1C21)',
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={handleRequestChanges}
          id="btn-request-changes"
          style={{
            flex: 1,
            height: '48px',
            background: 'transparent',
            border: '1px solid var(--ack-border, #26262B)',
            borderRadius: '14px',
            color: reviewStatus === 'changes_requested' ? 'var(--ack-warning, #F5B544)' : 'var(--ack-text, #ECECEF)',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'background 120ms ease',
          }}
        >
          {reviewStatus === 'changes_requested' ? 'Changes requested' : 'Request changes'}
        </button>

        <button
          type="button"
          onClick={handleApprove}
          id="btn-approve-pr"
          style={{
            flex: 1,
            height: '48px',
            background: 'var(--ack-accent, #8B7CFF)',
            border: 'none',
            borderRadius: '14px',
            color: '#0B0B0D',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 12px rgba(139, 124, 255, 0.28)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'transform 80ms ease, opacity 120ms ease',
          }}
        >
          {reviewStatus === 'approved' ? (
            <>
              <Check size={18} strokeWidth={2.4} />
              <span>Approved</span>
            </>
          ) : (
            <span>Approve</span>
          )}
        </button>
      </div>
    </aside>
  );
};

export default CodeReviewDrawer;

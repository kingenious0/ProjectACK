import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  Check,
  Send,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Lock,
  Clock,
  WifiOff,
  FileCode,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { DiffFile, ReviewComment } from '../../web-db/store';
import {
  githubService,
  parseRepoSlug,
  GitHubDiffFile,
  GitHubApiState,
} from '../../services/githubService';

export interface CodeReviewPayload {
  title: string;
  codeSnippet?: string;
  language?: string;
  prNumber?: number;
  prBranch?: string;
  diffFiles?: DiffFile[];
  repoName?: string;
  owner?: string;
  repo?: string;
  ciStatus?: string;
  additions?: number;
  deletions?: number;
  filesChanged?: number;
  isSampleData?: boolean;
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

  // Live GitHub Diff Fetch State
  const [apiState, setApiState] = useState<GitHubApiState>('idle');
  const [liveFiles, setLiveFiles] = useState<GitHubDiffFile[]>([]);
  const [liveAdditions, setLiveAdditions] = useState<number | undefined>();
  const [liveDeletions, setLiveDeletions] = useState<number | undefined>();
  const [liveFilesCount, setLiveFilesCount] = useState<number | undefined>();
  const [rateLimitReset, setRateLimitReset] = useState<string | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  // Fetch live diffs on demand when payload changes
  useEffect(() => {
    if (!isOpen || !payload) {
      setApiState('idle');
      return;
    }

    // If diffFiles are already provided explicitly and not fetching from GitHub
    if (payload.diffFiles && payload.diffFiles.length > 0) {
      setLiveFiles(payload.diffFiles as GitHubDiffFile[]);
      setApiState('success');
      return;
    }

    // If we have repo & PR number, fetch real live diff from GitHub API
    const repoIdentifier = payload.repoName || (payload.owner && payload.repo ? `${payload.owner}/${payload.repo}` : null);
    const parsed = parseRepoSlug(repoIdentifier);

    if (parsed && payload.prNumber) {
      setApiState('loading');
      setErrorMessage(undefined);

      githubService
        .fetchPullRequestDiff(parsed.owner, parsed.repo, payload.prNumber)
        .then((res) => {
          setApiState(res.state);
          if (res.state === 'success') {
            setLiveFiles(res.files || []);
            setLiveAdditions(res.totalAdditions);
            setLiveDeletions(res.totalDeletions);
            setLiveFilesCount(res.totalFiles);
          } else {
            setRateLimitReset(res.rateLimitReset);
            setErrorMessage(res.errorMessage);
          }
        })
        .catch((err) => {
          setApiState('error');
          setErrorMessage(err?.message || 'Failed to fetch pull request diff');
        });
    } else {
      // Standalone code snippet mode
      setApiState('success');
    }
  }, [isOpen, payload]);

  if (!isOpen || !payload) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleApprove = () => {
    setReviewStatus('approved');
    showToast('Pull request approved! ✅');
    if (onSendReviewComment) {
      onSendReviewComment(`Approved PR #${payload.prNumber || ''}: "${payload.title}" (Ack review)`);
    }
  };

  const handleRequestChanges = () => {
    setReviewStatus('changes_requested');
    showToast('Changes requested 📝');
    if (onSendReviewComment) {
      onSendReviewComment(`Requested changes on PR #${payload.prNumber || ''}: "${payload.title}" (Ack review)`);
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
      onSendReviewComment(`[PR #${payload.prNumber || ''} Ack Comment]: ${replyText.trim()}`);
    }

    setReplyText('');
    setActiveReplyLineIndex(null);
    showToast('Comment saved (Ack only)');
  };

  const prNumber = payload.prNumber;
  const repoName = payload.repoName || (payload.owner && payload.repo ? `${payload.owner}/${payload.repo}` : 'Repository');
  const prTitle = payload.title || 'Code Review';
  const displayFiles: GitHubDiffFile[] = liveFiles.length > 0 ? liveFiles : ((payload.diffFiles || []) as GitHubDiffFile[]);
  const totalFiles = liveFilesCount ?? payload.filesChanged ?? (displayFiles.length > 0 ? displayFiles.length : 1);
  const additions = liveAdditions ?? payload.additions ?? displayFiles.reduce((s, f) => s + (f.additions || 0), 0);
  const deletions = liveDeletions ?? payload.deletions ?? displayFiles.reduce((s, f) => s + (f.deletions || 0), 0);
  const isSample = payload.isSampleData === true;
  const parsedRepo = parseRepoSlug(repoName);
  const ghPrUrl = parsedRepo && prNumber ? `https://github.com/${parsedRepo.owner}/${parsedRepo.repo}/pull/${prNumber}` : null;

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

          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {prNumber ? (
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
              ) : (
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: 'var(--ack-text, #ECECEF)',
                  }}
                >
                  Code Review
                </span>
              )}

              {/* Sample Data Badge */}
              {isSample && (
                <span
                  style={{
                    fontSize: '11px',
                    background: 'rgba(234, 179, 8, 0.15)',
                    border: '1px solid rgba(234, 179, 8, 0.4)',
                    color: '#FACC15',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
                  Sample data
                </span>
              )}
            </div>

            <span
              style={{
                fontSize: '12px',
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

        {ghPrUrl && (
          <a
            href={ghPrUrl}
            target="_blank"
            rel="noreferrer"
            title="Open on GitHub"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              color: 'var(--ack-muted, #9A9AA3)',
              textDecoration: 'none',
              padding: '6px 10px',
              borderRadius: '8px',
              background: 'var(--ack-surface, #131316)',
              border: '1px solid var(--ack-border, #26262B)',
              fontWeight: 600,
            }}
          >
            <span>GitHub</span>
            <ExternalLink size={12} />
          </a>
        )}
      </div>

      {/* Main Diff Content Container */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* PR Title & Statistics Header */}
        <div
          style={{
            padding: '16px',
            borderBottom: '1px solid var(--ack-divider, #1C1C21)',
          }}
        >
          <h1
            style={{
              fontSize: '18px',
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

        {/* LOADING SKELETON */}
        {apiState === 'loading' && (
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[1, 2].map((i) => (
              <div
                key={i}
                style={{
                  background: 'var(--ack-surface-2, #17171B)',
                  borderRadius: '12px',
                  border: '1px solid var(--ack-border, #26262B)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '36px',
                    background: 'rgba(255,255,255,0.04)',
                    padding: '8px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <div style={{ width: '40%', height: '12px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px' }} />
                  <div style={{ width: '15%', height: '12px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px' }} />
                </div>
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ width: '90%', height: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }} />
                  <div style={{ width: '75%', height: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }} />
                  <div style={{ width: '85%', height: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* RATE LIMITED STATE */}
        {apiState === 'rate_limited' && (
          <div style={{ padding: '32px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(234, 179, 8, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={24} color="#FACC15" />
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#FACC15' }}>Rate Limit Reached</div>
            <div style={{ fontSize: '13px', color: 'var(--ack-muted, #9A9AA3)', maxWidth: '380px', lineHeight: 1.5 }}>
              GitHub API limit reached. Reset {rateLimitReset || 'in a few minutes'}. Signed-in requests have higher limits.
            </div>
            {ghPrUrl && (
              <a
                href={ghPrUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'var(--ack-surface-2, #17171B)',
                  border: '1px solid var(--ack-border, #26262B)',
                  color: 'var(--ack-accent, #8B7CFF)',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Inspect diff on GitHub <ExternalLink size={14} />
              </a>
            )}
          </div>
        )}

        {/* PRIVATE REPO OR NOT FOUND STATE */}
        {apiState === 'not_found_or_private' && (
          <div style={{ padding: '36px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(139, 124, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lock size={26} color="var(--ack-accent, #8B7CFF)" />
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ack-text, #ECECEF)' }}>
              Private repo: connect access
            </div>
            <div style={{ fontSize: '13px', color: 'var(--ack-muted, #9A9AA3)', maxWidth: '380px', lineHeight: 1.5 }}>
              Ack currently inspects public repositories with your read-only login. Granular private repository permissions via GitHub App will be available soon.
            </div>
            {ghPrUrl && (
              <a
                href={ghPrUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'var(--ack-surface-2, #17171B)',
                  border: '1px solid var(--ack-border, #26262B)',
                  color: 'var(--ack-text, #ECECEF)',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                View on GitHub <ExternalLink size={14} />
              </a>
            )}
          </div>
        )}

        {/* TOKEN REVOKED STATE */}
        {apiState === 'token_revoked' && (
          <div style={{ padding: '32px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle size={32} color="#F87171" />
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#F87171' }}>GitHub Session Expired</div>
            <div style={{ fontSize: '13px', color: 'var(--ack-muted, #9A9AA3)', maxWidth: '340px' }}>
              Your GitHub access token has expired or was revoked. Please sign in with GitHub again.
            </div>
          </div>
        )}

        {/* OFFLINE STATE */}
        {apiState === 'offline' && (
          <div style={{ padding: '32px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <WifiOff size={32} color="var(--ack-muted, #9A9AA3)" />
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ack-text, #ECECEF)' }}>You are offline</div>
            <div style={{ fontSize: '12.5px', color: 'var(--ack-muted, #9A9AA3)' }}>
              Connect to the internet to load live diffs.
            </div>
          </div>
        )}

        {/* SUCCESS STATE: Render Diff Files */}
        {apiState === 'success' && displayFiles.length > 0 && (
          <div>
            {displayFiles.map((file, fileIdx) => {
              const fileKey = file.filename;
              const hasNoPatch = file.hasNoPatch || file.largeOrBinary || !file.lines || file.lines.length === 0;

              return (
                <div
                  key={fileKey}
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
                    <span style={{ color: 'var(--ack-text, #ECECEF)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {file.filename}
                    </span>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '12px', flexShrink: 0 }}>
                      <span style={{ color: 'var(--ack-success, #4ADE80)' }}>+{file.additions}</span>
                      <span style={{ color: file.deletions > 0 ? 'var(--ack-danger, #F87171)' : 'var(--ack-muted, #9A9AA3)' }}>
                        -{file.deletions}
                      </span>
                    </div>
                  </div>

                  {/* LARGE DIFF OR BINARY FILE NOTICE */}
                  {hasNoPatch ? (
                    <div
                      style={{
                        padding: '24px 16px',
                        textAlign: 'center',
                        background: 'rgba(255, 255, 255, 0.02)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <FileCode size={26} color="var(--ack-muted, #9A9AA3)" />
                      <div style={{ fontSize: '13px', color: 'var(--ack-text, #ECECEF)', fontWeight: 600 }}>
                        Large diff or binary file
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--ack-muted, #9A9AA3)', marginBottom: '4px' }}>
                        Diff exceeds GitHub inline size limits or is a binary asset.
                      </div>
                      <a
                        href={file.htmlUrl || (ghPrUrl ? `${ghPrUrl}/files` : '#')}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: 'var(--ack-accent, #8B7CFF)',
                          fontSize: '12.5px',
                          fontWeight: 600,
                          textDecoration: 'none',
                        }}
                      >
                        Large diff, view on GitHub <ExternalLink size={13} />
                      </a>
                    </div>
                  ) : (
                    /* Diff Lines Table */
                    <div
                      style={{
                        fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
                        fontSize: '13px',
                        lineHeight: 1.7,
                      }}
                    >
                      {file.lines?.map((line, lIdx) => {
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
                              <span
                                style={{
                                  width: '28px',
                                  color: 'var(--ack-muted, #9A9AA3)',
                                  userSelect: 'none',
                                  flexShrink: 0,
                                  fontSize: '11px',
                                }}
                              >
                                {lineNumber}
                              </span>

                              <span
                                style={{
                                  width: '18px',
                                  userSelect: 'none',
                                  flexShrink: 0,
                                  color: isAdd
                                    ? 'var(--ack-success, #4ADE80)'
                                    : isDel
                                    ? 'var(--ack-danger, #F87171)'
                                    : 'var(--ack-muted, #9A9AA3)',
                                }}
                              >
                                {isAdd ? '+' : isDel ? '-' : ' '}
                              </span>

                              <span
                                style={{
                                  flex: 1,
                                  whiteSpace: 'pre-wrap',
                                  wordBreak: 'break-all',
                                }}
                              >
                                {line.content}
                              </span>

                              <button
                                type="button"
                                onClick={() => setActiveReplyLineIndex(isReplyOpen ? null : lIdx)}
                                aria-label="Comment on this line"
                                title="Comment on this line (Ack only)"
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: 'var(--ack-muted, #9A9AA3)',
                                  cursor: 'pointer',
                                  padding: '2px 4px',
                                  borderRadius: '4px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  opacity: 0.6,
                                  marginLeft: '4px',
                                }}
                              >
                                <MessageSquare size={13} />
                              </button>
                            </div>

                            {/* Line Comments & Reply Box */}
                            {(lineComments.length > 0 || isReplyOpen) && (
                              <div
                                style={{
                                  background: 'var(--ack-surface, #131316)',
                                  borderLeft: '3px solid var(--ack-accent, #8B7CFF)',
                                  padding: '14px',
                                  boxSizing: 'border-box',
                                }}
                              >
                                {lineComments.map((comm) => (
                                  <div key={comm.id} style={{ marginBottom: '10px' }}>
                                    <div
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        marginBottom: '6px',
                                      }}
                                    >
                                      <span
                                        style={{
                                          fontSize: '13px',
                                          fontWeight: 700,
                                          color: 'var(--ack-text, #ECECEF)',
                                        }}
                                      >
                                        {comm.authorName}
                                      </span>
                                      <span
                                        style={{
                                          fontSize: '10px',
                                          background: 'rgba(139, 124, 255, 0.12)',
                                          color: 'var(--ack-accent, #8B7CFF)',
                                          padding: '2px 6px',
                                          borderRadius: '4px',
                                          fontWeight: 600,
                                        }}
                                      >
                                        Ack comment
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

                                    <div
                                      style={{
                                        fontSize: '13.5px',
                                        lineHeight: 1.45,
                                        color: 'var(--ack-text, #ECECEF)',
                                        margin: '0 0 8px 0',
                                        fontFamily: 'system-ui, sans-serif',
                                      }}
                                    >
                                      {comm.content}
                                    </div>
                                  </div>
                                ))}

                                {/* Reply Input Box with Ack-only Badge */}
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
                                    }}
                                  >
                                    Reply
                                  </button>
                                ) : (
                                  <div style={{ marginTop: '8px' }}>
                                    {/* Clarifying security note */}
                                    <div
                                      style={{
                                        fontSize: '11px',
                                        color: 'var(--ack-muted, #9A9AA3)',
                                        marginBottom: '6px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                      }}
                                    >
                                      <span>🔒 Ack comment, not posted to GitHub</span>
                                    </div>
                                    <input
                                      type="text"
                                      autoFocus
                                      placeholder="Write an Ack comment (not posted to GitHub)..."
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
                                        Post
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
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Code Snippet Fallback */}
        {apiState === 'success' && displayFiles.length === 0 && payload.codeSnippet && (
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
              <code>{payload.codeSnippet.trim()}</code>
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
            height: '46px',
            background: 'transparent',
            border: '1px solid var(--ack-border, #26262B)',
            borderRadius: '12px',
            color: reviewStatus === 'changes_requested' ? 'var(--ack-warning, #F5B544)' : 'var(--ack-text, #ECECEF)',
            fontSize: '13.5px',
            fontWeight: 700,
            cursor: 'pointer',
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
            height: '46px',
            background: 'var(--ack-accent, #8B7CFF)',
            border: 'none',
            borderRadius: '12px',
            color: '#0B0B0D',
            fontSize: '13.5px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
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

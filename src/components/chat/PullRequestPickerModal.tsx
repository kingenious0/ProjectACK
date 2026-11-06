import React, { useState, useEffect } from 'react';
import {
  X,
  GitPullRequest,
  ExternalLink,
  Share2,
  Eye,
  AlertTriangle,
  Lock,
  WifiOff,
  RefreshCw,
  Clock,
  ChevronRight,
} from 'lucide-react';
import {
  githubService,
  parseRepoSlug,
  GitHubPullRequest,
  GitHubApiState,
} from '../../services/githubService';

interface PullRequestPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  repoInput: string;
  onSelectPrReview: (pr: GitHubPullRequest, owner: string, repo: string) => void;
  onSharePrCard: (pr: GitHubPullRequest, owner: string, repo: string) => void;
}

export const PullRequestPickerModal: React.FC<PullRequestPickerModalProps> = ({
  isOpen,
  onClose,
  repoInput,
  onSelectPrReview,
  onSharePrCard,
}) => {
  const [loading, setLoading] = useState(false);
  const [apiState, setApiState] = useState<GitHubApiState>('idle');
  const [prs, setPrs] = useState<GitHubPullRequest[]>([]);
  const [rateLimitReset, setRateLimitReset] = useState<string | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [filterState, setFilterState] = useState<'open' | 'closed' | 'all'>('open');

  const parsed = parseRepoSlug(repoInput);

  const loadPrs = async () => {
    if (!parsed) {
      setApiState('error');
      setErrorMessage('Invalid repository format. Please use owner/repo.');
      return;
    }

    setLoading(true);
    setApiState('loading');

    const res = await githubService.fetchPullRequests(parsed.owner, parsed.repo, filterState);
    setApiState(res.state);
    setPrs(res.prs);
    setRateLimitReset(res.rateLimitReset);
    setErrorMessage(res.errorMessage);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen && parsed) {
      loadPrs();
    }
  }, [isOpen, repoInput, filterState]);

  if (!isOpen) return null;

  const repoFullName = parsed ? `${parsed.owner}/${parsed.repo}` : repoInput;

  return (
    <div
      className="ack-modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '16px',
        animation: 'ackFadeIn 150ms ease',
      }}
      onClick={onClose}
    >
      <div
        className="ack-modal-card"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '85vh',
          backgroundColor: 'var(--ack-surface, #121216)',
          border: '1px solid var(--ack-border, #26262B)',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
          overflow: 'hidden',
          animation: 'ackScaleUp 150ms ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--ack-divider, #1C1C21)',
            background: 'var(--ack-surface, #121216)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(139, 124, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ack-accent, #8B7CFF)',
              }}
            >
              <GitPullRequest size={20} />
            </div>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: 700,
                  color: 'var(--ack-text, #ECECEF)',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Pull Requests
              </h2>
              <span
                style={{
                  fontSize: '12.5px',
                  color: 'var(--ack-muted, #9A9AA3)',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                {repoFullName}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={loadPrs}
              title="Refresh pull requests"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--ack-muted, #9A9AA3)',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              type="button"
              onClick={onClose}
              id="btn-close-pr-picker"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--ack-muted, #9A9AA3)',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Filter Tabs: Open / Closed / All */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            padding: '12px 20px',
            borderBottom: '1px solid var(--ack-divider, #1C1C21)',
            background: 'var(--ack-bg, #0B0B0D)',
          }}
        >
          {(['open', 'closed', 'all'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilterState(tab)}
              style={{
                background: filterState === tab ? 'var(--ack-surface-2, #17171B)' : 'transparent',
                border: filterState === tab ? '1px solid var(--ack-accent, #8B7CFF)' : '1px solid transparent',
                borderRadius: '8px',
                padding: '5px 12px',
                fontSize: '12px',
                fontWeight: 600,
                color: filterState === tab ? 'var(--ack-accent, #8B7CFF)' : 'var(--ack-muted, #9A9AA3)',
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 120ms ease',
              }}
            >
              {tab} PRs
            </button>
          ))}
        </div>

        {/* Content Body with Status Handlers */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {/* Loading Skeleton */}
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    background: 'var(--ack-surface-2, #17171B)',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid var(--ack-border, #26262B)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div
                    style={{
                      height: '14px',
                      width: '60%',
                      background: 'rgba(255,255,255,0.06)',
                      borderRadius: '4px',
                      animation: 'pulse 1.5s infinite',
                    }}
                  />
                  <div
                    style={{
                      height: '12px',
                      width: '40%',
                      background: 'rgba(255,255,255,0.04)',
                      borderRadius: '4px',
                      animation: 'pulse 1.5s infinite',
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Rate Limited State */}
          {!loading && apiState === 'rate_limited' && (
            <div
              style={{
                background: 'rgba(234, 179, 8, 0.08)',
                border: '1px solid rgba(234, 179, 8, 0.3)',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <Clock size={28} color="#FACC15" />
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#FACC15' }}>
                GitHub Rate Limit Reached
              </div>
              <div style={{ fontSize: '13px', color: 'var(--ack-text, #ECECEF)', maxWidth: '380px' }}>
                Rate limit reset {rateLimitReset || 'soon'}. Sign in with GitHub on Ack to get 5,000 requests/hr.
              </div>
              <a
                href={`https://github.com/${repoFullName}/pulls`}
                target="_blank"
                rel="noreferrer"
                style={{
                  marginTop: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12.5px',
                  color: 'var(--ack-accent, #8B7CFF)',
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
              >
                View pull requests on GitHub <ExternalLink size={14} />
              </a>
            </div>
          )}

          {/* Private Repository / 404 State */}
          {!loading && apiState === 'not_found_or_private' && (
            <div
              style={{
                background: 'rgba(139, 124, 255, 0.06)',
                border: '1px solid rgba(139, 124, 255, 0.25)',
                borderRadius: '12px',
                padding: '24px 20px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <Lock size={32} color="var(--ack-accent, #8B7CFF)" />
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ack-text, #ECECEF)' }}>
                Private repo: connect access
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--ack-muted, #9A9AA3)', maxWidth: '400px', lineHeight: 1.5 }}>
                Ack currently queries public repositories using read-only sign-in access. Granular private repository permissions via GitHub App are coming soon.
              </div>
              <a
                href={`https://github.com/${repoFullName}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  marginTop: '8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'var(--ack-surface-2, #17171B)',
                  border: '1px solid var(--ack-border, #26262B)',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontSize: '12.5px',
                  color: 'var(--ack-text, #ECECEF)',
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
              >
                Open {repoFullName} on GitHub <ExternalLink size={14} />
              </a>
            </div>
          )}

          {/* Token Revoked State */}
          {!loading && apiState === 'token_revoked' && (
            <div
              style={{
                background: 'rgba(248, 113, 113, 0.08)',
                border: '1px solid rgba(248, 113, 113, 0.25)',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <AlertTriangle size={28} color="#F87171" />
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#F87171' }}>
                GitHub Token Revoked or Expired
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--ack-text, #ECECEF)' }}>
                Please sign in with GitHub again to refresh your read-only API access.
              </div>
            </div>
          )}

          {/* Offline State */}
          {!loading && apiState === 'offline' && (
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--ack-border, #26262B)',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <WifiOff size={28} color="var(--ack-muted, #9A9AA3)" />
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ack-text, #ECECEF)' }}>
                You are currently offline
              </div>
              <div style={{ fontSize: '12px', color: 'var(--ack-muted, #9A9AA3)' }}>
                Connect to the internet to query live pull requests from GitHub.
              </div>
            </div>
          )}

          {/* No PRs Found */}
          {!loading && apiState === 'success' && prs.length === 0 && (
            <div
              style={{
                padding: '36px 20px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'var(--ack-surface-2, #17171B)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--ack-muted, #9A9AA3)',
                }}
              >
                <GitPullRequest size={22} />
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ack-text, #ECECEF)' }}>
                No {filterState !== 'all' ? filterState : ''} pull requests found
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--ack-muted, #9A9AA3)', maxWidth: '340px' }}>
                There are no {filterState} pull requests on {repoFullName}. You can open a new PR on GitHub.
              </div>
              <a
                href={`https://github.com/${repoFullName}/pulls`}
                target="_blank"
                rel="noreferrer"
                style={{
                  marginTop: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'var(--ack-surface-2, #17171B)',
                  border: '1px solid var(--ack-border, #26262B)',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: 'var(--ack-accent, #8B7CFF)',
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
              >
                Open on GitHub <ExternalLink size={13} />
              </a>
            </div>
          )}

          {/* PR Items List */}
          {!loading && apiState === 'success' && prs.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {prs.map((pr) => (
                <div
                  key={pr.number}
                  style={{
                    background: 'var(--ack-surface-2, #17171B)',
                    border: '1px solid var(--ack-border, #26262B)',
                    borderRadius: '12px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    transition: 'border-color 150ms ease',
                  }}
                >
                  {/* Top line: PR # and Title */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: '12px',
                            fontWeight: 700,
                            color: pr.state === 'open' ? 'var(--ack-success, #4ADE80)' : '#A855F7',
                          }}
                        >
                          #{pr.number}
                        </span>
                        <span
                          style={{
                            fontSize: '11px',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            background: pr.state === 'open' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(168, 85, 247, 0.1)',
                            color: pr.state === 'open' ? 'var(--ack-success, #4ADE80)' : '#A855F7',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                          }}
                        >
                          {pr.state}
                        </span>
                        <span style={{ fontSize: '11.5px', color: 'var(--ack-muted, #9A9AA3)' }}>
                          by @{pr.author.login}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: 'var(--ack-text, #ECECEF)',
                          lineHeight: 1.35,
                        }}
                      >
                        {pr.title}
                      </div>
                    </div>
                  </div>

                  {/* Branch tags */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '11.5px',
                      color: 'var(--ack-muted, #9A9AA3)',
                      fontFamily: 'JetBrains Mono, monospace',
                    }}
                  >
                    <span>{pr.branch}</span>
                    <span>→</span>
                    <span>{pr.baseBranch}</span>
                  </div>

                  {/* Action buttons: Review Diff vs Share to Group */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: '8px',
                      borderTop: '1px solid var(--ack-divider, #1C1C21)',
                      paddingTop: '10px',
                      marginTop: '4px',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onSharePrCard(pr, parsed!.owner, parsed!.repo);
                      }}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--ack-border, #26262B)',
                        color: 'var(--ack-text, #ECECEF)',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Share2 size={13} />
                      Share in Chat
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onSelectPrReview(pr, parsed!.owner, parsed!.repo);
                      }}
                      style={{
                        background: 'var(--ack-accent, #8B7CFF)',
                        border: 'none',
                        color: '#0B0B0D',
                        borderRadius: '8px',
                        padding: '6px 14px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Eye size={13} />
                      Review Diff
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PullRequestPickerModal;

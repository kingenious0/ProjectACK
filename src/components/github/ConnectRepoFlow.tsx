/**
 * ConnectRepoFlow – 6-screen GitHub App repo-connection wizard
 *
 * Screen 1 · Pick a repo
 * Screen 2 · Allow on GitHub (permissions)
 * Screen 3 · Waiting for org owner
 * Screen 4 · Set up channel (new / existing, event toggles)
 * Screen 5 · Connected ✓
 * Screen 6 · The repo channel (PR card, CI status, diff bars)
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { COLORS } from '../../theme/colors';

// ─── Types ───────────────────────────────────────────────────────────────────

export type RepoVisibility = 'public' | 'private' | 'needs_approval';

export interface GitHubRepo {
  id: string;
  fullName: string;      // "org/repo"
  visibility: RepoVisibility;
  installationId?: string;
}

export interface ConnectedRepoChannel {
  repoFullName: string;
  channelId: string;
  channelName: string;
  installationId: string;
  enabledEvents: RepoEvent[];
  isPrivate: boolean;
}

type RepoEvent = 'pull_request' | 'ci' | 'push' | 'release';

type Step =
  | 'pick'          // Screen 1
  | 'allow'         // Screen 2
  | 'waiting_org'   // Screen 3
  | 'setup_channel' // Screen 4
  | 'connected'     // Screen 5
  | 'channel_view'; // Screen 6

// ─── Mock data (swapped out when real API lands) ──────────────────────────────

const MOCK_REPOS: GitHubRepo[] = [
  { id: 'r1', fullName: 'kingenious0/ACK',          visibility: 'public' },
  { id: 'r2', fullName: 'kingenious0/mobile-client', visibility: 'private' },
  { id: 'r3', fullName: 'kingenious0/design-system', visibility: 'public' },
  { id: 'r4', fullName: 'acme-corp/payments-api',    visibility: 'needs_approval' },
  { id: 'r5', fullName: 'acme-corp/infra',           visibility: 'needs_approval' },
];

const MOCK_PR = {
  number: 42,
  title: 'feat: live CI status in repo channel',
  author: 'kingenious0',
  additions: 340,
  deletions: 48,
  ciStatus: 'passing' as 'passing' | 'failing' | 'running',
  buildLabel: 'build #218 · 2m 14s',
  commits: 3,
  branch: 'feat/ci-status-cards',
};

const TEAM_AVATARS = [
  { initials: 'SC', color: '#7C3AED' },
  { initials: 'RJ', color: '#2563EB' },
  { initials: 'HK', color: '#059669' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function VisibilityBadge({ v }: { v: RepoVisibility }) {
  const map: Record<RepoVisibility, { label: string; color: string; bg: string }> = {
    public:         { label: 'Public',          color: '#4ADE80', bg: 'rgba(74,222,128,.12)' },
    private:        { label: 'Private',         color: '#F5B544', bg: 'rgba(245,181,68,.12)' },
    needs_approval: { label: 'Needs approval',  color: '#9A9AA3', bg: 'rgba(154,154,163,.1)' },
  };
  const { label, color, bg } = map[v];
  return (
    <span style={{
      fontSize: 10, fontFamily: 'monospace', fontWeight: 700,
      color, background: bg, borderRadius: 4,
      padding: '2px 6px', marginLeft: 8,
    }}>
      {label}
    </span>
  );
}

function CiDot({ status }: { status: 'passing' | 'failing' | 'running' }) {
  const color = status === 'passing' ? '#4ADE80' : status === 'failing' ? '#F87171' : '#F5B544';
  const label = status === 'passing' ? '✓ Passing' : status === 'failing' ? '✕ Failing' : '⟳ Running';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 11, fontFamily: 'monospace', fontWeight: 700, color,
    }}>
      <span style={{
        width: 8, height: 8, borderRadius: '50%', background: color,
        display: 'inline-block',
        boxShadow: status === 'running' ? `0 0 0 3px ${color}44` : 'none',
      }} />
      {label}
    </span>
  );
}

function DiffBar({ add, del }: { add: number; del: number }) {
  const total = add + del;
  const addPct = Math.round((add / total) * 100);
  const delPct = 100 - addPct;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#4ADE80', minWidth: 36 }}>+{add}</span>
      <div style={{ flex: 1, height: 6, background: COLORS.surfaceBorder, borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ display: 'flex', height: '100%' }}>
          <div style={{ width: `${addPct}%`, background: '#4ADE80', borderRadius: '3px 0 0 3px' }} />
          <div style={{ width: `${delPct}%`, background: '#F87171', borderRadius: '0 3px 3px 0' }} />
        </div>
      </div>
      <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#F87171', minWidth: 36 }}>-{del}</span>
    </div>
  );
}

// ─── Shared shell ─────────────────────────────────────────────────────────────

function Sheet({
  children,
  onClose,
  width = 440,
}: {
  children: React.ReactNode;
  onClose: () => void;
  width?: number;
}) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(6px)',
    }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.surfaceBorder}`,
        borderRadius: 16,
        width, maxWidth: '94vw', maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 24px 80px rgba(0,0,0,.7)',
        animation: 'ack-slide-up .22s ease',
      }}>
        {children}
      </div>

      {/* animation keyframes injected once */}
      <style>{`
        @keyframes ack-slide-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ack-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function SheetHeader({ title, subtitle, onBack, onClose }: {
  title: string; subtitle?: string;
  onBack?: () => void; onClose: () => void;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      padding: '20px 20px 0',
    }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        {onBack && (
          <button onClick={onBack} style={ghostBtn} title="Back">
            ←
          </button>
        )}
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.textPrimary, fontFamily: 'monospace' }}>
            {title}
          </div>
          {subtitle && (
            <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 3 }}>{subtitle}</div>
          )}
        </div>
      </div>
      <button onClick={onClose} style={ghostBtn} title="Close">✕</button>
    </div>
  );
}

const ghostBtn: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  color: COLORS.textMuted, fontSize: 16, padding: '2px 6px',
  borderRadius: 6, lineHeight: 1,
};

const primaryBtn: React.CSSProperties = {
  display: 'block', width: '100%',
  padding: '11px 0', borderRadius: 8, border: 'none',
  background: COLORS.primary, color: '#fff',
  fontFamily: 'monospace', fontWeight: 700, fontSize: 13,
  cursor: 'pointer', letterSpacing: .3,
};

const secondaryBtn: React.CSSProperties = {
  display: 'block', width: '100%',
  padding: '10px 0', borderRadius: 8,
  border: `1px solid ${COLORS.surfaceBorder}`,
  background: 'none', color: COLORS.textSecondary,
  fontFamily: 'monospace', fontWeight: 600, fontSize: 13,
  cursor: 'pointer',
};

// ─── Screen 1 · Pick a repo ───────────────────────────────────────────────────

function PickRepoScreen({
  onClose,
  onSelect,
}: {
  onClose: () => void;
  onSelect: (repo: GitHubRepo) => void;
}) {
  const [query, setQuery] = useState('');
  const repos = MOCK_REPOS.filter((r) =>
    !query.trim() || r.fullName.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <SheetHeader title="🔗 Connect a GitHub repo" onClose={onClose} />

      <div style={{ padding: '16px 20px' }}>
        {/* Search / paste box */}
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <span style={{
            position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
            fontSize: 14, color: COLORS.textMuted, pointerEvents: 'none',
          }}>🔍</span>
          <input
            id="repo-search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search or paste owner/repo…"
            autoComplete="off"
            style={{
              width: '100%', boxSizing: 'border-box',
              background: COLORS.backgroundAlt, border: `1px solid ${COLORS.surfaceBorder}`,
              borderRadius: 8, color: COLORS.textPrimary,
              fontFamily: 'monospace', fontSize: 13,
              padding: '9px 12px 9px 32px', outline: 'none',
            }}
          />
        </div>

        {/* Repo list */}
        <div style={{
          border: `1px solid ${COLORS.surfaceBorder}`, borderRadius: 8, overflow: 'hidden',
          marginBottom: 14,
        }}>
          {repos.map((r, i) => (
            <button
              key={r.id}
              id={`repo-item-${r.id}`}
              onClick={() => onSelect(r)}
              disabled={r.visibility === 'needs_approval'}
              style={{
                display: 'flex', alignItems: 'center', width: '100%',
                padding: '11px 14px',
                background: 'none', border: 'none',
                borderTop: i > 0 ? `1px solid ${COLORS.borderLight}` : 'none',
                cursor: r.visibility === 'needs_approval' ? 'default' : 'pointer',
                textAlign: 'left',
                transition: 'background .15s',
              }}
              onMouseEnter={(e) => {
                if (r.visibility !== 'needs_approval')
                  (e.currentTarget as HTMLButtonElement).style.background = COLORS.surfaceLight;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'none';
              }}
            >
              {/* Octicon */}
              <span style={{ fontSize: 16, marginRight: 10 }}>
                {r.visibility === 'private' ? '🔒' : '📁'}
              </span>
              <span style={{
                flex: 1, fontFamily: 'monospace', fontSize: 13,
                color: r.visibility === 'needs_approval' ? COLORS.textMuted : COLORS.textPrimary,
              }}>
                {r.fullName}
              </span>
              <VisibilityBadge v={r.visibility} />
            </button>
          ))}

          {repos.length === 0 && (
            <div style={{ padding: '20px 14px', color: COLORS.textMuted, fontFamily: 'monospace', fontSize: 12 }}>
              No repos match "{query}"
            </div>
          )}
        </div>

        {/* Don't see your repo card */}
        <div style={{
          background: COLORS.backgroundAlt, border: `1px solid ${COLORS.surfaceBorder}`,
          borderRadius: 8, padding: '12px 14px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
        }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.textPrimary, fontFamily: 'monospace', marginBottom: 2 }}>
              Don't see your repo?
            </div>
            <div style={{ fontSize: 11, color: COLORS.textMuted }}>
              You may need to install the Ack GitHub App on that repo or org first.
            </div>
          </div>
          <a
            href="https://github.com/apps/ack-messenger/installations/new"
            target="_blank"
            rel="noreferrer"
            style={{
              whiteSpace: 'nowrap', fontSize: 11, fontFamily: 'monospace', fontWeight: 700,
              color: COLORS.primary, textDecoration: 'none',
              border: `1px solid ${COLORS.primary}`, borderRadius: 6, padding: '5px 10px',
            }}
          >
            Add repositories on GitHub →
          </a>
        </div>
      </div>
    </>
  );
}

// ─── Screen 2 · Allow on GitHub ───────────────────────────────────────────────

function AllowOnGitHubScreen({
  repo,
  onClose,
  onContinue,
  onDismiss,
}: {
  repo: GitHubRepo;
  onClose: () => void;
  onContinue: () => void;
  onDismiss: () => void;
}) {
  const permissions = [
    { icon: '📄', text: 'Read repository metadata (name, branch, description)' },
    { icon: '🔀', text: 'Read pull requests and reviews' },
    { icon: '🏗️', text: 'Read CI workflow runs and check statuses' },
    { icon: '🏷️', text: 'Read releases and tags' },
    { icon: '🚫', text: 'No write access — Ack never commits or merges code' },
  ];

  return (
    <>
      <SheetHeader
        title="Allow on GitHub"
        subtitle={`Ack needs read access to ${repo.fullName}`}
        onClose={onClose}
      />

      <div style={{ padding: '16px 20px' }}>
        {/* Repo pill */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: COLORS.backgroundAlt, border: `1px solid ${COLORS.surfaceBorder}`,
          borderRadius: 8, padding: '8px 14px', marginBottom: 18,
        }}>
          <span style={{ fontSize: 14 }}>📁</span>
          <span style={{ fontFamily: 'monospace', fontSize: 13, color: COLORS.textPrimary }}>
            {repo.fullName}
          </span>
          <VisibilityBadge v={repo.visibility} />
        </div>

        {/* Permissions list */}
        <div style={{ marginBottom: 18 }}>
          <div style={{
            fontSize: 11, fontFamily: 'monospace', fontWeight: 700,
            color: COLORS.textMuted, marginBottom: 10, letterSpacing: 1,
          }}>
            PERMISSIONS REQUESTED
          </div>
          {permissions.map((p, i) => (
            <div key={i} style={{
              display: 'flex', gap: 10, alignItems: 'flex-start',
              padding: '8px 0',
              borderTop: i > 0 ? `1px solid ${COLORS.borderLight}` : 'none',
            }}>
              <span style={{ fontSize: 14, lineHeight: 1.5 }}>{p.icon}</span>
              <span style={{ fontSize: 12, color: p.text.startsWith('🚫') ? COLORS.textMuted : COLORS.textSecondary, lineHeight: 1.6 }}>
                {p.text}
              </span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button id="btn-continue-to-github" onClick={onContinue} style={primaryBtn}>
            Continue to GitHub →
          </button>
          <button onClick={onDismiss} style={secondaryBtn}>
            Not now
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Screen 3 · Waiting for org owner ────────────────────────────────────────

function WaitingOrgScreen({
  repo,
  onClose,
  onCheckAgain,
}: {
  repo: GitHubRepo;
  onClose: () => void;
  onCheckAgain: () => void;
}) {
  const [checking, setChecking] = useState(false);
  const msg = `Hey, I connected ${repo.fullName} to Ack so we get live PR + CI notifications in our channel. Can you approve the GitHub App installation? Takes 30 seconds.`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(msg);
    } catch {
      /* noop – user can copy manually */
    }
  };

  const handleCheck = () => {
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      onCheckAgain();
    }, 1800);
  };

  return (
    <>
      <SheetHeader
        title="Waiting for an org owner"
        subtitle={`A member of ${repo.fullName.split('/')[0]} must approve the app`}
        onClose={onClose}
      />

      <div style={{ padding: '16px 20px' }}>
        {/* Spinner */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{
            width: 48, height: 48, margin: '0 auto 12px',
            border: `3px solid ${COLORS.surfaceBorder}`,
            borderTopColor: COLORS.primary,
            borderRadius: '50%',
            animation: 'ack-spin 1.1s linear infinite',
          }} />
          <div style={{ fontSize: 12, color: COLORS.textMuted }}>
            No action needed on your end — just share the message below.
          </div>
        </div>

        {/* Copy message */}
        <div style={{
          background: COLORS.backgroundAlt, border: `1px solid ${COLORS.surfaceBorder}`,
          borderRadius: 8, padding: '12px 14px', marginBottom: 16,
        }}>
          <div style={{
            fontSize: 11, fontFamily: 'monospace', fontWeight: 700,
            color: COLORS.textMuted, marginBottom: 8, letterSpacing: 1,
          }}>
            MESSAGE TO COPY
          </div>
          <p style={{
            margin: 0, fontSize: 13, lineHeight: 1.6,
            color: COLORS.textPrimary, fontStyle: 'italic',
          }}>
            "{msg}"
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleCopy} style={{ ...secondaryBtn, flex: 1 }}>
            📋 Copy message
          </button>
          <button
            id="btn-check-again"
            onClick={handleCheck}
            disabled={checking}
            style={{ ...primaryBtn, flex: 1 }}
          >
            {checking ? '⟳ Checking…' : 'Check again'}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Screen 4 · Set up channel ────────────────────────────────────────────────

function SetupChannelScreen({
  repo,
  onClose,
  onConfirm,
}: {
  repo: GitHubRepo;
  onClose: () => void;
  onConfirm: (cfg: { channelName: string; isNew: boolean; events: RepoEvent[]; isPrivate: boolean }) => void;
}) {
  const [channelMode, setChannelMode] = useState<'new' | 'existing'>('new');
  const [channelName, setChannelName] = useState(`github-${repo.fullName.split('/')[1]}`);
  const [existingChannel, setExistingChannel] = useState('');
  const [events, setEvents] = useState<RepoEvent[]>(['pull_request', 'ci', 'push']);
  const [isPrivate, setIsPrivate] = useState(repo.visibility === 'private');

  const toggleEvent = (ev: RepoEvent) => {
    setEvents((prev) =>
      prev.includes(ev) ? prev.filter((e) => e !== ev) : [...prev, ev]
    );
  };

  const eventOptions: { id: RepoEvent; label: string; icon: string }[] = [
    { id: 'pull_request', label: 'Pull Requests',   icon: '🔀' },
    { id: 'ci',           label: 'CI / Builds',     icon: '🏗️' },
    { id: 'push',         label: 'Pushes',           icon: '📤' },
    { id: 'release',      label: 'Releases',         icon: '🏷️' },
  ];

  const handleConfirm = () => {
    const name = channelMode === 'new' ? channelName.trim() : existingChannel.trim();
    if (!name) return;
    onConfirm({ channelName: name, isNew: channelMode === 'new', events, isPrivate });
  };

  return (
    <>
      <SheetHeader title="Set up channel" subtitle={repo.fullName} onClose={onClose} />

      <div style={{ padding: '16px 20px' }}>

        {/* Channel mode toggle */}
        <div style={{
          display: 'flex', background: COLORS.backgroundAlt,
          border: `1px solid ${COLORS.surfaceBorder}`, borderRadius: 8,
          padding: 4, marginBottom: 16, gap: 4,
        }}>
          {(['new', 'existing'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setChannelMode(mode)}
              style={{
                flex: 1, padding: '8px 0', borderRadius: 6, border: 'none',
                background: channelMode === mode ? COLORS.primary : 'none',
                color: channelMode === mode ? '#fff' : COLORS.textMuted,
                fontFamily: 'monospace', fontWeight: 700, fontSize: 12, cursor: 'pointer',
                transition: 'all .15s',
              }}
            >
              {mode === 'new' ? '+ New channel (recommended)' : 'Add to existing group'}
            </button>
          ))}
        </div>

        {/* Channel name input */}
        {channelMode === 'new' ? (
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontFamily: 'monospace', color: COLORS.textMuted, display: 'block', marginBottom: 6 }}>
              CHANNEL NAME
            </label>
            <input
              id="channel-name-input"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value.replace(/\s/g, '-').toLowerCase())}
              style={{
                width: '100%', boxSizing: 'border-box',
                background: COLORS.backgroundAlt, border: `1px solid ${COLORS.surfaceBorder}`,
                borderRadius: 8, color: COLORS.textPrimary,
                fontFamily: 'monospace', fontSize: 13,
                padding: '9px 12px', outline: 'none',
              }}
            />
          </div>
        ) : (
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontFamily: 'monospace', color: COLORS.textMuted, display: 'block', marginBottom: 6 }}>
              PICK AN EXISTING GROUP
            </label>
            <input
              id="existing-channel-input"
              value={existingChannel}
              onChange={(e) => setExistingChannel(e.target.value)}
              placeholder="Search channel name…"
              style={{
                width: '100%', boxSizing: 'border-box',
                background: COLORS.backgroundAlt, border: `1px solid ${COLORS.surfaceBorder}`,
                borderRadius: 8, color: COLORS.textPrimary,
                fontFamily: 'monospace', fontSize: 13,
                padding: '9px 12px', outline: 'none',
              }}
            />
          </div>
        )}

        {/* Event toggles */}
        <div style={{ marginBottom: 16 }}>
          <div style={{
            fontSize: 11, fontFamily: 'monospace', fontWeight: 700,
            color: COLORS.textMuted, marginBottom: 10, letterSpacing: 1,
          }}>
            NOTIFY ON
          </div>
          <div style={{
            border: `1px solid ${COLORS.surfaceBorder}`, borderRadius: 8, overflow: 'hidden',
          }}>
            {eventOptions.map((opt, i) => (
              <label key={opt.id} style={{
                display: 'flex', alignItems: 'center',
                padding: '10px 14px', cursor: 'pointer',
                borderTop: i > 0 ? `1px solid ${COLORS.borderLight}` : 'none',
                background: events.includes(opt.id) ? `${COLORS.primary}11` : 'none',
                transition: 'background .12s',
              }}>
                <span style={{ fontSize: 14, marginRight: 10 }}>{opt.icon}</span>
                <span style={{ flex: 1, fontFamily: 'monospace', fontSize: 13, color: COLORS.textPrimary }}>
                  {opt.label}
                </span>
                <input
                  type="checkbox"
                  id={`toggle-${opt.id}`}
                  checked={events.includes(opt.id)}
                  onChange={() => toggleEvent(opt.id)}
                  style={{ accentColor: COLORS.primary, width: 16, height: 16 }}
                />
              </label>
            ))}
          </div>
        </div>

        {/* Private repo warning */}
        {repo.visibility === 'private' && (
          <div style={{
            background: 'rgba(245,181,68,.10)', border: '1px solid rgba(245,181,68,.3)',
            borderRadius: 8, padding: '10px 14px', marginBottom: 16,
            display: 'flex', gap: 8,
          }}>
            <span style={{ fontSize: 16 }}>⚠️</span>
            <div style={{ fontSize: 12, color: '#F5B544', lineHeight: 1.6 }}>
              <strong>Private repo security:</strong> This channel will be private.
              Only teammates who have been granted access to <code style={{ fontFamily: 'monospace' }}>{repo.fullName}</code> will be admitted — no exceptions.
            </div>
          </div>
        )}

        <button
          id="btn-create-channel"
          onClick={handleConfirm}
          disabled={channelMode === 'new' ? !channelName.trim() : !existingChannel.trim()}
          style={primaryBtn}
        >
          Create channel →
        </button>
      </div>
    </>
  );
}

// ─── Screen 5 · Connected ─────────────────────────────────────────────────────

function ConnectedScreen({
  repo,
  channelName,
  onOpenChannel,
  onConnectAnother,
  onClose,
}: {
  repo: GitHubRepo;
  channelName: string;
  onOpenChannel: () => void;
  onConnectAnother: () => void;
  onClose: () => void;
}) {
  return (
    <>
      <SheetHeader title="Connected!" onClose={onClose} />

      <div style={{ padding: '20px 20px 24px', textAlign: 'center' }}>
        {/* Big checkmark */}
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'rgba(74,222,128,.15)', border: '2px solid #4ADE80',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, margin: '0 auto 16px',
        }}>✓</div>

        <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.textPrimary, marginBottom: 4 }}>
          {repo.fullName}
        </div>
        <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 20 }}>
          is now connected to <strong style={{ color: COLORS.textPrimary }}>#{channelName}</strong>
        </div>

        {/* Team avatars */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: -6, marginBottom: 24 }}>
          {TEAM_AVATARS.map((av, i) => (
            <div key={i} style={{
              width: 36, height: 36, borderRadius: '50%',
              background: av.color, border: `2px solid ${COLORS.surface}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: '#fff',
              marginLeft: i > 0 ? -8 : 0,
              zIndex: TEAM_AVATARS.length - i,
              position: 'relative',
            }}>
              {av.initials}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button id="btn-open-channel" onClick={onOpenChannel} style={primaryBtn}>
            Open channel →
          </button>
          <button onClick={onConnectAnother} style={secondaryBtn}>
            Connect another repo
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Screen 6 · The repo channel ─────────────────────────────────────────────

function RepoChannelView({
  repo,
  channelName,
  onClose,
  onReviewDiff,
}: {
  repo: GitHubRepo;
  channelName: string;
  onClose: () => void;
  onReviewDiff?: () => void;
}) {
  const pr = MOCK_PR;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Channel header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px',
        borderBottom: `1px solid ${COLORS.surfaceBorder}`,
        background: COLORS.surface,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>📁</span>
          <div>
            <div style={{ fontFamily: 'monospace', fontWeight: 700, color: COLORS.textPrimary, fontSize: 14 }}>
              #{channelName}
            </div>
            <div style={{ fontSize: 11, color: COLORS.textMuted }}>
              {repo.fullName} · {pr.commits} commits this week
            </div>
          </div>
        </div>
        <button onClick={onClose} style={ghostBtn}>✕</button>
      </div>

      {/* Feed */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* System message: connected */}
        <div style={{
          textAlign: 'center', fontSize: 11, color: COLORS.textMuted,
          fontFamily: 'monospace', padding: '6px 0',
        }}>
          🔗 {repo.fullName} connected to this channel
        </div>

        {/* PR card */}
        <div style={{
          background: COLORS.backgroundAlt,
          border: `1px solid ${COLORS.surfaceBorder}`,
          borderRadius: 10,
          overflow: 'hidden',
        }}>
          {/* Card header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 14px',
            borderBottom: `1px solid ${COLORS.borderLight}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                fontSize: 10, fontFamily: 'monospace', fontWeight: 800,
                color: COLORS.primary,
                background: `${COLORS.primary}22`,
                borderRadius: 4, padding: '2px 8px',
              }}>
                PULL REQUEST
              </span>
              <span style={{ fontSize: 12, color: COLORS.textMuted, fontFamily: 'monospace' }}>
                #{pr.number}
              </span>
            </div>
            <CiDot status={pr.ciStatus} />
          </div>

          {/* Card body */}
          <div style={{ padding: '12px 14px' }}>
            <div style={{
              fontFamily: 'monospace', fontWeight: 700,
              color: COLORS.textPrimary, fontSize: 13, marginBottom: 4,
            }}>
              {pr.title}
            </div>
            <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 12, fontFamily: 'monospace' }}>
              by @{pr.author} · {pr.branch}
            </div>

            {/* Diff bars */}
            <DiffBar add={pr.additions} del={pr.deletions} />
          </div>

          {/* Build pill */}
          <div style={{
            padding: '8px 14px',
            borderTop: `1px solid ${COLORS.borderLight}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{
              fontSize: 10, fontFamily: 'monospace', color: COLORS.textMuted,
              background: COLORS.backgroundAlt,
              border: `1px solid ${COLORS.surfaceBorder}`,
              borderRadius: 4, padding: '2px 8px',
            }}>
              {pr.buildLabel}
            </span>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                id="btn-open-thread"
                onClick={() => {/* open thread */}}
                style={{
                  ...secondaryBtn,
                  width: 'auto', padding: '5px 12px', fontSize: 11,
                }}
              >
                Open thread
              </button>
              <button
                id="btn-review-diff"
                onClick={onReviewDiff}
                style={{
                  ...primaryBtn,
                  width: 'auto', padding: '5px 14px', fontSize: 11,
                }}
              >
                Review diff →
              </button>
            </div>
          </div>
        </div>

        {/* Commit push card */}
        <div style={{
          background: COLORS.backgroundAlt,
          border: `1px solid ${COLORS.surfaceBorder}`,
          borderRadius: 10, padding: '10px 14px',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 16 }}>📤</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 12, color: COLORS.textPrimary, fontWeight: 600 }}>
              3 commits pushed to {pr.branch}
            </div>
            <div style={{ fontSize: 11, color: COLORS.textMuted }}>
              @{pr.author} · 2 minutes ago
            </div>
          </div>
          <span style={{
            fontSize: 10, fontFamily: 'monospace',
            color: '#4ADE80', background: 'rgba(74,222,128,.12)',
            borderRadius: 4, padding: '2px 8px',
          }}>
            build #218
          </span>
        </div>

      </div>

      {/* Fake message input bar (non-interactive placeholder) */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 14px',
        borderTop: `1px solid ${COLORS.surfaceBorder}`,
        background: COLORS.surface,
      }}>
        <div style={{
          flex: 1, background: COLORS.backgroundAlt,
          border: `1px solid ${COLORS.surfaceBorder}`,
          borderRadius: 20, padding: '8px 14px',
          fontSize: 13, color: COLORS.textMuted, fontFamily: 'monospace',
        }}>
          Comment in #{channelName}…
        </div>
        <button style={{ ...primaryBtn, width: 36, height: 36, padding: 0, borderRadius: '50%' }}>↑</button>
      </div>
    </div>
  );
}

// ─── Orchestrator ─────────────────────────────────────────────────────────────

export interface ConnectRepoFlowProps {
  onClose: () => void;
  /** Called when the channel is created so parent can open the real chat */
  onChannelCreated?: (cfg: ConnectedRepoChannel) => void;
  /** Called when "Review diff" is clicked inside the repo channel view */
  onReviewDiff?: () => void;
}

export const ConnectRepoFlow: React.FC<ConnectRepoFlowProps> = ({
  onClose,
  onChannelCreated,
  onReviewDiff,
}) => {
  const [step, setStep] = useState<Step>('pick');
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [channelName, setChannelName] = useState('');

  // Screen 1 → 2 or 3
  const handleSelectRepo = (repo: GitHubRepo) => {
    setSelectedRepo(repo);
    if (repo.visibility === 'needs_approval') {
      setStep('waiting_org');
    } else {
      setStep('allow');
    }
  };

  // Screen 2 → 4 (simulate GitHub install redirect completing)
  const handleContinueToGitHub = () => {
    // In production: window.location.href = `https://github.com/apps/ack-messenger/installations/new?...`
    // For now, skip straight to channel setup after a brief delay
    setStep('setup_channel');
  };

  // Screen 3 → 2 (approval received, now proceed normally)
  const handleCheckAgain = () => {
    setStep('allow');
  };

  // Screen 4 → 5
  const handleConfirmChannel = (cfg: {
    channelName: string;
    isNew: boolean;
    events: RepoEvent[];
    isPrivate: boolean;
  }) => {
    setChannelName(cfg.channelName);
    if (selectedRepo && onChannelCreated) {
      onChannelCreated({
        repoFullName: selectedRepo.fullName,
        channelId: `gh_${selectedRepo.id}_${Date.now()}`,
        channelName: cfg.channelName,
        installationId: selectedRepo.installationId || `inst_${Date.now()}`,
        enabledEvents: cfg.events,
        isPrivate: cfg.isPrivate,
      });
    }
    setStep('connected');
  };

  // Screen 5 → 6
  const handleOpenChannel = () => setStep('channel_view');

  // Screen 5 → 1 (connect another)
  const handleConnectAnother = () => {
    setSelectedRepo(null);
    setChannelName('');
    setStep('pick');
  };

  if (step === 'channel_view' && selectedRepo) {
    return (
      <Sheet onClose={onClose} width={520}>
        <RepoChannelView
          repo={selectedRepo}
          channelName={channelName}
          onClose={onClose}
          onReviewDiff={onReviewDiff}
        />
      </Sheet>
    );
  }

  return (
    <Sheet onClose={onClose}>
      {step === 'pick' && (
        <PickRepoScreen onClose={onClose} onSelect={handleSelectRepo} />
      )}
      {step === 'allow' && selectedRepo && (
        <AllowOnGitHubScreen
          repo={selectedRepo}
          onClose={onClose}
          onContinue={handleContinueToGitHub}
          onDismiss={() => setStep('pick')}
        />
      )}
      {step === 'waiting_org' && selectedRepo && (
        <WaitingOrgScreen
          repo={selectedRepo}
          onClose={onClose}
          onCheckAgain={handleCheckAgain}
        />
      )}
      {step === 'setup_channel' && selectedRepo && (
        <SetupChannelScreen
          repo={selectedRepo}
          onClose={onClose}
          onConfirm={handleConfirmChannel}
        />
      )}
      {step === 'connected' && selectedRepo && (
        <ConnectedScreen
          repo={selectedRepo}
          channelName={channelName}
          onOpenChannel={handleOpenChannel}
          onConnectAnother={handleConnectAnother}
          onClose={onClose}
        />
      )}
    </Sheet>
  );
};

export default ConnectRepoFlow;

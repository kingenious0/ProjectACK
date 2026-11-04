import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, LogOut, ExternalLink, Check, Pencil } from 'lucide-react';
import { CURRENT_USER, setCurrentUser } from '../../web-db/store';
import { upsertUserProfile } from '../../lib/appwrite';


export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignOut?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSignOut,
}) => {
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [usernameInput, setUsernameInput] = useState(CURRENT_USER.username || '');

  // Notification states
  const [prReviews, setPrReviews] = useState(true);
  const [ciFailures, setCiFailures] = useState(true);
  const [mentions, setMentions] = useState(true);

  // Privacy states
  const [readReceipts, setReadReceipts] = useState(true);
  const [searchable, setSearchable] = useState(CURRENT_USER.searchable !== false);
  const [vaultTimer, setVaultTimer] = useState<'30s' | '1m' | '5m' | '10m'>('1m');
  const [showTimerSheet, setShowTimerSheet] = useState(false);

  // Appearance state
  const [theme] = useState<'Dark'>('Dark');

  if (!isOpen) return null;

  return (
    <div
      className="ack-modal-backdrop"
      id="ack-settings-modal"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--ack-bg, #0B0B0D)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        overflow: 'hidden',
        animation: 'ackFadeIn 150ms ease',
      }}
    >
      {/* 1. Header (Chevron Left + Settings) */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          height: '56px',
          padding: '0 16px',
          paddingTop: 'env(safe-area-inset-top, 0px)',
          borderBottom: '1px solid var(--ack-divider, #1C1C21)',
          background: 'var(--ack-bg, #0B0B0D)',
          flexShrink: 0,
          userSelect: 'none',
        }}
      >
        <button
          type="button"
          id="btn-settings-back"
          onClick={onClose}
          aria-label="Back"
          style={{
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            color: 'var(--ack-text, #ECECEF)',
            cursor: 'pointer',
            marginLeft: '-8px',
          }}
        >
          <ChevronLeft size={22} strokeWidth={2} />
        </button>
        <h1
          style={{
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--ack-text, #ECECEF)',
            fontFamily: 'Inter, sans-serif',
            margin: 0,
            letterSpacing: '-0.01em',
          }}
        >
          Settings
        </h1>
      </header>

      {/* 2. Scrollable Body */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding: '20px 16px 40px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          maxWidth: '540px',
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box',
        }}
      >
        {/* Profile Card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '16px',
            background: 'var(--ack-surface, #131316)',
            border: '1px solid var(--ack-border, #26262B)',
            borderRadius: 'var(--radius-card, 12px)',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'var(--ack-avatar-bg, #1A1A1F)',
              color: 'var(--ack-text, #ECECEF)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: 700,
              fontFamily: 'Inter, sans-serif',
              flexShrink: 0,
              border: '1px solid var(--ack-border, #26262B)',
              overflow: 'hidden',
            }}
          >
            {CURRENT_USER.avatar ? (
              <img
                src={CURRENT_USER.avatar}
                alt={CURRENT_USER.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              (CURRENT_USER.name || 'KG').slice(0, 2).toUpperCase()
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
            <span
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: 'var(--ack-text, #ECECEF)',
                fontFamily: 'Inter, sans-serif',
                letterSpacing: '-0.01em',
              }}
            >
              {CURRENT_USER.name}
            </span>
            {isEditingUsername ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <span style={{ fontSize: '13px', color: 'var(--ack-muted, #9A9AA3)', fontFamily: 'JetBrains Mono, monospace' }}>@</span>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="e.g. kingenious0"
                  style={{
                    background: 'var(--ack-surface-2, #17171B)',
                    border: '1px solid var(--ack-border, #26262B)',
                    borderRadius: '6px',
                    color: 'var(--ack-text, #ECECEF)',
                    padding: '2px 8px',
                    fontSize: '13px',
                    fontFamily: 'JetBrains Mono, monospace',
                    outline: 'none',
                    width: '140px',
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const clean = usernameInput.trim().replace(/^@/, '');
                    if (clean) {
                      setCurrentUser({
                        ...CURRENT_USER,
                        username: clean,
                        avatar: `https://github.com/${clean}.png`,
                      });
                    }
                    setIsEditingUsername(false);
                  }}
                  style={{
                    background: 'var(--ack-accent, #8B7CFF)',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#0B0B0D',
                    fontWeight: 700,
                    fontSize: '11px',
                    padding: '4px 8px',
                    cursor: 'pointer',
                  }}
                >
                  Save
                </button>
              </div>
            ) : (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                <a
                  href={`https://github.com/${CURRENT_USER.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '13px',
                    color: 'var(--ack-muted, #9A9AA3)',
                    fontFamily: 'JetBrains Mono, monospace',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>@{CURRENT_USER.username}</span>
                  <ExternalLink size={12} strokeWidth={2} />
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setUsernameInput(CURRENT_USER.username || '');
                    setIsEditingUsername(true);
                  }}
                  title="Edit GitHub handle"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '2px',
                    cursor: 'pointer',
                    color: 'var(--ack-muted, #9A9AA3)',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Pencil size={12} strokeWidth={2} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Section: Notifications */}
        <div>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              color: 'var(--ack-muted, #9A9AA3)',
              letterSpacing: '0.06em',
              paddingLeft: '4px',
              marginBottom: '8px',
            }}
          >
            Notifications
          </div>
          <div
            style={{
              background: 'var(--ack-surface, #131316)',
              border: '1px solid var(--ack-border, #26262B)',
              borderRadius: 'var(--radius-card, 12px)',
              overflow: 'hidden',
            }}
          >
            {/* PR review requests */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderBottom: '1px solid var(--ack-divider, #1C1C21)',
              }}
            >
              <span style={{ fontSize: '15px', color: 'var(--ack-text, #ECECEF)', fontWeight: 500 }}>
                PR review requests
              </span>
              <ToggleSwitch checked={prReviews} onChange={setPrReviews} id="toggle-pr-reviews" />
            </div>

            {/* CI failures */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderBottom: '1px solid var(--ack-divider, #1C1C21)',
              }}
            >
              <span style={{ fontSize: '15px', color: 'var(--ack-text, #ECECEF)', fontWeight: 500 }}>
                CI failures
              </span>
              <ToggleSwitch checked={ciFailures} onChange={setCiFailures} id="toggle-ci-failures" />
            </div>

            {/* Mentions */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
              }}
            >
              <span style={{ fontSize: '15px', color: 'var(--ack-text, #ECECEF)', fontWeight: 500 }}>
                Mentions
              </span>
              <ToggleSwitch checked={mentions} onChange={setMentions} id="toggle-mentions" />
            </div>
          </div>
        </div>

        {/* Section: Privacy */}
        <div>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              color: 'var(--ack-muted, #9A9AA3)',
              letterSpacing: '0.06em',
              paddingLeft: '4px',
              marginBottom: '8px',
            }}
          >
            Privacy
          </div>
          <div
            style={{
              background: 'var(--ack-surface, #131316)',
              border: '1px solid var(--ack-border, #26262B)',
              borderRadius: 'var(--radius-card, 12px)',
              overflow: 'hidden',
            }}
          >
            {/* Read receipts */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderBottom: '1px solid var(--ack-divider, #1C1C21)',
              }}
            >
              <div>
                <div style={{ fontSize: '15px', color: 'var(--ack-text, #ECECEF)', fontWeight: 500 }}>
                  Read receipts
                </div>
                <div style={{ fontSize: '12px', color: 'var(--ack-muted, #9A9AA3)', marginTop: '2px' }}>
                  Senders know when you view a message
                </div>
              </div>
              <ToggleSwitch checked={readReceipts} onChange={setReadReceipts} id="toggle-read-receipts" />
            </div>

            {/* Searchable by username */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderBottom: '1px solid var(--ack-divider, #1C1C21)',
              }}
            >
              <div>
                <div style={{ fontSize: '15px', color: 'var(--ack-text, #ECECEF)', fontWeight: 500 }}>
                  Searchable by username
                </div>
                <div style={{ fontSize: '12px', color: 'var(--ack-muted, #9A9AA3)', marginTop: '2px' }}>
                  Allow other developers to find your profile on Ack
                </div>
              </div>
              <ToggleSwitch
                checked={searchable}
                onChange={(val) => {
                  setSearchable(val);
                  setCurrentUser({
                    ...CURRENT_USER,
                    searchable: val,
                  });
                  upsertUserProfile({
                    id: CURRENT_USER.id,
                    githubId: CURRENT_USER.githubId || CURRENT_USER.id,
                    name: CURRENT_USER.name,
                    username: CURRENT_USER.username,
                    avatar: CURRENT_USER.avatar,
                    searchable: val,
                  });
                }}
                id="toggle-searchable"
              />
            </div>

            {/* Default vault timer */}
            <button
              type="button"
              onClick={() => setShowTimerSheet(!showTimerSheet)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div>
                <div style={{ fontSize: '15px', color: 'var(--ack-text, #ECECEF)', fontWeight: 500 }}>
                  Default vault timer
                </div>
                <div style={{ fontSize: '12px', color: 'var(--ack-muted, #9A9AA3)', marginTop: '2px' }}>
                  Auto-burn duration for newly created secrets
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '14px', color: 'var(--ack-accent-text, #A99DFF)', fontWeight: 500 }}>
                  {vaultTimer === '30s' ? '30 seconds' : vaultTimer === '1m' ? '1 minute' : vaultTimer === '5m' ? '5 minutes' : '10 minutes'}
                </span>
                <ChevronRight size={16} strokeWidth={1.75} color="var(--ack-muted, #9A9AA3)" />
              </div>
            </button>

            {/* Timer Options expanded */}
            {showTimerSheet && (
              <div
                style={{
                  background: 'var(--ack-surface-2, #17171B)',
                  borderTop: '1px solid var(--ack-divider, #1C1C21)',
                  padding: '8px 16px',
                }}
              >
                {[
                  { value: '30s', label: '30 seconds' },
                  { value: '1m', label: '1 minute' },
                  { value: '5m', label: '5 minutes' },
                  { value: '10m', label: '10 minutes' },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => {
                      setVaultTimer(item.value as any);
                      setShowTimerSheet(false);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 0',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: vaultTimer === item.value ? 'var(--ack-accent-text, #A99DFF)' : 'var(--ack-text, #ECECEF)',
                      fontSize: '14px',
                      fontWeight: vaultTimer === item.value ? 600 : 400,
                    }}
                  >
                    <span>{item.label}</span>
                    {vaultTimer === item.value && <Check size={16} strokeWidth={2.2} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section: Appearance */}
        <div>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              color: 'var(--ack-muted, #9A9AA3)',
              letterSpacing: '0.06em',
              paddingLeft: '4px',
              marginBottom: '8px',
            }}
          >
            Appearance
          </div>
          <div
            style={{
              background: 'var(--ack-surface, #131316)',
              border: '1px solid var(--ack-border, #26262B)',
              borderRadius: 'var(--radius-card, 12px)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
              }}
            >
              <span style={{ fontSize: '15px', color: 'var(--ack-text, #ECECEF)', fontWeight: 500 }}>
                Theme
              </span>
              <span
                style={{
                  fontSize: '14px',
                  color: 'var(--ack-muted, #9A9AA3)',
                  fontWeight: 500,
                }}
              >
                {theme} (Pure black)
              </span>
            </div>
          </div>
        </div>

        {/* Section: Account / Sign Out */}
        <div style={{ marginTop: '8px' }}>
          <button
            type="button"
            id="btn-settings-signout"
            onClick={() => {
              if (onSignOut) onSignOut();
              else onClose();
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '14px 16px',
              background: 'var(--ack-surface, #131316)',
              border: '1px solid var(--ack-border, #26262B)',
              borderRadius: 'var(--radius-card, 12px)',
              color: 'var(--ack-danger, #F87171)',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 150ms ease, border-color 150ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(248, 113, 113, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(248, 113, 113, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--ack-surface, #131316)';
              e.currentTarget.style.borderColor = 'var(--ack-border, #26262B)';
            }}
          >
            <LogOut size={16} strokeWidth={1.75} />
            <span>Sign out</span>
          </button>
        </div>

        {/* Honest note footer */}
        <div
          style={{
            textAlign: 'center',
            fontSize: '12px',
            color: 'var(--ack-muted, #9A9AA3)',
            lineHeight: 1.5,
            paddingTop: '8px',
          }}
        >
          Ack v1.0.0 • Vault secrets are encrypted in your browser.
        </div>
      </div>
    </div>
  );
};

// Reusable toggle switch adhering to Ack design tokens:
// width: 50px, height: 30px, borderRadius: 15px
// active: #8B7CFF with #0B0B0D circle shifted right
// inactive: #26262B with #9A9AA3 circle on left
interface ToggleSwitchProps {
  checked: boolean;
  onChange: (val: boolean) => void;
  id?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, id }) => {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: '50px',
        height: '30px',
        borderRadius: '15px',
        background: checked ? 'var(--ack-accent, #8B7CFF)' : 'var(--ack-border, #26262B)',
        border: 'none',
        position: 'relative',
        cursor: 'pointer',
        padding: '3px',
        boxSizing: 'border-box',
        transition: 'background 200ms ease',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <span
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: checked ? '#0B0B0D' : 'var(--ack-muted, #9A9AA3)',
          transition: 'transform 200ms ease, background 200ms ease',
          transform: checked ? 'translateX(20px)' : 'translateX(0px)',
          display: 'block',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }}
      />
    </button>
  );
};

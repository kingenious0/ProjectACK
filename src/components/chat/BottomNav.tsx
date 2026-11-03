import React from 'react';
import { MessageSquare, GitPullRequest, Lock } from 'lucide-react';

export type NavTab = 'chats' | 'reviews' | 'vault';

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  chatsUnreadCount?: number;
  reviewsCount?: number;
  vaultCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  chatsUnreadCount = 0,
}) => {
  return (
    <nav
      className="ack-bottom-nav"
      aria-label="Main Navigation"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        height: '60px',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        background: 'var(--ack-bg)',
        borderTop: '1px solid var(--ack-divider)',
        position: 'sticky',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        userSelect: 'none',
      }}
    >
      {/* Chats Tab */}
      <button
        type="button"
        id="tab-chats"
        onClick={() => onSelectTab('chats')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '8px 16px',
          minWidth: '64px',
          minHeight: '44px',
          color: activeTab === 'chats' ? 'var(--ack-accent)' : 'var(--ack-muted)',
          transition: 'color 150ms ease',
          position: 'relative',
        }}
        aria-label="Chats"
        aria-selected={activeTab === 'chats'}
      >
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <MessageSquare size={20} strokeWidth={1.75} />
          {chatsUnreadCount > 0 && activeTab !== 'chats' && (
            <span
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-6px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--ack-accent)',
              }}
            />
          )}
        </div>
        <span
          style={{
            fontSize: '11px',
            fontWeight: activeTab === 'chats' ? 600 : 500,
            fontFamily: 'Inter, sans-serif',
            letterSpacing: '0.01em',
          }}
        >
          Chats
        </span>
      </button>

      {/* Reviews Tab */}
      <button
        type="button"
        id="tab-reviews"
        onClick={() => onSelectTab('reviews')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '8px 16px',
          minWidth: '64px',
          minHeight: '44px',
          color: activeTab === 'reviews' ? 'var(--ack-accent)' : 'var(--ack-muted)',
          transition: 'color 150ms ease',
        }}
        aria-label="Reviews"
        aria-selected={activeTab === 'reviews'}
      >
        <GitPullRequest size={20} strokeWidth={1.75} />
        <span
          style={{
            fontSize: '11px',
            fontWeight: activeTab === 'reviews' ? 600 : 500,
            fontFamily: 'Inter, sans-serif',
            letterSpacing: '0.01em',
          }}
        >
          Reviews
        </span>
      </button>

      {/* Vault Tab */}
      <button
        type="button"
        id="tab-vault"
        onClick={() => onSelectTab('vault')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '8px 16px',
          minWidth: '64px',
          minHeight: '44px',
          color: activeTab === 'vault' ? 'var(--ack-accent)' : 'var(--ack-muted)',
          transition: 'color 150ms ease',
        }}
        aria-label="Vault"
        aria-selected={activeTab === 'vault'}
      >
        <Lock size={20} strokeWidth={1.75} />
        <span
          style={{
            fontSize: '11px',
            fontWeight: activeTab === 'vault' ? 600 : 500,
            fontFamily: 'Inter, sans-serif',
            letterSpacing: '0.01em',
          }}
        >
          Vault
        </span>
      </button>
    </nav>
  );
};

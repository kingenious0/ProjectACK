import React from 'react';
import {
  MessageSquare,
  Shield,
  Radio,
  FolderGit2,
  Terminal,
} from 'lucide-react';

export type WorkspaceCategory = 'relays' | 'repos' | 'vault' | 'webhooks';

interface WorkspaceDockProps {
  activeCategory: WorkspaceCategory;
  onSelectCategory: (category: WorkspaceCategory) => void;
  unreadCount?: number;
  onOpenSettings?: () => void;
}

export const WorkspaceDock: React.FC<WorkspaceDockProps> = ({
  activeCategory,
  onSelectCategory,
  unreadCount = 0,
  onOpenSettings,
}) => {
  const navItems: { id: WorkspaceCategory; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'relays',
      label: 'Chats & DMs',
      icon: <MessageSquare size={20} strokeWidth={1.75} />,
      badge: unreadCount,
    },
    {
      id: 'repos',
      label: 'Repositories & Channels',
      icon: <FolderGit2 size={20} strokeWidth={1.75} />,
    },
    {
      id: 'vault',
      label: 'Secrets Vault',
      icon: <Shield size={20} strokeWidth={1.75} />,
    },
    {
      id: 'webhooks',
      label: 'CI/CD Feeds',
      icon: <Radio size={20} strokeWidth={1.75} />,
    },
  ];

  return (
    <nav
      className="ack-workspace-dock"
      id="workspace-selector-dock"
      aria-label="Workspace Selector"
      style={{
        width: '56px',
        height: '100%',
        background: 'var(--ack-surface)',
        borderRight: '1px solid var(--ack-border)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '12px 0 16px 0',
        flexShrink: 0,
        zIndex: 20,
        position: 'relative',
      }}
    >
      {/* Ack Brand Wordmark Icon */}
      <div
        title="Ack — Got it."
        style={{
          width: '40px',
          height: '40px',
          borderRadius: 'var(--radius-button)',
          background: 'var(--ack-accent-tint)',
          border: '1px solid var(--ack-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--ack-accent-text)',
          marginBottom: '20px',
          cursor: 'pointer',
        }}
      >
        <Terminal size={20} strokeWidth={1.75} />
      </div>

      {/* Primary Category Navigation Icons */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          flex: 1,
          width: '100%',
        }}
      >
        {navItems.map((item) => {
          const isActive = activeCategory === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectCategory(item.id)}
              title={item.label}
              aria-label={item.label}
              className={`ack-dock-btn ${isActive ? 'active' : ''}`}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-button)',
                border: 'none',
                background: isActive ? 'var(--ack-surface-2)' : 'transparent',
                color: isActive ? 'var(--ack-accent)' : 'var(--ack-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background var(--transition-fast), color var(--transition-fast)',
              }}
            >
              {item.icon}

              {/* Indicator Pill for Active Dock Item */}
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '12px',
                    bottom: '12px',
                    width: '3px',
                    borderRadius: '0 2px 2px 0',
                    background: 'var(--ack-accent)',
                  }}
                />
              )}

              {/* Unread Counter Badge */}
              {item.badge && item.badge > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    minWidth: '16px',
                    height: '16px',
                    borderRadius: '8px',
                    background: 'var(--ack-accent)',
                    color: '#0B0B0D',
                    fontSize: '10px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                  }}
                >
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

import React from 'react';
import {
  MessageSquare,
  GitBranch,
  Shield,
  Radio,
  Settings,
  Terminal,
  FolderGit2,
  Cpu,
} from 'lucide-react';
import { CURRENT_USER } from '../../web-db/store';

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
      label: 'Dev Relays & DMs',
      icon: <MessageSquare size={20} />,
      badge: unreadCount,
    },
    {
      id: 'repos',
      label: 'Repositories & Channels',
      icon: <FolderGit2 size={20} />,
    },
    {
      id: 'vault',
      label: 'Burn-After-Reading Vault',
      icon: <Shield size={20} />,
    },
    {
      id: 'webhooks',
      label: 'CI/CD Webhooks & Feeds',
      icon: <Radio size={20} />,
    },
  ];

  return (
    <nav
      className="wa-workspace-dock"
      id="workspace-selector-dock"
      aria-label="Workspace Selector"
      style={{
        width: '56px',
        height: '100%',
        background: 'var(--wa-bg-deep)',
        borderRight: '1px solid var(--wa-border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '12px 0 16px 0',
        flexShrink: 0,
        zIndex: 20,
        position: 'relative',
      }}
    >
      {/* WhatsDev Dev Engine Logo Icon */}
      <div
        title="WhatsDev Dev Hub v2.0"
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, rgba(0, 255, 204, 0.2), rgba(0, 229, 255, 0.08))',
          border: '1px solid rgba(0, 255, 204, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--wa-accent-green)',
          marginBottom: '20px',
          cursor: 'pointer',
          boxShadow: '0 0 14px rgba(0, 255, 204, 0.15)',
        }}
      >
        <Terminal size={22} strokeWidth={2.5} />
      </div>

      {/* Primary Category Execution Icons */}
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
              className={`wa-dock-btn ${isActive ? 'active' : ''}`}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                border: 'none',
                background: isActive ? 'var(--wa-bg-incoming)' : 'transparent',
                color: isActive ? 'var(--wa-accent-green)' : 'var(--wa-text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.15s ease',
              }}
            >
              {/* Active Indicator Bar on Left */}
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    left: '-6px',
                    width: '4px',
                    height: '24px',
                    background: 'var(--wa-accent-green)',
                    borderRadius: '0 4px 4px 0',
                    boxShadow: '0 0 8px var(--wa-accent-green)',
                  }}
                />
              )}

              {item.icon}

              {/* Unread badge */}
              {item.badge && item.badge > 0 ? (
                <span
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'var(--wa-accent-green)',
                    boxShadow: '0 0 6px var(--wa-accent-green)',
                  }}
                />
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Bottom Section: Profile + Settings */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          width: '100%',
          paddingTop: '12px',
          borderTop: '1px solid var(--wa-border-subtle)',
        }}
      >
        <button
          type="button"
          onClick={onOpenSettings}
          title="Terminal & Git Settings"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            border: 'none',
            background: 'transparent',
            color: 'var(--wa-text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'color 0.15s ease',
          }}
        >
          <Settings size={19} />
        </button>

        {/* User Presence Avatar */}
        <div
          title={`${CURRENT_USER.name} (Online)`}
          style={{
            position: 'relative',
            cursor: 'pointer',
          }}
        >
          <img
            src={CURRENT_USER.avatar}
            alt={CURRENT_USER.name}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: '2px solid rgba(0, 255, 204, 0.4)',
              objectFit: 'cover',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '1px',
              right: '1px',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: 'var(--wa-accent-green)',
              border: '2px solid var(--wa-bg-deep)',
            }}
          />
        </div>
      </div>
    </nav>
  );
};

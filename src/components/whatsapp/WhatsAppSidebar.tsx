import React, { useState } from 'react';
import {
  Search,
  MoreVertical,
  Plus,
  FolderGit2,
  Terminal,
  Shield,
  Radio,
  ChevronDown,
  ChevronRight,
  GitBranch,
  GitPullRequest,
  CheckCheck,
  Pin,
  X,
  Code2,
  Filter,
  Sparkles,
  Layers,
  Cpu,
} from 'lucide-react';
import { Chat, CURRENT_USER } from '../../web-db/store';
import { WorkspaceCategory } from './WorkspaceDock';

interface WhatsAppSidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onOpenNewChat: () => void;
  onOpenCreateVault: () => void;
  onOpenCreateCode: () => void;
  activeCategory?: WorkspaceCategory;
  onSelectCategory?: (category: WorkspaceCategory) => void;
  isMobileHidden?: boolean;
}

export const WhatsAppSidebar: React.FC<WhatsAppSidebarProps> = ({
  chats,
  activeChatId,
  onSelectChat,
  onOpenNewChat,
  onOpenCreateVault,
  onOpenCreateCode,
  activeCategory = 'relays',
  onSelectCategory,
  isMobileHidden = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'repos' | 'relays' | 'webhooks' | 'vaults'>('all');
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);

  // Tree expansion state
  const [isReposOpen, setIsReposOpen] = useState(true);
  const [isRelaysOpen, setIsRelaysOpen] = useState(true);
  const [isWebhooksOpen, setIsWebhooksOpen] = useState(true);

  // Categorize chats
  const repoChats = chats.filter((c) => c.type === 'repo');
  const webhookChats = chats.filter((c) => c.id === 'chat_webhook_ci' || c.name.toLowerCase().includes('webhook'));
  const vaultChats = chats.filter((c) => c.statusIconType === 'vault');
  const relayChats = chats.filter(
    (c) => c.type !== 'repo' && c.id !== 'chat_webhook_ci' && !c.name.toLowerCase().includes('webhook')
  );

  // Filter based on search and active filter / workspace category
  const matchesQuery = (chat: Chat) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      chat.name.toLowerCase().includes(q) ||
      chat.username.toLowerCase().includes(q) ||
      chat.statusText.toLowerCase().includes(q) ||
      (chat.repoTag && chat.repoTag.toLowerCase().includes(q))
    );
  };

  const getLanguageColor = (repoName: string) => {
    const lower = repoName.toLowerCase();
    if (lower.includes('linux') || lower.includes('rust')) return '#dea584'; // Rust
    if (lower.includes('ack') || lower.includes('ts') || lower.includes('script')) return '#3178c6'; // TypeScript
    if (lower.includes('python') || lower.includes('ai')) return '#f1e05a'; // Python
    if (lower.includes('net') || lower.includes('go')) return '#00add8'; // Go
    return '#00ffcc'; // Electric mint default
  };

  const renderChatItem = (chat: Chat, isRepoItem = false) => {
    const isActive = chat.id === activeChatId;
    const langColor = getLanguageColor(chat.name);

    return (
      <div
        key={chat.id}
        onClick={() => onSelectChat(chat.id)}
        className={`wa-chat-row wa-dev-row ${isActive ? 'wa-row-active' : ''}`}
        id={`wa-chat-${chat.id}`}
        style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 14px',
          background: isActive ? 'var(--wa-bg-incoming)' : 'transparent',
          cursor: 'pointer',
          transition: 'all 0.12s ease',
          borderLeft: isActive ? '3px solid var(--wa-accent-green)' : '3px solid transparent',
          position: 'relative',
        }}
      >
        {/* Left: Language indicator dot or Dev Avatar */}
        {isRepoItem ? (
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${langColor}40`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px',
              flexShrink: 0,
              position: 'relative',
            }}
          >
            <FolderGit2 size={18} color={langColor} />
            <div
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: langColor,
                boxShadow: `0 0 6px ${langColor}`,
              }}
            />
          </div>
        ) : (
          <div style={{ position: 'relative', marginRight: '12px', flexShrink: 0 }}>
            <img
              src={chat.avatar}
              alt={chat.name}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: chat.type === 'ai' ? '10px' : '50%',
                objectFit: 'cover',
                border: chat.type === 'ai' ? '1px solid rgba(0, 229, 255, 0.4)' : '1px solid rgba(255,255,255,0.08)',
              }}
            />
            {chat.isOnline && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '1px',
                  right: '1px',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: 'var(--wa-accent-green)',
                  border: '2px solid var(--wa-bg-sidebar)',
                }}
              />
            )}
          </div>
        )}

        {/* Info Body */}
        <div
          style={{
            flex: 1,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
            minWidth: 0,
          }}
        >
          {/* Top Line: Name + Badges + Time */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: '3px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
              <span
                style={{
                  color: 'var(--wa-text-primary)',
                  fontSize: isRepoItem ? '14px' : '15px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontFamily: isRepoItem ? 'JetBrains Mono, monospace' : 'Inter, sans-serif',
                }}
              >
                {chat.name}
              </span>

              {chat.statusIconType === 'vault' && (
                <span title="Vault Secret" style={{ display: 'inline-flex' }}>
                  <Shield size={12} color="var(--wa-vault-amber)" />
                </span>
              )}
              {chat.type === 'ai' && (
                <span
                  style={{
                    background: 'rgba(0, 229, 255, 0.15)',
                    color: 'var(--wa-ticks-blue)',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '1px 5px',
                    borderRadius: '4px',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                >
                  AI
                </span>
              )}
            </div>

            <span
              style={{
                fontSize: '11px',
                color: chat.unreadCount > 0 ? 'var(--wa-accent-green)' : 'var(--wa-text-secondary)',
                fontWeight: chat.unreadCount > 0 ? 700 : 400,
                flexShrink: 0,
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              {chat.statusTime}
            </span>
          </div>

          {/* Bottom Line: Repo Tag / Status Preview + Unread Counter */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', minWidth: 0, flex: 1 }}>
              {chat.repoTag ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: 0 }}>
                  <GitBranch size={12} color="var(--wa-ticks-blue)" style={{ flexShrink: 0 }} />
                  <span
                    style={{
                      fontSize: '11.5px',
                      color: 'var(--wa-ticks-blue)',
                      fontFamily: 'JetBrains Mono, monospace',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {chat.repoTag}
                  </span>
                </div>
              ) : (
                <span
                  style={{
                    fontSize: '12.5px',
                    color: 'var(--wa-text-secondary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {chat.statusText}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              {chat.isPinned && <Pin size={12} color="var(--wa-text-secondary)" style={{ transform: 'rotate(45deg)' }} />}
              {chat.unreadCount > 0 && (
                <span
                  style={{
                    background: 'var(--wa-accent-green)',
                    color: 'var(--wa-bg-deep)',
                    fontSize: '11px',
                    fontWeight: 800,
                    height: '18px',
                    minWidth: '18px',
                    padding: '0 5px',
                    borderRadius: '9px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                >
                  {chat.unreadCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <aside
      className={`wa-sidebar-container ${isMobileHidden ? 'wa-hidden-mobile' : ''}`}
      id="whatsapp-sidebar"
      style={{
        width: '100%',
        maxWidth: '380px',
        minWidth: '300px',
        height: '100%',
        background: 'var(--wa-bg-sidebar)',
        borderRight: '1px solid var(--wa-border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      {/* 1. Elite Terminal Header (Mobile & Desktop) */}
      <header
        className="wa-header wa-terminal-header"
        style={{
          height: '56px',
          background: 'var(--wa-bg-header)',
          padding: '0 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          borderBottom: '1px solid var(--wa-border-subtle)',
        }}
      >
        {/* Terminal Breadcrumb Path */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--wa-accent-green)',
              boxShadow: '0 0 8px var(--wa-accent-green)',
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div
              style={{
                color: 'var(--wa-accent-green)',
                fontSize: '13px',
                fontWeight: 700,
                fontFamily: 'JetBrains Mono, monospace',
                letterSpacing: '-0.2px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              WhatsDev ↳ #workspace
            </div>
            <div
              style={{
                color: 'var(--wa-text-secondary)',
                fontSize: '10.5px',
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              branch: main • sync: active
            </div>
          </div>
        </div>

        {/* Fast Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={onOpenCreateCode}
            className="wa-icon-btn"
            title="Create Code Snippet"
            style={{
              background: 'rgba(0, 229, 255, 0.1)',
              border: '1px solid rgba(0, 229, 255, 0.25)',
              color: 'var(--wa-ticks-blue)',
              borderRadius: '6px',
              padding: '6px 8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: 700,
            }}
          >
            <Code2 size={14} />
          </button>

          <button
            type="button"
            onClick={onOpenCreateVault}
            className="wa-icon-btn"
            title="Create .env Vault Secret"
            style={{
              background: 'rgba(255, 184, 0, 0.1)',
              border: '1px solid rgba(255, 184, 0, 0.25)',
              color: 'var(--wa-vault-amber)',
              borderRadius: '6px',
              padding: '6px 8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: 700,
            }}
          >
            <Shield size={14} />
          </button>

          <button
            type="button"
            onClick={onOpenNewChat}
            className="wa-icon-btn"
            title="Add Developer / Channel"
            style={{
              background: 'rgba(0, 255, 204, 0.12)',
              border: '1px solid rgba(0, 255, 204, 0.3)',
              color: 'var(--wa-accent-green)',
              borderRadius: '6px',
              padding: '6px 8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: 700,
            }}
          >
            <Plus size={15} />
          </button>
        </div>
      </header>

      {/* 2. Developer Search & Filter Bar */}
      <div
        style={{
          padding: '8px 12px 6px 12px',
          background: 'var(--wa-bg-sidebar)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          borderBottom: '1px solid var(--wa-border-subtle)',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            height: '34px',
            background: 'var(--wa-bg-input)',
            borderRadius: '6px',
            border: '1px solid var(--wa-border-subtle)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 10px',
            gap: '8px',
          }}
        >
          <Search size={14} color="var(--wa-text-secondary)" />
          <input
            type="text"
            placeholder="Filter repos, channels, or devs... (Ctrl+K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--wa-text-primary)',
              fontSize: '12.5px',
              fontFamily: 'Inter, sans-serif',
            }}
          />
          {searchQuery && (
            <X size={14} color="var(--wa-text-secondary)" style={{ cursor: 'pointer' }} onClick={() => setSearchQuery('')} />
          )}
        </div>

        {/* Filter Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
          {[
            { id: 'all', label: 'All' },
            { id: 'repos', label: 'Repos' },
            { id: 'relays', label: 'Relays' },
            { id: 'webhooks', label: 'Webhooks' },
            { id: 'vaults', label: 'Vaults' },
          ].map((chip) => {
            const isActive = activeFilter === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setActiveFilter(chip.id as any)}
                style={{
                  background: isActive ? 'rgba(0, 255, 204, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                  color: isActive ? 'var(--wa-accent-green)' : 'var(--wa-text-secondary)',
                  border: isActive ? '1px solid rgba(0, 255, 204, 0.4)' : '1px solid transparent',
                  borderRadius: '12px',
                  padding: '3px 10px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Collapsible Workspace Repository Tree View */}
      <div
        className="wa-chat-list wa-dev-tree"
        style={{
          flex: 1,
          overflowY: 'auto',
          background: 'var(--wa-bg-sidebar)',
          paddingBottom: '60px',
        }}
      >
        {/* SECTION: REPOSITORIES */}
        {(activeFilter === 'all' || activeFilter === 'repos') && (
          <div style={{ marginBottom: '8px' }}>
            <div
              onClick={() => setIsReposOpen(!isReposOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px 6px 14px',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isReposOpen ? <ChevronDown size={14} color="var(--wa-text-secondary)" /> : <ChevronRight size={14} color="var(--wa-text-secondary)" />}
                <span
                  style={{
                    color: 'var(--wa-text-secondary)',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                >
                  REPOSITORIES
                </span>
              </div>
              <span
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: 'var(--wa-text-secondary)',
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: '8px',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                {repoChats.length}
              </span>
            </div>

            {isReposOpen && (
              <div>
                {repoChats.filter(matchesQuery).map((chat) => renderChatItem(chat, true))}
              </div>
            )}
          </div>
        )}

        {/* SECTION: DEV CHANNELS & RELAYS */}
        {(activeFilter === 'all' || activeFilter === 'relays' || activeFilter === 'vaults') && (
          <div style={{ marginBottom: '8px' }}>
            <div
              onClick={() => setIsRelaysOpen(!isRelaysOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px 6px 14px',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isRelaysOpen ? <ChevronDown size={14} color="var(--wa-text-secondary)" /> : <ChevronRight size={14} color="var(--wa-text-secondary)" />}
                <span
                  style={{
                    color: 'var(--wa-text-secondary)',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                >
                  DEV RELAYS &amp; CHANNELS
                </span>
              </div>
              <span
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: 'var(--wa-text-secondary)',
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: '8px',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                {relayChats.length}
              </span>
            </div>

            {isRelaysOpen && (
              <div>
                {relayChats
                  .filter(matchesQuery)
                  .filter((chat) => (activeFilter === 'vaults' ? chat.statusIconType === 'vault' : true))
                  .map((chat) => renderChatItem(chat, false))}
              </div>
            )}
          </div>
        )}

        {/* SECTION: CI/CD WEBHOOK PIPELINES */}
        {(activeFilter === 'all' || activeFilter === 'webhooks') && (
          <div style={{ marginBottom: '8px' }}>
            <div
              onClick={() => setIsWebhooksOpen(!isWebhooksOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px 6px 14px',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isWebhooksOpen ? <ChevronDown size={14} color="var(--wa-text-secondary)" /> : <ChevronRight size={14} color="var(--wa-text-secondary)" />}
                <span
                  style={{
                    color: 'var(--wa-text-secondary)',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                >
                  CI/CD WEBHOOKS
                </span>
              </div>
              <span
                style={{
                  background: 'rgba(0, 255, 204, 0.1)',
                  color: 'var(--wa-accent-green)',
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: '8px',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                LIVE
              </span>
            </div>

            {isWebhooksOpen && (
              <div>
                {webhookChats.filter(matchesQuery).map((chat) => renderChatItem(chat, false))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Mobile Execution Navigation Rail (Pinned to Bottom) */}
      <nav
        className="wa-mobile-nav-rail"
        id="mobile-execution-rail"
        aria-label="Mobile Navigation"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '56px',
          background: 'var(--wa-bg-header)',
          borderTop: '1px solid var(--wa-border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          zIndex: 30,
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <button
          type="button"
          onClick={() => {
            setActiveFilter('relays');
            if (onSelectCategory) onSelectCategory('relays');
          }}
          className={`wa-mobile-rail-item ${activeFilter === 'relays' || activeCategory === 'relays' ? 'active' : ''}`}
          style={{
            flex: 1,
            height: '100%',
            background: 'transparent',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            color: activeFilter === 'relays' ? 'var(--wa-accent-green)' : 'var(--wa-text-secondary)',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 600,
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          <Terminal size={18} />
          <span>Relays</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveFilter('repos');
            if (onSelectCategory) onSelectCategory('repos');
          }}
          className={`wa-mobile-rail-item ${activeFilter === 'repos' || activeCategory === 'repos' ? 'active' : ''}`}
          style={{
            flex: 1,
            height: '100%',
            background: 'transparent',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            color: activeFilter === 'repos' ? 'var(--wa-accent-green)' : 'var(--wa-text-secondary)',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 600,
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          <FolderGit2 size={18} />
          <span>Repos</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveFilter('webhooks');
            if (onSelectCategory) onSelectCategory('webhooks');
          }}
          className={`wa-mobile-rail-item ${activeFilter === 'webhooks' || activeCategory === 'webhooks' ? 'active' : ''}`}
          style={{
            flex: 1,
            height: '100%',
            background: 'transparent',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            color: activeFilter === 'webhooks' ? 'var(--wa-accent-green)' : 'var(--wa-text-secondary)',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 600,
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          <Radio size={18} />
          <span>Webhooks</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveFilter('vaults');
            if (onSelectCategory) onSelectCategory('vault');
          }}
          className={`wa-mobile-rail-item ${activeFilter === 'vaults' || activeCategory === 'vault' ? 'active' : ''}`}
          style={{
            flex: 1,
            height: '100%',
            background: 'transparent',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            color: activeFilter === 'vaults' ? 'var(--wa-accent-green)' : 'var(--wa-text-secondary)',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 600,
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          <Shield size={18} />
          <span>Vault</span>
        </button>
      </nav>

      {/* Floating Action Button */}
      <button
        type="button"
        className="wa-mobile-fab"
        onClick={onOpenNewChat}
        title="Start new conversation or channel"
        id="btn-mobile-fab-new-chat"
        style={{
          position: 'absolute',
          bottom: '72px',
          right: '18px',
          width: '50px',
          height: '50px',
          borderRadius: '16px',
          background: 'var(--wa-accent-green)',
          color: 'var(--wa-bg-deep)',
          border: 'none',
          boxShadow: '0 4px 16px rgba(0, 255, 204, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 35,
        }}
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>
    </aside>
  );
};

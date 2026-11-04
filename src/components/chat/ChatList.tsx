import React, { useState } from 'react';
import { Search, Plus, Bell, Users, MessageSquarePlus } from 'lucide-react';
import { Chat, webStore, CURRENT_USER } from '../../web-db/store';
import { BottomNav, NavTab } from './BottomNav';
import { EmptyChatList } from './EmptyChatList';
import { ChatListSkeleton } from './ChatListSkeleton';
import { ReviewsInbox } from './ReviewsInbox';
import { FEATURES } from '../../config/features';

export interface ChatListProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onOpenNewChat: () => void;
  onOpenCreateGroup?: () => void;
  onOpenNotifications?: () => void;
  onOpenSearch?: () => void;
  onOpenSettings?: () => void;
  onOpenCreateVault?: () => void;
  onOpenCreateCode?: () => void;
  activeCategory?: string;
  onSelectCategory?: (category: any) => void;
  isMobileHidden?: boolean;
  isLoading?: boolean;
  unreadNotificationsCount?: number;
}

export function getInitials(name: string): string {
  const trimmed = name.trim();
  // Check for specific mockup names
  if (trimmed.includes('ProjectACK') || trimmed.includes('kingenious0')) return 'PA';
  if (trimmed.toLowerCase().includes('vercel')) return 'CI';
  if (trimmed.toLowerCase() === 'hardik') return 'HK';
  if (trimmed.toLowerCase().includes('copilot')) return 'AI';
  if (trimmed.toLowerCase().includes('kernel') || trimmed.toLowerCase().includes('linux')) return 'LK';

  if (trimmed.includes('/')) {
    const parts = trimmed.split('/');
    const repo = parts[parts.length - 1].trim();
    const cleanRepo = repo.replace(/[^a-zA-Z]/g, '');
    if (cleanRepo.length >= 2) return cleanRepo.slice(0, 2).toUpperCase();
    return repo.slice(0, 2).toUpperCase();
  }

  const clean = trimmed.replace(/[^a-zA-Z0-9\s]/g, '').trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  if (words.length === 1 && words[0].length >= 2) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return 'AK';
}

export const ChatList: React.FC<ChatListProps> = ({
  chats,
  activeChatId,
  onSelectChat,
  onOpenNewChat,
  onOpenCreateGroup,
  onOpenNotifications,
  onOpenSearch,
  onOpenSettings,
  onOpenCreateVault,
  isMobileHidden = false,
  isLoading = false,
  unreadNotificationsCount = 0,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<NavTab>('chats');
  const [showComposeMenu, setShowComposeMenu] = useState(false);

  // Filter based on active tab and search query
  const filteredChats = chats.filter((chat) => {
    // CI Feed flag check
    if (!FEATURES.ciFeed && (chat.id === 'chat_webhook_ci' || chat.username === 'vercel_builds')) {
      return false;
    }

    // Tab filtering
    if (activeTab === 'reviews') {
      const isReviewChat = chat.type === 'repo' || chat.statusText.toLowerCase().includes('pr') || chat.statusText.toLowerCase().includes('diff');
      if (!isReviewChat) return false;
    } else if (activeTab === 'vault') {
      const isVaultChat = chat.statusIconType === 'vault' || chat.statusDot === 'warning' || chat.statusText.toLowerCase().includes('secret');
      if (!isVaultChat) return false;
    }

    // Search query matching
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      chat.name.toLowerCase().includes(q) ||
      chat.username.toLowerCase().includes(q) ||
      chat.statusText.toLowerCase().includes(q) ||
      (chat.repoTag && chat.repoTag.toLowerCase().includes(q))
    );
  });

  const totalUnreadCount = chats.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  const handleTabSelect = (tab: NavTab) => {
    setActiveTab(tab);
    if (tab === 'vault' && onOpenCreateVault) {
      // If user clicks vault tab and there are no secret chats, optionally trigger create vault
    }
  };

  return (
    <aside
      className={`ack-chatlist ${isMobileHidden ? 'ack-hidden-mobile' : ''}`}
      style={{
        display: isMobileHidden ? 'none' : 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        background: 'var(--ack-bg)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Top Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px 8px 20px',
          paddingTop: 'calc(16px + env(safe-area-inset-top, 0px))',
          userSelect: 'none',
        }}
      >
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 700,
            color: 'var(--ack-text)',
            fontFamily: 'Inter, sans-serif',
            letterSpacing: '-0.03em',
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          Ack
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
          {onOpenNotifications && (
            <button
              type="button"
              id="btn-open-notifications"
              onClick={onOpenNotifications}
              aria-label="Notifications"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'var(--ack-surface, #131316)',
                border: '1px solid var(--ack-border, #26262B)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: unreadNotificationsCount > 0 ? '#8B7CFF' : 'var(--ack-muted, #71717A)',
                position: 'relative',
              }}
              title="Notifications"
            >
              <Bell size={18} />
              {unreadNotificationsCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: '#8B7CFF',
                  }}
                />
              )}
            </button>
          )}

          {onOpenSettings && (
            <button
              type="button"
              id="btn-open-settings"
              onClick={onOpenSettings}
              aria-label="User Settings"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'var(--ack-avatar-bg, #1A1A1F)',
                border: '1px solid var(--ack-border, #26262B)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--ack-text, #ECECEF)',
                fontSize: '13px',
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
                transition: 'border-color 150ms ease, transform 150ms ease',
                overflow: 'hidden',
                padding: 0,
              }}
              title={`Settings (@${CURRENT_USER.username})`}
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
            </button>
          )}

          {/* Compose Button with Dropdown Options */}
          <button
            type="button"
            id="btn-compose-chat"
            onClick={() => {
              if (onOpenCreateGroup) {
                setShowComposeMenu(!showComposeMenu);
              } else {
                onOpenNewChat();
              }
            }}
            aria-label="New chat or compose"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-button)',
              background: 'var(--ack-accent)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#0B0B0D',
              boxShadow: '0 2px 8px rgba(139, 124, 255, 0.25)',
              transition: 'transform 150ms ease, opacity 150ms ease',
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.96)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <Plus size={20} strokeWidth={2.4} />
          </button>

          {/* Compose Popup Menu */}
          {showComposeMenu && (
            <div
              style={{
                position: 'absolute',
                top: '48px',
                right: '0',
                backgroundColor: '#18181C',
                border: '1px solid #26262B',
                borderRadius: '12px',
                padding: '6px',
                zIndex: 200,
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                minWidth: '150px',
              }}
            >
              <button
                onClick={() => {
                  setShowComposeMenu(false);
                  onOpenNewChat();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: 'none',
                  border: 'none',
                  color: '#F4F4F5',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <MessageSquarePlus size={16} color="#8B7CFF" />
                <span>New chat</span>
              </button>

              {onOpenCreateGroup && (
                <button
                  onClick={() => {
                    setShowComposeMenu(false);
                    onOpenCreateGroup();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'none',
                    border: 'none',
                    color: '#F4F4F5',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <Users size={16} color="#8B7CFF" />
                  <span>New group</span>
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Reviews Tab View */}
      {activeTab === 'reviews' ? (
        <div style={{ flex: 1, minHeight: 0 }}>
          <ReviewsInbox
            reviews={webStore.getReviews()}
            onSelectPR={() => onSelectChat('chat_project_ack')}
          />
        </div>
      ) : (
        <>
          {/* Search Input Bar */}
          <div
            style={{
              padding: '8px 20px 12px 20px',
            }}
          >
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                height: '44px',
                background: 'var(--ack-surface)',
                border: '1px solid var(--ack-border)',
                borderRadius: 'var(--radius-button)',
                transition: 'border-color 150ms ease',
                cursor: onOpenSearch ? 'pointer' : 'text',
              }}
              onClick={() => {
                if (onOpenSearch) onOpenSearch();
              }}
            >
              <Search
                size={18}
                strokeWidth={1.75}
                style={{
                  position: 'absolute',
                  left: '14px',
                  color: 'var(--ack-muted)',
                  pointerEvents: 'none',
                  flexShrink: 0,
                }}
              />
              <input
                type="text"
                id="ack-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                readOnly={!!onOpenSearch}
                placeholder="Search people, repos, secrets"
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  padding: '0 14px 0 42px',
                  color: 'var(--ack-text)',
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif',
                  cursor: onOpenSearch ? 'pointer' : 'text',
                }}
              />
            </div>
          </div>

          {/* Chat Rows Stream */}
          <div
            className="ack-chat-scroll"
            style={{
              flex: 1,
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {isLoading ? (
              <ChatListSkeleton />
            ) : chats.length === 0 && !searchQuery ? (
              <EmptyChatList
                onStartChat={onOpenNewChat}
                onConnectRepo={onOpenCreateGroup || onOpenNewChat}
              />
            ) : filteredChats.length === 0 ? (
              <div
                style={{
                  padding: '48px 24px',
                  textAlign: 'center',
                  color: 'var(--ack-muted)',
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {searchQuery ? `No results for "${searchQuery}"` : 'No conversations in this tab.'}
              </div>
            ) : (
              filteredChats.map((chat) => {
            const isActive = chat.id === activeChatId;
            const isRepo = chat.type === 'repo' || chat.name.includes('/');
            const initials = getInitials(chat.name);

            return (
              <div
                key={chat.id}
                id={`chat-row-${chat.id}`}
                onClick={() => onSelectChat(chat.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onSelectChat(chat.id);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 20px',
                  minHeight: '68px',
                  background: isActive ? 'var(--ack-surface)' : 'transparent',
                  borderBottom: 'none',
                  cursor: 'pointer',
                  transition: 'background 150ms ease',
                  userSelect: 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'var(--ack-surface-2)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'transparent';
                }}
              >
                {/* 44px Initials Circular Avatar */}
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'var(--ack-avatar-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginRight: '14px',
                    color: 'var(--ack-text)',
                    fontFamily: isRepo ? 'JetBrains Mono, monospace' : 'Inter, sans-serif',
                    fontSize: '14px',
                    fontWeight: 600,
                    letterSpacing: '0.02em',
                  }}
                >
                  {initials}
                </div>

                {/* Name & Preview Column */}
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: '3px',
                  }}
                >
                  <div
                    style={{
                      fontSize: isRepo ? '14px' : '15px',
                      fontWeight: 600,
                      color: 'var(--ack-text)',
                      fontFamily: isRepo ? 'JetBrains Mono, monospace' : 'Inter, sans-serif',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {chat.name}
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      color: 'var(--ack-muted)',
                      fontFamily: 'Inter, sans-serif',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {chat.statusText}
                  </div>
                </div>

                {/* Right Meta Column: Time & Status Badge/Dot */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    gap: '6px',
                    marginLeft: '12px',
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: '12px',
                      color: 'var(--ack-muted)',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    {chat.statusTime}
                  </span>

                  {/* Indicator: Accent Unread Badge OR Small Status Dot */}
                  {chat.unreadCount > 0 ? (
                    <span
                      style={{
                        background: 'var(--ack-accent)',
                        color: '#0B0B0D',
                        fontSize: '11px',
                        fontWeight: 700,
                        fontFamily: 'Inter, sans-serif',
                        minWidth: '18px',
                        height: '18px',
                        borderRadius: '9999px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 5px',
                      }}
                    >
                      {chat.unreadCount}
                    </span>
                  ) : chat.statusDot === 'warning' ? (
                    <span
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        background: 'var(--ack-warning)',
                        display: 'inline-block',
                      }}
                      title="Unread secret"
                    />
                  ) : chat.statusDot === 'success' ? (
                    <span
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        background: 'var(--ack-success)',
                        display: 'inline-block',
                      }}
                      title="CI pass"
                    />
                  ) : (
                    <div style={{ height: '18px' }} />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
        </>
      )}

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={handleTabSelect}
        chatsUnreadCount={totalUnreadCount}
      />
    </aside>
  );
};

export const WhatsAppSidebar = ChatList;

import React, { useState, useRef } from 'react';
import {
  Search,
  Plus,
  Bell,
  Users,
  MessageSquarePlus,
  Pin,
  PinOff,
  CheckCheck,
  Mail,
  Trash2,
  LogOut,
  RotateCcw,
  ChevronDown,
  Info,
} from 'lucide-react';
import { Chat, webStore, CURRENT_USER, isMockChat } from '../../web-db/store';
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
  onDeleteChat?: (chatId: string) => void;
  onClearChat?: (chatId: string) => void;
  onLeaveGroup?: (chatId: string) => void;
  onOpenGroupInfo?: (chat: Chat) => void;
  activeCategory?: string;
  onSelectCategory?: (category: any) => void;
  isMobileHidden?: boolean;
  isLoading?: boolean;
  unreadNotificationsCount?: number;
}

import { getInitials } from '../../utils/avatar';
export { getInitials };


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
  onDeleteChat,
  onClearChat,
  onLeaveGroup,
  onOpenGroupInfo,
  isMobileHidden = false,
  isLoading = false,
  unreadNotificationsCount = 0,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<NavTab>('chats');
  const [showComposeMenu, setShowComposeMenu] = useState(false);
  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);
  const [contextMenuChat, setContextMenuChat] = useState<Chat | null>(null);
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    type: 'delete_chat' | 'delete_group' | 'exit_group' | 'clear_chat';
    chat: Chat;
  } | null>(null);
  const touchTimerRef = useRef<any>(null);

  // Filter based on active tab and search query
  const filteredChats = chats.filter((chat) => {
    if (isMockChat(chat)) return false;
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
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setContextMenuChat(chat);
                  const x = Math.min(e.clientX, window.innerWidth - 210);
                  const y = Math.min(e.clientY, window.innerHeight - 260);
                  setContextMenuPos({ x, y });
                }}
                onTouchStart={(e) => {
                  const touch = e.touches[0];
                  touchTimerRef.current = setTimeout(() => {
                    if (navigator.vibrate) navigator.vibrate(40);
                    setContextMenuChat(chat);
                    const x = Math.min(touch.clientX, window.innerWidth - 210);
                    const y = Math.min(touch.clientY, window.innerHeight - 260);
                    setContextMenuPos({ x, y });
                  }, 450);
                }}
                onTouchEnd={() => {
                  if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
                }}
                onTouchMove={() => {
                  if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
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
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  setHoveredChatId(chat.id);
                  if (!isActive) e.currentTarget.style.background = 'var(--ack-surface-2)';
                }}
                onMouseLeave={(e) => {
                  setHoveredChatId(null);
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
                  {(() => {
                    const isTyping = Boolean(webStore.getTypingUser(chat.id));
                    return (
                      <div
                        style={{
                          fontSize: '13px',
                          color: isTyping ? 'var(--ack-success, #22C55E)' : 'var(--ack-muted)',
                          fontFamily: 'Inter, sans-serif',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          fontWeight: isTyping ? 600 : 400,
                          fontStyle: isTyping ? 'italic' : 'normal',
                        }}
                      >
                        {isTyping ? 'typing...' : chat.statusText}
                      </div>
                    );
                  })()}
                </div>

                {/* Right Meta Column: Time & Status Badge/Dot & Hover Chevron */}
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span
                      style={{
                        fontSize: '12px',
                        color: chat.unreadCount > 0 ? 'var(--ack-accent, #6366F1)' : 'var(--ack-muted)',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: chat.unreadCount > 0 ? 600 : 400,
                      }}
                    >
                      {chat.statusTime}
                    </span>
                    {chat.isPinned && (
                      <Pin size={12} style={{ color: 'var(--ack-muted)', transform: 'rotate(45deg)' }} />
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {/* Indicator: Accent Unread Badge OR Small Status Dot */}
                    {!isActive && chat.unreadCount > 0 ? (
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
                    ) : null}

                    {/* WhatsApp Hover Dropdown Trigger Button */}
                    <button
                      type="button"
                      title="Chat options"
                      aria-label="Chat options"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        const rect = e.currentTarget.getBoundingClientRect();
                        setContextMenuChat(chat);
                        setContextMenuPos({
                          x: Math.min(rect.right - 180, window.innerWidth - 210),
                          y: Math.min(rect.bottom + 4, window.innerHeight - 260),
                        });
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--ack-muted)',
                        cursor: 'pointer',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '4px',
                        opacity: hoveredChatId === chat.id || isActive ? 1 : 0,
                        transition: 'opacity 150ms ease, color 150ms ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ack-text)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ack-muted)')}
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
        </>
      )}

      {/* WhatsApp Context Menu Dropdown */}
      {contextMenuChat && contextMenuPos && (
        <>
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9998,
              background: 'transparent',
            }}
            onClick={() => {
              setContextMenuChat(null);
              setContextMenuPos(null);
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMenuChat(null);
              setContextMenuPos(null);
            }}
          />
          <div
            style={{
              position: 'fixed',
              top: contextMenuPos.y,
              left: contextMenuPos.x,
              zIndex: 9999,
              minWidth: '190px',
              backgroundColor: '#1E1E22',
              border: '1px solid #2E2E34',
              borderRadius: '12px',
              padding: '6px',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.65)',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Pin / Unpin */}
            <button
              type="button"
              onClick={() => {
                webStore.togglePinChat(contextMenuChat.id);
                setContextMenuChat(null);
                setContextMenuPos(null);
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                background: 'transparent',
                border: 'none',
                color: '#E4E4E7',
                fontSize: '13px',
                borderRadius: '8px',
                textAlign: 'left',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                transition: 'background-color 120ms ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#27272A')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              {contextMenuChat.isPinned ? <PinOff size={15} /> : <Pin size={15} />}
              <span>{contextMenuChat.isPinned ? 'Unpin chat' : 'Pin chat'}</span>
            </button>

            {/* Mark as unread / read */}
            <button
              type="button"
              onClick={() => {
                webStore.toggleMarkAsUnread(contextMenuChat.id);
                setContextMenuChat(null);
                setContextMenuPos(null);
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                background: 'transparent',
                border: 'none',
                color: '#E4E4E7',
                fontSize: '13px',
                borderRadius: '8px',
                textAlign: 'left',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                transition: 'background-color 120ms ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#27272A')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              {(contextMenuChat.unreadCount || 0) > 0 ? <CheckCheck size={15} /> : <Mail size={15} />}
              <span>{(contextMenuChat.unreadCount || 0) > 0 ? 'Mark as read' : 'Mark as unread'}</span>
            </button>

            {/* Group Info (if group) */}
            {contextMenuChat.type === 'group' && onOpenGroupInfo && (
              <button
                type="button"
                onClick={() => {
                  const grp = contextMenuChat;
                  setContextMenuChat(null);
                  setContextMenuPos(null);
                  onOpenGroupInfo(grp);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  background: 'transparent',
                  border: 'none',
                  color: '#E4E4E7',
                  fontSize: '13px',
                  borderRadius: '8px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'background-color 120ms ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#27272A')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Info size={15} />
                <span>Group info</span>
              </button>
            )}

            {/* Clear messages */}
            <button
              type="button"
              onClick={() => {
                const target = contextMenuChat;
                setContextMenuChat(null);
                setContextMenuPos(null);
                setConfirmModal({ type: 'clear_chat', chat: target });
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                background: 'transparent',
                border: 'none',
                color: '#E4E4E7',
                fontSize: '13px',
                borderRadius: '8px',
                textAlign: 'left',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                transition: 'background-color 120ms ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#27272A')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <RotateCcw size={15} />
              <span>Clear messages</span>
            </button>

            <div style={{ height: '1px', background: '#2E2E34', margin: '4px 0' }} />

            {/* Exit group / Delete chat / Delete group */}
            {contextMenuChat.type === 'group' ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    const target = contextMenuChat;
                    setContextMenuChat(null);
                    setContextMenuPos(null);
                    setConfirmModal({ type: 'exit_group', chat: target });
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    background: 'transparent',
                    border: 'none',
                    color: '#F87171',
                    fontSize: '13px',
                    borderRadius: '8px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                    transition: 'background-color 120ms ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(248, 113, 113, 0.12)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <LogOut size={15} />
                  <span>Exit group</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const target = contextMenuChat;
                    setContextMenuChat(null);
                    setContextMenuPos(null);
                    setConfirmModal({ type: 'delete_group', chat: target });
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    background: 'transparent',
                    border: 'none',
                    color: '#EF4444',
                    fontSize: '13px',
                    borderRadius: '8px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    transition: 'background-color 120ms ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <Trash2 size={15} />
                  <span>Delete group</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  const target = contextMenuChat;
                  setContextMenuChat(null);
                  setContextMenuPos(null);
                  setConfirmModal({ type: 'delete_chat', chat: target });
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  background: 'transparent',
                  border: 'none',
                  color: '#EF4444',
                  fontSize: '13px',
                  borderRadius: '8px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  transition: 'background-color 120ms ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Trash2 size={15} />
                <span>Delete chat</span>
              </button>
            )}
          </div>
        </>
      )}

      {/* WhatsApp Deletion Confirmation Modal */}
      {confirmModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            backgroundColor: 'rgba(11, 11, 13, 0.8)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setConfirmModal(null)}
        >
          <div
            style={{
              backgroundColor: '#18181B',
              border: '1px solid #27272A',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '420px',
              width: '100%',
              boxShadow: '0 24px 50px rgba(0, 0, 0, 0.75)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                margin: '0 0 12px 0',
                fontSize: '17px',
                fontWeight: 600,
                color: '#F4F4F5',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {confirmModal.type === 'delete_chat'
                ? 'Delete this chat?'
                : confirmModal.type === 'delete_group'
                ? `Delete "${confirmModal.chat.name}" group?`
                : confirmModal.type === 'exit_group'
                ? `Exit "${confirmModal.chat.name}" group?`
                : 'Clear this chat?'}
            </h3>

            <p
              style={{
                margin: '0 0 24px 0',
                fontSize: '13.5px',
                color: '#A1A1AA',
                lineHeight: 1.5,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {confirmModal.type === 'delete_chat'
                ? 'Messages will be removed from this device.'
                : confirmModal.type === 'delete_group'
                ? 'Messages will be removed from this device.'
                : confirmModal.type === 'exit_group'
                ? 'You will no longer be able to send or receive messages in this group.'
                : 'All messages in this conversation will be permanently deleted from this device.'}
            </p>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
              }}
            >
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                style={{
                  padding: '9px 18px',
                  borderRadius: '24px',
                  backgroundColor: 'transparent',
                  border: '1px solid #3F3F46',
                  color: '#E4E4E7',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'background-color 150ms ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#27272A')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  const chatId = confirmModal.chat.id;
                  const actionType = confirmModal.type;
                  setConfirmModal(null);

                  if (actionType === 'delete_chat' || actionType === 'delete_group') {
                    if (onDeleteChat) {
                      onDeleteChat(chatId);
                    } else {
                      webStore.deleteChat(chatId);
                    }
                  } else if (actionType === 'exit_group') {
                    if (onLeaveGroup) {
                      onLeaveGroup(chatId);
                    } else {
                      webStore.leaveGroup(chatId);
                    }
                  } else if (actionType === 'clear_chat') {
                    if (onClearChat) {
                      onClearChat(chatId);
                    } else {
                      webStore.clearChatMessages(chatId);
                    }
                  }
                }}
                style={{
                  padding: '9px 20px',
                  borderRadius: '24px',
                  backgroundColor: '#EF4444',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.35)',
                  transition: 'background-color 150ms ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#DC2626')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#EF4444')}
              >
                {confirmModal.type === 'delete_chat'
                  ? 'Delete chat'
                  : confirmModal.type === 'delete_group'
                  ? 'Delete group'
                  : confirmModal.type === 'exit_group'
                  ? 'Exit group'
                  : 'Clear chat'}
              </button>
            </div>
          </div>
        </div>
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

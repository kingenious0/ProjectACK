import React, { useState } from 'react';
import {
  Search,
  MoreVertical,
  MessageSquarePlus,
  CircleDashed,
  Users2,
  Filter,
  CheckCheck,
  Check,
  Pin,
  X,
  Code,
  Shield,
  GitBranch,
} from 'lucide-react';
import { Chat, CURRENT_USER } from '../../web-db/store';

interface WhatsAppSidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onOpenNewChat: () => void;
  onOpenCreateVault: () => void;
  onOpenCreateCode: () => void;
  isMobileHidden?: boolean;
}

export const WhatsAppSidebar: React.FC<WhatsAppSidebarProps> = ({
  chats,
  activeChatId,
  onSelectChat,
  onOpenNewChat,
  onOpenCreateVault,
  onOpenCreateCode,
  isMobileHidden = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);

  const filteredChats = chats.filter((chat) => {
    const matchesSearch =
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.statusText.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (showUnreadOnly) return chat.unreadCount > 0;
    return true;
  });

  return (
    <aside
      className={`wa-sidebar-container ${isMobileHidden ? 'wa-hidden-mobile' : ''}`}
      id="whatsapp-sidebar"
      style={{
        width: '100%',
        maxWidth: '420px',
        minWidth: '320px',
        height: '100%',
        background: '#111B21',
        borderRight: '1px solid #222D34',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      {/* 1. WhatsApp Top App Bar */}
      <header
        className="wa-header"
        style={{
          height: '59px',
          background: '#202C33',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        {/* User Profile Avatar */}
        <div
          style={{ cursor: 'pointer', position: 'relative' }}
          onClick={onOpenNewChat}
          title="Your Profile"
        >
          <img
            src={CURRENT_USER.avatar}
            alt={CURRENT_USER.name}
            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
          />
        </div>

        {/* Action Icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', color: '#AEBAC1' }}>
          <button
            type="button"
            className="wa-icon-btn"
            title="Communities"
            style={{ background: 'transparent', border: 'none', color: '#AEBAC1', cursor: 'pointer', padding: '6px' }}
          >
            <Users2 size={20} />
          </button>

          <button
            type="button"
            className="wa-icon-btn"
            title="Status / Stories"
            style={{ background: 'transparent', border: 'none', color: '#AEBAC1', cursor: 'pointer', padding: '6px' }}
          >
            <CircleDashed size={20} />
          </button>

          <button
            type="button"
            onClick={onOpenNewChat}
            className="wa-icon-btn"
            title="New Chat / Contact"
            id="wa-btn-new-chat"
            style={{ background: 'transparent', border: 'none', color: '#AEBAC1', cursor: 'pointer', padding: '6px' }}
          >
            <MessageSquarePlus size={20} />
          </button>

          {/* 3-dots Menu */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowMenuDropdown(!showMenuDropdown)}
              className="wa-icon-btn"
              title="Menu"
              id="wa-btn-menu"
              style={{ background: 'transparent', border: 'none', color: '#AEBAC1', cursor: 'pointer', padding: '6px' }}
            >
              <MoreVertical size={20} />
            </button>

            {showMenuDropdown && (
              <div
                className="wa-dropdown-menu"
                style={{
                  position: 'absolute',
                  top: '38px',
                  right: 0,
                  width: '180px',
                  background: '#233138',
                  borderRadius: '6px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  padding: '6px 0',
                  zIndex: 100,
                }}
              >
                <div
                  className="wa-dropdown-item"
                  onClick={() => {
                    setShowMenuDropdown(false);
                    onOpenNewChat();
                  }}
                  style={{ padding: '8px 16px', color: '#E9EDEF', fontSize: '14px', cursor: 'pointer' }}
                >
                  New Contact
                </div>
                <div
                  className="wa-dropdown-item"
                  onClick={() => {
                    setShowMenuDropdown(false);
                    onOpenCreateCode();
                  }}
                  style={{ padding: '8px 16px', color: '#E9EDEF', fontSize: '14px', cursor: 'pointer' }}
                >
                  New Code Snippet
                </div>
                <div
                  className="wa-dropdown-item"
                  onClick={() => {
                    setShowMenuDropdown(false);
                    onOpenCreateVault();
                  }}
                  style={{ padding: '8px 16px', color: '#E9EDEF', fontSize: '14px', cursor: 'pointer' }}
                >
                  New .env Vault Key
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. Search & Filter Bar */}
      <div
        className="wa-search-container"
        style={{
          padding: '7px 12px',
          background: '#111B21',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexShrink: 0,
        }}
      >
        <div
          className="wa-search-pill"
          style={{
            flex: 1,
            height: '35px',
            background: '#202C33',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            padding: '0 12px',
            gap: '12px',
          }}
        >
          <Search size={16} color="#8696A0" />
          <input
            type="text"
            placeholder="Search or start new chat"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#E9EDEF',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
            }}
          />
          {searchQuery && (
            <X size={15} color="#8696A0" style={{ cursor: 'pointer' }} onClick={() => setSearchQuery('')} />
          )}
        </div>

        {/* Unread Filter Toggle */}
        <button
          type="button"
          onClick={() => setShowUnreadOnly(!showUnreadOnly)}
          title="Filter unread chats"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: showUnreadOnly ? 'rgba(0, 168, 132, 0.2)' : 'transparent',
            border: 'none',
            color: showUnreadOnly ? '#00A884' : '#8696A0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Filter size={18} />
        </button>
      </div>

      {/* 3. Chat List Stream */}
      <div
        className="wa-chat-list"
        style={{
          flex: 1,
          overflowY: 'auto',
          background: '#111B21',
        }}
      >
        {filteredChats.map((chat) => {
          const isActive = chat.id === activeChatId;

          return (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`wa-chat-row ${isActive ? 'wa-row-active' : ''}`}
              id={`wa-chat-${chat.id}`}
              style={{
                height: '72px',
                display: 'flex',
                alignItems: 'center',
                padding: '0 16px',
                background: isActive ? '#2A3942' : 'transparent',
                cursor: 'pointer',
                transition: 'background 0.1s ease',
              }}
            >
              {/* Avatar */}
              <div style={{ position: 'relative', marginRight: '14px', flexShrink: 0 }}>
                <img
                  src={chat.avatar}
                  alt={chat.name}
                  style={{
                    width: '49px',
                    height: '49px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
                {chat.isOnline && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '2px',
                      right: '2px',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: '#00A884',
                      border: '2px solid #111B21',
                    }}
                  />
                )}
              </div>

              {/* Chat Info Body */}
              <div
                style={{
                  flex: 1,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  borderBottom: '1px solid #222D34',
                  minWidth: 0,
                }}
              >
                {/* Top Row: Contact Name + Time */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                    <span
                      style={{
                        color: '#E9EDEF',
                        fontSize: '16px',
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {chat.name}
                    </span>
                    {chat.statusIconType === 'vault' && (
                      <Shield size={13} color="#FFB800" title="Protected Vault" />
                    )}
                    {chat.type === 'repo' && (
                      <GitBranch size={13} color="#58A6FF" title="Repo Link" />
                    )}
                  </div>

                  <span
                    style={{
                      fontSize: '12px',
                      color: chat.unreadCount > 0 ? '#00A884' : '#8696A0',
                      fontWeight: chat.unreadCount > 0 ? 600 : 400,
                      flexShrink: 0,
                    }}
                  >
                    {chat.statusTime}
                  </span>
                </div>

                {/* Bottom Row: Double checks + Last Message + Unread Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: 0, flex: 1 }}>
                    <CheckCheck size={16} color="#53BDEB" style={{ flexShrink: 0 }} />
                    <span
                      style={{
                        fontSize: '14px',
                        color: '#8696A0',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {chat.statusText}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    {chat.isPinned && <Pin size={14} color="#8696A0" style={{ transform: 'rotate(45deg)' }} />}
                    {chat.unreadCount > 0 && (
                      <span
                        style={{
                          background: '#00A884',
                          color: '#0B141A',
                          fontSize: '12px',
                          fontWeight: 700,
                          height: '20px',
                          minWidth: '20px',
                          padding: '0 6px',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
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
        })}
      </div>
    </aside>
  );
};

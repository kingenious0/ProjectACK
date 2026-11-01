import React, { useState } from 'react';
import {
  Search,
  UserPlus,
  MoreHorizontal,
  Camera,
  MessageSquare,
  Edit,
  MapPin,
  Flame,
  Compass,
  Check,
  CheckCheck,
  X,
  Shield,
  GitBranch,
  Filter,
  Lock,
} from 'lucide-react';
import { Chat, SuggestedDev, CURRENT_USER, webStore } from '../web-db/store';

interface SidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onOpenAddFriends: () => void;
  onOpenCreateVault: () => void;
  onOpenCreateCode: () => void;
  onOpenPinSecurity?: () => void;
  isMobileViewHidden?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  chats,
  activeChatId,
  onSelectChat,
  onOpenAddFriends,
  onOpenCreateVault,
  onOpenCreateCode,
  onOpenPinSecurity,
  isMobileViewHidden = false,
}) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'direct' | 'repos' | 'vaults' | 'unread'>('all');
  const [suggestions, setSuggestions] = useState<SuggestedDev[]>(webStore.getSuggestions());
  const [activeTab, setActiveTab] = useState<'map' | 'chat' | 'vault' | 'stories' | 'spotlight'>('chat');

  // Filter chats by search and category
  const filteredChats = chats.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.statusText.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeCategory === 'direct') return c.type === 'dm' || c.type === 'ai';
    if (activeCategory === 'repos') return c.type === 'repo' || c.type === 'group';
    if (activeCategory === 'vaults') return c.statusIconType === 'vault';
    if (activeCategory === 'unread') return c.unreadCount > 0;
    return true;
  });

  const quickAddPreview = suggestions.slice(0, 2);

  const handleQuickAdd = (dev: SuggestedDev) => {
    const newChat = webStore.addFriend(dev);
    setSuggestions(webStore.getSuggestions());
    onSelectChat(newChat.id);
  };

  const handleDismiss = (devId: string) => {
    webStore.dismissSuggestion(devId);
    setSuggestions(webStore.getSuggestions());
  };

  return (
    <aside className={`snap-chat-screen ${isMobileViewHidden ? 'hidden-mobile' : ''}`} id="snap-sidebar">
      {/* Snapchat & E-Chat Header */}
      <header className="snap-header">
        <div className="snap-header-left">
          <div
            className="snap-avatar-btn"
            onClick={onOpenAddFriends}
            title="Profile & Quick Add"
            id="btn-profile-avatar"
          >
            <img src={CURRENT_USER.avatar} alt={CURRENT_USER.name} className="snap-avatar-img" />
          </div>

          <button
            className="snap-icon-circle-btn"
            onClick={() => setSearchOpen(!searchOpen)}
            title="Search Chats"
            id="btn-toggle-search"
          >
            <Search size={18} />
          </button>
        </div>

        <h1 className="snap-screen-title">Chat</h1>

        <div className="snap-header-right">
          <button
            className="snap-icon-circle-btn"
            onClick={onOpenAddFriends}
            title="Add Friends & Devs"
            id="btn-header-add-friend"
          >
            <UserPlus size={18} />
          </button>

          <button
            className="snap-icon-circle-btn"
            onClick={onOpenPinSecurity}
            title="Security & PIN Settings"
            id="btn-header-security"
          >
            <Shield size={18} color="#00FF66" />
          </button>
        </div>
      </header>

      {/* Expandable Search Input Bar */}
      {searchOpen && (
        <div style={{ padding: '4px 16px 8px 16px' }}>
          <div className="snap-add-search-box" style={{ margin: 0 }}>
            <Search size={16} color="#8B949E" />
            <input
              type="text"
              placeholder="Search chat or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              id="input-sidebar-search"
            />
            {searchQuery && (
              <X size={16} style={{ cursor: 'pointer' }} onClick={() => setSearchQuery('')} />
            )}
          </div>
        </div>
      )}

      {/* Category Segmented Filter Pills */}
      <div
        className="sidebar-category-filters"
        id="sidebar-category-filters"
        style={{
          display: 'flex',
          gap: '8px',
          padding: '8px 16px 12px 16px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}
      >
        {[
          { key: 'all', label: 'All' },
          { key: 'direct', label: 'Direct' },
          { key: 'repos', label: 'Repos' },
          { key: 'vaults', label: '🔒 Vaults' },
          { key: 'unread', label: 'Unread' },
        ].map((tab) => {
          const isSelected = activeCategory === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                if (tab.key === 'vaults' && onOpenPinSecurity) {
                  onOpenPinSecurity();
                }
                setActiveCategory(tab.key as any);
              }}
              className={`category-filter-pill ${isSelected ? 'active' : ''}`}
              id={`filter-pill-${tab.key}`}
              style={{
                padding: '6px 14px',
                borderRadius: '16px',
                border: isSelected ? '1px solid #00A3FF' : '1px solid rgba(255, 255, 255, 0.08)',
                background: isSelected ? 'rgba(0, 163, 255, 0.15)' : 'rgba(22, 27, 34, 0.8)',
                color: isSelected ? '#00A3FF' : '#8B949E',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Chat Stream List */}
      <div className="snap-chat-list-scroll" id="snap-chat-list-scroll">
        {filteredChats.map((chat) => {
          const isActive = chat.id === activeChatId;

          // Status icon styling
          let iconColorClass = 'blue';
          if (chat.statusIconType === 'record') iconColorClass = 'red';
          if (chat.statusIconType === 'vault') iconColorClass = 'gold';
          if (chat.statusIconType === 'code') iconColorClass = 'purple';

          return (
            <div
              key={chat.id}
              className={`snap-chat-row ${isActive ? 'active' : ''}`}
              onClick={() => onSelectChat(chat.id)}
              id={`chat-item-${chat.id}`}
            >
              {/* Bitmoji / Developer Avatar */}
              <div className="snap-row-avatar">
                <img src={chat.avatar} alt={chat.name} className="snap-row-avatar-img" />
                {chat.isOnline && <span className="snap-online-badge" />}
              </div>

              {/* Chat Content Body */}
              <div className="snap-row-content">
                <div className="snap-row-top">
                  <span className="snap-row-name">{chat.name}</span>
                  {chat.repoTag && (
                    <span className="discord-repo-pill" title={chat.repoTag}>
                      <GitBranch size={11} />
                      <span className="repo-pill-text">{chat.repoTag.split('#')[0]}</span>
                    </span>
                  )}
                </div>

                <div className="snap-row-bottom">
                  {/* Status Indicator Icon */}
                  <span className={`snap-status-icon ${iconColorClass}`}>
                    {chat.statusIconType === 'vault' ? (
                      <Shield size={12} fill="#FFB800" color="#FFB800" />
                    ) : chat.statusIconType === 'code' ? (
                      <span className="code-icon-glyph">&lt;/&gt;</span>
                    ) : chat.statusIconType === 'record' ? (
                      <span className="snap-record-dot" />
                    ) : (
                      <span className="snap-chat-square" />
                    )}
                  </span>

                  <span className="snap-status-text">{chat.statusText}</span>

                  <span className="snap-status-bullet">&bull;</span>
                  <span className="snap-status-time">{chat.statusTime}</span>

                  {/* Read receipts */}
                  <CheckCheck size={13} color="#00A3FF" style={{ marginLeft: 4 }} />
                </div>
              </div>

              {/* Unread badge & Camera Trigger */}
              <div className="snap-row-actions">
                {chat.unreadCount > 0 && (
                  <span className="snap-row-unread-badge">{chat.unreadCount}</span>
                )}
                <button
                  className="snap-row-camera-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    alert(`Capture snippet for ${chat.name}`);
                  }}
                  title="Snap code"
                >
                  <Camera size={19} />
                </button>
              </div>
            </div>
          );
        })}

        {/* Quick Add Section */}
        {quickAddPreview.length > 0 && (
          <div className="snap-quick-add-section" id="snap-quick-add-container">
            <div className="snap-quick-add-header">
              <span>Quick Add Developers</span>
              <button
                className="snap-view-all-link"
                onClick={onOpenAddFriends}
                id="btn-view-all-devs"
              >
                View More
              </button>
            </div>

            {quickAddPreview.map((dev) => (
              <div key={dev.id} className="snap-quick-add-card" id={`quick-dev-${dev.id}`}>
                <div className="snap-quick-add-avatar">
                  <img src={dev.avatar} alt={dev.name} />
                  {dev.isOnline && <span className="snap-online-badge" />}
                </div>

                <div className="snap-quick-add-info">
                  <div className="snap-quick-add-name">{dev.name}</div>
                  <div className="snap-quick-add-sub">
                    {dev.username} &bull; <span style={{ color: '#00FF66' }}>{dev.tag}</span>
                  </div>
                </div>

                <div className="snap-quick-add-btns">
                  <button
                    className="snap-add-pill-btn"
                    onClick={() => handleQuickAdd(dev)}
                    id={`btn-add-quick-${dev.id}`}
                  >
                    + Add
                  </button>
                  <button
                    className="snap-dismiss-btn"
                    onClick={() => handleDismiss(dev.id)}
                    title="Dismiss"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        className="snap-fab"
        onClick={onOpenCreateCode}
        title="Compose Message or Snippet"
        id="btn-snap-fab"
      >
        <Edit size={22} />
      </button>

      {/* Snapchat 5-Tab Bottom Dock */}
      <nav className="snap-dock" id="snap-bottom-dock">
        <button
          className={`snap-dock-item ${activeTab === 'map' ? 'active' : ''}`}
          onClick={() => setActiveTab('map')}
          id="dock-tab-map"
        >
          <MapPin size={22} />
          <span>Map</span>
        </button>

        <button
          className={`snap-dock-item ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
          id="dock-tab-chat"
        >
          <MessageSquare size={22} />
          <span className="snap-dock-badge">2</span>
          <span>Chat</span>
        </button>

        {/* Vault Tab (Protected PIN Biometric gate) */}
        <button
          className={`snap-dock-item ${activeTab === 'vault' ? 'active' : ''}`}
          onClick={() => {
            if (onOpenPinSecurity) {
              onOpenPinSecurity();
            } else {
              onOpenCreateVault();
            }
          }}
          title="Developer Vault"
          id="dock-tab-camera"
        >
          <Shield size={23} color="#FFB800" />
          <span style={{ color: '#FFB800' }}>Vault</span>
        </button>

        <button
          className={`snap-dock-item ${activeTab === 'stories' ? 'active' : ''}`}
          onClick={() => setActiveTab('stories')}
          id="dock-tab-stories"
        >
          <Flame size={22} />
          <span>Stories</span>
        </button>

        <button
          className={`snap-dock-item ${activeTab === 'spotlight' ? 'active' : ''}`}
          onClick={() => setActiveTab('spotlight')}
          id="dock-tab-spotlight"
        >
          <Compass size={22} />
          <span>Spotlight</span>
        </button>
      </nav>
    </aside>
  );
};

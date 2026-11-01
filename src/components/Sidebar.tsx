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
  X,
  Shield,
  GitBranch,
} from 'lucide-react';
import { Chat, SuggestedDev, CURRENT_USER, webStore } from '../web-db/store';

interface SidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onOpenAddFriends: () => void;
  onOpenCreateVault: () => void;
  onOpenCreateCode: () => void;
  isMobileViewHidden?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  chats,
  activeChatId,
  onSelectChat,
  onOpenAddFriends,
  onOpenCreateVault,
  onOpenCreateCode,
  isMobileViewHidden = false,
}) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SuggestedDev[]>(webStore.getSuggestions());
  const [activeTab, setActiveTab] = useState<'map' | 'chat' | 'camera' | 'stories' | 'spotlight'>('chat');

  // Filter chats
  const filteredChats = chats.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.statusText.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      {/* Snapchat Top Header (Screenshot 1) */}
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

          <button className="snap-icon-circle-btn" title="Options" id="btn-header-more">
            <MoreHorizontal size={18} />
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

      {/* Chat Stream List (Screenshot 1) */}
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
              id={`chat-row-${chat.id}`}
            >
              <div className="snap-row-avatar">
                <img src={chat.avatar} alt={chat.name} />
                {chat.isOnline && <div className="snap-online-badge" />}
              </div>

              <div className="snap-row-info">
                <div className="snap-row-name">
                  <span>{chat.name}</span>
                  {chat.repoTag && <span className="discord-repo-pill">{chat.repoTag}</span>}
                </div>

                <div className="snap-row-subtitle">
                  <span className={`snap-status-icon ${iconColorClass}`}>
                    {chat.statusIconType === 'vault' ? (
                      <Shield size={9} />
                    ) : chat.statusIconType === 'code' ? (
                      <GitBranch size={9} />
                    ) : (
                      <MessageSquare size={9} />
                    )}
                  </span>
                  <span className={`snap-status-text ${iconColorClass}`}>{chat.statusText}</span>
                  <span>&bull;</span>
                  <span>{chat.statusTime}</span>
                </div>
              </div>

              <div className="snap-row-actions">
                {chat.type === 'repo' ? (
                  <GitBranch size={20} color="#8B949E" />
                ) : chat.statusIconType === 'record' ? (
                  <Camera size={20} color="#8B949E" />
                ) : (
                  <MessageSquare size={20} color="#8B949E" />
                )}
              </div>
            </div>
          );
        })}

        {/* Quick Add Section (Screenshot 1) */}
        {quickAddPreview.length > 0 && (
          <div style={{ marginTop: '8px' }}>
            <div className="snap-section-label">
              <span>Quick Add</span>
              <span
                style={{ fontSize: '11px', color: '#8B949E', cursor: 'pointer' }}
                onClick={onOpenAddFriends}
              >
                All Contacts &rsaquo;
              </span>
            </div>

            {quickAddPreview.map((dev) => (
              <div key={dev.id} className="quick-add-preview-card" id={`quick-add-preview-${dev.id}`}>
                <div className="quick-add-user">
                  <div className="snap-row-avatar" style={{ width: 42, height: 42 }}>
                    <img src={dev.avatar} alt={dev.name} />
                    {dev.isOnline && <div className="snap-online-badge" />}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{dev.name}</span>
                    <span style={{ fontSize: '11.5px', color: '#8B949E', fontFamily: 'var(--font-mono)' }}>
                      @{dev.username}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    className="quick-add-btn"
                    onClick={() => handleQuickAdd(dev)}
                    id={`btn-quick-add-${dev.id}`}
                  >
                    <UserPlus size={13} />
                    <span>Add</span>
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

      {/* Floating Action Button (Screenshot 1) */}
      <button
        className="snap-fab"
        onClick={onOpenCreateCode}
        title="Compose Message or Snippet"
        id="btn-snap-fab"
      >
        <Edit size={22} />
      </button>

      {/* Snapchat 5-Tab Bottom Dock (Screenshot 1) */}
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

        <button
          className={`snap-dock-item ${activeTab === 'camera' ? 'active' : ''}`}
          onClick={onOpenCreateVault}
          title="Secret Vault"
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

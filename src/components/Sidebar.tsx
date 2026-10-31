import React, { useState } from 'react';
import {
  Search,
  Plus,
  Rocket,
  Shield,
  Download,
  Filter,
  CheckCheck,
  GitBranch,
} from 'lucide-react';
import { Chat, CURRENT_USER } from '../web-db/store';

interface SidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onOpenShipLogs: () => void;
  onOpenCreateVault: () => void;
  onOpenCreateCode: () => void;
  isMobileViewHidden?: boolean;
  onInstallPwa?: () => void;
  canInstallPwa?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  chats,
  activeChatId,
  onSelectChat,
  onOpenShipLogs,
  onOpenCreateVault,
  onOpenCreateCode,
  isMobileViewHidden = false,
  onInstallPwa,
  canInstallPwa = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'repos' | 'vaults'>('all');

  // Filter chats based on search and selected filter pill
  const filteredChats = chats.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.repoTag && c.repoTag.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeFilter === 'unread') return c.unreadCount > 0;
    if (activeFilter === 'repos') return c.type === 'repo';
    if (activeFilter === 'vaults') return c.lastMessage.includes('Vault');
    return true;
  });

  return (
    <aside className={`sidebar ${isMobileViewHidden ? 'hidden-mobile' : ''}`} id="whatsdev-sidebar">
      {/* Top Profile & Global Actions Header */}
      <div className="sidebar-header">
        <div className="user-profile-badge" title="Your Developer Profile" id="profile-badge">
          <div className="avatar-wrapper">
            <img src={CURRENT_USER.avatar} alt={CURRENT_USER.name} className="avatar-img" />
            <div className="online-dot" />
          </div>
          <div className="dev-info">
            <span className="dev-name">
              WhatsDev
              <span style={{ fontSize: '10px', color: '#00FF66', background: 'rgba(0,255,102,0.1)', padding: '1px 5px', borderRadius: '4px' }}>
                WEB
              </span>
            </span>
            <span className="dev-handle">{CURRENT_USER.handle}</span>
          </div>
        </div>

        <div className="sidebar-actions">
          {/* PWA Install Button */}
          {canInstallPwa && onInstallPwa && (
            <button
              className="pwa-badge-btn"
              onClick={onInstallPwa}
              title="Install WhatsDev as desktop/mobile PWA"
              id="btn-install-pwa"
            >
              <Download size={12} />
              <span>Install PWA</span>
            </button>
          )}

          {/* 24h Ship Logs / Status Stories */}
          <button
            className="icon-btn"
            onClick={onOpenShipLogs}
            title="Developer Ship Logs & Status (24h Stories)"
            id="btn-sidebar-shiplogs"
          >
            <Rocket size={19} color="#00FF66" />
          </button>

          {/* Burn-After-Reading Vault Creator */}
          <button
            className="icon-btn"
            onClick={onOpenCreateVault}
            title="Create Burn-After-Reading .env Vault"
            id="btn-sidebar-vault"
          >
            <Shield size={18} color="#FFB800" />
          </button>

          {/* New Code Snippet / Chat */}
          <button
            className="icon-btn"
            onClick={onOpenCreateCode}
            title="Share Code Snippet"
            id="btn-sidebar-code"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Search Input Box */}
      <div className="search-container">
        <div className="search-input-box">
          <Search size={16} color="#8696A0" />
          <input
            type="text"
            placeholder="Search chats, repos, commits, secrets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            id="input-sidebar-search"
          />
        </div>

        {/* Quick Filter Pills */}
        <div className="filter-pills" id="filter-pills-bar">
          <button
            className={`pill-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
            id="pill-filter-all"
          >
            All
          </button>
          <button
            className={`pill-btn ${activeFilter === 'unread' ? 'active' : ''}`}
            onClick={() => setActiveFilter('unread')}
            id="pill-filter-unread"
          >
            Unread
          </button>
          <button
            className={`pill-btn ${activeFilter === 'repos' ? 'active' : ''}`}
            onClick={() => setActiveFilter('repos')}
            id="pill-filter-repos"
          >
            <GitBranch size={12} /> Repos
          </button>
          <button
            className={`pill-btn ${activeFilter === 'vaults' ? 'active' : ''}`}
            onClick={() => setActiveFilter('vaults')}
            id="pill-filter-vaults"
          >
            <Shield size={12} /> .env Vaults
          </button>
        </div>
      </div>

      {/* Conversation List */}
      <div className="chat-list" id="chat-list-container">
        {filteredChats.map((chat) => {
          const isActive = chat.id === activeChatId;

          return (
            <div
              key={chat.id}
              className={`chat-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelectChat(chat.id)}
              id={`chat-item-${chat.id}`}
            >
              <div className="chat-item-avatar">
                <img src={chat.avatar} alt={chat.name} />
                {chat.isOnline && <div className="online-dot" />}
              </div>

              <div className="chat-item-content">
                <div className="chat-item-top">
                  <div className="chat-title">
                    <span>{chat.name}</span>
                    {chat.repoTag && <span className="repo-badge">{chat.repoTag}</span>}
                  </div>
                  <span className="chat-timestamp">{chat.lastTimestamp}</span>
                </div>

                <div className="chat-item-bottom">
                  <div className="last-message">
                    <CheckCheck size={14} color="#53BDEB" style={{ flexShrink: 0 }} />
                    <span>{chat.lastMessage}</span>
                  </div>
                  {chat.unreadCount > 0 && (
                    <span className="unread-badge">{chat.unreadCount}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredChats.length === 0 && (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: '#8696A0', fontSize: '13px' }}>
            No developer conversations found for "{searchQuery}".
          </div>
        )}
      </div>
    </aside>
  );
};

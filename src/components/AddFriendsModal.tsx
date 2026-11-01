import React, { useState } from 'react';
import {
  ChevronDown,
  Search,
  QrCode,
  Share2,
  UserPlus,
  X,
  MoreHorizontal,
  Info,
  Check,
} from 'lucide-react';
import { SuggestedDev, webStore } from '../web-db/store';

interface AddFriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNewChat: (chatId: string) => void;
}

export const AddFriendsModal: React.FC<AddFriendsModalProps> = ({
  isOpen,
  onClose,
  onSelectNewChat,
}) => {
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<SuggestedDev[]>(webStore.getSuggestions());
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const handleAddDev = (dev: SuggestedDev) => {
    const newChat = webStore.addFriend(dev);
    setAddedIds((prev) => new Set(prev).add(dev.id));
    setSuggestions(webStore.getSuggestions());
    setTimeout(() => {
      onSelectNewChat(newChat.id);
      onClose();
    }, 600);
  };

  const handleDismiss = (devId: string) => {
    webStore.dismissSuggestion(devId);
    setSuggestions(webStore.getSuggestions());
  };

  const filteredSuggestions = suggestions.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="snap-add-screen-backdrop" onClick={onClose} id="add-friends-backdrop">
      <div
        className="snap-add-screen-container"
        onClick={(e) => e.stopPropagation()}
        id="add-friends-modal"
      >
        {/* Header (Screenshot 4) */}
        <div className="snap-add-header">
          <button className="snap-back-btn" onClick={onClose} id="btn-close-add-friends">
            <ChevronDown size={24} />
          </button>

          <div className="snap-add-title-box">
            <h2 className="snap-add-title">Add friends</h2>
            <div className="snap-add-subtitle">
              <span className="green-status-dot" />
              <span>98+ suggestions were active in the last day!</span>
              <Info size={12} color="#8B949E" style={{ marginLeft: 2 }} />
            </div>
          </div>

          <button className="snap-back-btn" id="btn-add-friends-menu">
            <MoreHorizontal size={20} />
          </button>
        </div>

        {/* Search Pill Bar (Screenshot 4) */}
        <div className="snap-add-search-box">
          <Search size={16} color="#8B949E" />
          <input
            type="text"
            placeholder="Search GitHub or Dev ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="input-search-add-friends"
          />
          <QrCode size={18} color="#8B949E" style={{ cursor: 'pointer' }} title="Scan Dev Snapcode" />
        </div>

        {/* Invite Friends Card Banner (Screenshot 4) */}
        <div
          className="snap-invite-banner"
          onClick={() => {
            navigator.clipboard.writeText(window.location.origin);
            alert('WhatsDev invite link copied to clipboard!');
          }}
          id="banner-invite-friends"
        >
          <div className="snap-invite-left">
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'rgba(0, 163, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00A3FF',
              }}
            >
              <Share2 size={18} />
            </div>
            <span>Invite your developer friends!</span>
          </div>
          <span style={{ color: '#8B949E', fontSize: 18 }}>&rsaquo;</span>
        </div>

        {/* Section Title */}
        <div className="snap-section-label">
          <span>Quick Add</span>
          <span style={{ fontSize: '11px', color: '#8B949E', cursor: 'pointer' }}>All Contacts &rsaquo;</span>
        </div>

        {/* Suggested Developer List (Screenshot 4 & 5) */}
        <div className="snap-add-list" id="quick-add-list-scroll">
          {filteredSuggestions.map((dev) => {
            const isAdded = addedIds.has(dev.id);

            return (
              <div key={dev.id} className="snap-add-contact-row" id={`contact-row-${dev.id}`}>
                <div className="snap-contact-info">
                  <div className="snap-contact-avatar">
                    <img src={dev.avatar} alt={dev.name} />
                  </div>
                  <div className="snap-contact-text">
                    <span className="snap-contact-name">{dev.name}</span>
                    <span className="snap-contact-username">{dev.username}</span>
                  </div>
                </div>

                <div className="snap-contact-actions">
                  <button
                    className="snap-pill-add-btn"
                    onClick={() => handleAddDev(dev)}
                    style={
                      isAdded
                        ? { background: '#00FF66', color: '#000', borderColor: '#00FF66' }
                        : {}
                    }
                    id={`btn-add-dev-${dev.id}`}
                  >
                    {isAdded ? (
                      <>
                        <Check size={14} /> Added
                      </>
                    ) : (
                      <>
                        <UserPlus size={14} /> Add
                      </>
                    )}
                  </button>
                  <button
                    className="snap-dismiss-btn"
                    onClick={() => handleDismiss(dev.id)}
                    id={`btn-dismiss-dev-${dev.id}`}
                    title="Dismiss"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredSuggestions.length === 0 && (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: '#8B949E', fontSize: '13px' }}>
              No developers found matching "{search}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

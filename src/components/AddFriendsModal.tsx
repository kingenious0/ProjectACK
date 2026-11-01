import React, { useState } from 'react';
import {
  ChevronLeft,
  Search,
  QrCode,
  Users2,
  UserPlus,
  Users,
  MoreVertical,
  Check,
  X,
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
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestedDev[]>(webStore.getSuggestions());
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const handleSelectDev = (dev: SuggestedDev) => {
    const newChat = webStore.addFriend(dev);
    setAddedIds((prev) => new Set(prev).add(dev.id));
    setSuggestions(webStore.getSuggestions());
    setTimeout(() => {
      onSelectNewChat(newChat.id);
      onClose();
    }, 300);
  };

  const filteredSuggestions = suggestions.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      id="add-friends-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(5, 7, 10, 0.85)',
        backdropFilter: 'blur(4px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        className="wa-select-contact-window"
        onClick={(e) => e.stopPropagation()}
        id="add-friends-modal"
        style={{
          width: '100%',
          maxWidth: '460px',
          height: '100%',
          maxHeight: '680px',
          background: '#111B21',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.9)',
          border: '1px solid #222D34',
        }}
      >
        {/* 1. WhatsApp Top Header: Select Contact */}
        <header
          style={{
            height: '60px',
            background: '#202C33',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #222D34',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              type="button"
              onClick={onClose}
              id="btn-close-select-contact"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#AEBAC1',
                cursor: 'pointer',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
              }}
            >
              <ChevronLeft size={24} />
            </button>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: '#E9EDEF', fontSize: '17px', fontWeight: 600 }}>Select contact</span>
              <span style={{ color: '#8696A0', fontSize: '12px' }}>
                {filteredSuggestions.length} developer contacts
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#AEBAC1' }}>
            <button
              type="button"
              onClick={() => setIsSearching(!isSearching)}
              style={{ background: 'transparent', border: 'none', color: '#AEBAC1', cursor: 'pointer', padding: '6px' }}
              title="Search contacts"
            >
              <Search size={20} />
            </button>
            <button
              type="button"
              style={{ background: 'transparent', border: 'none', color: '#AEBAC1', cursor: 'pointer', padding: '6px' }}
              title="More options"
            >
              <MoreVertical size={20} />
            </button>
          </div>
        </header>

        {/* Search Bar (Collapsible or Active) */}
        {(isSearching || search) && (
          <div
            style={{
              padding: '8px 16px',
              background: '#111B21',
              borderBottom: '1px solid #222D34',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <Search size={16} color="#8696A0" />
            <input
              type="text"
              placeholder="Search developer name or @handle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#E9EDEF',
                fontSize: '14px',
              }}
            />
            {search && (
              <X size={16} color="#8696A0" style={{ cursor: 'pointer' }} onClick={() => setSearch('')} />
            )}
          </div>
        )}

        {/* 2. Scrollable Body: WhatsApp Quick Actions & Contact List */}
        <div style={{ flex: 1, overflowY: 'auto', background: '#111B21' }}>
          {/* Quick Action: New Group */}
          <div
            onClick={() => alert('New Group Chat creation ready')}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 18px',
              gap: '16px',
              cursor: 'pointer',
              borderBottom: '1px solid rgba(255,255,255,0.03)',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: '#00A884',
                color: '#0B141A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Users2 size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#E9EDEF', fontSize: '15.5px', fontWeight: 600 }}>New group</div>
              <div style={{ color: '#8696A0', fontSize: '12.5px' }}>Sprint team, incident room, or repo</div>
            </div>
          </div>

          {/* Quick Action: New Contact */}
          <div
            onClick={() => {
              const handle = prompt('Enter developer username or GitHub handle:');
              if (handle) {
                const newDev: SuggestedDev = {
                  id: 'dev_' + Date.now(),
                  name: handle,
                  username: '@' + handle.toLowerCase().replace('@', ''),
                  avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
                  tag: 'Developer',
                  mutualCount: 1,
                  isOnline: true,
                };
                handleSelectDev(newDev);
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 18px',
              gap: '16px',
              cursor: 'pointer',
              borderBottom: '1px solid rgba(255,255,255,0.03)',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: '#00A884',
                color: '#0B141A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <UserPlus size={20} />
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ color: '#E9EDEF', fontSize: '15.5px', fontWeight: 600 }}>New contact</div>
                <div style={{ color: '#8696A0', fontSize: '12.5px' }}>Add by GitHub or Dev ID</div>
              </div>
              <QrCode size={20} color="#8696A0" />
            </div>
          </div>

          {/* Quick Action: New Community */}
          <div
            onClick={() => alert('New Developer Community ready')}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 18px',
              gap: '16px',
              cursor: 'pointer',
              borderBottom: '1px solid #222D34',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: '#00A884',
                color: '#0B141A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Users size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#E9EDEF', fontSize: '15.5px', fontWeight: 600 }}>New community</div>
              <div style={{ color: '#8696A0', fontSize: '12.5px' }}>Open source organization</div>
            </div>
          </div>

          {/* Section Label: Contacts on WhatsDev */}
          <div
            style={{
              padding: '16px 18px 8px 18px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#8696A0',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Contacts on WhatsDev
          </div>

          {/* Contacts List */}
          {filteredSuggestions.map((dev) => {
            const isAdded = addedIds.has(dev.id);

            return (
              <div
                key={dev.id}
                onClick={() => handleSelectDev(dev)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 18px',
                  gap: '14px',
                  cursor: 'pointer',
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                  transition: 'background 0.15s ease',
                }}
                className="wa-chat-row"
                id={`contact-row-${dev.id}`}
              >
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <img
                    src={dev.avatar}
                    alt={dev.name}
                    style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '2px',
                      right: '2px',
                      width: '11px',
                      height: '11px',
                      borderRadius: '50%',
                      background: '#00A884',
                      border: '2px solid #111B21',
                    }}
                  />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span
                      style={{
                        color: '#E9EDEF',
                        fontSize: '15.5px',
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {dev.name}
                    </span>
                    <span style={{ color: '#00A884', fontSize: '12px', fontWeight: 600 }}>
                      {isAdded ? 'Added' : 'Chat'}
                    </span>
                  </div>
                  <div
                    style={{
                      color: '#8696A0',
                      fontSize: '13px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {dev.username} &bull; Available for PR review
                  </div>
                </div>
              </div>
            );
          })}

          {filteredSuggestions.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: '#8696A0', fontSize: '14px' }}>
              No contacts found matching "{search}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

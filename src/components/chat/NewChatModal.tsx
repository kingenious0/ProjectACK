import React, { useState } from 'react';
import { ChevronLeft, Search, Users, UserPlus } from 'lucide-react';
import { webStore, SuggestedDev } from '../../web-db/store';

export interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNewChat: (chatId: string) => void;
  onOpenCreateGroup?: () => void;
}

interface ContactItem {
  id: string;
  name: string;
  username: string;
  initials: string;
  statusText: string;
}

const DEFAULT_CONTACTS: ContactItem[] = [
  { id: 'dev_hardik', name: 'Hardik', username: 'hkothari1510', initials: 'HK', statusText: 'Online' },
  { id: 'dev_mohit', name: 'Mohit', username: 'chhipa231044', initials: 'MC', statusText: 'Online' },
  { id: 'dev_rey', name: 'Rey Patel', username: 'rey_patel3277', initials: 'RP', statusText: '2h ago' },
  { id: 'dev_aman', name: 'Aman', username: 'a-kay126', initials: 'AK', statusText: 'Away' },
  { id: 'dev_rohan', name: 'Rohan', username: 'rohanbhonsle12', initials: 'RB', statusText: 'Online' },
];

export const NewChatModal: React.FC<NewChatModalProps> = ({
  isOpen,
  onClose,
  onSelectNewChat,
  onOpenCreateGroup,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isInviteInputOpen, setIsInviteInputOpen] = useState(false);
  const [inviteUsername, setInviteUsername] = useState('');

  if (!isOpen) return null;

  const handleSelectContact = (contact: ContactItem) => {
    // Add friend/chat in webStore
    const dev: SuggestedDev = {
      id: contact.id,
      name: contact.name,
      username: contact.username,
      avatar: '',
      tag: 'Developer',
      mutualCount: 1,
      isOnline: contact.statusText === 'Online',
    };
    const newChat = webStore.addFriend(dev);
    onSelectNewChat(newChat.id);
    onClose();
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteUsername.trim()) return;
    const cleanUser = inviteUsername.trim().replace(/^@/, '');
    const dev: SuggestedDev = {
      id: `dev_${cleanUser.toLowerCase()}`,
      name: cleanUser,
      username: cleanUser.toLowerCase(),
      avatar: '',
      tag: 'GitHub Developer',
      mutualCount: 1,
      isOnline: true,
    };
    const newChat = webStore.addFriend(dev);
    setInviteUsername('');
    setIsInviteInputOpen(false);
    onSelectNewChat(newChat.id);
    onClose();
  };

  const filteredContacts = DEFAULT_CONTACTS.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.username.toLowerCase().includes(q);
  });

  return (
    <div
      className="ack-modal-backdrop"
      onClick={onClose}
      id="new-chat-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.82)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        className="ack-new-chat-pane"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-chat-heading"
        style={{
          width: '100%',
          maxWidth: '420px',
          height: '100%',
          maxHeight: '100%',
          background: 'var(--ack-bg, #0B0B0D)',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          padding: '16px 20px 24px 20px',
          paddingTop: 'calc(env(safe-area-inset-top, 16px) + 8px)',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 20px) + 12px)',
          overflowY: 'auto',
          animation: 'ackFadeIn 180ms ease',
        }}
      >
        {/* Top Header: Back Button + "New chat" */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            height: '44px',
            marginBottom: '16px',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            id="btn-back-new-chat"
            aria-label="Back"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--ack-text, #ECECEF)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 8px 6px 0',
              marginLeft: '-4px',
              fontSize: '18px',
              fontWeight: 700,
            }}
          >
            <ChevronLeft size={22} strokeWidth={2} />
            <span id="new-chat-heading">New chat</span>
          </button>
        </div>

        {/* Search Input Field */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            height: '44px',
            background: 'var(--ack-surface, #131316)',
            border: '1px solid var(--ack-border, #26262B)',
            borderRadius: '12px',
            padding: '0 14px',
            gap: '10px',
            marginBottom: '16px',
            flexShrink: 0,
          }}
        >
          <Search size={16} strokeWidth={1.75} style={{ color: 'var(--ack-muted, #9A9AA3)' }} />
          <input
            type="text"
            placeholder="Name or GitHub username"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            id="input-search-new-chat"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--ack-text, #ECECEF)',
              fontSize: '14px',
            }}
          />
        </div>

        {/* Quick Actions List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
          {/* New Group */}
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenCreateGroup) {
                onOpenCreateGroup();
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '10px 0',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'var(--ack-surface-2, #17171B)',
                border: '1px solid var(--ack-border, #26262B)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ack-text, #ECECEF)',
                flexShrink: 0,
              }}
            >
              <Users size={19} strokeWidth={1.75} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ack-text, #ECECEF)' }}>
                New group
              </span>
              <span style={{ fontSize: '13px', color: 'var(--ack-muted, #9A9AA3)', marginTop: '2px' }}>
                Team, sprint or incident room
              </span>
            </div>
          </button>

          {/* Add by GitHub username */}
          <button
            type="button"
            onClick={() => setIsInviteInputOpen(!isInviteInputOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '10px 0',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'var(--ack-surface-2, #17171B)',
                border: '1px solid var(--ack-border, #26262B)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ack-text, #ECECEF)',
                flexShrink: 0,
              }}
            >
              <UserPlus size={19} strokeWidth={1.75} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ack-text, #ECECEF)' }}>
                Add by GitHub username
              </span>
              <span style={{ fontSize: '13px', color: 'var(--ack-muted, #9A9AA3)', marginTop: '2px' }}>
                Invite someone new
              </span>
            </div>
          </button>

          {/* Inline GitHub Invite Input if toggled */}
          {isInviteInputOpen && (
            <form onSubmit={handleInviteSubmit} style={{ display: 'flex', gap: '8px', padding: '6px 0 10px 0' }}>
              <input
                type="text"
                autoFocus
                placeholder="e.g. torvalds"
                value={inviteUsername}
                onChange={(e) => setInviteUsername(e.target.value)}
                style={{
                  flex: 1,
                  height: '40px',
                  background: 'var(--ack-surface-2, #17171B)',
                  border: '1px solid var(--ack-border, #26262B)',
                  borderRadius: '10px',
                  padding: '0 12px',
                  color: 'var(--ack-text, #ECECEF)',
                  fontSize: '13.5px',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                style={{
                  height: '40px',
                  padding: '0 16px',
                  borderRadius: '10px',
                  background: 'var(--ack-accent, #8B7CFF)',
                  border: 'none',
                  color: '#0B0B0D',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Add
              </button>
            </form>
          )}
        </div>

        {/* Contacts Header */}
        <div
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--ack-muted, #9A9AA3)',
            marginBottom: '12px',
          }}
        >
          Contacts · {filteredContacts.length}
        </div>

        {/* Contacts List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {filteredContacts.map((contact) => (
            <button
              key={contact.id}
              type="button"
              onClick={() => handleSelectContact(contact)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 0',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'var(--ack-avatar-bg, #1A1A1F)',
                    border: '1px solid var(--ack-border, #26262B)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: 'var(--ack-text, #ECECEF)',
                    flexShrink: 0,
                  }}
                >
                  {contact.initials}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ack-text, #ECECEF)' }}>
                    {contact.name}
                  </span>
                  <span
                    style={{
                      fontSize: '13px',
                      color: 'var(--ack-muted, #9A9AA3)',
                      fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
                      marginTop: '2px',
                    }}
                  >
                    @{contact.username}
                  </span>
                </div>
              </div>

              {/* Status on Right */}
              <span
                style={{
                  fontSize: '13px',
                  color: contact.statusText === 'Online' ? 'var(--ack-muted, #9A9AA3)' : 'var(--ack-muted, #9A9AA3)',
                }}
              >
                {contact.statusText}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;

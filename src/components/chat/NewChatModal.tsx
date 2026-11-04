import React, { useState, useEffect } from 'react';
import { ChevronLeft, Search, Users, UserPlus, Share2, Copy, Check, MessageSquare } from 'lucide-react';
import { webStore, SuggestedDev, CURRENT_USER } from '../../web-db/store';
import { searchAckProfiles, AuthenticatedUserProfile } from '../../lib/appwrite';

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
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<AuthenticatedUserProfile[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);

  const [isInviteInputOpen, setIsInviteInputOpen] = useState(false);
  const [inviteUsername, setInviteUsername] = useState('');

  // 300ms Debounce search querying ONLY registered profiles
  useEffect(() => {
    const clean = searchQuery.trim().toLowerCase().replace(/^@/, '');
    if (clean.length < 2) {
      setSearchResults([]);
      setHasSearched(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      searchAckProfiles(clean, CURRENT_USER.username)
        .then((results) => {
          setSearchResults(results);
          setHasSearched(true);
        })
        .catch(() => {
          setSearchResults([]);
          setHasSearched(true);
        })
        .finally(() => {
          setIsSearching(false);
        });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (!isOpen) return null;

  const handleSelectContact = (contact: ContactItem) => {
    const dev: SuggestedDev = {
      id: contact.id,
      name: contact.name,
      username: contact.username,
      avatar: `https://github.com/${contact.username.toLowerCase()}.png`,
      tag: 'Developer',
      mutualCount: 1,
      isOnline: contact.statusText === 'Online',
    };
    const newChat = webStore.addFriend(dev);
    onSelectNewChat(newChat.id);
    onClose();
  };

  const handleStartChatWithProfile = (profile: AuthenticatedUserProfile) => {
    const dev: SuggestedDev = {
      id: profile.githubId ? `gh_${profile.githubId}` : profile.id,
      name: profile.name,
      username: profile.username,
      avatar: profile.avatar || `https://github.com/${profile.username.toLowerCase()}.png`,
      tag: 'Ack Developer',
      mutualCount: 1,
      isOnline: true,
    };
    const newChat = webStore.addFriend(dev);
    setSearchQuery('');
    onSelectNewChat(newChat.id);
    onClose();
  };

  const handleInviteUser = (targetUsername: string) => {
    const clean = targetUsername.trim().replace(/^@/, '');
    const inviter = CURRENT_USER.username || 'friend';
    const inviteUrl = `${window.location.origin}?invite=${encodeURIComponent(inviter)}`;
    const inviteText = `Hey @${clean}, let's chat on Ack (the messenger for developers)! Join here: ${inviteUrl}`;

    if (navigator.share) {
      navigator.share({
        title: 'Join me on Ack',
        text: inviteText,
        url: inviteUrl,
      }).catch(() => {});
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(inviteUrl);
      setInviteCopied(true);
      setTimeout(() => setInviteCopied(false), 3000);
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteUsername.trim()) return;
    const clean = inviteUsername.trim().replace(/^@/, '');
    // Check if user is in directory
    const found = await searchAckProfiles(clean);
    const match = found.find((p) => p.username.toLowerCase() === clean.toLowerCase());
    if (match) {
      handleStartChatWithProfile(match);
      setInviteUsername('');
      setIsInviteInputOpen(false);
    } else {
      // Trigger invite
      handleInviteUser(clean);
    }
  };

  const filteredContacts = DEFAULT_CONTACTS.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().replace(/^@/, '');
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
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                if (searchResults.length > 0) {
                  handleStartChatWithProfile(searchResults[0]);
                } else if (hasSearched) {
                  handleInviteUser(searchQuery);
                }
              }
            }}
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

        {/* Contacts or Search Header */}
        <div
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--ack-muted, #9A9AA3)',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>
            {searchQuery.trim().length >= 2
              ? `Registered Ack Users · ${searchResults.length}`
              : `Contacts · ${filteredContacts.length}`}
          </span>
          {isSearching && (
            <span style={{ fontSize: '11px', color: 'var(--ack-accent, #8B7CFF)' }}>
              Searching directory...
            </span>
          )}
        </div>

        {/* Content List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Active Search Mode (2+ characters) */}
          {searchQuery.trim().length >= 2 ? (
            <>
              {/* 1. Matches Found in Ack Directory */}
              {searchResults.map((user) => (
                <div
                  key={user.id || user.username}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    background: 'var(--ack-surface, #131316)',
                    border: '1px solid var(--ack-border, #26262B)',
                    borderRadius: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <img
                      src={user.avatar || `https://github.com/${user.username}.png`}
                      alt={user.name}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'https://github.com/github.png';
                      }}
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '1px solid var(--ack-border, #26262B)',
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <span
                        style={{
                          fontSize: '14.5px',
                          fontWeight: 700,
                          color: 'var(--ack-text, #ECECEF)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {user.name}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <span
                          style={{
                            fontSize: '12px',
                            color: 'var(--ack-muted, #9A9AA3)',
                            fontFamily: 'JetBrains Mono, monospace',
                          }}
                        >
                          @{user.username}
                        </span>
                        <span style={{ fontSize: '11px', color: '#00A884', fontWeight: 600 }}>
                          • Active on Ack
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleStartChatWithProfile(user)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      background: 'var(--ack-accent, #8B7CFF)',
                      border: 'none',
                      color: '#0B0B0D',
                      fontWeight: 700,
                      fontSize: '12.5px',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    <MessageSquare size={14} strokeWidth={2.5} />
                    <span>Message</span>
                  </button>
                </div>
              ))}

              {/* 2. No Matches Found -> NOT on Ack yet -> Invite card */}
              {hasSearched && searchResults.length === 0 && !isSearching && (
                <div
                  style={{
                    padding: '20px 16px',
                    borderRadius: '14px',
                    background: 'var(--ack-surface, #131316)',
                    border: '1px solid var(--ack-border, #26262B)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: '12px',
                  }}
                >
                  <img
                    src={`https://github.com/${searchQuery.trim().replace(/^@/, '').toLowerCase()}.png`}
                    alt=""
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://github.com/github.png';
                    }}
                    style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid var(--ack-border, #26262B)',
                    }}
                  />
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ack-text, #ECECEF)' }}>
                      @{searchQuery.trim().replace(/^@/, '')} isn't on Ack yet
                    </div>
                    <div
                      style={{
                        fontSize: '12.5px',
                        color: 'var(--ack-muted, #9A9AA3)',
                        marginTop: '4px',
                        maxWidth: '300px',
                        lineHeight: 1.4,
                      }}
                    >
                      This developer hasn't joined Ack yet. Send them your invite link so you can start chatting once they sign in!
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleInviteUser(searchQuery)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 18px',
                      borderRadius: '10px',
                      background: inviteCopied ? '#00A884' : 'var(--ack-accent, #8B7CFF)',
                      border: 'none',
                      color: '#0B0B0D',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                      marginTop: '4px',
                      transition: 'background 0.2s',
                    }}
                  >
                    {inviteCopied ? (
                      <>
                        <Check size={16} strokeWidth={2.5} />
                        <span>Invite Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Share2 size={16} strokeWidth={2} />
                        <span>Invite to Ack</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Default Contacts Mode */
            filteredContacts.map((contact) => (
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

                <span
                  style={{
                    fontSize: '13px',
                    color: contact.statusText === 'Online' ? 'var(--ack-muted, #9A9AA3)' : 'var(--ack-muted, #9A9AA3)',
                  }}
                >
                  {contact.statusText}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;

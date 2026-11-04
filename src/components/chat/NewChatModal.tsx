import React, { useState, useEffect } from 'react';
import { ChevronLeft, Search, Share2, Check } from 'lucide-react';
import { webStore, SuggestedDev, CURRENT_USER } from '../../web-db/store';
import { searchAckProfiles, AuthenticatedUserProfile, ACK_CANONICAL_DOMAIN } from '../../lib/appwrite';

export interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNewChat: (chatId: string) => void;
  onOpenCreateGroup?: () => void;
}

function getInitials(text: string): string {
  const clean = text.trim().replace(/^@/, '');
  const parts = clean.split(/[\s_.-]+/);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
  isOpen,
  onClose,
  onSelectNewChat,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<AuthenticatedUserProfile[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);

  // Invite link generation using inviter's random secure invite code
  const invCode = CURRENT_USER.inviteCode || 'ack_inv';
  const fullInviteUrl = `${ACK_CANONICAL_DOMAIN}/?invite=${invCode}`;
  const displayInviteUrl = `project-ack.vercel.app/?invite=${invCode.length > 8 ? invCode.substring(0, 8) + '...' : invCode}`;

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

  const handleShareInvite = () => {
    const cleanTarget = searchQuery.trim().replace(/^@/, '');
    const text = cleanTarget
      ? `Hey @${cleanTarget}, let's chat on Ack (the developer messenger)! Join here: ${fullInviteUrl}`
      : `Let's chat on Ack (the developer messenger)! Join here: ${fullInviteUrl}`;

    if (navigator.share) {
      navigator
        .share({
          title: 'Join me on Ack',
          text,
          url: fullInviteUrl,
        })
        .catch(() => {});
    } else {
      handleCopyInvite();
    }
  };

  const handleCopyInvite = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullInviteUrl);
      setInviteCopied(true);
      setTimeout(() => setInviteCopied(false), 2500);
    }
  };

  const cleanQuery = searchQuery.trim().replace(/^@/, '');
  const isSearchActive = cleanQuery.length >= 2;
  const isPersonFound = isSearchActive && searchResults.length > 0;
  const isPersonNotFound = isSearchActive && hasSearched && searchResults.length === 0 && !isSearching;

  return (
    <div
      className="ack-modal-backdrop"
      onClick={onClose}
      id="new-chat-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
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
          background: '#0B0B0D',
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
            flexShrink: 0,
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
              color: '#ECECEF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '6px 8px 6px 0',
              marginLeft: '-4px',
              fontSize: '18px',
              fontWeight: 700,
            }}
          >
            <ChevronLeft size={22} strokeWidth={2.2} />
            <span id="new-chat-heading">New chat</span>
          </button>
        </div>

        {/* Search Input Field (purple outline as shown in designs) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            height: '48px',
            background: '#131316',
            border: isSearchActive ? '1.5px solid #8B7CFF' : '1px solid #26262B',
            boxShadow: isSearchActive ? '0 0 0 3px rgba(139, 124, 255, 0.15)' : 'none',
            borderRadius: '14px',
            padding: '0 16px',
            gap: '12px',
            marginBottom: '20px',
            flexShrink: 0,
            transition: 'border 0.15s ease, box-shadow 0.15s ease',
          }}
        >
          <Search size={18} strokeWidth={2} style={{ color: isSearchActive ? '#8B7CFF' : '#8E8E93' }} />
          <input
            type="text"
            placeholder="Search username"
            value={searchQuery}
            autoFocus
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (searchResults.length > 0) {
                  handleStartChatWithProfile(searchResults[0]);
                } else if (isPersonNotFound) {
                  handleShareInvite();
                }
              }
            }}
            id="input-search-new-chat"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#ECECEF',
              fontSize: '15px',
              fontWeight: 500,
            }}
          />
        </div>

        {/* Content Body: Screen 1 (Found on Ack) OR Screen 2 (Not on Ack, Invite) */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {isPersonFound && (
            /* Screen 1: Person is on Ack */
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#8E8E93',
                  marginBottom: '12px',
                  letterSpacing: '0.01em',
                }}
              >
                On Ack
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {searchResults.map((user) => {
                  const initials = getInitials(user.name || user.username);
                  return (
                    <div
                      key={user.id || user.username}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        background: '#131316',
                        border: '1px solid #222226',
                        borderRadius: '14px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                        <div
                          style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: '50%',
                            background: '#1C1C20',
                            border: '1px solid #2E2E35',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '15px',
                            fontWeight: 700,
                            color: '#ECECEF',
                            flexShrink: 0,
                          }}
                        >
                          {initials}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                          <span
                            style={{
                              fontSize: '15px',
                              fontWeight: 700,
                              color: '#ECECEF',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {user.name}
                          </span>
                          <span
                            style={{
                              fontSize: '13px',
                              color: '#8E8E93',
                              fontFamily: 'JetBrains Mono, monospace',
                              marginTop: '1px',
                            }}
                          >
                            @{user.username}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '3px' }}>
                            <span
                              style={{
                                width: '7px',
                                height: '7px',
                                borderRadius: '50%',
                                background: '#25D366',
                                display: 'inline-block',
                              }}
                            />
                            <span style={{ fontSize: '12px', color: '#25D366', fontWeight: 600 }}>
                              Active on Ack
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleStartChatWithProfile(user)}
                        id={`btn-msg-${user.username}`}
                        style={{
                          padding: '8px 20px',
                          borderRadius: '12px',
                          background: '#8B7CFF',
                          border: 'none',
                          color: '#0B0B0D',
                          fontWeight: 700,
                          fontSize: '13.5px',
                          cursor: 'pointer',
                          flexShrink: 0,
                          transition: 'opacity 0.15s ease',
                        }}
                      >
                        Message
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Screen 1 footer notice */}
              <div
                style={{
                  marginTop: 'auto',
                  paddingTop: '32px',
                  textAlign: 'center',
                  fontSize: '13px',
                  color: '#636366',
                }}
              >
                Only people who have joined Ack show up here.
              </div>
            </div>
          )}

          {isPersonNotFound && (
            /* Screen 2: Not on Ack, invite screen */
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                paddingTop: '28px',
              }}
            >
              {/* Centered Large circular avatar */}
              <div
                style={{
                  width: '76px',
                  height: '76px',
                  borderRadius: '50%',
                  background: '#1A1A1E',
                  border: '1px solid #2C2C32',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#ECECEF',
                  marginBottom: '20px',
                }}
              >
                {getInitials(cleanQuery)}
              </div>

              {/* Title */}
              <h2
                style={{
                  fontSize: '20px',
                  fontWeight: 800,
                  color: '#ECECEF',
                  margin: '0 0 8px 0',
                  letterSpacing: '-0.02em',
                }}
              >
                @{cleanQuery} isn't on Ack yet
              </h2>

              {/* Subtitle */}
              <p
                style={{
                  fontSize: '14px',
                  color: '#8E8E93',
                  lineHeight: 1.45,
                  maxWidth: '300px',
                  margin: '0 0 24px 0',
                }}
              >
                Send them your invite link. When they join, your chat opens automatically.
              </p>

              {/* Main Button: Invite to Ack */}
              <button
                type="button"
                onClick={handleShareInvite}
                id="btn-invite-to-ack"
                style={{
                  width: '100%',
                  height: '48px',
                  borderRadius: '12px',
                  background: '#8B7CFF',
                  border: 'none',
                  color: '#0B0B0D',
                  fontWeight: 700,
                  fontSize: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  marginBottom: '12px',
                  transition: 'opacity 0.15s ease',
                }}
              >
                <Share2 size={18} strokeWidth={2.2} />
                <span>Invite to Ack</span>
              </button>

              {/* Link Box with Copy Button */}
              <div
                style={{
                  width: '100%',
                  height: '48px',
                  background: '#141416',
                  border: '1px solid #242428',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 6px 0 16px',
                  boxSizing: 'border-box',
                }}
              >
                <span
                  style={{
                    fontSize: '13px',
                    fontFamily: 'JetBrains Mono, monospace',
                    color: '#A0A0A8',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    textAlign: 'left',
                  }}
                >
                  {displayInviteUrl}
                </span>

                <button
                  type="button"
                  onClick={handleCopyInvite}
                  id="btn-copy-invite-link"
                  style={{
                    height: '36px',
                    padding: '0 16px',
                    borderRadius: '8px',
                    background: inviteCopied ? '#25D366' : '#1C1C20',
                    border: '1px solid #2E2E34',
                    color: inviteCopied ? '#0B0B0D' : '#ECECEF',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    flexShrink: 0,
                    transition: 'all 0.15s ease',
                  }}
                >
                  {inviteCopied ? (
                    <>
                      <Check size={14} strokeWidth={2.5} />
                      <span>Copied</span>
                    </>
                  ) : (
                    <span>Copy</span>
                  )}
                </button>
              </div>

              {/* Bottom Screen 2 note */}
              <div
                style={{
                  marginTop: 'auto',
                  paddingTop: '32px',
                  fontSize: '13px',
                  color: '#636366',
                }}
              >
                Nothing is sent or stored for them until they join.
              </div>
            </div>
          )}

          {!isSearchActive && (
            /* Default initial hint before typing 2 characters */
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '20px',
                color: '#636366',
                fontSize: '14px',
              }}
            >
              <p style={{ margin: '0 0 6px 0', color: '#8E8E93', fontWeight: 600 }}>
                Search for any developer on Ack
              </p>
              <p style={{ margin: 0, fontSize: '13px', maxWidth: '280px', lineHeight: 1.4 }}>
                Type their username to message them, or send an invite if they haven't joined yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;

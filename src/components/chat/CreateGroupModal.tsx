import React, { useState, useEffect } from 'react';
import { ChevronLeft, Search, Check, Camera, GitFork, X, Users } from 'lucide-react';
import { SuggestedDev, CURRENT_USER } from '../../web-db/store';
import { searchUsersOnAck } from '../../lib/appwrite';

export interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableDevs?: SuggestedDev[];
  onCreateGroup: (name: string, members: SuggestedDev[], repoLink?: string, avatarUrl?: string) => void;
}

function getDevInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  if (name.length >= 2) return name.slice(0, 2).toUpperCase();
  return (name[0] || 'D').toUpperCase();
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  availableDevs = [],
  onCreateGroup,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedDevIds, setSelectedDevIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupName, setGroupName] = useState('');
  const [repoLink, setRepoLink] = useState('');
  const [isRepoPickerOpen, setIsRepoPickerOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [showPhotoInput, setShowPhotoInput] = useState(false);
  const [liveContacts, setLiveContacts] = useState<SuggestedDev[]>(availableDevs);

  // Sync with availableDevs and fetch registered users from Appwrite
  useEffect(() => {
    if (!isOpen) return;

    let merged = [...availableDevs];
    const seen = new Set(merged.map((m) => m.username.toLowerCase()));

    // Also check local user directory
    try {
      const raw = localStorage.getItem('ack_user_directory');
      if (raw) {
        const dir = JSON.parse(raw);
        for (const k of Object.keys(dir)) {
          const u = (dir[k]?.username || '').toLowerCase();
          if (u && u !== (CURRENT_USER.username || '').toLowerCase() && !seen.has(u)) {
            seen.add(u);
            merged.push({
              id: 'contact_' + u,
              name: dir[k].name || dir[k].username,
              username: dir[k].username,
              avatar: dir[k].avatar || `https://github.com/${dir[k].username}.png`,
              tag: 'Active on Ack',
              mutualCount: 1,
              isOnline: false,
            });
          }
        }
      }
    } catch (e) {}

    setLiveContacts(merged);

    // Background fetch registered directory from Appwrite
    searchUsersOnAck('').then((users) => {
      if (users && users.length > 0) {
        setLiveContacts((prev) => {
          const curSeen = new Set(prev.map((p) => p.username.toLowerCase()));
          const extra: SuggestedDev[] = [];
          for (const u of users) {
            const handle = u.username.toLowerCase();
            if (handle !== (CURRENT_USER.username || '').toLowerCase() && !curSeen.has(handle)) {
              curSeen.add(handle);
              extra.push({
                id: 'contact_' + handle,
                name: u.name || u.username,
                username: u.username,
                avatar: u.avatar || `https://github.com/${u.username}.png`,
                tag: 'Active on Ack',
                mutualCount: 1,
                isOnline: false,
              });
            }
          }
          return extra.length > 0 ? [...prev, ...extra] : prev;
        });
      }
    }).catch(() => {});
  }, [isOpen, availableDevs]);

  if (!isOpen) return null;

  const devList = liveContacts;

  const toggleSelectDev = (id: string) => {
    setSelectedDevIds((prev) =>
      prev.includes(id) ? prev.filter((dId) => dId !== id) : [...prev, id]
    );
  };

  const removeDev = (id: string) => {
    setSelectedDevIds((prev) => prev.filter((dId) => dId !== id));
  };

  const selectedDevs = devList.filter((d) => selectedDevIds.includes(d.id));

  const filteredDevs = devList.filter((d) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return d.name.toLowerCase().includes(q) || d.username.toLowerCase().includes(q);
  });

  const handleNext = () => {
    if (selectedDevIds.length > 0) {
      setStep(2);
    }
  };

  const handleCreate = () => {
    if (!groupName.trim()) return;
    onCreateGroup(
      groupName.trim(),
      selectedDevs,
      repoLink.trim() || undefined,
      avatarUrl.trim() || undefined
    );
    // Reset state & close
    setStep(1);
    setSelectedDevIds([]);
    setGroupName('');
    setRepoLink('');
    setAvatarUrl('');
    onClose();
  };

  return (
    <div
      className="ack-modal-backdrop"
      onClick={onClose}
      id="create-group-modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2500,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        className="ack-group-wizard-pane"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        style={{
          width: '100%',
          maxWidth: '430px',
          height: '100%',
          maxHeight: '100%',
          backgroundColor: '#0B0B0D',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          overflow: 'hidden',
          animation: 'ackFadeIn 180ms ease',
        }}
      >
        {/* ============================================================ */}
        {/* STEP 1: ADD GROUP MEMBERS (Matches User Screenshot 3)         */}
        {/* ============================================================ */}
        {step === 1 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              padding: '16px 20px',
              paddingTop: 'calc(env(safe-area-inset-top, 16px) + 8px)',
              paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + 12px)',
              boxSizing: 'border-box',
            }}
          >
            {/* Header: Back Chevron + Title + Subtitle */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px',
              }}
            >
              <button
                type="button"
                onClick={onClose}
                aria-label="Back"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--ack-text, #ECECEF)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ChevronLeft size={24} />
              </button>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h1
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    margin: 0,
                    lineHeight: '1.2',
                  }}
                >
                  New group
                </h1>
                <span
                  style={{
                    fontSize: '13px',
                    color: 'var(--ack-muted, #9A9AA3)',
                    marginTop: '2px',
                  }}
                >
                  Add members · {selectedDevIds.length} selected
                </span>
              </div>
            </div>

            {/* Removable Selected Chips (Top horizontal row) */}
            {selectedDevs.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap',
                  marginBottom: '16px',
                  maxHeight: '90px',
                  overflowY: 'auto',
                }}
              >
                {selectedDevs.map((dev) => (
                  <div
                    key={dev.id}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 12px',
                      borderRadius: '9999px',
                      backgroundColor: 'var(--ack-accent-tint, #272250)',
                      border: '1px solid rgba(139, 124, 255, 0.4)',
                      color: 'var(--ack-accent-text, #A99DFF)',
                      fontSize: '13px',
                      fontWeight: 600,
                      userSelect: 'none',
                    }}
                  >
                    <span>{dev.name}</span>
                    <button
                      type="button"
                      onClick={() => removeDev(dev.id)}
                      aria-label={`Remove ${dev.name}`}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--ack-accent-text, #A99DFF)',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0.8,
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Search Input */}
            <div
              style={{
                position: 'relative',
                marginBottom: '16px',
              }}
            >
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--ack-muted, #9A9AA3)',
                  pointerEvents: 'none',
                }}
              />
              <input
                type="text"
                placeholder="Search contacts"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  height: '44px',
                  background: 'var(--ack-surface, #131316)',
                  border: '1px solid var(--ack-border, #26262B)',
                  borderRadius: '12px',
                  padding: '0 14px 0 42px',
                  fontSize: '14px',
                  color: 'var(--ack-text, #ECECEF)',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Contacts Checkbox List */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                paddingBottom: '16px',
              }}
            >
              {filteredDevs.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--ack-muted, #9A9AA3)' }}>
                  <Users size={36} style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
                  <p style={{ margin: '0 0 6px 0', fontSize: '15px', color: '#ECECEF', fontWeight: 600 }}>
                    {searchQuery ? 'No contacts match your search' : 'No recent contacts yet'}
                  </p>
                  <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.4 }}>
                    {searchQuery ? 'Try searching by a different name or GitHub handle.' : 'Start a chat or invite colleagues to add them to your group.'}
                  </p>
                </div>
              )}

              {filteredDevs.map((dev) => {
                const isSelected = selectedDevIds.includes(dev.id);
                const initials = getDevInitials(dev.name);

                return (
                  <div
                    key={dev.id}
                    onClick={() => toggleSelectDev(dev.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 4px',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    {/* Left: Avatar + Name + Username */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          background: '#1A1A22',
                          border: '1px solid #26262B',
                          color: '#FFFFFF',
                          fontSize: '14px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          overflow: 'hidden',
                          position: 'relative',
                        }}
                      >
                        {dev.avatar ? (
                          <img
                            src={dev.avatar}
                            alt={dev.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              position: 'absolute',
                              inset: 0,
                            }}
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : null}
                        <span>{initials}</span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span
                          style={{
                            fontSize: '15px',
                            fontWeight: 600,
                            color: '#FFFFFF',
                          }}
                        >
                          {dev.name}
                        </span>
                        <span
                          style={{
                            fontSize: '13px',
                            color: 'var(--ack-muted, #9A9AA3)',
                            marginTop: '2px',
                          }}
                        >
                          @{dev.username}
                        </span>
                      </div>
                    </div>

                    {/* Right: Checkbox */}
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        backgroundColor: isSelected ? 'var(--ack-accent, #8B7CFF)' : 'transparent',
                        border: isSelected ? 'none' : '1.5px solid #3A3A42',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                        transition: 'background-color 150ms ease, border-color 150ms ease',
                      }}
                    >
                      {isSelected && <Check size={16} strokeWidth={2.5} />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Button: Next */}
            <div style={{ paddingTop: '12px' }}>
              <button
                type="button"
                id="btn-group-next-step"
                onClick={handleNext}
                disabled={selectedDevIds.length === 0}
                style={{
                  width: '100%',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: selectedDevIds.length > 0 ? 'var(--ack-accent, #8B7CFF)' : '#322E54',
                  border: 'none',
                  color: selectedDevIds.length > 0 ? '#FFFFFF' : '#8E8BA6',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: selectedDevIds.length > 0 ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow:
                    selectedDevIds.length > 0 ? '0 4px 16px rgba(139, 124, 255, 0.35)' : 'none',
                  transition: 'background-color 150ms ease, opacity 150ms ease',
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 2: NAME YOUR GROUP (Matches User Screenshot 2)          */}
        {/* ============================================================ */}
        {step === 2 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              padding: '16px 20px',
              paddingTop: 'calc(env(safe-area-inset-top, 16px) + 8px)',
              paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + 12px)',
              boxSizing: 'border-box',
            }}
          >
            {/* Header: Back Chevron + Title */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '24px',
              }}
            >
              <button
                type="button"
                onClick={() => setStep(1)}
                aria-label="Back to step 1"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--ack-text, #ECECEF)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ChevronLeft size={24} />
              </button>

              <h1
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  margin: 0,
                }}
              >
                Name your group
              </h1>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {/* Photo & Group Name Row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginBottom: '20px',
                }}
              >
                {/* Circular Camera Button */}
                <button
                  type="button"
                  onClick={() => setShowPhotoInput(!showPhotoInput)}
                  title="Upload group photo"
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: '#17171B',
                    border: '1px solid #26262B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--ack-muted, #9A9AA3)',
                    cursor: 'pointer',
                    flexShrink: 0,
                    overflow: 'hidden',
                    padding: 0,
                  }}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Group"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <Camera size={22} />
                  )}
                </button>

                {/* Group Name Field */}
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: 'var(--ack-muted, #9A9AA3)',
                      marginBottom: '6px',
                    }}
                  >
                    Group name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sprint 14"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    autoFocus
                    style={{
                      width: '100%',
                      height: '46px',
                      backgroundColor: '#0B0B0D',
                      border: '1.5px solid var(--ack-accent, #8B7CFF)',
                      borderRadius: '12px',
                      padding: '0 14px',
                      color: '#FFFFFF',
                      fontSize: '15px',
                      fontWeight: 500,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* Optional Inline Photo URL Input */}
              {showPhotoInput && (
                <div
                  style={{
                    background: '#131316',
                    border: '1px solid #26262B',
                    borderRadius: '12px',
                    padding: '12px',
                    marginBottom: '16px',
                  }}
                >
                  <span
                    style={{
                      display: 'block',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--ack-muted, #9A9AA3)',
                      marginBottom: '6px',
                    }}
                  >
                    PHOTO URL (OPTIONAL)
                  </span>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    style={{
                      width: '100%',
                      height: '36px',
                      background: '#0B0B0D',
                      border: '1px solid #26262B',
                      borderRadius: '8px',
                      padding: '0 10px',
                      color: '#ECECEF',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              )}

              {/* Link a repo Card */}
              <div
                onClick={() => setIsRepoPickerOpen(!isRepoPickerOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 16px',
                  borderRadius: '14px',
                  backgroundColor: '#131316',
                  border: '1px solid #26262B',
                  marginBottom: '24px',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: '#1C1C22',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ECECEF',
                    flexShrink: 0,
                  }}
                >
                  <GitFork size={18} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <span style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF' }}>
                    Link a repo
                  </span>
                  <span
                    style={{
                      fontSize: '13px',
                      color: repoLink ? 'var(--ack-accent-text, #A99DFF)' : 'var(--ack-muted, #9A9AA3)',
                      marginTop: '2px',
                    }}
                  >
                    {repoLink ? repoLink : 'Optional · shows PRs and builds here'}
                  </span>
                </div>
              </div>

              {/* Repo Selector Input if toggled */}
              {isRepoPickerOpen && (
                <div
                  style={{
                    background: '#131316',
                    border: '1px solid #26262B',
                    borderRadius: '12px',
                    padding: '12px',
                    marginBottom: '24px',
                  }}
                >
                  <span
                    style={{
                      display: 'block',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--ack-muted, #9A9AA3)',
                      marginBottom: '6px',
                    }}
                  >
                    GITHUB REPOSITORY (OWNER/REPO)
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. kingenious0/ProjectACK"
                    value={repoLink}
                    onChange={(e) => setRepoLink(e.target.value)}
                    style={{
                      width: '100%',
                      height: '36px',
                      background: '#0B0B0D',
                      border: '1px solid #26262B',
                      borderRadius: '8px',
                      padding: '0 10px',
                      color: '#ECECEF',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              )}

              {/* Members Section */}
              <div style={{ marginBottom: '24px' }}>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--ack-muted, #9A9AA3)',
                    marginBottom: '14px',
                  }}
                >
                  Members · {selectedDevs.length + 1}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    flexWrap: 'wrap',
                  }}
                >
                  {/* Current User: You */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: '#1E1E24',
                        border: '1px solid #26262B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        fontWeight: 700,
                      }}
                    >
                      KG
                    </div>
                    <span
                      style={{
                        fontSize: '12px',
                        color: 'var(--ack-muted, #9A9AA3)',
                      }}
                    >
                      You
                    </span>
                  </div>

                  {/* Selected Collaborator Avatars */}
                  {selectedDevs.map((dev) => {
                    const initials = getDevInitials(dev.name);
                    const shortName = dev.name.split(' ')[0];

                    return (
                      <div
                        key={dev.id}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <div
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            backgroundColor: '#1E1E24',
                            border: '1px solid #26262B',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#FFFFFF',
                            fontSize: '14px',
                            fontWeight: 700,
                          }}
                        >
                          {initials}
                        </div>
                        <span
                          style={{
                            fontSize: '12px',
                            color: 'var(--ack-muted, #9A9AA3)',
                          }}
                        >
                          {shortName}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Button: Create Group */}
            <div style={{ paddingTop: '12px' }}>
              <button
                type="button"
                id="btn-create-group-submit"
                onClick={handleCreate}
                disabled={!groupName.trim()}
                style={{
                  width: '100%',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: groupName.trim() ? 'var(--ack-accent, #8B7CFF)' : '#322E54',
                  border: 'none',
                  color: groupName.trim() ? '#FFFFFF' : '#8E8BA6',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: groupName.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow:
                    groupName.trim() ? '0 4px 16px rgba(139, 124, 255, 0.35)' : 'none',
                  transition: 'background-color 150ms ease',
                }}
              >
                Create group
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, BellOff, Bell, Search, UserPlus, GitFork, Shield, LogOut, Check, Trash2, GitPullRequest, ExternalLink } from 'lucide-react';
import { Chat, GroupMember, MOCK_USERNAMES } from '../../web-db/store';
import { FEATURES } from '../../config/features';

interface GroupInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  chat: Chat;
  onLeaveGroup: (chatId: string) => void;
  onDeleteGroup?: (chatId: string) => void;
  onOpenSearch?: () => void;
  onAddMember?: () => void;
  onOpenReview?: (payload: any) => void;
}

export const GroupInfoModal: React.FC<GroupInfoModalProps> = ({
  isOpen,
  onClose,
  chat,
  onLeaveGroup,
  onDeleteGroup,
  onOpenSearch,
  onAddMember,
  onOpenReview,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!isOpen) return null;

  const members: GroupMember[] = (chat.members || []).filter(
    (m) => !MOCK_USERNAMES.has((m.username || '').toLowerCase())
  );
  if (members.length === 0) {
    members.push({
      id: 'usr_admin',
      name: `${chat.name || 'Group'} Admin`,
      username: 'admin',
      avatar: chat.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      role: 'admin',
      isOnline: true,
    });
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(11, 11, 13, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          maxHeight: '88vh',
          backgroundColor: '#131316',
          border: '1px solid #26262B',
          borderRadius: '20px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.7)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
            borderBottom: '1px solid #26262B',
          }}
        >
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#A1A1AA' }}>Group details</span>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#71717A',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px' }}>
          {/* Avatar & Title */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '24px' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '20px',
                overflow: 'hidden',
                backgroundColor: '#1F1F24',
                border: '2px solid #26262B',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {chat.avatar ? (
                <img src={chat.avatar} alt={chat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '28px', fontWeight: 700, color: '#8B7CFF' }}>
                  {chat.name.charAt(0)}
                </span>
              )}
            </div>

            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#F4F4F5', margin: '0 0 4px 0' }}>
              {chat.name}
            </h2>
            <span style={{ fontSize: '13px', color: '#71717A' }}>
              {members.length} {members.length === 1 ? 'member' : 'members'}
            </span>

            {chat.description && (
              <p style={{ fontSize: '12px', color: '#A1A1AA', margin: '10px 0 0 0', maxWidth: '320px', lineHeight: '1.4' }}>
                {chat.description}
              </p>
            )}
          </div>

          {/* Quick Actions (Mute, Search, Add) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: FEATURES.addToCall ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
              gap: '10px',
              marginBottom: '24px',
            }}
          >
            <button
              onClick={() => setIsMuted(!isMuted)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                padding: '12px 8px',
                borderRadius: '12px',
                backgroundColor: '#18181C',
                border: '1px solid #26262B',
                color: isMuted ? '#8B7CFF' : '#A1A1AA',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              {isMuted ? <BellOff size={18} color="#8B7CFF" /> : <Bell size={18} />}
              <span>{isMuted ? 'Muted' : 'Mute'}</span>
            </button>

            <button
              onClick={() => {
                if (onOpenSearch) onOpenSearch();
                onClose();
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                padding: '12px 8px',
                borderRadius: '12px',
                backgroundColor: '#18181C',
                border: '1px solid #26262B',
                color: '#A1A1AA',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              <Search size={18} />
              <span>Search</span>
            </button>

            {FEATURES.addToCall && (
              <button
                onClick={() => {
                  if (onAddMember) onAddMember();
                  onClose();
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '12px 8px',
                  borderRadius: '12px',
                  backgroundColor: '#18181C',
                  border: '1px solid #26262B',
                  color: '#A1A1AA',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                <UserPlus size={18} />
                <span>Add</span>
              </button>
            )}
          </div>

          {/* Linked Repo */}
          {(chat.linkedRepo || chat.repoTag) && (() => {
            const repoClean = (chat.linkedRepo || chat.repoTag || '').replace(/#.*$/, '').replace(/^https?:\/\/github\.com\//, '').trim();
            const repoUrl = `https://github.com/${repoClean}`;
            return (
              <div
                style={{
                  marginBottom: '24px',
                  padding: '16px',
                  borderRadius: '12px',
                  backgroundColor: '#18181C',
                  border: '1px solid #26262B',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <GitFork size={16} color="#8B7CFF" />
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Linked Repository
                    </span>
                  </div>
                  <a
                    href={repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    id="link-group-github-external"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--ack-accent, #8B7CFF)',
                      textDecoration: 'none',
                    }}
                  >
                    <span>Open GitHub</span>
                    <ExternalLink size={12} strokeWidth={2} />
                  </a>
                </div>

                <div
                  style={{
                    fontSize: '14px',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 600,
                    color: '#F4F4F5',
                    marginBottom: '12px',
                  }}
                >
                  {repoClean}
                </div>

                {onOpenReview && (
                  <button
                    type="button"
                    id="btn-modal-review-repo"
                    onClick={() => {
                      onClose();
                      onOpenReview({
                        title: `PR #42: Sync ${repoClean} changes`,
                        prNumber: 42,
                        prBranch: 'main',
                        repoName: repoClean,
                        diffFiles: [
                          {
                            filename: 'src/config.ts',
                            oldPath: 'src/config.ts',
                            newPath: 'src/config.ts',
                            status: 'modified',
                            additions: 12,
                            deletions: 3,
                            chunks: [
                              {
                                header: '@@ -1,8 +1,17 @@',
                                lines: [
                                  ' import { defineConfig } from "vite";',
                                  '-const API_URL = "http://localhost:3000";',
                                  '+const API_URL = process.env.VITE_API_URL || "https://project-ack.vercel.app";',
                                  `+export const LINKED_REPO = "${repoClean}";`,
                                  ' export default defineConfig({});'
                                ]
                              }
                            ]
                          }
                        ]
                      });
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: 'rgba(139, 124, 255, 0.15)',
                      border: '1px solid rgba(139, 124, 255, 0.35)',
                      color: '#ECECEF',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <GitPullRequest size={15} color="#8B7CFF" />
                    <span>Inspect PRs & Code Diffs</span>
                  </button>
                )}
              </div>
            );
          })()}

          {/* Member List */}
          <div style={{ marginBottom: '24px' }}>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#71717A',
                marginBottom: '10px',
              }}
            >
              Members ({members.length})
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {members.map((member) => (
                <div
                  key={member.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '10px',
                    backgroundColor: '#18181C',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ position: 'relative' }}>
                      <img
                        src={member.avatar}
                        alt={member.name}
                        style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      {member.isOnline && (
                        <span
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            width: '9px',
                            height: '9px',
                            borderRadius: '50%',
                            backgroundColor: '#4ADE80',
                            border: '2px solid #18181C',
                          }}
                        />
                      )}
                    </div>

                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: '#F4F4F5' }}>{member.name}</div>
                      <div style={{ fontSize: '11px', color: '#71717A' }}>@{member.username}</div>
                    </div>
                  </div>

                  {member.role === 'admin' && (
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '10px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        color: '#8B7CFF',
                        backgroundColor: 'rgba(139, 124, 255, 0.12)',
                        padding: '2px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      <Shield size={10} />
                      <span>Admin</span>
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Leave / Delete Group Action (Danger Color) */}
          <div style={{ paddingTop: '8px' }}>
            {confirmDelete ? (
              <div
                style={{
                  padding: '14px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  textAlign: 'center',
                  marginBottom: '10px',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#EF4444', marginBottom: '8px' }}>
                  Delete this group? Messages will be removed from this device.
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <button
                    onClick={() => {
                      if (onDeleteGroup) {
                        onDeleteGroup(chat.id);
                      } else {
                        onLeaveGroup(chat.id);
                      }
                      onClose();
                    }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      backgroundColor: '#EF4444',
                      color: '#FFFFFF',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Delete group
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      backgroundColor: '#26262B',
                      color: '#F4F4F5',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}

            {confirmLeave ? (
              <div
                style={{
                  padding: '14px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(248, 113, 113, 0.1)',
                  border: '1px solid rgba(248, 113, 113, 0.25)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#F87171', marginBottom: '8px' }}>
                  Are you sure you want to exit this group?
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <button
                    onClick={() => {
                      onLeaveGroup(chat.id);
                      onClose();
                    }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      backgroundColor: '#F87171',
                      color: '#0B0B0D',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Exit group
                  </button>
                  <button
                    onClick={() => setConfirmLeave(false)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      backgroundColor: '#26262B',
                      color: '#F4F4F5',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={() => setConfirmLeave(true)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(248, 113, 113, 0.08)',
                    border: '1px solid rgba(248, 113, 113, 0.2)',
                    color: '#F87171',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  <LogOut size={16} />
                  <span>Exit group</span>
                </button>

                <button
                  onClick={() => setConfirmDelete(true)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    color: '#EF4444',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  <Trash2 size={16} />
                  <span>Delete group</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

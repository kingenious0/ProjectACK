import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  Pencil,
  CornerUpRight,
  Copy,
  Ban,
  X,
  MoreVertical,
  Paperclip,
  Mic,
  Send,
  CheckCheck,
  Check,
  Clock,
  Image as ImageIcon,
  FileText,
  FileCode,
  Shield,
  Lock,
  Trash2,
  Video,
  Phone,
  Terminal,
  Settings,
  WifiOff,
  MessageSquare,
  LogOut,
  RotateCcw,
  Info,
} from 'lucide-react';
import { Chat, Message, CURRENT_USER, webStore, isMockChat } from '../../web-db/store';
import { getInitials } from '../../utils/avatar';
import { CodeMessage } from './CodeMessage';
import { VaultMessage } from './VaultMessage';
import { ImageMessage } from './ImageMessage';
import { DocumentMessage } from './DocumentMessage';
import { EmojiPicker } from './EmojiPicker';
import { ImagePreviewSheet } from './ImagePreviewSheet';
import { Reactions } from './Reactions';
import { AudioWaveBubble } from '../AudioWaveBubble';
import { CodeReviewDrawer, CodeReviewPayload } from './CodeReviewDrawer';
import { FEATURES } from '../../config/features';

export interface ChatViewProps {
  chat: Chat | null;
  messages: Message[];
  onSendMessage: (text: string) => void;
  onSendCode: () => void;
  onSendVault: () => void;
  onBackToSidebar: () => void;
  onOpenCall?: (type: 'audio' | 'video' | 'pair') => void;
  onOpenStartCallSheet?: () => void;
  onOpenSettings?: () => void;
  onOpenGroupInfo?: (chat: Chat) => void;
  onOpenBurnedSecret?: (senderName: string, title?: string, copiedAt?: string) => void;
  onDeleteChat?: (chatId: string) => void;
  onClearChat?: (chatId: string) => void;
  onLeaveGroup?: (chatId: string) => void;
  isMobileActive?: boolean;
  activeReviewPayload?: CodeReviewPayload | null;
  onOpenReview?: (payload: CodeReviewPayload) => void;
  onCloseReview?: () => void;
  onSendReviewComment?: (comment: string) => void;
}

function formatLastSeen(lastSeen?: string | number | Date, fallbackTime?: string): string {
  if (!lastSeen && !fallbackTime) return 'recently';

  let date: Date | null = null;
  if (lastSeen) {
    const d = new Date(lastSeen);
    if (!isNaN(d.getTime())) date = d;
  }

  if (!date && fallbackTime) {
    const lower = fallbackTime.toLowerCase();
    if (lower === 'just now') return '1 second ago';
    if (lower.includes('ago') || lower.includes('yesterday')) {
      return fallbackTime;
    }
    const parsed = new Date(fallbackTime);
    if (!isNaN(parsed.getTime())) date = parsed;
    else return fallbackTime;
  }

  if (!date) return 'recently';

  const diffMs = Date.now() - date.getTime();
  if (diffMs <= 5000) return '1 second ago';
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec} seconds ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin === 1) return '1 min ago';
  if (diffMin < 60) return `${diffMin} mins ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours === 1) return '1 hr ago';
  if (diffHours < 24) return `${diffHours} hrs ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'yesterday';
  return `${diffDays} days ago`;
}

export const ChatView: React.FC<ChatViewProps> = ({
  chat,
  messages,
  onSendMessage,
  onSendCode,
  onSendVault,
  onBackToSidebar,
  onOpenCall,
  onOpenStartCallSheet,
  onOpenSettings,
  onOpenGroupInfo,
  onOpenBurnedSecret,
  activeReviewPayload,
  onOpenReview,
  onCloseReview,
  isMobileActive,
  onSendReviewComment,
  onDeleteChat,
  onClearChat,
  onLeaveGroup,
}) => {
  const [inputText, setInputText] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [confirmChatModal, setConfirmChatModal] = useState<{
    type: 'delete_chat' | 'delete_group' | 'exit_group' | 'clear_chat';
  } | null>(null);
  const [activeReactionMenuId, setActiveReactionMenuId] = useState<string | null>(null);
  const [internalReviewPayload, setInternalReviewPayload] = useState<CodeReviewPayload | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [dismissChips, setDismissChips] = useState(false);
  const [actionMessage, setActionMessage] = useState<Message | null>(null);
  const [actionMenuPosition, setActionMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showForwardSheet, setShowForwardSheet] = useState(false);
  const longPressTimerRef = useRef<any>(null);
  const touchMovedRef = useRef<boolean>(false);
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const typingDebounceRef = useRef<any>(null);
  const ignoreBackdropClickUntilRef = useRef<number>(0);

  const checkIsMe = (msg?: Message | null): boolean => {
    if (!msg) return false;

    const myUsername = (CURRENT_USER.username || '').toLowerCase().trim();
    const myName = (CURRENT_USER.name || '').toLowerCase().trim();
    const myId = CURRENT_USER.id;
    const myGithubId = CURRENT_USER.githubId;
    const myAppwriteId = (CURRENT_USER as any).appwriteUserId;

    const msgUser = (msg.metadata?.username || (msg.metadata as any)?.senderUsername || '').toLowerCase().trim();
    const msgSenderName = (msg.senderName || '').toLowerCase().trim();
    const senderId = msg.senderId;

    // In a 1-on-1 DM: First check if it definitely belongs to the chat peer
    if (chat && chat.type === 'dm') {
      const peerUsername = (chat.username || '').toLowerCase().trim();
      const peerName = (chat.name || '').toLowerCase().trim();

      // If metadata username matches peer username, it is definitely from the peer
      if (peerUsername && msgUser && msgUser === peerUsername) {
        return false;
      }
      // If senderId matches peer ID or peer username
      if (peerUsername && senderId === peerUsername) {
        return false;
      }
      if (senderId === 'dev_peer' || senderId === (chat as any).peerId || senderId === (chat as any).appwriteUserId) {
        return false;
      }
      // If senderName matches peer's display name or username (and is not 'me')
      if (msgSenderName && msgSenderName !== 'me') {
        if (peerUsername && (msgSenderName === peerUsername || msgSenderName === `@${peerUsername}`)) {
          return false;
        }
        if (peerName && msgSenderName === peerName) {
          return false;
        }
      }
    }

    // Direct matches for current user
    // 1. Direct ID match with current user's IDs
    if (myId && senderId === myId) return true;
    if (myGithubId && senderId === myGithubId) return true;
    if (myAppwriteId && senderId === myAppwriteId) return true;

    // 2. Explicit metadata username match
    if (myUsername && msgUser && msgUser === myUsername) return true;

    // 3. Sender name match with current user's name (must not be generic 'me')
    if (myName && msgSenderName && msgSenderName !== 'me' && (msgSenderName === myName || myName.includes(msgSenderName) || msgSenderName.includes(myName))) {
      return true;
    }
    if (myUsername && msgSenderName && msgSenderName !== 'me' && (msgSenderName === myUsername || msgSenderName === `@${myUsername}`)) {
      return true;
    }

    // 4. Legacy 'ME' or 'usr_me' fallback ONLY if it wasn't attributed to peer above
    if (senderId === 'usr_me' || senderId === 'dev_user_self') {
      if (chat && chat.type === 'dm' && chat.username) {
        const peerUsername = chat.username.toLowerCase().trim();
        if (msgUser && msgUser === peerUsername) return false;
      }
      return true;
    }

    if (msg.senderName === 'ME') {
      // If metadata explicitly says another user, it's NOT me
      if (msgUser && myUsername && msgUser !== myUsername) {
        return false;
      }
      return true;
    }

    // Default: safe false (incoming message)
    return false;
  };

  const isInviteChat = Boolean(chat?.isInviteChat || chat?.invitedBy || chat?.statusText?.toLowerCase().includes('invite'));
  const inviterHandle = chat?.invitedBy || chat?.username || 'dev';
  const hasUserReplied = messages.some((m) => checkIsMe(m));
  const showQuickChips = isInviteChat && !hasUserReplied && !dismissChips;

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const renderMessageContentWithMentions = (content: string) => {
    const parts = content.split(/(@[a-zA-Z0-9_]+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        return (
          <span key={i} style={{ color: '#A99DFF', fontWeight: 600 }}>
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const effectiveReview = activeReviewPayload !== undefined ? activeReviewPayload : internalReviewPayload;

  const handleTriggerReview = (payload: CodeReviewPayload) => {
    if (onOpenReview) {
      onOpenReview(payload);
    } else {
      setInternalReviewPayload(payload);
    }
  };

  const handleCloseReview = () => {
    if (onCloseReview) {
      onCloseReview();
    } else {
      setInternalReviewPayload(null);
    }
  };

  // Image upload & preview state
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewImageName, setPreviewImageName] = useState<string>('');
  const imageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingTimerRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleToggleReaction = (msgId: string, emoji: string) => {
    if (chat) {
      webStore.addReaction(chat.id, msgId, emoji);
    }
  };

  const handleDeleteMessage = (msgId: string) => {
    if (chat) {
      webStore.deleteMessage(chat.id, msgId);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isRecording, chat ? webStore.getTypingUser(chat.id) : null]);

  useEffect(() => {
    if (isRecording) {
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRecording]);

  // Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputText(val);

    if (chat && !editingMessage) {
      webStore.setTyping(chat.id, true);
      if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
      typingDebounceRef.current = setTimeout(() => {
        if (chat) webStore.setTyping(chat.id, false);
      }, 2500);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
    if (chat) webStore.setTyping(chat.id, false);

    if (editingMessage && chat) {
      webStore.editMessage(chat.id, editingMessage.id, inputText.trim());
      setEditingMessage(null);
      setInputText('');
      return;
    }

    if (isOffline) {
      if (chat) {
        webStore.sendMessage(chat.id, inputText.trim(), 'text', { isFailed: true });
      }
    } else {
      onSendMessage(inputText.trim());
    }
    setInputText('');
    setShowEmojiPicker(false);
  };

  const handleSelectEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji);
  };

  const handleImageSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreviewImageName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    e.target.value = '';
    setShowAttachMenu(false);
  };

  const handleSendImageWithCaption = (caption: string) => {
    if (!previewImage || !chat) return;

    webStore.sendMessage(chat.id, caption || 'Shared image', 'image', {
      imageUrl: previewImage,
      imageCaption: caption || undefined,
    });

    setPreviewImage(null);
    setPreviewImageName('');
  };

  const handleDocSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !chat) return;

    const extension = file.name.split('.').pop()?.toUpperCase() || 'FILE';
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      webStore.sendMessage(chat.id, file.name, 'document', {
        docName: file.name,
        docSize: sizeInMb,
        docType: extension,
        docUrl: dataUrl,
      });
    };
    reader.readAsDataURL(file);

    e.target.value = '';
    setShowAttachMenu(false);
  };

  const startRecording = async () => {
    setShowAttachMenu(false);
    setIsRecording(true);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mediaRecorder.start();
      }
    } catch (err) {
      console.warn('Microphone permission not granted, using synthetic fallback', err);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
    }
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  const sendRecording = () => {
    if (!chat) return;
    const durationStr = `0:${recordingSeconds < 10 ? '0' : ''}${Math.max(recordingSeconds, 3)}`;
    const randomWaveform = Array.from({ length: 22 }, () => Math.floor(Math.random() * 70) + 25);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          webStore.sendMessage(chat.id, `Voice note (${durationStr})`, 'audio_note', {
            audioDuration: durationStr,
            waveform: randomWaveform,
            audioUrl: base64Audio,
          });
        };
        reader.readAsDataURL(audioBlob);
        mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorderRef.current.stop();
    } else {
      webStore.sendMessage(chat.id, `Voice note (${durationStr})`, 'audio_note', {
        audioDuration: durationStr,
        waveform: randomWaveform,
      });
    }

    setIsRecording(false);
    setRecordingSeconds(0);
  };

  // If no chat selected (desktop empty state)
  if (!chat) {
    return (
      <main
        style={{
          flex: 1,
          height: '100%',
          background: 'var(--ack-bg)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          userSelect: 'none',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '18px',
            background: 'var(--ack-surface, #131316)',
            border: '1px solid var(--ack-border, #26262B)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
          }}
        >
          <svg viewBox="0 0 160 160" width="38" height="38">
            <path
              d="M 60 76 L 80 96 L 120 54"
              fill="none"
              stroke="#4E4485"
              strokeWidth="16"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 50 86 L 70 106 L 110 64"
              fill="none"
              stroke="#8B7CFF"
              strokeWidth="16"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2
          style={{
            color: 'var(--ack-text)',
            fontSize: '28px',
            fontWeight: 700,
            marginBottom: '8px',
            letterSpacing: '-0.02em',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Ack
        </h2>
        <p
          style={{
            color: 'var(--ack-accent-text)',
            fontSize: '15px',
            fontWeight: 600,
            marginBottom: '4px',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Got it.
        </p>
        <p
          style={{
            color: 'var(--ack-muted)',
            fontSize: '14px',
            textAlign: 'center',
            maxWidth: '320px',
            lineHeight: 1.5,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Chat for people who ship. Select a conversation to start messaging.
        </p>
        <div
          style={{
            marginTop: '32px',
            fontSize: '12px',
            color: 'var(--ack-muted)',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Vault secrets are end-to-end encrypted.
        </div>
      </main>
    );
  }

  const isRepo = chat.type === 'repo' || chat.name.includes('/');
  const initials = getInitials(chat.name);

  return (
    <main
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        background: 'var(--ack-bg)',
        overflow: 'hidden',
        position: 'relative',
      }}
      onClick={() => {
        if (showAttachMenu) setShowAttachMenu(false);
        if (showMenuDropdown) setShowMenuDropdown(false);
        if (activeReactionMenuId) setActiveReactionMenuId(null);
      }}
    >
      {/* 1. Header (Matches Conversation@1x.png) */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '56px',
          padding: '0 16px',
          paddingTop: 'env(safe-area-inset-top, 0px)',
          background: 'var(--ack-bg)',
          borderBottom: '1px solid var(--ack-divider)',
          zIndex: 30,
          flexShrink: 0,
          userSelect: 'none',
        }}
      >
        {/* Left: Back button & Contact avatar + info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <button
            type="button"
            id="btn-back-chat"
            onClick={onBackToSidebar}
            aria-label="Back to conversations"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--ack-text)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              marginLeft: '-8px',
              padding: 0,
            }}
          >
            <ChevronLeft size={22} strokeWidth={2} />
          </button>

          {/* Initials Avatar & Title */}
          <div
            onClick={() => {
              if (chat.type === 'group' && onOpenGroupInfo) {
                onOpenGroupInfo(chat);
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              cursor: chat.type === 'group' ? 'pointer' : 'default',
              minWidth: 0,
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'var(--ack-avatar-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ack-text)',
                fontFamily: isRepo ? 'JetBrains Mono, monospace' : 'Inter, sans-serif',
                fontSize: '13px',
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              {initials}
            </div>

            {/* Title & Status */}
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, marginLeft: '6px' }}>
              <span
                style={{
                  fontSize: isRepo ? '14px' : '15px',
                  fontWeight: 700,
                  color: 'var(--ack-text)',
                  fontFamily: isRepo ? 'JetBrains Mono, monospace' : 'Inter, sans-serif',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {chat.name}
              </span>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  color: 'var(--ack-muted)',
                  fontFamily: 'Inter, sans-serif',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {(() => {
                  const isPeerTyping = !!(chat && webStore.getTypingUser(chat.id));
                  if (chat.type === 'group' && chat.members) {
                    return <span>{chat.members.length} members · tap for info</span>;
                  }
                  if (isPeerTyping) {
                    return (
                      <span style={{ color: 'var(--ack-success)', fontStyle: 'italic', fontWeight: 600 }}>
                        typing...
                      </span>
                    );
                  }
                  if (isRepo) {
                    return <span>main · CI passing</span>;
                  }
                  if (chat.isOnline) {
                    return (
                      <>
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: 'var(--ack-success)',
                            display: 'inline-block',
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ color: 'var(--ack-success)' }}>Online</span>
                      </>
                    );
                  }
                  return <span>last seen {formatLastSeen(chat.lastSeen, chat.statusTime)}</span>;
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Call Button + Overflow Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', position: 'relative' }}>
          {FEATURES.calls && (onOpenStartCallSheet || onOpenCall) && (
            <button
              type="button"
              id="btn-header-call"
              onClick={() => {
                if (onOpenStartCallSheet) onOpenStartCallSheet();
                else if (onOpenCall) onOpenCall('video');
              }}
              aria-label="Start a call"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--ack-text)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                padding: 0,
                borderRadius: '8px',
              }}
              title="Start a call"
            >
              <Phone size={19} strokeWidth={1.75} />
            </button>
          )}

          <button
            type="button"
            id="btn-chat-overflow"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenuDropdown(!showMenuDropdown);
            }}
            aria-label="Conversation options"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--ack-text)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              padding: 0,
              borderRadius: '8px',
            }}
          >
            <MoreVertical size={20} strokeWidth={1.75} />
          </button>

          {/* Overflow Menu Dropdown */}
          {showMenuDropdown && (
            <div
              style={{
                position: 'absolute',
                top: '46px',
                right: 0,
                background: 'var(--ack-surface)',
                border: '1px solid var(--ack-border)',
                borderRadius: 'var(--radius-card)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                minWidth: '210px',
                padding: '6px',
                zIndex: 100,
              }}
            >
              {FEATURES.calls && (onOpenStartCallSheet || onOpenCall) && (
                <button
                  type="button"
                  onClick={() => {
                    setShowMenuDropdown(false);
                    if (onOpenStartCallSheet) onOpenStartCallSheet();
                    else if (onOpenCall) onOpenCall('video');
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--ack-text)',
                    fontSize: '13px',
                    borderRadius: '8px',
                    textAlign: 'left',
                  }}
                >
                  <Phone size={16} strokeWidth={1.75} />
                  <span>Start a call...</span>
                </button>
              )}
              {FEATURES.pairProgramming && onOpenCall && (
                <button
                  type="button"
                  onClick={() => {
                    setShowMenuDropdown(false);
                    onOpenCall('pair');
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--ack-accent-text, #A99DFF)',
                    fontSize: '13px',
                    borderRadius: '8px',
                    textAlign: 'left',
                  }}
                >
                  <Video size={16} strokeWidth={1.75} />
                  <span>Pair programming</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setShowMenuDropdown(false);
                  onSendVault();
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--ack-warning)',
                  fontSize: '13px',
                  borderRadius: '8px',
                  textAlign: 'left',
                }}
              >
                <Shield size={16} strokeWidth={1.75} />
                <span>Transmit secret vault</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowMenuDropdown(false);
                  onSendCode();
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--ack-accent-text)',
                  fontSize: '13px',
                  borderRadius: '8px',
                  textAlign: 'left',
                }}
              >
                <FileCode size={16} strokeWidth={1.75} />
                <span>Transmit code snippet</span>
              </button>
              {onOpenSettings && (
                <button
                  type="button"
                  id="btn-menu-settings"
                  onClick={() => {
                    setShowMenuDropdown(false);
                    onOpenSettings();
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--ack-text)',
                    fontSize: '13px',
                    borderRadius: '8px',
                    textAlign: 'left',
                    borderTop: '1px solid var(--ack-divider)',
                    marginTop: '2px',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--ack-surface-2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <Settings size={16} strokeWidth={1.75} />
                  <span>Settings</span>
                </button>
              )}

              {/* Group Info (if group chat) */}
              {chat?.type === 'group' && onOpenGroupInfo && (
                <button
                  type="button"
                  onClick={() => {
                    setShowMenuDropdown(false);
                    onOpenGroupInfo(chat);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--ack-text)',
                    fontSize: '13px',
                    borderRadius: '8px',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--ack-surface-2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <Info size={16} strokeWidth={1.75} />
                  <span>Group info</span>
                </button>
              )}

              {/* Clear Messages */}
              <button
                type="button"
                onClick={() => {
                  setShowMenuDropdown(false);
                  setConfirmChatModal({ type: 'clear_chat' });
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--ack-text)',
                  fontSize: '13px',
                  borderRadius: '8px',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--ack-surface-2)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <RotateCcw size={16} strokeWidth={1.75} />
                <span>Clear messages</span>
              </button>

              <div style={{ height: '1px', background: 'var(--ack-divider, #26262B)', margin: '4px 0' }} />

              {/* Exit / Delete Group OR Delete Chat */}
              {chat?.type === 'group' ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenuDropdown(false);
                      setConfirmChatModal({ type: 'exit_group' });
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      background: 'transparent',
                      border: 'none',
                      color: '#F87171',
                      fontSize: '13px',
                      borderRadius: '8px',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(248, 113, 113, 0.12)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <LogOut size={16} strokeWidth={1.75} />
                    <span>Exit group</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenuDropdown(false);
                      setConfirmChatModal({ type: 'delete_group' });
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      background: 'transparent',
                      border: 'none',
                      color: '#EF4444',
                      fontSize: '13px',
                      fontWeight: 600,
                      borderRadius: '8px',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <Trash2 size={16} strokeWidth={1.75} />
                    <span>Delete group</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setShowMenuDropdown(false);
                    setConfirmChatModal({ type: 'delete_chat' });
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    background: 'transparent',
                    border: 'none',
                    color: '#EF4444',
                    fontSize: '13px',
                    fontWeight: 600,
                    borderRadius: '8px',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <Trash2 size={16} strokeWidth={1.75} />
                  <span>Delete chat</span>
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Offline Neutral Banner (Phase 6b) */}
      {isOffline && (
        <div
          style={{
            backgroundColor: '#1C1C22',
            borderBottom: '1px solid #26262B',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: '#A1A1AA',
            fontSize: '12.5px',
            fontFamily: 'Inter, sans-serif',
            userSelect: 'none',
            flexShrink: 0,
          }}
        >
          <WifiOff size={14} color="#71717A" />
          <span>You're offline. Messages will send when you're back.</span>
        </div>
      )}

      {/* 2. Message Stream Container */}
      <div
        className="ack-message-scroll"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Quiet Muted Honest Copy Line (Matches Conversation@1x.png) */}
        <div
          style={{
            textAlign: 'center',
            margin: '8px 0 14px 0',
            color: 'var(--ack-muted)',
            fontSize: '12px',
            fontFamily: 'Inter, sans-serif',
            userSelect: 'none',
          }}
        >
          Today · Vault secrets are encrypted in your browser
        </div>

        {/* Screen 4: Auto-connected first chat system note */}
        {isInviteChat && (
          <div
            id="invite-connected-note"
            style={{
              margin: '8px auto 16px auto',
              maxWidth: '380px',
              width: '92%',
              background: '#131316',
              border: '1px solid #222228',
              borderRadius: '16px',
              padding: '16px 20px',
              textAlign: 'center',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                fontSize: '13.5px',
                color: '#A0A0A8',
                lineHeight: 1.5,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              You joined through the invite from @{inviterHandle}.<br />
              You're now connected.
            </div>
          </div>
        )}

        {/* Message Stream */}
        {messages.map((msg) => {
          const isMe = checkIsMe(msg);
          const isImage = msg.type === 'image';
          const isDoc = msg.type === 'document';
          const isPrCard = msg.type === 'pr_card';
          const isVault = msg.type === 'env_secret';
          const isAudio = msg.type === 'audio_note';
          const isCode = msg.type === 'code';

          // PR Card is full-width custom card
          if (isPrCard) {
            const additions = msg.metadata?.prAdditions || 340;
            const deletions = msg.metadata?.prDeletions || 48;
            const total = additions + deletions || 1;
            const addPct = Math.round((additions / total) * 100);
            const delPct = 100 - addPct;

            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  width: '100%',
                  margin: '4px 0',
                }}
              >
                <div
                  className="ack-pr-card"
                  style={{
                    width: '100%',
                    maxWidth: '360px',
                    background: 'var(--ack-surface)',
                    border: '1px solid var(--ack-border)',
                    borderRadius: 'var(--radius-card)',
                    padding: '16px',
                    boxSizing: 'border-box',
                  }}
                >
                  {/* PR Header: PR #28 on left, +340 -48 on right */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '13px',
                      fontWeight: 700,
                      marginBottom: '8px',
                    }}
                  >
                    <div>
                      <span style={{ color: 'var(--ack-accent-text)' }}>PR </span>
                      <span style={{ color: 'var(--ack-text)' }}>#{msg.metadata?.prNumber || 28}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{ color: 'var(--ack-success)' }}>+{additions}</span>
                      <span style={{ color: 'var(--ack-danger)' }}>-{deletions}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <div
                    style={{
                      fontSize: '15px',
                      fontWeight: 700,
                      color: 'var(--ack-text)',
                      fontFamily: 'Inter, sans-serif',
                      lineHeight: 1.35,
                      marginBottom: '12px',
                    }}
                  >
                    {msg.metadata?.prTitle || msg.content}
                  </div>

                  {/* Diff Progress Bar */}
                  <div
                    style={{
                      width: '100%',
                      height: '4px',
                      borderRadius: '9999px',
                      background: 'var(--ack-border)',
                      display: 'flex',
                      overflow: 'hidden',
                      marginBottom: '10px',
                    }}
                  >
                    <div style={{ width: `${addPct}%`, background: 'var(--ack-success)' }} />
                    <div style={{ width: `${delPct}%`, background: 'var(--ack-danger)' }} />
                  </div>

                  {/* CI Status Line */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                      color: 'var(--ack-muted)',
                      fontFamily: 'Inter, sans-serif',
                      marginBottom: '14px',
                    }}
                  >
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: 'var(--ack-success)',
                        display: 'inline-block',
                      }}
                    />
                    <span>CI passing · {msg.metadata?.filesChanged || 3} files changed</span>
                  </div>

                  {/* Full-width "Review diff" Button */}
                  <button
                    type="button"
                    id={`btn-review-diff-${msg.id}`}
                    onClick={() =>
                      handleTriggerReview({
                        title: msg.metadata?.prTitle || msg.content,
                        prNumber: msg.metadata?.prNumber || 28,
                        prBranch: msg.metadata?.prBranch || 'main',
                        diffFiles: msg.metadata?.diffFiles,
                        repoName: chat.repoTag || chat.name,
                      })
                    }
                    style={{
                      width: '100%',
                      height: '44px',
                      borderRadius: 'var(--radius-button)',
                      background: 'var(--ack-accent)',
                      border: 'none',
                      color: '#0B0B0D',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 700,
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'opacity 150ms ease',
                    }}
                  >
                    Review diff
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isMe ? 'flex-end' : 'flex-start',
                position: 'relative',
              }}
              onDoubleClick={() => setActiveReactionMenuId(msg.id)}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                ignoreBackdropClickUntilRef.current = Date.now() + 100;
                setActionMessage(msg);
                setActionMenuPosition({
                  x: Math.min(e.clientX, window.innerWidth - 180),
                  y: Math.min(e.clientY, window.innerHeight - 240),
                });
              }}
            >
              {/* Incoming Sender Header */}
              {!isMe && (
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: chat.type === 'group' ? 600 : 400,
                    color: chat.type === 'group' ? '#A99DFF' : 'var(--ack-muted)',
                    fontFamily: 'Inter, sans-serif',
                    marginBottom: '4px',
                    paddingLeft: '4px',
                  }}
                >
                  {msg.senderName} {chat.type !== 'group' && `· ${msg.timestamp}`}
                </div>
              )}

              {/* Message Bubble Container */}
              <div
                className={`ack-message-bubble ${isMe ? 'ack-bubble-own' : 'ack-bubble-incoming'}`}
                id={`msg-${msg.id}`}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  ignoreBackdropClickUntilRef.current = Date.now() + 100;
                  setActionMessage(msg);
                  setActionMenuPosition({
                    x: Math.min(e.clientX, window.innerWidth - 180),
                    y: Math.min(e.clientY, window.innerHeight - 240),
                  });
                }}
                onTouchStart={(e) => {
                  touchMovedRef.current = false;
                  const touch = e.touches[0];
                  touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };
                  if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
                  longPressTimerRef.current = setTimeout(() => {
                    if (!touchMovedRef.current) {
                      ignoreBackdropClickUntilRef.current = Date.now() + 500;
                      try {
                        navigator.vibrate?.(40);
                      } catch {}
                      setActionMessage(msg);
                      setActionMenuPosition({
                        x: Math.min(touch.clientX, window.innerWidth - 180),
                        y: Math.min(touch.clientY, window.innerHeight - 240),
                      });
                    }
                  }, 400);
                }}
                onTouchMove={(e) => {
                  if (touchStartPosRef.current && e.touches[0]) {
                    const dx = e.touches[0].clientX - touchStartPosRef.current.x;
                    const dy = e.touches[0].clientY - touchStartPosRef.current.y;
                    if (Math.sqrt(dx * dx + dy * dy) > 10) {
                      touchMovedRef.current = true;
                      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
                    }
                  }
                }}
                onTouchEnd={(e) => {
                  if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
                  if (Date.now() < ignoreBackdropClickUntilRef.current) {
                    try {
                      e.preventDefault();
                    } catch {}
                  }
                }}
                onClick={() => {
                  if (isVault && msg.metadata?.isBurned && onOpenBurnedSecret) {
                    onOpenBurnedSecret(
                      msg.senderName,
                      msg.content || 'Production keys',
                      msg.metadata?.copiedAt || '1h ago'
                    );
                  }
                }}
                style={{
                  maxWidth: isImage || isDoc ? '85%' : '78%',
                  background: isImage
                    ? 'transparent'
                    : isMe
                    ? 'var(--ack-accent-tint)'
                    : 'var(--ack-surface-2)',
                  border: isImage
                    ? 'none'
                    : msg.status === 'failed' || msg.metadata?.isFailed
                    ? '1.5px solid #F87171'
                    : isMe
                    ? 'none'
                    : '1px solid var(--ack-border)',
                  boxShadow:
                    msg.status === 'failed' || msg.metadata?.isFailed
                      ? '0 0 12px rgba(248, 113, 113, 0.25)'
                      : 'none',
                  color: isMe ? '#EEEBFF' : 'var(--ack-text)',
                  borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  padding: isImage ? '0' : '10px 14px',
                  fontSize: '14.5px',
                  lineHeight: '20px',
                  fontFamily: 'Inter, sans-serif',
                  position: 'relative',
                  wordBreak: 'break-word',
                  cursor: isVault && msg.metadata?.isBurned ? 'pointer' : 'default',
                }}
              >
                {/* Message menu trigger (Hover on desktop, subtle button on mobile) */}
                <button
                  type="button"
                  className="ack-bubble-menu-trigger"
                  aria-label="Message options"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    ignoreBackdropClickUntilRef.current = Date.now() + 100;
                    const rect = e.currentTarget.getBoundingClientRect();
                    setActionMessage(msg);
                    setActionMenuPosition({
                      x: Math.min(rect.right - 20, window.innerWidth - 180),
                      y: Math.min(rect.bottom + 4, window.innerHeight - 240),
                    });
                  }}
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: isMe ? 'auto' : '4px',
                    left: isMe ? '4px' : 'auto',
                    background: 'rgba(24, 24, 28, 0.85)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '50%',
                    width: '22px',
                    height: '22px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#A1A1AA',
                    cursor: 'pointer',
                    padding: 0,
                    zIndex: 10,
                    opacity: 0,
                    transition: 'opacity 150ms ease, background 150ms ease, color 150ms ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#FFF';
                    e.currentTarget.style.background = '#2A2A33';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#A1A1AA';
                    e.currentTarget.style.background = 'rgba(24, 24, 28, 0.85)';
                  }}
                >
                  <MoreVertical size={13} strokeWidth={2} />
                </button>
                {/* 1. Image */}
                {isImage && (
                  <ImageMessage
                    imageUrl={msg.metadata?.imageUrl || ''}
                    caption={msg.metadata?.imageCaption || msg.content}
                    timestamp={msg.timestamp}
                    isMe={isMe}
                  />
                )}

                {/* 2. Document */}
                {isDoc && (
                  <DocumentMessage
                    fileName={msg.metadata?.docName || msg.content}
                    fileSize={msg.metadata?.docSize}
                    fileType={msg.metadata?.docType}
                    fileUrl={msg.metadata?.docUrl}
                    timestamp={msg.timestamp}
                    isMe={isMe}
                  />
                )}

                {/* Forwarded Header */}
                {msg.metadata?.isForwarded && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#A1A1AA', fontStyle: 'italic', marginBottom: '4px' }}>
                    <CornerUpRight size={12} />
                    <span>Forwarded</span>
                  </div>
                )}

                {/* 3. Text Message with Deleted / Mentions highlighting */}
                {msg.type === 'text' && (
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {msg.content === '[DELETED]' || msg.metadata?.isDeletedForEveryone ? (
                      <span style={{ fontStyle: 'italic', color: '#8E8E93', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Ban size={14} />
                        {isMe ? 'You deleted this message' : 'This message was deleted'}
                      </span>
                    ) : (
                      renderMessageContentWithMentions(msg.content)
                    )}
                  </div>
                )}

                {/* 4. Code Snippet */}
                {isCode && (
                  <div>
                    {msg.content && <div style={{ marginBottom: 6 }}>{msg.content}</div>}
                    <CodeMessage
                      language={msg.metadata?.language}
                      code={msg.metadata?.codeSnippet || ''}
                      title={msg.metadata?.prTitle}
                      onOpenReview={() =>
                        handleTriggerReview({
                          title: msg.metadata?.prTitle || msg.content || 'Code Snippet',
                          codeSnippet: msg.metadata?.codeSnippet,
                          language: msg.metadata?.language,
                          repoName: chat.repoTag || chat.name,
                        })
                      }
                    />
                  </div>
                )}

                {/* 5. Secret Vault */}
                {isVault && (
                  <VaultMessage
                    chatId={chat.id}
                    messageId={msg.id}
                    secretTitle={msg.content || 'Production keys'}
                    senderName={msg.senderName}
                    senderAvatar={msg.senderAvatar}
                    timestamp={msg.timestamp}
                    secretMasked={msg.metadata?.secretMasked}
                    ttlSeconds={msg.metadata?.ttlSeconds}
                    isBurned={msg.metadata?.isBurned}
                  />
                )}

                {/* 6. Audio Voice Note */}
                {isAudio && (
                  <AudioWaveBubble
                    duration={msg.metadata?.audioDuration || '0:18'}
                    waveform={msg.metadata?.waveform}
                    timestamp={msg.timestamp}
                    isMe={isMe}
                    audioUrl={msg.metadata?.audioUrl}
                  />
                )}

                {/* "N replies" thread link under a message */}
                {FEATURES.threads && msg.metadata?.repliesCount && msg.metadata.repliesCount > 0 && (
                  <button
                    type="button"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      marginTop: '8px',
                      background: 'rgba(139, 124, 255, 0.1)',
                      border: '1px solid rgba(139, 124, 255, 0.25)',
                      borderRadius: '6px',
                      color: '#A99DFF',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: '3px 8px',
                    }}
                  >
                    <MessageSquare size={12} />
                    <span>{msg.metadata.repliesCount} replies</span>
                  </button>
                )}

                {/* Own Message Footer: Timestamp + (edited) + Ack Double-Check Mark with Read Receipts */}
                {isMe && !isImage && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: '4px',
                      marginTop: '4px',
                      fontSize: '11px',
                      color: 'var(--ack-accent-text)',
                      userSelect: 'none',
                    }}
                  >
                    <span>{msg.timestamp}</span>
                    {msg.metadata?.isEdited && (
                      <span style={{ fontSize: '10.5px', opacity: 0.75, fontStyle: 'italic' }}>(edited)</span>
                    )}
                    {msg.status === 'pending' || msg.status === 'queued' ? (
                      <Clock size={12} style={{ color: '#71717A' }} />
                    ) : msg.status === 'delivered' ? (
                      <CheckCheck size={14} strokeWidth={2.2} style={{ color: '#71717A' }} />
                    ) : msg.status === 'read' ? (
                      <CheckCheck
                        size={14}
                        strokeWidth={2.2}
                        style={{
                          color:
                            localStorage.getItem('ack_read_receipts') !== 'false'
                              ? '#53BDEB'
                              : '#71717A',
                        }}
                      />
                    ) : (
                      /* Default 'sent': Single grey tick */
                      <Check size={14} strokeWidth={2.2} style={{ color: '#71717A' }} />
                    )}
                  </div>
                )}
              </div>

              {/* Failed Message Actions (Danger outline, Not sent, Retry and Delete) */}
              {(msg.status === 'failed' || msg.metadata?.isFailed) && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginTop: '4px',
                    fontSize: '11px',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  <span style={{ color: '#F87171', fontWeight: 600 }}>Not sent</span>
                  <span style={{ color: '#52525B' }}>•</span>
                  <button
                    onClick={() => webStore.resendFailedMessage(chat.id, msg.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#8B7CFF',
                      cursor: 'pointer',
                      padding: 0,
                      fontWeight: 600,
                      textDecoration: 'underline',
                    }}
                  >
                    Retry
                  </button>
                  <span style={{ color: '#52525B' }}>•</span>
                  <button
                    onClick={() => handleDeleteMessage(msg.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#71717A',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}

              {/* Reactions Bar */}
              {msg.metadata?.reactions && (
                <Reactions
                  reactions={msg.metadata.reactions}
                  onToggleReaction={(emoji) => handleToggleReaction(msg.id, emoji)}
                  onDeleteMessage={() => handleDeleteMessage(msg.id)}
                  isMe={isMe}
                  showBar={activeReactionMenuId === msg.id}
                  onCloseBar={() => setActiveReactionMenuId(null)}
                />
              )}
            </div>
          );
        })}
        {chat && webStore.getTypingUser(chat.id) && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              marginBottom: '8px',
              animation: 'ackFadeIn 150ms ease',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '16px 16px 16px 4px',
                background: 'var(--ack-surface-2)',
                border: '1px solid var(--ack-border)',
                color: 'var(--ack-muted)',
                fontSize: '13px',
              }}
            >
              <span className="ack-typing-dots">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </span>
              <span style={{ fontSize: '12px', fontStyle: 'italic', color: 'var(--ack-success)' }}>
                {webStore.getTypingUser(chat.id)} is typing...
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Attach Popup Menu */}
      {showAttachMenu && (
        <div
          style={{
            position: 'absolute',
            bottom: '72px',
            left: '16px',
            background: 'var(--ack-surface)',
            border: '1px solid var(--ack-border)',
            borderRadius: 'var(--radius-card)',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            zIndex: 60,
            minWidth: '180px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              background: 'transparent',
              border: 'none',
              color: 'var(--ack-text)',
              fontSize: '13px',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <ImageIcon size={18} strokeWidth={1.75} />
            <span>Image</span>
          </button>

          <button
            type="button"
            onClick={() => docInputRef.current?.click()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              background: 'transparent',
              border: 'none',
              color: 'var(--ack-text)',
              fontSize: '13px',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <FileText size={18} strokeWidth={1.75} />
            <span>Document</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowAttachMenu(false);
              onSendCode();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              background: 'transparent',
              border: 'none',
              color: 'var(--ack-text)',
              fontSize: '13px',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <FileCode size={18} strokeWidth={1.75} />
            <span>Code snippet</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowAttachMenu(false);
              onSendVault();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              background: 'transparent',
              border: 'none',
              color: 'var(--ack-warning)',
              fontSize: '13px',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <Lock size={18} strokeWidth={1.75} />
            <span>Secret vault</span>
          </button>
        </div>
      )}

      {/* Hidden file pickers */}
      <input
        type="file"
        ref={imageInputRef}
        onChange={handleImageSelected}
        accept="image/*"
        style={{ display: 'none' }}
      />
      <input
        type="file"
        ref={docInputRef}
        onChange={handleDocSelected}
        style={{ display: 'none' }}
      />

      {/* Emoji Drawer & Image Preview Sheets */}
      <EmojiPicker
        isOpen={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
        onSelectEmoji={handleSelectEmoji}
      />
      <ImagePreviewSheet
        isOpen={Boolean(previewImage)}
        imageSrc={previewImage}
        fileName={previewImageName}
        onClose={() => {
          setPreviewImage(null);
          setPreviewImageName('');
        }}
        onSend={handleSendImageWithCaption}
      />

      {/* Screen 4: Quick reply chips for invite newcomer */}
      {showQuickChips && (
        <div
          id="invite-quick-chips"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 16px 6px 16px',
            background: 'var(--ack-bg, #0B0B0D)',
            overflowX: 'auto',
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={() => {
              onSendMessage('Say hi');
              setDismissChips(true);
            }}
            id="btn-chip-say-hi"
            style={{
              padding: '8px 18px',
              borderRadius: '22px',
              background: '#141416',
              border: '1px solid #2C2C34',
              color: '#ECECEF',
              fontSize: '13.5px',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontFamily: 'Inter, sans-serif',
              transition: 'background 0.15s ease',
            }}
          >
            Say hi
          </button>
          <button
            type="button"
            onClick={() => {
              onSendMessage('Thanks for the invite');
              setDismissChips(true);
            }}
            id="btn-chip-thanks"
            style={{
              padding: '8px 18px',
              borderRadius: '22px',
              background: '#141416',
              border: '1px solid #2C2C34',
              color: '#ECECEF',
              fontSize: '13.5px',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontFamily: 'Inter, sans-serif',
              transition: 'background 0.15s ease',
            }}
          >
            Thanks for the invite
          </button>
        </div>
      )}

      {/* Editing Message Banner */}
      {editingMessage && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 16px',
            background: '#1A1829',
            borderTop: '1px solid #3B3366',
            color: '#ECECEF',
            fontSize: '13px',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
            <Pencil size={15} color="#8B7CFF" />
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <span style={{ fontWeight: 600, color: '#8B7CFF' }}>Edit message: </span>
              <span style={{ color: '#A1A1AA' }}>{editingMessage.content}</span>
            </div>
          </div>
          <button
            onClick={() => {
              setEditingMessage(null);
              setInputText('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#A1A1AA',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* 3. Composer Footer (Matches Conversation@1x.png) */}
      <footer
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 16px',
          paddingBottom: 'calc(10px + env(safe-area-inset-bottom, 0px))',
          background: 'var(--ack-bg)',
          borderTop: '1px solid var(--ack-divider)',
          zIndex: 30,
          flexShrink: 0,
        }}
      >
        {isRecording ? (
          /* Live Audio Recording Bar */
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--ack-surface)',
              borderRadius: '22px',
              padding: '8px 16px',
              border: '1px solid var(--ack-danger)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: 'var(--ack-danger)',
                }}
              />
              <span style={{ color: 'var(--ack-text)', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px' }}>
                0:{recordingSeconds < 10 ? '0' : ''}{recordingSeconds}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={cancelRecording}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--ack-danger)',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <Trash2 size={18} />
              </button>
              <button
                type="button"
                onClick={sendRecording}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'var(--ack-accent)',
                  border: 'none',
                  color: '#0B0B0D',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <Send size={15} strokeWidth={2.2} />
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Attach Button */}
            <button
              type="button"
              id="btn-attach"
              onClick={(e) => {
                e.stopPropagation();
                setShowAttachMenu(!showAttachMenu);
              }}
              aria-label="Attach file or secret"
              style={{
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: 'none',
                color: 'var(--ack-text)',
                cursor: 'pointer',
                padding: 0,
                flexShrink: 0,
              }}
            >
              <Paperclip size={20} strokeWidth={1.75} />
            </button>

            {/* Rounded Input Pill */}
            <form onSubmit={handleSend} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              <input
                type="text"
                id="ack-input-message"
                value={inputText}
                onChange={handleInputChange}
                placeholder={editingMessage ? "Edit message..." : "Message"}
                style={{
                  width: '100%',
                  height: '44px',
                  background: 'var(--ack-surface)',
                  border: '1px solid var(--ack-border)',
                  borderRadius: '22px',
                  padding: '0 18px',
                  color: 'var(--ack-text)',
                  fontSize: '14.5px',
                  fontFamily: 'Inter, sans-serif',
                  outline: 'none',
                }}
              />
            </form>

            {/* Mic or Send Button */}
            {inputText.trim() ? (
              <button
                type="button"
                id="btn-send-message"
                onClick={handleSend}
                aria-label="Send message"
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'var(--ack-accent)',
                  border: 'none',
                  color: '#0B0B0D',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <Send size={18} strokeWidth={2.2} />
              </button>
            ) : (
              <button
                type="button"
                id="btn-mic-record"
                onClick={startRecording}
                aria-label="Record voice note"
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'var(--ack-accent)',
                  border: 'none',
                  color: '#0B0B0D',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <Mic size={20} strokeWidth={1.75} />
              </button>
            )}
          </>
        )}
      </footer>

      {/* Code Review Drawer if opened */}
      {effectiveReview && (
        <CodeReviewDrawer
          payload={effectiveReview}
          isOpen={true}
          onClose={handleCloseReview}
          onSendReviewComment={onSendReviewComment}
          isMobile={isMobileActive !== false}
        />
      )}

      {/* WhatsApp-Style Message Action Popup Menu */}
      {actionMenuPosition && actionMessage && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 9000 }}
            onClick={() => {
              if (Date.now() < ignoreBackdropClickUntilRef.current) return;
              setActionMenuPosition(null);
              setActionMessage(null);
            }}
          />
          <div
            style={{
              position: 'fixed',
              top: `${actionMenuPosition.y}px`,
              left: `${actionMenuPosition.x}px`,
              zIndex: 9001,
              backgroundColor: '#1E1E24',
              border: '1px solid #2F2F38',
              borderRadius: '12px',
              padding: '6px',
              boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
              minWidth: '150px',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}
          >
            {checkIsMe(actionMessage) &&
              actionMessage.type === 'text' &&
              actionMessage.content !== '[DELETED]' &&
              !actionMessage.metadata?.isDeletedForEveryone && (
                <button
                  onClick={() => {
                    setEditingMessage(actionMessage);
                    setInputText(actionMessage.content);
                    setActionMenuPosition(null);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'transparent',
                    border: 'none',
                    color: '#F4F4F5',
                    fontSize: '13px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#2A2A33')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <Pencil size={15} color="#8B7CFF" />
                  <span>Edit</span>
                </button>
              )}

            <button
              onClick={() => {
                setShowForwardSheet(true);
                setActionMenuPosition(null);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'transparent',
                border: 'none',
                color: '#F4F4F5',
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#2A2A33')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <CornerUpRight size={15} color="#38BDF8" />
              <span>Forward</span>
            </button>

            <button
              onClick={() => {
                navigator.clipboard?.writeText(actionMessage.content);
                setActionMenuPosition(null);
                setActionMessage(null);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'transparent',
                border: 'none',
                color: '#F4F4F5',
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#2A2A33')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <Copy size={15} color="#A1A1AA" />
              <span>Copy</span>
            </button>

            <button
              onClick={() => {
                setShowDeleteConfirm(true);
                setActionMenuPosition(null);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'transparent',
                border: 'none',
                color: '#EF4444',
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#2A2A33')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <Trash2 size={15} color="#EF4444" />
              <span>Delete</span>
            </button>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && actionMessage && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '320px',
              background: '#18181C',
              border: '1px solid #26262B',
              borderRadius: '16px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.7)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#F4F4F5' }}>Delete message?</div>
            <div style={{ fontSize: '13px', color: '#A1A1AA', lineHeight: 1.4 }}>
              {checkIsMe(actionMessage)
                ? 'You can delete this message for everyone or delete it from this device only.'
                : 'Delete this message from your device?'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
              {checkIsMe(actionMessage) &&
                !actionMessage.metadata?.isDeletedForEveryone &&
                actionMessage.content !== '[DELETED]' && (
                  <button
                    onClick={() => {
                      if (chat) webStore.deleteMessageForEveryone(chat.id, actionMessage.id);
                      setShowDeleteConfirm(false);
                      setActionMessage(null);
                    }}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: '#DC2626',
                      border: 'none',
                      color: '#fff',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Delete for everyone
                  </button>
                )}
              <button
                onClick={() => {
                  if (chat) webStore.deleteMessageForMe(chat.id, actionMessage.id);
                  setShowDeleteConfirm(false);
                  setActionMessage(null);
                }}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: '#27272A',
                  border: 'none',
                  color: '#F4F4F5',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Delete for me
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  background: 'transparent',
                  border: 'none',
                  color: '#A1A1AA',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Forward Message Modal */}
      {showForwardSheet && actionMessage && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setShowForwardSheet(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '360px',
              maxHeight: '70vh',
              background: '#18181C',
              border: '1px solid #26262B',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0,0,0,0.7)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderBottom: '1px solid #26262B',
              }}
            >
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#F4F4F5' }}>Forward message to...</span>
              <button
                onClick={() => setShowForwardSheet(false)}
                style={{ background: 'none', border: 'none', color: '#A1A1AA', cursor: 'pointer', display: 'flex' }}
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ overflowY: 'auto', padding: '8px' }}>
              {webStore.getChats().filter((c) => c.id !== chat?.id && !isMockChat(c)).length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#71717A', fontSize: '13px' }}>
                  No other active chats available
                </div>
              ) : (
                webStore
                  .getChats()
                  .filter((c) => c.id !== chat?.id && !isMockChat(c))
                  .map((targetChat) => (
                    <button
                      key={targetChat.id}
                      onClick={() => {
                        webStore.forwardMessage(targetChat.id, actionMessage);
                        setShowForwardSheet(false);
                        setActionMessage(null);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        width: '100%',
                        padding: '10px 12px',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '10px',
                        color: '#F4F4F5',
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#27272A')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <img
                        src={targetChat.avatar}
                        alt={targetChat.name}
                        style={{ width: '36px', height: '36px', borderRadius: '50%' }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: '14px',
                            fontWeight: 600,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {targetChat.name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#71717A' }}>@{targetChat.username}</div>
                      </div>
                    </button>
                  ))
              )}
            </div>
          </div>
        </div>
      )}
      {/* WhatsApp Header Actions Confirmation Dialog */}
      {confirmChatModal && chat && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            backgroundColor: 'rgba(11, 11, 13, 0.8)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setConfirmChatModal(null)}
        >
          <div
            style={{
              backgroundColor: '#18181B',
              border: '1px solid #27272A',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '420px',
              width: '100%',
              boxShadow: '0 24px 50px rgba(0, 0, 0, 0.75)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                margin: '0 0 12px 0',
                fontSize: '17px',
                fontWeight: 600,
                color: '#F4F4F5',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {confirmChatModal.type === 'delete_chat'
                ? 'Delete this chat?'
                : confirmChatModal.type === 'delete_group'
                ? `Delete "${chat.name}" group?`
                : confirmChatModal.type === 'exit_group'
                ? `Exit "${chat.name}" group?`
                : 'Clear this chat?'}
            </h3>

            <p
              style={{
                margin: '0 0 24px 0',
                fontSize: '13.5px',
                color: '#A1A1AA',
                lineHeight: 1.5,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {confirmChatModal.type === 'delete_chat'
                ? 'Messages will be removed from this device.'
                : confirmChatModal.type === 'delete_group'
                ? 'Messages will be removed from this device.'
                : confirmChatModal.type === 'exit_group'
                ? 'You will no longer be able to send or receive messages in this group.'
                : 'All messages in this conversation will be permanently deleted from this device.'}
            </p>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
              }}
            >
              <button
                type="button"
                onClick={() => setConfirmChatModal(null)}
                style={{
                  padding: '9px 18px',
                  borderRadius: '24px',
                  backgroundColor: 'transparent',
                  border: '1px solid #3F3F46',
                  color: '#E4E4E7',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'background-color 150ms ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#27272A')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  const actionType = confirmChatModal.type;
                  const targetChatId = chat.id;
                  setConfirmChatModal(null);

                  if (actionType === 'delete_chat' || actionType === 'delete_group') {
                    if (onDeleteChat) {
                      onDeleteChat(targetChatId);
                    } else {
                      webStore.deleteChat(targetChatId);
                    }
                    onBackToSidebar();
                  } else if (actionType === 'exit_group') {
                    if (onLeaveGroup) {
                      onLeaveGroup(targetChatId);
                    } else {
                      webStore.leaveGroup(targetChatId);
                    }
                    onBackToSidebar();
                  } else if (actionType === 'clear_chat') {
                    if (onClearChat) {
                      onClearChat(targetChatId);
                    } else {
                      webStore.clearChatMessages(targetChatId);
                    }
                  }
                }}
                style={{
                  padding: '9px 20px',
                  borderRadius: '24px',
                  backgroundColor: '#EF4444',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.35)',
                  transition: 'background-color 150ms ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#DC2626')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#EF4444')}
              >
                {confirmChatModal.type === 'delete_chat'
                  ? 'Delete chat'
                  : confirmChatModal.type === 'delete_group'
                  ? 'Delete group'
                  : confirmChatModal.type === 'exit_group'
                  ? 'Exit group'
                  : 'Clear chat'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export const WhatsAppChatArea = ChatView;

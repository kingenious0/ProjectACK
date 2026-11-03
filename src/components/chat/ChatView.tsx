import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  MoreVertical,
  Paperclip,
  Mic,
  Send,
  CheckCheck,
  Check,
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
} from 'lucide-react';
import { Chat, Message, CURRENT_USER, webStore } from '../../web-db/store';
import { getInitials } from './ChatList';
import { CodeMessage } from './CodeMessage';
import { VaultMessage } from './VaultMessage';
import { ImageMessage } from './ImageMessage';
import { DocumentMessage } from './DocumentMessage';
import { EmojiPicker } from './EmojiPicker';
import { ImagePreviewSheet } from './ImagePreviewSheet';
import { Reactions } from './Reactions';
import { AudioWaveBubble } from '../AudioWaveBubble';
import { CodeReviewDrawer, CodeReviewPayload } from './CodeReviewDrawer';

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
  isMobileActive?: boolean;
  activeReviewPayload?: CodeReviewPayload | null;
  onOpenReview?: (payload: CodeReviewPayload) => void;
  onCloseReview?: () => void;
  onSendReviewComment?: (comment: string) => void;
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
}) => {
  const [inputText, setInputText] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [activeReactionMenuId, setActiveReactionMenuId] = useState<string | null>(null);
  const [internalReviewPayload, setInternalReviewPayload] = useState<CodeReviewPayload | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

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
  }, [messages, isRecording]);

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
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
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
          Vault secrets are encrypted in your browser.
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
                <span>
                  {chat.type === 'group' && chat.members
                    ? `${chat.members.length} members · tap for info`
                    : isRepo
                    ? 'main · CI passing'
                    : chat.statusText || 'online'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Call Button + Overflow Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', position: 'relative' }}>
          {(onOpenStartCallSheet || onOpenCall) && (
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
              {(onOpenStartCallSheet || onOpenCall) && (
                <>
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
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenuDropdown(false);
                      if (onOpenCall) onOpenCall('pair');
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
                </>
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
                  }}
                >
                  <Settings size={16} strokeWidth={1.75} />
                  <span>Settings</span>
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

        {/* Message Stream */}
        {messages.map((msg) => {
          const isMe = msg.senderId === CURRENT_USER.id;
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

                {/* 3. Text Message with @mentions highlighting */}
                {msg.type === 'text' && (
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {renderMessageContentWithMentions(msg.content)}
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
                {msg.metadata?.repliesCount && msg.metadata.repliesCount > 0 && (
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

                {/* Own Message Footer: Timestamp + Ack Double-Check Mark */}
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
                    <CheckCheck size={14} strokeWidth={2.2} style={{ color: 'var(--ack-accent)' }} />
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
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Message"
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
    </main>
  );
};

export const WhatsAppChatArea = ChatView;

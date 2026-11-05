import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  Phone,
  Video,
  Search,
  MoreVertical,
  Smile,
  Paperclip,
  Mic,
  Send,
  Lock,
  CheckCheck,
  Check,
  FileCode,
  Shield,
  FileText,
  Image as ImageIcon,
  Flame,
  Trash2,
  Radio,
  GitBranch,
  GitPullRequest,
  Columns,
  Activity,
  CheckCircle2,
  Terminal,
  ExternalLink,
  Code2,
} from 'lucide-react';
import { Chat, Message, CURRENT_USER, webStore, DiffFile } from '../../web-db/store';
import { WhatsAppCodeBubble } from './WhatsAppCodeBubble';
import { WhatsAppVaultBubble } from './WhatsAppVaultBubble';
import { WhatsAppImageBubble } from './WhatsAppImageBubble';
import { WhatsAppDocumentBubble } from './WhatsAppDocumentBubble';
import { WhatsAppEmojiPicker } from './WhatsAppEmojiPicker';
import { WhatsAppImagePreviewModal } from './WhatsAppImagePreviewModal';
import { WhatsAppReactions } from './WhatsAppReactions';
import { AudioWaveBubble } from '../AudioWaveBubble';
import { CodeReviewDrawer, CodeReviewPayload } from './CodeReviewDrawer';

interface WhatsAppChatAreaProps {
  chat: Chat | null;
  messages: Message[];
  onSendMessage: (text: string) => void;
  onSendCode: () => void;
  onSendVault: () => void;
  onBackToSidebar: () => void;
  onOpenCall?: (type: 'audio' | 'video') => void;
  isMobileActive?: boolean;
  activeReviewPayload?: CodeReviewPayload | null;
  onOpenReview?: (payload: CodeReviewPayload) => void;
  onCloseReview?: () => void;
  onSendReviewComment?: (comment: string) => void;
}

export const WhatsAppChatArea: React.FC<WhatsAppChatAreaProps> = ({
  chat,
  messages,
  onSendMessage,
  onSendCode,
  onSendVault,
  onBackToSidebar,
  onOpenCall,
  isMobileActive = false,
  activeReviewPayload,
  onOpenReview,
  onCloseReview,
  onSendReviewComment,
}) => {
  const [inputText, setInputText] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeReactionMenuId, setActiveReactionMenuId] = useState<string | null>(null);
  const [showRepoSheet, setShowRepoSheet] = useState(false);
  const [internalReviewPayload, setInternalReviewPayload] = useState<CodeReviewPayload | null>(null);

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

  // Audio voice note recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingTimerRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isRecording]);

  // Recording timer effect
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

  if (!chat) {
    return (
      <main
        className="wa-empty-chat-pane"
        style={{
          flex: 1,
          height: '100%',
          background: 'var(--wa-bg-deep)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          borderBottom: '4px solid var(--wa-accent-green)',
        }}
      >
        <div
          style={{
            width: '96px',
            height: '96px',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(0, 255, 204, 0.15), rgba(0, 229, 255, 0.05))',
            border: '1px solid rgba(0, 255, 204, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px',
            boxShadow: '0 0 32px rgba(0, 255, 204, 0.12)',
          }}
        >
          <Lock size={42} color="var(--wa-accent-green)" />
        </div>
        <h2 style={{ color: 'var(--wa-text-primary)', fontSize: '28px', fontWeight: 700, marginBottom: '10px', letterSpacing: '-0.02em', fontFamily: 'JetBrains Mono, monospace' }}>
          ACK. <span style={{ color: 'var(--wa-accent-green)', fontSize: '20px', fontWeight: 600 }}>CHAT4DEVS</span>
        </h2>
        <p style={{ color: 'var(--wa-text-secondary)', fontSize: '14px', maxWidth: '460px', textAlign: 'center', lineHeight: 1.6 }}>
          Send zero-trust client-encrypted messages, review line-by-line pull requests, and exchange ephemeral Burn-After-Reading .env vaults.
        </p>
        <div style={{ marginTop: '28px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--wa-text-secondary)', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace' }}>
          <Lock size={13} color="var(--wa-accent-green)" />
          <span>Zero-Trust • Client-Encrypted Relay</span>
        </div>
      </main>
    );
  }

  // --- Handlers ---
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
    setShowEmojiPicker(false);
  };

  const handleSelectEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji);
  };

  // Image Picker Handler
  const handleImageSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreviewImageName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Reset input
    e.target.value = '';
    setShowAttachMenu(false);
  };

  const handleSendImageWithCaption = (caption: string) => {
    if (!previewImage) return;

    webStore.sendMessage(chat.id, caption || 'Shared photo', 'image', {
      imageUrl: previewImage,
      imageCaption: caption || undefined,
    });

    setPreviewImage(null);
    setPreviewImageName('');
  };

  // Document Picker Handler
  const handleDocSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

  // Voice Note Recording
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
      console.warn('Microphone permission not granted or unsupported, using synthetic audio note fallback', err);
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
      // Synthetic audio note fallback
      webStore.sendMessage(chat.id, `Voice note (${durationStr})`, 'audio_note', {
        audioDuration: durationStr,
        waveform: randomWaveform,
      });
    }

    setIsRecording(false);
    setRecordingSeconds(0);
  };

  // Reaction & Delete
  const handleToggleReaction = (msgId: string, emoji: string) => {
    webStore.addReaction(chat.id, msgId, emoji);
  };

  const handleDeleteMessage = (msgId: string) => {
    webStore.deleteMessage(chat.id, msgId);
  };

  return (
    <main
      className={`wa-chat-pane ${isMobileActive ? 'wa-active-mobile' : ''}`}
      id="whatsapp-chat-pane"
      style={{
        flex: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        background: 'var(--wa-bg-chat)',
        minWidth: 0,
      }}
      onClick={() => {
        if (showAttachMenu) setShowAttachMenu(false);
        if (activeReactionMenuId) setActiveReactionMenuId(null);
      }}
    >
      {/* Hidden file inputs for real device pickers */}
      <input
        type="file"
        ref={imageInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageSelected}
      />
      <input
        type="file"
        ref={docInputRef}
        style={{ display: 'none' }}
        onChange={handleDocSelected}
      />

      {/* 1. Terminal Breadcrumb Header (Dev Hub Pivot) */}
      <header
        className="wa-chat-header wa-terminal-chat-header"
        style={{
          height: '56px',
          background: 'var(--wa-bg-header)',
          padding: '0 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--wa-border-subtle)',
          zIndex: 15,
          flexShrink: 0,
        }}
      >
        {/* Left: Mobile Back Button + Terminal Path Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <button
            type="button"
            className="wa-mobile-back-btn"
            onClick={onBackToSidebar}
            title="Back to repos & relays"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--wa-accent-green)',
              padding: '6px',
              cursor: 'pointer',
              display: 'none',
              marginLeft: '-6px',
            }}
          >
            <ChevronLeft size={24} />
          </button>

          {/* Breadcrumb Path & Telemetry Button */}
          <div
            onClick={() => setShowRepoSheet(true)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer',
              minWidth: 0,
            }}
            title="Click to view Repository Health & Webhook Telemetry"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
              <GitBranch size={14} color="var(--wa-accent-green)" style={{ flexShrink: 0 }} />
              <span
                style={{
                  color: 'var(--wa-text-primary)',
                  fontSize: '14px',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontFamily: 'JetBrains Mono, monospace',
                  letterSpacing: '-0.2px',
                }}
              >
                {chat.type === 'repo'
                  ? chat.repoTag || chat.name
                  : chat.type === 'ai'
                  ? 'ai-copilot / ack-agent ↳ #copilot'
                  : `@${chat.username} ↳ #relay`}
              </span>

              <span
                style={{
                  background: 'rgba(0, 255, 204, 0.1)',
                  color: 'var(--wa-accent-green)',
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: '4px',
                  fontFamily: 'JetBrains Mono, monospace',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <CheckCircle2 size={10} />
                <span>PASS</span>
              </span>
            </div>

            <div
              style={{
                color: 'var(--wa-text-secondary)',
                fontSize: '11px',
                fontFamily: 'JetBrains Mono, monospace',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>{chat.isOnline ? 'session: active' : 'last commit: 2843376'}</span>
              <span>&bull;</span>
              <span style={{ color: 'var(--wa-ticks-blue)' }}>telemetry ↗</span>
            </div>
          </div>
        </div>

        {/* Right Header Action Icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Split Review Toggle Button */}
          <button
            type="button"
            onClick={() => {
              if (effectiveReview) {
                handleCloseReview();
              } else {
                // Find latest code or pr_card message to review
                const targetMsg = messages
                  .slice()
                  .reverse()
                  .find((m) => m.type === 'code' || m.type === 'pr_card');
                if (targetMsg) {
                  handleTriggerReview({
                    title: targetMsg.metadata?.prTitle || targetMsg.content || 'Code Review',
                    codeSnippet: targetMsg.metadata?.codeSnippet,
                    language: targetMsg.metadata?.language,
                    prNumber: targetMsg.metadata?.prNumber,
                    prBranch: targetMsg.metadata?.prBranch,
                    diffFiles: targetMsg.metadata?.diffFiles,
                    repoName: chat.repoTag || chat.name,
                  });
                } else {
                  handleTriggerReview({
                    title: 'Active Code Canvas',
                    codeSnippet: '// No recent snippet selected.\n// Transmit a code bubble or select a PR card.',
                    language: 'rust',
                    repoName: chat.name,
                  });
                }
              }
            }}
            title={effectiveReview ? 'Close Split Review Canvas' : 'Open Split Review Canvas'}
            style={{
              background: effectiveReview ? 'var(--wa-accent-green)' : 'rgba(0, 255, 204, 0.12)',
              color: effectiveReview ? 'var(--wa-bg-deep)' : 'var(--wa-accent-green)',
              border: '1px solid rgba(0, 255, 204, 0.4)',
              borderRadius: '6px',
              padding: '5px 10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '11.5px',
              fontWeight: 700,
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            <Columns size={14} />
            <span className="wa-hide-tiny-mobile">{effectiveReview ? 'Close Split' : 'Split View'}</span>
          </button>

          {/* Quick .env Vault Key Button */}
          <button
            type="button"
            onClick={onSendVault}
            title="Transmit .env Vault Secret"
            style={{
              background: 'rgba(255, 184, 0, 0.1)',
              border: '1px solid rgba(255, 184, 0, 0.3)',
              color: 'var(--wa-vault-amber)',
              borderRadius: '6px',
              padding: '6px 8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Shield size={16} />
          </button>

          {/* Pairing Video / Audio Call */}
          {onOpenCall && (
            <button
              type="button"
              onClick={() => onOpenCall('video')}
              title="Start Pair Programming Video Call"
              className="wa-header-action-btn"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--wa-text-secondary)',
                cursor: 'pointer',
                padding: '6px',
              }}
            >
              <Video size={18} />
            </button>
          )}

          <button
            type="button"
            title="Terminal Options & Menu"
            className="wa-header-action-btn"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--wa-text-secondary)',
              cursor: 'pointer',
              padding: '6px',
            }}
          >
            <MoreVertical size={18} />
          </button>
        </div>
      </header>

      {/* 2. Main Action Canvas (Split View Container) */}
      <div
        className={`wa-chat-workspace-layout ${effectiveReview ? 'wa-has-split-review' : ''}`}
        style={{
          flex: 1,
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
          minHeight: 0,
        }}
      >
        <div
          className="wa-chat-stream-column"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minWidth: 0,
            position: 'relative',
          }}
        >
          {/* Chat Conversation Canvas */}
          <div
            className="wa-wallpaper-stream"
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px 5%',
              display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        {/* Security Encryption Lock Banner */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0 16px 0' }}>
          <div
            style={{
              background: '#182229',
              borderRadius: '8px',
              padding: '6px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#FFD279',
              fontSize: '12px',
              maxWidth: '460px',
              textAlign: 'center',
              boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
            }}
          >
            <Lock size={12} color="#FFD279" style={{ flexShrink: 0 }} />
            <span>Messages and calls are end-to-end encrypted. No one outside of this chat can read or listen to them.</span>
          </div>
        </div>

        {/* Date Separator */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
          <span
            style={{
              padding: '4px 12px',
              borderRadius: '7.5px',
              background: '#182229',
              color: '#8696A0',
              fontSize: '12px',
              fontWeight: 500,
              textTransform: 'uppercase',
            }}
          >
            TODAY
          </span>
        </div>

        {/* Message Stream */}
        {messages.map((msg) => {
          const isMe = msg.senderId === CURRENT_USER.id;
          const isImage = msg.type === 'image';
          const isDoc = msg.type === 'document';

          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent: isMe ? 'flex-end' : 'flex-start',
                marginBottom: '6px',
                position: 'relative',
              }}
              onDoubleClick={() => setActiveReactionMenuId(msg.id)}
            >
              <div
                className={`wa-message-bubble ${isMe ? 'wa-bubble-sent' : 'wa-bubble-received'}`}
                id={`wa-msg-${msg.id}`}
                style={{
                  maxWidth: isImage || isDoc ? '85%' : '65%',
                  minWidth: '100px',
                  background: isImage ? 'transparent' : isMe ? 'var(--wa-bg-outgoing)' : 'var(--wa-bg-incoming)',
                  color: 'var(--wa-text-primary)',
                  borderRadius: '7.5px',
                  padding: isImage ? '0' : '6px 9px 6px 9px',
                  position: 'relative',
                  boxShadow: isImage ? 'none' : '0 1px 0.5px rgba(0,0,0,0.3)',
                  fontSize: '14.2px',
                  lineHeight: '19px',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {/* 1. Image Message */}
                {isImage && (
                  <WhatsAppImageBubble
                    imageUrl={msg.metadata?.imageUrl || ''}
                    caption={msg.metadata?.imageCaption || msg.content}
                    timestamp={msg.timestamp}
                    isMe={isMe}
                  />
                )}

                {/* 2. Document Message */}
                {isDoc && (
                  <WhatsAppDocumentBubble
                    fileName={msg.metadata?.docName || msg.content}
                    fileSize={msg.metadata?.docSize}
                    fileType={msg.metadata?.docType}
                    fileUrl={msg.metadata?.docUrl}
                    timestamp={msg.timestamp}
                    isMe={isMe}
                  />
                )}

                {/* 3. Text Content */}
                {msg.type === 'text' && (
                  <div style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                )}

                {/* 4. Inline Developer Code Snippet */}
                {msg.type === 'code' && (
                  <div>
                    {msg.content && <div style={{ marginBottom: 4 }}>{msg.content}</div>}
                    <WhatsAppCodeBubble
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

                {/* 4b. Interactive GitHub Pull Request Card */}
                {msg.type === 'pr_card' && (
                  <div
                    className="wa-pr-bubble-card"
                    style={{
                      background: 'rgba(9, 13, 22, 0.95)',
                      borderRadius: '8px',
                      border: '1px solid rgba(0, 255, 204, 0.3)',
                      padding: '10px 12px',
                      margin: '4px 0 6px 0',
                      fontFamily: 'JetBrains Mono, monospace',
                      minWidth: '240px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '8px',
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          color: 'var(--wa-accent-green)',
                          fontWeight: 700,
                          fontSize: '12px',
                        }}
                      >
                        <GitPullRequest size={14} />
                        <span>PR #{msg.metadata?.prNumber}</span>
                      </span>

                      <div style={{ display: 'flex', gap: '6px', fontSize: '11px', fontWeight: 700 }}>
                        <span style={{ color: 'var(--wa-accent-green)' }}>+{msg.metadata?.prAdditions}</span>
                        <span style={{ color: '#F85149' }}>-{msg.metadata?.prDeletions}</span>
                      </div>
                    </div>

                    <div
                      style={{
                        color: 'var(--wa-text-primary)',
                        fontSize: '13px',
                        fontWeight: 600,
                        marginBottom: '10px',
                        lineHeight: 1.4,
                      }}
                    >
                      {msg.metadata?.prTitle || msg.content}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleTriggerReview({
                          title: msg.metadata?.prTitle || msg.content,
                          prNumber: msg.metadata?.prNumber,
                          prBranch: msg.metadata?.prBranch,
                          diffFiles: msg.metadata?.diffFiles,
                          repoName: chat.repoTag || chat.name,
                        })
                      }
                      style={{
                        width: '100%',
                        padding: '7px 10px',
                        background: 'rgba(0, 255, 204, 0.15)',
                        border: '1px solid rgba(0, 255, 204, 0.4)',
                        borderRadius: '6px',
                        color: 'var(--wa-accent-green)',
                        fontWeight: 700,
                        fontSize: '11.5px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <Columns size={13} />
                      <span>Inspect Line-by-Line Diff &amp; Review</span>
                    </button>
                  </div>
                )}

                {/* 5. Burn-After-Reading .env Vault Key */}
                {msg.type === 'env_secret' && (
                  <div>
                    {msg.content && <div style={{ marginBottom: 4 }}>{msg.content}</div>}
                    <WhatsAppVaultBubble
                      chatId={chat.id}
                      messageId={msg.id}
                      secretMasked={msg.metadata?.secretMasked}
                      ttlSeconds={msg.metadata?.ttlSeconds}
                      isBurned={msg.metadata?.isBurned}
                    />
                  </div>
                )}

                {/* 6. Voice Audio Note */}
                {msg.type === 'audio_note' && (
                  <AudioWaveBubble
                    duration={msg.metadata?.audioDuration || '0:18'}
                    waveform={msg.metadata?.waveform}
                    accentColor="#00A884"
                    isMe={isMe}
                    timestamp={msg.timestamp}
                  />
                )}

                {/* Timestamp + Double Checks for non-image/non-doc text/code */}
                {!isImage && !isDoc && msg.type !== 'audio_note' && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: '4px',
                      float: 'right',
                      marginTop: '2px',
                      marginLeft: '8px',
                      fontSize: '11px',
                      color: isMe ? 'rgba(233, 237, 239, 0.65)' : '#8696A0',
                    }}
                  >
                    <span>{msg.timestamp}</span>
                    {isMe && <CheckCheck size={14} color="#53BDEB" />}
                  </div>
                )}

                {/* WhatsApp Reactions Pill & Floating Quick Emoji Bar */}
                <WhatsAppReactions
                  reactions={msg.metadata?.reactions}
                  onToggleReaction={(emoji) => handleToggleReaction(msg.id, emoji)}
                  onDeleteMessage={isMe ? () => handleDeleteMessage(msg.id) : undefined}
                  isMe={isMe}
                  showBar={activeReactionMenuId === msg.id}
                  onCloseBar={() => setActiveReactionMenuId(null)}
                />
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Attachment Popup Menu */}
      {showAttachMenu && (
        <div
          className="wa-attach-popup"
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            bottom: '72px',
            left: '52px',
            background: '#233138',
            borderRadius: '16px',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
            zIndex: 100,
            border: '1px solid rgba(255,255,255,0.06)',
            animation: 'fadeIn 0.15s ease',
          }}
        >
          {/* Photos & Videos */}
          <div
            onClick={() => imageInputRef.current?.click()}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '6px' }}
          >
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#007BFC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
              <ImageIcon size={20} />
            </div>
            <span style={{ color: '#E9EDEF', fontSize: '14px' }}>Photos & Videos</span>
          </div>

          {/* Document */}
          <div
            onClick={() => docInputRef.current?.click()}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '6px' }}
          >
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#7F66FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
              <FileText size={20} />
            </div>
            <span style={{ color: '#E9EDEF', fontSize: '14px' }}>Document</span>
          </div>

          {/* Code Snippet */}
          <div
            onClick={() => {
              setShowAttachMenu(false);
              onSendCode();
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '6px' }}
          >
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#00A884', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
              <FileCode size={20} />
            </div>
            <span style={{ color: '#E9EDEF', fontSize: '14px' }}>Code Snippet</span>
          </div>

          {/* Secret .env Vault */}
          <div
            onClick={() => {
              setShowAttachMenu(false);
              onSendVault();
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '6px' }}
          >
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#FFB800', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
              <Shield size={20} />
            </div>
            <span style={{ color: '#E9EDEF', fontSize: '14px' }}>Secret .env Vault</span>
          </div>

          {/* Voice Note Quick Trigger */}
          <div
            onClick={startRecording}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '6px' }}
          >
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#E91E63', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
              <Mic size={20} />
            </div>
            <span style={{ color: '#E9EDEF', fontSize: '14px' }}>Voice Note</span>
          </div>
        </div>
      )}

      {/* 4. WhatsApp Emoji Drawer */}
      <WhatsAppEmojiPicker
        isOpen={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
        onSelectEmoji={handleSelectEmoji}
      />

      {/* 5. WhatsApp Image Preview / Caption Modal */}
      <WhatsAppImagePreviewModal
        isOpen={Boolean(previewImage)}
        imageSrc={previewImage}
        fileName={previewImageName}
        onClose={() => {
          setPreviewImage(null);
          setPreviewImageName('');
        }}
        onSend={handleSendImageWithCaption}
      />

      {/* 6. WhatsApp Bottom Composer Footer */}
      <footer
        className="wa-composer-footer"
        style={{
          height: '62px',
          background: 'var(--wa-bg-header)',
          padding: '5px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 10,
          flexShrink: 0,
          borderTop: '1px solid var(--wa-border-subtle)',
        }}
      >
        {isRecording ? (
          /* Live Voice Recording Bar */
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--wa-bg-deep)',
              borderRadius: '24px',
              padding: '6px 14px',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            {/* Pulsing Red Dot & Timer */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: '#EF4444',
                  boxShadow: '0 0 10px #EF4444',
                  animation: 'pulse 1s infinite alternate',
                }}
              />
              <span
                style={{
                  color: 'var(--wa-text-primary)',
                  fontFamily: 'monospace',
                  fontSize: '15px',
                  fontWeight: 600,
                }}
              >
                0:{recordingSeconds < 10 ? '0' : ''}{recordingSeconds}
              </span>
            </div>

            {/* Live animated recording waveform */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '20px' }}>
              {[12, 22, 16, 26, 14, 28, 18, 10, 24, 16].map((h, i) => (
                <span
                  key={i}
                  style={{
                    width: '3px',
                    height: `${h}px`,
                    background: 'var(--wa-accent-green)',
                    borderRadius: '2px',
                    animation: `bounceWave 0.8s infinite ease-in-out alternate ${i * 0.08}s`,
                  }}
                />
              ))}
            </div>

            {/* Cancel (Trash) & Send Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <button
                type="button"
                onClick={cancelRecording}
                title="Cancel recording"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#EF4444',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Trash2 size={20} />
              </button>

              <button
                type="button"
                onClick={sendRecording}
                title="Send voice note"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'var(--wa-accent-green)',
                  border: 'none',
                  color: '#090D16',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        ) : (
          /* Standard Composer */
          <>
            {/* Smile Emoji Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowEmojiPicker(!showEmojiPicker);
                setShowAttachMenu(false);
              }}
              className="wa-icon-btn"
              title="Emojis"
              style={{
                background: 'transparent',
                border: 'none',
                color: showEmojiPicker ? 'var(--wa-accent-green)' : 'var(--wa-text-secondary)',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <Smile size={24} />
            </button>

            {/* Paperclip Attachment */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowAttachMenu(!showAttachMenu);
                setShowEmojiPicker(false);
              }}
              className="wa-icon-btn"
              title="Attach"
              id="wa-btn-attach"
              style={{
                background: 'transparent',
                border: 'none',
                color: showAttachMenu ? 'var(--wa-accent-green)' : 'var(--wa-text-secondary)',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <Paperclip size={22} />
            </button>

            {/* Input Field Pill Container */}
            <form onSubmit={handleSend} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              <input
                type="text"
                className="wa-input-pill"
                placeholder="Type a message"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                id="wa-input-message"
                style={{
                  width: '100%',
                  height: '42px',
                  background: 'var(--wa-bg-input)',
                  border: 'none',
                  outline: 'none',
                  borderRadius: '8px',
                  padding: '9px 12px',
                  color: 'var(--wa-text-primary)',
                  fontSize: '15px',
                  fontFamily: 'Inter, sans-serif',
                }}
              />
            </form>

            {/* Mic or Green Send Button */}
            {inputText.trim() ? (
              <button
                type="button"
                onClick={handleSend}
                className="wa-send-btn"
                title="Send"
                id="wa-btn-send"
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: 'var(--wa-accent-green)',
                  border: 'none',
                  color: '#090D16',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(0, 255, 204, 0.35)',
                }}
              >
                <Send size={18} />
              </button>
            ) : (
              <button
                type="button"
                onClick={startRecording}
                className="wa-icon-btn"
                title="Record voice message"
                id="wa-btn-mic"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--wa-text-secondary)',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <Mic size={24} />
              </button>
            )}
          </>
        )}
      </footer>
        </div>

        {/* 5. Split-Screen Action Workspace Drawer (Desktop Side-by-Side & Mobile Draggable Split Sheet) */}
        <CodeReviewDrawer
          payload={effectiveReview}
          isOpen={!!effectiveReview}
          onClose={handleCloseReview}
          onSendReviewComment={onSendReviewComment || ((note) => onSendMessage(note))}
          isMobile={typeof window !== 'undefined' && window.innerWidth <= 900}
        />
      </div>

      {/* 6. Repository Telemetry & Webhook Health Slide-Over Modal */}
      {showRepoSheet && (
        <div
          className="wa-repo-sheet-backdrop"
          onClick={() => setShowRepoSheet(false)}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(3px)',
            zIndex: 120,
            display: 'flex',
            justifyContent: 'flex-end',
            animation: 'fadeIn 0.15s ease',
          }}
        >
          <div
            className="wa-repo-sheet-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '380px',
              height: '100%',
              background: 'var(--wa-bg-sidebar)',
              borderLeft: '1px solid var(--wa-border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              padding: '16px',
              overflowY: 'auto',
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Terminal size={18} color="var(--wa-accent-green)" />
                <span style={{ color: 'var(--wa-text-primary)', fontSize: '14px', fontWeight: 700 }}>
                  Repo Telemetry
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowRepoSheet(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--wa-text-secondary)', cursor: 'pointer', fontSize: '16px' }}
              >
                ✕
              </button>
            </div>

            {/* Repo Card */}
            <div
              style={{
                background: 'var(--wa-bg-deep)',
                borderRadius: '8px',
                border: '1px solid var(--wa-border-subtle)',
                padding: '12px',
                marginBottom: '14px',
              }}
            >
              <div style={{ color: 'var(--wa-accent-green)', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>
                {chat.repoTag || chat.name}
              </div>
              <div style={{ color: 'var(--wa-text-secondary)', fontSize: '11px', marginBottom: '8px' }}>
                Branch: <span style={{ color: 'var(--wa-ticks-blue)' }}>main (2843376)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--wa-accent-green)', fontSize: '11px' }}>
                <CheckCircle2 size={13} />
                <span>CI Build: SUCCESS (1.197s)</span>
              </div>
            </div>

            {/* Connected Webhooks */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ color: 'var(--wa-text-secondary)', fontSize: '11px', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase' }}>
                Active Webhook Logs
              </div>
              <div style={{ background: 'var(--wa-bg-deep)', borderRadius: '6px', padding: '8px 10px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--wa-text-primary)' }}>Vercel Deployments</span>
                  <span style={{ color: 'var(--wa-accent-green)' }}>READY 2m ago</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--wa-text-primary)' }}>GitHub Actions (CI)</span>
                  <span style={{ color: 'var(--wa-accent-green)' }}>18/18 PASS</span>
                </div>
              </div>
            </div>

            {/* Collaborators */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ color: 'var(--wa-text-secondary)', fontSize: '11px', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase' }}>
                Active Collaborators
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  { name: 'Dev ACK (You)', role: 'Lead Architect', commits: 42 },
                  { name: 'Linus Torvalds', role: 'Kernel Maintainer', commits: 128 },
                  { name: 'Sarah Connor', role: 'DevOps / Sec', commits: 19 },
                ].map((c, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: 'var(--wa-bg-deep)', borderRadius: '6px', fontSize: '11.5px' }}>
                    <span style={{ color: 'var(--wa-text-primary)' }}>{c.name}</span>
                    <span style={{ color: 'var(--wa-text-secondary)', fontSize: '10.5px' }}>{c.commits} commits</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Git Clone Button */}
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText('git clone https://github.com/kingenious0/ACK.git');
                alert('Copied git clone URL to clipboard!');
              }}
              style={{
                width: '100%',
                padding: '10px',
                background: 'rgba(0, 255, 204, 0.15)',
                border: '1px solid rgba(0, 255, 204, 0.4)',
                borderRadius: '8px',
                color: 'var(--wa-accent-green)',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <ExternalLink size={14} />
              <span>Copy Git Clone Command</span>
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

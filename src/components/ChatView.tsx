import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  Phone,
  Video,
  Camera,
  Mic,
  MicOff,
  Smile,
  Image,
  Plus,
  Send,
  Code,
  Shield,
  GitPullRequest,
  Check,
  CheckCheck,
  Copy,
  Terminal,
  ShieldCheck,
  X,
  Radio,
} from 'lucide-react';
import { Chat, Message, CURRENT_USER } from '../web-db/store';
import { EnvVaultBubble } from './EnvVaultBubble';
import { AudioWaveBubble } from './AudioWaveBubble';

interface ChatViewProps {
  chat: Chat | null;
  messages: Message[];
  onSendMessage: (text: string) => void;
  onSendAudioNote?: (duration: string, waveform: number[]) => void;
  onOpenCodeModal: () => void;
  onOpenVaultModal: () => void;
  onOpenPrModal: (msgMetadata?: any) => void;
  onBackToSidebar: () => void;
  onOpenCall?: (type: 'audio' | 'video') => void;
  onOpenProtectedDrawer?: () => void;
  isMobileActive?: boolean;
}

export const ChatView: React.FC<ChatViewProps> = ({
  chat,
  messages,
  onSendMessage,
  onSendAudioNote,
  onOpenCodeModal,
  onOpenVaultModal,
  onOpenPrModal,
  onBackToSidebar,
  onOpenCall,
  onOpenProtectedDrawer,
  isMobileActive = false,
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [showToolDrawer, setShowToolDrawer] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Voice recording timer
  useEffect(() => {
    let timer: any;
    if (isRecordingVoice) {
      timer = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } else {
      setRecordSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isRecordingVoice]);

  if (!chat) {
    return (
      <main className="snap-conversation-view empty-chat-state" id="empty-snap-view">
        <div className="empty-chat-icon" style={{ borderColor: '#00A3FF', color: '#00A3FF' }}>
          <Terminal size={42} />
        </div>
        <h2 className="empty-chat-title">Snapcord Developer Studio</h2>
        <p className="empty-chat-desc">
          Ephemeral Snapchat-style speed with Discord-grade code embeds, line-by-line PR reviews, and Burn-After-Reading .env vaults.
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="primary-btn" onClick={onOpenVaultModal} style={{ background: '#FFB800', color: '#000' }}>
            <Shield size={14} style={{ display: 'inline', marginRight: 6 }} />
            New .env Secret Vault
          </button>
          <button className="action-pill-btn" onClick={onOpenCodeModal}>
            <Code size={14} />
            Share Code Snippet
          </button>
        </div>
      </main>
    );
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const handleCopySnippet = (snippet: string, msgId: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedCodeId(msgId);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleStartVoiceRecord = () => {
    setIsRecordingVoice(true);
    setRecordSeconds(0);
  };

  const handleCancelVoiceRecord = () => {
    setIsRecordingVoice(false);
    setRecordSeconds(0);
  };

  const handleSendVoiceRecord = () => {
    const mins = Math.floor(recordSeconds / 60);
    const secs = (recordSeconds % 60).toString().padStart(2, '0');
    const durationStr = `${mins}:${secs}`;
    const generatedWaveform = Array.from({ length: 22 }, () => Math.floor(Math.random() * 70) + 30);

    if (onSendAudioNote) {
      onSendAudioNote(durationStr, generatedWaveform);
    } else {
      onSendMessage(`Voice note (${durationStr})`);
    }

    setIsRecordingVoice(false);
    setRecordSeconds(0);
  };

  return (
    <main
      className={`snap-conversation-view ${isMobileActive ? 'active-mobile' : ''}`}
      id="snap-active-conversation"
    >
      {/* Top Header (Matches E-Chat & Snapcord) */}
      <header className="snap-convo-header">
        <div className="snap-convo-header-left">
          <button
            className="snap-back-btn"
            onClick={onBackToSidebar}
            title="Back to Chat list"
            id="btn-back-to-chats"
          >
            <ChevronLeft size={28} />
          </button>

          <div
            className="snap-convo-recipient"
            onClick={onOpenProtectedDrawer}
            title="Click to view Protected Chat Room details"
            style={{ cursor: 'pointer' }}
            id="btn-recipient-profile-header"
          >
            <div className="snap-row-avatar" style={{ width: 38, height: 38 }}>
              <img src={chat.avatar} alt={chat.name} />
              {chat.isOnline && <div className="snap-online-badge" />}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="snap-convo-name">{chat.name}</span>
                <span title="Verified E2EE Session" style={{ display: 'inline-flex' }}>
                  <ShieldCheck size={14} color="#00FF66" />
                </span>
              </div>
              <span style={{ fontSize: '11px', color: '#8B949E' }}>
                {chat.isOnline ? 'Online • tap for room info' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        <div className="snap-convo-header-right">
          {chat.type === 'repo' && (
            <button
              className="action-pill-btn"
              onClick={() => onOpenPrModal()}
              title="Inspect GitHub Pull Request"
              id="btn-inspect-pr-top"
            >
              <GitPullRequest size={14} color="#A371F7" />
              <span>Inspect PR #142</span>
            </button>
          )}

          {/* E-Chat Audio Call Trigger */}
          <button
            className="snap-header-action-btn"
            onClick={() => onOpenCall && onOpenCall('audio')}
            title="Start Audio Call"
            id="btn-call-audio"
          >
            <Phone size={18} />
          </button>

          {/* E-Chat Video Call Trigger */}
          <button
            className="snap-header-action-btn"
            onClick={() => onOpenCall && onOpenCall('video')}
            title="Start Video Call"
            id="btn-call-video"
          >
            <Video size={18} />
          </button>
        </div>
      </header>

      {/* Ephemeral Alert Banner */}
      <div className="snap-ephemeral-banner" id="banner-ephemeral-alert">
        {chat.type === 'repo'
          ? 'GITHUB REPO HOOK ATTACHED • LIVE DIFFS ENABLED'
          : chat.statusIconType === 'vault'
          ? '🔒 SENSITIVE .ENV VAULT ENGAGED • ZERO-KNOWLEDGE ENCRYPTION'
          : 'ENCRYPTED DEVELOPER SESSION ACTIVE'}
      </div>

      {/* Message Stream */}
      <div className="snap-messages-stream" id="snap-messages-stream">
        {messages.map((msg) => {
          const accentColor = msg.metadata?.accentColor || (msg.senderId === CURRENT_USER.id ? '#E91E63' : '#00A884');
          const isMe = msg.senderId === CURRENT_USER.id;

          return (
            <div
              key={msg.id}
              className="snap-message-item"
              style={{ ['--accent-bar-color' as any]: accentColor }}
              id={`snap-msg-${msg.id}`}
            >
              {/* Sender Tag */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '2px',
                }}
              >
                <div className="snap-sender-tag" style={{ color: accentColor }}>
                  {msg.senderName}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#8B949E' }}>
                  <span>{msg.timestamp}</span>
                  <CheckCheck size={13} color="#00A3FF" />
                </div>
              </div>

              {/* 1. Pure Text Body */}
              {msg.type === 'text' && (
                <div className="snap-text-body">{msg.content}</div>
              )}

              {/* 2. E-Chat Audio Waveform Voice Note */}
              {msg.type === 'audio_note' && (
                <div style={{ marginTop: '4px' }}>
                  <AudioWaveBubble
                    duration={msg.metadata?.audioDuration || '0:18'}
                    waveform={msg.metadata?.waveform}
                    accentColor={accentColor}
                    isMe={isMe}
                    timestamp={msg.timestamp}
                  />
                </div>
              )}

              {/* 3. Discord Embedded Code Snippet */}
              {msg.type === 'code' && (
                <div>
                  {msg.content && <div className="snap-text-body" style={{ marginBottom: 4 }}>{msg.content}</div>}
                  <div className="discord-code-embed" id={`code-embed-${msg.id}`}>
                    <div className="discord-code-topbar">
                      <span style={{ fontWeight: 700, color: '#00FF66', textTransform: 'uppercase' }}>
                        <Terminal size={12} style={{ display: 'inline', marginRight: 4 }} />
                        {msg.metadata?.language || 'code'}
                      </span>
                      <button
                        className="copy-code-btn"
                        onClick={() => handleCopySnippet(msg.metadata?.codeSnippet || '', msg.id)}
                        id={`btn-copy-code-${msg.id}`}
                      >
                        {copiedCodeId === msg.id ? (
                          <>
                            <Check size={12} color="#00FF66" />
                            <span style={{ color: '#00FF66' }}>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={12} />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="discord-code-body">
                      {(msg.metadata?.codeSnippet || '').trim().split('\n').map((line, idx) => (
                        <div key={idx} className="discord-code-row">
                          <span className="discord-line-no">{idx + 1}</span>
                          <span className="discord-line-text">{line || ' '}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 4. Burn-After-Reading .env Vault Bubble */}
              {msg.type === 'env_secret' && (
                <div>
                  {msg.content && <div className="snap-text-body" style={{ marginBottom: 4 }}>{msg.content}</div>}
                  <EnvVaultBubble
                    chatId={chat.id}
                    messageId={msg.id}
                    secretMasked={msg.metadata?.secretMasked}
                    ttlSeconds={msg.metadata?.ttlSeconds}
                    isBurned={msg.metadata?.isBurned}
                  />
                </div>
              )}

              {/* 5. GitHub PR Card */}
              {msg.type === 'pr_card' && (
                <div className="pr-bubble-card" id={`pr-card-${msg.id}`} style={{ marginTop: 4 }}>
                  <div className="pr-bubble-top">
                    <span className="pr-tag">
                      <GitPullRequest size={15} /> PR #{msg.metadata?.prNumber}
                    </span>
                    <div className="pr-stats">
                      <span className="diff-add">+{msg.metadata?.prAdditions}</span>
                      <span className="diff-del">-{msg.metadata?.prDeletions}</span>
                    </div>
                  </div>

                  <div className="pr-title">{msg.metadata?.prTitle}</div>

                  <button
                    className="inspect-pr-btn"
                    onClick={() => onOpenPrModal(msg.metadata)}
                    id={`btn-review-diff-${msg.id}`}
                  >
                    Inspect Line-by-Line Diff &amp; Review
                  </button>
                </div>
              )}
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Expandable Dev Tools Tray */}
      {showToolDrawer && (
        <div
          style={{
            padding: '10px 16px',
            background: 'var(--bg-surface-elevated)',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
          }}
          id="dev-tools-tray"
        >
          <button
            className="action-pill-btn"
            onClick={() => {
              setShowToolDrawer(false);
              onOpenCodeModal();
            }}
            id="btn-drawer-code"
          >
            <Code size={14} color="#00FF66" />
            <span>Code Snippet</span>
          </button>

          <button
            className="action-pill-btn"
            onClick={() => {
              setShowToolDrawer(false);
              onOpenVaultModal();
            }}
            id="btn-drawer-vault"
          >
            <Shield size={14} color="#FFB800" />
            <span>.env Vault</span>
          </button>

          <button
            className="action-pill-btn"
            onClick={() => {
              setShowToolDrawer(false);
              onOpenPrModal();
            }}
            id="btn-drawer-pr"
          >
            <GitPullRequest size={14} color="#A371F7" />
            <span>GitHub PR Diff</span>
          </button>
        </div>
      )}

      {/* Input Dock (With E-Chat Voice Note Recording Mode) */}
      <footer className="snap-input-dock" id="snap-input-dock">
        {isRecordingVoice ? (
          /* Active Recording State (E-Chat Conversation Record screen) */
          <div
            className="echat-recording-dock"
            id="dock-voice-recording-active"
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 14px',
              background: 'rgba(233, 30, 99, 0.15)',
              border: '1px solid rgba(233, 30, 99, 0.4)',
              borderRadius: '24px',
              animation: 'fadeIn 0.15s ease-out',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: '#FF4757',
                  animation: 'pulseRecord 1s infinite alternate',
                }}
              />
              <span
                style={{
                  color: '#FFF',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: 600,
                  fontSize: '14px',
                }}
              >
                0:{recordSeconds.toString().padStart(2, '0')}
              </span>
              <span style={{ color: '#8B949E', fontSize: '12px' }}>
                Recording voice note...
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={handleCancelVoiceRecord}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#8B949E',
                  cursor: 'pointer',
                  fontSize: '12px',
                  padding: '4px 8px',
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSendVoiceRecord}
                className="snap-send-btn"
                style={{ background: '#00A3FF' }}
                title="Send Voice Note"
                id="btn-send-voice-note"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        ) : (
          /* Normal Message Input State */
          <>
            <button
              type="button"
              className="snap-camera-btn"
              onClick={() => alert('Screenshot & code capture ready')}
              title="Camera & Screenshot"
              id="btn-snap-camera"
            >
              <Camera size={24} />
            </button>

            <form onSubmit={handleSend} style={{ flex: 1, display: 'flex', gap: 10 }}>
              <div className="snap-input-pill" id="snap-input-pill">
                <span className="snap-cursor-accent" />
                <input
                  type="text"
                  className="snap-text-field"
                  placeholder="Chat or type /code..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  id="input-snap-chat"
                />

                <div className="snap-pill-actions">
                  {/* Click to record voice note */}
                  <button
                    type="button"
                    className="snap-pill-action-icon"
                    onClick={handleStartVoiceRecord}
                    title="Record Voice Note"
                    id="btn-voice-note"
                  >
                    <Mic size={18} />
                  </button>

                  <button
                    type="button"
                    className="snap-pill-action-icon"
                    title="Stickers & Emojis"
                    id="btn-emojis"
                  >
                    <Smile size={18} />
                  </button>

                  <button
                    type="button"
                    className="snap-pill-action-icon"
                    onClick={() => setShowToolDrawer(!showToolDrawer)}
                    title="Developer Tools (+)"
                    id="btn-toggle-dev-tools"
                  >
                    <Plus size={19} color="#00A3FF" />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="snap-send-btn"
                title="Send Message"
                id="btn-snap-send"
              >
                <Send size={18} />
              </button>
            </form>
          </>
        )}
      </footer>
    </main>
  );
};

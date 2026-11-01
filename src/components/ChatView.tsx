import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  Phone,
  Video,
  Camera,
  Mic,
  Smile,
  Image,
  Plus,
  Send,
  Code,
  Shield,
  GitPullRequest,
  Check,
  Copy,
  Terminal,
} from 'lucide-react';
import { Chat, Message, CURRENT_USER } from '../web-db/store';
import { EnvVaultBubble } from './EnvVaultBubble';

interface ChatViewProps {
  chat: Chat | null;
  messages: Message[];
  onSendMessage: (text: string) => void;
  onOpenCodeModal: () => void;
  onOpenVaultModal: () => void;
  onOpenPrModal: (msgMetadata?: any) => void;
  onBackToSidebar: () => void;
  isMobileActive?: boolean;
}

export const ChatView: React.FC<ChatViewProps> = ({
  chat,
  messages,
  onSendMessage,
  onOpenCodeModal,
  onOpenVaultModal,
  onOpenPrModal,
  onBackToSidebar,
  isMobileActive = false,
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [showToolDrawer, setShowToolDrawer] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  return (
    <main
      className={`snap-conversation-view ${isMobileActive ? 'active-mobile' : ''}`}
      id="snap-active-conversation"
    >
      {/* Top Header (Matches Screenshot 2 & 3) */}
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

          <div className="snap-convo-recipient">
            <div className="snap-row-avatar" style={{ width: 38, height: 38 }}>
              <img src={chat.avatar} alt={chat.name} />
              {chat.isOnline && <div className="snap-online-badge" />}
            </div>
            <span className="snap-convo-name">{chat.name}</span>
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

          <button className="snap-header-action-btn" title="Audio Call" id="btn-call-audio">
            <Phone size={18} />
          </button>

          <button className="snap-header-action-btn" title="Video Call" id="btn-call-video">
            <Video size={18} />
          </button>
        </div>
      </header>

      {/* Snapchat Signature Top Ephemeral Banner (Screenshots 2 & 3) */}
      <div className="snap-ephemeral-banner" id="banner-ephemeral-alert">
        {chat.type === 'repo'
          ? 'GITHUB REPO HOOK ATTACHED &bull; LIVE DIFFS ENABLED'
          : chat.statusIconType === 'vault'
          ? '🔒 SENSITIVE .ENV VAULT ENGAGED &bull; ZERO-KNOWLEDGE ENCRYPTION'
          : 'YOU SCREEN RECORDED CHAT!'}
      </div>

      {/* Ephemeral Message Stream (Screenshots 2 & 3 + Discord Code Embeds) */}
      <div className="snap-messages-stream" id="snap-messages-stream">
        {messages.map((msg) => {
          const accentColor = msg.metadata?.accentColor || (msg.senderId === CURRENT_USER.id ? '#E91E63' : '#00A884');

          return (
            <div
              key={msg.id}
              className="snap-message-item"
              style={{ ['--accent-bar-color' as any]: accentColor }}
              id={`snap-msg-${msg.id}`}
            >
              {/* Sender Tag (e.g. ME, ROBERT JONAS, LINUS TORVALDS) */}
              <div className="snap-sender-tag" style={{ color: accentColor }}>
                {msg.senderName}
              </div>

              {/* 1. Pure Text Body (Screenshot 3) */}
              {msg.type === 'text' && (
                <div className="snap-text-body">{msg.content}</div>
              )}

              {/* 2. Discord Embedded Code Snippet */}
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

              {/* 3. Burn-After-Reading .env Vault Bubble */}
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

              {/* 4. GitHub PR / Git Commit Card */}
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

      {/* Screen 5: Snapchat Input Dock (Screenshots 2 & 3) */}
      <footer className="snap-input-dock" id="snap-input-dock">
        {/* Camera Button */}
        <button
          type="button"
          className="snap-camera-btn"
          onClick={() => alert('Camera & Screen Capture ready!')}
          title="Camera & Screenshot"
          id="btn-snap-camera"
        >
          <Camera size={24} />
        </button>

        {/* Pill Input Container */}
        <form onSubmit={handleSend} style={{ flex: 1, display: 'flex', gap: 10 }}>
          <div className="snap-input-pill" id="snap-input-pill">
            <span className="snap-cursor-accent" />
            <input
              type="text"
              className="snap-text-field"
              placeholder="Chat..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              id="input-snap-chat"
            />

            <div className="snap-pill-actions">
              <button
                type="button"
                className="snap-pill-action-icon"
                title="Voice Note"
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
                title="Media Gallery"
                id="btn-media-gallery"
              >
                <Image size={18} />
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

          {/* Send Button */}
          <button
            type="submit"
            className="snap-send-btn"
            title="Send"
            id="btn-snap-send"
          >
            <Send size={18} />
          </button>
        </form>
      </footer>
    </main>
  );
};

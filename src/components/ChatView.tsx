import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Search,
  MoreVertical,
  Code,
  Shield,
  Send,
  GitPullRequest,
  CheckCheck,
  Terminal,
  Paperclip,
} from 'lucide-react';
import { Chat, Message, CURRENT_USER } from '../web-db/store';
import { CodeBlock } from './CodeBlock';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!chat) {
    return (
      <main className="chat-view empty-chat-state" id="empty-chat-view">
        <div className="empty-chat-icon">
          <Terminal size={44} />
        </div>
        <h2 className="empty-chat-title">WhatsDev Web Studio</h2>
        <p className="empty-chat-desc">
          Zero-trust developer messaging with Burn-After-Reading .env vaults, syntax-highlighted snippets, and line-by-line PR reviews. Select a conversation to start collaborating.
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="primary-btn" onClick={onOpenVaultModal} id="btn-hero-vault">
            <Shield size={14} style={{ display: 'inline', marginRight: 6 }} />
            New .env Secret Vault
          </button>
          <button className="action-pill-btn" onClick={onOpenCodeModal} id="btn-hero-code">
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

  return (
    <main className={`chat-view ${isMobileActive ? 'active-mobile' : ''}`} id="active-chat-view">
      <div className="chat-wallpaper-overlay" />

      {/* Chat App Bar */}
      <header className="chat-header">
        <div className="chat-header-left">
          <button
            className="icon-btn mobile-back-btn"
            onClick={onBackToSidebar}
            title="Back to Chats"
            id="btn-mobile-back"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="avatar-wrapper" style={{ width: 42, height: 42 }}>
            <img src={chat.avatar} alt={chat.name} className="avatar-img" />
            {chat.isOnline && <div className="online-dot" />}
          </div>

          <div className="chat-header-info">
            <h3 className="chat-header-title">
              {chat.name}
              {chat.repoTag && <span className="repo-badge">{chat.repoTag}</span>}
            </h3>
            <span className="chat-header-subtitle">
              {chat.isOnline ? (
                <>
                  <span style={{ width: 6, height: 6, background: '#00FF66', borderRadius: '50%', display: 'inline-block' }} />
                  online &bull; git hook attached
                </>
              ) : (
                'last active today at 09:30'
              )}
            </span>
          </div>
        </div>

        <div className="chat-header-actions">
          {chat.type === 'repo' && (
            <button
              className="action-pill-btn"
              onClick={() => onOpenPrModal()}
              title="Review Active GitHub PR Diff"
              id="btn-inspect-pr-header"
            >
              <GitPullRequest size={14} color="#A371F7" />
              <span>Inspect PR #142</span>
            </button>
          )}

          <button className="icon-btn" title="Search in chat" id="btn-search-chat">
            <Search size={18} />
          </button>

          <button className="icon-btn" title="Chat menu" id="btn-chat-menu">
            <MoreVertical size={18} />
          </button>
        </div>
      </header>

      {/* Message Stream */}
      <div className="messages-container" id="messages-container">
        <div className="date-divider">Today</div>

        {messages.map((msg) => {
          const isSentByMe = msg.senderId === CURRENT_USER.id;

          return (
            <div
              key={msg.id}
              className={`message-bubble-wrapper ${isSentByMe ? 'sent' : 'received'}`}
              id={`msg-wrapper-${msg.id}`}
            >
              <div className={`message-bubble ${isSentByMe ? 'sent' : 'received'}`}>
                {!isSentByMe && (
                  <span className="sender-name-label">{msg.senderName}</span>
                )}

                {/* 1. Standard Text Message */}
                {msg.type === 'text' && (
                  <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                )}

                {/* 2. Code Snippet Message */}
                {msg.type === 'code' && (
                  <div>
                    {msg.content && <div style={{ marginBottom: 4, fontWeight: 500 }}>{msg.content}</div>}
                    <CodeBlock
                      language={msg.metadata?.language || 'typescript'}
                      code={msg.metadata?.codeSnippet || ''}
                    />
                  </div>
                )}

                {/* 3. Burn-After-Reading .env Vault Message */}
                {msg.type === 'env_secret' && (
                  <div>
                    {msg.content && <div style={{ marginBottom: 4, fontWeight: 500 }}>{msg.content}</div>}
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
                  <div className="pr-bubble-card" id={`pr-card-${msg.id}`}>
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

                {/* Bubble Timestamp & Status Double Ticks */}
                <div className="message-meta">
                  <span className="message-time">{msg.timestamp}</span>
                  {isSentByMe && (
                    <span className="status-ticks read" title="Read">
                      <CheckCheck size={14} />
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <footer className="chat-input-bar">
        <div className="dev-tool-triggers">
          {/* Code Snippet Trigger */}
          <button
            type="button"
            className="tool-trigger-btn"
            onClick={onOpenCodeModal}
            title="Compose and share code snippet"
            id="btn-input-code"
          >
            <Code size={20} />
          </button>

          {/* Burn-After-Reading .env Vault Trigger */}
          <button
            type="button"
            className="tool-trigger-btn vault"
            onClick={onOpenVaultModal}
            title="Create Burn-After-Reading .env secret vault"
            id="btn-input-vault"
          >
            <Shield size={20} color="#FFB800" />
          </button>
        </div>

        {/* Text Input Pill */}
        <form onSubmit={handleSend} style={{ flex: 1, display: 'flex', gap: 10 }}>
          <div className="input-pill-wrapper">
            <input
              type="text"
              className="chat-text-input"
              placeholder="Type a message or paste code / git diff..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              id="input-chat-message"
            />
          </div>

          <button
            type="submit"
            className="send-action-btn"
            title="Send Message"
            id="btn-send-message"
          >
            <Send size={18} />
          </button>
        </form>
      </footer>
    </main>
  );
};

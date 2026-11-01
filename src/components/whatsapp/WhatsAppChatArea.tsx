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
  Image,
  Flame,
} from 'lucide-react';
import { Chat, Message, CURRENT_USER } from '../../web-db/store';
import { WhatsAppCodeBubble } from './WhatsAppCodeBubble';
import { WhatsAppVaultBubble } from './WhatsAppVaultBubble';
import { AudioWaveBubble } from '../AudioWaveBubble';

interface WhatsAppChatAreaProps {
  chat: Chat | null;
  messages: Message[];
  onSendMessage: (text: string) => void;
  onSendCode: () => void;
  onSendVault: () => void;
  onBackToSidebar: () => void;
  onOpenCall?: (type: 'audio' | 'video') => void;
  isMobileActive?: boolean;
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
}) => {
  const [inputText, setInputText] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!chat) {
    return (
      <main
        className="wa-empty-chat-pane"
        style={{
          flex: 1,
          height: '100%',
          background: '#222E35',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          borderBottom: '6px solid #00A884',
        }}
      >
        <div
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'rgba(0, 168, 132, 0.1)',
            border: '2px solid rgba(0, 168, 132, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '28px',
          }}
        >
          <Lock size={44} color="#00A884" />
        </div>
        <h2 style={{ color: '#E9EDEF', fontSize: '28px', fontWeight: 300, marginBottom: '14px', letterSpacing: '-0.01em' }}>
          WhatsApp Web for Developers
        </h2>
        <p style={{ color: '#8696A0', fontSize: '14px', maxWidth: '440px', textAlign: 'center', lineHeight: 1.6 }}>
          Send end-to-end encrypted messages, share live code snippets, and exchange Burn-After-Reading .env vaults.
        </p>
        <div style={{ marginTop: '28px', display: 'flex', alignItems: 'center', gap: '8px', color: '#667781', fontSize: '12px' }}>
          <Lock size={12} />
          <span>End-to-end encrypted</span>
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
    <main
      className={`wa-chat-pane ${isMobileActive ? 'wa-active-mobile' : ''}`}
      id="whatsapp-chat-pane"
      style={{
        flex: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        background: '#0B141A',
        minWidth: 0,
      }}
    >
      {/* 1. WhatsApp Chat Top Header */}
      <header
        className="wa-chat-header"
        style={{
          height: '59px',
          background: '#202C33',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderLeft: '1px solid #222D34',
          zIndex: 10,
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          {/* Mobile Back Arrow */}
          <button
            type="button"
            className="wa-mobile-back-btn"
            onClick={onBackToSidebar}
            title="Back to Chats"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#AEBAC1',
              cursor: 'pointer',
              padding: '4px',
              display: 'none',
            }}
          >
            <ChevronLeft size={24} />
          </button>

          {/* Contact Avatar */}
          <img
            src={chat.avatar}
            alt={chat.name}
            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
          />

          {/* Contact Info */}
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span
              style={{
                color: '#E9EDEF',
                fontSize: '16px',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {chat.name}
            </span>
            <span style={{ color: chat.isOnline ? '#00A884' : '#8696A0', fontSize: '13px' }}>
              {chat.isOnline ? 'online' : 'last seen today at ' + chat.statusTime}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', color: '#AEBAC1' }}>
          <button
            type="button"
            onClick={() => onOpenCall && onOpenCall('video')}
            className="wa-icon-btn"
            title="Video call"
            style={{ background: 'transparent', border: 'none', color: '#AEBAC1', cursor: 'pointer', padding: '4px' }}
          >
            <Video size={20} />
          </button>

          <button
            type="button"
            onClick={() => onOpenCall && onOpenCall('audio')}
            className="wa-icon-btn"
            title="Voice call"
            style={{ background: 'transparent', border: 'none', color: '#AEBAC1', cursor: 'pointer', padding: '4px' }}
          >
            <Phone size={19} />
          </button>

          <button
            type="button"
            className="wa-icon-btn"
            title="Search message"
            style={{ background: 'transparent', border: 'none', color: '#AEBAC1', cursor: 'pointer', padding: '4px' }}
          >
            <Search size={19} />
          </button>

          <button
            type="button"
            className="wa-icon-btn"
            title="Menu"
            style={{ background: 'transparent', border: 'none', color: '#AEBAC1', cursor: 'pointer', padding: '4px' }}
          >
            <MoreVertical size={20} />
          </button>
        </div>
      </header>

      {/* 2. WhatsApp Wallpaper Stream Area */}
      <div
        className="wa-wallpaper-stream"
        id="wa-chat-stream-scroll"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 5% 16px 5%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/* End-to-end Encryption Notice Pill */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              padding: '6px 14px',
              borderRadius: '7.5px',
              background: '#182229',
              boxShadow: '0 1px 0.5px rgba(11,20,26,0.13)',
              color: '#FFD279',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              maxWidth: '460px',
              textAlign: 'center',
              lineHeight: 1.4,
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

          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent: isMe ? 'flex-end' : 'flex-start',
                marginBottom: '4px',
              }}
            >
              <div
                className={`wa-message-bubble ${isMe ? 'wa-bubble-sent' : 'wa-bubble-received'}`}
                id={`wa-msg-${msg.id}`}
                style={{
                  maxWidth: '65%',
                  minWidth: '100px',
                  background: isMe ? '#005C4B' : '#202C33',
                  color: '#E9EDEF',
                  borderRadius: '7.5px',
                  padding: '6px 9px 6px 9px',
                  position: 'relative',
                  boxShadow: '0 1px 0.5px rgba(11,20,26,0.13)',
                  fontSize: '14.2px',
                  lineHeight: '19px',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {/* Text Content */}
                {msg.type === 'text' && (
                  <div style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                )}

                {/* Inline Developer Code Snippet */}
                {msg.type === 'code' && (
                  <div>
                    {msg.content && <div style={{ marginBottom: 4 }}>{msg.content}</div>}
                    <WhatsAppCodeBubble
                      language={msg.metadata?.language}
                      code={msg.metadata?.codeSnippet || ''}
                      title={msg.metadata?.prTitle}
                    />
                  </div>
                )}

                {/* Burn-After-Reading .env Vault Key */}
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

                {/* Voice Audio Note */}
                {msg.type === 'audio_note' && (
                  <AudioWaveBubble
                    duration={msg.metadata?.audioDuration || '0:18'}
                    waveform={msg.metadata?.waveform}
                    accentColor="#00A884"
                    isMe={isMe}
                    timestamp={msg.timestamp}
                  />
                )}

                {/* Message Meta Info: Timestamp + Double Checks */}
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

          <div
            onClick={() => {
              setShowAttachMenu(false);
              alert('Attach Document ready');
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '6px' }}
          >
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#7F66FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
              <FileText size={20} />
            </div>
            <span style={{ color: '#E9EDEF', fontSize: '14px' }}>Document</span>
          </div>
        </div>
      )}

      {/* 4. WhatsApp Bottom Composer Footer */}
      <footer
        className="wa-composer-footer"
        style={{
          height: '62px',
          background: '#202C33',
          padding: '5px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 10,
          flexShrink: 0,
        }}
      >
        {/* Smile Emoji */}
        <button
          type="button"
          className="wa-icon-btn"
          title="Emojis"
          style={{ background: 'transparent', border: 'none', color: '#8696A0', cursor: 'pointer', padding: '4px' }}
        >
          <Smile size={24} />
        </button>

        {/* Paperclip Attachment */}
        <button
          type="button"
          onClick={() => setShowAttachMenu(!showAttachMenu)}
          className="wa-icon-btn"
          title="Attach"
          id="wa-btn-attach"
          style={{ background: 'transparent', border: 'none', color: '#8696A0', cursor: 'pointer', padding: '4px' }}
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
              background: '#2A3942',
              border: 'none',
              outline: 'none',
              borderRadius: '8px',
              padding: '9px 12px',
              color: '#E9EDEF',
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
              background: '#00A884',
              border: 'none',
              color: '#0B141A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              boxShadow: '0 2px 6px rgba(0, 168, 132, 0.4)',
            }}
          >
            <Send size={18} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onSendMessage('Voice note (0:08)')}
            className="wa-icon-btn"
            title="Voice message"
            id="wa-btn-mic"
            style={{ background: 'transparent', border: 'none', color: '#8696A0', cursor: 'pointer', padding: '4px' }}
          >
            <Mic size={24} />
          </button>
        )}
      </footer>
    </main>
  );
};

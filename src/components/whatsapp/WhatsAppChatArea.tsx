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
} from 'lucide-react';
import { Chat, Message, CURRENT_USER, webStore } from '../../web-db/store';
import { WhatsAppCodeBubble } from './WhatsAppCodeBubble';
import { WhatsAppVaultBubble } from './WhatsAppVaultBubble';
import { WhatsAppImageBubble } from './WhatsAppImageBubble';
import { WhatsAppDocumentBubble } from './WhatsAppDocumentBubble';
import { WhatsAppEmojiPicker } from './WhatsAppEmojiPicker';
import { WhatsAppImagePreviewModal } from './WhatsAppImagePreviewModal';
import { WhatsAppReactions } from './WhatsAppReactions';
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeReactionMenuId, setActiveReactionMenuId] = useState<string | null>(null);

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
        background: '#0B141A',
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
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          zIndex: 10,
          flexShrink: 0,
        }}
      >
        {/* Left: Avatar, Back button (Mobile) and Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          <button
            type="button"
            className="wa-mobile-back-btn"
            onClick={onBackToSidebar}
            title="Back to chats"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#AECBFA',
              padding: '6px',
              cursor: 'pointer',
              display: 'none',
              marginLeft: '-8px',
            }}
          >
            <ChevronLeft size={26} />
          </button>

          <div style={{ position: 'relative', width: '40px', height: '40px', flexShrink: 0 }}>
            <img
              src={chat.avatar}
              alt={chat.name}
              style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
            />
            {chat.isOnline && (
              <span
                style={{
                  position: 'absolute',
                  bottom: '1px',
                  right: '1px',
                  width: '10px',
                  height: '10px',
                  background: '#00A884',
                  borderRadius: '50%',
                  border: '2px solid #202C33',
                }}
              />
            )}
          </div>

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
            <span style={{ color: '#8696A0', fontSize: '12px' }}>
              {chat.isOnline ? 'online' : `@${chat.username}`}
            </span>
          </div>
        </div>

        {/* Right Header Action Icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', color: '#8696A0' }}>
          {onOpenCall && (
            <button
              type="button"
              onClick={() => onOpenCall('video')}
              title="Video call"
              className="wa-header-action-btn"
              style={{ background: 'transparent', border: 'none', color: '#8696A0', cursor: 'pointer', padding: '4px' }}
            >
              <Video size={20} />
            </button>
          )}

          {onOpenCall && (
            <button
              type="button"
              onClick={() => onOpenCall('audio')}
              title="Voice call"
              className="wa-header-action-btn"
              style={{ background: 'transparent', border: 'none', color: '#8696A0', cursor: 'pointer', padding: '4px' }}
            >
              <Phone size={19} />
            </button>
          )}

          <button
            type="button"
            title="Search conversation"
            className="wa-header-action-btn"
            style={{ background: 'transparent', border: 'none', color: '#8696A0', cursor: 'pointer', padding: '4px' }}
          >
            <Search size={19} />
          </button>

          <button
            type="button"
            title="Menu options"
            className="wa-header-action-btn"
            style={{ background: 'transparent', border: 'none', color: '#8696A0', cursor: 'pointer', padding: '4px' }}
          >
            <MoreVertical size={19} />
          </button>
        </div>
      </header>

      {/* 2. Chat Conversation Canvas */}
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
                  background: isImage ? 'transparent' : isMe ? '#005C4B' : '#202C33',
                  color: '#E9EDEF',
                  borderRadius: '7.5px',
                  padding: isImage ? '0' : '6px 9px 6px 9px',
                  position: 'relative',
                  boxShadow: isImage ? 'none' : '0 1px 0.5px rgba(11,20,26,0.13)',
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
                    />
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
          background: '#202C33',
          padding: '5px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 10,
          flexShrink: 0,
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
              background: '#111B21',
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
                  color: '#E9EDEF',
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
                    background: '#00A884',
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
                  background: '#00A884',
                  border: 'none',
                  color: '#0B141A',
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
                color: showEmojiPicker ? '#00A884' : '#8696A0',
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
                color: showAttachMenu ? '#00A884' : '#8696A0',
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
                onClick={startRecording}
                className="wa-icon-btn"
                title="Record voice message"
                id="wa-btn-mic"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#8696A0',
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
    </main>
  );
};

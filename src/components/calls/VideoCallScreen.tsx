import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  RefreshCw,
  PhoneOff,
  ShieldCheck,
  ChevronDown,
  UserPlus,
} from 'lucide-react';
import { Chat, CURRENT_USER } from '../../web-db/store';
import { getInitials } from '../chat/ChatList';
import { AddToCallSheet } from './AddToCallSheet';

export interface VideoCallScreenProps {
  chat: Chat;
  onEndCall: () => void;
  onMinimize?: () => void;
}

export const VideoCallScreen: React.FC<VideoCallScreenProps> = ({
  chat,
  onEndCall,
  onMinimize,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [showAddSheet, setShowAddSheet] = useState(false);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const remoteInitials = getInitials(chat.name);

  return (
    <div
      className="ack-call-screen ack-video-call"
      id="ack-video-call-screen"
      style={{
        position: 'fixed',
        inset: 0,
        background: '#0B0B0D',
        zIndex: 2600,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden',
        userSelect: 'none',
        animation: 'ackFadeIn 200ms ease',
      }}
    >
      {/* 1. Full-screen Remote Video Stage */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, #161820 0%, #0D0F14 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
        }}
      >
        {/* Subtle grid pattern / developer styling */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.05,
            backgroundImage:
              'linear-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.4) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Remote Avatar Presentation */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 2,
          }}
        >
          <div
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'var(--ack-avatar-bg, #1A1A1F)',
              border: '2px solid rgba(139, 124, 255, 0.4)',
              boxShadow: '0 0 32px rgba(139, 124, 255, 0.25)',
              color: 'var(--ack-text, #ECECEF)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: 700,
              fontFamily: 'Inter, sans-serif',
              marginBottom: '16px',
            }}
          >
            {remoteInitials}
          </div>
          <div
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--ack-text, #ECECEF)',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {chat.name}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              color: 'var(--ack-success, #4ADE80)',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              marginTop: '4px',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--ack-success, #4ADE80)',
              }}
            />
            <span>Connected</span>
          </div>
        </div>

        {/* Small Self-View PIP (Top Right or Bottom Right) */}
        <div
          style={{
            position: 'absolute',
            top: 'calc(env(safe-area-inset-top, 16px) + 64px)',
            right: '16px',
            width: '94px',
            height: '132px',
            borderRadius: '12px',
            background: isVideoOff ? 'var(--ack-surface, #131316)' : '#1F222E',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          {isVideoOff ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <VideoOff size={18} color="var(--ack-muted, #9A9AA3)" />
              <span style={{ fontSize: '10px', color: 'var(--ack-muted, #9A9AA3)' }}>Off</span>
            </div>
          ) : (
            <>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'var(--ack-accent-tint, #272250)',
                  color: 'var(--ack-accent-text, #A99DFF)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                KG
              </div>
              <span
                style={{
                  fontSize: '10px',
                  color: 'var(--ack-muted, #9A9AA3)',
                  marginTop: '6px',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                {CURRENT_USER.username}
              </span>
            </>
          )}
        </div>
      </div>

      {/* 2. Top App Bar */}
      <div
        style={{
          position: 'relative',
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          paddingTop: 'calc(env(safe-area-inset-top, 16px) + 8px)',
          background: 'linear-gradient(180deg, rgba(11, 11, 13, 0.85) 0%, transparent 100%)',
        }}
      >
        <button
          type="button"
          onClick={onMinimize || onEndCall}
          aria-label="Minimize"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: 'var(--ack-text, #ECECEF)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <ChevronDown size={20} strokeWidth={2} />
        </button>

        {/* Center Timer & Encryption */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: '15px',
              fontWeight: 700,
              color: 'var(--ack-text, #ECECEF)',
              fontFamily: 'JetBrains Mono, monospace',
              letterSpacing: '0.04em',
            }}
          >
            {formatTimer(callDuration)}
          </div>
          <div
            style={{
              fontSize: '11px',
              color: 'var(--ack-muted, #9A9AA3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              marginTop: '2px',
            }}
          >
            <ShieldCheck size={12} color="var(--ack-accent, #8B7CFF)" />
            <span>End-to-end encrypted</span>
          </div>
        </div>

        <div style={{ width: '36px' }} />
      </div>

      {/* 3. Floating Bottom Controls Bar */}
      <div
        style={{
          position: 'relative',
          zIndex: 20,
          padding: '24px 20px',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 24px) + 12px)',
          background: 'linear-gradient(0deg, rgba(11, 11, 13, 0.95) 0%, transparent 100%)',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            background: 'rgba(19, 19, 22, 0.85)',
            border: '1px solid var(--ack-border, #26262B)',
            backdropFilter: 'blur(16px)',
            borderRadius: '32px',
            padding: '8px 16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
          }}
        >
          {/* Mute Button */}
          <button
            type="button"
            id="btn-video-mute"
            onClick={() => setIsMuted(!isMuted)}
            aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: isMuted ? 'rgba(248, 113, 113, 0.2)' : 'var(--ack-surface-2, #17171B)',
              border: isMuted ? '1px solid var(--ack-danger, #F87171)' : '1px solid var(--ack-border, #26262B)',
              color: isMuted ? 'var(--ack-danger, #F87171)' : 'var(--ack-text, #ECECEF)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 150ms ease',
            }}
          >
            {isMuted ? <MicOff size={20} strokeWidth={1.75} /> : <Mic size={20} strokeWidth={1.75} />}
          </button>

          {/* Camera Button */}
          <button
            type="button"
            id="btn-video-camera"
            onClick={() => setIsVideoOff(!isVideoOff)}
            aria-label={isVideoOff ? 'Turn camera on' : 'Turn camera off'}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: isVideoOff ? 'rgba(248, 113, 113, 0.2)' : 'var(--ack-surface-2, #17171B)',
              border: isVideoOff ? '1px solid var(--ack-danger, #F87171)' : '1px solid var(--ack-border, #26262B)',
              color: isVideoOff ? 'var(--ack-danger, #F87171)' : 'var(--ack-text, #ECECEF)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 150ms ease',
            }}
          >
            {isVideoOff ? <VideoOff size={20} strokeWidth={1.75} /> : <Video size={20} strokeWidth={1.75} />}
          </button>

          {/* Flip Camera Button */}
          <button
            type="button"
            id="btn-video-flip"
            onClick={() => setIsFrontCamera(!isFrontCamera)}
            aria-label="Flip camera"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'var(--ack-surface-2, #17171B)',
              border: '1px solid var(--ack-border, #26262B)',
              color: 'var(--ack-text, #ECECEF)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 200ms ease',
              transform: isFrontCamera ? 'rotate(0deg)' : 'rotate(180deg)',
            }}
          >
            <RefreshCw size={18} strokeWidth={1.75} />
          </button>

          {/* Add Participant Button */}
          <button
            type="button"
            id="btn-video-add"
            onClick={() => setShowAddSheet(true)}
            aria-label="Add participant"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'var(--ack-surface-2, #17171B)',
              border: '1px solid var(--ack-border, #26262B)',
              color: 'var(--ack-text, #ECECEF)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Invite collaborator"
          >
            <UserPlus size={19} strokeWidth={1.75} />
          </button>

          {/* End Call Button */}
          <button
            type="button"
            id="btn-video-end"
            onClick={onEndCall}
            aria-label="End call"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'var(--ack-danger, #F87171)',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(248, 113, 113, 0.4)',
              transition: 'transform 150ms ease',
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.94)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <PhoneOff size={20} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Add To Call Bottom Sheet */}
      <AddToCallSheet
        isOpen={showAddSheet}
        onClose={() => setShowAddSheet(false)}
        currentParticipantCount={2}
      />
    </div>
  );
};

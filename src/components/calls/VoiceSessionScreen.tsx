import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  UserPlus,
  PhoneOff,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { Chat } from '../../web-db/store';
import { getInitials } from '../chat/ChatList';
import { AddToCallSheet } from './AddToCallSheet';

export interface VoiceSessionScreenProps {
  chat: Chat;
  onEndCall: () => void;
  onMinimize?: () => void;
  onAddParticipant?: () => void;
}

export const VoiceSessionScreen: React.FC<VoiceSessionScreenProps> = ({
  chat,
  onEndCall,
  onMinimize,
  onAddParticipant,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [showAddSheet, setShowAddSheet] = useState(false);

  // Dynamic waveform bars heights
  const [waveformHeights, setWaveformHeights] = useState<number[]>([
    24, 42, 68, 85, 54, 32, 76, 92, 60, 44, 88, 65, 30, 52, 78, 40,
  ]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulated voice modulation when not muted
  useEffect(() => {
    if (isMuted) {
      setWaveformHeights(new Array(16).fill(8));
      return;
    }
    const waveInterval = setInterval(() => {
      setWaveformHeights((prev) =>
        prev.map(() => Math.floor(Math.random() * 70) + 16)
      );
    }, 180);
    return () => clearInterval(waveInterval);
  }, [isMuted]);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const initials = getInitials(chat.name);

  return (
    <div
      className="ack-call-screen ack-voice-session"
      id="ack-voice-session-screen"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--ack-bg, #0B0B0D)',
        zIndex: 2600,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden',
        userSelect: 'none',
        animation: 'ackFadeIn 200ms ease',
      }}
    >
      {/* 1. Top Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          paddingTop: 'calc(env(safe-area-inset-top, 16px) + 8px)',
          background: 'linear-gradient(180deg, rgba(19, 19, 22, 0.9) 0%, transparent 100%)',
          zIndex: 10,
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
            background: 'var(--ack-surface, #131316)',
            border: '1px solid var(--ack-border, #26262B)',
            color: 'var(--ack-text, #ECECEF)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <ChevronDown size={20} strokeWidth={2} />
        </button>

        {/* Center Title & Security */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--ack-accent-text, #A99DFF)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Voice Session
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
            <span>Encrypted in browser</span>
          </div>
        </div>

        <div style={{ width: '36px' }} />
      </div>

      {/* 2. Center Content: Avatar + Name + Timer + Waveform */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 20px',
          zIndex: 5,
        }}
      >
        {/* Large Avatar with glowing accent ring */}
        <div
          style={{
            position: 'relative',
            width: '108px',
            height: '108px',
            borderRadius: '50%',
            background: 'var(--ack-avatar-bg, #1A1A1F)',
            border: isMuted ? '2px solid var(--ack-border, #26262B)' : '2px solid var(--ack-accent, #8B7CFF)',
            boxShadow: isMuted
              ? 'none'
              : '0 0 32px rgba(139, 124, 255, 0.25), 0 0 0 8px rgba(139, 124, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--ack-text, #ECECEF)',
            fontSize: '36px',
            fontWeight: 700,
            fontFamily: 'Inter, sans-serif',
            marginBottom: '20px',
            transition: 'border-color 200ms ease, box-shadow 200ms ease',
          }}
        >
          {initials}
        </div>

        {/* Name */}
        <h2
          style={{
            fontSize: '22px',
            fontWeight: 700,
            color: 'var(--ack-text, #ECECEF)',
            fontFamily: 'Inter, sans-serif',
            letterSpacing: '-0.02em',
            margin: '0 0 6px 0',
            textAlign: 'center',
          }}
        >
          {chat.name}
        </h2>

        {/* Status */}
        <div
          style={{
            fontSize: '13px',
            color: isMuted ? 'var(--ack-danger, #F87171)' : 'var(--ack-success, #4ADE80)',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            marginBottom: '16px',
          }}
        >
          {isMuted ? 'Microphone muted' : 'Connected'}
        </div>

        {/* Mono Timer */}
        <div
          style={{
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--ack-text, #ECECEF)',
            fontFamily: 'JetBrains Mono, monospace',
            letterSpacing: '0.04em',
            marginBottom: '28px',
          }}
        >
          {formatTimer(callDuration)}
        </div>

        {/* Accent Waveform Visualizer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            height: '72px',
            width: '100%',
            maxWidth: '280px',
            padding: '8px 12px',
            borderRadius: '16px',
            background: 'var(--ack-surface, #131316)',
            border: '1px solid var(--ack-border, #26262B)',
          }}
        >
          {waveformHeights.map((h, idx) => (
            <div
              key={idx}
              style={{
                width: '4px',
                height: `${h}%`,
                maxHeight: '100%',
                borderRadius: '2px',
                background: isMuted ? 'var(--ack-muted, #9A9AA3)' : 'var(--ack-accent, #8B7CFF)',
                transition: 'height 160ms ease, background 200ms ease',
              }}
            />
          ))}
        </div>
      </div>

      {/* 3. Bottom Controls */}
      <div
        style={{
          padding: '24px 20px',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 24px) + 12px)',
          display: 'flex',
          justifyContent: 'center',
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            background: 'var(--ack-surface, #131316)',
            border: '1px solid var(--ack-border, #26262B)',
            borderRadius: '32px',
            padding: '8px 16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
          }}
        >
          {/* Mute Button */}
          <button
            type="button"
            id="btn-voice-mute"
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

          {/* Speaker Button */}
          <button
            type="button"
            id="btn-voice-speaker"
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            aria-label={isSpeakerOn ? 'Turn off speaker' : 'Turn on speaker'}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: isSpeakerOn ? 'var(--ack-accent-tint, #272250)' : 'var(--ack-surface-2, #17171B)',
              border: isSpeakerOn ? '1px solid rgba(139, 124, 255, 0.4)' : '1px solid var(--ack-border, #26262B)',
              color: isSpeakerOn ? 'var(--ack-accent-text, #A99DFF)' : 'var(--ack-text, #ECECEF)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 150ms ease',
            }}
          >
            {isSpeakerOn ? <Volume2 size={20} strokeWidth={1.75} /> : <VolumeX size={20} strokeWidth={1.75} />}
          </button>

          {/* Add Participant */}
          <button
            type="button"
            id="btn-voice-add"
            onClick={() => {
              if (onAddParticipant) onAddParticipant();
              setShowAddSheet(true);
            }}
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
            id="btn-voice-end"
            onClick={onEndCall}
            aria-label="End voice session"
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

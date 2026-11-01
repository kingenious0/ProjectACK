import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  Monitor,
  Volume2,
  VolumeX,
  Maximize2,
  Terminal,
  ShieldCheck,
  Radio,
} from 'lucide-react';
import { Chat, CURRENT_USER } from '../web-db/store';

interface VideoCallOverlayProps {
  isOpen: boolean;
  chat: Chat | null;
  callType: 'audio' | 'video';
  onClose: () => void;
}

export const VideoCallOverlay: React.FC<VideoCallOverlayProps> = ({
  isOpen,
  chat,
  callType,
  onClose,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callType === 'audio');
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Timer tick
  useEffect(() => {
    let interval: any;
    if (isOpen) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen || !chat) return null;

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="echat-call-backdrop"
      id="video-call-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(5, 7, 10, 0.92)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div
        className="echat-call-stage"
        style={{
          width: '100%',
          maxWidth: '920px',
          height: '92vh',
          maxHeight: '680px',
          background: 'linear-gradient(180deg, #161B22 0%, #0D1117 100%)',
          borderRadius: '28px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.8), 0 0 32px rgba(0, 163, 255, 0.15)',
        }}
      >
        {/* Top Floating Appbar */}
        <div
          style={{
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 100%)',
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '20px',
                background: 'rgba(0, 255, 102, 0.12)',
                border: '1px solid rgba(0, 255, 102, 0.3)',
                color: '#00FF66',
                fontSize: '12px',
                fontWeight: 600,
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              <Radio size={14} className="pulse-green" />
              E2EE CALL
            </span>

            <span
              style={{
                color: '#8B949E',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <ShieldCheck size={14} color="#58A6FF" />
              AES-256 WebRTC Direct Tunnel
            </span>
          </div>

          {/* Call Duration Pill */}
          <div
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#FFF',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 600,
              fontSize: '14px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {formatTimer(callDuration)}
          </div>
        </div>

        {/* Central Video / Audio Stage */}
        <div
          style={{
            flex: 1,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          {/* Main Caller Profile & Visualizer */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 2,
            }}
          >
            {/* Ripple Avatar Container */}
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <div
                className="pulse-call-wave wave-1"
                style={{
                  position: 'absolute',
                  inset: '-15px',
                  borderRadius: '50%',
                  border: '2px solid rgba(0, 163, 255, 0.35)',
                  animation: 'pulseWave 2s infinite ease-out',
                }}
              />
              <div
                className="pulse-call-wave wave-2"
                style={{
                  position: 'absolute',
                  inset: '-30px',
                  borderRadius: '50%',
                  border: '2px solid rgba(0, 163, 255, 0.2)',
                  animation: 'pulseWave 2s infinite ease-out 0.6s',
                }}
              />
              <img
                src={chat.avatar}
                alt={chat.name}
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '4px solid #00A3FF',
                  boxShadow: '0 0 30px rgba(0, 163, 255, 0.5)',
                  position: 'relative',
                  zIndex: 3,
                }}
              />
            </div>

            <h2
              style={{
                color: '#FFF',
                fontSize: '24px',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                marginBottom: '6px',
              }}
            >
              {chat.name}
            </h2>
            <div
              style={{
                color: '#8B949E',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>@{chat.username}</span>
              <span>&bull;</span>
              <span style={{ color: '#00FF66' }}>Speaking (38kbps Opus)</span>
            </div>

            {/* Live Audio Spectrum Bar Simulator */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                height: '36px',
                marginTop: '20px',
              }}
            >
              {[18, 32, 24, 40, 20, 36, 42, 28, 38, 22, 34, 16].map((h, i) => (
                <span
                  key={i}
                  style={{
                    width: '4px',
                    height: `${h}px`,
                    borderRadius: '2px',
                    background: '#00A3FF',
                    animation: `spectrumBounce 0.6s infinite ease-in-out alternate ${i * 0.08}s`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* PIP Self Camera Window (E-Chat layout) */}
          <div
            className="echat-pip-preview"
            style={{
              position: 'absolute',
              bottom: '24px',
              right: '24px',
              width: '180px',
              height: '120px',
              borderRadius: '16px',
              background: '#0D1117',
              border: '2px solid rgba(0, 163, 255, 0.5)',
              overflow: 'hidden',
              boxShadow: '0 12px 28px rgba(0, 0, 0, 0.6)',
              zIndex: 5,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
            }}
          >
            {isVideoOff ? (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#161B22',
                  color: '#8B949E',
                  fontSize: '11px',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <VideoOff size={18} />
                <span>Camera Off</span>
              </div>
            ) : (
              <img
                src={CURRENT_USER.avatar}
                alt="You"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            )}
            <div
              style={{
                position: 'relative',
                padding: '4px 8px',
                background: 'rgba(0, 0, 0, 0.6)',
                color: '#FFF',
                fontSize: '10px',
                fontWeight: 600,
              }}
            >
              You {isMuted && <span style={{ color: '#FF4757' }}>(Muted)</span>}
            </div>
          </div>
        </div>

        {/* Bottom Floating Call Controls (E-Chat style) */}
        <div
          className="echat-call-controls"
          style={{
            padding: '24px',
            background: 'rgba(13, 17, 23, 0.85)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '18px',
            zIndex: 10,
          }}
        >
          {/* Mute Mic */}
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className={`call-action-circle ${isMuted ? 'active-red' : ''}`}
            title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
            id="btn-call-mute"
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              border: 'none',
              background: isMuted ? '#FF4757' : 'rgba(255, 255, 255, 0.1)',
              color: '#FFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
          </button>

          {/* Toggle Video */}
          <button
            type="button"
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`call-action-circle ${isVideoOff ? 'active-red' : ''}`}
            title={isVideoOff ? 'Start Video' : 'Stop Video'}
            id="btn-call-video-toggle"
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              border: 'none',
              background: isVideoOff ? '#FF4757' : 'rgba(255, 255, 255, 0.1)',
              color: '#FFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {isVideoOff ? <VideoOff size={22} /> : <VideoIcon size={22} />}
          </button>

          {/* Share Screen / Terminal */}
          <button
            type="button"
            onClick={() => setIsScreenSharing(!isScreenSharing)}
            className={`call-action-circle ${isScreenSharing ? 'active-cyan' : ''}`}
            title="Broadcast Dev Terminal / Screen"
            id="btn-call-screenshare"
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              border: 'none',
              background: isScreenSharing ? '#00A3FF' : 'rgba(255, 255, 255, 0.1)',
              color: isScreenSharing ? '#000' : '#FFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Monitor size={22} />
          </button>

          {/* Speaker Sound */}
          <button
            type="button"
            onClick={() => setIsSpeakerMuted(!isSpeakerMuted)}
            className="call-action-circle"
            title={isSpeakerMuted ? 'Unmute Speaker' : 'Mute Speaker'}
            id="btn-call-speaker"
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.1)',
              color: isSpeakerMuted ? '#FF4757' : '#FFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {isSpeakerMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
          </button>

          {/* End Call Button */}
          <button
            type="button"
            onClick={onClose}
            className="call-action-circle end-call"
            title="Hang Up Call"
            id="btn-call-hangup"
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              border: 'none',
              background: '#FF3B30',
              color: '#FFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(255, 59, 48, 0.5)',
              transition: 'all 0.15s ease',
            }}
          >
            <PhoneOff size={28} />
          </button>
        </div>
      </div>
    </div>
  );
};

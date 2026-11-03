import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  PhoneOff,
  GitBranch,
  Terminal,
  FileCode,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { Chat, CURRENT_USER } from '../../web-db/store';
import { getInitials } from '../chat/ChatList';
import { FEATURES } from '../../config/features';

export interface DesktopPairScreenProps {
  chat: Chat;
  onEndSession: () => void;
}

interface EditorTab {
  id: string;
  filename: string;
  language: string;
  codeLines: string[];
}

const SAMPLE_FILES: EditorTab[] = [
  {
    id: 'tab_sock',
    filename: 'net/core/sock.c',
    language: 'C',
    codeLines: [
      '#include <linux/kernel.h>',
      '#include <linux/module.h>',
      '#include <linux/types.h>',
      '#include <net/sock.h>',
      '',
      '/* Ack High-Performance Socket Buffer Allocation */',
      'struct sk_buff *ack_alloc_skb(unsigned int size, gfp_t priority)',
      '{',
      '    struct sk_buff *skb;',
      '    u8 *data;',
      '    bool zero_copy = true;',
      '',
      '    /* Ensure zero-copy DMA memory boundaries */',
      '    skb = __alloc_skb(size, priority, SKB_ALLOC_FCLONE, NUMA_NO_NODE);',
      '    if (!skb)',
      '        return NULL;',
      '',
      '    skb_reserve(skb, NET_SKB_PAD);',
      '    skb_reset_network_header(skb);',
      '    skb_probe_transport_header(skb);',
      '',
      '    /* Atomic ref-count verification for thread safety */',
      '    atomic_set(&skb->users, 1);',
      '    return skb;',
      '}',
      'EXPORT_SYMBOL(ack_alloc_skb);',
      '',
      'void ack_release_sock(struct sock *sk)',
      '{',
      '    if (sk && atomic_dec_and_test(&sk->sk_refcnt)) {',
      '        sock_orphan(sk);',
      '        sk_free(sk);',
      '    }',
      '}',
    ],
  },
  {
    id: 'tab_header',
    filename: 'include/net/sock.h',
    language: 'C Header',
    codeLines: [
      '#ifndef _LINUX_NET_SOCK_H',
      '#define _LINUX_NET_SOCK_H',
      '',
      'struct ack_sock_state {',
      '    atomic_t lock_state;',
      '    unsigned long rx_packets;',
      '    unsigned long tx_packets;',
      '};',
      '',
      '#endif /* _LINUX_NET_SOCK_H */',
    ],
  },
  {
    id: 'tab_tcp',
    filename: 'net/ipv4/tcp.c',
    language: 'C',
    codeLines: [
      '/* TCP Congestion Window Management */',
      'void tcp_ack_update_cwnd(struct sock *sk, u32 ack_seq)',
      '{',
      '    struct tcp_sock *tp = tcp_sk(sk);',
      '    tp->snd_cwnd = min(tp->snd_cwnd + 1, tp->snd_cwnd_clamp);',
      '}',
    ],
  },
];

export const DesktopPairScreen: React.FC<DesktopPairScreenProps> = ({
  chat,
  onEndSession,
}) => {
  if (!FEATURES.pairProgramming) return null;
  const [activeTabId, setActiveTabId] = useState('tab_sock');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const activeFile = SAMPLE_FILES.find((f) => f.id === activeTabId) || SAMPLE_FILES[0];
  const remoteInitials = getInitials(chat.name);

  return (
    <div
      className="ack-desktop-pair-screen"
      id="ack-desktop-pair"
      style={{
        position: 'fixed',
        inset: 0,
        background: '#0B0B0D',
        zIndex: 2800,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        userSelect: 'none',
        animation: 'ackFadeIn 200ms ease',
      }}
    >
      {/* 1. Top Bar */}
      <header
        style={{
          height: '56px',
          background: 'var(--ack-surface, #131316)',
          borderBottom: '1px solid var(--ack-border, #26262B)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          flexShrink: 0,
          zIndex: 10,
        }}
      >
        {/* Left: Title & Repo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--ack-accent, #8B7CFF)',
              color: '#0B0B0D',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '15px',
            }}
          >
            A
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: 'var(--ack-text, #ECECEF)',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Pair: {chat.name}
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--ack-accent-text, #A99DFF)',
                  background: 'var(--ack-accent-tint, #272250)',
                  border: '1px solid rgba(139, 124, 255, 0.3)',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontFamily: 'JetBrains Mono, monospace',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <GitBranch size={11} strokeWidth={2} />
                {chat.repoTag || 'main'}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Live indicator & Timer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              color: 'var(--ack-success, #4ADE80)',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: 'var(--ack-success, #4ADE80)',
                boxShadow: '0 0 8px rgba(74, 222, 128, 0.6)',
              }}
            />
            <span>Live • 2 editing</span>
          </div>

          <div
            style={{
              fontSize: '14px',
              fontWeight: 700,
              color: 'var(--ack-text, #ECECEF)',
              fontFamily: 'JetBrains Mono, monospace',
              background: 'var(--ack-surface-2, #17171B)',
              border: '1px solid var(--ack-border, #26262B)',
              padding: '4px 12px',
              borderRadius: '6px',
            }}
          >
            {formatTimer(sessionSeconds)}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: 'var(--ack-muted, #9A9AA3)',
            }}
          >
            <Users size={14} strokeWidth={1.75} />
            <span>2 participants</span>
          </div>
        </div>

        {/* Right: End Session Button */}
        <div>
          <button
            type="button"
            id="btn-pair-end"
            onClick={onEndSession}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-button, 8px)',
              background: 'rgba(248, 113, 113, 0.12)',
              border: '1px solid var(--ack-danger, #F87171)',
              color: 'var(--ack-danger, #F87171)',
              fontSize: '13px',
              fontWeight: 600,
              fontFamily: 'Inter, sans-serif',
              cursor: 'pointer',
              transition: 'background 150ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--ack-danger, #F87171)';
              e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(248, 113, 113, 0.12)';
              e.currentTarget.style.color = 'var(--ack-danger, #F87171)';
            }}
          >
            <PhoneOff size={14} strokeWidth={2} />
            <span>End session</span>
          </button>
        </div>
      </header>

      {/* 2. Main Workspace (Split View) */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Column (360px wide) */}
        <div
          style={{
            width: '360px',
            background: 'var(--ack-surface, #131316)',
            borderRight: '1px solid var(--ack-border, #26262B)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '16px',
            boxSizing: 'border-box',
            flexShrink: 0,
            gap: '16px',
          }}
        >
          {/* Video Tiles List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
            {/* Tile 1: Remote Dev */}
            <div
              style={{
                flex: 1,
                minHeight: '180px',
                borderRadius: '12px',
                background: '#1A1D27',
                border: '1px solid rgba(139, 124, 255, 0.3)',
                boxShadow: '0 0 20px rgba(139, 124, 255, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '12px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Remote speaking indicator */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  zIndex: 2,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(0, 0, 0, 0.65)',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--ack-text, #ECECEF)',
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
                  <span>Speaking</span>
                </div>
              </div>

              {/* Centered Avatar */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2,
                }}
              >
                <div
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    background: 'var(--ack-avatar-bg, #1A1A1F)',
                    border: '2px solid var(--ack-accent, #8B7CFF)',
                    color: 'var(--ack-text, #ECECEF)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px',
                    fontWeight: 700,
                  }}
                >
                  {remoteInitials}
                </div>
              </div>

              {/* Name Tag Bottom */}
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.65)',
                  backdropFilter: 'blur(4px)',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  zIndex: 2,
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#ECECEF' }}>
                  {chat.name}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--ack-success, #30D158)', fontWeight: 500 }}>Connected</span>
              </div>
            </div>

            {/* Tile 2: Self Dev */}
            <div
              style={{
                flex: 1,
                minHeight: '180px',
                borderRadius: '12px',
                background: isVideoOff ? 'var(--ack-surface-2, #17171B)' : '#161923',
                border: '1px solid var(--ack-border, #26262B)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '12px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Status Header */}
              <div style={{ display: 'flex', alignItems: 'center', zIndex: 2 }}>
                <span
                  style={{
                    background: 'rgba(0, 0, 0, 0.65)',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    color: 'var(--ack-muted, #9A9AA3)',
                  }}
                >
                  {isVideoOff ? 'Camera Off' : 'Local Stream'}
                </span>
              </div>

              {/* Centered Avatar */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2,
                }}
              >
                <div
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    background: 'var(--ack-accent-tint, #272250)',
                    border: '1px solid rgba(139, 124, 255, 0.4)',
                    color: 'var(--ack-accent-text, #A99DFF)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px',
                    fontWeight: 700,
                  }}
                >
                  KG
                </div>
              </div>

              {/* Name Tag Bottom */}
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.65)',
                  backdropFilter: 'blur(4px)',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  zIndex: 2,
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#ECECEF' }}>
                  {CURRENT_USER.username} (You)
                </span>
                {isMuted && (
                  <span style={{ fontSize: '11px', color: 'var(--ack-danger, #F87171)' }}>
                    Muted
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Left Column Controls */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--ack-surface-2, #17171B)',
              border: '1px solid var(--ack-border, #26262B)',
              borderRadius: '12px',
              padding: '8px 12px',
            }}
          >
            {/* Mute */}
            <button
              type="button"
              id="btn-pair-mute"
              onClick={() => setIsMuted(!isMuted)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                background: isMuted ? 'rgba(248, 113, 113, 0.15)' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: isMuted ? 'var(--ack-danger, #F87171)' : 'var(--ack-text, #ECECEF)',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 500,
              }}
            >
              {isMuted ? <MicOff size={16} strokeWidth={1.75} /> : <Mic size={16} strokeWidth={1.75} />}
              <span>{isMuted ? 'Unmute' : 'Mute'}</span>
            </button>

            {/* Camera */}
            <button
              type="button"
              id="btn-pair-camera"
              onClick={() => setIsVideoOff(!isVideoOff)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                background: isVideoOff ? 'rgba(248, 113, 113, 0.15)' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: isVideoOff ? 'var(--ack-danger, #F87171)' : 'var(--ack-text, #ECECEF)',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 500,
              }}
            >
              {isVideoOff ? <VideoOff size={16} strokeWidth={1.75} /> : <Video size={16} strokeWidth={1.75} />}
              <span>{isVideoOff ? 'Cam Off' : 'Camera'}</span>
            </button>

            {/* Share Screen */}
            <button
              type="button"
              id="btn-pair-share"
              onClick={() => setIsScreenSharing(!isScreenSharing)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                background: isScreenSharing ? 'var(--ack-accent-tint, #272250)' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: isScreenSharing ? 'var(--ack-accent-text, #A99DFF)' : 'var(--ack-text, #ECECEF)',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 500,
              }}
            >
              <Monitor size={16} strokeWidth={1.75} />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Right Side: Shared Code Editor */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            background: '#0B0B0D',
            overflow: 'hidden',
          }}
        >
          {/* File Tabs Bar */}
          <div
            style={{
              height: '40px',
              background: 'var(--ack-surface, #131316)',
              borderBottom: '1px solid var(--ack-border, #26262B)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 8px',
              gap: '4px',
              overflowX: 'auto',
            }}
          >
            {SAMPLE_FILES.map((file) => {
              const isActive = file.id === activeTabId;
              return (
                <button
                  key={file.id}
                  type="button"
                  onClick={() => setActiveTabId(file.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 14px',
                    background: isActive ? '#0B0B0D' : 'transparent',
                    border: 'none',
                    borderTop: isActive ? '2px solid var(--ack-accent, #8B7CFF)' : '2px solid transparent',
                    color: isActive ? 'var(--ack-text, #ECECEF)' : 'var(--ack-muted, #9A9AA3)',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '12px',
                    cursor: 'pointer',
                    borderRadius: '4px 4px 0 0',
                    transition: 'color 150ms ease, background 150ms ease',
                  }}
                >
                  <FileCode size={14} strokeWidth={1.75} />
                  <span>{file.filename}</span>
                </button>
              );
            })}
          </div>

          {/* Code Body with Participant Cursors */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px 20px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '13px',
              lineHeight: 1.6,
              background: '#0B0B0D',
              position: 'relative',
            }}
          >
            {activeFile.codeLines.map((line, idx) => {
              const lineNo = idx + 1;
              const isYourCursor = lineNo === 14;
              const isOtherCursor = lineNo === 23;

              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    minHeight: '22px',
                    position: 'relative',
                    background: isYourCursor
                      ? 'rgba(139, 124, 255, 0.08)'
                      : isOtherCursor
                      ? 'rgba(74, 222, 128, 0.08)'
                      : 'transparent',
                    borderRadius: '4px',
                  }}
                >
                  {/* Line Number */}
                  <span
                    style={{
                      width: '42px',
                      color: 'var(--ack-border, #45454E)',
                      textAlign: 'right',
                      paddingRight: '16px',
                      userSelect: 'none',
                      flexShrink: 0,
                    }}
                  >
                    {lineNo}
                  </span>

                  {/* Code Line */}
                  <span
                    style={{
                      color: line.startsWith('/*') || line.startsWith(' *') || line.startsWith('//')
                        ? 'var(--ack-muted, #9A9AA3)'
                        : line.startsWith('#')
                        ? 'var(--ack-accent-text, #A99DFF)'
                        : 'var(--ack-text, #ECECEF)',
                      whiteSpace: 'pre',
                      position: 'relative',
                      flex: 1,
                    }}
                  >
                    {line || ' '}

                    {/* Participant Cursor: Yours (Accent #8B7CFF) at Line 14 */}
                    {isYourCursor && (
                      <span
                        style={{
                          position: 'relative',
                          display: 'inline-block',
                          marginLeft: '2px',
                        }}
                      >
                        <span
                          style={{
                            display: 'inline-block',
                            width: '2px',
                            height: '16px',
                            background: 'var(--ack-accent, #8B7CFF)',
                            verticalAlign: 'middle',
                            animation: 'ackBlink 1s infinite',
                          }}
                        />
                        <span
                          style={{
                            position: 'absolute',
                            top: '-18px',
                            left: '0',
                            background: 'var(--ack-accent, #8B7CFF)',
                            color: '#0B0B0D',
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '1px 5px',
                            borderRadius: '3px',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {CURRENT_USER.username}
                        </span>
                      </span>
                    )}

                    {/* Participant Cursor: Other (Neutral / Green #4ADE80) at Line 23 */}
                    {isOtherCursor && (
                      <span
                        style={{
                          position: 'relative',
                          display: 'inline-block',
                          marginLeft: '4px',
                        }}
                      >
                        <span
                          style={{
                            display: 'inline-block',
                            width: '2px',
                            height: '16px',
                            background: 'var(--ack-success, #4ADE80)',
                            verticalAlign: 'middle',
                            animation: 'ackBlink 1.2s infinite',
                          }}
                        />
                        <span
                          style={{
                            position: 'absolute',
                            top: '-18px',
                            left: '0',
                            background: 'var(--ack-success, #4ADE80)',
                            color: '#0B0B0D',
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '1px 5px',
                            borderRadius: '3px',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {chat.username || 'torvalds'}
                        </span>
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Bottom Editor Status Bar */}
          <footer
            style={{
              height: '28px',
              background: 'var(--ack-surface, #131316)',
              borderTop: '1px solid var(--ack-border, #26262B)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 16px',
              fontSize: '11px',
              color: 'var(--ack-muted, #9A9AA3)',
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span>UTF-8</span>
              <span>{activeFile.language}</span>
              <span>Spaces: 4</span>
              <span>Git: {chat.repoTag || 'HEAD'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: 'var(--ack-success, #4ADE80)' }}>● Latency: 16ms</span>
              <span>Ack Live Sync Engine</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

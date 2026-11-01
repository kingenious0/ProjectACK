import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Clock,
  GitBranch,
  Users,
  Bell,
  BellOff,
  Trash2,
  X,
  ExternalLink,
  ChevronRight,
  Code,
  KeyRound,
  FileText,
} from 'lucide-react';
import { Chat } from '../web-db/store';

interface ProtectedChatDrawerProps {
  isOpen: boolean;
  chat: Chat | null;
  onClose: () => void;
  onOpenVault: () => void;
  onOpenCode: () => void;
}

export const ProtectedChatDrawer: React.FC<ProtectedChatDrawerProps> = ({
  isOpen,
  chat,
  onClose,
  onOpenVault,
  onOpenCode,
}) => {
  const [isProtected, setIsProtected] = useState(true);
  const [autoBurnTimer, setAutoBurnTimer] = useState<'off' | '24h' | '7d' | '30d'>('24h');
  const [isMuted, setIsMuted] = useState(false);

  if (!isOpen || !chat) return null;

  return (
    <div
      className="echat-drawer-backdrop"
      id="protected-chat-drawer-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9000,
        background: 'rgba(5, 7, 10, 0.65)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        className="echat-drawer-panel"
        id="protected-chat-drawer"
        style={{
          width: '100%',
          maxWidth: '420px',
          height: '100%',
          background: '#0D1117',
          borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          boxShadow: '-16px 0 48px rgba(0, 0, 0, 0.7)',
          animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(0, 255, 102, 0.12)',
                border: '1px solid rgba(0, 255, 102, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00FF66',
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 style={{ color: '#FFF', fontSize: '15px', fontWeight: 600 }}>Protected Dev Room</h3>
              <span style={{ color: '#00FF66', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace' }}>
                AES-256-GCM VERIFIED
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#8B949E',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Recipient / Group Showcase */}
        <div
          style={{
            padding: '28px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'linear-gradient(180deg, rgba(22, 27, 34, 0.6) 0%, transparent 100%)',
          }}
        >
          <img
            src={chat.avatar}
            alt={chat.name}
            style={{
              width: '84px',
              height: '84px',
              borderRadius: '24px',
              objectFit: 'cover',
              border: '2px solid rgba(0, 163, 255, 0.5)',
              marginBottom: '12px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
            }}
          />
          <h2 style={{ color: '#FFF', fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>
            {chat.name}
          </h2>
          <span style={{ color: '#8B949E', fontSize: '13px', marginBottom: '14px' }}>
            @{chat.username}
          </span>

          {chat.repoTag && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '20px',
                background: 'rgba(163, 113, 247, 0.15)',
                border: '1px solid rgba(163, 113, 247, 0.3)',
                color: '#BC8CFF',
                fontSize: '12px',
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              <GitBranch size={13} />
              <span>{chat.repoTag}</span>
            </div>
          )}
        </div>

        {/* Security Controls (E-Chat Protected Chat-3) */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h4
            style={{
              color: '#8B949E',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: 700,
            }}
          >
            Zero-Trust Privacy Controls
          </h4>

          {/* Toggle Protected Session */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px',
              background: 'rgba(22, 27, 34, 0.8)',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Lock size={18} color="#00FF66" />
              <div>
                <div style={{ color: '#FFF', fontSize: '14px', fontWeight: 600 }}>Protected Chat Lock</div>
                <div style={{ color: '#8B949E', fontSize: '11px' }}>Biometric unlock required to enter</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isProtected}
              onChange={() => setIsProtected(!isProtected)}
              style={{ width: '18px', height: '18px', accentColor: '#00FF66', cursor: 'pointer' }}
            />
          </div>

          {/* Auto-Burn Ephemeral Timer */}
          <div
            style={{
              padding: '14px',
              background: 'rgba(22, 27, 34, 0.8)',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <Clock size={18} color="#FFB800" />
              <div style={{ color: '#FFF', fontSize: '14px', fontWeight: 600 }}>Ephemeral Auto-Purge</div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['off', '24h', '7d', '30d'] as const).map((timer) => (
                <button
                  key={timer}
                  type="button"
                  onClick={() => setAutoBurnTimer(timer)}
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    borderRadius: '8px',
                    border: 'none',
                    background: autoBurnTimer === timer ? '#00A3FF' : 'rgba(255, 255, 255, 0.05)',
                    color: autoBurnTimer === timer ? '#000' : '#8B949E',
                    fontWeight: 600,
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {timer.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Mute Notifications */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px',
              background: 'rgba(22, 27, 34, 0.8)',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {isMuted ? <BellOff size={18} color="#FF4757" /> : <Bell size={18} color="#8B949E" />}
              <div>
                <div style={{ color: '#FFF', fontSize: '14px', fontWeight: 600 }}>Mute Notifications</div>
                <div style={{ color: '#8B949E', fontSize: '11px' }}>Silence code pushes and pings</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isMuted}
              onChange={() => setIsMuted(!isMuted)}
              style={{ width: '18px', height: '18px', accentColor: '#00A3FF', cursor: 'pointer' }}
            />
          </div>

          {/* Shared Developer Assets Quick Links */}
          <h4
            style={{
              color: '#8B949E',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: 700,
              marginTop: '10px',
            }}
          >
            Shared Developer Assets
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div
              onClick={() => {
                onClose();
                onOpenVault();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                background: 'rgba(255, 184, 0, 0.08)',
                border: '1px solid rgba(255, 184, 0, 0.2)',
                borderRadius: '12px',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <KeyRound size={16} color="#FFB800" />
                <span style={{ color: '#FFF', fontSize: '13px', fontWeight: 500 }}>
                  Active .env Vault Keys (2)
                </span>
              </div>
              <ChevronRight size={16} color="#8B949E" />
            </div>

            <div
              onClick={() => {
                onClose();
                onOpenCode();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                background: 'rgba(0, 255, 102, 0.08)',
                border: '1px solid rgba(0, 255, 102, 0.2)',
                borderRadius: '12px',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Code size={16} color="#00FF66" />
                <span style={{ color: '#FFF', fontSize: '13px', fontWeight: 500 }}>
                  Shared Code Snippets (5)
                </span>
              </div>
              <ChevronRight size={16} color="#8B949E" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

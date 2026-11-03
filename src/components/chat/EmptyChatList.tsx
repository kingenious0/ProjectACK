import React from 'react';
import { MessageSquarePlus, GitFork } from 'lucide-react';

interface EmptyChatListProps {
  onStartChat: () => void;
  onConnectRepo?: () => void;
}

export const EmptyChatList: React.FC<EmptyChatListProps> = ({ onStartChat, onConnectRepo }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '56px 24px',
        textAlign: 'center',
        minHeight: '360px',
      }}
    >
      {/* Icon Tile */}
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '16px',
          backgroundColor: '#18181C',
          border: '1px solid #26262B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
        }}
      >
        <MessageSquarePlus size={30} color="#8B7CFF" />
      </div>

      <h3
        style={{
          fontSize: '18px',
          fontWeight: 600,
          color: '#F4F4F5',
          margin: '0 0 8px 0',
          letterSpacing: '-0.01em',
        }}
      >
        No conversations yet
      </h3>

      <p
        style={{
          fontSize: '13px',
          lineHeight: '1.5',
          color: '#71717A',
          maxWidth: '280px',
          margin: '0 0 24px 0',
        }}
      >
        Start a chat with a teammate or connect a GitHub repository to track commits and PRs.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '240px' }}>
        <button
          onClick={onStartChat}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            backgroundColor: '#8B7CFF',
            color: '#0B0B0D',
            border: 'none',
            borderRadius: '10px',
            padding: '12px 18px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'transform 0.15s ease, opacity 0.15s ease',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <MessageSquarePlus size={16} />
          <span>Start a chat</span>
        </button>

        <button
          onClick={onConnectRepo}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            backgroundColor: 'transparent',
            color: '#A1A1AA',
            border: '1px solid #26262B',
            borderRadius: '10px',
            padding: '12px 18px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'border-color 0.15s ease, color 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#3F3F46';
            e.currentTarget.style.color = '#F4F4F5';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#26262B';
            e.currentTarget.style.color = '#A1A1AA';
          }}
        >
          <GitFork size={16} />
          <span>Connect a GitHub repo</span>
        </button>
      </div>
    </div>
  );
};

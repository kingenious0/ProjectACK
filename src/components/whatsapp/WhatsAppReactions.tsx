import React from 'react';
import { Trash2 } from 'lucide-react';
import { CURRENT_USER } from '../../web-db/store';

interface WhatsAppReactionsProps {
  reactions?: Record<string, string[]>;
  onToggleReaction: (emoji: string) => void;
  onDeleteMessage?: () => void;
  isMe: boolean;
  showBar: boolean;
  onCloseBar: () => void;
}

const QUICK_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

export const WhatsAppReactions: React.FC<WhatsAppReactionsProps> = ({
  reactions = {},
  onToggleReaction,
  onDeleteMessage,
  isMe,
  showBar,
  onCloseBar,
}) => {
  const reactionEntries = Object.entries(reactions).filter(([_, users]) => users.length > 0);

  return (
    <>
      {/* Floating Reaction Bar (when triggered by hover or tap) */}
      {showBar && (
        <div
          className="wa-floating-reaction-bar"
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: '-42px',
            [isMe ? 'right' : 'left']: '12px',
            background: '#233138',
            borderRadius: '24px',
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
            border: '1px solid rgba(255,255,255,0.08)',
            zIndex: 50,
            animation: 'popIn 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          }}
        >
          {QUICK_EMOJIS.map((emoji) => {
            const hasReacted = reactions[emoji]?.includes(CURRENT_USER.id);
            return (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  onToggleReaction(emoji);
                  onCloseBar();
                }}
                style={{
                  background: hasReacted ? 'rgba(0, 168, 132, 0.25)' : 'transparent',
                  border: 'none',
                  fontSize: '18px',
                  padding: '4px 6px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  transform: hasReacted ? 'scale(1.2)' : 'scale(1)',
                  transition: 'transform 0.12s ease',
                }}
                onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.3)')}
                onMouseOut={(e) => (e.currentTarget.style.transform = hasReacted ? 'scale(1.2)' : 'scale(1)')}
              >
                {emoji}
              </button>
            );
          })}

          {onDeleteMessage && (
            <button
              type="button"
              onClick={() => {
                onDeleteMessage();
                onCloseBar();
              }}
              title="Delete message"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#EF4444',
                padding: '4px 6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: '4px',
                borderLeft: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      )}

      {/* Rendered Reactions Pill under Bubble */}
      {reactionEntries.length > 0 && (
        <div
          className="wa-reactions-pill"
          style={{
            position: 'absolute',
            bottom: '-12px',
            [isMe ? 'right' : 'left']: '14px',
            background: '#202C33',
            border: '1px solid #111B21',
            borderRadius: '12px',
            padding: '2px 6px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.4)',
            zIndex: 5,
            cursor: 'pointer',
          }}
          onClick={(e) => {
            e.stopPropagation();
            onToggleReaction(reactionEntries[0][0]);
          }}
        >
          {reactionEntries.map(([emoji, users]) => (
            <span key={emoji} style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
              <span>{emoji}</span>
              {users.length > 1 && <span style={{ color: '#8696A0', fontSize: '10px' }}>{users.length}</span>}
            </span>
          ))}
        </div>
      )}
    </>
  );
};

import React from 'react';
import { Trash2 } from 'lucide-react';
import { CURRENT_USER } from '../../web-db/store';

export interface ReactionsProps {
  reactions?: Record<string, string[]>;
  onToggleReaction: (emoji: string) => void;
  onDeleteMessage?: () => void;
  isMe: boolean;
  showBar: boolean;
  onCloseBar: () => void;
}

const QUICK_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

export const Reactions: React.FC<ReactionsProps> = ({
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
          className="ack-floating-reaction-bar"
          onClick={(e) => e.stopPropagation()}
          role="toolbar"
          aria-label="Message reactions"
          style={{
            position: 'absolute',
            top: '-42px',
            [isMe ? 'right' : 'left']: '12px',
            background: 'var(--ack-surface-2)',
            borderRadius: '24px',
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
            border: '1px solid var(--ack-border)',
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
                aria-label={`React with ${emoji}`}
                style={{
                  background: hasReacted ? 'var(--ack-accent-tint)' : 'transparent',
                  border: 'none',
                  fontSize: '18px',
                  padding: '4px 6px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  transform: hasReacted ? 'scale(1.15)' : 'scale(1)',
                  transition: 'transform var(--transition-fast)',
                }}
                onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.25)')}
                onMouseOut={(e) => (e.currentTarget.style.transform = hasReacted ? 'scale(1.15)' : 'scale(1)')}
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
              aria-label="Delete message"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--ack-danger)',
                padding: '4px 6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: '4px',
                borderLeft: '1px solid var(--ack-border)',
              }}
            >
              <Trash2 size={16} strokeWidth={1.75} />
            </button>
          )}
        </div>
      )}

      {/* Rendered Reactions Pill under Bubble */}
      {reactionEntries.length > 0 && (
        <div
          className="ack-reactions-pill"
          style={{
            position: 'absolute',
            bottom: '-12px',
            [isMe ? 'right' : 'left']: '14px',
            background: 'var(--ack-surface)',
            border: '1px solid var(--ack-border)',
            borderRadius: '12px',
            padding: '2px 6px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
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
              {users.length > 1 && <span style={{ color: 'var(--ack-muted)', fontSize: '10px' }}>{users.length}</span>}
            </span>
          ))}
        </div>
      )}
    </>
  );
};

// Backward-compatibility export
export const WhatsAppReactions = Reactions;

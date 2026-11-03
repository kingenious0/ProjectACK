import React, { useState } from 'react';
import { Search, X, Smile, Terminal, ThumbsUp, Heart } from 'lucide-react';

export interface EmojiPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEmoji: (emoji: string) => void;
}

const EMOJI_CATEGORIES = [
  {
    id: 'smileys',
    name: 'Smileys',
    icon: <Smile size={16} strokeWidth={1.75} />,
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '🥹', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😋', '😛', '😜', '🤪', '😎', '🤓', '🧐', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '🤔', '🫣', '🫡', '🤐', '🫠'],
  },
  {
    id: 'dev',
    name: 'Dev & Tech',
    icon: <Terminal size={16} strokeWidth={1.75} />,
    emojis: ['💻', '🖥️', '⌨️', '🖱️', '📱', '🚀', '⚡', '🔥', '🐛', '🪲', '🔒', '🔑', '🛡️', '📦', '🐙', '🛠️', '⚙️', '🔧', '🔨', '💡', '🤖', '👾', '🎮', '🕹️', '📡', '🛰️', '💾', '💿', '🔌', '🔋', '☕', '🧠', '🧪', '🔬', '📊', '📈', '📉', '📋', '📁', '📄', '🏷️', '🔖', '🧬', '⚛️'],
  },
  {
    id: 'hands',
    name: 'Gestures',
    icon: <ThumbsUp size={16} strokeWidth={1.75} />,
    emojis: ['👍', '👎', '👏', '🙌', '👐', '🤲', '🤝', '✌️', '🤞', '🫰', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '👊', '✊', '🤛', '🤜', '💪', '🙏', '✍️', '💅', '🤳'],
  },
  {
    id: 'symbols',
    name: 'Reactions',
    icon: <Heart size={16} strokeWidth={1.75} />,
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '✨', '⭐', '🌟', '💫', '💥', '💯', '🎉', '🎊', '🎯', '🏆', '🥇', '🥈', '🥉', '⚠️', '🚨', '⛔', '🚫', '✅', '❌', '❓', '❗'],
  },
];

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  isOpen,
  onClose,
  onSelectEmoji,
}) => {
  const [activeCategory, setActiveCategory] = useState('smileys');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const currentCategory = EMOJI_CATEGORIES.find((c) => c.id === activeCategory) || EMOJI_CATEGORIES[0];
  const allEmojis = EMOJI_CATEGORIES.flatMap((c) => c.emojis);
  const displayEmojis = searchQuery.trim()
    ? allEmojis.filter((emoji) => emoji.includes(searchQuery.trim()))
    : currentCategory.emojis;

  return (
    <div
      className="ack-emoji-drawer"
      role="dialog"
      aria-label="Emoji Picker"
      style={{
        position: 'absolute',
        bottom: '72px',
        left: '12px',
        width: '340px',
        maxWidth: 'calc(100vw - 24px)',
        height: '320px',
        background: 'var(--ack-surface)',
        borderRadius: 'var(--radius-card)',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.7)',
        border: '1px solid var(--ack-border)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        overflow: 'hidden',
        animation: 'fadeIn 0.15s ease',
      }}
    >
      {/* Search Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          borderBottom: '1px solid var(--ack-border)',
          background: 'var(--ack-surface-2)',
        }}
      >
        <Search size={16} strokeWidth={1.75} color="var(--ack-muted)" />
        <input
          type="text"
          placeholder="Search emoji..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search emoji"
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--ack-text)',
            fontSize: '13.5px',
          }}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            aria-label="Clear emoji search"
            style={{ background: 'transparent', border: 'none', color: 'var(--ack-muted)', cursor: 'pointer', padding: '2px' }}
          >
            <X size={14} strokeWidth={1.75} />
          </button>
        )}
      </div>

      {/* Emoji Grid Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '10px',
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '6px',
        }}
      >
        {displayEmojis.map((emoji, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectEmoji(emoji)}
            aria-label={`Select emoji ${emoji}`}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background var(--transition-fast)',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = 'var(--ack-surface-2)')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Category Tabs Footer */}
      <div
        style={{
          height: '42px',
          background: 'var(--ack-surface-2)',
          borderTop: '1px solid var(--ack-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '0 8px',
        }}
      >
        {EMOJI_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id && !searchQuery;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setActiveCategory(cat.id);
                setSearchQuery('');
              }}
              title={cat.name}
              aria-label={cat.name}
              style={{
                background: 'transparent',
                border: 'none',
                color: isActive ? 'var(--ack-accent)' : 'var(--ack-muted)',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderBottom: isActive ? '2px solid var(--ack-accent)' : '2px solid transparent',
              }}
            >
              {cat.icon}
            </button>
          );
        })}

        <button
          type="button"
          onClick={onClose}
          title="Close emoji picker"
          aria-label="Close emoji picker"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--ack-muted)',
            cursor: 'pointer',
            padding: '8px',
          }}
        >
          <X size={16} strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
};

// Backward-compatibility export
export const WhatsAppEmojiPicker = EmojiPicker;

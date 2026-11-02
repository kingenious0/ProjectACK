import React, { useState } from 'react';
import { Search, X, Smile, Terminal, ThumbsUp, Heart } from 'lucide-react';

interface WhatsAppEmojiPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEmoji: (emoji: string) => void;
}

const EMOJI_CATEGORIES = [
  {
    id: 'smileys',
    name: 'Smileys',
    icon: <Smile size={16} />,
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '🥹', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😋', '😛', '😜', '🤪', '😎', '🤓', '🧐', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '🤔', '🫣', '🫡', '🤐', '🫠'],
  },
  {
    id: 'dev',
    name: 'Dev & Tech',
    icon: <Terminal size={16} />,
    emojis: ['💻', '🖥️', '⌨️', '🖱️', '📱', '🚀', '⚡', '🔥', '🐛', '🪲', '🔒', '🔑', '🛡️', '📦', '🐙', '🛠️', '⚙️', '🔧', '🔨', '💡', '🤖', '👾', '🎮', '🕹️', '📡', '🛰️', '💾', '💿', '🔌', '🔋', '☕', '🧠', '🧪', '🔬', '📊', '📈', '📉', '📋', '📁', '📄', '🏷️', '🔖', '🧬', '⚛️'],
  },
  {
    id: 'hands',
    name: 'Gestures',
    icon: <ThumbsUp size={16} />,
    emojis: ['👍', '👎', '👏', '🙌', '👐', '🤲', '🤝', '✌️', '🤞', '🫰', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '👊', '✊', '🤛', '🤜', '💪', '🙏', '✍️', '💅', '🤳'],
  },
  {
    id: 'symbols',
    name: 'Reactions',
    icon: <Heart size={16} />,
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '✨', '⭐', '🌟', '💫', '💥', '💯', '🎉', '🎊', '🎯', '🏆', '🥇', '🥈', '🥉', '⚠️', '🚨', '⛔', '🚫', '✅', '❌', '❓', '❗'],
  },
];

export const WhatsAppEmojiPicker: React.FC<WhatsAppEmojiPickerProps> = ({
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
      className="wa-emoji-drawer"
      style={{
        position: 'absolute',
        bottom: '72px',
        left: '12px',
        width: '340px',
        maxWidth: 'calc(100vw - 24px)',
        height: '320px',
        background: '#202C33',
        borderRadius: '16px',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
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
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          background: '#111B21',
        }}
      >
        <Search size={16} color="#8696A0" />
        <input
          type="text"
          placeholder="Search emoji..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#E9EDEF',
            fontSize: '13.5px',
          }}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            style={{ background: 'transparent', border: 'none', color: '#8696A0', cursor: 'pointer', padding: '2px' }}
          >
            <X size={14} />
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
              transition: 'transform 0.1s ease, background 0.1s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)')}
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
          background: '#111B21',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
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
              style={{
                background: 'transparent',
                border: 'none',
                color: isActive ? '#00A884' : '#8696A0',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderBottom: isActive ? '2px solid #00A884' : '2px solid transparent',
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
          style={{
            background: 'transparent',
            border: 'none',
            color: '#8696A0',
            cursor: 'pointer',
            padding: '8px',
          }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

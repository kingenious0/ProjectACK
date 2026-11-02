import React, { useState } from 'react';
import { X, Send, Smile } from 'lucide-react';

interface WhatsAppImagePreviewModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  fileName?: string;
  onClose: () => void;
  onSend: (caption: string) => void;
}

export const WhatsAppImagePreviewModal: React.FC<WhatsAppImagePreviewModalProps> = ({
  isOpen,
  imageSrc,
  fileName,
  onClose,
  onSend,
}) => {
  const [caption, setCaption] = useState('');

  if (!isOpen || !imageSrc) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSend(caption);
    setCaption('');
  };

  return (
    <div
      className="wa-image-preview-modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(11, 20, 26, 0.96)',
        backdropFilter: 'blur(10px)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        animation: 'fadeIn 0.15s ease',
      }}
    >
      {/* Top Header */}
      <div
        style={{
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#8696A0',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={24} />
        </button>

        <span style={{ color: '#E9EDEF', fontSize: '16px', fontWeight: 500 }}>
          {fileName || 'Send Photo'}
        </span>

        <div style={{ width: '40px' }} />
      </div>

      {/* Main Image Center */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          overflow: 'hidden',
        }}
      >
        <img
          src={imageSrc}
          alt="Selected preview"
          style={{
            maxWidth: '100%',
            maxHeight: 'calc(100vh - 200px)',
            borderRadius: '8px',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.7)',
            objectFit: 'contain',
          }}
        />
      </div>

      {/* Bottom Caption Input & Send Footer */}
      <form
        onSubmit={handleSubmit}
        style={{
          background: '#202C33',
          padding: '12px 20px',
          paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 8px))',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <button
          type="button"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#8696A0',
            cursor: 'pointer',
            padding: '4px',
          }}
        >
          <Smile size={24} />
        </button>

        <input
          type="text"
          placeholder="Add a caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          autoFocus
          style={{
            flex: 1,
            height: '44px',
            background: '#2A3942',
            border: 'none',
            outline: 'none',
            borderRadius: '8px',
            padding: '10px 16px',
            color: '#E9EDEF',
            fontSize: '15px',
          }}
        />

        <button
          type="submit"
          title="Send photo"
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            background: '#00A884',
            border: 'none',
            color: '#0B141A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(0, 168, 132, 0.5)',
          }}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

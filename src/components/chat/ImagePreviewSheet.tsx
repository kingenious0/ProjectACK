import React, { useState } from 'react';
import { X, Send, Smile } from 'lucide-react';

export interface ImagePreviewSheetProps {
  isOpen: boolean;
  imageSrc: string | null;
  fileName?: string;
  onClose: () => void;
  onSend: (caption: string) => void;
}

export const ImagePreviewSheet: React.FC<ImagePreviewSheetProps> = ({
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
      className="ack-image-preview-overlay"
      role="dialog"
      aria-label="Image preview"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(11, 11, 13, 0.96)',
        backdropFilter: 'blur(12px)',
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
          borderBottom: '1px solid var(--ack-border)',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close preview"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--ack-muted)',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 'var(--min-touch-target)',
            minHeight: 'var(--min-touch-target)',
          }}
        >
          <X size={22} strokeWidth={1.75} />
        </button>

        <span style={{ color: 'var(--ack-text)', fontSize: '15px', fontWeight: 600 }}>
          {fileName || 'Send photo'}
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
            borderRadius: 'var(--radius-card)',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.7)',
            objectFit: 'contain',
            border: '1px solid var(--ack-border)',
          }}
        />
      </div>

      {/* Bottom Caption Input & Send Footer */}
      <form
        onSubmit={handleSubmit}
        style={{
          background: 'var(--ack-surface)',
          padding: '12px 20px',
          paddingBottom: 'calc(12px + var(--sab))',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          borderTop: '1px solid var(--ack-border)',
        }}
      >
        <button
          type="button"
          aria-label="Choose emoji"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--ack-muted)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Smile size={22} strokeWidth={1.75} />
        </button>

        <input
          type="text"
          placeholder="Add a caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          aria-label="Caption"
          autoFocus
          style={{
            flex: 1,
            height: '44px',
            background: 'var(--ack-surface-2)',
            border: '1px solid var(--ack-border)',
            outline: 'none',
            borderRadius: 'var(--radius-input)',
            padding: '10px 16px',
            color: 'var(--ack-text)',
            fontSize: '14.5px',
          }}
        />

        <button
          type="submit"
          title="Send photo"
          aria-label="Send photo"
          style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-button)',
            background: 'var(--ack-accent)',
            border: 'none',
            color: '#0B0B0D',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'opacity var(--transition-fast)',
          }}
        >
          <Send size={18} strokeWidth={1.75} />
        </button>
      </form>
    </div>
  );
};

// Backward-compatibility export
export const WhatsAppImagePreviewModal = ImagePreviewSheet;

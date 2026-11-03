import React, { useState } from 'react';
import { CheckCheck, Download, X, ZoomIn, ZoomOut } from 'lucide-react';

export interface ImageMessageProps {
  imageUrl: string;
  caption?: string;
  timestamp: string;
  isMe: boolean;
  status?: 'sent' | 'delivered' | 'read';
}

export const ImageMessage: React.FC<ImageMessageProps> = ({
  imageUrl,
  caption,
  timestamp,
  isMe,
  status = 'read',
}) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <>
      <div
        className="ack-image-bubble-container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '320px',
          width: '100%',
          borderRadius: 'var(--radius-card)',
          overflow: 'hidden',
          cursor: 'pointer',
          position: 'relative',
          border: '1px solid var(--ack-border)',
        }}
        onClick={() => setIsLightboxOpen(true)}
      >
        {/* Image Preview */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxHeight: '300px',
            overflow: 'hidden',
            borderRadius: caption ? 'var(--radius-card) var(--radius-card) 0 0' : 'var(--radius-card)',
            backgroundColor: 'var(--ack-surface-2)',
          }}
        >
          <img
            src={imageUrl}
            alt={caption || 'Shared image'}
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '300px',
              objectFit: 'cover',
              display: 'block',
              transition: 'transform var(--transition-base)',
            }}
            loading="lazy"
            onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          />

          {/* Time & status badge overlaid on image if there is no caption */}
          {!caption && (
            <div
              style={{
                position: 'absolute',
                bottom: '6px',
                right: '8px',
                background: 'rgba(11, 11, 13, 0.65)',
                backdropFilter: 'blur(4px)',
                borderRadius: '10px',
                padding: '2px 6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                color: 'var(--ack-text)',
              }}
            >
              <span>{timestamp}</span>
              {isMe && <CheckCheck size={14} strokeWidth={1.75} color="var(--ack-accent)" />}
            </div>
          )}
        </div>

        {/* Caption Area */}
        {caption && (
          <div
            style={{
              padding: '8px 10px 6px 10px',
              fontSize: '14px',
              lineHeight: 1.4,
              color: 'var(--ack-text)',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              background: isMe ? 'var(--ack-accent-tint)' : 'var(--ack-surface-2)',
            }}
          >
            <span>{caption}</span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '4px',
                fontSize: '11px',
                color: isMe ? 'var(--ack-accent-text)' : 'var(--ack-muted)',
                marginTop: '2px',
              }}
            >
              <span>{timestamp}</span>
              {isMe && <CheckCheck size={14} strokeWidth={1.75} color="var(--ack-accent)" />}
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="ack-lightbox-overlay"
          role="dialog"
          aria-label="Image viewer"
          onClick={() => {
            setIsLightboxOpen(false);
            setIsZoomed(false);
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(11, 11, 13, 0.95)',
            backdropFilter: 'blur(10px)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '16px',
            animation: 'fadeIn 0.15s ease',
          }}
        >
          {/* Lightbox Header */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: 'var(--ack-text)',
              padding: '8px 16px',
              zIndex: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '15px', fontWeight: 600 }}>
                {caption ? (caption.length > 36 ? caption.slice(0, 36) + '...' : caption) : 'Photo'}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--ack-muted)' }}>{timestamp}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                type="button"
                onClick={() => setIsZoomed(!isZoomed)}
                title={isZoomed ? 'Zoom out' : 'Zoom in'}
                aria-label={isZoomed ? 'Zoom out' : 'Zoom in'}
                style={{ background: 'transparent', border: 'none', color: 'var(--ack-text)', cursor: 'pointer', padding: '6px' }}
              >
                {isZoomed ? <ZoomOut size={20} strokeWidth={1.75} /> : <ZoomIn size={20} strokeWidth={1.75} />}
              </button>

              <a
                href={imageUrl}
                download="ack-photo.png"
                target="_blank"
                rel="noreferrer"
                title="Download photo"
                aria-label="Download photo"
                style={{ color: 'var(--ack-text)', display: 'flex', alignItems: 'center', padding: '6px' }}
              >
                <Download size={20} strokeWidth={1.75} />
              </a>

              <button
                type="button"
                onClick={() => {
                  setIsLightboxOpen(false);
                  setIsZoomed(false);
                }}
                title="Close"
                aria-label="Close viewer"
                style={{ background: 'transparent', border: 'none', color: 'var(--ack-text)', cursor: 'pointer', padding: '6px' }}
              >
                <X size={22} strokeWidth={1.75} />
              </button>
            </div>
          </div>

          {/* Lightbox Center Image */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomed(!isZoomed);
            }}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'auto',
              cursor: isZoomed ? 'zoom-out' : 'zoom-in',
            }}
          >
            <img
              src={imageUrl}
              alt="Fullscreen view"
              style={{
                maxWidth: isZoomed ? '140vw' : '90vw',
                maxHeight: isZoomed ? '140vh' : '82vh',
                objectFit: 'contain',
                borderRadius: 'var(--radius-card)',
                transition: 'transform var(--transition-base), max-width var(--transition-base)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
              }}
            />
          </div>

          {/* Lightbox Footer Caption */}
          {caption && (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                textAlign: 'center',
                color: 'var(--ack-text)',
                fontSize: '14.5px',
                padding: '12px 20px',
                background: 'rgba(19, 19, 22, 0.8)',
                border: '1px solid var(--ack-border)',
                borderRadius: 'var(--radius-card)',
                maxWidth: '600px',
                margin: '0 auto',
                backdropFilter: 'blur(8px)',
              }}
            >
              {caption}
            </div>
          )}
        </div>
      )}
    </>
  );
};

// Backward-compatibility export
export const WhatsAppImageBubble = ImageMessage;

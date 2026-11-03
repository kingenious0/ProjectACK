import React, { useState } from 'react';
import { CheckCheck, Download, X, ZoomIn, ZoomOut } from 'lucide-react';

interface WhatsAppImageBubbleProps {
  imageUrl: string;
  caption?: string;
  timestamp: string;
  isMe: boolean;
  status?: 'sent' | 'delivered' | 'read';
}

export const WhatsAppImageBubble: React.FC<WhatsAppImageBubbleProps> = ({
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
        className="wa-image-bubble-container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '320px',
          width: '100%',
          borderRadius: '8px',
          overflow: 'hidden',
          cursor: 'pointer',
          position: 'relative',
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
            borderRadius: caption ? '6px 6px 0 0' : '6px',
            backgroundColor: '#1E2B32',
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
              transition: 'transform 0.2s ease',
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
                background: 'rgba(0, 0, 0, 0.45)',
                backdropFilter: 'blur(4px)',
                borderRadius: '10px',
                padding: '2px 6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                color: '#FFF',
              }}
            >
              <span>{timestamp}</span>
              {isMe && <CheckCheck size={14} color="#53BDEB" />}
            </div>
          )}
        </div>

        {/* Caption Area */}
        {caption && (
          <div
            style={{
              padding: '6px 8px 4px 8px',
              fontSize: '14.2px',
              lineHeight: 1.35,
              color: '#E9EDEF',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
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
                color: isMe ? 'rgba(233, 237, 239, 0.65)' : '#8696A0',
                marginTop: '2px',
              }}
            >
              <span>{timestamp}</span>
              {isMe && <CheckCheck size={14} color="#53BDEB" />}
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen WhatsApp Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="wa-lightbox-overlay"
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
            background: 'rgba(11, 20, 26, 0.95)',
            backdropFilter: 'blur(8px)',
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
              color: '#E9EDEF',
              padding: '8px 16px',
              zIndex: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '15px', fontWeight: 500 }}>
                {caption ? (caption.length > 36 ? caption.slice(0, 36) + '...' : caption) : 'Photo'}
              </span>
              <span style={{ fontSize: '12px', color: '#8696A0' }}>{timestamp}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                type="button"
                onClick={() => setIsZoomed(!isZoomed)}
                title={isZoomed ? 'Zoom out' : 'Zoom in'}
                style={{ background: 'transparent', border: 'none', color: '#E9EDEF', cursor: 'pointer', padding: '6px' }}
              >
                {isZoomed ? <ZoomOut size={20} /> : <ZoomIn size={20} />}
              </button>

              <a
                href={imageUrl}
                download="ack-photo.png"
                target="_blank"
                rel="noreferrer"
                title="Download photo"
                style={{ color: '#E9EDEF', display: 'flex', alignItems: 'center', padding: '6px' }}
              >
                <Download size={20} />
              </a>

              <button
                type="button"
                onClick={() => {
                  setIsLightboxOpen(false);
                  setIsZoomed(false);
                }}
                title="Close"
                style={{ background: 'transparent', border: 'none', color: '#E9EDEF', cursor: 'pointer', padding: '6px' }}
              >
                <X size={24} />
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
                borderRadius: '4px',
                transition: 'transform 0.2s ease, max-width 0.2s ease',
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
                color: '#E9EDEF',
                fontSize: '14.5px',
                padding: '12px 20px',
                background: 'rgba(0,0,0,0.6)',
                borderRadius: '12px',
                maxWidth: '600px',
                margin: '0 auto',
                backdropFilter: 'blur(4px)',
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

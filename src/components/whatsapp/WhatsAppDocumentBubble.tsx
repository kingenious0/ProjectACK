import React from 'react';
import { FileText, Download, CheckCheck, FileCode, Archive, FileSpreadsheet } from 'lucide-react';

interface WhatsAppDocumentBubbleProps {
  fileName: string;
  fileSize?: string;
  fileType?: string;
  fileUrl?: string;
  timestamp: string;
  isMe: boolean;
}

export const WhatsAppDocumentBubble: React.FC<WhatsAppDocumentBubbleProps> = ({
  fileName,
  fileSize = '1.2 MB',
  fileType = 'PDF',
  fileUrl = '#',
  timestamp,
  isMe,
}) => {
  const getBadgeColor = (type: string) => {
    const t = type.toUpperCase();
    if (t.includes('PDF')) return { bg: '#FF4D4D', icon: <FileText size={22} color="#FFF" /> };
    if (t.includes('ZIP') || t.includes('TAR') || t.includes('RAR') || t.includes('GZ')) {
      return { bg: '#FFA116', icon: <Archive size={22} color="#FFF" /> };
    }
    if (t.includes('XLS') || t.includes('CSV') || t.includes('SHEET')) {
      return { bg: '#25D366', icon: <FileSpreadsheet size={22} color="#FFF" /> };
    }
    if (t.includes('TS') || t.includes('JS') || t.includes('PY') || t.includes('RS') || t.includes('JSON')) {
      return { bg: '#00A884', icon: <FileCode size={22} color="#FFF" /> };
    }
    return { bg: '#7F66FF', icon: <FileText size={22} color="#FFF" /> };
  };

  const badge = getBadgeColor(fileType || fileName);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fileUrl && fileUrl !== '#') {
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Create a dummy text download for demo
      const blob = new Blob([`ACK. Document: ${fileName}\nExported securely from CHAT4DEVS.`], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div
      className="wa-doc-bubble-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        minWidth: '240px',
        maxWidth: '320px',
        borderRadius: '8px',
        overflow: 'hidden',
        background: isMe ? 'rgba(0, 92, 75, 0.45)' : 'rgba(32, 44, 51, 0.45)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      {/* Top File Card Content */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 12px',
          background: 'rgba(0, 0, 0, 0.15)',
        }}
      >
        {/* Extension Icon Badge */}
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '8px',
            backgroundColor: badge.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          {badge.icon}
        </div>

        {/* File Name & Metadata */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div
            title={fileName}
            style={{
              color: '#E9EDEF',
              fontSize: '14px',
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {fileName}
          </div>
          <div style={{ fontSize: '12px', color: '#8696A0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>{fileSize}</span>
            <span>•</span>
            <span style={{ textTransform: 'uppercase' }}>{fileType}</span>
          </div>
        </div>

        {/* Download Action Button */}
        <button
          type="button"
          onClick={handleDownload}
          title={`Download ${fileName}`}
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: '#E9EDEF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'background 0.15s ease',
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')}
          onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
        >
          <Download size={16} />
        </button>
      </div>

      {/* Meta Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '4px',
          padding: '4px 8px',
          fontSize: '11px',
          color: isMe ? 'rgba(233, 237, 239, 0.65)' : '#8696A0',
        }}
      >
        <span>{timestamp}</span>
        {isMe && <CheckCheck size={14} color="#53BDEB" />}
      </div>
    </div>
  );
};

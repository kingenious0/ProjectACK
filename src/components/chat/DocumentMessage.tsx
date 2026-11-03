import React from 'react';
import { FileText, Download, CheckCheck, FileCode, Archive, FileSpreadsheet } from 'lucide-react';

export interface DocumentMessageProps {
  fileName: string;
  fileSize?: string;
  fileType?: string;
  fileUrl?: string;
  timestamp: string;
  isMe: boolean;
}

export const DocumentMessage: React.FC<DocumentMessageProps> = ({
  fileName,
  fileSize = '1.2 MB',
  fileType = 'PDF',
  fileUrl = '#',
  timestamp,
  isMe,
}) => {
  const getBadgeColor = (type: string) => {
    const t = type.toUpperCase();
    if (t.includes('PDF')) return { bg: 'rgba(248, 113, 113, 0.15)', color: 'var(--ack-danger)', icon: <FileText size={20} strokeWidth={1.75} /> };
    if (t.includes('ZIP') || t.includes('TAR') || t.includes('RAR') || t.includes('GZ')) {
      return { bg: 'rgba(245, 181, 68, 0.15)', color: 'var(--ack-warning)', icon: <Archive size={20} strokeWidth={1.75} /> };
    }
    if (t.includes('XLS') || t.includes('CSV') || t.includes('SHEET')) {
      return { bg: 'rgba(74, 222, 128, 0.15)', color: 'var(--ack-success)', icon: <FileSpreadsheet size={20} strokeWidth={1.75} /> };
    }
    if (t.includes('TS') || t.includes('JS') || t.includes('PY') || t.includes('RS') || t.includes('JSON')) {
      return { bg: 'rgba(139, 124, 255, 0.15)', color: 'var(--ack-accent)', icon: <FileCode size={20} strokeWidth={1.75} /> };
    }
    return { bg: 'rgba(139, 124, 255, 0.15)', color: 'var(--ack-accent)', icon: <FileText size={20} strokeWidth={1.75} /> };
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
      const blob = new Blob([`Ack Document: ${fileName}\nExported securely.`], { type: 'text/plain' });
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
      className="ack-doc-bubble-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        minWidth: '240px',
        maxWidth: '320px',
        borderRadius: 'var(--radius-card)',
        overflow: 'hidden',
        background: isMe ? 'var(--ack-accent-tint)' : 'var(--ack-surface-2)',
        border: '1px solid var(--ack-border)',
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
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-button)',
            backgroundColor: badge.bg,
            color: badge.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            border: '1px solid var(--ack-border)',
          }}
        >
          {badge.icon}
        </div>

        {/* File Name & Metadata */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div
            title={fileName}
            style={{
              color: 'var(--ack-text)',
              fontSize: '13.5px',
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {fileName}
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--ack-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>{fileSize}</span>
            <span>·</span>
            <span style={{ textTransform: 'uppercase', fontFamily: 'var(--font-mono)', fontSize: '10.5px' }}>{fileType}</span>
          </div>
        </div>

        {/* Download Action Button */}
        <button
          type="button"
          onClick={handleDownload}
          title={`Download ${fileName}`}
          aria-label={`Download ${fileName}`}
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: 'var(--ack-surface)',
            border: '1px solid var(--ack-border)',
            color: 'var(--ack-text)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'background var(--transition-fast)',
          }}
        >
          <Download size={15} strokeWidth={1.75} />
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
          color: isMe ? 'var(--ack-accent-text)' : 'var(--ack-muted)',
        }}
      >
        <span>{timestamp}</span>
        {isMe && <CheckCheck size={14} strokeWidth={1.75} color="var(--ack-accent)" />}
      </div>
    </div>
  );
};

// Backward-compatibility export
export const WhatsAppDocumentBubble = DocumentMessage;

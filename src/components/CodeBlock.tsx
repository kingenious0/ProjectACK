import React, { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronUp, Terminal } from 'lucide-react';

interface CodeBlockProps {
  language?: string;
  code: string;
  onLineClick?: (lineNo: number, lineText: string) => void;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  language = 'typescript',
  code,
  onLineClick,
}) => {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const lines = code.trim().split('\n');
  const shouldCollapse = lines.length > 12;
  const displayedLines = shouldCollapse && !isExpanded ? lines.slice(0, 10) : lines;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-bubble-card" id={`code-block-${language}`}>
      <div className="code-header">
        <span className="code-lang-tag">
          <Terminal size={12} style={{ display: 'inline', marginRight: 4 }} />
          {language}
        </span>
        <button
          className="copy-code-btn"
          onClick={handleCopy}
          id="btn-copy-code"
          title="Copy snippet"
        >
          {copied ? (
            <>
              <Check size={13} color="#00FF66" />
              <span style={{ color: '#00FF66' }}>Copied</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <div className="code-lines-container">
        {displayedLines.map((line, idx) => {
          const lineNo = idx + 1;
          return (
            <div
              key={idx}
              className="code-line"
              onClick={() => onLineClick && onLineClick(lineNo, line)}
              title="Click to comment on this line"
            >
              <span className="line-no">{lineNo}</span>
              <span className="line-content">{line || ' '}</span>
            </div>
          );
        })}
      </div>

      {shouldCollapse && (
        <div style={{ padding: '4px 12px', background: '#11181F', borderTop: '1px solid #2A3942', textAlign: 'center' }}>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#00A884',
              cursor: 'pointer',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {isExpanded ? (
              <>
                <ChevronUp size={14} /> Collapse snippet
              </>
            ) : (
              <>
                <ChevronDown size={14} /> Show {lines.length - 10} more lines
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

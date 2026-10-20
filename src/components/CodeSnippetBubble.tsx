import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme/colors';

interface Props {
  code: string;
  language?: string;
  filename?: string;
  targetLine?: number;
  onSelectLine?: (lineNumber: number, lineText: string) => void;
}

const COLLAPSE_LINE_THRESHOLD = 15;

export const CodeSnippetBubble: React.FC<Props> = ({
  code,
  language = 'typescript',
  filename,
  targetLine,
  onSelectLine,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const lines = code.split('\n');
  const needsCollapse = lines.length > COLLAPSE_LINE_THRESHOLD;
  const displayLines = needsCollapse && !isExpanded ? lines.slice(0, COLLAPSE_LINE_THRESHOLD) : lines;

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Basic syntax highlighter helper
  const renderHighlightedLine = (line: string) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('/*')) {
      return <Text style={{ color: COLORS.syntaxComment }}>{line}</Text>;
    }

    const words = line.split(/(\s+|[(){}[\];,.<>=:+\-*/])/);
    return words.map((token, i) => {
      if (/^(import|export|from|const|let|var|function|return|class|interface|type|async|await|if|else|for|while|new)$/.test(token)) {
        return <Text key={i} style={{ color: COLORS.syntaxKeyword, fontWeight: '600' }}>{token}</Text>;
      }
      if (/^(['"`].*['"`])$/.test(token)) {
        return <Text key={i} style={{ color: COLORS.syntaxString }}>{token}</Text>;
      }
      if (/^\d+$/.test(token)) {
        return <Text key={i} style={{ color: COLORS.syntaxNumber }}>{token}</Text>;
      }
      if (/^[A-Z][a-zA-Z0-9_]*$/.test(token)) {
        return <Text key={i} style={{ color: COLORS.syntaxFunction }}>{token}</Text>;
      }
      return <Text key={i} style={{ color: COLORS.textPrimary }}>{token}</Text>;
    });
  };

  return (
    <View style={styles.container}>
      {/* Code Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.codeIcon}>&lt;/&gt;</Text>
          <Text style={styles.languageText}>{language.toUpperCase()}</Text>
          {filename ? <Text style={styles.filenameText}>• {filename}</Text> : null}
        </View>

        <TouchableOpacity onPress={handleCopy} style={styles.copyBtn}>
          <Text style={styles.copyBtnText}>{copied ? 'COPIED!' : 'COPY'}</Text>
        </TouchableOpacity>
      </View>

      {/* Code Lines with Line Numbers */}
      <View style={styles.codeBody}>
        {displayLines.map((line, idx) => {
          const lineNum = idx + 1;
          const isTargeted = targetLine === lineNum;

          return (
            <TouchableOpacity
              key={idx}
              activeOpacity={0.7}
              onPress={() => onSelectLine && onSelectLine(lineNum, line)}
              style={[styles.lineRow, isTargeted && styles.lineRowTargeted]}
            >
              {/* Tappable Line Number for inline review thread */}
              <View style={[styles.lineNumberBox, isTargeted && styles.lineNumberBoxTargeted]}>
                <Text style={[styles.lineNumberText, isTargeted && styles.lineNumberTextTargeted]}>
                  {lineNum}
                </Text>
              </View>

              {/* Code Content */}
              <View style={styles.lineContentBox}>
                <Text style={styles.codeText} numberOfLines={1}>
                  {renderHighlightedLine(line)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Expansion Toggle for lines > 15 */}
      {needsCollapse && (
        <TouchableOpacity
          style={styles.expandToggle}
          onPress={() => setIsExpanded(!isExpanded)}
        >
          <Text style={styles.expandToggleText}>
            {isExpanded
              ? '▲ Collapse code block'
              : `▼ Show ${lines.length - COLLAPSE_LINE_THRESHOLD} more lines (tap to expand)`}
          </Text>
        </TouchableOpacity>
      )}

      {/* Line review hint */}
      <View style={styles.footerHint}>
        <Text style={styles.footerHintText}>Tip: Tap any line number to open an inline review thread</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.codeBlockBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.codeBlockBorder,
    overflow: 'hidden',
    marginVertical: 4,
    minWidth: 260,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#10161D',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.codeBlockBorder,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  codeIcon: {
    color: COLORS.primary,
    fontFamily: 'monospace',
    fontWeight: '700',
    fontSize: 12,
  },
  languageText: {
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '600',
  },
  filenameText: {
    color: COLORS.textMuted,
    fontFamily: 'monospace',
    fontSize: 11,
  },
  copyBtn: {
    backgroundColor: 'rgba(0, 255, 102, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 102, 0.3)',
  },
  copyBtnText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  codeBody: {
    paddingVertical: 6,
  },
  lineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 1,
  },
  lineRowTargeted: {
    backgroundColor: COLORS.codeLineHighlight,
  },
  lineNumberBox: {
    width: 34,
    alignItems: 'flex-end',
    paddingRight: 8,
    borderRightWidth: 1,
    borderRightColor: '#1E2630',
  },
  lineNumberBoxTargeted: {
    borderRightColor: COLORS.primary,
  },
  lineNumberText: {
    color: COLORS.codeLineNumber,
    fontFamily: 'monospace',
    fontSize: 11,
  },
  lineNumberTextTargeted: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  lineContentBox: {
    flex: 1,
    paddingLeft: 8,
    paddingRight: 6,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: COLORS.textPrimary,
  },
  expandToggle: {
    backgroundColor: '#121A22',
    paddingVertical: 7,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.codeBlockBorder,
  },
  expandToggleText: {
    color: COLORS.primary,
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '600',
  },
  footerHint: {
    backgroundColor: '#0A0E11',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#161F28',
  },
  footerHintText: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontFamily: 'monospace',
    fontStyle: 'italic',
  },
});

export default CodeSnippetBubble;

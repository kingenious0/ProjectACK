/**
 * Ack Design System Tokens
 * Background #0B0B0D | Surface #131316 | Surface-2 #17171B | Avatar bg #1A1A1F
 * Border #26262B | Divider #1C1C21
 * Text #ECECEF | Muted #9A9AA3
 * Accent #8B7CFF | Accent text #A99DFF | Accent tint #272250
 * Success #4ADE80 | Danger #F87171 | Warning #F5B544
 */

export const COLORS = {
  // App Canvas
  background: '#0B0B0D',
  backgroundAlt: '#131316',
  chatWallpaper: '#0B0B0D',

  // Surfaces & Containers
  surface: '#131316',
  surfaceLight: '#17171B',
  surfaceBorder: '#26262B',
  inputBackground: '#131316',
  avatarBg: '#1A1A1F',

  // Single Accent System
  primary: '#8B7CFF',
  primaryDark: '#7A6AE6',
  primaryGlow: 'rgba(139, 124, 255, 0.2)',
  primaryMuted: '#A99DFF',
  accent: '#8B7CFF',
  accentText: '#A99DFF',
  accentTint: '#272250',
  accentTintText: '#EEEBFF',

  // Semantic Status
  success: '#4ADE80',
  danger: '#F87171',
  warning: '#F5B544',
  warningGlow: 'rgba(245, 181, 68, 0.18)',

  // Text Hierarchy
  textPrimary: '#ECECEF',
  textSecondary: '#9A9AA3',
  textMuted: '#9A9AA3',
  textDim: '#6E6E77',

  // Chat Bubbles
  bubbleSent: '#272250',
  bubbleSentBorder: '1px solid #363066',
  bubbleReceived: '#17171B',
  bubbleReceivedBorder: '1px solid #26262B',

  // Syntax Highlighting Tokens
  codeBlockBg: '#131316',
  codeBlockBorder: '#26262B',
  codeLineNumber: '#9A9AA3',
  codeLineHighlight: 'rgba(139, 124, 255, 0.12)',
  syntaxKeyword: '#8B7CFF',
  syntaxString: '#4ADE80',
  syntaxFunction: '#A99DFF',
  syntaxComment: '#9A9AA3',
  syntaxNumber: '#F5B544',

  // Git / Status Badges
  gitGreen: '#4ADE80',
  gitRed: '#F87171',
  gitPurple: '#8B7CFF',
  gitCyan: '#A99DFF',

  // Message Status Indicators
  statusPending: '#9A9AA3',
  statusSent: '#9A9AA3',
  statusDelivered: '#9A9AA3',
  statusRead: '#8B7CFF',

  // Borders & Dividers
  border: '#26262B',
  borderLight: '#1C1C21',
  divider: '#1C1C21',
};

export const FONTS = {
  mono: '"JetBrains Mono", Consolas, Menlo, Monaco, monospace',
  sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

export const THEME = {
  colors: COLORS,
  fonts: FONTS,
};

export default THEME;

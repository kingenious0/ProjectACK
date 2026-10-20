/**
 * ACK Theme: Obsidian & Cyber-Emerald
 * Designed specifically for developers with high contrast, terminal vibes,
 * and zero similarity to WhatsApp trademark green.
 */

export const COLORS = {
  // App Canvas
  background: '#0B0F12', // Deep Obsidian / Void Black
  backgroundAlt: '#080C0E',

  // Surfaces & Cards
  surface: '#131B22', // Dark Slate Gray
  surfaceLight: '#1C252E', // Lighter hover / active card
  surfaceBorder: '#232D38', // Card stroke
  inputBackground: '#10161D', // Input bars

  // Primary Accent (Cyber Emerald)
  primary: '#00FF66', // Terminal Green
  primaryGlow: 'rgba(0, 255, 102, 0.15)',
  primaryMuted: '#00B347',

  // Secondary Accent (Dev Gold / Amber)
  warning: '#FFB800', // Dev Gold / Amber (.env vaults, alerts)
  warningGlow: 'rgba(255, 184, 0, 0.18)',

  // Text Hierarchy
  textPrimary: '#F0F6FC', // High Contrast
  textSecondary: '#C9D1D9',
  textMuted: '#8B949E', // Timestamps / Metadata
  textDim: '#57606A',

  // Chat Bubbles
  bubbleSent: '#003B1F', // Dark Emerald tint
  bubbleSentBorder: '#00FF66', // 1px stroke
  bubbleReceived: '#161B22', // Dark Slate
  bubbleReceivedBorder: '#28323E',

  // Syntax Highlighting Tokens
  codeBlockBg: '#080C0E',
  codeBlockBorder: '#212B36',
  codeLineNumber: '#484F58',
  codeLineHighlight: 'rgba(0, 255, 102, 0.08)',
  syntaxKeyword: '#FF7B72',
  syntaxString: '#A5D6FF',
  syntaxFunction: '#7EE787',
  syntaxComment: '#8B949E',
  syntaxNumber: '#79C0FF',

  // Git / Status Badges
  gitGreen: '#238636',
  gitRed: '#DA3633',
  gitPurple: '#8957E5',
  gitCyan: '#388BFD',

  // Message Status Indicators
  statusPending: '#8B949E', // Clock icon
  statusSent: '#8B949E', // 1 gray tick
  statusDelivered: '#8B949E', // 2 gray ticks
  statusRead: '#00FF66', // 2 Cyber-Emerald ticks

  // Borders & Dividers
  border: '#30363D',
  borderLight: '#21262D',
  divider: '#161B22',
};

export const FONTS = {
  mono: 'Consolas, Menlo, Monaco, "Courier New", monospace',
  sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

export const THEME = {
  colors: COLORS,
  fonts: FONTS,
};

export default THEME;

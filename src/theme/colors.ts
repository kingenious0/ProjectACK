/**
 * ACK Theme: Obsidian & Cyber-Emerald
 * Designed specifically for developers with high contrast, terminal vibes,
 * and zero similarity to WhatsApp trademark green.
 */

export const COLORS = {
  // App Canvas - Authentic WhatsApp Dark Mode
  background: '#0B141A', // Deep WhatsApp Dark Canvas
  backgroundAlt: '#111B21', // WhatsApp Chat background
  chatWallpaper: '#0B141A',

  // Surfaces & AppBars
  surface: '#1F2C34', // WhatsApp AppBar / Header background
  surfaceLight: '#233138', // WhatsApp Card / hover
  surfaceBorder: '#2A3942', // WhatsApp Divider / Border
  inputBackground: '#202C33', // WhatsApp Pill Input Bar

  // Primary Accent (WhatsApp Green)
  primary: '#00A884', // Authentic WhatsApp Teal Green
  primaryDark: '#008069', // Top Tab Active / Header Green
  primaryGlow: 'rgba(0, 168, 132, 0.2)',
  primaryMuted: '#00A884',

  // Secondary Accent (Dev Gold / Amber for .env vaults)
  warning: '#FFB800', 
  warningGlow: 'rgba(255, 184, 0, 0.18)',

  // Text Hierarchy
  textPrimary: '#E9EDEF', // WhatsApp High-contrast Text
  textSecondary: '#D1D7DB',
  textMuted: '#8696A0', // WhatsApp Timestamps & subtle labels
  textDim: '#667781',

  // Chat Bubbles - Authentic WhatsApp Dark Mode
  bubbleSent: '#005C4B', // Classic WhatsApp Sent Bubble Dark Green
  bubbleSentBorder: 'transparent',
  bubbleReceived: '#202C33', // WhatsApp Received Slate Bubble
  bubbleReceivedBorder: 'transparent',

  // Syntax Highlighting Tokens
  codeBlockBg: '#111B21',
  codeBlockBorder: '#2A3942',
  codeLineNumber: '#667781',
  codeLineHighlight: 'rgba(0, 168, 132, 0.15)',
  syntaxKeyword: '#FF7B72',
  syntaxString: '#7EE787',
  syntaxFunction: '#79C0FF',
  syntaxComment: '#8696A0',
  syntaxNumber: '#FFA657',

  // Git / Status Badges
  gitGreen: '#00A884',
  gitRed: '#F15C6D',
  gitPurple: '#A371F7',
  gitCyan: '#53BDEB',

  // Message Status Indicators
  statusPending: '#8696A0', // Clock icon
  statusSent: '#8696A0', // 1 gray tick
  statusDelivered: '#8696A0', // 2 gray ticks
  statusRead: '#53BDEB', // Authentic WhatsApp Blue Ticks!

  // Borders & Dividers
  border: '#2A3942',
  borderLight: '#222E35',
  divider: '#202C33',
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

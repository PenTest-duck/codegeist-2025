/**
 * F1 Theme Constants
 * Racing-inspired colors, typography, and animation settings
 */

export const F1_THEME = {
  colors: {
    // Racing flag colors
    green: '#00D66F',      // Peak performance (green flag)
    yellow: '#FFD700',     // Normal (yellow flag)
    red: '#FF1E1E',        // Danger zone (red flag)

    // Team colors
    ferrari: '#E10600',    // Ferrari red
    mercedes: '#0090FF',   // Mercedes blue
    redbull: '#1E41FF',    // Red Bull blue
    mclaren: '#FF8000',    // McLaren orange

    // Dashboard colors
    background: {
      dark: '#0A0A0A',
      card: '#1A1A1A',
      elevated: '#2A2A2A',
      subtle: '#151515',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#A0A0A0',
      muted: '#666666',
      dim: '#404040',
    },
    border: {
      default: '#2A2A2A',
      light: '#404040',
      accent: '#E10600',
    },
  },

  typography: {
    fontFamily: {
      racing: '"Racing Sans One", sans-serif',
      mono: '"JetBrains Mono", monospace',
    },
  },

  animation: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 500,
    },
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Speedometer configuration
  speedometer: {
    needleColor: '#E10600',
    textColor: '#FFFFFF',
    needleTransitionDuration: 1000,
    needleTransition: 'easeElastic' as const,
  },

  // Load status thresholds
  loadStatus: {
    colors: {
      under: '#0090FF',     // Blue - below optimal
      optimal: '#00D66F',   // Green - in optimal range
      over: '#FFD700',      // Yellow - above optimal
      critical: '#FF1E1E',  // Red - critically overloaded
    },
  },

  // Time zone colors
  timeZone: {
    colors: {
      peak: '#00D66F',      // Green - peak performance hours
      normal: '#666666',    // Gray - normal hours
      danger: '#FF1E1E',    // Red - danger zone hours
    },
  },
};

// Racing flag emojis
export const RACING_FLAGS = {
  green: '🟢',
  yellow: '🟡',
  red: '🔴',
  checkered: '🏁',
};

// Load status emojis
export const LOAD_EMOJIS = {
  under: '💡',
  optimal: '🏆',
  over: '⚠️',
  critical: '🔴',
};

// Auto-refresh interval (milliseconds)
export const REFRESH_INTERVAL = 30000; // 30 seconds

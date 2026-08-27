/**
 * Android & Mobile Haptics Engine
 * Provides subtle tactile feedback for button clicks, voice dictation, task completion, and gestures.
 */

export const haptics = {
  /** Light click feedback for buttons & toggles (10ms) */
  light: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(10);
      } catch {}
    }
  },

  /** Medium feedback for task completions and action cards (25ms) */
  medium: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(25);
      } catch {}
    }
  },

  /** Celebratory tactile pattern for quest complete or planting an idea */
  success: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([15, 40, 25, 40, 35]);
      } catch {}
    }
  },

  /** Warning or error pulse */
  warning: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([30, 50, 30]);
      } catch {}
    }
  },

  /** Gentle heartbeat for focus sessions or voice recording pulse */
  pulse: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([12, 60, 12]);
      } catch {}
    }
  },
};

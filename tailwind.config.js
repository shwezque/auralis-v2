/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Dark surface system ──────────────────────────────────────────
        // Near-black canvas with a deep violet undertone.
        surface: {
          950: '#07060F',
          900: '#0E0C1A',
          800: '#141224',
          700: '#1C1933',
          600: '#252142',
          500: '#312D58',
        },

        // ── Aurora accent system ─────────────────────────────────────────
        // Used for glows, individual accent stops, and status indicators.
        aurora: {
          violet: '#8B5CF6',
          indigo: '#6366F1',
          blue:   '#3B82F6',
          cyan:   '#06B6D4',
        },

        // ── Functional status ────────────────────────────────────────────
        status: {
          green: '#34D399',
          red:   '#F87171',
          amber: '#FBBF24',
        },

        cream: '#F2F0FF',
      },

      fontFamily: {
        // Space Grotesk for display, brand text, agent names, CTAs
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        // Inter for all UI text, labels, transcript
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },

      animation: {
        // ── Existing ──────────────────────────────────────────────────────
        'fade-in':    'fade-in 0.25s ease-out',
        'slide-up':   'slide-up 0.3s cubic-bezier(0.0, 0, 0.2, 1)',

        // ── Agent speaking: 3 staggered rings expanding outward ───────────
        'ring-1': 'ring-expand 1.8s ease-out infinite',
        'ring-2': 'ring-expand 1.8s ease-out 0.55s infinite',
        'ring-3': 'ring-expand 1.8s ease-out 1.1s infinite',

        // ── Listening: slow breathing ring ───────────────────────────────
        'listen-ring': 'listen-ring 3s ease-in-out infinite',

        // ── User speaking: fast ring pulse ───────────────────────────────
        'speak-ring': 'speak-ring 0.65s ease-in-out infinite',

        // ── Avatar resting breathe (all active states) ───────────────────
        'orb-breathe': 'orb-breathe 4s ease-in-out infinite',

        // ── Aurora gradient shimmer (platform mark) ───────────────────────
        'aurora-shift': 'aurora-shift 6s ease-in-out infinite',

        // ── Connecting spinner ────────────────────────────────────────────
        'spin-slow': 'spin 1.4s linear infinite',
      },

      keyframes: {
        // Agent speaking: ring expands from avatar outward and fades
        'ring-expand': {
          '0%':   { transform: 'scale(0.92)', opacity: '0.65' },
          '100%': { transform: 'scale(1.85)', opacity: '0' },
        },

        // Listening: single ring breathes slowly
        'listen-ring': {
          '0%, 100%': { transform: 'scale(1.0)', opacity: '0.18' },
          '50%':       { transform: 'scale(1.12)', opacity: '0.35' },
        },

        // User speaking: tighter, faster pulse
        'speak-ring': {
          '0%, 100%': { transform: 'scale(1.0)', opacity: '0.45' },
          '50%':       { transform: 'scale(1.15)', opacity: '0.75' },
        },

        // Avatar: gentle breathe to feel alive
        'orb-breathe': {
          '0%, 100%': { transform: 'scale(1.0)' },
          '50%':       { transform: 'scale(1.035)' },
        },

        // Aurora gradient position shift
        'aurora-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':       { backgroundPosition: '100% 50%' },
        },

        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },

      backgroundSize: {
        '200': '200% 200%',
      },
    },
  },
  plugins: [
    // Safe area inset utilities. Requires viewport-fit=cover in the HTML meta tag.
    function ({ addUtilities }) {
      addUtilities({
        '.pt-safe': { paddingTop: 'env(safe-area-inset-top, 0px)' },
        '.pb-safe': { paddingBottom: 'env(safe-area-inset-bottom, 0px)' },
        '.pt-safe-or-4':  { paddingTop:    'max(env(safe-area-inset-top, 0px), 1rem)' },
        '.pt-safe-or-6':  { paddingTop:    'max(env(safe-area-inset-top, 0px), 1.5rem)' },
        '.pt-safe-or-14': { paddingTop:    'max(env(safe-area-inset-top, 0px), 3.5rem)' },
        '.pb-safe-or-4':  { paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 1rem)' },
        '.pb-safe-or-5':  { paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 1.25rem)' },
        '.pb-safe-or-6':  { paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 1.5rem)' },
        '.pb-safe-or-8':  { paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 2rem)' },
        '.pb-safe-or-10': { paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 2.5rem)' },
      })
    },
  ],
}

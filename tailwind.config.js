/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'neutral': {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d8',
          400: '#a3a3a6',
          500: '#737373',
          600: '#52525b',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
        'primary': {
          50: '#fef3ff',
          100: '#fde7ff',
          200: '#fbcbff',
          300: '#f8aff8',
          400: '#f485f4',
          500: '#ec59d4',
          600: '#d949b6',
          700: '#b83fa8',
          800: '#924080',
          900: '#772e64',
          950: '#4e1b45',
          DEFAULT: '#8b5cf6',
        },
        'secondary': {
          DEFAULT: '#06b6d4',
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          950: '#0c2d3d',
        },
        'accent': {
          DEFAULT: '#ef4444',
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        'success': {
          DEFAULT: '#10b981',
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        'warning': {
          DEFAULT: '#f59e0b',
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        'error': {
          DEFAULT: '#ef4444',
          ...Object.fromEntries(Array.from({length: 11}, (_, i) => [
            String(i === 4 ? '' : i*50 + 50),
            `hsl(${337 + i*2}, ${70 + i*2}%, ${50 + i*3}%)`
          ]))
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
        'orbitron': ['Orbitron', 'monospace'],
        'oxanium': ['Oxanium', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float-reverse 8s ease-in-out infinite reverse',
        'pulse-subtle': 'pulse-subtle 3s ease-in-out infinite',
        'rotate-glow': 'rotate-glow 10s linear infinite',
        'shimmer': 'shimmer 2s infinite',
        'heartbeat': 'heartbeat 1.5s infinite',
        'fade-in': 'fadeIn 1s ease-out',
        'slide-up': 'slideUp 0.8s cubic-bezier(0.21, 0.8, 0.44, 1)',
        'bounce-in': 'bounceIn 1s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'float-reverse': {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
          '50%': { transform: 'translateX(10px) translateY(-15px)' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        rotateGlow: {
          '0%': { transform: 'rotate(0deg)', filter: 'hue-rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)', filter: 'hue-rotate(360deg)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        heartbeat: {
          '0%': { transform: 'scale(1)' },
          '5%': { transform: 'scale(1.05)' },
          '10%': { transform: 'scale(1)' },
          '15%': { transform: 'scale(1.1)' },
          '50%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1)' },
        },
        fadeIn: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          'from': { transform: 'translateY(50px)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(139, 92, 246, 0.3)',
        'glow-secondary': '0 0 20px rgba(6, 182, 212, 0.3)',
        'glow-accent': '0 0 20px rgba(239, 68, 68, 0.3)',
        '8xl': '0 55px 65px -12px rgba(0, 0, 0, 0.25), 0 25px 25px -12px rgba(0, 0, 0, 0.25), 0 110px 130px -12px rgba(0, 0, 0, 0.25)',
      },
      backdropBlur: {
        xs: '2px',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #667eea, #764ba2)',
        'gradient-cyber': 'linear-gradient(135deg, #ff006e, #8338ec 50%, #3a86ff)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-extravaganza': 'conic-gradient(from 45deg at 50% 50%, #ff0000, #ff7300, #fffb00, #48ff00, #00ffd5, #002bff, #7a00ff, #ff00c8, #ff0000)',
      },
      screens: {
        'xs': '475px',
        'tall': { 'raw': '(min-height: 800px)' },
        'wide': { 'raw': '(max-width: 900px)' },
      },
    },
  },
  plugins: [
    // Custom plugins for modern design
    function({ addUtilities, matchUtilities, theme }) {
      const newUtilities = {
        // Glass morphism utilities
        '.bg-glass': {
          'background': rgba(255, 255, 255, 0.05),
          'backdrop-filter': 'blur(20px) saturate(180%)',
          'border': '1px solid rgba(255, 255, 255, 0.125)',
        },
        '.bg-glass-strong': {
          'background': rgba(255, 255, 255, 0.1),
          'backdrop-filter': 'blur(20px) saturate(200%)',
          'border': '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.bg-acrylic': {
          'background': rgba(255, 255, 255, 0.05),
          'backdrop-filter': 'blur(16px) saturate(150%)',
          'border': '1px solid rgba(255, 255, 255, 0.1)',
        },

        // Text stroke utilities
        '.text-stroke': {
          '-webkit-text-stroke': '2px theme(colors.neutral.100)',
          'text-stroke-width': '2px',
        },

        // Glow utilities
        '.text-glow': {
          'text-shadow': '0px 0px 10px theme(colors.primary.DEFAULT), 0px 0px 20px theme(colors.primary.DEFAULT)',
        },

        // Perspective utilities
        '.perspective-1000': {
          'perspective': '1000px',
        },

        '.perspective-none': {
          'perspective': 'none',
        },

        // Scroll utilities
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },

        '.scroll-smooth': {
          'scroll-behavior': 'smooth',
        },

        // Highlight utilities
        '.highlight': {
          'background': 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 0, 0.5) 50%, transparent 100%)',
          'border-radius': theme('borderRadius.sm'),
        },

        // Cursor utilities
        '.cursor-cyber': {
          'cursor': 'none',
        },
      };

      addUtilities(newUtilities);

      // Dynamic utilities based on theme
      matchUtilities(
        {
          'animation-shimmer': (value) => ({
            'background': `linear-gradient(90deg, transparent, ${value}, transparent)`,
            'background-size': '200% 100%',
            'animation': 'shimmer 2s infinite',
          }),
          'glow-strength': (value) => ({
            'box-shadow': `0 0 ${value} rgba(139, 92, 246, 0.3)`,
          }),
        },
        {
          values: theme('keyframes'),
        }
      );
    },
  ],
}
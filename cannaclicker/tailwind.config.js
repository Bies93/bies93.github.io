/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,js,html}'],
  theme: {
    extend: {
      colors: {
        leaf: {
          50: '#f4fbf5',
          100: '#e7f7e8',
          200: '#c8ebcb',
          300: '#a6dfab',
          400: '#72ce7b',
          500: '#45b657',
          600: '#2f9642',
          700: '#247334',
          800: '#1d592a',
          900: '#174725',
        },
        soil: {
          50: '#f6f0eb',
          100: '#e6d6c6',
          200: '#d4b99e',
          300: '#b58f6c',
          400: '#9a6f48',
          500: '#7e5532',
          600: '#614025',
          700: '#4a301c',
          800: '#382518',
          900: '#2d1e15',
        },
      },
      boxShadow: {
        card: '0 18px 40px -20px rgba(16, 185, 129, 0.45)',
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      borderRadius: {
        xl: '1.5rem',
      },
    },
  },
  plugins: [],
};
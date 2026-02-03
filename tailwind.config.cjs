/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './App.tsx',
    './index.tsx',
    './types.ts',
    './assets.ts',
    './components/**/*.{ts,tsx}',
    './screens/**/*.{ts,tsx}',
    './utils/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF6B6B',
        secondary: '#4ECDC4',
        accent: '#FFE66D',
        ink: '#2D3436',
        blueberry: '#5F27CD',
        grass: '#6AB04C',
        cream: '#FFF9F0',
        bubble: '#F7F1E3'
      },
      fontFamily: {
        display: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Rounded',
          'SF Pro Display',
          'SF Pro Text',
          'Segoe UI',
          'Helvetica Neue',
          'Arial',
          'PingFang SC',
          'Hiragino Sans GB',
          'Microsoft YaHei',
          'sans-serif'
        ],
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Text',
          'Segoe UI',
          'Helvetica Neue',
          'Arial',
          'PingFang SC',
          'Hiragino Sans GB',
          'Microsoft YaHei',
          'sans-serif'
        ]
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'pop-in': 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'float': 'float 6s ease-in-out infinite'
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' }
        },
        popIn: {
          '0%': { opacity: '0', transform: 'scale(0.5)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      },
      boxShadow: {
        comic: '0 4px 0 0 rgba(0,0,0,0.15)',
        'comic-hover': '0 2px 0 0 rgba(0,0,0,0.15)',
        glow: '0 0 15px rgba(255, 230, 109, 0.6)'
      }
    }
  },
  plugins: []
};

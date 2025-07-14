/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      keyframes: {
        shimmer: {
          '100%': {
            transform: 'translateX(100%)',
          },
        },
      },
      maxWidth: {
        '8xl': '88rem',
      },
      colors: {
        primary: {
          default: 'var(--primary-default)',
          secondary: 'var(--primary-secondary)',
          tertiary: 'var(--primary-tertiary)',
          contrast: 'var(--primary-contrast)',
        },
        accent: {
          default: 'var(--accent-default)',
          secondary: 'var(--accent-secondary)',
          tertiary: 'var(--accent-tertiary)',
          contrast: 'var(--accent-contrast)',
        },
        light: {
          default: 'var(--light-default)',
          secondary: 'var(--light-secondary)',
          tertiary: 'var(--light-tertiary)',
          contrast: 'var(--light-contrast)',
        },
        surface: {
          default: 'var(--surface-default)',
          secondary: 'var(--surface-secondary)',
          tertiary: 'var(--surface-tertiary)',
        },
        content: {
          default: 'var(--content-default)',
          secondary: 'var(--content-secondary)',
          tertiary: 'var(--content-tertiary)',
        },
        solid: {
          100: 'var(--solid-100)',
          200: 'var(--solid-200)',
          300: 'var(--solid-300)',
          400: 'var(--solid-400)',
          500: 'var(--solid-500)',
        },
      },
      fontFamily: {
        sans: '"noto-sans", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "noto-sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
        serif:
          '"Playfair Display", ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
      },
    },
    backgroundImage :{
      'gradient-blue': 'linear-gradient(95deg, #155dfc 0%, #9810fa 100%)',
    }
  },
  plugins: [require('tailwindcss-animate')]};

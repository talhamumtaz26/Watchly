/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        buttercup: {
          50: '#FEF8EA', 100: '#FCF0C6', 200: '#F8DF8F', 300: '#F6C54F',
          400: '#F0AE26', 500: '#DF9421', 600: '#C16F19', 700: '#994D0F',
          800: '#804014', 900: '#6E3216', 950: '#401908',
        },
        makara: {
          50: '#F3F3F1', 100: '#E3E2DD', 200: '#CAC8BC', 300: '#ADA79B',
          400: '#948D7B', 500: '#837A6B', 600: '#71695E', 700: '#5C534C',
          800: '#524942', 900: '#45403C', 950: '#272320',
        },
        bg: 'rgb(var(--color-bg) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        line: 'rgb(var(--color-line) / <alpha-value>)',
        fg: 'rgb(var(--color-fg) / <alpha-value>)',
        'fg-secondary': 'rgb(var(--color-fg-secondary) / <alpha-value>)',
        'fg-muted': 'rgb(var(--color-fg-muted) / <alpha-value>)',
        brand: 'rgb(var(--color-brand) / <alpha-value>)',
        'brand-hover': 'rgb(var(--color-brand-hover) / <alpha-value>)',
        'on-brand': 'rgb(var(--color-on-brand) / <alpha-value>)',
        rating: 'rgb(var(--color-rating) / <alpha-value>)',
        danger: 'rgb(var(--color-danger) / <alpha-value>)',
        'danger-text': 'rgb(var(--color-danger-text) / <alpha-value>)',
        'on-danger': 'rgb(var(--color-on-danger) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Sora', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: { sm: '6px', md: '10px', lg: '16px' },
      boxShadow: { none: 'none' },
    },
  },
  plugins: [],
};

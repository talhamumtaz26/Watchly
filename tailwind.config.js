/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#DC2626',
          dark: '#DC2626',
          purple: '#DC2626',
          blue: '#DC2626',
        },
        background: {
          light: '#000000',
          dark: '#000000',
          darker: '#0a0a0a',
        },
        card: {
          light: '#1a1a1a',
          dark: '#1a1a1a',
          darker: '#151515',
        },
        text: {
          light: '#F1F5F9',
          dark: '#F1F5F9',
          muted: '#94A3B8',
        },
        accent: {
          purple: '#DC2626',
          blue: '#DC2626',
          pink: '#DC2626',
          yellow: '#FBBF24',
          red: '#DC2626',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['Poppins', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
        'gradient-purple': 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
        'gradient-dark': 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 1) 100%)',
        'gradient-red': 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
        'purple': '0 10px 30px -5px rgba(220, 38, 38, 0.4)',
        'blue': '0 10px 30px -5px rgba(220, 38, 38, 0.4)',
        'red': '0 10px 30px -5px rgba(220, 38, 38, 0.4)',
        'green': '0 10px 30px -5px rgba(34, 197, 94, 0.5)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

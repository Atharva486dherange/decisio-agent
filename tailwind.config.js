/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFCF9',
          100: '#FAF8F5',
          150: '#F5F2EC',
          200: '#ECE7DE',
          300: '#E2DCD1',
          400: '#C9C0B3',
        },
        terracotta: {
          50: '#FDF5F1',
          100: '#FBE8E1',
          200: '#F7D0C2',
          400: '#EB7550',
          500: '#E05A30',
          600: '#D95328',
          700: '#B83E1A',
        },
        forest: {
          50: '#EAF5EC',
          100: '#D2ECD7',
          500: '#22C55E',
          700: '#15803D',
          900: '#1E2420',
          950: '#141815',
        },
        charcoal: {
          50: '#75716B',
          100: '#524E48',
          800: '#24211D',
          900: '#1A1815',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Newsreader', 'Instrument Serif', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}

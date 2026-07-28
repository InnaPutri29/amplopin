/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        quartz: {
          50: '#fdf5f5',
          100: '#fce8e8',
          300: '#f5c6c6',
          500: '#f7cac9', // Rose Quartz base
          700: '#d99a99',
          900: '#a66867',
        },
        serenity: {
          50: '#f5f7fc',
          100: '#e5eaf7',
          300: '#bac8ed',
          500: '#92a8d1', // Serenity base
          700: '#6981ad',
          900: '#465b82',
        },
        slate: {
          800: '#1e293b',
          500: '#64748b',
        },
        merah: {
          50: '#fef2f2',
          500: '#ef4444',
        }
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'sans-serif'],
      },
      borderRadius: {
        'envelope': '12px',
      },
      animation: {
        blob: "blob 7s infinite",
      },
      keyframes: {
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)",
          },
        },
      },
    },
  },
  plugins: [],
}

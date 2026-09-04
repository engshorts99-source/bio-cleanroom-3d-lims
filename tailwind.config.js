/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        clean: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#030712'
        },
        bio: {
          primary: '#0ea5e9',   // Cleanroom Cyan / Sky
          success: '#10b981',   // Sterile Green
          warning: '#f59e0b',   // Biohazard Amber
          danger: '#ef4444',    // Hazard Red
          purple: '#a855f7',    // UV sterilization
          dark: '#090d16'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'monospace'],
        sans: ['Inter', 'Pretendard', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Primary brand — deep indigo-navy (high contrast everywhere)
        brand: {
          DEFAULT: '#1E3A8A', // blue-900 — excellent contrast on white
          hover:   '#1D4ED8', // blue-700
          light:   '#EFF6FF', // blue-50
          muted:   '#BFDBFE', // blue-200
        },
        // Surfaces — pure white / very light grey tiers
        canvas:  '#F8FAFC', // slate-50
        sheet:   '#FFFFFF',
        inset:   '#F1F5F9', // slate-100
        border:  '#E2E8F0', // slate-200
        // Text — WCAG AA/AAA compliant
        ink: {
          DEFAULT: '#0F172A', // slate-950 — near-black, max contrast
          muted:   '#475569', // slate-600 — secondary text, still 4.5:1+
          faint:   '#94A3B8', // slate-400 — hints/placeholders
        },
        // Semantic verdict colors (dark enough for white bg)
        granted:  '#166534', // green-800
        rejected: '#991B1B', // red-800
        'granted-bg':  '#F0FDF4', // green-50
        'rejected-bg': '#FEF2F2', // red-50
        'granted-border':  '#86EFAC', // green-300
        'rejected-border': '#FCA5A5', // red-300
      },
      fontFamily: {
        // Inter — same font used by Google, Vercel, Linear, Notion
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
        xs:    ['0.75rem',  { lineHeight: '1.125rem' }],
        sm:    ['0.8125rem',{ lineHeight: '1.25rem' }],
        base:  ['0.9375rem',{ lineHeight: '1.5rem' }],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-md': '0 4px 12px 0 rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        focus: '0 0 0 3px rgb(30 58 138 / 0.15)',
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        sm: '0.375rem',
        md: '0.625rem',
        lg: '0.75rem',
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Sistema tipográfico 100% sem serifa (Hanken Grotesk Variable)
        brand: ['"Hanken Grotesk Variable"', 'system-ui', '-apple-system', 'sans-serif'],
        ui: ['"Hanken Grotesk Variable"', 'system-ui', '-apple-system', 'sans-serif'],
        key: ['"Hanken Grotesk Variable"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      spacing: {
        13: '3.25rem',
      },
      colors: {
        wb: {
          canvas: 'var(--wb-canvas)',
          bench: 'var(--wb-bench)',
          ink: 'var(--wb-ink)',
          'ink-2': 'var(--wb-ink-2)',
          'ink-3': 'var(--wb-ink-3)',
          line: 'var(--wb-line)',
          grid: 'var(--wb-grid)',
          axis: 'var(--wb-axis)',
          orange: 'var(--wb-orange)',
          blue: 'var(--wb-blue)',
          green: 'var(--wb-green)',
          red: 'var(--wb-red)',
          yellow: 'var(--wb-yellow)',
          purple: 'var(--wb-purple)',
          teal: 'var(--wb-teal)',
        },
      },
      transitionTimingFunction: {
        'out-soft': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};

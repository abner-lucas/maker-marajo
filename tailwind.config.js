/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Títulos: grotesca de traço editorial, menos "arredondada" que a anterior
        brand: ['"Familjen Grotesk"', '"Hanken Grotesk Variable"', 'system-ui', 'sans-serif'],
        // Texto corrido e interface
        ui: ['"Hanken Grotesk Variable"', 'system-ui', 'sans-serif'],
        // Rótulos e números: mesma família do texto, com algarismos tabulares (sem monoespaçada)
        key: ['"Hanken Grotesk Variable"', 'system-ui', 'sans-serif'],
        // Acento editorial em itálico
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
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

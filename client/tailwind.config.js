/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'ui-sans-serif', 'system-ui'],
        display: ['Outfit', 'ui-sans-serif'],
        serif: ['"DM Serif Display"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        'bg-base': 'var(--bg-base)',
        'bg-surface': 'var(--bg-surface)',
        'bg-elevated': 'var(--bg-elevated)',
        'bg-subtle': 'var(--bg-subtle)',
        'border-default': 'var(--border-default)',
        'border-strong': 'var(--border-strong)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary': 'var(--text-tertiary)',
        'accent-orange': 'var(--accent-orange)',
        'accent-orange-dim': 'var(--accent-orange-dim)',
        'accent-amber': 'var(--accent-amber)',
        green: 'var(--green)',
        'green-dim': 'var(--green-dim)',
        red: 'var(--red)',
        'red-dim': 'var(--red-dim)',
        blue: 'var(--blue)',
        'malachi-color': 'var(--malachi-color)',
        'daniel-color': 'var(--daniel-color)',
      },
      maxWidth: {
        content: '1200px',
      },
      borderRadius: {
        card: '20px',
        pill: '100px',
      },
      boxShadow: {
        card: '6px 6px 0 #18130e',
        'card-hover': '8px 8px 0 #18130e',
        btn: '3px 3px 0 #18130e',
        'btn-hover': '4px 4px 0 #18130e',
      },
      animation: {
        'pulse-orb': 'pulse-orb 4s ease-in-out infinite',
      },
      keyframes: {
        'pulse-orb': {
          '0%, 100%': { transform: 'translate(-50%, -50%) scale(1)', opacity: '0.7' },
          '50%': { transform: 'translate(-50%, -50%) scale(1.12)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

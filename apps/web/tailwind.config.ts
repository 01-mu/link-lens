import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#172033',
        mist: '#eef3f7',
        sand: '#f7f1e8',
        coral: '#f08b6f',
        teal: '#1f7a8c',
      },
      boxShadow: {
        panel: '0 24px 60px rgba(23, 32, 51, 0.14)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};

export default config;

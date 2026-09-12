import type { Config } from 'tailwindcss';
import baseConfig from '@starter/config/tailwind/base';
import typography from '@tailwindcss/typography';

const config: Config = {
  ...baseConfig,
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  plugins: [typography],
};

export default config;

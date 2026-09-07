import type { Config } from 'tailwindcss';
import baseConfig from '@starter/config/tailwind/base';

const config: Config = {
  ...(baseConfig as Config),
  content: ['./src/**/*.{ts,tsx}'],
};

export default config;

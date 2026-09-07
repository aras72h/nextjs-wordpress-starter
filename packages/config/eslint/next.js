import { FlatCompat } from '@eslint/eslintrc';
import baseConfig from './base.js';

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

export default [
  ...baseConfig,
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: ['next-env.d.ts', '.next/**', 'out/**', 'node_modules/**'],
  },
  {
    rules: {
      '@next/next/no-html-link-for-pages': 'warn',
      'react/no-unescaped-entities': 'off',
    },
  },
];

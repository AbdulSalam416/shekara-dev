import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import js from '@eslint/js';
import nx from '@nx/eslint-plugin';
import baseConfig from '../../eslint.config.mjs';
import reactHooks from 'eslint-plugin-react-hooks';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

export default [
  ...baseConfig,
  ...nx.configs['flat/react-typescript'],
  {
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: reactHooks.configs.recommended.rules,
  },
  // Instead of extending 'next' which causes circular errors,
  // we use compat.config to wrap the next plugins/rules
  ...compat.config({
    extends: ['plugin:@next/next/recommended', 'plugin:@next/next/core-web-vitals'],
  }),
  {
    ignores: ['.next/**/*'],
  },
];

import js from '@eslint/js';
import globals from 'globals';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import prettierConfig from 'eslint-plugin-prettier/recommended';
import htmlPlugin from 'eslint-plugin-html';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  // Global ignores — replaces .eslintignore and ignorePatterns
  {
    ignores: [
      'src/VERSION.js',
      'build/**',
      'playwright-report/**',
      'test-results/**',
      '**/i18n*.js',
      '**/i18n*.jsx',
    ],
  },

  // eslint:recommended
  js.configs.recommended,

  // plugin:react/recommended (flat)
  reactPlugin.configs.flat.recommended,

  // Base rules, globals, and react-hooks plugin
  {
    plugins: {
      'react-hooks': reactHooksPlugin,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      curly: ['error', 'all'],
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/display-name': 'off',
      'no-case-declarations': 'off',
      'no-extra-boolean-cast': 'off',
      'no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' },
      ],
    },
  },

  // TypeScript — replaces the overrides block
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      // recommended contains only non-type-aware rules (no await-thenable, no-floating-promises, etc.)
      // Type-aware rules live in recommended-type-checked and require parserOptions.project
      ...tsPlugin.configs.recommended.rules,
      'no-undef': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' },
      ],
    },
  },

  // Prettier — must be last to override formatting rules
  prettierConfig,

  // HTML — eslint-plugin-html extracts and lints <script> blocks
  {
    files: ['**/*.html'],
    plugins: { html: htmlPlugin },
  },
];

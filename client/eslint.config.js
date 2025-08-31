import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import react from 'eslint-plugin-react';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import tailwindcss from 'eslint-plugin-tailwindcss';
import jsdoc from 'eslint-plugin-jsdoc';

export default [
  {
    ignores: ['dist/**', 'dist-electron/**', 'node_modules/**', '*.config.js', 'release/**', 'coverage/**'],
  },
  // Base TS/React config (no type-aware parser by default)
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parser: tsparser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      '@typescript-eslint': tseslint,
      import: importPlugin,
      tailwindcss,
      jsdoc,
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: ['./tsconfig.json'],
        },
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react-hooks/exhaustive-deps': 'off',

      // React Rules
'react-refresh/only-export-components': 'off',
      'react/prop-types': 'off', // TypeScript ile gereksiz
      'react/react-in-jsx-scope': 'off', // React 17+ ile gereksiz

      // TypeScript Rules
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-var-requires': 'error',

      // General Rules
      'no-console': 'off',
      'no-debugger': 'error',
      'no-alert': 'off',
      'no-control-regex': 'off',
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      'no-undef': 'off',

      // Import/Export Rules
      'no-duplicate-imports': 'error',
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],

      // Tailwind class order (off for CI cleanliness)
      'tailwindcss/classnames-order': 'off',

      // JSDoc (off for CI cleanliness)
      'jsdoc/require-jsdoc': 'off',

      // Performance Rules (off for CI cleanliness)
      'no-await-in-loop': 'off',
      'prefer-template': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  // Node/Electron globals for main/preload
  {
    files: ['electron/**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  // Type-aware parsing for app code
  {
    files: ['src/**/*.{ts,tsx}', 'electron/**/*.{ts,tsx}'],
    ignores: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/**/*.spec.ts', 'src/**/*.spec.tsx', 'src/test/**'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
  // Test and e2e files - simple parsing without project
  {
    files: ['src/**/*.{test,spec}.{ts,tsx}', 'e2e/**/*.ts', 'playwright.config.ts', 'src/integration/**/*.ts'],
    languageOptions: {
      parserOptions: {
        // Intentionally no "project" to avoid parser error for non-tsconfig-included files
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-empty': 'off',
      'no-duplicate-imports': 'off',
      'import/order': 'off'
    },
  },
];

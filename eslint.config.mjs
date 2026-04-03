import path from 'node:path';
import { fileURLToPath } from 'node:url';

import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import eslintConfigPrettier from 'eslint-config-prettier';
import tsParser from '@typescript-eslint/parser';
import svelte from 'eslint-plugin-svelte';
import svelteConfig from './svelte.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

export default [
    {
        ignores: [
            'main.js',
            '**/.obsidian/**',
            '**/coverage/**',
            '**/dist/**',
            '**/node_modules/**',
            'resources/sample_vaults/**/_meta/**',
        ],
    },
    ...compat.config({
        env: {
            es6: true,
            node: true,
            browser: true,
        },
        extends: [
            'eslint:recommended',
            'plugin:@typescript-eslint/eslint-recommended',
            'plugin:import/typescript',
        ],
        globals: {
            Atomics: 'readonly',
            SharedArrayBuffer: 'readonly',
        },
        parser: '@typescript-eslint/parser',
        parserOptions: {
            ecmaVersion: 6,
            sourceType: 'module',
            ecmaFeatures: {
                modules: true,
            },
            extraFileExtensions: ['.svelte'],
        },
        plugins: ['@typescript-eslint', 'import'],
        rules: {
            'linebreak-style': ['error', 'unix'],
            quotes: ['error', 'single', { avoidEscape: true }],
            '@typescript-eslint/no-unused-vars': 0,
            'no-unused-vars': 0,
            semi: ['error', 'always'],
            'import/order': 'error',
            'sort-imports': [
                'error',
                {
                    ignoreDeclarationSort: true,
                },
            ],
        },
    }),
    eslintConfigPrettier,
    ...svelte.configs['flat/recommended'],
    {
        files: ['**/*.svelte'],
        languageOptions: {
            parserOptions: {
                parser: tsParser,
                extraFileExtensions: ['.svelte'],
                svelteConfig,
            },
        },
        rules: {
            'svelte/no-at-html-tags': 'off',
            'no-inner-declarations': 'off',
            'svelte/no-unused-svelte-ignore': 'off',
            // Keep the ESLint 9 migration behavior aligned with the legacy config.
            'svelte/valid-compile': 'off',
        },
    },
];

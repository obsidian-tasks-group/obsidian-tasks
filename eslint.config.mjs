import js from '@eslint/js';
import { defineConfig } from "eslint/config";
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import svelte from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import globals from 'globals';

const prettierRules = {
    'prettier/prettier': [
        'error',
        {
            trailingComma: 'all',
            printWidth: 120,
            tabWidth: 4,
            useTabs: false,
            singleQuote: true,
            bracketSpacing: true,
        },
    ],
};

export default defineConfig([
    {
        ignores: ['main.js', 'tests/.obsidian/**'],
    },
    js.configs.recommended,
    prettierConfig,
    {
        files: ['**/*.ts'],
        languageOptions: {
            parser: tsparser,
            parserOptions: {
                ecmaVersion: 6,
                sourceType: 'module',
                ecmaFeatures: { modules: true },
            },
            globals: {
                ...globals.es2015,
                ...globals.node,
                ...globals.browser,
                Atomics: 'readonly',
                SharedArrayBuffer: 'readonly',
            },
        },
        plugins: {
            '@typescript-eslint': tseslint,
            import: importPlugin,
            prettier,
        },
        rules: {
            ...tseslint.configs['eslint-recommended'].overrides[0].rules,
            ...prettierRules,
            'linebreak-style': ['error', 'unix'],
            quotes: ['error', 'single', { avoidEscape: true }],
            '@typescript-eslint/no-unused-vars': 0, // Configured in tsconfig instead.
            'no-unused-vars': 0, // Configured in tsconfig instead.
            semi: ['error', 'always'],
            'import/order': 'error',
            'sort-imports': ['error', { ignoreDeclarationSort: true }],
        },
    },
    ...svelte.configs['flat/recommended'],
    {
        files: ['**/*.svelte'],
        languageOptions: {
            parser: svelteParser,
            parserOptions: {
                parser: tsparser,
            },
            globals: {
                ...globals.browser,
            },
        },
        plugins: {
            prettier,
        },
        rules: {
            'no-inner-declarations': 0,
            'no-unused-vars': 0, // Configured in tsconfig instead.
            // For now, disable checks that were not previously run
            'svelte/no-at-html-tags': 0,
            'svelte/require-each-key': 0,
            'svelte/no-reactive-functions': 0,
            'svelte/no-unused-svelte-ignore': 0,
        },
    },
    {
        files: ['**/*.js'],
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.commonjs,
            },
        },
    },
]);

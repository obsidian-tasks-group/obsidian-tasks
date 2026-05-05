import js from '@eslint/js';
import { defineConfig } from "eslint/config";
import tsparser from '@typescript-eslint/parser';
import obsidianmd from 'eslint-plugin-obsidianmd';
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

const typescriptLanguageOptions = {
    parser: tsparser,
    parserOptions: {
        projectService: true,
    },
    globals: {
        ...globals.es2015,
        ...globals.node,
        ...globals.browser,
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
    },
};

const typescriptCommonRules = {
    ...prettierRules,
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single', {avoidEscape: true}],
    '@typescript-eslint/no-unused-vars': 0, // Configured in tsconfig instead.
    'no-unused-vars': 0, // Configured in tsconfig instead.
    semi: ['error', 'always'],
    'import/order': 'error',
    'sort-imports': ['error', {ignoreDeclarationSort: true}],

    // Bulk-disable new rules that fail, in order to be able to enable them
    // incrementally later on.
    '@microsoft/sdl/no-inner-html': 0,
    '@typescript-eslint/no-base-to-string': 0,
    '@typescript-eslint/no-deprecated': 0, // in tests: `toThrowError` is deprecated. in favor of `toThrow`
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/no-floating-promises': 0,
    '@typescript-eslint/no-for-in-array': 0,
    '@typescript-eslint/no-implied-eval': 0,
    '@typescript-eslint/no-misused-promises': 0,
    '@typescript-eslint/no-namespace': 0,
    '@typescript-eslint/no-redundant-type-constituents': 0,
    '@typescript-eslint/no-unnecessary-type-assertion': 0,
    '@typescript-eslint/no-unsafe-argument': 0,
    '@typescript-eslint/no-unsafe-assignment': 0,
    '@typescript-eslint/no-unsafe-call': 0,
    '@typescript-eslint/no-unsafe-function-type': 0,
    '@typescript-eslint/no-unsafe-member-access': 0,
    '@typescript-eslint/no-unsafe-return': 0,
    '@typescript-eslint/no-wrapper-object-types': 0,
    '@typescript-eslint/only-throw-error': 0,
    '@typescript-eslint/restrict-plus-operands': 0,
    '@typescript-eslint/restrict-template-expressions': 0,
    '@typescript-eslint/unbound-method': 0,
    'import/no-extraneous-dependencies': 0,
    'no-restricted-globals': 0,
    'no-restricted-imports': 0,
    'no-undef': 0,
    'no-unsanitized/method': 0,
    'no-unsanitized/property': 0,
    'obsidianmd/hardcoded-config-path': 0, // These were all 'https://publish.obsidian.md/tasks/' references!!!
    'obsidianmd/no-nodejs-modules': 0, // Can disable this on test files
    'obsidianmd/no-static-styles-assignment': 0, // This likely does need addressing
    'obsidianmd/prefer-active-doc': 0,
    'obsidianmd/prefer-active-window-timers': 0,
    'obsidianmd/prefer-create-el': 0,
    'obsidianmd/prefer-get-language': 0,
    'obsidianmd/rule-custom-message': 0,
    'obsidianmd/ui/sentence-case': 0,
};
export default defineConfig([
    {
        ignores: ['**/main.js'],
    },
    js.configs.recommended,
    prettierConfig,
    ...obsidianmd.configs.recommended,
    {
        files: ['**/*.ts'],
        languageOptions: typescriptLanguageOptions,
        plugins: {
            prettier,
        },
        rules: typescriptCommonRules,
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
            "obsidianmd/prefer-active-window-timers": 0,
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
        rules: {
            // Disable type-aware rules for JS files (no tsconfig coverage)
            '@typescript-eslint/no-deprecated': 0,
            '@typescript-eslint/no-explicit-any': 0,
            '@typescript-eslint/no-unused-vars': 0,
        },
    },
]);

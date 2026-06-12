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

// Set on_or_off to 1, and run the following to update the current lint issues lint.txt
//    yarn lint:no-fix 2>&1 > lint.txt; grep problems lint.txt
// Revert on_or_off to 0 before committing.
// I am charting these over time to track progress.
const on_or_off = 0;
const typescriptCommonRules = {
    ...prettierRules,
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single', {avoidEscape: true}],
    '@typescript-eslint/no-unused-vars': on_or_off, // Configured in tsconfig instead.
    'no-unused-vars': 0, // Untyped rules have turned out to be unreliable
    semi: ['error', 'always'],
    'import/order': 'error',
    'sort-imports': ['error', {ignoreDeclarationSort: true}],

    // Bulk-disable new rules that fail, in order to be able to enable them
    // incrementally later on.
    '@typescript-eslint/no-base-to-string': on_or_off,
    '@typescript-eslint/no-deprecated': on_or_off, // in tests: `toThrowError` is deprecated. in favor of `toThrow`
    '@typescript-eslint/no-explicit-any': on_or_off,
    '@typescript-eslint/no-floating-promises': on_or_off,
    '@typescript-eslint/no-for-in-array': on_or_off,
    '@typescript-eslint/no-implied-eval': on_or_off,
    '@typescript-eslint/no-misused-promises': on_or_off,
    '@typescript-eslint/no-namespace': on_or_off,
    '@typescript-eslint/no-redundant-type-constituents': on_or_off,
    '@typescript-eslint/no-unsafe-argument': on_or_off,
    '@typescript-eslint/no-unsafe-assignment': on_or_off,
    '@typescript-eslint/no-unsafe-call': on_or_off,
    '@typescript-eslint/no-unsafe-function-type': on_or_off,
    '@typescript-eslint/no-unsafe-member-access': on_or_off,
    '@typescript-eslint/no-unsafe-return': on_or_off,
    '@typescript-eslint/no-wrapper-object-types': on_or_off,
    '@typescript-eslint/only-throw-error': on_or_off,
    '@typescript-eslint/restrict-plus-operands': on_or_off,
    '@typescript-eslint/restrict-template-expressions': on_or_off,
    'import/no-extraneous-dependencies': on_or_off,
    'no-restricted-globals': on_or_off,
    'no-undef': 0, // Always off, because Moment is not provided by Obsidian when we run eslint
    'no-unsanitized/method': on_or_off,
    'no-unsanitized/property': on_or_off,
    'obsidianmd/hardcoded-config-path': 0, // These were all 'https://publish.obsidian.md/tasks/' references!!!
    'obsidianmd/no-nodejs-modules': on_or_off, // Can disable this on test files
    'obsidianmd/no-static-styles-assignment': on_or_off, // This likely does need addressing
    'obsidianmd/prefer-active-doc': on_or_off,
    'obsidianmd/prefer-active-window-timers': on_or_off,
    'obsidianmd/prefer-create-el': on_or_off,
    'obsidianmd/prefer-get-language': on_or_off,
    'obsidianmd/rule-custom-message': on_or_off,
    'obsidianmd/ui/sentence-case': on_or_off,
};

export default defineConfig([
    {
        ignores: ['**/main.js'],
    },
    js.configs.recommended,
    prettierConfig,
    ...obsidianmd.configs.recommended,
    {
        files: ['src/**/*.ts'],
        languageOptions: typescriptLanguageOptions,
        plugins: {
            prettier,
        },
        rules:  {
            ...typescriptCommonRules,
        },
    },
    {
        files: ['tests/**/*.ts'],
        languageOptions: typescriptLanguageOptions,
        plugins: {
            prettier,
        },
        rules:  {
            ...typescriptCommonRules,
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
            '@typescript-eslint/no-unused-vars': 0,
            '@typescript-eslint/no-wrapper-object-types': 0,
            '@typescript-eslint/only-throw-error': 0,
            '@typescript-eslint/restrict-plus-operands': 0,
            '@typescript-eslint/restrict-template-expressions': 0,
            '@typescript-eslint/unbound-method': 0,
            'import/no-extraneous-dependencies': 0,
            'no-restricted-globals': 0,
            'no-restricted-imports': 0, // It's fine for tests to import moment from moment.
            'no-undef': 0, // Always off, because Moment is not provided by Obsidian when we run eslint
            'no-unsanitized/method': 0,
            'no-unsanitized/property': 0,
            'no-unused-vars': 0,
            'obsidianmd/hardcoded-config-path': 0, // These were all 'https://publish.obsidian.md/tasks/' references!!!
            'obsidianmd/no-nodejs-modules': 0, // Can disable this on test files
            'obsidianmd/no-static-styles-assignment': 0, // This likely does need addressing
            'obsidianmd/prefer-active-doc': 0,
            'obsidianmd/prefer-active-window-timers': 0,
            'obsidianmd/prefer-create-el': 0,
            'obsidianmd/prefer-get-language': 0,
            'obsidianmd/rule-custom-message': 0,
            'obsidianmd/ui/sentence-case': 0,
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

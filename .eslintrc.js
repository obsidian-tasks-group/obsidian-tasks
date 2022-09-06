module.exports = {
    env: {
        es6: true,
        node: true,
        browser: true,
    },
    extends: [
        'plugin:prettier/recommended',
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
    },
    plugins: ['@typescript-eslint', 'import'],
    rules: {
        'linebreak-style': ['error', 'unix'],
        quotes: ['error', 'single', { avoidEscape: true }],
        '@typescript-eslint/no-unused-vars': 0, // Configured in tsconfig instead.
        'no-unused-vars': 0, // Configured in tsconfig instead.
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
        semi: ['error', 'always'],
        'import/order': 'error',
        'sort-imports': [
            'error',
            {
                ignoreDeclarationSort: true,
            },
        ],
    },
};

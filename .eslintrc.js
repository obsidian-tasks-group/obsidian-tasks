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
                singleQuote: true,
                tabWidth: 4,
                trailingComma: 'all',
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

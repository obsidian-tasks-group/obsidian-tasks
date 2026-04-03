/** @type {import('jest').Config} */
module.exports = {
    verbose: true,
    transform: {
        '^.+\\.svelte(\\.(js|ts))?$': [
            'svelte-jester',
            {
                preprocess: true,
            },
        ],
        '^.+\\.(ts|js)$': [
            '@swc/jest',
            {
                jsc: {
                    parser: {
                        syntax: 'typescript',
                        decorators: true,
                    },
                    target: 'es2022',
                },
                module: {
                    type: 'es6',
                },
            },
        ],
    },
    extensionsToTreatAsEsm: ['.ts', '.svelte'],
    moduleFileExtensions: ['js', 'mjs', 'cjs', 'ts', 'svelte'],
    moduleNameMapper: {
        '^obsidian$': '<rootDir>/tests/__mocks__/obsidian.ts',
    },
    roots: ['<rootDir>/tests'],
    testEnvironment: 'jsdom',
    transformIgnorePatterns: [
        '/node_modules/(?!(svelte|esm-env|@testing-library/svelte|@testing-library/svelte-core)/)',
    ],

    // A list of paths to modules that run some code to configure or
    // set up the testing framework before each test.
    setupFilesAfterEnv: ['<rootDir>/tests/CustomMatchers/jest.custom_matchers.setup.ts'],
    globalSetup: './tests/global-setup.js',
};

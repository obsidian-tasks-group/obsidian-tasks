/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    verbose: true,
    preset: 'ts-jest/presets/default-esm',
    transform: {
        '^.+\\.svelte(\\.(js|ts))?$': [
            'svelte-jester',
            {
                preprocess: true,
            },
        ],
        '^.+\\.(ts|js)$': [
            'ts-jest',
            {
                tsconfig: 'tsconfig.jest.json',
                useESM: true,
            },
        ],
    },
    extensionsToTreatAsEsm: ['.ts', '.svelte'],
    moduleFileExtensions: ['js', 'ts', 'svelte'],
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
    setupFilesAfterEnv: ['<rootDir>/tests/CustomMatchers/jest.custom_matchers.setup.mjs'],
    globalSetup: './tests/global-setup.js',
};

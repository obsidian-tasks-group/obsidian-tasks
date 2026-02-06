/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    verbose: true,
    preset: 'ts-jest',
    transform: {
        '^.+\\.svelte$': [
            'svelte-jester',
            {
                preprocess: true,
            },
        ],
        '^.+\\.ts$': 'ts-jest',
    },
    moduleFileExtensions: ['js', 'ts', 'svelte'],
    testEnvironment: 'jsdom',

    // A list of paths to modules that run some code to configure or
    // set up the testing framework before each test.
    setupFilesAfterEnv: [
        '<rootDir>/tests/CustomMatchers/jest.custom_matchers.setup.ts',
        '<rootDir>/tests/Task/LinkResolver.setup.ts',
    ],
    globalSetup: './tests/global-setup.js',
};

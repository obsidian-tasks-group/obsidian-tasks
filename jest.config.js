module.exports = {
    verbose: true,
    preset: 'ts-jest',
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
    moduleFileExtensions: ['js', 'ts'],

    // A list of paths to modules that run some code to configure or
    // set up the testing framework before each test.
    setupFilesAfterEnv: ['<rootDir>/tests/CustomMatchers/jest.custom_matchers.setup.ts'],
};

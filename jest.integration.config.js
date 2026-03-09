/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    ...require('./jest.config.js'),
    roots: ['<rootDir>/integration_tests', '<rootDir>/tests'],
    testMatch: ['<rootDir>/integration_tests/**/*.test.ts'],
    setupFilesAfterEnv: [],
};

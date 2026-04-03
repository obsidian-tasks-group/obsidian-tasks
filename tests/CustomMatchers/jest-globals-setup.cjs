/* eslint-disable no-undef */
// CJS setup file that injects jest as a global.
// .cjs files are always loaded as CommonJS, avoiding the ts-jest ESM
// compilation issue that causes "exports is not defined" on Linux.
const jestGlobals = require('@jest/globals');
globalThis.jest = jestGlobals.jest;

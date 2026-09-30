import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import { svelte3 } from './tests/vite-plugin-svelte3.mjs';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [svelte3()],
    resolve: {
        alias: {
            // Resolve 'obsidian' imports to the test mock, since the package contains only types.
            obsidian: path.resolve(dirname, 'tests/__mocks__/obsidian.ts'),
        },
        // Use Svelte's browser build so tests can render components.
        conditions: ['browser'],
    },
    test: {
        globals: true,
        environment: 'jsdom',
        include: ['tests/**/*.test.ts'],
        setupFiles: ['./tests/jest.setup.ts', './tests/CustomMatchers/jest.custom_matchers.setup.ts', 'jest-sorted'],
        globalSetup: './tests/global-setup.js',
    },
});

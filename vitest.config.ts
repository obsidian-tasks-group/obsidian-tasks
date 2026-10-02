import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [svelte()],
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
        setupFiles: ['./tests/vitest.setup.ts', './tests/CustomMatchers/vitest.custom_matchers.setup.ts', 'jest-sorted'],
        globalSetup: './tests/global-setup.js',
    },
});

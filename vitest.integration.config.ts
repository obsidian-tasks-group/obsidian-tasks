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
        include: ['integration_tests/**/*.test.ts'],
        setupFiles: [],
        globalSetup: './tests/global-setup.js',
    },
});

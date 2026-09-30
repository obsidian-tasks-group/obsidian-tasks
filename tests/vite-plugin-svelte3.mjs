import * as svelte from 'svelte/compiler';
import sveltePreprocess from 'svelte-preprocess';

/**
 * A minimal Vite plugin that compiles Svelte 3 components for Vitest.
 *
 * `@sveltejs/vite-plugin-svelte` (the "official" way to teach Vite about `.svelte` files) dropped
 * support for Svelte 3 in its v3 line, and its last Svelte-3-compatible release (v2.5.3) requires
 * `vite@^4`, which is incompatible with the Vite version this repo's Vitest depends on. Rather than
 * pin the whole test suite to an old Vite/Vitest pair, this plugin does directly what
 * `svelte-jester` (the Jest equivalent used until now) does: preprocess with `svelte-preprocess`
 * (so `<script lang="ts">` and friends work), then call Svelte 3's own `svelte.compile()`.
 *
 * To be dropped once we migrate to Svelte 5.
 */
export function svelte3() {
    return {
        name: 'vitest-svelte3',
        enforce: 'pre',
        async transform(code, id) {
            if (!id.endsWith('.svelte')) {
                return null;
            }

            const preprocessed = await svelte.preprocess(code, sveltePreprocess(), { filename: id });

            const compiled = svelte.compile(preprocessed.code, {
                filename: id,
                css: true,
                dev: true,
                format: 'esm',
                accessors: true,
            });

            return {
                code: compiled.js.code,
                map: compiled.js.map,
            };
        },
    };
}

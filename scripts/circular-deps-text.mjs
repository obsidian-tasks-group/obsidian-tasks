// Uses madge to find the circular dependencies in src/, and writes them to stdout
// in a stable form, with no timings or numbering, so that changes show up clearly
// in git history and can be compared by circular-deps-compare.mjs.
//
// Output looks like this:
//
// ---
// Current circular dependencies:
//
// Config/Settings.ts > Config/DismissibleNotices.ts
// Config/Settings.ts > Suggestor/Suggestor.ts
// Config/Settings.ts > Suggestor/Suggestor.ts > Suggestor/index.ts
// Config/Settings.ts > Suggestor/Suggestor.ts > Task/Occurrence.ts
// ---
//
// Exits with status 1 if any circular dependencies are found.

import { createRequire } from 'node:module';

// madge's API is used, rather than its command-line program, because the program
// calls process.exit() straight after many small writes to stdout. When stdout is
// a socket, such as the one spawnSync() creates, some of those writes can still
// be pending, so the output was sometimes truncated.
const require = createRequire(import.meta.url);
const madge = require('madge-ts6');

void madge('./src', { fileExtensions: ['ts'], tsConfig: 'tsconfig.json' }).then((result) => {
    const circularDependencies = result.circular();

    const stableOutput =
        'Current circular dependencies:\n\n' +
        circularDependencies.map((dependencyPath) => dependencyPath.join(' > ')).join('\n') +
        '\n';

    process.stdout.write(stableOutput);

    // Like madge's command-line program, exit with status 1 when circular dependencies are found.
    process.exitCode = circularDependencies.length > 0 ? 1 : 0;
});

// Runs madge on src/ and normalises its circular-dependency output for stable comparisons.
// Removes volatile header and numbering, then writes the cleaned result to stdout.

// Output like this:
//
// ---
// Processed 212 files (673ms) (2 warnings)
//
// 1) Config/Settings.ts > Config/DismissibleNotices.ts
// 2) Config/Settings.ts > Suggestor/Suggestor.ts
// 3) Config/Settings.ts > Suggestor/Suggestor.ts > Suggestor/index.ts
// 4) Config/Settings.ts > Suggestor/Suggestor.ts > Task/Occurrence.ts
// ---
//
// Becomes this, which is more friendly to git histories and would eventually
// allow GitHub actions to report unexpected changes in circular dependencies.
//
// ---
// Config/Settings.ts > Config/DismissibleNotices.ts
// Config/Settings.ts > Suggestor/Suggestor.ts
// Config/Settings.ts > Suggestor/Suggestor.ts > Suggestor/index.ts
// Config/Settings.ts > Suggestor/Suggestor.ts > Task/Occurrence.ts
// ---

import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const madgeCliPath = require.resolve('madge/bin/cli.js');

const result = spawnSync(
    process.execPath,
    [madgeCliPath, '--circular', '--extensions', 'ts', './src'],
    {
        encoding: 'utf8',
        stdio: ['inherit', 'pipe', 'inherit'],
    },
);

const stdout = result.stdout ?? '';

const stableOutput =
    'Current circular dependencies:\n\n' +
    stdout
        .split(/\r?\n/)
        .slice(1)
        .map((line) => line.replace(/^\d+\)\s+/, ''))
        .join('\n')
        .replace(/^\s*\n/, '')
        .trimEnd() +
    '\n';

process.stdout.write(stableOutput);

if (result.error) {
    throw result.error;
}

process.exit(result.status ?? 1);

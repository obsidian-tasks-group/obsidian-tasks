// Compares the circular dependencies in the working tree with those in a base git ref.
// Exits with status 1 if there are circular dependencies that do not exist in the base ref.
//
// Usage: node scripts/circular-deps-compare.mjs [base-ref]
//        base-ref defaults to origin/main
//
// How it works:
// 1. Runs circular-deps-text.mjs on the working tree, to get the 'after' circular dependencies.
// 2. Checks out base-ref in a temporary git worktree, and runs the same script there, to get the
//    'before' circular dependencies. The script from the working tree is used for both runs,
//    so both use the same madge settings, even if base-ref has older tooling.
// 3. Compares the two sets. Each line is one circular dependency chain, so a line only in 'after'
//    has been added, and a line only in 'before' has been removed.
// 4. Prints both lists, and exits with status 1 if any circular dependencies were added.
//
// Notes:
// - In GitHub Actions for a pull request, the checkout is a merge of the PR into main,
//   so using HEAD^1 as base-ref compares against the commit on main that the PR is merged onto.
// - Renaming or moving a file that is part of a circular dependency shows up as one removed
//   and one added, and so will fail.

import { spawnSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const baseRef = process.argv[2] ?? 'origin/main';
const textScript = join(dirname(fileURLToPath(import.meta.url)), 'circular-deps-text.mjs');

// Runs circular-deps-text.mjs, with 'cwd' as the root of the source tree to analyse.
// That script exits with status 1 when it finds circular dependencies, so the status is ignored.
function circularDependencies(cwd) {
    const result = spawnSync(process.execPath, [textScript], { cwd, encoding: 'utf8' });
    const [header, ...lines] = result.stdout.split('\n');
    if (header !== 'Current circular dependencies:') {
        throw new Error(`Could not find circular dependencies in ${cwd}:\n${result.stdout}\n${result.stderr}`);
    }
    return new Set(lines.filter((line) => line.trim() !== ''));
}

function git(...args) {
    // 'git' is intentionally found via PATH: there is no portable absolute path for it.
    // This script is only run on developer machines and in GitHub Actions.
    const result = spawnSync('git', args, { encoding: 'utf8' });
    if (result.status !== 0) {
        throw new Error(`git ${args.join(' ')} failed:\n${result.stderr}`);
    }
}

const after = circularDependencies(process.cwd());

const baseTree = mkdtempSync(join(tmpdir(), 'circular-deps-base-'));
let before;
try {
    git('worktree', 'add', '--detach', baseTree, baseRef);
    before = circularDependencies(baseTree);
} finally {
    git('worktree', 'remove', '--force', baseTree);
}

const removed = [...before].filter((line) => !after.has(line));
const added = [...after].filter((line) => !before.has(line));

console.log(`Circular dependencies removed since ${baseRef}: ${removed.length}`);
removed.forEach((line) => console.log(`  ${line}`));
console.log(`Circular dependencies added since ${baseRef}: ${added.length}`);
added.forEach((line) => console.log(`  ${line}`));

if (added.length > 0) {
    console.error('::error::This pull request adds circular dependencies. See the log for details.');
    process.exitCode = 1;
}

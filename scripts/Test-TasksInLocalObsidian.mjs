#!/usr/bin/env node

// Copy the built plugin files into the Tasks-Demo sample vault (or a custom destination).
//
// This is the cross-platform (Node.js) equivalent of Test-TasksInLocalObsidian.sh.
// It must be run from the root of the project.
//
// Usage:
//   node scripts/Test-TasksInLocalObsidian.mjs
//   node scripts/Test-TasksInLocalObsidian.mjs /path/to/vault/.obsidian/plugins/obsidian-tasks-plugin

import fs from 'node:fs';
import path from 'node:path';

// The three files that make up the built Obsidian plugin.
const FILES_TO_COPY = ['main.js', 'manifest.json', 'styles.css'];

// Default destination is the Tasks-Demo sample vault in this repository.
// path.join() is used instead of hardcoded separators for cross-platform compatibility.
const DEFAULT_DEST = path.join(
    'resources',
    'sample_vaults',
    'Tasks-Demo',
    '.obsidian',
    'plugins',
    'obsidian-tasks-plugin',
);

// Allow overriding the destination via a CLI argument, e.g.:
//   node scripts/Test-TasksInLocalObsidian.mjs /path/to/my-vault/.obsidian/plugins/obsidian-tasks-plugin
const dest = process.argv[2] || DEFAULT_DEST;

// Validate that the destination folder exists before attempting to copy.
if (!fs.existsSync(dest)) {
    console.error(`Error: destination folder does not exist: ${dest}`);
    process.exit(1);
}

// Validate that all source files exist. If they don't, the script is likely
// being run from the wrong directory (it must be run from the repository root).
for (const file of FILES_TO_COPY) {
    if (!fs.existsSync(file)) {
        console.error(`Error: source file not found: ${path.resolve(file)}`);
        console.error('This script must be run from the root of the repository.');
        process.exit(1);
    }
}

// Copy each plugin file to the destination folder.
for (const file of FILES_TO_COPY) {
    const src = path.resolve(file);
    const target = path.join(dest, file);
    fs.copyFileSync(src, target);
    console.log(`Copied ${file} -> ${target}`);
}

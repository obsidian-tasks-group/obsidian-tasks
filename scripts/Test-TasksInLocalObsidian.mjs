#!/usr/bin/env node

/**
 * Cross-platform script to deploy the Tasks plugin to a local Obsidian vault for development.
 *
 * Replicates the behaviour of Test-TasksInLocalObsidian.ps1 in an OS-agnostic way:
 *   1. Resolves the repository root
 *   2. Validates the Obsidian plugin directory
 *   3. Runs `yarn run build:dev`
 *   4. Symlinks main.js, styles.css and manifest.json into the plugin directory
 *   5. Ensures a .hotreload sentinel file exists
 *   6. Runs `yarn run dev` (watch mode)
 *
 * Environment variables:
 *   OBSIDIAN_PLUGIN_ROOT  – path to the plugins folder under .obsidian (required)
 *
 * Usage:
 *   node scripts/Test-TasksInLocalObsidian.mjs
 *   node scripts/Test-TasksInLocalObsidian.mjs --plugin-folder <name>
 */

import { execSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const PLUGIN_FOLDER_NAME = getPluginFolderName();
const FILES_TO_LINK = ['main.js', 'styles.css', 'manifest.json'];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getPluginFolderName() {
    const idx = process.argv.indexOf('--plugin-folder');
    if (idx !== -1 && process.argv[idx + 1]) {
        return process.argv[idx + 1];
    }
    return 'obsidian-tasks-plugin';
}

/**
 * Resolve the repository root via git.
 */
function getRepoRoot() {
    try {
        const root = execSync('git rev-parse --show-toplevel', { encoding: 'utf-8' }).trim();
        return path.resolve(root);
    } catch {
        console.error('Error: unable to determine the repository root. Are you inside a git repository?');
        process.exit(1);
    }
}

/**
 * Run a yarn script as a child process. Returns a Promise that resolves on
 * success and rejects on failure.
 */
function runYarn(scriptName, repoRoot) {
    return new Promise((resolve, reject) => {
        const child = spawn('yarn', ['run', scriptName], {
            cwd: repoRoot,
            stdio: 'inherit',
            shell: true,
        });

        child.on('error', (err) => {
            reject(new Error(`Failed to start "yarn run ${scriptName}": ${err.message}`));
        });

        child.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`"yarn run ${scriptName}" exited with code ${code}`));
            }
        });
    });
}

/**
 * Ensure that a symlink exists at `linkPath` pointing to `target`.
 * If a regular file already occupies `linkPath` it is removed first.
 * Existing correct symlinks are left untouched.
 */
function ensureSymlink(target, linkPath) {
    const fileName = path.basename(linkPath);

    try {
        const stat = fs.lstatSync(linkPath);

        if (stat.isSymbolicLink()) {
            const currentTarget = fs.readlinkSync(linkPath);
            if (path.resolve(path.dirname(linkPath), currentTarget) === path.resolve(target)) {
                console.log(`  ${fileName}: already symlinked`);
                return;
            }
            // Symlink exists but points elsewhere – remove and recreate.
            fs.unlinkSync(linkPath);
        } else {
            // Regular file – remove it.
            console.log(`  ${fileName}: removing existing file and creating symlink`);
            fs.unlinkSync(linkPath);
        }
    } catch (err) {
        if (err.code !== 'ENOENT') {
            throw err;
        }
        // File doesn't exist yet – that's fine, we'll create the symlink.
    }

    try {
        // On Windows, symlinks to files require the 'file' type hint.
        const symlinkType = process.platform === 'win32' ? 'file' : undefined;
        fs.symlinkSync(target, linkPath, symlinkType);
        console.log(`  ${fileName}: symlink created -> ${target}`);
    } catch (err) {
        if (process.platform === 'win32' && (err.code === 'EPERM' || err.code === 'EACCES')) {
            console.error(
                `\nError: unable to create symlink for ${fileName}.\n` +
                    'On Windows, creating symlinks requires either:\n' +
                    '  1. Developer Mode enabled (Settings > Update & Security > For Developers), or\n' +
                    '  2. Running this script in an elevated (Administrator) terminal.\n',
            );
            process.exit(1);
        }
        throw err;
    }
}

/**
 * Create the .hotreload sentinel file if it does not already exist.
 */
function ensureHotReloadFile(pluginDir) {
    const hotReloadPath = path.join(pluginDir, '.hotreload');
    if (!fs.existsSync(hotReloadPath)) {
        console.log('Creating .hotreload file');
        fs.writeFileSync(hotReloadPath, '', 'utf-8');
    }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
    // 1. Validate environment
    const repoRoot = getRepoRoot();
    console.log(`Repository root: ${repoRoot}`);

    const defaultPluginRoot = path.join(repoRoot, 'resources', 'sample_vaults', 'Tasks-Demo', '.obsidian', 'plugins');
    const obsidianPluginRoot = process.env.OBSIDIAN_PLUGIN_ROOT || defaultPluginRoot;

    const pluginRoot = path.resolve(obsidianPluginRoot);
    if (!fs.existsSync(pluginRoot)) {
        console.error(`Error: Obsidian plugin root not found: ${pluginRoot}`);
        process.exit(1);
    }
    if (process.env.OBSIDIAN_PLUGIN_ROOT) {
        console.log(`Obsidian plugin root (from env): ${pluginRoot}`);
    } else {
        console.log(`Obsidian plugin root (default): ${pluginRoot}`);
    }

    const pluginDir = path.join(pluginRoot, PLUGIN_FOLDER_NAME);
    if (!fs.existsSync(pluginDir)) {
        console.log(`Plugin folder does not exist – creating: ${pluginDir}`);
        fs.mkdirSync(pluginDir, { recursive: true });
    }

    // 2. Build
    console.log('\n--- Running build:dev ---\n');
    try {
        await runYarn('build:dev', repoRoot);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
    console.log('\nBuild successful\n');

    // 3. Symlink files
    console.log('--- Creating symlinks ---\n');
    for (const file of FILES_TO_LINK) {
        const target = path.join(repoRoot, file);
        const linkPath = path.join(pluginDir, file);
        ensureSymlink(target, linkPath);
    }

    // 4. Hot-reload sentinel
    console.log('');
    ensureHotReloadFile(pluginDir);

    // 5. Watch mode
    console.log('\n--- Starting dev (watch) mode ---\n');
    try {
        await runYarn('dev', repoRoot);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

main();

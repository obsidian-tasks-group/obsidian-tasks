const fs = require('node:fs');
const path = require('node:path');

const vault = app.vault;
const metadataCache = app.metadataCache;

async function getMarkdownFiles() {
    // Get all files from Test Data/ directory
    const { files } = await vault.adapter.list('Test Data/');
    return files.filter((file) => file.endsWith('.md'));
}

function getBasename(filePath) {
    return path.basename(filePath, '.md');
}

function writeDataAsJson(outputPath, sortedData) {
    const testSourceFile = getOutputFilePath(outputPath);
    const content = JSON.stringify(sortedData, null, 2);
    writeFile(testSourceFile, content);
}

function getOutputFilePath(outputFile) {
    const rootOfVault = vault.adapter.getBasePath();
    return path.join(rootOfVault, '../../../tests/Obsidian', outputFile);
}

function writeFile(testSourceFile, content) {
    fs.writeFile(testSourceFile, content, (err) => {
        if (err) {
            console.error(err);
        }
    });
}

function showNotice(message) {
    new Notice(message);
}

/**
 * Recursively sorts an object's keys in alphabetical order.
 */
function sortObjectKeys(obj) {
    if (Array.isArray(obj)) {
        return obj.map(sortObjectKeys);
    }
    if (obj && typeof obj === 'object') {
        return Object.keys(obj)
            .sort()
            .reduce((acc, key) => {
                acc[key] = sortObjectKeys(obj[key]);
                return acc;
            }, {});
    }
    return obj;
}

/**
 * Sorts an object's keys in alphabetical order at the top level only.
 */
function sortTopLevelKeys(obj) {
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
        return Object.keys(obj)
            .sort()
            .reduce((acc, key) => {
                acc[key] = obj[key]; // No recursive call here
                return acc;
            }, {});
    }
    return obj;
}

async function convertMarkdownFileToTestFunction(filePath, tp) {
    const tFile = vault.getAbstractFileByPath(filePath);

    const fileContents = await vault.read(tFile);

    const cachedMetadata = app.metadataCache.getFileCache(tFile);
    if (cachedMetadata && cachedMetadata.v !== undefined) {
        // Obsidian intermittently adds '"v": 1' values to the cache, which clutters up the diffs.
        // It's possible to remove them by doing "Rebuild cache vault" in Obsidian Settings > "Files and Settings",
        // and re-running this script, but it's easier for us to just delete them here:
        delete cachedMetadata.v;
    }

    const getAllTags = tp.obsidian.getAllTags(cachedMetadata);
    const parseFrontMatterTags = tp.obsidian.parseFrontMatterTags(cachedMetadata.frontmatter);

    // Resolve all links in body of this file
    const allLinks = [...(cachedMetadata.links ?? []), ...(cachedMetadata.frontmatterLinks ?? [])];
    const resolveLinkToPath = {};
    allLinks.forEach((link) => {
        const linkpath = tp.obsidian.getLinkpath(link.link);
        const tFile = app.metadataCache.getFirstLinkpathDest(linkpath, filePath);
        resolveLinkToPath[link.link] = tFile ? tFile.path : null;
    });

    const data = {
        filePath,
        fileContents,
        cachedMetadata,
        getAllTags,
        parseFrontMatterTags,
        resolveLinkToPath,
    };

    const filename = getBasename(filePath);
    if (filename.includes(' ')) {
        // The file name is used to create a TypeScript variable, so disallow spaces:
        showNotice(`ERROR - spaces not allowed in filenames: "${filename}"`);
        return '';
    }

    if (!fileContents.endsWith('\n')) {
        showNotice(`ERROR - missing newline character at end of: "${filename}"`);
        return '';
    }

    // Sort keys in the data object to ensure stable order
    const sortedData = sortObjectKeys(data);

    writeDataAsJson(`__test_data__/${filename}.json`, sortedData);
}

async function writeListOfAllTestFunctions(files) {
    const basenames = files.map((file) => getBasename(file));

    const imports = basenames.map((filename) => `import ${filename} from './__test_data__/${filename}.json';`);
    const functions = basenames.map((filename) => `        ${filename},`);

    const content = `// DO NOT EDIT!
// This file is machine-generated in the test vault, by convert_test_data_markdown_to_js.js.

import type { SimulatedFile } from './SimulatedFile';

${imports.join('\n')}

/**
 * All the sample data in \`resources/sample_vaults/Tasks-Demo/Test Data\`.
 *
 * Related code that uses some or all of this data:
 * - {@link SimulatedFile}
 * - {@link readTasksFromSimulatedFile}
 * - {@link getTasksFileFromMockData}
 * - {@link listPathAndData}
 */
export function allCacheSampleData(): SimulatedFile[] {
    return [
${functions.join('\n')}
    ];
}
`;

    const testSourceFile = getOutputFilePath('AllCacheSampleData.ts');
    writeFile(testSourceFile, content);
}

function writeMetadataCacheData() {
    const outputPath = '__test_data__/metadataCache/';
    writeDataAsJson(outputPath + 'resolvedLinks.json', sortTopLevelKeys(metadataCache.resolvedLinks));
    writeDataAsJson(outputPath + 'unresolvedLinks.json', sortTopLevelKeys(metadataCache.unresolvedLinks));
}

async function export_files(tp) {
    const markdownFiles = await getMarkdownFiles();

    for (const file of markdownFiles) {
        await convertMarkdownFileToTestFunction(file, tp);
    }

    await writeListOfAllTestFunctions(markdownFiles);

    writeMetadataCacheData();

    showNotice('Success.');
    return '';
}

module.exports = export_files;

const fs = require('node:fs');
const path = require('node:path');

const vault = app.vault;

async function getMarkdownFiles() {
    // Get all files from Test Data/ directory
    const { files } = await vault.adapter.list('Test Data/');
    return files.filter((file) => file.endsWith('.md'));
}

function getBasename(filePath) {
    return path.basename(filePath, '.md');
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

async function convertMarkdownFileToTestFunction(filePath, tp) {
    const tFile = vault.getAbstractFileByPath(filePath);

    const fileContents = await vault.read(tFile);
    const cachedMetadata = app.metadataCache.getFileCache(tFile);
    const getAllTags = tp.obsidian.getAllTags(cachedMetadata);
    const parseFrontMatterTags = tp.obsidian.parseFrontMatterTags(cachedMetadata.frontmatter);
    const data = { filePath, fileContents, cachedMetadata, getAllTags, parseFrontMatterTags };

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

    const testSourceFile = getOutputFilePath(`__test_data__/${filename}.json`);

    // Sort keys in the data object to ensure stable order
    const sortedData = sortObjectKeys(data);
    const content = JSON.stringify(sortedData, null, 2);
    writeFile(testSourceFile, content);
}

async function writeListOfAllTestFunctions(files) {
    const basenames = files.map((file) => getBasename(file));

    const imports = basenames.map((filename) => `import ${filename} from './__test_data__/${filename}.json';`);
    const functions = basenames.map((filename) => `        ${filename},`);

    const content = `// DO NOT EDIT!
// This file is machine-generated in the test vault, by convert_test_data_markdown_to_js.js.

${imports.join('\n')}

export function allCacheSampleData() {
    return [
${functions.join('\n')}
    ];
}
`;

    const testSourceFile = getOutputFilePath('AllCacheSampleData.ts');
    writeFile(testSourceFile, content);
}

async function export_files(tp) {
    const markdownFiles = await getMarkdownFiles();

    for (const file of markdownFiles) {
        await convertMarkdownFileToTestFunction(file, tp);
    }

    await writeListOfAllTestFunctions(markdownFiles);

    showNotice('Success.');
    return '';
}

module.exports = export_files;

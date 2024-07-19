const fs = require('node:fs');
const util = require('util');

async function getMarkdownFile() {
    // Get all files from Test Data/ directory
    const markdownFiles = [];
    const { files } = await app.vault.adapter.list('Test Data/');
    for (const file of files) {
        if (!file.endsWith('.md')) {
            continue;
        }
        markdownFiles.push(file);
    }
    return markdownFiles;
}

function getOutputFilePath(outputFile) {
    const rootOfVault = app.vault.adapter.getBasePath();
    return rootOfVault + '/../../../tests/Obsidian/' + outputFile;
}

function writeFile(testSourceFile, content) {
    fs.writeFile(testSourceFile, content, (err) => {
        if (err) {
            console.error(err);
        } else {
            // file written successfully
        }
    });
}

async function convertMarkdownFileToTestFunction(filePath, tp) {
    const tFile = app.vault.getAbstractFileByPath(filePath);

    const fileContents = await app.vault.read(tFile);
    const cachedMetadata = app.metadataCache.getFileCache(tFile);
    const obsidianApiVersion = tp.obsidian.apiVersion;
    const getAllTags = tp.obsidian.getAllTags(cachedMetadata);
    const parseFrontMatterTags = tp.obsidian.parseFrontMatterTags(cachedMetadata.frontmatter);
    const data = { filePath, fileContents, cachedMetadata, obsidianApiVersion, getAllTags, parseFrontMatterTags };

    const filename = filePath.split('/')[1].replace('.md', '');
    if (filename.includes(' ')) {
        // The file name is used to create a TypeScript variable, so disallow spaces:
        const message = `ERROR - spaces not allowed in filenames: "${filename}"`;
        new Notice(message);
        return '';
    }

    if (!fileContents.endsWith('\n')) {
        const message = `ERROR - missing newline character at end of: "${filename}"`;
        new Notice(message);
        return '';
    }

    const testSourceFile = getOutputFilePath('__test_data__/' + filename + '.ts');

    const options = { depth: null, compact: false };
    const dataAsJSSource = util.inspect(data, options);
    const content = `export const ${filename} = ${dataAsJSSource};`;
    writeFile(testSourceFile, content);
}

async function writeListOfAllTestFunctions(files) {
    let imports = '';
    let functions = '';
    for (const file of files) {
        const filename = file.split('/')[1].replace('.md', '');
        imports += `import { ${filename} } from './__test_data__/${filename}';\n`;
        functions += `        ${filename},\n`;
    }

    let content = `// DO NOT EDIT!
// This file is machine-generated in the test vault, by convert_test_data_markdown_to_js.js.

${imports}
export function allCacheSampleData() {
    return [
${functions}    ];
}
`;

    const testSourceFile = getOutputFilePath('AllCacheSampleData.ts');
    writeFile(testSourceFile, content);
}

async function export_files(tp) {
    const markdownFiles = await getMarkdownFile();

    for (const file of markdownFiles) {
        await convertMarkdownFileToTestFunction(file, tp);
    }

    await writeListOfAllTestFunctions(markdownFiles);

    const message = 'Success - now run "yarn lint:test-data" to format the generated files.';
    new Notice(message);
    return '';
}

module.exports = export_files;

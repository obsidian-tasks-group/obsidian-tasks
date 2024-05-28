const fs = require('node:fs');
const util = require('util');

async function convertMarkdownFileToTestFunction(filePath) {
    const tFile = app.vault.getAbstractFileByPath(filePath);

    const fileContents = await app.vault.read(tFile);
    const cachedMetadata = app.metadataCache.getFileCache(tFile);
    const data = { filePath, fileContents, cachedMetadata };

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

    const rootOfVault = app.vault.adapter.getBasePath();
    const testSourceFile = rootOfVault + '/../../../tests/Obsidian/__test_data__/' + filename + '.ts';

    const options = { depth: null, compact: false };
    const dataAsJSSource = util.inspect(data, options);
    const content = `export const ${filename} = ${dataAsJSSource};`;

    fs.writeFile(testSourceFile, content, (err) => {
        if (err) {
            console.error(err);
        } else {
            // file written successfully
        }
    });
}

async function export_files(msg) {
    // Get all files from Test Data/ directory
    const { files } = await app.vault.adapter.list('Test Data/');
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.endsWith('.md')) {
            continue;
        }
        await convertMarkdownFileToTestFunction(file);
    }

    const message = 'Success - now run "yarn lint:test-data" to format the generated files.';
    new Notice(message);
    return '';
}

module.exports = export_files;

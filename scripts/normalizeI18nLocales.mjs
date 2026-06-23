import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// 1. The WebStorm Easy i18n plugin does not add a final EOL to the i18n JSON files.
//    So to avoid inconsistencies in the history, we can use this script to
//    remove the final EOL from all the JSON locales files.
// 2. The two tools also use different sort orders for the keys searches and searchResults.
//    So this script re-sorts the keys in the JSON files to produce the same output
//    for both tools.

function compareKeys(a, b) {
    if (a < b) {
        return -1;
    }

    if (a > b) {
        return 1;
    }

    return 0;
}

function sortObjectKeys(value) {
    if (Array.isArray(value)) {
        return value.map(sortObjectKeys);
    }

    if (value !== null && typeof value === 'object') {
        return Object.fromEntries(
            Object.keys(value)
                .sort(compareKeys)
                .map((key) => [key, sortObjectKeys(value[key])]),
        );
    }

    return value;
}

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const localesDirectory = path.join(scriptDirectory, '..', 'src', 'i18n', 'locales');

const entries = fs.readdirSync(localesDirectory, { withFileTypes: true });

for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.json')) {
        continue;
    }

    const filePath = path.join(localesDirectory, entry.name);
    const originalContent = fs.readFileSync(filePath, 'utf8');
    const sortedContent = JSON.stringify(sortObjectKeys(JSON.parse(originalContent)), null, 2);

    if (sortedContent !== originalContent) {
        fs.writeFileSync(filePath, sortedContent, 'utf8');
    }
}

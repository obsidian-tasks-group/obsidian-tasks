import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// The WebStorm Easy i18n plugin does not add a final EOL to the i18n JSON files.
// So to avoid inconsistencies in the history, we can use this script to
// remove the final EOL from all the JSON locales files.

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const localesDirectory = path.join(scriptDirectory, '..', 'src', 'i18n', 'locales');

const entries = fs.readdirSync(localesDirectory, { withFileTypes: true });

for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.json')) {
        continue;
    }

    const filePath = path.join(localesDirectory, entry.name);
    const originalContent = fs.readFileSync(filePath, 'utf8');
    const updatedContent = originalContent.replace(/(?:\r?\n)+$/, '');

    if (updatedContent !== originalContent) {
        fs.writeFileSync(filePath, updatedContent, 'utf8');
    }
}

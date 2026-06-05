import * as fs from 'node:fs';
import * as path from 'node:path';

function readI18nJsonImports(): string[] {
    // Find the names of JSON locale files imported by the plugin:
    const i18nSource = fs.readFileSync(path.resolve(__dirname, '../../src/i18n/i18n.ts'), 'utf-8');
    return [...i18nSource.matchAll(/^import\s+\w+\s+from\s+'.*\/(\w+)\.json'/gm)].map((m) => m[1]);
}

describe('i18n locale consistency', () => {
    it('should have the same locales in i18n.ts and i18next-parser.config.js', () => {
        const i18nImports = readI18nJsonImports();

        // Find the locales used by 'yarn extract-i18n'
        const parserConfig = require('../../i18next-parser.config.js');
        const parserLocales = parserConfig.locales;

        expect(parserLocales).toEqual(i18nImports);
    });
});

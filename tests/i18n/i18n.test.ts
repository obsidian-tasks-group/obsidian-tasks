import * as fs from 'node:fs';
import * as path from 'node:path';

function readI18nJsonImports(): Readonly<string[]> {
    // Find the names of JSON locale files imported by the plugin:
    const i18nSource = fs.readFileSync(path.resolve(__dirname, '../../src/i18n/i18n.ts'), 'utf-8');
    return [...i18nSource.matchAll(/^import\s+\w+\s+from\s+'.*\/(\w+)\.json'/gm)].map((m) => m[1]);
}

function getI18nextParserLocales(): any {
    // Find the locales used by 'yarn extract-i18n'
    const parserConfig = require('../../i18next-parser.config.js');
    return parserConfig.locales;
}

describe('i18n locale consistency', () => {
    const i18nImports = readI18nJsonImports();
    const parserLocales = getI18nextParserLocales();

    it('"i18n.ts" should list Json imports in alphabetical order', () => {
        expect(i18nImports).toEqual([...i18nImports].sort());
    });

    it('should have the same locales in i18n.ts and i18next-parser.config.js', () => {
        expect(parserLocales).toEqual(i18nImports);
    });
});

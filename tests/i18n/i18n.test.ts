import * as fs from 'node:fs';
import * as path from 'node:path';
import i18next from 'i18next';
import { initializeI18n } from '../../src/i18n/i18n';

function readI18nJsonImports(): Readonly<string[]> {
    // Find the names of JSON locale files imported by the plugin:
    const i18nSource = fs.readFileSync(path.resolve(__dirname, '../../src/i18n/i18n.ts'), 'utf-8');
    return [...i18nSource.matchAll(/^import\s+\w+\s+from\s+'.*\/(\w+)\.json'/gm)].map((m) => m[1]);
}

function getI18nextParserLocales(): Readonly<string[]> {
    // Find the locales used by 'yarn extract-i18n'
    const parserConfig = require('../../i18next-parser.config.js');
    return parserConfig.locales;
}

beforeAll(async () => {
    await initializeI18n();
});

describe('i18n locale consistency', () => {
    const i18nImports = readI18nJsonImports();
    const parserLocales = getI18nextParserLocales();

    it('"i18n.ts" should list Json imports in alphabetical order', () => {
        expect(i18nImports).toEqual([...i18nImports].sort());
    });

    it('"i18n.ts" should list resources imports in alphabetical order', () => {
        // initializeI18n() must have been called before accessing i18next.store.data
        // In Jest, beforeAll() runs after the describe() callback body has been evaluated,
        // but before the tests inside that 'describe' are executed.
        // This means we have to get the i18next keys inside an 'it' block.
        const i18nResourceNames = Object.keys(i18next.store.data);
        expect(i18nResourceNames).toEqual([...i18nResourceNames].sort());
    });

    it('"i18next-parser.config.js" should list locales in alphabetical order', () => {
        expect(parserLocales).toEqual([...parserLocales].sort());
    });

    it('should have the same locales in i18n.ts and i18next-parser.config.js', () => {
        expect(parserLocales).toEqual(i18nImports);
    });
});

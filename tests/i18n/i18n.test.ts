import * as fs from 'node:fs';
import * as path from 'node:path';
import i18next from 'i18next';
import { initializeI18n } from '../../src/i18n/i18n';

function getAllLocaleJsonFileBaseNames(): string[] {
    const localesDir = path.resolve(__dirname, '../../src/i18n/locales');
    return fs
        .readdirSync(localesDir)
        .filter((file) => file.endsWith('.json'))
        .sort()
        .map((file) => file.replace('.json', ''));
}

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

let i18nResourceNames: ReadonlyArray<string>;
beforeAll(async () => {
    await initializeI18n();
    i18nResourceNames = Object.freeze(Object.keys(i18next.store.data));
});

describe('i18n locale consistency', () => {
    const allJsonLocaleFileBaseNames = getAllLocaleJsonFileBaseNames();
    const i18nImports = readI18nJsonImports();
    const parserLocales = getI18nextParserLocales();

    it('"i18n.ts" should list Json imports in alphabetical order', () => {
        expect(i18nImports).toBeSorted();
    });

    it('"i18n.ts" should should import all JSON files', () => {
        expect(i18nImports).toEqual(allJsonLocaleFileBaseNames);
    });

    it('"i18n.ts" should list resources imports in alphabetical order', () => {
        expect(i18nResourceNames).toBeSorted();
    });

    it('"i18n.ts" resources should reference all JSON files', () => {
        // The resource names may differ from the JSON file names:
        //     "pt_br" vs "pt-BR"
        //     "zh_cn" vs "zh"
        // So we just check the number of entries, rather than the string values:
        expect(i18nResourceNames.length).toEqual(allJsonLocaleFileBaseNames.length);
    });

    it('"i18next-parser.config.js" should list locales in alphabetical order', () => {
        expect(parserLocales).toBeSorted();
    });

    it('"i18next-parser.config.js" should reference all JSON files', () => {
        expect(parserLocales).toEqual(allJsonLocaleFileBaseNames);
    });
});

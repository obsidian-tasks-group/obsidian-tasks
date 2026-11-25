import * as fs from 'node:fs';
import * as path from 'node:path';
import i18next from 'i18next';
import { MarkdownTable } from 'lib/MarkdownTable';
import { verifyMarkdownForDocs } from '../TestingTools/VerifyMarkdown';

function getAllLocaleJsonFileBaseNames(): string[] {
    const localesDir = path.resolve(__dirname, '../../src/i18n/locales');
    return fs
        .readdirSync(localesDir)
        .filter((file) => file.endsWith('.json'))
        .filter((file) => !file.endsWith('_old.json')) // skip any backup files created by 'yarn extract-i18n'
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
    // initializeI18n is called in vitest.setup.ts
    i18nResourceNames = Object.freeze(Object.keys(i18next.store.data));
});

describe('i18n docs', () => {
    function languageNameForDocs(code: string): string {
        // 'standard' gives 'Language (Qualifier)': https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DisplayNames/DisplayNames#languagedisplay
        const languageNames = new Intl.DisplayNames(['en'], { type: 'language', languageDisplay: 'standard' });

        // Obsidian's 'zh' is Simplified Chinese. Adding the script subtag 'Hans' gives 'Chinese (Simplified)', as in Obsidian's docs.
        // 'Hans' is the Simplified Han script: https://www.unicode.org/iso15924/iso15924-codes.html
        const tagsWithScriptSubtag: Record<string, string> = { zh: 'zh-Hans' };

        return languageNames.of(tagsWithScriptSubtag[code] ?? code) ?? code;
    }

    it('supported languages', () => {
        const table = new MarkdownTable(['Obsidian Language Code', 'Language']);
        const englishFirst = ['en', ...i18nResourceNames.filter((code) => code !== 'en')];
        englishFirst.forEach((code) => {
            table.addRow(['`' + code + '`', languageNameForDocs(code)]);
        });

        verifyMarkdownForDocs(table.markdown);
    });
});

describe('i18n locale consistency', () => {
    const allJsonLocaleFileBaseNames = getAllLocaleJsonFileBaseNames();

    describe('"i18n.ts" imports', () => {
        const i18nImports = readI18nJsonImports();

        it('should list Json imports in alphabetical order', () => {
            expect(i18nImports).toBeSorted();
        });

        it('should should import all JSON files', () => {
            expect(i18nImports).toEqual(allJsonLocaleFileBaseNames);
        });
    });

    describe('"i18n.ts" resources', () => {
        it('should list resources imports in alphabetical order', () => {
            expect(i18nResourceNames).toBeSorted();
        });

        it('should reference all JSON files', () => {
            // The resource names may differ from the JSON file names:
            //     "pt_br" vs "pt-BR"
            //     "zh_cn" vs "zh"
            // So we just check the number of entries, rather than the string values:
            expect(i18nResourceNames.length).toEqual(allJsonLocaleFileBaseNames.length);
        });
    });

    describe('"i18next-parser.config.js"', () => {
        const parserLocales = getI18nextParserLocales();

        it('should list locales in alphabetical order', () => {
            expect(parserLocales).toBeSorted();
        });

        it('should reference all JSON files', () => {
            expect(parserLocales).toEqual(allJsonLocaleFileBaseNames);
        });
    });
});

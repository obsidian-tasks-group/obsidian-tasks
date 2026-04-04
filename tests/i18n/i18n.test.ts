import * as fs from 'node:fs';
import * as path from 'node:path';

describe('i18n locale consistency', () => {
    it('should have the same number of locales in i18n.ts and i18next-parser.config.js', () => {
        // Find the names of JSON locale files imported by the plugin:
        const i18nSource = fs.readFileSync(path.resolve(__dirname, '../../src/i18n/i18n.ts'), 'utf-8');
        const i18nLocales = [...i18nSource.matchAll(/^import\s+\w+\s+from\s+'.*\/(\w+)\.json'/gm)].map((m) => m[1]);

        // Find the locales used by 'yarn extract-i18n'
        const parserConfig = require('../../i18next-parser.config.js');
        const parserLocales = parserConfig.locales;

        expect(parserLocales).toEqual(i18nLocales);
    });
});

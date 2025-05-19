module.exports = {
    input: ['src/**/*.{ts,svelte}'], // Scan relevant files
    output: 'src/i18n/locales/$LOCALE.json', // Output files
    locales: [
        // Supported locales, in alphabetical order
        'be',
        'de',
        'en',
        'ru',
        'uk',
        'zh_cn',
    ],
    defaultNamespace: 'translation',
    keySeparator: '.', // Use dots to represent nested keys
    namespaceSeparator: false, // Disable namespace separation
    interpolation: {
        prefix: '{{', // Preserve placeholders like {{name}}
        suffix: '}}',
    },
    useKeysAsDefaultValue: true, // Use keys for default values if no translation exists
    resetDefaultValueLocale: null, // Retain existing default values
    sort: true, // Sort keys alphabetically
    keepRemoved: false, // Keep keys not found in source files. Removed values are written to *_old.json files
    jsonIndent: 2, // Pretty-print JSON
    lexers: {
        ts: ['JavascriptLexer'], // TypeScript files
        svelte: ['HTMLLexer'], // Svelte files
    },
};

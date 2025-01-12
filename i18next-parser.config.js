module.exports = {
    input: ['src/**/*.{ts,svelte}'], // Scan relevant files
    output: 'src/i18n/locales/$LOCALE.json', // Output files
    locales: ['en', 'zh_cn'], // Supported locales
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
    keepRemoved: true, // Keep keys not found in source files
    jsonIndent: 2, // Pretty-print JSON
    lexers: {
        ts: ['JavascriptLexer'], // TypeScript files
        svelte: ['HTMLLexer'], // Svelte files
    },
};

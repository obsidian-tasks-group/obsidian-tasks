import * as prettier from 'prettier';

export function prettifyHTML(modalHTML: string) {
    return prettier.format(modalHTML, {
        parser: 'html',
        bracketSameLine: true,
        htmlWhitespaceSensitivity: 'ignore',
        printWidth: 120,
    });
}

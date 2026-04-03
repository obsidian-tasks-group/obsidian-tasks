import * as prettier from 'prettier';
import * as htmlParser from 'prettier/plugins/html';

export async function prettifyHTML(modalHTML: string) {
    return await prettier.format(modalHTML, {
        plugins: [htmlParser],
        parser: 'html',
        bracketSameLine: true,
        htmlWhitespaceSensitivity: 'ignore',
        printWidth: 120,
    });
}

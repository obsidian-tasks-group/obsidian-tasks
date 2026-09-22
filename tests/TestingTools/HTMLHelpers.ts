import * as prettier from 'prettier';

export async function prettifyHTML(modalHTML: string): Promise<string> {
    return prettier.format(modalHTML, {
        parser: 'html',
        bracketSameLine: true,
        htmlWhitespaceSensitivity: 'ignore',
        printWidth: 120,
    });
}

import * as prettierPluginHtml from 'prettier/plugins/html';
import * as prettier from 'prettier/standalone';

export async function prettifyHTML(modalHTML: string): Promise<string> {
    return prettier.format(modalHTML, {
        parser: 'html',
        plugins: [prettierPluginHtml],
        bracketSameLine: true,
        htmlWhitespaceSensitivity: 'ignore',
        printWidth: 120,
    });
}

import { type ConfigModifier, Options } from 'approvals/lib/Core/Options';
import { verify } from 'approvals/lib/Providers/Jest/JestApprovals';

// This import fails with Approvals.NodeJS 6.2.1:
// error TS1371: This import is never used as a value and must use 'import type' because 'importsNotUsedAsValues' is set to 'error'.
// import { JestReporter } from 'approvals/lib/Providers/Jest/JestReporter';

export function verifyMarkdown(output: string) {
    let options = new Options();
    options = options.forFile().withFileExtention('md');

    const configModifier: ConfigModifier = (c) => {
        c.reporters = [
            // Built-in reporters listed at:
            // https://github.com/approvals/Approvals.NodeJS#built-in-reporters
            'vscode', // VS Code diff works well with files containing emojis
            //-----------------
            // Last one is jest reporter, that should write diffs to console in
            // Continuous Integration builds, such as GitHub Actions
            // new JestReporter(), // disabled due to import error - see above
        ];
        return c;
    };

    verify(output, options.withConfig(configModifier));
}

/**
 * Write out markdown block for including directly in documentation.
 * To embed the approved file directly in user docs, write line like this, and then run mdsnippets:
 *      include: output-file-name.approved.md
 * @param markdown
 */
export function verifyMarkdownForDocs(markdown: string) {
    let output = '<!-- placeholder to force blank line before included text -->\n\n';
    output += markdown;
    output += '\n\n<!-- placeholder to force blank line after included text -->\n';

    verifyMarkdown(output);
}

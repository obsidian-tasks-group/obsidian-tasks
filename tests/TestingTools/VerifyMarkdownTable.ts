import { Options } from 'approvals/lib/Core/Options';
import { verify } from 'approvals/lib/Providers/Jest/JestApprovals';

function verifyMarkdown(output: string) {
    let options = new Options();
    options = options.forFile().withFileExtention('md');
    verify(output, options);
}

export function verifyMarkdownForDocs(markdown: string) {
    let output = '<!-- placeholder to force blank line before included text -->\n\n';
    output += markdown;
    output += '\n\n<!-- placeholder to force blank line after included text -->\n';

    verifyMarkdown(output);
}

export class MarkdownTable {
    private columnNames: string[];
    private _markdown = '';

    constructor(columnNames: string[]) {
        this.columnNames = columnNames;
        this.addTitleRow();
    }

    get markdown(): string {
        return this._markdown;
    }

    private addTitleRow() {
        let titles = '|';
        let divider = '|';
        this.columnNames.forEach((s) => {
            titles += ` ${s} |`;
            divider += ' ----- |';
        });

        this._markdown += `${titles}\n`;
        this._markdown += `${divider}\n`;
    }

    public addRow(cells: string[]) {
        let row = '|';
        cells.forEach((s) => {
            row += ` ${s} |`;
        });
        this._markdown += `${row}\n`;
    }

    public verifyForDocs() {
        verifyMarkdownForDocs(this.markdown);
    }

    public verify() {
        verifyMarkdown(this.markdown);
    }
}

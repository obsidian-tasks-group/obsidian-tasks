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
        const row = this.makeRowText(cells);
        this._markdown += `${row}\n`;
    }

    public addRowIfNew(cells: string[]) {
        const row = this.makeRowText(cells);
        if (!this._markdown.includes(row)) {
            this._markdown += `${row}\n`;
        }
    }

    private makeRowText(cells: string[]) {
        let row = '|';
        cells.forEach((s) => {
            row += ` ${s} |`;
        });
        return row;
    }
}

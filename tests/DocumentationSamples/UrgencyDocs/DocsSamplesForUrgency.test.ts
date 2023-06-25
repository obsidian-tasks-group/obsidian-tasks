import { verifyMarkdownForDocs } from '../../TestingTools/VerifyMarkdownTable';

describe('UrgencyTable', () => {
    function cell(text: string): string {
        return `<td>${text}</td>`;
    }

    function rowSpanningCell(text: string, span: number): string {
        return `<td rowspan="${span}">${text}</td>`;
    }

    function urgencyValue(urgency: number, dps: number = 1): string {
        return `<code>${urgency.toFixed(dps)}</code>`;
    }

    function urgencyCell(urgency: number, dps: number = 1): string {
        return cell(`${urgencyValue(urgency, dps)}`);
    }

    function row(cells: string[]) {
        let result = '';
        result += '  <tr>\n';
        for (const cell of cells) {
            result += `    ${cell}\n`;
        }
        result += '  </tr>\n';
        return result;
    }

    function property(rows: string[][]) {
        let result = '';
        for (const rowCells of rows) {
            result += row(rowCells);
        }
        return result;
    }

    it('urgency-html-table', () => {
        const heading = `
<table>
<thead>
  <tr>
    <th colspan="2">Property</th>
    <th>Score</th>
  </tr>
</thead>
<tbody>
`;

        let table = '';
        table += heading;

        table += property([[rowSpanningCell('Due', 5), cell('More than 7 days overdue'), urgencyCell(12.0)]]);

        table += property([
            [
                rowSpanningCell('Due between 7 days ago and in 14 days', 2),
                cell(`Range of ${urgencyValue(12.0)} to ${urgencyValue(0.2)}`),
            ],
            [cell('Example for "today": <code>9.0</code>')],
            [cell('More than 14 days until due'), urgencyCell(0.2)],
            [cell('None'), urgencyCell(0.0)],
        ]);

        table += property([
            [rowSpanningCell('Priority', 6), cell('Highest'), urgencyCell(9.0)],
            [cell('High'), urgencyCell(6.0)],
            [cell('Medium'), urgencyCell(3.9)],
            [cell('None'), urgencyCell(1.95, 2)],
            [cell('Low'), urgencyCell(0.0)],
            [cell('Lowest'), urgencyCell(-1.8)],
        ]);

        table += property([
            [rowSpanningCell('Scheduled', 3), cell('Today or earlier'), urgencyCell(5.0)],
            [cell('Tomorrow or later'), urgencyCell(0.0)],
            [cell('None'), urgencyCell(0.0)],
        ]);

        table += property([
            [rowSpanningCell('Starts', 3), cell('Today or earlier'), urgencyCell(0.0)],
            [cell('Tomorrow or later'), urgencyCell(-3.0)],
            [cell('None'), urgencyCell(0.0)],
        ]);

        table += `</tbody>
</table>
`;
        verifyMarkdownForDocs(table);
    });
});

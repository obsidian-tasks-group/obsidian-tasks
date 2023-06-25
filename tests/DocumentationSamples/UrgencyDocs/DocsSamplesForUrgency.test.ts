import { verifyMarkdownForDocs } from '../../TestingTools/VerifyMarkdownTable';

describe('UrgencyTable', () => {
    function cell(text: string): string {
        return `<td>${text}</td>`;
    }

    function rowSpanningCell(span: number, text: string): string {
        return `<td rowspan="${span}">${text}</td>`;
    }

    function urgencyValue(urgency: number, dps: number = 1): string {
        return `<code>${urgency.toFixed(dps)}</code>`;
    }

    function urgencyCell(urgency: number, dps: number = 1): string {
        return `<td>${urgencyValue(urgency, dps)}</td>`;
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

        table += row([rowSpanningCell(5, 'Due'), cell('More than 7 days overdue'), urgencyCell(12.0)]);
        table += row([
            rowSpanningCell(2, 'Due between 7 days ago and in 14 days'),
            `<td>Range of ${urgencyValue(12.0)} to ${urgencyValue(0.2)}</td>`,
        ]);
        table += row([cell('Example for "today": <code>9.0</code>')]);
        table += row([cell('More than 14 days until due'), urgencyCell(0.2)]);
        table += row([cell('None'), urgencyCell(0.0)]);

        table += row([rowSpanningCell(6, 'Priority'), cell('Highest'), urgencyCell(9.0)]);
        table += row([cell('High'), urgencyCell(6.0)]);
        table += row([cell('Medium'), urgencyCell(3.9)]);
        table += row([cell('None'), urgencyCell(1.95, 2)]);
        table += row([cell('Low'), urgencyCell(0.0)]);
        table += row([cell('Lowest'), urgencyCell(-1.8)]);

        table += row([rowSpanningCell(3, 'Scheduled'), cell('Today or earlier'), urgencyCell(5.0)]);
        table += row([cell('Tomorrow or later'), urgencyCell(0.0)]);
        table += row([cell('None'), urgencyCell(0.0)]);

        table += row([rowSpanningCell(3, 'Starts'), cell('Today or earlier'), urgencyCell(0.0)]);
        table += row([cell('Tomorrow or later'), urgencyCell(-3.0)]);
        table += row([cell('None'), urgencyCell(0.0)]);
        table += `</tbody>
</table>
`;
        verifyMarkdownForDocs(table);
    });
});

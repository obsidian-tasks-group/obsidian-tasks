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
<tbody>`;

        let table = '';
        table += heading;

        const row1 = `
  <tr>
    ${rowSpanningCell(5, 'Due')}
    ${cell('More than 7 days overdue')}
    ${urgencyCell(12.0)}
  </tr>`;
        table += row1;

        table += `
  <tr>
    ${rowSpanningCell(2, 'Due between 7 days ago and in 14 days')}
    <td>Range of ${urgencyValue(12.0)} to ${urgencyValue(0.2)}</td>
  </tr>
  <tr>
    ${cell('Example for "today": <code>9.0</code>')}
  </tr>
  <tr>
    ${cell('More than 14 days until due')}
    ${urgencyCell(0.2)}
  </tr>
  <tr>
    ${cell('None')}
    ${urgencyCell(0.0)}
  </tr>
  <tr>
    ${rowSpanningCell(6, 'Priority')}
    ${cell('Highest')}
    ${urgencyCell(9.0)}
  </tr>
  <tr>
    ${cell('High')}
    ${urgencyCell(6.0)}
  </tr>
  <tr>
    ${cell('Medium')}
    ${urgencyCell(3.9)}
  </tr>
  <tr>
    ${cell('None')}
    ${urgencyCell(1.95, 2)}
  </tr>
  <tr>
    ${cell('Low')}
    ${urgencyCell(0.0)}
  </tr>
  <tr>
    ${cell('Lowest')}
    ${urgencyCell(-1.8)}
  </tr>\n`;
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

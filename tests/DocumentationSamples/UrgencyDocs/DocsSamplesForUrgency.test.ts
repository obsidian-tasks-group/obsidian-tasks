import { verifyMarkdownForDocs } from '../../TestingTools/VerifyMarkdownTable';

describe('UrgencyTable', () => {
    function rowSpanningCell(span: number, text: string): string {
        return `<td rowspan="${span}">${text}</td>`;
    }

    function urgencyValue(urgency: number, dps: number = 1): string {
        return `<code>${urgency.toFixed(dps)}</code>`;
    }

    function urgencyCell(urgency: number, dps: number = 1): string {
        return `<td>${urgencyValue(urgency, dps)}</td>`;
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
    <td>More than 7 days overdue</td>
    ${urgencyCell(12.0)}
  </tr>`;
        table += row1;

        table += `
  <tr>
    ${rowSpanningCell(2, 'Due between 7 days ago and in 14 days')}
    <td>Range of ${urgencyValue(12.0)} to ${urgencyValue(0.2)}</td>
  </tr>
  <tr>
    <td>Example for "today": <code>9.0</code></td>
  </tr>
  <tr>
    <td>More than 14 days until due</td>
    ${urgencyCell(0.2)}
  </tr>
  <tr>
    <td>None</td>
    ${urgencyCell(0.0)}
  </tr>
  <tr>
    ${rowSpanningCell(6, 'Priority')}
    <td>Highest</td>
    ${urgencyCell(9.0)}
  </tr>
  <tr>
    <td>High</td>
    ${urgencyCell(6.0)}
  </tr>
  <tr>
    <td>Medium</td>
    ${urgencyCell(3.9)}
  </tr>
  <tr>
    <td>None</td>
    ${urgencyCell(1.95, 2)}
  </tr>
  <tr>
    <td>Low</td>
    ${urgencyCell(0.0)}
  </tr>
  <tr>
    <td>Lowest</td>
    ${urgencyCell(-1.8)}
  </tr>
  <tr>
    ${rowSpanningCell(3, 'Scheduled')}
    <td>Today or earlier</td>
    ${urgencyCell(5.0)}
  </tr>
  <tr>
    <td>Tomorrow or later</td>
    ${urgencyCell(0.0)}
  </tr>
  <tr>
    <td>None</td>
    ${urgencyCell(0.0)}
  </tr>
  <tr>
    ${rowSpanningCell(3, 'Starts')}
    <td>Today or earlier</td>
    ${urgencyCell(0.0)}
  </tr>
  <tr>
    <td>Tomorrow or later</td>
    ${urgencyCell(-3.0)}
  </tr>
  <tr>
    <td>None</td>
    ${urgencyCell(0.0)}
  </tr>
</tbody>
</table>
`;
        verifyMarkdownForDocs(table);
    });
});

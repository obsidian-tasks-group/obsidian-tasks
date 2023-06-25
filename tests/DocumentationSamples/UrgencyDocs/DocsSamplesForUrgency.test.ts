import { verifyMarkdownForDocs } from '../../TestingTools/VerifyMarkdownTable';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { Urgency } from '../../../src/Urgency';
import { Priority } from '../../../src/Task';

describe('UrgencyTable', () => {
    function cell(text: string, span: number = 0): string {
        if (span !== 0) {
            return `<td rowspan="${span}">${text}</td>`;
        } else {
            return `<td>${text}</td>`;
        }
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

    function calcForPriority(priority: Priority) {
        const task = new TaskBuilder().priority(priority).build();
        const u = Urgency.calculate(task);
        return u;
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

        table += property([[cell('Due', 5), cell('More than 7 days overdue'), urgencyCell(12.0)]]);

        table += property([
            [
                cell('Due between 7 days ago and in 14 days', 2),
                cell(`Range of ${urgencyValue(12.0)} to ${urgencyValue(0.2)}`),
            ],
            [cell('Example for "today": <code>9.0</code>')],
            [cell('More than 14 days until due'), urgencyCell(0.2)],
            [cell('None'), urgencyCell(0.0)],
        ]);

        table += property([
            [cell('Priority', 6), cell('Highest'), urgencyCell(calcForPriority(Priority.Highest))],
            [cell('High'), urgencyCell(calcForPriority(Priority.High))],
            [cell('Medium'), urgencyCell(calcForPriority(Priority.Medium))],
            [cell('None'), urgencyCell(calcForPriority(Priority.None), 2)],
            [cell('Low'), urgencyCell(calcForPriority(Priority.Low))],
            [cell('Lowest'), urgencyCell(calcForPriority(Priority.Lowest))],
        ]);

        table += property([
            [cell('Scheduled', 3), cell('Today or earlier'), urgencyCell(5.0)],
            [cell('Tomorrow or later'), urgencyCell(0.0)],
            [cell('None'), urgencyCell(0.0)],
        ]);

        table += property([
            [cell('Starts', 3), cell('Today or earlier'), urgencyCell(0.0)],
            [cell('Tomorrow or later'), urgencyCell(-3.0)],
            [cell('None'), urgencyCell(0.0)],
        ]);

        table += `</tbody>
</table>
`;
        verifyMarkdownForDocs(table);
    });
});

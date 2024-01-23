/**
 * @jest-environment jsdom
 */

import moment from 'moment';

import { verifyMarkdownForDocs } from '../../TestingTools/VerifyMarkdown';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { Urgency } from '../../../src/Task/Urgency';

import { Priority } from '../../../src/Task/Priority';

window.moment = moment;

const today = '2023-05-10';
beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(today));
});

afterEach(() => {
    jest.useRealTimers();
});

/**
 * This test generates the HTML table in the user docs that shows how various Task
 * signifiers affect the Urgency calculate:
 * https://publish.obsidian.md/tasks/Advanced/Urgency
 */
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
        return Urgency.calculate(task);
    }

    function dueCell(date: string) {
        const task = new TaskBuilder().dueDate(date).priority(Priority.Low).build();
        return urgencyCell(Urgency.calculate(task), 5);
    }

    function scheduledCell(date: string) {
        const task = new TaskBuilder().scheduledDate(date).priority(Priority.Low).build();
        return urgencyCell(Urgency.calculate(task), 1);
    }

    function startsCell(date: string) {
        const task = new TaskBuilder().startDate(date).priority(Priority.Low).build();
        return urgencyCell(Urgency.calculate(task), 1);
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

        table += property([
            [cell('Due', 25), cell('due more than 7 days ago'), dueCell('2023-05-02')],
            [cell('due 7 days ago'), dueCell('2023-05-03')],
            [cell('due 6 days ago'), dueCell('2023-05-04')],
            [cell('due 5 days ago'), dueCell('2023-05-05')],
            [cell('due 4 days ago'), dueCell('2023-05-06')],
            [cell('due 3 days ago'), dueCell('2023-05-07')],
            [cell('due 2 days ago'), dueCell('2023-05-08')],
            [cell('due 1 day ago'), dueCell('2023-05-09')],
            [cell('Today'), dueCell('2023-05-10')],
            [cell('1 day until due'), dueCell('2023-05-11')],
            [cell('2 days until due'), dueCell('2023-05-12')],
            [cell('3 days until due'), dueCell('2023-05-13')],
            [cell('4 days until due'), dueCell('2023-05-14')],
            [cell('5 days until due'), dueCell('2023-05-15')],
            [cell('6 days until due'), dueCell('2023-05-16')],
            [cell('7 days until due'), dueCell('2023-05-17')],
            [cell('8 days until due'), dueCell('2023-05-18')],
            [cell('9 days until due'), dueCell('2023-05-19')],
            [cell('10 days until due'), dueCell('2023-05-20')],
            [cell('11 days until due'), dueCell('2023-05-21')],
            [cell('12 days until due'), dueCell('2023-05-22')],
            [cell('13 days until due'), dueCell('2023-05-23')],
            [cell('14 days until due'), dueCell('2023-05-24')],
            [cell('More than 14 days until due'), dueCell('2023-05-25')],
            [cell('None'), dueCell('')],
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
            [cell('Scheduled', 3), cell('Today or earlier'), scheduledCell('2023-05-10')],
            [cell('Tomorrow or later'), scheduledCell('2023-05-11')],
            [cell('None'), scheduledCell('')],
        ]);

        table += property([
            [cell('Start', 3), cell('Today or earlier'), startsCell('2023-05-10')],
            [cell('Tomorrow or later'), startsCell('2023-05-11')],
            [cell('None'), startsCell('')],
        ]);

        table += `</tbody>
</table>
`;
        verifyMarkdownForDocs(table);
    });
});

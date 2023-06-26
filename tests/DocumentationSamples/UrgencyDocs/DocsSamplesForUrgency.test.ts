/**
 * @jest-environment jsdom
 */

import moment from 'moment';

import { verifyMarkdownForDocs } from '../../TestingTools/VerifyMarkdownTable';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { Urgency } from '../../../src/Urgency';
import { Priority } from '../../../src/Task';

window.moment = moment;

const today = '2023-05-10';
beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(today));
});

afterEach(() => {
    jest.useRealTimers();
});

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

    function calcForDue(date: string) {
        const task = new TaskBuilder().dueDate(date).priority(Priority.Low).build();
        return Urgency.calculate(task);
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

        const decimalPlaces = 5;
        table += property([
            [cell('Due', 25), cell('due more than 7 days ago'), urgencyCell(calcForDue('2023-05-02'), decimalPlaces)],
            [cell('due 7 days ago'), urgencyCell(calcForDue('2023-05-03'), decimalPlaces)],
            [cell('due 6 days ago'), urgencyCell(calcForDue('2023-05-04'), decimalPlaces)],
            [cell('due 5 days ago'), urgencyCell(calcForDue('2023-05-06'), decimalPlaces)],
            [cell('due 4 days ago'), urgencyCell(calcForDue('2023-05-05'), decimalPlaces)],
            [cell('due 3 days ago'), urgencyCell(calcForDue('2023-05-07'), decimalPlaces)],
            [cell('due 2 days ago'), urgencyCell(calcForDue('2023-05-08'), decimalPlaces)],
            [cell('due 1 day ago'), urgencyCell(calcForDue('2023-05-09'), decimalPlaces)],
            [cell('Today'), urgencyCell(calcForDue('2023-05-10'), decimalPlaces)],
            [cell('1 day until due'), urgencyCell(calcForDue('2023-05-11'), decimalPlaces)],
            [cell('2 days until due'), urgencyCell(calcForDue('2023-05-12'), decimalPlaces)],
            [cell('3 days until due'), urgencyCell(calcForDue('2023-05-13'), decimalPlaces)],
            [cell('4 days until due'), urgencyCell(calcForDue('2023-05-14'), decimalPlaces)],
            [cell('5 days until due'), urgencyCell(calcForDue('2023-05-15'), decimalPlaces)],
            [cell('6 days until due'), urgencyCell(calcForDue('2023-05-16'), decimalPlaces)],
            [cell('7 days until due'), urgencyCell(calcForDue('2023-05-17'), decimalPlaces)],
            [cell('8 days until due'), urgencyCell(calcForDue('2023-05-18'), decimalPlaces)],
            [cell('9 days until due'), urgencyCell(calcForDue('2023-05-19'), decimalPlaces)],
            [cell('10 days until due'), urgencyCell(calcForDue('2023-05-20'), decimalPlaces)],
            [cell('11 days until due'), urgencyCell(calcForDue('2023-05-21'), decimalPlaces)],
            [cell('12 days until due'), urgencyCell(calcForDue('2023-05-22'), decimalPlaces)],
            [cell('13 days until due'), urgencyCell(calcForDue('2023-05-23'), decimalPlaces)],
            [cell('14 days until due'), urgencyCell(calcForDue('2023-05-24'), decimalPlaces)],
            [cell('More than 14 days until due'), urgencyCell(calcForDue('2023-05-25'), decimalPlaces)],
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

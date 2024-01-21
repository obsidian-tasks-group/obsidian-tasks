import { diff } from 'jest-diff';
import { fromLine } from '../TestingTools/TestHelpers';
import type { Task } from '../../src/Task/Task';

declare global {
    namespace jest {
        interface Matchers<R> {
            toToggleTo(expectedLines: string[]): R;
            toToggleWithRecurrenceInUsersOrderTo(expectedLines: string[]): R;
            toMatchMarkdownLines(expectedLines: string[]): R;
        }

        interface Expect {
            toToggleTo(expectedLines: string[]): any;
            toToggleWithRecurrenceInUsersOrderTo(expectedLines: string[]): any;
            toMatchMarkdownLines(expectedLines: string[]): any;
        }

        interface InverseAsymmetricMatchers {
            toToggleTo(expectedLines: string[]): any;
            toToggleWithRecurrenceInUsersOrderTo(expectedLines: string[]): any;
            toMatchMarkdownLines(expectedLines: string[]): any;
        }
    }
}

export function toToggleTo(line: string, expectedLines: string[]) {
    const task = fromLine({ line: line });
    const tasks = task.toggle();
    return toMatchMarkdownLines(tasks, expectedLines);
}

export function toToggleWithRecurrenceInUsersOrderTo(line: string, expectedLines: string[]) {
    const task = fromLine({ line: line });
    const tasks = task.toggleWithRecurrenceInUsersOrder();
    return toMatchMarkdownLines(tasks, expectedLines);
}

export function toMatchMarkdownLines(tasks: Task[], expectedLines: string[]) {
    const receivedLines = tasks.map((t) => t.toFileLineString());
    return toMatchLines(receivedLines, expectedLines);
}

function toMatchLines(receivedLines: string[], expectedLines: string[]) {
    const matches = receivedLines.join('\n') === expectedLines.join('\n');
    if (!matches) {
        return {
            message: () => 'unexpected incorrect new task lines:\n' + diff(expectedLines, receivedLines),
            pass: false,
        };
    }

    return {
        message: () => `new task lines" should not be: "${receivedLines}"`,
        pass: true,
    };
}

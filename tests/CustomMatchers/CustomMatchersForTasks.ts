import { diff } from 'jest-diff';
import { fromLine } from '../TestHelpers';

declare global {
    namespace jest {
        interface Matchers<R> {
            toToggleLineTo(expectedLines: string[]): R;
        }

        interface Expect {
            toToggleLineTo(expectedLines: string[]): any;
        }

        interface InverseAsymmetricMatchers {
            toToggleLineTo(expectedLines: string[]): any;
        }
    }
}

export function toToggleLineTo(line: string, expectedLines: string[]) {
    const task = fromLine({ line: line });
    const receivedLines = task.toggle().map((t) => t.toFileLineString());

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

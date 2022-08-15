import type { FilterOrErrorMessage } from '../../src/Query/Filter/Filter';
import { fromLine } from '../TestHelpers';
import { TaskBuilder } from '../TestingTools/TaskBuilder';

/* Example usage (shown for toMatchTaskFromLine(), but other matchers are available.

import { toMatchTaskFromLine } from '<relative-path>/CustomMatchersForFilters';

expect.extend({
    toMatchTaskFromLine,
});

 */

declare global {
    namespace jest {
        interface Matchers<R> {
            toBeValid(): R;
            toMatchTaskFromLine(description: string): R;
            toMatchTaskWithPath(path: string): R;
        }

        interface Expect {
            toBeValid(): any;
            toMatchTaskFromLine(description: string): any;
            toMatchTaskWithPath(path: string): any;
        }

        interface InverseAsymmetricMatchers {
            toBeValid(): any;
            toMatchTaskFromLine(description: string): any;
            toMatchTaskWithPath(path: string): any;
        }
    }
}

export function toBeValid(filter: FilterOrErrorMessage) {
    if (filter.filter === undefined) {
        return {
            message: () =>
                'unexpected null filter: check your instruction matches your filter class',
            pass: false,
        };
    }

    if (filter.error !== undefined) {
        return {
            message: () =>
                'unexpected error message in filter: check your instruction matches your filter class',
            pass: false,
        };
    }

    return {
        message: () => 'filter is unexpectedly valid',
        pass: true,
    };
}

export function toMatchTaskFromLine(
    filter: FilterOrErrorMessage,
    description: string,
) {
    const task = fromLine({
        line: description,
    });

    const matches = filter.filter!(task);
    if (!matches) {
        return {
            message: () => `unexpected failure to match task: ${description}`,
            pass: false,
        };
    }

    return {
        message: () => `filter should not have matched task: ${description}`,
        pass: true,
    };
}

export function toMatchTaskWithPath(
    filter: FilterOrErrorMessage,
    path: string,
) {
    const builder = new TaskBuilder();
    const task = builder.path(path).build();

    const matches = filter.filter!(task);
    if (!matches) {
        return {
            message: () => `unexpected failure to match task: ${path}`,
            pass: false,
        };
    }

    return {
        message: () => `filter should not have matched task: ${path}`,
        pass: true,
    };
}

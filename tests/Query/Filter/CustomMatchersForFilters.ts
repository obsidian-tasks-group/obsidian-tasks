import type { FilterOrErrorMessage } from '../../../src/Query/Filter/Filter';
import { fromLine } from '../../TestHelpers';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';

/* To use this code, you must add these lines:

import { toMatchTaskWithDescription } from '<relative-path>/CustomMatchersForFilters';

expect.extend({
    toMatchTaskWithDescription,
});

 */

declare global {
    namespace jest {
        interface Matchers<R> {
            toMatchTaskWithDescription(description: string): R;
        }

        interface Expect {
            toMatchTaskWithDescription(description: string): any;
        }

        interface InverseAsymmetricMatchers {
            toMatchTaskWithDescription(description: string): any;
        }
    }
}

export function toMatchTaskWithDescription(
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

declare global {
    namespace jest {
        interface Matchers<R> {
            toMatchTaskWithPath(path: string): R;

            toBeValid(): R;
        }

        interface Expect {
            toMatchTaskWithPath(path: string): any;

            toBeValid(): any;
        }

        interface InverseAsymmetricMatchers {
            toMatchTaskWithPath(path: string): any;

            toBeValid(): any;
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

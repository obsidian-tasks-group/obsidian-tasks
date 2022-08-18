import type { Task } from '../../src/Task';
import type { FilterOrErrorMessage } from '../../src/Query/Filter/Filter';
import { fromLine } from '../TestHelpers';
import { TaskBuilder } from '../TestingTools/TaskBuilder';

/**
 @summary
 This file contains Jest custom matchers, for idiomatic testing of filtering
 via Field classes.

 @description
 These matchers are a more idiomatic way of testing custom objects via
 the Jest test framework than the helper functions in tests/TestingTools/
 and various testing helpers in individual x.test.ts files.
 <br>

 When they fail, they show the line number at the call site, rather
 than some line buried down in the helper function, in other words, a much
 more useful call stack/traceback.
 <br>

 They can also generate much more informative error messages describing
 the failure.
 <br>

 Example usage (shown for  {@link toMatchTaskFromLine}, but other matchers are available:
 <br>

 @example

 // Setup:
 import { toMatchTaskFromLine } from '<relative-path>/CustomMatchersForFilters';

 expect.extend({
    toMatchTaskFromLine,
});

 // Inside it() and describe() blocks:
 it('works negating regexes', () => {
        // Arrange
        const filter = new DescriptionField().createFilterOrErrorMessage(
            'description regex does not match /^task/',
        );

        // Assert
        expect(filter).toMatchTaskFromLine(
            '- [ ] this does not start with the pattern',
        );
        expect(filter).not.toMatchTaskFromLine(
            '- [ ] task does start with the pattern',
        );
    });

 */

declare global {
    namespace jest {
        interface Matchers<R> {
            toBeValid(): R;
            toMatchTask(task: Task): R;
            toMatchTaskFromLine(line: string): R;
            toMatchTaskWithHeading(heading: string | null): R;
            toMatchTaskWithPath(path: string): R;
        }

        interface Expect {
            toBeValid(): any;
            toMatchTask(task: Task): any;
            toMatchTaskFromLine(line: string): any;
            toMatchTaskWithHeading(heading: string | null): any;
            toMatchTaskWithPath(path: string): any;
        }

        interface InverseAsymmetricMatchers {
            toBeValid(): any;
            toMatchTask(task: Task): any;
            toMatchTaskFromLine(line: string): any;
            toMatchTaskWithHeading(heading: string | null): any;
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

export function toMatchTask(filter: FilterOrErrorMessage, task: Task) {
    const matches = filter.filter!(task);
    if (!matches) {
        return {
            message: () =>
                `unexpected failure to match task: ${task.toFileLineString()}`,
            pass: false,
        };
    }

    return {
        message: () =>
            `filter should not have matched task: ${task.toFileLineString()}`,
        pass: true,
    };
}

export function toMatchTaskFromLine(
    filter: FilterOrErrorMessage,
    line: string,
) {
    const task = fromLine({
        line: line,
    });
    return toMatchTask(filter, task);
}

export function toMatchTaskWithHeading(
    filter: FilterOrErrorMessage,
    heading: string,
) {
    const builder = new TaskBuilder();
    const task = builder.precedingHeader(heading).build();
    return toMatchTask(filter, task);
}

export function toMatchTaskWithPath(
    filter: FilterOrErrorMessage,
    path: string,
) {
    const builder = new TaskBuilder();
    const task = builder.path(path).build();
    return toMatchTask(filter, task);
}

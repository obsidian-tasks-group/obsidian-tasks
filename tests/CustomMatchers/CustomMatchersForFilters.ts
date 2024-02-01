import { diff } from 'jest-diff';
import type { Task } from '../../src/Task/Task';
import type { FilterOrErrorMessage } from '../../src/Query/Filter/FilterOrErrorMessage';
import { fromLine } from '../TestingTools/TestHelpers';
import { TaskBuilder } from '../TestingTools/TaskBuilder';
import type { StatusConfiguration } from '../../src/Statuses/StatusConfiguration';
import { Status } from '../../src/Statuses/Status';
import { SearchInfo } from '../../src/Query/SearchInfo';

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

 Imports are done automatically in tests/CustomMatchers/jest.custom_matchers.setup.ts

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

/* MAINTENANCE NOTE:
        Please add any newly added matchers to this file:
            tests/CustomMatchers/jest.custom_matchers.setup.ts
        so that tests can find them automatically, without needing
        to write imports, and complex 'expect.extend(...)' lines.
        Thank you.
 */
declare global {
    namespace jest {
        interface Matchers<R> {
            toBeValid(): R;
            toHaveExplanation(expectedExplanation: string): R;
            toMatchTaskWithSearchInfo(task: Task, searchInfo: SearchInfo): R;
            toMatchTaskInTaskList(task: Task, allTasks: Task[]): R;
            toMatchTask(task: Task): R;
            toMatchTaskFromLine(line: string): R;
            toMatchTaskWithDescription(description: string): R;
            toMatchTaskWithHeading(heading: string | null): R;
            toMatchTaskWithPath(path: string): R;
            toMatchTaskWithStatus(statusConfiguration: StatusConfiguration): R;
        }

        interface Expect {
            toBeValid(): any;
            toHaveExplanation(expectedExplanation: string): any;
            toMatchTaskWithSearchInfo(task: Task, searchInfo: SearchInfo): any;
            toMatchTaskInTaskList(task: Task, allTasks: Task[]): any;
            toMatchTask(task: Task): any;
            toMatchTaskFromLine(line: string): any;
            toMatchTaskWithDescription(description: string): any;
            toMatchTaskWithHeading(heading: string | null): any;
            toMatchTaskWithPath(path: string): any;
            toMatchTaskWithStatus(statusConfiguration: StatusConfiguration): any;
        }

        interface InverseAsymmetricMatchers {
            toBeValid(): any;
            toHaveExplanation(expectedExplanation: string): any;
            toMatchTaskWithSearchInfo(task: Task, searchInfo: SearchInfo): any;
            toMatchTaskInTaskList(task: Task, allTasks: Task[]): any;
            toMatchTask(task: Task): any;
            toMatchTaskFromLine(line: string): any;
            toMatchTaskWithDescription(description: string): any;
            toMatchTaskWithHeading(heading: string | null): any;
            toMatchTaskWithPath(path: string): any;
            toMatchTaskWithStatus(statusConfiguration: StatusConfiguration): any;
        }
    }
}

export function toBeValid(filter: FilterOrErrorMessage) {
    if (filter.filterFunction === undefined) {
        return {
            message: () =>
                `unexpected null filter: check your instruction matches your filter class.
       Line is "${filter.instruction}
       Error message is "${filter.error}".`,
            pass: false,
        };
    }

    if (filter.error !== undefined) {
        return {
            message: () => `unexpected error message in filter: check your instruction matches your filter class
       Line is "${filter.instruction}`,
            pass: false,
        };
    }

    return {
        message: () => `filter is unexpectedly valid:
       Line is "${filter.instruction}`,
        pass: true,
    };
}

export function toHaveExplanation(filter: FilterOrErrorMessage, expectedExplanation: string) {
    expect(filter.filter).toBeDefined();
    const received = filter.filter?.explanation.asString();
    const matches = received === expectedExplanation;
    if (!matches) {
        return {
            message: () =>
                `unexpected incorrect explanation for "${filter.instruction}":\n` + diff(expectedExplanation, received),
            pass: false,
        };
    }

    return {
        message: () => `explanation for "${filter.instruction}" should not be: "${received}"`,
        pass: true,
    };
}

/**
 * Use this test matcher for any filters that need access to any data from the search.
 * @param filter
 * @param task
 * @param searchInfo
 */
export function toMatchTaskWithSearchInfo(filter: FilterOrErrorMessage, task: Task, searchInfo: SearchInfo) {
    const matches = filter.filterFunction!(task, searchInfo);
    if (!matches) {
        return {
            message: () => `unexpected failure to match
task:        "${task.toFileLineString()}"
with filter: "${filter.instruction}"`,
            pass: false,
        };
    }

    return {
        message: () => `filter should not have matched
task:        "${task.toFileLineString()}"
with filter: "${filter.instruction}"`,
        pass: true,
    };
}

export function toMatchTaskInTaskList(filter: FilterOrErrorMessage, task: Task, allTasks: Task[]) {
    // Make sure that the task being filtered is actually in allTasks,
    // to guard against tests passing for the wrong reason:
    expect(allTasks.includes(task)).toEqual(true);

    return toMatchTaskWithSearchInfo(filter, task, SearchInfo.fromAllTasks(allTasks));
}

export function toMatchTask(filter: FilterOrErrorMessage, task: Task) {
    return toMatchTaskWithSearchInfo(filter, task, SearchInfo.fromAllTasks([task]));
}

export function toMatchTaskFromLine(filter: FilterOrErrorMessage, line: string) {
    const task = fromLine({
        line: line,
    });
    return toMatchTask(filter, task);
}

export function toMatchTaskWithDescription(filter: FilterOrErrorMessage, description: string) {
    const builder = new TaskBuilder();
    const task = builder.description(description).build();
    return toMatchTask(filter, task);
}

export function toMatchTaskWithHeading(filter: FilterOrErrorMessage, heading: string) {
    const builder = new TaskBuilder();
    const task = builder.precedingHeader(heading).build();
    return toMatchTask(filter, task);
}

export function toMatchTaskWithPath(filter: FilterOrErrorMessage, path: string) {
    const builder = new TaskBuilder();
    const task = builder.path(path).build();
    return toMatchTask(filter, task);
}

export function toMatchTaskWithStatus(filter: FilterOrErrorMessage, statusConfiguration: StatusConfiguration) {
    const builder = new TaskBuilder();
    const task = builder.status(new Status(statusConfiguration)).build();
    return toMatchTask(filter, task);
}

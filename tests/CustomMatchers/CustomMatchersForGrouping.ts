import { diff } from 'jest-diff';
import type { Task } from '../../src/Task/Task';
import type { Grouper } from '../../src/Query/Group/Grouper';
import type { Field } from '../../src/Query/Filter/Field';
import { TaskGroups } from '../../src/Query/Group/TaskGroups';
import { TaskBuilder } from '../TestingTools/TaskBuilder';
import { SearchInfo } from '../../src/Query/SearchInfo';

declare global {
    namespace jest {
        interface Matchers<R> {
            toSupportGroupingWithProperty(property: string): R;
            groupHeadingsToBe(expectedGroupHeadings: string[]): R;
        }

        interface Expect {
            toSupportGroupingWithProperty(property: string): any;
        }

        interface InverseAsymmetricMatchers {
            toSupportGroupingWithProperty(property: string): any;
        }
    }
}

export function toSupportGroupingWithProperty(field: Field, property: string) {
    if (!field.supportsGrouping()) {
        return {
            message: () => `'${field.fieldName()}' field doesn't support grouping.`,
            pass: false,
        };
    }

    const fieldGrouper = field.createNormalGrouper();
    if (fieldGrouper.property !== property) {
        return {
            message: () =>
                `'${field.fieldName()}' field grouper property set to '${
                    fieldGrouper.property
                }', expected '${property}'.`,
            pass: false,
        };
    }

    return {
        message: () =>
            `'${field.fieldName()}' field supports grouping, grouping property set to '${fieldGrouper.property}'.`,
        pass: true,
    };
}

/**
 * Collate all the headings obtained when grouping the tasks by the grouper
 * @param grouper
 * @param tasks
 * @param searchInfo
 */
export function groupHeadingsForTask(grouper: Grouper, tasks: Task[], searchInfo: SearchInfo) {
    const groups = new TaskGroups([grouper], tasks, searchInfo);

    const headings: string[] = [];
    groups.groups.forEach((taskGroup) => {
        taskGroup.groupHeadings.forEach((heading) => {
            headings.push(heading.displayName);
        });
    });
    return headings;
}

export function groupHeadingsToBe(
    { grouper, tasks }: { grouper: Grouper; tasks: Task[] },
    expectedGroupHeadings: string[],
): jest.CustomMatcherResult {
    tasks.sort(() => Math.random() - 0.5);
    const groupHeadings = groupHeadingsForTask(grouper, tasks, SearchInfo.fromAllTasks(tasks));

    const pass: boolean = groupHeadings.join() === expectedGroupHeadings.join();
    const message: () => string = () =>
        pass
            ? `Group headings should not be\n${expectedGroupHeadings.join('\n')}`
            : `Group headings are not the same as expected: ${diff(expectedGroupHeadings, groupHeadings)}`;

    return {
        message,
        pass,
    };
}

/**
 * Test that applying the grouper to the task generates the expected group names.
 * @param grouper
 * @param task
 * @param expectedGroupNames
 */
export function toGroupTask(grouper: Grouper | null, task: Task, expectedGroupNames: string[]) {
    const tasks = [task];
    const searchInfo = SearchInfo.fromAllTasks(tasks);
    return toGroupTaskUsingSearchInfo(grouper, task, searchInfo, expectedGroupNames);
}

/**
 * Test that applying the grouper to the task, with the given SearchInfo, generates the expected group names.
 *
 * Unless the grouper needs access to the path to the query, use {@link toGroupTask} instead.
 *
 * @param grouper
 * @param task
 * @param searchInfo
 * @param expectedGroupNames
 */
export function toGroupTaskUsingSearchInfo(
    grouper: Grouper | null,
    task: Task,
    searchInfo: SearchInfo,
    expectedGroupNames: string[],
) {
    if (grouper === undefined) {
        return {
            message: () => 'unexpected null grouper: check your instruction matches your filter class.',
            pass: false,
        };
    }

    expect(grouper!.grouper(task, searchInfo)).toEqual(expectedGroupNames);
}

/**
 * Test that applying the grouper to the task created by the builder generates the expected group names.
 * @param grouper
 * @param taskBuilder
 * @param expectedGroupNames
 */
export function toGroupTaskFromBuilder(
    grouper: Grouper | null,
    taskBuilder: TaskBuilder,
    expectedGroupNames: string[],
) {
    const task = taskBuilder.build();
    toGroupTask(grouper, task, expectedGroupNames);
}

/**
 * Test that applying the grouper to a task in the given file path generates the expected group names.
 * @param grouper
 * @param path
 * @param expectedGroupNames
 */
export function toGroupTaskWithPath(grouper: Grouper | null, path: string, expectedGroupNames: string[]) {
    const taskBuilder = new TaskBuilder().path(path);
    toGroupTaskFromBuilder(grouper, taskBuilder, expectedGroupNames);
}

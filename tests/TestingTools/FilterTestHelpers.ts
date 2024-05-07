import type { FilterOrErrorMessage } from '../../src/Query/Filter/FilterOrErrorMessage';
import { TasksFile } from '../../src/Scripting/TasksFile';
import { Task } from '../../src/Task/Task';
import { Query } from '../../src/Query/Query';
import { TaskLocation } from '../../src/Task/TaskLocation';
import { SearchInfo } from '../../src/Query/SearchInfo';
import type { TaskBuilder } from './TaskBuilder';

/**
 * Convenience function to test a Filter on a single Task
 *
 * @param filter - a FilterOrErrorMessage, which should have a valid Filter.
 * @param taskBuilder - a TaskBuilder, populated with the required values for the test. For example:
 *                          new TaskBuilder().startDate('2022-04-15')
 * @param expected true if the task should match the filter, and false otherwise.
 */
export function testFilter(filter: FilterOrErrorMessage, taskBuilder: TaskBuilder, expected: boolean) {
    const task = taskBuilder.build();
    testTaskFilter(filter, task, expected);
}

/**
 * Convenience function to test a Filter on a single Task
 *
 * @param filter - a FilterOrErrorMessage, which should have a valid Filter.
 * @param task - the Task to filter.
 * @param expected true if the task should match the filter, and false otherwise.
 */
export function testTaskFilter(filter: FilterOrErrorMessage, task: Task, expected: boolean) {
    expect(filter.filterFunction).toBeDefined();
    expect(filter.error).toBeUndefined();
    expect(filter.filterFunction!(task, SearchInfo.fromAllTasks([task]))).toEqual(expected);
}

/**
 * Convenience function to test a Filter on a single Task
 *
 * This is to help with porting filter code out of Query and in to Field classes.
 * Unit tests can be first written using the Query class for filtering, and then
 * later updated to use testTaskFilter() instead
 *
 * @param filter - A string, such as 'priority is high'
 * @param task - the Task to filter
 * @param expected - true if the task should match the filter, and false otherwise.
 */
export function testTaskFilterViaQuery(filter: string, task: Task, expected: boolean) {
    // Arrange
    const query = new Query(filter);

    const tasks = [task];

    // Act
    let filteredTasks = [...tasks];
    const searchInfo = SearchInfo.fromAllTasks(tasks);
    query.filters.forEach((filter) => {
        filteredTasks = filteredTasks.filter((task) => filter.filterFunction(task, searchInfo));
    });
    const matched = filteredTasks.length === 1;

    // Assert
    expect(matched).toEqual(expected);
}

export type FilteringCase = {
    filters: Array<string>;
    tasks: Array<string>;
    expectedResult: Array<string>;
};

export function shouldSupportFiltering(
    filters: Array<string>,
    allTaskLines: Array<string>,
    expectedResult: Array<string>,
) {
    // Arrange
    const query = new Query(filters.join('\n'));

    const tasks = allTaskLines.map(
        (taskLine) =>
            Task.fromLine({
                line: taskLine,
                taskLocation: TaskLocation.fromUnknownPosition(new TasksFile('')),
                fallbackDate: null, // For tests scheduled date needs to be set explicitly
            }) as Task,
    );

    // Act
    let filteredTasks = [...tasks];
    const searchInfo = SearchInfo.fromAllTasks(tasks);
    query.filters.forEach((filter) => {
        filteredTasks = filteredTasks.filter((task) => filter.filterFunction(task, searchInfo));
    });

    // Assert
    const filteredTaskLines = filteredTasks.map((task) => `- [ ] ${task.toString()}`);
    expect(filteredTaskLines).toMatchObject(expectedResult);
}

export function booleanToEmoji(boolean: boolean) {
    return boolean ? '✅ true' : '❌ false';
}

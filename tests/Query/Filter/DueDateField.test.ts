/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { DueDateField } from '../../../src/Query/Filter/DueDateField';
import type { FilterOrErrorMessage } from '../../../src/Query/Filter/Filter';
import type { Task } from '../../../src/Task';
import { TaskBuilder } from './TaskBuilder';

window.moment = moment;

/**
 * Convenience function to test a Filter on a single Task
 *
 * @param filter - a FilterOrErrorMessage, which should have a valid Filter.
 * @param task - the Task to filter.
 * @param expected true if the task should match the filter, and false otherwise.
 */
function testTaskFilter(
    filter: FilterOrErrorMessage,
    task: Task,
    expected: boolean,
) {
    expect(filter.filter).toBeDefined();
    expect(filter.error).toBeUndefined();
    expect(filter.filter!(task)).toEqual(expected);
}

function testTaskFilterForTaskWithDueDate(
    filter: FilterOrErrorMessage,
    dueDate: string | null,
    expected: boolean,
) {
    const builder = new TaskBuilder();
    testTaskFilter(filter, builder.dueDate(dueDate).build(), expected);
}

describe('due date', () => {
    it('by due date (before)', () => {
        // Arrange
        const filter = new DueDateField().createFilterOrErrorMessage(
            'due before 2022-04-20',
        );

        // Act, Assert
        testTaskFilterForTaskWithDueDate(filter, null, false);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-15', true);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-20', false);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-25', false);
    });
});

/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { DueDateField } from '../../../src/Query/Filter/DueDateField';
import type { FilterOrErrorMessage } from '../../../src/Query/Filter/Filter';
import type { Task } from '../../../src/Task';
import { TaskBuilder } from './TaskBuilder';

window.moment = moment;

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
    builder: TaskBuilder,
    dueDate: string | null,
    expected: boolean,
) {
    testTaskFilter(filter, builder.dueDate(dueDate).build(), expected);
}

describe('due date', () => {
    it('by due date (before)', () => {
        // Arrange
        const filter = new DueDateField().createFilterOrErrorMessage(
            'due before 2022-04-20',
        );
        const builder = new TaskBuilder();

        // Act, Assert
        testTaskFilterForTaskWithDueDate(filter, builder, null, false);
        testTaskFilterForTaskWithDueDate(filter, builder, '2022-04-15', true);
        testTaskFilterForTaskWithDueDate(filter, builder, '2022-04-20', false);
        testTaskFilterForTaskWithDueDate(filter, builder, '2022-04-25', false);
    });
});

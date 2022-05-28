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

describe('due date', () => {
    it('by due date (before)', () => {
        // Arrange
        const filter = new DueDateField().createFilterOrErrorMessage(
            'due before 2022-04-20',
        );
        const builder = new TaskBuilder();

        // Act, Assert
        testTaskFilter(filter, builder.dueDate(null).build(), false);
        testTaskFilter(filter, builder.dueDate('2022-04-15').build(), true);
        testTaskFilter(filter, builder.dueDate('2022-04-20').build(), false);
        testTaskFilter(filter, builder.dueDate('2022-04-25').build(), false);
    });
});

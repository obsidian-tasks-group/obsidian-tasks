/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { DueDateField } from '../../../src/Query/Filter/DueDateField';
import type { FilterOrErrorMessage } from '../../../src/Query/Filter/Filter';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { testFilter } from '../../TestingTools/FilterTestHelpers';

window.moment = moment;

function testTaskFilterForTaskWithDueDate(filter: FilterOrErrorMessage, dueDate: string | null, expected: boolean) {
    const builder = new TaskBuilder();
    testFilter(filter, builder.dueDate(dueDate), expected);
}

describe('due date', () => {
    it('by due date (before)', () => {
        // Arrange
        const filter = new DueDateField().createFilterOrErrorMessage('due before 2022-04-20');

        // Act, Assert
        testTaskFilterForTaskWithDueDate(filter, null, false);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-15', true);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-20', false);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-25', false);
    });

    it('due date is invalid', () => {
        // Arrange
        const filter = new DueDateField().createFilterOrErrorMessage('due date is invalid');

        // Act, Assert
        testTaskFilterForTaskWithDueDate(filter, null, false);
        testTaskFilterForTaskWithDueDate(filter, '2022-04-15', false);
        testTaskFilterForTaskWithDueDate(filter, '2022-02-30', true); // 30 February is not valid
        testTaskFilterForTaskWithDueDate(filter, '2022-00-01', true); // month 0 not valid
        testTaskFilterForTaskWithDueDate(filter, '2022-13-01', true); // month 13 not valid
    });
});

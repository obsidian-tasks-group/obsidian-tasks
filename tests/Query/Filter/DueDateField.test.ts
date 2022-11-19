/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { DueDateField } from '../../../src/Query/Filter/DueDateField';
import type { FilterOrErrorMessage } from '../../../src/Query/Filter/Filter';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { testFilter } from '../../TestingTools/FilterTestHelpers';
import { toHaveExplanation } from '../../CustomMatchers/CustomMatchersForFilters';

window.moment = moment;

expect.extend({
    toHaveExplanation,
});

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

describe('explain due date queries', () => {
    it('should explain explicit date', () => {
        const filterOrMessage = new DueDateField().createFilterOrErrorMessage('due before 2023-01-02');
        expect(filterOrMessage).toHaveExplanation('due date is before 2023-01-02 (Monday 2nd January 2023)');
    });

    it('implicit "on" gets added to explanation', () => {
        const filterOrMessage = new DueDateField().createFilterOrErrorMessage('due 2023-01-02');
        expect(filterOrMessage).toHaveExplanation('due date is on 2023-01-02 (Monday 2nd January 2023)');
    });
});

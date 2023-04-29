/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { RecurringField } from '../../../src/Query/Filter/RecurringField';
import type { FilterOrErrorMessage } from '../../../src/Query/Filter/Filter';
import { testTaskFilter } from '../../TestingTools/FilterTestHelpers';
import { fromLine } from '../../TestHelpers';

window.moment = moment;

function testRecurringFilter(filter: FilterOrErrorMessage, line: string, expected: boolean) {
    const task = fromLine({ line });
    testTaskFilter(filter, task, expected);
}

describe('recurring', () => {
    const non_recurring = '- [ ] non-recurring task';
    const recurring = '- [ ] recurring 🔁 every day 📅 2022-06-17';
    // Invalid recurrence rules are discarded, and treated as non-recurring
    const invalid = '- [ ] recurring 🔁 invalid rule 📅 2022-06-17';

    it('is recurring', () => {
        // Arrange
        const filter = new RecurringField().createFilterOrErrorMessage('is recurring');

        // Assert
        testRecurringFilter(filter, non_recurring, false);
        testRecurringFilter(filter, recurring, true);
        testRecurringFilter(filter, invalid, false);
    });

    it('is not recurring', () => {
        // Arrange
        const filter = new RecurringField().createFilterOrErrorMessage('is not recurring');

        // Assert
        testRecurringFilter(filter, non_recurring, true);
        testRecurringFilter(filter, recurring, false);
        testRecurringFilter(filter, invalid, true);
    });
});

describe('grouping by recurring', () => {
    it('supports grouping methods correctly', () => {
        expect(new RecurringField()).toSupportGroupingWithProperty('recurring');
    });

    it.each([
        ['- [ ] a', ['Not Recurring']],
        ['- [ ] a 🔁 every Sunday', ['Recurring']],
    ])('task "%s" should have groups: %s', (taskLine: string, groups: string[]) => {
        // Arrange
        const grouper = new RecurringField().createGrouper().grouper;

        // Assert
        expect(grouper(fromLine({ line: taskLine }))).toEqual(groups);
    });
});

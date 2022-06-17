/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { RecurringField } from '../../../src/Query/Filter/RecurringField';
import type { FilterOrErrorMessage } from '../../../src/Query/Filter/Filter';
import { testTaskFilter } from '../../TestingTools/FilterTestHelpers';
import { fromLine } from '../../TestHelpers';

window.moment = moment;

function testRecurringFilter(
    filter: FilterOrErrorMessage,
    line: string,
    expected: boolean,
) {
    const task = fromLine({ line });
    testTaskFilter(filter, task, expected);
}

describe('recurring', () => {
    const non_recurring = '- [ ] non-recurring task';
    const recurring = '- [ ] recurring 🔁 every day 📅 2022-06-17';

    it('is recurring', () => {
        // Arrange
        const filter = new RecurringField().createFilterOrErrorMessage(
            'is recurring',
        );

        // Assert
        testRecurringFilter(filter, non_recurring, false);
        testRecurringFilter(filter, recurring, true);
    });

    it('is not recurring', () => {
        // Arrange
        const filter = new RecurringField().createFilterOrErrorMessage(
            'is not recurring',
        );

        // Assert
        testRecurringFilter(filter, non_recurring, true);
        testRecurringFilter(filter, recurring, false);
    });
});

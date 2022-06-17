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
    it('is recurring', () => {
        // Arrange
        const filter = new RecurringField().createFilterOrErrorMessage(
            'is recurring',
        );

        // Assert
        testRecurringFilter(filter, '- [ ] non-recurring task', false);
        testRecurringFilter(
            filter,
            '- [ ] recurring 🔁 every day 📅 2022-06-17',
            true,
        );
    });

    it('is not recurring', () => {
        // Arrange
        const filter = new RecurringField().createFilterOrErrorMessage(
            'is not recurring',
        );

        // Assert
        testRecurringFilter(filter, '- [ ] non-recurring task', true);
        testRecurringFilter(
            filter,
            '- [ ] recurring 🔁 every day 📅 2022-06-17',
            false,
        );
    });
});

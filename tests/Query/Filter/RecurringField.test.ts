/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { RecurringField } from '../../../src/Query/Filter/RecurringField';
import type { FilterOrErrorMessage } from '../../../src/Query/Filter/FilterOrErrorMessage';
import { testTaskFilter } from '../../TestingTools/FilterTestHelpers';
import { fromLine } from '../../TestingTools/TestHelpers';
import { SampleTasks } from '../../TestingTools/SampleTasks';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import {
    expectTaskComparesAfter,
    expectTaskComparesBefore,
    expectTaskComparesEqual,
} from '../../CustomMatchers/CustomMatchersForSorting';
import { RecurrenceBuilder } from '../../TestingTools/RecurrenceBuilder';

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

    it('should honour original case, when explaining simple filters', () => {
        const filter = new RecurringField().createFilterOrErrorMessage('is NOT recurring');
        expect(filter).toHaveExplanation('is NOT recurring');
    });
});

describe('sorting by recurring', () => {
    const recurrence = new RecurrenceBuilder().rule('every week when done').startDate('2022-07-14').build();
    const recurring = new TaskBuilder().recurrence(recurrence).build();
    const nonRecurring = new TaskBuilder().recurrence(null).build();

    it('supports Field sorting methods correctly', () => {
        const field = new RecurringField();
        expect(field.supportsSorting()).toEqual(true);
    });

    it('parses sort by recurrence', () => {
        const field = new RecurringField();
        expect(field.createSorterFromLine('sort by recurring')).not.toBeNull();
    });

    it('sort by due', () => {
        // Arrange
        const sorter = new RecurringField().createNormalSorter();

        // Assert
        expectTaskComparesBefore(sorter, recurring, nonRecurring);
        expectTaskComparesAfter(sorter, nonRecurring, recurring);
        expectTaskComparesEqual(sorter, nonRecurring, nonRecurring);
        expectTaskComparesEqual(sorter, recurring, recurring);
    });

    it('sort by due reverse', () => {
        // Arrange
        const sorter = new RecurringField().createReverseSorter();

        // Assert
        expectTaskComparesAfter(sorter, recurring, nonRecurring);
        expectTaskComparesBefore(sorter, nonRecurring, recurring);
        expectTaskComparesEqual(sorter, nonRecurring, nonRecurring);
        expectTaskComparesEqual(sorter, recurring, recurring);
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
        const grouper = new RecurringField().createNormalGrouper();

        // Assert
        const tasks = [fromLine({ line: taskLine })];
        expect({ grouper, tasks }).groupHeadingsToBe(groups);
    });

    it('should sort groups for RecurringField', () => {
        const grouper = new RecurringField().createNormalGrouper();
        const tasks = SampleTasks.withAllRecurrences();

        expect({ grouper, tasks }).groupHeadingsToBe(['Not Recurring', 'Recurring']);
    });
});

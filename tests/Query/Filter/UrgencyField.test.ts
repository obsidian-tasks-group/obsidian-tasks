/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { UrgencyField } from '../../../src/Query/Filter/UrgencyField';

import {
    expectTaskComparesAfter,
    expectTaskComparesBefore,
    expectTaskComparesEqual,
} from '../../CustomMatchers/CustomMatchersForSorting';
import { fromLine } from '../../TestingTools/TestHelpers';
import { Priority } from '../../../src/Task/Priority';

window.moment = moment;

describe('urgency', () => {
    it('should not yet be implemented', () => {
        // Arrange
        const filter = new UrgencyField().createFilterOrErrorMessage('any old nonsense');

        // Act, Assert
        expect(filter).not.toBeValid();
    });
});

describe('sorting by urgency', () => {
    it('supports Field sorting methods correctly', () => {
        const field = new UrgencyField();
        expect(field.supportsSorting()).toEqual(true);
    });

    // Helper function to create a task with a given priority
    function with_priority(priority: Priority) {
        return new TaskBuilder().priority(priority).build();
    }

    function with_priority_and_scheduled(priority: Priority, scheduled: string | null) {
        return new TaskBuilder().priority(priority).scheduledDate(scheduled).build();
    }

    it('sort by urgency', () => {
        // Arrange
        const sorter = new UrgencyField().createNormalSorter();

        // Assert
        // Just some minimal tests to confirm that the urgency value is respected.
        // No need to replicate a large number of tests already in tests of Urgency.
        expectTaskComparesBefore(
            sorter,
            with_priority(Priority.High), // Higher priority comes first
            with_priority(Priority.Medium),
        );

        expectTaskComparesEqual(
            sorter,
            with_priority(Priority.None), // Same priority compares equal
            with_priority(Priority.None),
        );

        expectTaskComparesBefore(
            sorter,
            with_priority_and_scheduled(Priority.Medium, '1999-01-12'), // If scheduled date has passed, urgency increases
            with_priority(Priority.Medium),
        );
    });

    it('sort by urgency reverse', () => {
        // Single example just to prove reverse works.
        const sorter = new UrgencyField().createReverseSorter();
        expectTaskComparesAfter(
            sorter,
            with_priority(Priority.High), // Higher priority comes last
            with_priority(Priority.Medium),
        );
    });
});

describe('grouping by urgency', () => {
    it('supports grouping methods correctly', () => {
        expect(new UrgencyField()).toSupportGroupingWithProperty('urgency');
    });

    // Numbers taken from:
    // https://publish.obsidian.md/tasks/Advanced/Urgency
    it.each([
        ['- [ ] a ⏫', ['6.00']],
        ['- [ ] a 🔼', ['3.90']],
        ['- [ ] a', ['1.95']],
        ['- [ ] a 🔽', ['0.00']],
    ])('task "%s" should have groups: %s', (taskLine: string, groups: string[]) => {
        // Arrange
        const grouper = new UrgencyField().createNormalGrouper();

        // Assert
        const tasks = [fromLine({ line: taskLine })];
        expect({ grouper, tasks }).groupHeadingsToBe(groups);
    });

    describe('should sort groups for UrgencyField', () => {
        const taskLines = ['- [ ] a ⏫', '- [ ] a 🔼', '- [ ] a', '- [ ] a 🔽'];
        const tasks = taskLines.map((taskLine) => fromLine({ line: taskLine }));

        it('highest urgency first with normal grouper', () => {
            const grouper = new UrgencyField().createNormalGrouper();
            expect({ grouper, tasks }).groupHeadingsToBe(['0.00', '1.95', '3.90', '6.00'].reverse());
        });

        it('lowest urgency first with reverse grouper', () => {
            const grouper = new UrgencyField().createReverseGrouper();
            expect({ grouper, tasks }).groupHeadingsToBe(['0.00', '1.95', '3.90', '6.00']);
        });
    });
});

/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { Priority } from '../../../src/Task';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { UrgencyField } from '../../../src/Query/Filter/UrgencyField';

import {
    expectTaskComparesAfter,
    expectTaskComparesBefore,
    expectTaskComparesEqual,
} from '../../CustomMatchers/CustomMatchersForSorting';

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

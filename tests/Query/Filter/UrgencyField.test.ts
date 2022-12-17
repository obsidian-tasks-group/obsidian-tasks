/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { Priority } from '../../../src/Task';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';

import { toBeValid, toHaveExplanation } from '../../CustomMatchers/CustomMatchersForFilters';

import {
    expectTaskComparesAfter,
    expectTaskComparesBefore,
    expectTaskComparesEqual,
} from '../../CustomMatchers/CustomMatchersForSorting';
import { Sort } from '../../../src/Query/Sort';

window.moment = moment;

expect.extend({
    toBeValid,
    toHaveExplanation,
});

describe('sorting by urgency', () => {
    // TODO Activate this when creating UrgencyField
    // it('does not yet support Field sorting methods', () => {
    //     const field = new UrgencyField();
    //     // Not yet supported - TODO - rename this test when implementing urgency sorting
    //     expect(field.supportsSorting()).toEqual(false);
    // });

    // Helper function to create a task with a given priority
    function with_priority(priority: Priority) {
        return new TaskBuilder().priority(priority).build();
    }

    function with_priority_and_scheduled(priority: Priority, scheduled: string | null) {
        return new TaskBuilder().priority(priority).scheduledDate(scheduled).build();
    }

    it('sort by urgency', () => {
        // Arrange
        const sorter = Sort.makeLegacySorting(false, 1, 'urgency');

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
        const sorter = Sort.makeLegacySorting(true, 1, 'urgency');
        expectTaskComparesAfter(
            sorter,
            with_priority(Priority.High), // Higher priority comes last
            with_priority(Priority.Medium),
        );
    });
});

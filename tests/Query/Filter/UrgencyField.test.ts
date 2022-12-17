import { Priority } from '../../../src/Task';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';

import { toBeValid, toHaveExplanation } from '../../CustomMatchers/CustomMatchersForFilters';

import {
    expectTaskComparesAfter,
    expectTaskComparesBefore,
    expectTaskComparesEqual,
} from '../../CustomMatchers/CustomMatchersForSorting';
import { Sort } from '../../../src/Query/Sort';

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

    it('sort by urgency', () => {
        // Arrange
        const sorter = Sort.makeLegacySorting(false, 1, 'urgency');

        // Assert
        // This tests each adjacent pair of urgency values, in descending order,
        // to prove that sorting of all combinations will be correct.
        expectTaskComparesBefore(sorter, with_priority(Priority.High), with_priority(Priority.Medium));
        expectTaskComparesBefore(sorter, with_priority(Priority.Medium), with_priority(Priority.None));
        expectTaskComparesBefore(sorter, with_priority(Priority.None), with_priority(Priority.Low));

        expectTaskComparesEqual(sorter, with_priority(Priority.None), with_priority(Priority.None));
    });

    it('sort by urgency reverse', () => {
        // Single example just to prove reverse works.
        // (There's no need to repeat all the examples above)
        const sorter = Sort.makeLegacySorting(true, 1, 'urgency');
        expectTaskComparesAfter(sorter, with_priority(Priority.High), with_priority(Priority.Medium));
    });
});

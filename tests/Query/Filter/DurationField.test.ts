/**
 * @jest-environment jsdom
 */

import { DurationField } from '../../../src/Query/Filter/DurationField';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { expectTaskComparesAfter, expectTaskComparesBefore } from '../../CustomMatchers/CustomMatchersForSorting';
import { SampleTasks } from '../../TestingTools/SampleTasks';
import { Duration } from '../../../src/Task/Duration';
import { toBeValid, toMatchTask } from '../../CustomMatchers/CustomMatchersForFilters';

expect.extend({
    toBeValid,
});

expect.extend({
    toMatchTask,
});

describe('DurationField', () => {
    it('should reject duration search containing unexpanded template text', () => {
        // Thorough checks are done in TemplatingPluginTools tests.

        // Arrange
        const instruction = 'duration under <%+ tp.get_remaining_hours_in_day_example() %>';

        // Act
        const filter = new DurationField().createFilterOrErrorMessage(instruction);

        // Assert
        expect(filter).not.toBeValid();
        expect(filter.error).toContain('Instruction contains unexpanded template text');
    });

    it('should honour original case, when explaining simple filters', () => {
        const filter = new DurationField().createFilterOrErrorMessage('HAS DURATION');
        expect(filter).toHaveExplanation('HAS DURATION');
    });
});

describe('explain duration queries', () => {
    it('should explain explicit date', () => {
        const filterOrMessage = new DurationField().createFilterOrErrorMessage('duration under 5h');
        expect(filterOrMessage).toHaveExplanation('duration is under 5h0m');
    });

    it('"is" gets not duplicated', () => {
        const filterOrMessage = new DurationField().createFilterOrErrorMessage('duration is 5m');
        expect(filterOrMessage).toHaveExplanation('duration is 0h5m');
    });
});

describe('sorting by duration', () => {
    it('supports Field sorting methods correctly', () => {
        const field = new DurationField();
        expect(field.supportsSorting()).toEqual(true);
    });

    // These are minimal tests just to confirm basic behaviour is set up for this field.
    // Thorough testing is done in DueDateField.test.ts.

    const duration1 = new TaskBuilder().duration(new Duration({ hours: 1, minutes: 30 })).build();
    const duration2 = new TaskBuilder().duration(new Duration({ hours: 3, minutes: 0 })).build();

    it('sort by duration', () => {
        expectTaskComparesBefore(new DurationField().createNormalSorter(), duration1, duration2);
    });

    it('sort by duration reverse', () => {
        expectTaskComparesAfter(new DurationField().createReverseSorter(), duration1, duration2);
    });
});

describe('grouping by duration', () => {
    it('supports Field grouping methods correctly', () => {
        expect(new DurationField()).toSupportGroupingWithProperty('duration');
    });

    it('group by duration', () => {
        // Arrange
        const grouper = new DurationField().createNormalGrouper();
        const taskWithDuration = new TaskBuilder().duration(new Duration({ hours: 1, minutes: 30 })).build();
        const taskWithoutDuration = new TaskBuilder().build();

        // Assert
        expect({ grouper, tasks: [taskWithDuration] }).groupHeadingsToBe(['1h30m']);
        expect({ grouper, tasks: [taskWithoutDuration] }).groupHeadingsToBe(['No duration']);
    });

    it('should sort groups for DurationField', () => {
        const grouper = new DurationField().createNormalGrouper();
        const tasks = SampleTasks.withAllRepresentativeDurations();

        expect({ grouper, tasks }).groupHeadingsToBe([
            '0h5m',
            '0h90m',
            '1h0m',
            '3h25m',
            '4h90m',
            '96h0m',
            'No duration',
        ]);
    });
});

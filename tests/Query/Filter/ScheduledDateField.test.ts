/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { ScheduledDateField } from '../../../src/Query/Filter/ScheduledDateField';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { expectTaskComparesAfter, expectTaskComparesBefore } from '../../CustomMatchers/CustomMatchersForSorting';
import { SampleTasks } from '../../TestingTools/SampleTasks';

window.moment = moment;

describe('explain scheduled date queries', () => {
    it('should explain explicit date', () => {
        const filterOrMessage = new ScheduledDateField().createFilterOrErrorMessage('scheduled before 2023-01-02');
        expect(filterOrMessage).toHaveExplanation('scheduled date is before 2023-01-02 (Monday 2nd January 2023)');
    });

    it('implicit "on" gets added to explanation', () => {
        const filterOrMessage = new ScheduledDateField().createFilterOrErrorMessage('scheduled 2023-01-02');
        expect(filterOrMessage).toHaveExplanation('scheduled date is on 2023-01-02 (Monday 2nd January 2023)');
    });
});

describe('sorting by scheduled', () => {
    it('supports Field sorting methods correctly', () => {
        const field = new ScheduledDateField();
        expect(field.supportsSorting()).toEqual(true);
    });

    // These are minimal tests just to confirm basic behaviour is set up for this field.
    // Thorough testing is done in DueDateField.test.ts.

    const date1 = new TaskBuilder().scheduledDate('2021-01-12').build();
    const date2 = new TaskBuilder().scheduledDate('2022-12-23').build();

    it('sort by scheduled', () => {
        expectTaskComparesBefore(new ScheduledDateField().createNormalSorter(), date1, date2);
    });

    it('sort by scheduled reverse', () => {
        expectTaskComparesAfter(new ScheduledDateField().createReverseSorter(), date1, date2);
    });
});

describe('grouping by scheduled date', () => {
    it('supports Field grouping methods correctly', () => {
        expect(new ScheduledDateField()).toSupportGroupingWithProperty('scheduled');
    });

    it('group by scheduled date', () => {
        // Arrange
        const grouper = new ScheduledDateField().createNormalGrouper();
        const taskWithDate = new TaskBuilder().scheduledDate('1970-01-01').build();
        const taskWithoutDate = new TaskBuilder().build();

        // Assert
        expect({ grouper, tasks: [taskWithDate] }).groupHeadingsToBe(['1970-01-01 Thursday']);
        expect({ grouper, tasks: [taskWithoutDate] }).groupHeadingsToBe(['No scheduled date']);
    });

    it('should sort groups for ScheduledDateField', () => {
        const grouper = new ScheduledDateField().createNormalGrouper();
        const tasks = SampleTasks.withAllRepresentativeScheduledDates();

        expect({ grouper, tasks }).groupHeadingsToBe([
            '%%0%% Invalid scheduled date',
            '2023-05-30 Tuesday',
            '2023-05-31 Wednesday',
            '2023-06-01 Thursday',
            '2023-06-02 Friday',
            'No scheduled date',
        ]);
    });
});

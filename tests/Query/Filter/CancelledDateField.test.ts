/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { CancelledDateField } from '../../../src/Query/Filter/CancelledDateField';
import type { FilterOrErrorMessage } from '../../../src/Query/Filter/FilterOrErrorMessage';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { testFilter } from '../../TestingTools/FilterTestHelpers';
import { expectTaskComparesAfter, expectTaskComparesBefore } from '../../CustomMatchers/CustomMatchersForSorting';
import { SampleTasks } from '../../TestingTools/SampleTasks';

window.moment = moment;

function testTaskFilterForTaskWithCancelledDate(
    filter: FilterOrErrorMessage,
    cancelledDate: string | null,
    expected: boolean,
) {
    const builder = new TaskBuilder();
    testFilter(filter, builder.cancelledDate(cancelledDate), expected);
}

describe('cancelled date', () => {
    it('by cancelled date presence', () => {
        // Arrange
        const filter = new CancelledDateField().createFilterOrErrorMessage('has cancelled date');

        // Act, Assert
        testTaskFilterForTaskWithCancelledDate(filter, null, false);
        testTaskFilterForTaskWithCancelledDate(filter, '2022-04-15', true);
    });

    it('by cancelled date absence', () => {
        // Arrange
        const filter = new CancelledDateField().createFilterOrErrorMessage('no cancelled date');

        // Act, Assert
        testTaskFilterForTaskWithCancelledDate(filter, null, true);
        testTaskFilterForTaskWithCancelledDate(filter, '2022-04-15', false);
    });
});

describe('explain cancelled date queries', () => {
    beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(2022, 0, 15)); // 2022-01-15
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    it('should explain date before', () => {
        const filterOrMessage = new CancelledDateField().createFilterOrErrorMessage('cancelled before 2023-01-02');
        expect(filterOrMessage).toHaveExplanation('cancelled date is before 2023-01-02 (Monday 2nd January 2023)');
    });

    it('should explain date with explicit on', () => {
        const filterOrMessage = new CancelledDateField().createFilterOrErrorMessage('cancelled on 2024-01-02');
        expect(filterOrMessage).toHaveExplanation('cancelled date is on 2024-01-02 (Tuesday 2nd January 2024)');
    });

    it('should explain date with implicit on', () => {
        const filterOrMessage = new CancelledDateField().createFilterOrErrorMessage('cancelled 2024-01-02');
        expect(filterOrMessage).toHaveExplanation('cancelled date is on 2024-01-02 (Tuesday 2nd January 2024)');
    });

    it('should show value of relative dates', () => {
        const filterOrMessage = new CancelledDateField().createFilterOrErrorMessage('cancelled after today');
        expect(filterOrMessage).toHaveExplanation('cancelled date is after 2022-01-15 (Saturday 15th January 2022)');
    });
});

describe('sorting by cancelled', () => {
    it('supports Field sorting methods correctly', () => {
        const field = new CancelledDateField();
        expect(field.supportsSorting()).toEqual(true);
    });

    // These are minimal tests just to confirm basic behaviour is set up for this field.
    // Thorough testing is cancelled in DueDateField.test.ts.

    const date1 = new TaskBuilder().cancelledDate('2021-01-12').build();
    const date2 = new TaskBuilder().cancelledDate('2022-12-23').build();

    it('sort by cancelled', () => {
        expectTaskComparesBefore(new CancelledDateField().createNormalSorter(), date1, date2);
    });

    it('sort by cancelled reverse', () => {
        expectTaskComparesAfter(new CancelledDateField().createReverseSorter(), date1, date2);
    });
});

describe('grouping by cancelled date', () => {
    it('supports Field grouping methods correctly', () => {
        expect(new CancelledDateField()).toSupportGroupingWithProperty('cancelled');
    });

    it('group by cancelled date', () => {
        // Arrange
        const grouper = new CancelledDateField().createNormalGrouper();
        const taskWithDate = new TaskBuilder().cancelledDate('1970-01-01').build();
        const taskWithoutDate = new TaskBuilder().build();

        // Assert
        expect({ grouper, tasks: [taskWithDate] }).groupHeadingsToBe(['1970-01-01 Thursday']);
        expect({ grouper, tasks: [taskWithoutDate] }).groupHeadingsToBe(['No cancelled date']);
    });

    it('should sort groups for CancelledDateField', () => {
        const grouper = new CancelledDateField().createNormalGrouper();
        const tasks = SampleTasks.withAllRepresentativeCancelledDates();

        expect({ grouper, tasks }).groupHeadingsToBe([
            '%%0%% Invalid cancelled date',
            '2023-05-30 Tuesday',
            '2023-05-31 Wednesday',
            '2023-06-01 Thursday',
            '2023-06-02 Friday',
            'No cancelled date',
        ]);
    });
});

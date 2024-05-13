/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { CreatedDateField } from '../../../src/Query/Filter/CreatedDateField';
import type { FilterOrErrorMessage } from '../../../src/Query/Filter/FilterOrErrorMessage';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { testFilter } from '../../TestingTools/FilterTestHelpers';
import {
    expectTaskComparesAfter,
    expectTaskComparesBefore,
    expectTaskComparesEqual,
} from '../../CustomMatchers/CustomMatchersForSorting';
import { SampleTasks } from '../../TestingTools/SampleTasks';

window.moment = moment;

function testTaskFilterForTaskWithCreatedDate(
    filter: FilterOrErrorMessage,
    createdDate: string | null,
    expected: boolean,
) {
    const builder = new TaskBuilder();
    testFilter(filter, builder.createdDate(createdDate), expected);
}

describe('created date', () => {
    it('by created date (before)', () => {
        // Arrange
        const filter = new CreatedDateField().createFilterOrErrorMessage('created before 2022-04-20');

        // Act, Assert
        testTaskFilterForTaskWithCreatedDate(filter, null, false);
        testTaskFilterForTaskWithCreatedDate(filter, '2022-04-15', true);
        testTaskFilterForTaskWithCreatedDate(filter, '2022-04-20', false);
        testTaskFilterForTaskWithCreatedDate(filter, '2022-04-25', false);
    });

    it('created date is invalid', () => {
        // Arrange
        const filter = new CreatedDateField().createFilterOrErrorMessage('created date is invalid');

        // Act, Assert
        testTaskFilterForTaskWithCreatedDate(filter, null, false);
        testTaskFilterForTaskWithCreatedDate(filter, '2022-04-15', false);
        testTaskFilterForTaskWithCreatedDate(filter, '2022-02-30', true); // 30 February is not valid
        testTaskFilterForTaskWithCreatedDate(filter, '2022-00-01', true); // month 0 not valid
        testTaskFilterForTaskWithCreatedDate(filter, '2022-13-01', true); // month 13 not valid
    });
});

describe('explain created date queries', () => {
    it('should explain explicit date', () => {
        const filterOrMessage = new CreatedDateField().createFilterOrErrorMessage('created before 2023-01-02');
        expect(filterOrMessage).toHaveExplanation('created date is before 2023-01-02 (Monday 2nd January 2023)');
    });

    it('implicit "on" gets added to explanation', () => {
        const filterOrMessage = new CreatedDateField().createFilterOrErrorMessage('created 2023-01-02');
        expect(filterOrMessage).toHaveExplanation('created date is on 2023-01-02 (Monday 2nd January 2023)');
    });
});

describe('sorting by created', () => {
    const date1 = new TaskBuilder().createdDate('2021-01-12').build();
    const date2 = new TaskBuilder().createdDate('2022-12-23').build();

    it('supports Field sorting methods correctly', () => {
        const field = new CreatedDateField();
        expect(field.supportsSorting()).toEqual(true);
    });

    it('sort by created', () => {
        // Arrange
        const sorter = new CreatedDateField().createNormalSorter();

        // Assert
        expectTaskComparesBefore(sorter, date1, date2);
        expectTaskComparesAfter(sorter, date2, date1);
        expectTaskComparesEqual(sorter, date2, date2);
    });

    it('sort by created reverse', () => {
        // Arrange
        const sorter = new CreatedDateField().createReverseSorter();

        // Assert
        expectTaskComparesAfter(sorter, date1, date2);
        expectTaskComparesBefore(sorter, date2, date1);
        expectTaskComparesEqual(sorter, date2, date2);
    });
});

describe('grouping by created date', () => {
    it('supports Field grouping methods correctly', () => {
        expect(new CreatedDateField()).toSupportGroupingWithProperty('created');
    });

    it('group by created date', () => {
        // Arrange
        const grouper = new CreatedDateField().createNormalGrouper();
        const taskWithDate = new TaskBuilder().createdDate('1970-01-01').build();
        const taskWithoutDate = new TaskBuilder().build();

        // Assert
        expect({ grouper, tasks: [taskWithDate] }).groupHeadingsToBe(['1970-01-01 Thursday']);
        expect({ grouper, tasks: [taskWithoutDate] }).groupHeadingsToBe(['No created date']);
    });

    it('should sort groups for CreatedDateField', () => {
        const grouper = new CreatedDateField().createNormalGrouper();
        const tasks = SampleTasks.withAllRepresentativeCreatedDates();

        expect({ grouper, tasks }).groupHeadingsToBe([
            '%%0%% Invalid created date',
            '2023-05-30 Tuesday',
            '2023-05-31 Wednesday',
            '2023-06-01 Thursday',
            '2023-06-02 Friday',
            'No created date',
        ]);
    });
});

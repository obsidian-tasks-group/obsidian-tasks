/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { HappensDateField } from '../../../src/Query/Filter/HappensDateField';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { testFilter } from '../../TestingTools/FilterTestHelpers';
import * as CustomMatchersForSorting from '../../CustomMatchers/CustomMatchersForSorting';
import { fromLine } from '../../TestingTools/TestHelpers';
import { SampleTasks } from '../../TestingTools/SampleTasks';

window.moment = moment;

describe('happens date', () => {
    it('by happens date presence', () => {
        // Arrange
        const filter = new HappensDateField().createFilterOrErrorMessage('has happens date');

        // Act, Assert
        testFilter(filter, new TaskBuilder().dueDate(null), false);

        // scheduled, start and due all contribute to happens:
        testFilter(filter, new TaskBuilder().scheduledDate('2022-04-15'), true);
        testFilter(filter, new TaskBuilder().startDate('2022-04-15'), true);
        testFilter(filter, new TaskBuilder().dueDate('2022-04-15'), true);

        // Done date is ignored by happens
        testFilter(filter, new TaskBuilder().doneDate('2022-04-15'), false);
    });

    it('by happens date absence', () => {
        // Arrange
        const filter = new HappensDateField().createFilterOrErrorMessage('no happens date');

        // Act, Assert
        testFilter(filter, new TaskBuilder().dueDate(null), true);

        // scheduled, start and due all contribute to happens:
        testFilter(filter, new TaskBuilder().scheduledDate('2022-04-15'), false);
        testFilter(filter, new TaskBuilder().startDate('2022-04-15'), false);
        testFilter(filter, new TaskBuilder().dueDate('2022-04-15'), false);

        // Done date is ignored by happens
        testFilter(filter, new TaskBuilder().doneDate('2022-04-15'), true);
    });
});

describe('accessing earliest happens date', () => {
    it('should return null if no dates set', () => {
        expect(new HappensDateField().earliestDate(new TaskBuilder().build())).toBeNull();
    });

    function checkEarliestHappensDate(taskBuilder: TaskBuilder, expectedEarliestHappensDate: string) {
        const earliest = new HappensDateField().earliestDate(taskBuilder.build());
        expect({
            earliest: earliest?.format('YYYY-MM-DD'),
        }).toMatchObject({
            earliest: expectedEarliestHappensDate,
        });
    }

    it('should return due if only date set', () => {
        checkEarliestHappensDate(new TaskBuilder().dueDate('1989-12-17'), '1989-12-17');
    });

    it('should return start if only date set', () => {
        checkEarliestHappensDate(new TaskBuilder().startDate('1989-12-17'), '1989-12-17');
    });

    it('should return scheduled if only date set', () => {
        checkEarliestHappensDate(new TaskBuilder().scheduledDate('1989-12-17'), '1989-12-17');
    });

    it('should return earliest if all dates set', () => {
        checkEarliestHappensDate(
            new TaskBuilder().dueDate('1989-12-17').startDate('1999-12-17').scheduledDate('2009-12-17'),
            '1989-12-17',
        );
    });

    it('should give undated if all 3 dates are invalid', () => {
        const task = new TaskBuilder()
            .dueDate('1989-02-31')
            .startDate('1999-02-31')
            .scheduledDate('2009-02-31')
            .build();
        const earliest = new HappensDateField().earliestDate(task);
        expect(earliest).toBeNull();
    });
});

describe('explain happens date queries', () => {
    beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(2022, 0, 15)); // 2022-01-15
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    it('should explain date before', () => {
        const filterOrMessage = new HappensDateField().createFilterOrErrorMessage('happens before 2023-01-02');
        expect(filterOrMessage).toHaveExplanation(
            'due, start or scheduled date is before 2023-01-02 (Monday 2nd January 2023)',
        );
    });

    it('should explain date with explicit on', () => {
        const filterOrMessage = new HappensDateField().createFilterOrErrorMessage('happens on 2024-01-02');
        expect(filterOrMessage).toHaveExplanation(
            'due, start or scheduled date is on 2024-01-02 (Tuesday 2nd January 2024)',
        );
    });

    it('should explain date with implicit on', () => {
        const filterOrMessage = new HappensDateField().createFilterOrErrorMessage('happens 2024-01-02');
        expect(filterOrMessage).toHaveExplanation(
            'due, start or scheduled date is on 2024-01-02 (Tuesday 2nd January 2024)',
        );
    });

    it('should show value of relative dates', () => {
        const filterOrMessage = new HappensDateField().createFilterOrErrorMessage('happens after today');
        expect(filterOrMessage).toHaveExplanation(
            'due, start or scheduled date is after 2022-01-15 (Saturday 15th January 2022)',
        );
    });
});

describe('sorting by happens', () => {
    it('supports Field sorting methods correctly', () => {
        const field = new HappensDateField();
        expect(field.supportsSorting()).toEqual(true);
    });

    const date1 = new TaskBuilder().startDate('2021-01-12').build();
    const date2 = new TaskBuilder().scheduledDate('2022-12-23').build();

    it('sort by happens', () => {
        CustomMatchersForSorting.expectTaskComparesBefore(new HappensDateField().createNormalSorter(), date1, date2);
    });

    it('sort by happens reverse', () => {
        CustomMatchersForSorting.expectTaskComparesAfter(new HappensDateField().createReverseSorter(), date1, date2);
    });
});

describe('grouping by happens date', () => {
    it('supports Field grouping methods correctly', () => {
        expect(new HappensDateField()).toSupportGroupingWithProperty('happens');
    });

    it.each([
        ['- [ ] a', ['No happens date']],
        ['- [ ] due is only date 📅 1970-01-01', ['1970-01-01 Thursday']],
        ['- [ ] scheduled is only date ⏳ 1970-01-02', ['1970-01-02 Friday']],
        ['- [ ] start is only date 🛫 1970-01-03', ['1970-01-03 Saturday']],
        ['- [ ] due is earliest date 🛫 1970-01-03 ⏳ 1970-01-02 📅 1970-01-01', ['1970-01-01 Thursday']],
        ['- [ ] scheduled is earliest date 🛫 1970-01-03 ⏳ 1970-01-01 📅 1970-01-02', ['1970-01-01 Thursday']],
        ['- [ ] start is earliest date 🛫 1970-01-01 ⏳ 1970-01-02 📅 1970-01-03', ['1970-01-01 Thursday']],
    ])('group by happens date: task "%s" should have groups %s', (taskLine: string, expectedResult: string[]) => {
        // Arrange
        const grouper = new HappensDateField().createNormalGrouper();

        // Assert
        const tasks = [fromLine({ line: taskLine })];
        expect({ grouper, tasks }).groupHeadingsToBe(expectedResult);
    });

    it('should sort groups for HappensDateField', () => {
        const grouper = new HappensDateField().createNormalGrouper();
        const tasks = [
            ...SampleTasks.withAllRepresentativeDueDates(),
            ...SampleTasks.withAllRepresentativeScheduledDates(),
            ...SampleTasks.withAllRepresentativeStartDates(),
        ];

        // There is no heading '%%0%% Invalid happens date', because happens date ignores invalid dates.
        // Tasks with only invalid dates in the candidate 'happens' dates are treated as undated.
        expect({ grouper, tasks }).groupHeadingsToBe([
            '2023-05-30 Tuesday',
            '2023-05-31 Wednesday',
            '2023-06-01 Thursday',
            '2023-06-02 Friday',
            'No happens date',
        ]);
    });
});

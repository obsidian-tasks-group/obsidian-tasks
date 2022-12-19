/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { HappensDateField } from '../../../src/Query/Filter/HappensDateField';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { testFilter } from '../../TestingTools/FilterTestHelpers';
import { toHaveExplanation } from '../../CustomMatchers/CustomMatchersForFilters';

window.moment = moment;

expect.extend({
    toHaveExplanation,
});

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

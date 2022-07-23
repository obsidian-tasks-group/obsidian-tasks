/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { HappensDateField } from '../../../src/Query/Filter/HappensDateField';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { testFilter } from '../../TestingTools/FilterTestHelpers';

window.moment = moment;

describe('happens date', () => {
    it('by happens date presence', () => {
        // Arrange
        const filter = new HappensDateField().createFilterOrErrorMessage(
            'has happens date',
        );

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
        const filter = new HappensDateField().createFilterOrErrorMessage(
            'no happens date',
        );

        // Act, Assert
        testFilter(filter, new TaskBuilder().dueDate(null), true);

        // scheduled, start and due all contribute to happens:
        testFilter(
            filter,
            new TaskBuilder().scheduledDate('2022-04-15'),
            false,
        );
        testFilter(filter, new TaskBuilder().startDate('2022-04-15'), false);
        testFilter(filter, new TaskBuilder().dueDate('2022-04-15'), false);

        // Done date is ignored by happens
        testFilter(filter, new TaskBuilder().doneDate('2022-04-15'), true);
    });
});

describe('accessing earliest happens date', () => {
    it('should return null if no dates set', () => {
        expect(
            new HappensDateField().earliestDate(new TaskBuilder().build()),
        ).toBeNull();
    });

    function checkEarliestHappensDate(
        taskBuilder: TaskBuilder,
        expectedEarliestHappensDate: string,
    ) {
        const earliest = new HappensDateField().earliestDate(
            taskBuilder.build(),
        );
        expect({
            earliest: earliest?.format('YYYY-MM-DD'),
        }).toMatchObject({
            earliest: expectedEarliestHappensDate,
        });
    }

    it('should return due if only date set', () => {
        checkEarliestHappensDate(
            new TaskBuilder().dueDate('1989-12-17'),
            '1989-12-17',
        );
    });

    it('should return start if only date set', () => {
        checkEarliestHappensDate(
            new TaskBuilder().startDate('1989-12-17'),
            '1989-12-17',
        );
    });

    it('should return scheduled if only date set', () => {
        checkEarliestHappensDate(
            new TaskBuilder().scheduledDate('1989-12-17'),
            '1989-12-17',
        );
    });

    it('should return earliest if all dates set', () => {
        checkEarliestHappensDate(
            new TaskBuilder()
                .dueDate('1989-12-17')
                .startDate('1999-12-17')
                .scheduledDate('2009-12-17'),
            '1989-12-17',
        );
    });
});

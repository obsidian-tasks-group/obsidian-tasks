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

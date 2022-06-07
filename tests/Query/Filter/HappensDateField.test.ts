/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { HappensDateField } from '../../../src/Query/Filter/HappensDateField';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { testTaskFilter } from '../../TestingTools/FilterTestHelpers';

window.moment = moment;

describe('happens date', () => {
    it('by happens date presence', () => {
        // Arrange
        const filter = new HappensDateField().createFilterOrErrorMessage(
            'has happens date',
        );

        // Act, Assert
        testTaskFilter(filter, new TaskBuilder().dueDate(null).build(), false);

        // scheduled, start and due all contribute to happens:
        testTaskFilter(
            filter,
            new TaskBuilder().scheduledDate('2022-04-15').build(),
            true,
        );
        testTaskFilter(
            filter,
            new TaskBuilder().startDate('2022-04-15').build(),
            true,
        );
        testTaskFilter(
            filter,
            new TaskBuilder().dueDate('2022-04-15').build(),
            true,
        );

        // Done date is ignored by happens
        testTaskFilter(
            filter,
            new TaskBuilder().doneDate('2022-04-15').build(),
            false,
        );
    });

    it('by happens date absence', () => {
        // Arrange
        const filter = new HappensDateField().createFilterOrErrorMessage(
            'no happens date',
        );

        // Act, Assert
        testTaskFilter(filter, new TaskBuilder().dueDate(null).build(), true);

        // scheduled, start and due all contribute to happens:
        testTaskFilter(
            filter,
            new TaskBuilder().scheduledDate('2022-04-15').build(),
            false,
        );
        testTaskFilter(
            filter,
            new TaskBuilder().startDate('2022-04-15').build(),
            false,
        );
        testTaskFilter(
            filter,
            new TaskBuilder().dueDate('2022-04-15').build(),
            false,
        );

        // Done date is ignored by happens
        testTaskFilter(
            filter,
            new TaskBuilder().doneDate('2022-04-15').build(),
            true,
        );
    });
});

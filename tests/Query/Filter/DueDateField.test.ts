/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { DueDateField } from '../../../src/Query/Filter/DueDateField';
import { TaskBuilder } from './TaskBuilder';

window.moment = moment;

describe('due date', () => {
    it('by due date (before)', () => {
        // Arrange
        const filter = new DueDateField().createFilterOrErrorMessage(
            'due before 2022-04-20',
        );
        const builder = new TaskBuilder();
        // Assert
        expect(filter.filter).toBeDefined();
        expect(filter.error).toBeUndefined();

        expect(filter.filter!(builder.dueDate(null).build())).toEqual(false);
        expect(filter.filter!(builder.dueDate('2022-04-15').build())).toEqual(
            true,
        );
        expect(filter.filter!(builder.dueDate('2022-04-20').build())).toEqual(
            false,
        );
        expect(filter.filter!(builder.dueDate('2022-04-25').build())).toEqual(
            false,
        );
    });
});

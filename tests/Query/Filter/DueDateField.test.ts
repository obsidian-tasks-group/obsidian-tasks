/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { DueDateField } from '../../../src/Query/Filter/DueDateField';
import { TaskBuilder } from './TaskBuilder';

window.moment = moment;

describe('due date', () => {
    it('parses a task from a line', () => {
        // Arrange
        // Arrange
        const filterOrError = new DueDateField().createFilterOrErrorMessage(
            'due on today',
        );
        const builder = new TaskBuilder();
        const taskWithoutDueDate = builder.dueDate(null).build();

        // Assert
        expect(filterOrError.filter).toBeDefined();
        expect(filterOrError.error).toBeUndefined();

        expect(filterOrError.filter!(taskWithoutDueDate)).toEqual(false);
    });
});

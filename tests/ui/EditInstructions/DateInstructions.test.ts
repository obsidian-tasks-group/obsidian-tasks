/**
 * @jest-environment jsdom
 */
import moment from 'moment';

import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { SetTaskDate } from '../../../src/ui/EditInstructions/DateInstructions';

window.moment = moment;

// const yesterday = '2023-12-02';
const today = '2024-10-01';
const tomorrow = '2023-12-04';

beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(today));
});

afterEach(() => {
    jest.useRealTimers();
});

describe('SetTaskDate', () => {
    const taskWithNoDates = new TaskBuilder().build();
    const taskDueToday = new TaskBuilder().dueDate(today).build();

    it('should provide information to set up a menu item for due date', () => {
        // Arrange
        const instruction = new SetTaskDate('dueDate', new Date(today));

        // Assert
        expect(instruction.instructionDisplayName()).toEqual('Set Date: Tue Oct 01 2024');
        expect(instruction.isCheckedForTask(taskWithNoDates)).toEqual(false);
        expect(instruction.isCheckedForTask(taskDueToday)).toEqual(false); // TODO should be true.
    });

    it('should edit the date', () => {
        // Arrange
        const instruction = new SetTaskDate('dueDate', new Date(tomorrow));

        // Assert
        const newTasks = instruction.apply(taskWithNoDates);

        // Assert
        expect(newTasks.length).toEqual(1);
        expect(newTasks[0].dueDate).toEqualMoment(moment(tomorrow));
    });
});

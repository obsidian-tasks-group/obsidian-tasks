/**
 * @jest-environment jsdom
 */

import moment from 'moment/moment';

import { Status } from '../../../src/Status';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { SetStatus } from '../../../src/ui/EditInstructions/StatusInstructions';

window.moment = moment;

const today = '2023-12-03';

beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(today));
});

afterEach(() => {
    jest.useRealTimers();
});

describe('SetStatus', () => {
    const todoTask = new TaskBuilder().status(Status.makeTodo()).build();
    const doneTask = new TaskBuilder().status(Status.makeDone()).build();

    it('should provide information to set up a menu item for setting status', () => {
        // Arrange
        const status = Status.makeTodo();
        const instruction = new SetStatus(status);

        // Assert
        expect(instruction.instructionDisplayName()).toEqual('Change status to: [ ] Todo');
        expect(instruction.isCheckedForTask(todoTask)).toEqual(true);
        expect(instruction.isCheckedForTask(doneTask)).toEqual(false);
    });

    it('should edit status', () => {
        // Arrange
        const instruction = new SetStatus(Status.makeDone());

        // Act
        const newTasks = instruction.apply(todoTask);

        // Assert
        expect(newTasks.length).toEqual(1);
        expect(newTasks[0].status.symbol).toEqual('x');
    });

    it('should not edit task if already has chosen status', () => {
        // Arrange
        const instruction = new SetStatus(Status.makeTodo());

        // Act
        const newTasks = instruction.apply(todoTask);

        // Assert
        expect(newTasks.length).toEqual(1);
        // Expect it is the same object
        expect(Object.is(newTasks[0], todoTask)).toBe(true);
    });
});

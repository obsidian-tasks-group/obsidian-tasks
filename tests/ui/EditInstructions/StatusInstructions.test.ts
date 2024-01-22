/**
 * @jest-environment jsdom
 */

import moment from 'moment/moment';

import { Status } from '../../../src/Statuses/Status';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { SetStatus, allStatusInstructions } from '../../../src/ui/EditInstructions/StatusInstructions';
import * as StatusExamples from '../../TestingTools/StatusExamples';
import { constructStatuses } from '../../TestingTools/StatusesTestHelpers';
import { StatusRegistry } from '../../../src/Statuses/StatusRegistry';

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

describe('All Status Instructions', () => {
    it('should supply all status instructions', () => {
        // Arrange
        // We reverse the order, to put core statuses at the end - so we can test the instructions
        // correctly put core statuses first.
        const reversedStatuses = constructStatuses(StatusExamples.doneTogglesToCancelled()).reverse();
        const statusRegistry = new StatusRegistry();
        statusRegistry.set(reversedStatuses);

        // Confirm the order of statuses:
        const statusSymbolsAsRegistered = statusRegistry.registeredStatuses.map((status) => status.symbol);
        expect(statusSymbolsAsRegistered).toStrictEqual(['-', '/', 'x', ' ']);

        // Act
        const allInstructions = allStatusInstructions(statusRegistry);

        // Assert
        expect(allInstructions.length).toBe(4);
        const statusSymbolsInInstructions = allInstructions.map((instruction) => instruction.newStatus.symbol);
        // Check core statuses are before others:
        expect(statusSymbolsInInstructions).toStrictEqual(['x', ' ', '-', '/']);
    });
});

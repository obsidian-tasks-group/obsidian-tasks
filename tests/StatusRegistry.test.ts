/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { StatusRegistry } from '../src/StatusRegistry';
import { Status } from '../src/Status';
import { Task } from '../src/Task';

jest.mock('obsidian');
window.moment = moment;

describe('StatusRegistry', () => {
    it('should create a new instance and populate default status indicators', () => {
        // Arrange

        // Act
        const statusRegistry = StatusRegistry.getInstance();

        // Assert
        expect(statusRegistry).not.toBeNull();

        expect(statusRegistry.byIndicator('x')).toEqual(Status.DONE);
        expect(statusRegistry.byIndicator('')).toEqual(Status.EMPTY);
        expect(statusRegistry.byIndicator(' ')).toEqual(Status.TODO);
        expect(statusRegistry.byIndicator('-')).toEqual(Status.CANCELLED);
        expect(statusRegistry.byIndicator('/')).toEqual(Status.IN_PROGRESS);
    });

    it('should allow task to toggle through standard transitions', () => {
        // Arrange
        const statusRegistry = StatusRegistry.getInstance();
        statusRegistry.clearStatuses();
        const line = '- [ ] this is a task starting at A';
        const path = 'file.md';
        const sectionStart = 1337;
        const sectionIndex = 1209;
        const precedingHeader = 'Eloquent Section';
        const task = Task.fromLine({
            line,
            path,
            sectionStart,
            sectionIndex,
            precedingHeader,
        });

        // Act

        // Assert
        expect(task).not.toBeNull();
        expect(task!.status).toEqual(Status.TODO);

        const toggledInProgress = task?.toggle()[0];
        expect(toggledInProgress?.status).toEqual(Status.IN_PROGRESS);

        const toggledDone = toggledInProgress?.toggle()[0];
        expect(toggledDone?.status).toEqual(Status.DONE);

        const toggledTodo = toggledDone?.toggle()[0];
        expect(toggledTodo?.status).toEqual(Status.TODO);
    });

    it('should allow task to toggle from cancelled to todo', () => {
        // Arrange
        const statusRegistry = StatusRegistry.getInstance();
        statusRegistry.clearStatuses();
        const line = '- [-] This is a cancelled task';
        const path = 'file.md';
        const sectionStart = 1337;
        const sectionIndex = 1209;
        const precedingHeader = 'Eloquent Section';
        const task = Task.fromLine({
            line,
            path,
            sectionStart,
            sectionIndex,
            precedingHeader,
        });

        // Act

        // Assert
        expect(task).not.toBeNull();
        expect(task!.status).toEqual(Status.CANCELLED);

        const toggledTodo = task?.toggle()[0];
        expect(toggledTodo?.status).toEqual(Status.TODO);
    });

    it('should allow lookup of next status for a status', () => {
        // Arrange
        const statusRegistry = StatusRegistry.getInstance();
        statusRegistry.clearStatuses();
        const statusA = new Status('a', 'A', 'b');
        const statusB = new Status('b', 'B', 'c');
        const statusC = new Status('c', 'C', 'd');
        const statusD = new Status('d', 'D', 'a');

        // Act
        statusRegistry.add(statusA);
        statusRegistry.add(statusB);
        statusRegistry.add(statusC);
        statusRegistry.add(statusD);

        // Assert
        expect(statusRegistry.getNextStatus(statusA).indicator).toEqual('b');
        expect(statusRegistry.getNextStatus(statusB).indicator).toEqual('c');
        expect(statusRegistry.getNextStatus(statusC).indicator).toEqual('d');
        expect(statusRegistry.getNextStatus(statusD).indicator).toEqual('a');
    });

    it('should allow task to toggle through custom transitions', () => {
        // Arrange
        const statusRegistry = StatusRegistry.getInstance();
        statusRegistry.clearStatuses();
        const statusA = new Status('a', 'A', 'b');
        const statusB = new Status('b', 'B', 'c');
        const statusC = new Status('c', 'C', 'd');
        const statusD = new Status('d', 'D', 'a');
        statusRegistry.add(statusA);
        statusRegistry.add(statusB);
        statusRegistry.add(statusC);
        statusRegistry.add(statusD);
        const line = '- [a] this is a task starting at A';
        const path = 'file.md';
        const sectionStart = 1337;
        const sectionIndex = 1209;
        const precedingHeader = 'Eloquent Section';
        const task = Task.fromLine({
            line,
            path,
            sectionStart,
            sectionIndex,
            precedingHeader,
        });

        // Act

        // Assert
        expect(task).not.toBeNull();
        expect(task!.status).toEqual(statusA);

        const toggledA = task?.toggle()[0];
        expect(toggledA?.status).toEqual(statusB);

        const toggledB = toggledA?.toggle()[0];
        expect(toggledB?.status).toEqual(statusC);

        const toggledC = toggledB?.toggle()[0];
        expect(toggledC?.status).toEqual(statusD);

        const toggledD = toggledC?.toggle()[0];
        expect(toggledD?.status).toEqual(statusA);
    });
});

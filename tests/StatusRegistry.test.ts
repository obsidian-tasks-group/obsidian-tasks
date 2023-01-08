/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { StatusRegistry } from '../src/StatusRegistry';
import { Status, StatusConfiguration } from '../src/Status';
import { Task } from '../src/Task';

jest.mock('obsidian');
window.moment = moment;

describe('StatusRegistry', () => {
    beforeEach(() => {
        StatusRegistry.getInstance().clearStatuses();
    });

    afterEach(() => {
        StatusRegistry.getInstance().clearStatuses();
    });

    it('should create a new instance and populate default status indicators', () => {
        // Arrange

        // Act
        const statusRegistry = StatusRegistry.getInstance();
        const doneStatus = statusRegistry.byIndicator('x');

        // Assert
        expect(statusRegistry).not.toBeNull();

        expect(doneStatus.indicator).toEqual(Status.DONE.indicator);

        expect(statusRegistry.byIndicator('x').indicator).toEqual(Status.DONE.indicator);
        expect(statusRegistry.byIndicator('').indicator).toEqual(Status.EMPTY.indicator);
        expect(statusRegistry.byIndicator(' ').indicator).toEqual(Status.TODO.indicator);
        expect(statusRegistry.byIndicator('-').indicator).toEqual(Status.CANCELLED.indicator);
        expect(statusRegistry.byIndicator('/').indicator).toEqual(Status.IN_PROGRESS.indicator);

        // Detect unrecognised indicator:
        expect(statusRegistry.byIndicator('?').indicator).toEqual(Status.EMPTY.indicator);
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
            fallbackDate: null,
        });

        // Act

        // Assert
        expect(task).not.toBeNull();
        expect(task!.status.indicator).toEqual(Status.TODO.indicator);

        // In Tasks, TODO toggles to DONE, for consistency with earlier releases.
        // const toggledInProgress = task?.toggle()[0];
        // expect(toggledInProgress?.status.indicator).toEqual(Status.IN_PROGRESS.indicator);

        const toggledDone = task?.toggle()[0];
        expect(toggledDone?.status.indicator).toEqual(Status.DONE.indicator);

        const toggledTodo = toggledDone?.toggle()[0];
        expect(toggledTodo?.status.indicator).toEqual(Status.TODO.indicator);
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
            fallbackDate: null,
        });

        // Act

        // Assert
        expect(task).not.toBeNull();
        expect(task!.status.indicator).toEqual(Status.CANCELLED.indicator);

        const toggledTodo = task?.toggle()[0];
        expect(toggledTodo?.status.indicator).toEqual(Status.TODO.indicator);
    });

    it('should allow lookup of next status for a status', () => {
        // Arrange
        const statusRegistry = StatusRegistry.getInstance();
        statusRegistry.clearStatuses();
        const statusA = new Status(new StatusConfiguration('a', 'A', 'b', false));
        const statusB = new Status(new StatusConfiguration('b', 'B', 'c', false));
        const statusC = new Status(new StatusConfiguration('c', 'C', 'd', false));
        const statusD = new Status(new StatusConfiguration('d', 'D', 'a', false));

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

    it('should handle adding custom StatusConfiguration', () => {
        // Arrange
        const statusRegistry = StatusRegistry.getInstance();
        const statusConfiguration = new StatusConfiguration('a', 'A', 'b', false);
        statusRegistry.add(statusConfiguration);

        // Assert
        const status2 = statusRegistry.byIndicator('a');
        expect(status2).toStrictEqual(new Status(statusConfiguration));
    });

    it('should not modify an added custom Status', () => {
        // Arrange
        const statusRegistry = StatusRegistry.getInstance();
        const status = new Status(new StatusConfiguration('a', 'A', 'b', false));
        statusRegistry.add(status);

        // Assert
        const status2 = statusRegistry.byIndicator('a');
        expect(status2).toStrictEqual(status);
    });

    it('should allow task to toggle through custom transitions', () => {
        // Arrange
        const statusRegistry = StatusRegistry.getInstance();
        statusRegistry.clearStatuses();
        const statusA = new Status(new StatusConfiguration('a', 'A', 'b', false));
        const statusB = new Status(new StatusConfiguration('b', 'B', 'c', false));
        const statusC = new Status(new StatusConfiguration('c', 'C', 'd', false));
        const statusD = new Status(new StatusConfiguration('d', 'D', 'a', false));
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
            fallbackDate: null,
        });

        // Act

        // Assert
        expect(task).not.toBeNull();
        expect(task!.status.indicator).toEqual(statusA.indicator);

        const toggledA = task?.toggle()[0];
        expect(toggledA?.status.indicator).toEqual(statusB.indicator);

        const toggledB = toggledA?.toggle()[0];
        expect(toggledB?.status.indicator).toEqual(statusC.indicator);

        const toggledC = toggledB?.toggle()[0];
        expect(toggledC?.status.indicator).toEqual(statusD.indicator);

        const toggledD = toggledC?.toggle()[0];
        expect(toggledD?.status.indicator).toEqual(statusA.indicator);
    });
});

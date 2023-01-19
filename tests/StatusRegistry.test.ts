/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { StatusRegistry } from '../src/StatusRegistry';
import { Status } from '../src/Status';
import { StatusConfiguration, StatusType } from '../src/StatusConfiguration';
import { Task } from '../src/Task';
import * as TestHelpers from './TestHelpers';
import { TaskBuilder } from './TestingTools/TaskBuilder';

jest.mock('obsidian');
window.moment = moment;

describe('StatusRegistry', () => {
    // Reset the global StatusRegistry before and after each test.
    // The global StatusRegistry is used by the code that toggles tasks.
    // Where possible, tests should create their own StatusRegistry to act on.
    beforeEach(() => {
        StatusRegistry.getInstance().clearStatuses();
    });

    afterEach(() => {
        StatusRegistry.getInstance().clearStatuses();
    });

    it('should create a new instance and populate default status indicators', () => {
        // Arrange

        // Act
        const statusRegistry = new StatusRegistry();
        const doneStatus = statusRegistry.byIndicator('x');

        // Assert
        expect(statusRegistry).not.toBeNull();

        expect(doneStatus.indicator).toEqual(Status.makeDone().indicator);

        expect(statusRegistry.byIndicator('x').indicator).toEqual(Status.makeDone().indicator);
        expect(statusRegistry.byIndicator('').indicator).toEqual(Status.makeEmpty().indicator);
        expect(statusRegistry.byIndicator(' ').indicator).toEqual(Status.makeTodo().indicator);
        expect(statusRegistry.byIndicator('-').indicator).toEqual(Status.makeCancelled().indicator);
        expect(statusRegistry.byIndicator('/').indicator).toEqual(Status.makeInProgress().indicator);

        // Detect unrecognised indicator:
        expect(statusRegistry.byIndicator('?').indicator).toEqual(Status.makeEmpty().indicator);
    });

    it('should return empty status for lookup by unknown indicator with byIndicator()', () => {
        // Arrange
        const statusRegistry = new StatusRegistry();

        // Act
        const result = statusRegistry.byIndicator('?');

        // Assert
        expect(result).toEqual(Status.EMPTY);
    });

    it('should return Unknown status for lookup by unknown indicator with byIndicatorOrCreate()', () => {
        // Arrange
        const statusRegistry = new StatusRegistry();

        // Act
        const result = statusRegistry.byIndicatorOrCreate('?');

        // Assert
        expect(result.indicator).toEqual('?');
        expect(result.name).toEqual('Unknown');
        expect(result.nextStatusIndicator).toEqual('x');
    });

    it('should allow lookup of next status for a status', () => {
        // Arrange
        const statusRegistry = new StatusRegistry();
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

    it('should return EMPTY if next status does not exist', () => {
        const statusRegistry = new StatusRegistry();
        const status = new Status(new StatusConfiguration('P', 'Pro', 'C', false));
        const nextStatus = statusRegistry.getNextStatus(status);
        expect(nextStatus.type).toEqual(StatusType.EMPTY);
    });

    it('should construct a TODO on request if next status does not exist', () => {
        // Arrange
        const statusRegistry = new StatusRegistry();
        const status = new Status(new StatusConfiguration('P', 'Pro', 'C', false));
        const nextStatus = statusRegistry.getNextStatusOrCreate(status);

        // Assert
        expect(nextStatus.indicator).toEqual('C');
        expect(nextStatus.name).toEqual('Unknown');
        expect(nextStatus.nextStatusIndicator).toEqual('x');
        expect(nextStatus.type).toEqual(StatusType.TODO);
    });

    it('should handle adding custom StatusConfiguration', () => {
        // Arrange
        const statusRegistry = new StatusRegistry();
        const statusConfiguration = new StatusConfiguration('a', 'A', 'b', false);
        statusRegistry.add(statusConfiguration);

        // Assert
        const status2 = statusRegistry.byIndicator('a');
        expect(status2).toStrictEqual(new Status(statusConfiguration));
    });

    it('should not modify an added custom Status', () => {
        // Arrange
        const statusRegistry = new StatusRegistry();
        const status = new Status(new StatusConfiguration('a', 'A', 'b', false));
        statusRegistry.add(status);

        // Assert
        const status2 = statusRegistry.byIndicator('a');
        expect(status2).toStrictEqual(status);
    });

    describe('toggling', () => {
        it('should allow task to toggle through standard transitions', () => {
            // Arrange
            // Global statusRegistry instance - which controls toggling - will have been reset
            // in beforeEach() above.
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
            expect(task!.status.indicator).toEqual(Status.makeTodo().indicator);

            // In Tasks, TODO toggles to DONE, for consistency with earlier releases.
            // const toggledInProgress = task?.toggle()[0];
            // expect(toggledInProgress?.status.indicator).toEqual(Status.IN_PROGRESS.indicator);

            const toggledDone = task?.toggle()[0];
            expect(toggledDone?.status.indicator).toEqual(Status.makeDone().indicator);

            const toggledTodo = toggledDone?.toggle()[0];
            expect(toggledTodo?.status.indicator).toEqual(Status.makeTodo().indicator);
        });

        it('should allow task to toggle from cancelled to todo', () => {
            // Arrange
            // Global statusRegistry instance - which controls toggling - will have been reset
            // in beforeEach() above.
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
            expect(task!.status.indicator).toEqual(Status.makeCancelled().indicator);

            const toggledTodo = task?.toggle()[0];
            expect(toggledTodo?.status.indicator).toEqual(Status.makeTodo().indicator);
        });

        it('should allow task to toggle through custom transitions', () => {
            // Arrange
            // Toggling code uses the global status registry, so we must explicitly modify that instance.
            // It will already have been reset in beforeEach() above.
            const globalStatusRegistry = StatusRegistry.getInstance();
            const statusA = new Status(new StatusConfiguration('a', 'A', 'b', false));
            const statusB = new Status(new StatusConfiguration('b', 'B', 'c', false));
            const statusC = new Status(new StatusConfiguration('c', 'C', 'd', false));
            const statusD = new Status(new StatusConfiguration('d', 'D', 'a', false));
            globalStatusRegistry.add(statusA);
            globalStatusRegistry.add(statusB);
            globalStatusRegistry.add(statusC);
            globalStatusRegistry.add(statusD);
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

        it('should leave task valid if toggling to unknown status', () => {
            // Arrange
            const globalStatusRegistry = StatusRegistry.getInstance();
            const important = new StatusConfiguration('!', 'Important', 'D', false);
            globalStatusRegistry.add(important);

            const line = '- [!] this is an important task';
            const task = TestHelpers.fromLine({ line });
            expect(task).not.toBeNull();
            expect(task!.status.indicator).toEqual(important.indicator);

            // Act
            const toggled = task?.toggle()[0];

            // Assert
            // Issue https://github.com/obsidian-tasks-group/obsidian-tasks/issues/1499
            // Ensure that the next status was applied, even though it is an unrecognised status
            expect(toggled?.status.indicator).toEqual('D');
        });

        it('should bulk-add unknown statuses', () => {
            // Arrange
            const registry = new StatusRegistry();
            expect(registry.byIndicator('!').type).toEqual(StatusType.EMPTY);
            expect(registry.byIndicator('X').type).toEqual(StatusType.EMPTY);
            expect(registry.byIndicator('d').type).toEqual(StatusType.EMPTY);
            const tasks = [
                new TaskBuilder().statusValues('!', 'Unknown', 'X', false, StatusType.TODO).build(),
                new TaskBuilder().statusValues('X', 'Unknown', '!', false, StatusType.DONE).build(),
                new TaskBuilder().statusValues('d', 'Unknown', '!', false, StatusType.IN_PROGRESS).build(),
                // Include some tasks with duplicate statuses, to make sure duplicates are discarded
                new TaskBuilder().statusValues('!', 'Unknown', 'X', false, StatusType.TODO).build(),
                new TaskBuilder().statusValues('X', 'Unknown', '!', false, StatusType.DONE).build(),
                new TaskBuilder().statusValues('d', 'Unknown', '!', false, StatusType.IN_PROGRESS).build(),
                // Check that it does not add copies of any core statuses
                new TaskBuilder().statusValues('-', 'Unknown', '!', false, StatusType.IN_PROGRESS).build(),
            ];

            // Act
            const unknownStatuses = registry.findUnknownStatuses(tasks);

            // Assert
            expect(unknownStatuses.length).toEqual(3);

            let s1;
            s1 = unknownStatuses[0];
            expect(s1.type).toEqual(StatusType.TODO);
            expect(s1.name).toEqual('Unknown (!)');

            s1 = unknownStatuses[1];
            expect(s1.type).toEqual(StatusType.DONE);
            expect(s1.name).toEqual('Unknown (X)');

            s1 = unknownStatuses[2];
            expect(s1.type).toEqual(StatusType.IN_PROGRESS);
            expect(s1.name).toEqual('Unknown (d)');
        });
    });
});

/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { StatusRegistry } from '../src/StatusRegistry';
import { Status } from '../src/Status';
import { StatusConfiguration, StatusType } from '../src/StatusConfiguration';
import { Task } from '../src/Task';
import { TaskLocation } from '../src/TaskLocation';
import * as TestHelpers from './TestHelpers';

jest.mock('obsidian');
window.moment = moment;

describe('StatusRegistry', () => {
    // Reset the global StatusRegistry before and after each test.
    // The global StatusRegistry is used by the code that toggles tasks.
    // Where possible, tests should create their own StatusRegistry to act on.
    beforeEach(() => {
        StatusRegistry.getInstance().resetToDefaultStatuses();
    });

    afterEach(() => {
        StatusRegistry.getInstance().resetToDefaultStatuses();
    });

    it('should create a new instance and populate default status symbols', () => {
        // Arrange

        // Act
        const statusRegistry = new StatusRegistry();
        const doneStatus = statusRegistry.bySymbol('x');

        // Assert
        expect(statusRegistry).not.toBeNull();

        expect(doneStatus.symbol).toEqual(Status.makeDone().symbol);

        expect(statusRegistry.bySymbol('x').symbol).toEqual(Status.makeDone().symbol);
        expect(statusRegistry.bySymbol('').symbol).toEqual(Status.makeEmpty().symbol);
        expect(statusRegistry.bySymbol(' ').symbol).toEqual(Status.makeTodo().symbol);
        expect(statusRegistry.bySymbol('-').symbol).toEqual(Status.makeCancelled().symbol);
        expect(statusRegistry.bySymbol('/').symbol).toEqual(Status.makeInProgress().symbol);

        // Detect unrecognised symbol:
        expect(statusRegistry.bySymbol('?').symbol).toEqual(Status.makeEmpty().symbol);
    });

    it('should clear the statuses', () => {
        // Arrange
        const statusRegistry = new StatusRegistry();
        expect(statusRegistry.registeredStatuses.length).toEqual(4);

        // Act
        statusRegistry.clearStatuses();

        // Assert
        expect(statusRegistry.registeredStatuses.length).toEqual(0);
    });

    it('should return empty status for lookup by unknown symbol with bySymbol()', () => {
        // Arrange
        const statusRegistry = new StatusRegistry();

        // Act
        const result = statusRegistry.bySymbol('?');

        // Assert
        expect(result).toEqual(Status.EMPTY);
    });

    it('should return Unknown status for lookup by unknown symbol with bySymbolOrCreate()', () => {
        // Arrange
        const statusRegistry = new StatusRegistry();

        // Act
        const result = statusRegistry.bySymbolOrCreate('?');

        // Assert
        expect(result.symbol).toEqual('?');
        expect(result.name).toEqual('Unknown');
        expect(result.nextStatusSymbol).toEqual('x');
    });

    it('should allow lookup of next status for a status', () => {
        // Arrange
        const statusRegistry = new StatusRegistry();
        statusRegistry.resetToDefaultStatuses();
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
        expect(statusRegistry.getNextStatus(statusA).symbol).toEqual('b');
        expect(statusRegistry.getNextStatus(statusB).symbol).toEqual('c');
        expect(statusRegistry.getNextStatus(statusC).symbol).toEqual('d');
        expect(statusRegistry.getNextStatus(statusD).symbol).toEqual('a');
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
        expect(nextStatus.symbol).toEqual('C');
        expect(nextStatus.name).toEqual('Unknown');
        expect(nextStatus.nextStatusSymbol).toEqual('x');
        expect(nextStatus.type).toEqual(StatusType.TODO);
    });

    it('should handle adding custom StatusConfiguration', () => {
        // Arrange
        const statusRegistry = new StatusRegistry();
        const statusConfiguration = new StatusConfiguration('a', 'A', 'b', false);
        statusRegistry.add(statusConfiguration);

        // Assert
        const status2 = statusRegistry.bySymbol('a');
        expect(status2).toStrictEqual(new Status(statusConfiguration));
    });

    it('should not modify an added custom Status', () => {
        // Arrange
        const statusRegistry = new StatusRegistry();
        const status = new Status(new StatusConfiguration('a', 'A', 'b', false));
        statusRegistry.add(status);

        // Assert
        const status2 = statusRegistry.bySymbol('a');
        expect(status2).toStrictEqual(status);
    });

    describe('toggling', () => {
        it('should allow task to toggle through standard transitions', () => {
            // Arrange
            // Global statusRegistry instance - which controls toggling - will have been reset
            // in beforeEach() above.
            const line = '- [ ] this is a task starting at A';
            const path = 'file.md';
            const lineNumber = 3456;
            const sectionStart = 1337;
            const sectionIndex = 1209;
            const precedingHeader = 'Eloquent Section';
            const task = Task.fromLine({
                line,
                taskLocation: new TaskLocation(path, lineNumber, sectionStart, sectionIndex, precedingHeader),
                fallbackDate: null,
            });

            // Act

            // Assert
            expect(task).not.toBeNull();
            expect(task!.status.symbol).toEqual(Status.makeTodo().symbol);

            const toggledDone = task?.toggle()[0];
            expect(toggledDone?.status.symbol).toEqual(Status.makeDone().symbol);

            const toggledTodo = toggledDone?.toggle()[0];
            expect(toggledTodo?.status.symbol).toEqual(Status.makeTodo().symbol);
        });

        it('should allow task to toggle from cancelled to todo', () => {
            // Arrange
            // Global statusRegistry instance - which controls toggling - will have been reset
            // in beforeEach() above.
            const line = '- [-] This is a cancelled task';
            const path = 'file.md';
            const lineNumber = 3456;
            const sectionStart = 1337;
            const sectionIndex = 1209;
            const precedingHeader = 'Eloquent Section';
            const task = Task.fromLine({
                line,
                taskLocation: new TaskLocation(path, lineNumber, sectionStart, sectionIndex, precedingHeader),
                fallbackDate: null,
            });

            // Act

            // Assert
            expect(task).not.toBeNull();
            expect(task!.status.symbol).toEqual(Status.makeCancelled().symbol);

            const toggledTodo = task?.toggle()[0];
            expect(toggledTodo?.status.symbol).toEqual(Status.makeTodo().symbol);
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
            const lineNumber = 3456;
            const sectionStart = 1337;
            const sectionIndex = 1209;
            const precedingHeader = 'Eloquent Section';
            const task = Task.fromLine({
                line,
                taskLocation: new TaskLocation(path, lineNumber, sectionStart, sectionIndex, precedingHeader),
                fallbackDate: null,
            });

            // Act

            // Assert
            expect(task).not.toBeNull();
            expect(task!.status.symbol).toEqual(statusA.symbol);

            const toggledA = task?.toggle()[0];
            expect(toggledA?.status.symbol).toEqual(statusB.symbol);

            const toggledB = toggledA?.toggle()[0];
            expect(toggledB?.status.symbol).toEqual(statusC.symbol);

            const toggledC = toggledB?.toggle()[0];
            expect(toggledC?.status.symbol).toEqual(statusD.symbol);

            const toggledD = toggledC?.toggle()[0];
            expect(toggledD?.status.symbol).toEqual(statusA.symbol);
        });

        it('should leave task valid if toggling to unknown status', () => {
            // Arrange
            const globalStatusRegistry = StatusRegistry.getInstance();
            const important = new StatusConfiguration('!', 'Important', 'D', false);
            globalStatusRegistry.add(important);

            const line = '- [!] this is an important task';
            const task = TestHelpers.fromLine({ line });
            expect(task).not.toBeNull();
            expect(task!.status.symbol).toEqual(important.symbol);

            // Act
            const toggled = task?.toggle()[0];

            // Assert
            // Issue https://github.com/obsidian-tasks-group/obsidian-tasks/issues/1499
            // Ensure that the next status was applied, even though it is an unrecognised status
            expect(toggled?.status.symbol).toEqual('D');
        });

        it('should bulk-add unknown statuses', () => {
            // Arrange
            const registry = new StatusRegistry();
            expect(registry.bySymbol('!').type).toEqual(StatusType.EMPTY);
            expect(registry.bySymbol('X').type).toEqual(StatusType.EMPTY);
            expect(registry.bySymbol('d').type).toEqual(StatusType.EMPTY);
            const allStatuses = [
                new Status(new StatusConfiguration('!', 'Unknown', 'X', false, StatusType.TODO)),
                new Status(new StatusConfiguration('X', 'Unknown', '!', false, StatusType.DONE)),
                new Status(new StatusConfiguration('d', 'Unknown', '!', false, StatusType.IN_PROGRESS)),
                // Include some tasks with duplicate statuses, to make sure duplicates are discarded
                new Status(new StatusConfiguration('!', 'Unknown', 'X', false, StatusType.TODO)),
                new Status(new StatusConfiguration('X', 'Unknown', '!', false, StatusType.DONE)),
                new Status(new StatusConfiguration('d', 'Unknown', '!', false, StatusType.IN_PROGRESS)),
                // Check that it does not add copies of any core statuses
                new Status(new StatusConfiguration('-', 'Unknown', '!', false, StatusType.IN_PROGRESS)),
            ];

            // Act
            const unknownStatuses = registry.findUnknownStatuses(allStatuses);

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

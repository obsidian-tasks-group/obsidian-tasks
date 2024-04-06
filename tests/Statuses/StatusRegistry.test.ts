/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { TasksFile } from '../../src/Scripting/TasksFile';
import { StatusRegistry } from '../../src/Statuses/StatusRegistry';
import { Status } from '../../src/Statuses/Status';
import { StatusConfiguration, StatusType } from '../../src/Statuses/StatusConfiguration';
import { Task } from '../../src/Task/Task';
import { TaskLocation } from '../../src/Task/TaskLocation';
import type { StatusCollection, StatusCollectionEntry } from '../../src/Statuses/StatusCollection';
import * as TestHelpers from '../TestingTools/TestHelpers';
import * as StatusExamples from '../TestingTools/StatusExamples';
import { constructStatuses } from '../TestingTools/StatusesTestHelpers';

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

    it('should allow setting the entire set of statuses', () => {
        // Arrange
        const statusRegistry = new StatusRegistry();
        const statuses = [
            new StatusConfiguration('Q', 'Question', 'A', false, StatusType.NON_TASK),
            new StatusConfiguration('A', 'Answer', 'Q', false, StatusType.NON_TASK),
        ];

        // Act
        statusRegistry.set(statuses);

        // Assert
        expect(statusRegistry.registeredStatuses.length).toEqual(2);
        expect(statusRegistry.registeredStatuses[0].symbol).toStrictEqual('Q');
        expect(statusRegistry.registeredStatuses[1].symbol).toStrictEqual('A');
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

    it('should find unknown statuses from tasks in the vault, sorted by symbol', () => {
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
        expect(s1.type).toEqual(StatusType.IN_PROGRESS);
        expect(s1.name).toEqual('Unknown (d)');

        s1 = unknownStatuses[2];
        expect(s1.type).toEqual(StatusType.DONE);
        expect(s1.name).toEqual('Unknown (X)');
    });

    describe('mermaid diagrams', () => {
        it('should create a mermaid diagram of default statuses', () => {
            // Arrange
            const statusRegistry = new StatusRegistry();

            // Assert
            // Without detail:
            expect(statusRegistry.mermaidDiagram(false)).toMatchInlineSnapshot(`
            "
            \`\`\`mermaid
            flowchart LR

            classDef TODO        stroke:#f33,stroke-width:3px;
            classDef DONE        stroke:#0c0,stroke-width:3px;
            classDef IN_PROGRESS stroke:#fa0,stroke-width:3px;
            classDef CANCELLED   stroke:#ddd,stroke-width:3px;
            classDef NON_TASK    stroke:#99e,stroke-width:3px;

            1["Todo"]:::TODO
            2["In Progress"]:::IN_PROGRESS
            3["Done"]:::DONE
            4["Cancelled"]:::CANCELLED
            1 --> 3
            2 --> 3
            3 --> 1
            4 --> 1

            linkStyle default stroke:gray
            \`\`\`
            "
        `);

            // With detail:
            expect(statusRegistry.mermaidDiagram(true)).toMatchInlineSnapshot(`
            "
            \`\`\`mermaid
            flowchart LR

            classDef TODO        stroke:#f33,stroke-width:3px;
            classDef DONE        stroke:#0c0,stroke-width:3px;
            classDef IN_PROGRESS stroke:#fa0,stroke-width:3px;
            classDef CANCELLED   stroke:#ddd,stroke-width:3px;
            classDef NON_TASK    stroke:#99e,stroke-width:3px;

            1["'Todo'<br>[ ] -> [x]<br>(TODO)"]:::TODO
            2["'In Progress'<br>[/] -> [x]<br>(IN_PROGRESS)"]:::IN_PROGRESS
            3["'Done'<br>[x] -> [ ]<br>(DONE)"]:::DONE
            4["'Cancelled'<br>[-] -> [ ]<br>(CANCELLED)"]:::CANCELLED
            1 --> 3
            2 --> 3
            3 --> 1
            4 --> 1

            linkStyle default stroke:gray
            \`\`\`
            "
        `);
        });

        it('should encode symbols in mermaid diagrams when necessary', () => {
            // This tests the fix for:
            //      https://github.com/obsidian-tasks-group/obsidian-tasks/issues/2355
            //      Fix the handling of special characters in Mermaid status diagrams

            // Arrange
            const statusRegistry = new StatusRegistry();
            statusRegistry.clearStatuses();
            statusRegistry.add(new StatusConfiguration('<', 'Todo <', '<', false, StatusType.TODO));
            statusRegistry.add(new StatusConfiguration('>', 'Todo >', '>', false, StatusType.TODO));
            statusRegistry.add(new StatusConfiguration('"', 'Todo "', '"', false, StatusType.TODO));
            statusRegistry.add(new StatusConfiguration('&', 'Todo &', '&', false, StatusType.TODO));

            // Assert
            // Without detail:
            expect(statusRegistry.mermaidDiagram(false)).toMatchInlineSnapshot(`
            "
            \`\`\`mermaid
            flowchart LR

            classDef TODO        stroke:#f33,stroke-width:3px;
            classDef DONE        stroke:#0c0,stroke-width:3px;
            classDef IN_PROGRESS stroke:#fa0,stroke-width:3px;
            classDef CANCELLED   stroke:#ddd,stroke-width:3px;
            classDef NON_TASK    stroke:#99e,stroke-width:3px;

            1["Todo &lt;"]:::TODO
            2["Todo &gt;"]:::TODO
            3["Todo &quot;"]:::TODO
            4["Todo &amp;"]:::TODO
            1 --> 1
            2 --> 2
            3 --> 3
            4 --> 4

            linkStyle default stroke:gray
            \`\`\`
            "
        `);

            // With detail:
            expect(statusRegistry.mermaidDiagram(true)).toMatchInlineSnapshot(`
            "
            \`\`\`mermaid
            flowchart LR

            classDef TODO        stroke:#f33,stroke-width:3px;
            classDef DONE        stroke:#0c0,stroke-width:3px;
            classDef IN_PROGRESS stroke:#fa0,stroke-width:3px;
            classDef CANCELLED   stroke:#ddd,stroke-width:3px;
            classDef NON_TASK    stroke:#99e,stroke-width:3px;

            1["'Todo &lt;'<br>[&lt;] -> [&lt;]<br>(TODO)"]:::TODO
            2["'Todo &gt;'<br>[&gt;] -> [&gt;]<br>(TODO)"]:::TODO
            3["'Todo &quot;'<br>[&quot;] -> [&quot;]<br>(TODO)"]:::TODO
            4["'Todo &amp;'<br>[&amp;] -> [&amp;]<br>(TODO)"]:::TODO
            1 --> 1
            2 --> 2
            3 --> 3
            4 --> 4

            linkStyle default stroke:gray
            \`\`\`
            "
        `);
        });

        it('should not include unknown nextStatusSymbols in mermaid diagrams', () => {
            // Arrange
            const statusRegistry = new StatusRegistry();
            statusRegistry.clearStatuses();
            statusRegistry.add(new StatusConfiguration(' ', 'Todo', '/', false, StatusType.TODO));
            // Leave '/' as not registered
            const originalNumberOfStatuses = statusRegistry.registeredStatuses.length;

            // Act
            const mermaidText = statusRegistry.mermaidDiagram();

            // Assert
            expect(statusRegistry.registeredStatuses.length).toEqual(originalNumberOfStatuses);
            expect(mermaidText).toMatchInlineSnapshot(`
            "
            \`\`\`mermaid
            flowchart LR

            classDef TODO        stroke:#f33,stroke-width:3px;
            classDef DONE        stroke:#0c0,stroke-width:3px;
            classDef IN_PROGRESS stroke:#fa0,stroke-width:3px;
            classDef CANCELLED   stroke:#ddd,stroke-width:3px;
            classDef NON_TASK    stroke:#99e,stroke-width:3px;

            1["Todo"]:::TODO


            linkStyle default stroke:gray
            \`\`\`
            "
        `);
        });
    });

    describe('toggling', () => {
        const path = 'file.md';
        const lineNumber = 3456;
        const sectionStart = 1337;
        const sectionIndex = 1209;
        const precedingHeader = 'Eloquent Section';
        const taskLocation = new TaskLocation(
            new TasksFile(path),
            lineNumber,
            sectionStart,
            sectionIndex,
            precedingHeader,
        );
        const fallbackDate = null;

        it('should allow task to toggle through standard transitions', () => {
            // Arrange
            // Global statusRegistry instance - which controls toggling - will have been reset
            // in beforeEach() above.
            const line = '- [ ] this is a task starting at A';
            const task = Task.fromLine({
                line,
                taskLocation,
                fallbackDate,
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
            const task = Task.fromLine({
                line,
                taskLocation,
                fallbackDate,
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
            const task = Task.fromLine({
                line,
                taskLocation,
                fallbackDate,
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
    });

    describe('toggling recurring', () => {
        /**
         * Test one scenario of toggling a recurring task: confirm the status of the done task, and the next recurrence.
         * @param statuses
         * @param initialStatusSymbol - typically an incomplete status
         * @param expectedToggledStatus - the next status - is expected to be DONE, so that the next recurrence is created.
         * @param expectedNextTaskStatus - the expected status of the new recurrence.
         */
        function checkToggleAndRecurrenceStatuses(
            statuses: Array<StatusCollectionEntry>,
            initialStatusSymbol: string,
            expectedToggledStatus: string,
            expectedNextTaskStatus: string,
        ) {
            // Arrange
            const statusRegistry = new StatusRegistry();
            statusRegistry.set(constructStatuses(statuses));

            const initialStatusForRecurringTask = statusRegistry.bySymbol(initialStatusSymbol);

            // Act, Assert
            const toggledStatus = statusRegistry.getNextStatusOrCreate(initialStatusForRecurringTask);
            expect(toggledStatus).toEqual(statusRegistry.bySymbol(expectedToggledStatus));

            const nextStatus = statusRegistry.getNextRecurrenceStatusOrCreate(toggledStatus);
            expect(nextStatus).toEqual(statusRegistry.bySymbolOrCreate(expectedNextTaskStatus));
        }

        it('should make CANCELLED next task TODO', () => {
            // See #2304:
            // Completing a recurring task setting wrong status for new task [if the next custom status is not TODO]
            // Ensure that the next status skips through to TODO for a recurring task:
            const statuses = StatusExamples.doneTogglesToCancelled();
            checkToggleAndRecurrenceStatuses(statuses, '/', 'x', ' ');
        });

        it('should find IN_PROGRESS for next recurrence, when statuses are IN_PROGRESS then DONE', () => {
            const statuses: StatusCollection = [
                ['1', '1 to 2', '2', 'IN_PROGRESS'],
                ['2', '2 to 1', '1', 'DONE'],
            ];
            checkToggleAndRecurrenceStatuses(statuses, '1', '2', '1');
        });

        it('should find IN_PROGRESS for next recurrence, when statuses are DONE then IN_PROGRESS', () => {
            const statuses: StatusCollection = [
                ['1', '1 to 2', '2', 'DONE'],
                ['2', '2 to 1', '1', 'IN_PROGRESS'],
            ];
            checkToggleAndRecurrenceStatuses(statuses, '2', '1', '2');
        });

        it('should make CANCELLED next task IN_PROGRESS, if TODO not found', () => {
            const statuses: StatusCollection = [
                ['/', '/ to x', 'x', 'IN_PROGRESS'],
                ['x', 'x to -', '-', 'DONE'],
                ['-', '- to /', '/', 'CANCELLED'],
            ];
            // Ensure that the next status skips through to IN_PROGRESS for a recurring task, if TODO not found
            checkToggleAndRecurrenceStatuses(statuses, '/', 'x', '/');
        });

        it('should select TODO even if DONE is followed by IN_PROGRESS', () => {
            // This is not intended to be realistic: its sole purpose is to have DONE followed by IN_PROGRESS,
            // and ensure that this is chosen in preference to the TODO that is further ahead in the sequences
            // of statuses.
            const statuses: StatusCollection = [
                ['T', 'T to D', 'D', 'TODO'],
                ['D', 'D to I', 'I', 'DONE'],
                ['I', 'I to T', 'T', 'IN_PROGRESS'],
            ];
            // Ensure that TODO is chosen, ignoring the IN_PROGRESS task immediately after DONE:
            checkToggleAndRecurrenceStatuses(statuses, 'T', 'D', 'T');
        });

        it('should select the correct next status, when there is ambiguity', () => {
            const statuses: StatusCollection = [
                // A set of 4 statuses, chosen to see whether the loop size in getNextRecurrenceStatusOrCreate()
                // affects the calculation in any way.
                ['A', 'A to B', 'B', 'NON_TASK'],
                ['B', 'B to C', 'C', 'NON_TASK'],
                ['C', 'C to D', 'D', 'NON_TASK'],
                ['D', 'D to E', 'E', 'NON_TASK'],
                // A cycle of 6 statuses, not including any TODOs,
                // to ensure that the correct IN_PROGRESS is selected.
                ['1', '1 to 2', '2', 'IN_PROGRESS'],
                ['2', '2 to 3', '3', 'DONE'],
                ['3', '3 to 4', '4', 'CANCELLED'],
                ['4', '4 to 5', '5', 'IN_PROGRESS'],
                ['5', '5 to 6', '6', 'DONE'],
                ['6', '6 to 1', '1', 'CANCELLED'],
            ];
            // Ensure that the IN_PROGRESS soonest after 2 is chosen:
            checkToggleAndRecurrenceStatuses(statuses, '1', '2', '4');
        });

        it('should select the correct next status, even when it is unknown', () => {
            const statuses: StatusCollection = [
                // A set where the DONE task goes to an unknown symbol
                ['a', 'Status a', 'b', 'TODO'],
                ['b', 'Status b', 'c', 'DONE'], // c is not known
            ];
            checkToggleAndRecurrenceStatuses(statuses, 'a', 'b', 'c');
        });

        it('should return space for symbol if there are no TODO or IN_PROGRESS in sequence', () => {
            const statuses: StatusCollection = [
                [' ', 'Todo', 'x', 'TODO'],
                ['x', 'Done', ' ', 'DONE'],
                ['C', 'C to D', 'D', 'CANCELLED'],
                ['D', 'D to C', 'C', 'DONE'],
            ];
            checkToggleAndRecurrenceStatuses(statuses, 'C', 'D', ' ');
        });

        it('should return space for symbol if it is not a known status', () => {
            const statuses: StatusCollection = [
                ['C', 'C to D', 'D', 'CANCELLED'],
                ['D', 'D to C', 'C', 'DONE'],
            ];
            checkToggleAndRecurrenceStatuses(statuses, 'C', 'D', ' ');
        });
    });
});

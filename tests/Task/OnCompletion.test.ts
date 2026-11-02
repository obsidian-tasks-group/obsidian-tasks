import moment from 'moment';
import { verifyAll } from '@approval-tests/approvals/lib/Providers/Vitest/VitestApprovals';
import { Status } from '../../src/Statuses/Status';
import { StatusConfiguration, StatusType } from '../../src/Statuses/StatusConfiguration';
import { fromLine, toMarkdown } from '../TestingTools/TestHelpers';
import { Task } from '../../src/Task/Task';
import {
    OnCompletion,
    findTaskToArchive,
    handleOnCompletion,
    parseOnCompletionValue,
} from '../../src/Task/OnCompletion';
import { resetSettings, updateSettings } from '../../src/Config/Settings';

window.moment = moment;

beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-02-11'));
});

afterEach(() => {
    vi.useRealTimers();
    resetSettings();
});

export function applyStatusAndOnCompletionAction(task: Task, newStatus: Status) {
    const tasks = task.handleNewStatus(newStatus);
    return handleOnCompletion(task, tasks);
}

function makeTask(line: string) {
    return fromLine({ line });
}

describe('OnCompletion - parsing', () => {
    function checkParseOnCompletionValue(input: string, expected: OnCompletion) {
        expect(parseOnCompletionValue(input)).toEqual(expected);
    }

    const deletes = ['delete', 'DELETE', ' delete '];
    it.each(deletes)('should parse "%s" as OnCompletion.Delete', (input: string) => {
        checkParseOnCompletionValue(input, OnCompletion.Delete);
    });

    const keeps = ['keep', 'KEEP', ' keep '];
    it.each(keeps)('should parse "%s" as OnCompletion.Keep', (input: string) => {
        checkParseOnCompletionValue(input, OnCompletion.Keep);
    });

    const toFiles = ['to_file', 'TO_FILE', ' to_file '];
    it.each(toFiles)('should parse "%s" as OnCompletion.ToFile', (input: string) => {
        checkParseOnCompletionValue(input, OnCompletion.ToFile);
    });

    const ignores = ['', 'unknown'];
    it.each(ignores)('should parse "%s" as OnCompletion.Ignore', (input: string) => {
        checkParseOnCompletionValue(input, OnCompletion.Ignore);
    });
});

describe('OnCompletion - cases where all tasks are retained', () => {
    it('should not delete an already-done task', () => {
        // Arrange
        const line = '- [x] An already-DONE, non-recurring task 🏁 delete ✅ 2024-02-10';
        const task = makeTask(line);

        // Act
        const returnedTasks = applyStatusAndOnCompletionAction(task, Status.DONE);

        // Assert
        expect(returnedTasks.length).toEqual(1);
        expect(returnedTasks[0].originalMarkdown).toEqual(line);
    });

    it('should just return trigger-less, non-recurring task', () => {
        // Arrange
        const task = makeTask('- [ ] A non-recurring task with no trigger 📅 2024-02-10');

        // Act
        const tasks = applyStatusAndOnCompletionAction(task, Status.DONE);

        // Assert
        expect(toMarkdown(tasks)).toMatchInlineSnapshot(
            '"- [x] A non-recurring task with no trigger 📅 2024-02-10 ✅ 2024-02-11"',
        );
    });

    it('should just return trigger-less recurring task', () => {
        // Arrange
        const task = makeTask('- [ ] A recurring task with no trigger 🔁 every day 📅 2024-02-10');

        // Act
        const tasks = applyStatusAndOnCompletionAction(task, Status.DONE);

        // Assert
        expect(toMarkdown(tasks)).toMatchInlineSnapshot(`
            "- [ ] A recurring task with no trigger 🔁 every day 📅 2024-02-11
            - [x] A recurring task with no trigger 🔁 every day 📅 2024-02-10 ✅ 2024-02-11"
        `);
    });

    it('should return the task when going from TODO to IN_PROGRESS', () => {
        // Arrange
        const task = makeTask('- [ ] A recurring task with "delete" Action 🔁 every day 🏁 delete 📅 2024-02-10');

        // Act
        const tasks = applyStatusAndOnCompletionAction(task, Status.IN_PROGRESS);

        // Assert
        expect(tasks.length).toEqual(1);
        expect(tasks[0].status.type).toEqual(StatusType.IN_PROGRESS);
    });

    it('should return the task when going from one DONE status to another DONE status', () => {
        // Arrange
        const done2 = new Status(new StatusConfiguration('X', 'DONE', ' ', true, StatusType.DONE));
        const task = makeTask('- [x] A simple done task with 🏁 delete');

        // Act
        const tasks = applyStatusAndOnCompletionAction(task, done2);

        // Assert
        expect(tasks.length).toEqual(1);
        expect(tasks[0].status.symbol).toEqual('X');
        expect(tasks[0].status.type).toEqual(StatusType.DONE);
    });

    it('should return a task featuring the On Completion flag trigger but an empty string Action', () => {
        // Arrange
        const task = makeTask('- [ ] A non-recurring task with');

        // Act
        const tasks = applyStatusAndOnCompletionAction(task, Status.DONE);

        // Assert
        expect(tasks.length).toEqual(1);
    });
});

describe('OnCompletion - "keep" action', () => {
    it('should retain a task with "keep" Action upon completion', () => {
        // Arrange
        const task = makeTask('- [ ] A non-recurring task with "keep" Action 🏁 keep');

        // Act
        const tasks = applyStatusAndOnCompletionAction(task, Status.DONE);

        // Assert
        expect(tasks.length).toEqual(1);
    });
});

describe('OnCompletion - "delete" action', () => {
    it('should retain only the next instance of a recurring task with "delete" Action upon completion', () => {
        // Arrange
        const task = makeTask('- [ ] A recurring task with "delete" Action 🔁 every day 🏁 delete 📅 2024-02-10');

        // Act
        const tasks = applyStatusAndOnCompletionAction(task, Status.DONE);

        // Assert
        expect(toMarkdown(tasks)).toMatchInlineSnapshot(
            '"- [ ] A recurring task with "delete" Action 🔁 every day 🏁 delete 📅 2024-02-11"',
        );
    });

    it('should discard a task with "delete" Action upon completion', () => {
        // Arrange
        const task = makeTask('- [ ] A non-recurring task with "delete" Action 🏁 delete');

        // Act
        const tasks = applyStatusAndOnCompletionAction(task, Status.DONE);

        // Assert
        expect(tasks.length).toEqual(0);
    });
});

describe('OnCompletion - "to_file" action', () => {
    function changeStatusAndFindTaskToArchive(line: string, newStatus: Status) {
        const task = makeTask(line);
        const newTasks = task.handleNewStatusWithRecurrenceInUsersOrder(newStatus);
        return { newTasks, toArchive: findTaskToArchive(task, newTasks) };
    }

    it('should retain a task with "to_file" Action upon completion, for the caller to move', () => {
        // Arrange
        const task = makeTask('- [ ] A non-recurring task with "to_file" Action 🏁 to_file');
        const warn = vi.spyOn(console, 'warn');

        // Act
        const tasks = applyStatusAndOnCompletionAction(task, Status.DONE);

        // Assert
        expect(toMarkdown(tasks)).toEqual('- [x] A non-recurring task with "to_file" Action 🏁 to_file ✅ 2024-02-11');
        expect(warn).not.toHaveBeenCalled();
        warn.mockRestore();
    });

    it('should archive a completed non-recurring task', () => {
        const { newTasks, toArchive } = changeStatusAndFindTaskToArchive(
            '- [ ] A non-recurring task 🏁 to_file',
            Status.DONE,
        );

        expect(newTasks.length).toEqual(1);
        expect(toArchive?.task).toBe(newTasks[0]);
        expect(toArchive?.lineOffset).toEqual(0);
    });

    it.each([
        [false, 1],
        [true, 0],
    ])(
        'should archive the completed instance of a recurring task, with recurrenceOnNextLine %s',
        (recurrenceOnNextLine: boolean, completedIndex: number) => {
            updateSettings({ recurrenceOnNextLine });

            const { newTasks, toArchive } = changeStatusAndFindTaskToArchive(
                '- [ ] A recurring task 🔁 every day 🏁 to_file 📅 2024-02-10',
                Status.DONE,
            );

            expect(toMarkdown(newTasks)).toContain('- [ ] A recurring task 🔁 every day 🏁 to_file 📅 2024-02-11');
            expect(toArchive?.task).toBe(newTasks[completedIndex]);
            expect(toArchive?.lineOffset).toEqual(completedIndex);
            expect(toArchive?.task.toFileLineString()).toEqual(
                '- [x] A recurring task 🔁 every day 🏁 to_file 📅 2024-02-10 ✅ 2024-02-11',
            );
        },
    );

    it('should archive nothing when an already-DONE task changes to another DONE status', () => {
        const done2 = new Status(new StatusConfiguration('X', 'DONE', ' ', true, StatusType.DONE));

        const { toArchive } = changeStatusAndFindTaskToArchive(
            '- [x] An already-done task 🏁 to_file ✅ 2024-02-10',
            done2,
        );

        expect(toArchive).toBeUndefined();
    });

    it.each([
        ['IN_PROGRESS', Status.IN_PROGRESS],
        ['CANCELLED', Status.CANCELLED],
    ])('should archive nothing when the new status is %s', (_statusName: string, newStatus: Status) => {
        const { toArchive } = changeStatusAndFindTaskToArchive('- [ ] A task 🏁 to_file', newStatus);

        expect(toArchive).toBeUndefined();
    });

    it.each(['- [ ] A task with no action', '- [ ] A task with "keep" Action 🏁 keep'])(
        'should archive nothing for a completed task without "to_file" Action: "%s"',
        (line: string) => {
            const { toArchive } = changeStatusAndFindTaskToArchive(line, Status.DONE);

            expect(toArchive).toBeUndefined();
        },
    );

    it('should archive nothing when more than one task is DONE', () => {
        const task = makeTask('- [ ] A task 🏁 to_file');
        const [completed] = task.handleNewStatus(Status.DONE);

        expect(findTaskToArchive(task, [completed, completed])).toBeUndefined();
    });

    it('should follow the action of the completed instance, which an edit can change while completing it', () => {
        const toFileTask = makeTask('- [ ] A task 🏁 to_file');
        const [completedToFile] = toFileTask.handleNewStatus(Status.DONE);
        const editedToKeep = new Task({ ...completedToFile, onCompletion: OnCompletion.Keep });
        expect(findTaskToArchive(toFileTask, [editedToKeep])).toBeUndefined();

        const keepTask = makeTask('- [ ] A task 🏁 keep');
        const [completedKeep] = keepTask.handleNewStatus(Status.DONE);
        const editedToToFile = new Task({ ...completedKeep, onCompletion: OnCompletion.ToFile });
        expect(findTaskToArchive(keepTask, [editedToToFile])?.task).toBe(editedToToFile);
    });
});

type ToggleCase = {
    // inputs:
    nextStatus: Status;
    line: string;
};

function getCases(): ToggleCase[] {
    return [
        // Non-recurring
        {
            nextStatus: Status.DONE,
            line: '- [ ] A non-recurring task with no trigger 📅 2024-02-10',
        },

        {
            nextStatus: Status.DONE,
            line: '- [ ] A non-recurring task with 🏁 delete',
        },

        {
            nextStatus: Status.DONE,
            line: '- [ ] A non-recurring task with 🏁 delete 📅 2024-02-10',
        },

        {
            nextStatus: Status.DONE,
            line: '- [ ] A non-recurring task with invalid OC trigger 🏁 INVALID_ACTION 📅 2024-02-10',
        },

        {
            nextStatus: Status.DONE,
            line: '- [ ] A non-recurring task with 🏁',
        },

        // Recurring

        {
            nextStatus: Status.DONE,
            line: '- [ ] A recurring task with no trigger 🔁 every day 📅 2024-02-10',
        },

        {
            nextStatus: Status.DONE,
            line: '- [ ] A recurring task with 🏁 delete 🔁 every day 📅 2024-02-10',
        },

        {
            nextStatus: Status.IN_PROGRESS,
            line: '- [ ] A recurring task with 🏁 delete 🔁 every day 📅 2024-02-10',
        },

        // Other

        {
            nextStatus: Status.DONE,
            line: '- [x] An already-DONE task, changing to Same      DONE status 🏁 delete 📅 2024-02-10 ✅ 2024-02-10',
        },

        {
            nextStatus: new Status(new StatusConfiguration('X', 'new status', ' ', false, StatusType.DONE)),
            line: '- [x] An already-DONE task, changing to Different DONE status 🏁 delete 📅 2024-02-10 ✅ 2024-02-10',
        },

        // Indented, within callout/code block

        {
            nextStatus: Status.DONE,
            line: '    - [ ] An indented task with 🏁 delete',
        },

        {
            nextStatus: Status.DONE,
            line: '> - [ ] A task within a block quote or callout and 🏁 delete',
        },
    ];
}

function action(toggleCase: ToggleCase): string {
    const newStatus = toggleCase.nextStatus;
    const task = fromLine({ line: toggleCase.line, path: 'anything.md', precedingHeader: 'heading' });
    const step1 = task.handleNewStatus(newStatus);
    const step2 = applyStatusAndOnCompletionAction(task, newStatus);
    return `
initial task:
${task.toFileLineString()}

=> advances to status [${newStatus.symbol}] and type ${newStatus.type}:
${toMarkdown(step1)}

=> which, after any on-completion action, results in:
${toMarkdown(step2)}
----------------------------------------------
`;
}

describe('visualise completion-behaviour', () => {
    it('visualise', () => {
        // List of status and task
        const cases = getCases();
        verifyAll('checking on completion', cases, (toggleCase) => action(toggleCase));
    });
});
